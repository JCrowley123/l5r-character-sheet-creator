"""Reliability tests for the Character Finder scoring, with pass marks.

    python3 -I reliability.py          all tests (about two minutes); exit status 1 if any test fails

What these tests can and cannot show
------------------------------------
They check that the SCORING does what the RATINGS say: every School can be found, stated preferences are honoured,
results do not swing wildly, and nothing is favoured by accident (label count, alphabetical order). They cannot
show that the ratings themselves are right, because the simulated players are built from the same ratings. That
needs the rating audit described in DESIGN.md.

Pass marks are of two kinds. RULES must always hold. FLOORS were set at the values measured on 25 November 2026
(version 2 of the scoring), so a rating or question change that makes things worse fails the run instead of
passing quietly. Where a TARGET differs from the floor, the target is what "reliable" was agreed to mean
(25 November: a player who roughly knows what they want finds it in the top six 9 times in 10).
"""
import os, sys, random, statistics as st
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from finder import (Q, SCHOOLS, CONTRIB, ALL_QUESTIONS, EARLY_EXIT_AFTER, questions_for, recommend, ranked, score,
                    main_label_fit, allowed, random_answers, best_path_for, is_sampler)

UNIQUE = list({s['name']: s for s in SCHOOLS}.values())

def rank_corr(xs, ys):
    def ranks(v):
        o = sorted(range(len(v)), key=lambda i: v[i]); r = [0.0] * len(v); i = 0
        while i < len(o):
            j = i
            while j + 1 < len(o) and v[o[j + 1]] == v[o[i]]: j += 1
            for k in range(i, j + 1): r[o[k]] = (i + j) / 2.0
            i = j + 1
        return r
    rx, ry = ranks(xs), ranks(ys); mx, my = st.mean(rx), st.mean(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** 0.5
    return num / den if den else 0.0

# ---------------------------------------------------------------- simulated players who want one School
def persona(rng, X, p_fit=0.6, p_np=0.2):
    """Wants School X: the answer that suits X best (relative to all Schools) 60% of the time,
    No preference 20%, any answer 20%."""
    ans, i = {}, 0
    while True:
        order = questions_for(ans)
        if i >= len(order): break
        qid = order[i]; n = len(Q[qid][1])
        rel = []
        for k in range(n):
            trial = dict(ans); trial[qid] = k
            if not allowed(X, trial): rel.append(None); continue
            col = CONTRIB[(qid, k)]
            pool = [s['i'] for s in SCHOOLS if allowed(s, trial)]
            rel.append(col[X['i']] - st.mean(col[j] for j in pool))
        r = rng.random()
        valid = [k for k in range(n) if rel[k] is not None]
        if r < p_fit: k = max(valid, key=lambda j: rel[j])
        elif r < p_fit + p_np: k = n - 1
        else: k = rng.choice(valid)
        ans[qid] = k; i += 1
        ans = {q: v for q, v in ans.items() if q in questions_for(ans)}
    return ans

def run():
    out = {}
    # 1. Every School can be found
    rng = random.Random(7)
    reach = {s['name']: best_path_for(s, rng)[0] for s in UNIQUE}
    out['reach_best'] = sum(1 for r in reach.values() if r <= 1)
    out['reach_first'] = sum(1 for r in reach.values() if r == 0)

    # 2. Random players: list length, bias, honouring stated preferences
    rng = random.Random(2026)
    N = 20000
    players = [random_answers(rng) for _ in range(N)]
    results = [recommend(a) for a in players]
    out['min_list'] = min(len(u) for h, s, w, u in results)
    share = {s['name']: 0 for s in UNIQUE}
    for h, s, w, u in results:
        for x in h: share[x['name']] += 1
    out['max_share'] = 100 * max(share.values()) / N
    names = [s['name'] for s in UNIQUE]
    out['bias_labels'] = rank_corr([2 * len(s['primary']) + len(s['secondary']) + len(s['homes']) for s in UNIQUE], [share[n] for n in names])
    out['bias_alphabet'] = rank_corr([sorted(names).index(n) for n in names], [-share[n] for n in names])

    def agree(qid, ai, test, extra=lambda a: True):
        hit = tot = 0
        for a, (h, s, w, u) in zip(players, results):
            if a.get(qid) == ai and extra(a):
                for x in h: tot += 1; hit += bool(test(x))
        return 100 * hit / max(tot, 1)
    out['classic_not_unusual'] = agree('niche', 0, lambda s: s['niche'] < 3)
    out['simple_not_involved'] = agree('complexity', 0, lambda s: s['cx'] < 3, lambda a: a.get('magic') != 0)
    out['sword_bushi'] = agree('approach', 0, lambda s: 'Bushi' in s['roles'])
    out['words_courtier'] = agree('approach', 1, lambda s: 'Courtier' in s['roles'])
    out['healing_healer'] = agree('magickind', 1, lambda s: {'healer', 'protector-magic'} & set(s['primary'] + s['secondary']))
    out['never_not_low_honor'] = agree('rules', 0, lambda s: s['band'] != 'low')
    out['no_magic_best_not_shugenja'] = agree('magic', 2, lambda s: 'Shugenja' not in s['roles'])
    out['touch_magic_best_not_shugenja'] = agree('magic', 1, lambda s: 'Shugenja' not in s['roles'])
    yes_all = [x for a, (h, s, w, u) in zip(players, results) if a.get('magic') == 0 for x in u]
    out['yes_magic_only_shugenja'] = 100 * sum('Shugenja' in x['roles'] for x in yes_all) / max(len(yes_all), 1)
    no_players = [(a, r) for a, r in zip(players, results) if a.get('magic') == 2 and not is_sampler(a)]
    out['no_magic_sees_shugenja_in_also'] = 100 * sum(any('Shugenja' in x['roles'] for x in r[1]) for a, r in no_players) / max(len(no_players), 1)
    # The owner's case (25 November): answers that suit a Shugenja School, but "No" to magic. It may still be offered.
    rng_n = random.Random(8); seen = tot = 0
    for X in [s for s in UNIQUE if 'Shugenja' in s['roles']]:
        for _ in range(10):
            a = persona(rng_n, X); a['magic'] = 2
            a = {k: v for k, v in a.items() if k in questions_for(a)}
            for need in questions_for(a): a.setdefault(need, len(Q[need][1]) - 1)
            h, s, w, u = recommend(a); tot += 1; seen += X['name'] in {x['name'] for x in s}
    out['said_no_but_fits_shugenja_offered'] = 100 * seen / tot

    allnp = {q: len(Q[q][1]) - 1 for q in ['magic', 'complexity', 'niche', 'approach', 'fight', 'ambition', 'home', 'rules', 'bushido', 'faith', 'companion', 'death']}
    h, s, w, u = recommend(allnp)
    out['all_no_preference_is_sample'] = is_sampler(allnp) and not h and len(s) == 6 and len({x['clan'] for x in s}) == 6 and len({r for x in s for r in x['roles']}) >= 3

    # 3. Stability: change one answer
    rng = random.Random(3)
    overlap, top_changed = [], 0
    sample = [a for a in players if not is_sampler(a)][:5000]
    for a in sample:
        asked = [q for q in questions_for(a) if q in a]
        q = rng.choice(asked)
        alt = rng.choice([i for i in range(len(Q[q][1])) if i != a[q]])
        b = dict(a); b[q] = alt
        b = {k: v for k, v in b.items() if k in questions_for(b)}
        for need in questions_for(b): b.setdefault(need, len(Q[need][1]) - 1)
        r1, r2 = recommend(a), recommend(b)
        six1 = {x['name'] for x in r1[0] + r1[1]}; six2 = {x['name'] for x in r2[0] + r2[1]}
        overlap.append(len(six1 & six2) / max(len(six1), 1) * 6)
        top_changed += (r1[0][:1] and r2[0][:1] and r1[0][0]['name'] != r2[0][0]['name']) or (bool(r1[0]) != bool(r2[0]))
    out['stability_six_kept'] = st.mean(overlap)
    out['stability_top_changes'] = 100 * top_changed / len(sample)

    # 4. Simulated players who want one particular School (20 each)
    rng = random.Random(5)
    best = top6 = n = 0; per = {}; early_top6 = 0
    for X in UNIQUE:
        hit = 0
        for _ in range(20):
            a = persona(rng, X)
            h, s, w, u = recommend(a)
            hb = X['name'] in {x['name'] for x in h}
            best += hb; hit += hb
            top6 += X['name'] in {x['name'] for x in h + s}
            cut = {k: v for k, v in a.items() if k in questions_for(a)[:EARLY_EXIT_AFTER]}
            h2, s2, w2, u2 = recommend(cut)
            early_top6 += X['name'] in {x['name'] for x in h2 + s2}
            n += 1
        per[X['name']] = hit / 20
    out['persona_best'] = 100 * best / n
    out['persona_top6'] = 100 * top6 / n
    out['persona_early_exit_top6'] = 100 * early_top6 / n
    out['persona_hard_to_find'] = sum(1 for v in per.values() if v < 0.25)
    out['_hard_to_find'] = sorted((v, k) for k, v in per.items() if v < 0.25)
    return out

#   key: (label, kind, comparison, pass mark, target or None, unit)
MARKS = [
 ('reach_best', 'Every School can be a best match on some answers', 'rule', '==', 105, None, ''),
 ('min_list', 'Shortest result list, 20,000 random players', 'rule', '>=', 6, None, ''),
 ('all_no_preference_is_sample', 'All "No preference" gives a sample from 6 Clans, not a match', 'rule', '==', True, None, ''),
 ('no_magic_best_not_shugenja', 'Magic "No": best matches that are not Shugenja', 'rule', '==', 100.0, None, '%'),
 ('touch_magic_best_not_shugenja', 'Magic "a touch": best matches that are not Shugenja', 'rule', '==', 100.0, None, '%'),
 ('yes_magic_only_shugenja', 'Magic "Yes": every listed School is a Shugenja School', 'rule', '==', 100.0, None, '%'),
 ('persona_top6', 'Player who wants School X finds it in the top six', 'floor', '>=', 81.0, 90.0, '%'),
 ('persona_best', 'Player who wants School X gets it as a best match', 'floor', '>=', 62.0, None, '%'),
 ('persona_hard_to_find', 'Schools such a player finds less than a quarter of the time', 'floor', '<=', 5, 0, ''),
 ('persona_early_exit_top6', 'The same, stopping at "See my results now" after question 8', 'floor', '>=', 73.0, None, '%'),
 ('classic_not_unusual', '"Classic samurai": best matches that are not Unusual', 'floor', '>=', 98.0, None, '%'),
 ('simple_not_involved', '"Keep it simple" (no magic asked): best matches that are not Involved', 'floor', '>=', 89.0, None, '%'),
 ('sword_bushi', '"A sword": best matches that are Bushi', 'floor', '>=', 87.0, None, '%'),
 ('words_courtier', '"Words": best matches that are Courtiers', 'floor', '>=', 67.0, None, '%'),
 ('healing_healer', '"Healing" magic: best matches that heal or protect', 'floor', '>=', 98.0, None, '%'),
 ('never_not_low_honor', '"Never break the rules": best matches without low Honor', 'floor', '>=', 87.0, None, '%'),
 ('bias_labels', 'Label-count bias (rank correlation, 0 = none)', 'floor', '<=', 0.15, None, ''),
 ('bias_alphabet', 'Alphabetical bias (rank correlation, 0 = none)', 'floor', '<=', 0.15, None, ''),
 ('max_share', 'Most frequent best match, share of random players', 'floor', '<=', 5.5, None, '%'),
 ('stability_six_kept', 'One answer changed: Schools kept in the top six', 'floor', '>=', 4.2, None, ' of 6'),
 ('stability_top_changes', 'One answer changed: first best match changes (information only)', 'info', None, None, None, '%'),
 ('reach_first', 'Schools that can be the FIRST best match (information only)', 'info', None, None, 105, ''),
 ('no_magic_sees_shugenja_in_also', 'Magic "No": players shown a Shugenja under "Also worth a look" (information only)', 'info', None, None, None, '%'),
 ('said_no_but_fits_shugenja_offered', 'Fits a Shugenja School but said "No": still offered it under "Also worth a look"', 'floor', '>=', 15.0, None, '%'),
]

def check(value, op, mark):
    return {'==': value == mark, '>=': value >= mark, '<=': value <= mark}[op]

if __name__ == '__main__':
    out = run()
    failed = 0
    for key, label, kind, op, mark, target, unit in MARKS:
        v = out[key]
        shown = ('yes' if v else 'no') if isinstance(v, bool) else (('%.2f' if key.startswith('bias') or key.startswith('stability_six') else '%.1f') % v + unit if isinstance(v, float) else '%s%s' % (v, unit))
        if kind == 'info':
            status = 'INFO'
        else:
            ok = check(v, op, mark); failed += not ok
            status = 'PASS' if ok else 'FAIL'
        tail = '' if kind == 'info' else ('  (pass mark %s %s%s)' % (op, mark, '' if target is None else ', target %s' % target))
        print('%-4s %-82s %s%s' % (status, label, shown, tail))
    print('hard to find:', [(k, v) for v, k in out['_hard_to_find']])
    print('%d failed' % failed)
    sys.exit(1 if failed else 0)
