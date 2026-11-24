"""Prototype of the Character Finder scoring, run against the app's real school list.

python3 -I finder.py  -> reachability, balance and sample answer paths.
"""
import json, random, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ratings import R

DATA = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schools.json')))

def role_of(s):
    n = s['name']
    if s['shugenja']: return {'Shugenja'}
    m = re.search(r'\[([^\]]+)\]', n)
    tag = m.group(1) if m else ''
    if s['brotherhood'] or tag == 'Monk': return {'Monk'}
    if tag == 'Ninja': return {'Ninja'}
    if tag == 'Artisan/Bushi': return {'Artisan', 'Bushi'}
    if tag == 'Artisan' or n.endswith('Artisan'): return {'Artisan'}
    if tag == 'Courtier' or n.endswith('Courtier'): return {'Courtier'}
    return {'Bushi'}

def honor_band(h):
    if h is None: return 'mid'
    return 'high' if h >= 6 else ('low' if h <= 3.5 else 'mid')

SCHOOLS = []
for s in DATA['rows']:
    p, sec, homes, cx, niche, flags = R[s['name']]
    SCHOOLS.append(dict(name=s['name'], clan=s['clan'], kind=s['kind'], roles=role_of(s), honor=s['honor'],
        band=honor_band(s['honor']), primary=set(p), secondary=set(sec), homes=set(homes), cx=cx, niche=niche,
        flags=set(flags), source=s['source'] or '', affinity=s['affinity'], deficiency=s['deficiency'],
        choose_affinity=(s['shugenja'] and not s['affinity'] and s['name'] == 'Isawa Shugenja')))
assert len(SCHOOLS) == 106 and len(R) == len({s["name"] for s in SCHOOLS}) == 105, (len(SCHOOLS), len(R))

NP = ('No preference', {})
Q = {
 'magic': ('Do you want your character to cast spells?', [
    ('Yes: magic is the heart of who they are', {'filter': 'shugenja'}),
    ('A touch of the mystical, but no spells', {'filter': 'no-shugenja', 'tags': {'mystic': 2, 'spirits': 1, 'monster-hunter': 1}, 'roles': {'Monk': 2}}),
    ('No: they rely on their own skill', {'filter': 'no-shugenja', 'tags': {'mystic': -1}}),
    NP]),
 'complexity': ('How much rules detail do you want to keep track of?', [
    ('Keep it simple: I am still learning the game', {'cx': {1: 3, 2: 0, 3: -3}}),
    ('Some extra options are fine', {'cx': {1: 1, 2: 2, 3: 0}}),
    ('Lots of moving parts: I like mastering a system', {'cx': {1: -1, 2: 1, 3: 3}}),
    NP]),
 'niche': ('How do you feel about unusual characters?', [
    ('A classic samurai most players will recognise', {'niche': {1: 3, 2: 0, 3: -4}}),
    ('Open to something a bit different', {'niche': {1: 1, 2: 2, 3: 0}, 'wildcard': True}),
    ('The stranger the better', {'niche': {1: -1, 2: 1, 3: 3}, 'wildcard': True}),
    ('No preference', {'wildcard': True})]),
 'approach': ('When trouble starts, what does your character reach for first?', [
    ('A sword or another weapon', {'roles': {'Bushi': 4}}),
    ('Words: persuasion, wit or a well-placed secret', {'roles': {'Courtier': 4}}),
    ('Inner discipline and their own two hands', {'roles': {'Monk': 4}, 'tags': {'unarmed': 1}}),
    ('The shadows: they would rather not be seen', {'roles': {'Ninja': 4}, 'tags': {'stealth': 2}}),
    ('Their craft or their art', {'roles': {'Artisan': 4}, 'tags': {'artist': 1, 'craft': 1}}),
    NP]),
 'fight': ('In a fight, where do you want to be?', [
    ('In the front line, taking hits and hitting back harder', {'tags': {'frontline': 3}}),
    ('Facing one opponent: a single perfect strike', {'tags': {'duelist': 3}}),
    ('At a distance, with a bow', {'tags': {'archer': 3}}),
    ('On horseback', {'tags': {'cavalry': 3}}),
    ('Fists, feet and grappling', {'tags': {'unarmed': 3}}),
    ('Fast and mobile: strike and get away', {'tags': {'skirmisher': 3, 'stealth': 1}}),
    ('Guarding someone who matters', {'tags': {'bodyguard': 3}}),
    ('Directing the battle', {'tags': {'commander': 3}}),
    ('All-out attack: no holding back', {'tags': {'all-out': 3}}),
    NP]),
 'court': ('Away from a fight, how do they get their way?', [
    ('Charm, courtesy and making friends', {'tags': {'diplomat': 3}}),
    ('Secrets, leverage and a little fear', {'tags': {'schemer': 3}}),
    ('Evidence: they find out the truth', {'tags': {'investigator': 3}}),
    ('Stories, art and performance', {'tags': {'artist': 3}}),
    ('Knowledge: they have read everything', {'tags': {'scholar': 3}}),
    ('Trade: everyone has a price', {'tags': {'merchant': 3}}),
    ('Making things that last', {'tags': {'craft': 3}}),
    NP]),
 'magickind': ('What should their magic be best at?', [
    ('Destroying enemies', {'tags': {'battle-magic': 3}}),
    ('Healing and protecting', {'tags': {'healer': 3, 'protector-magic': 3}}),
    ('Speaking with spirits, ancestors and the dead', {'tags': {'spirits': 3}}),
    ('Nature, animals and the weather', {'tags': {'nature': 3, 'beast': 1}}),
    ('Strange or experimental magic', {'tags': {'strange-magic': 3}}),
    ('Hunting monsters and the Taint', {'tags': {'monster-hunter': 3}}),
    ('Subtle tricks no one notices', {'tags': {'stealth': 3, 'schemer': 1}}),
    ('Forbidden power, whatever the cost', {'tags': {'forbidden': 3}}),
    NP]),
 'element': ('Which Element calls to them?', [
    ('Air: subtle, quick and perceptive', {'element': 'Air'}),
    ('Earth: steady, protective and enduring', {'element': 'Earth'}),
    ('Fire: passionate, clever and destructive', {'element': 'Fire'}),
    ('Water: adaptable, healing and always moving', {'element': 'Water'}),
    ('Void: the rare, mystical space between', {'element': 'Void'}),
    NP]),
 'ambition': ('What would they most like to be remembered for?', [
    ('Standing between the Empire and the darkness', {'tags': {'monster-hunter': 2, 'bodyguard': 1}}),
    ('Perfect mastery of an art: the sword, the brush or the stage', {'tags': {'duelist': 2, 'artist': 2}}),
    ('Victory: battles won and enemies broken', {'tags': {'commander': 2, 'frontline': 2}}),
    ('Wisdom: understanding the secrets of the world', {'tags': {'scholar': 2, 'mystic': 2}}),
    ('Loyalty in the shadows: doing what others will not', {'tags': {'schemer': 2, 'stealth': 2}}),
    ('Freedom: going where no one else has been', {'tags': {'traveller': 2, 'cavalry': 1, 'sailor': 1}}),
    ('Wealth and influence', {'tags': {'merchant': 2, 'schemer': 1, 'diplomat': 1}}),
    ('The people they saved', {'tags': {'healer': 2, 'protector-magic': 1, 'bodyguard': 1, 'diplomat': 1}}),
    NP]),
 'home': ('Where do they feel most at home?', [
    ('On a great wall, facing a monster-haunted wasteland', {'homes': {'wall': 3}}),
    ('Elegant courts and castles', {'homes': {'court': 3}}),
    ('High mountains and quiet monasteries', {'homes': {'mountains': 3}}),
    ('Libraries and temples', {'homes': {'library': 3}}),
    ('The open plains, on horseback', {'homes': {'plains': 3}}),
    ('At sea, among islands and ports', {'homes': {'sea': 3}}),
    ('On the battlefield, among soldiers', {'homes': {'battlefield': 3}}),
    ('Forests and wild places', {'homes': {'wilds': 3}}),
    ('City streets and shady corners', {'homes': {'underworld': 3}}),
    ('On the road, never in one place for long', {'homes': {'road': 3}}),
    NP]),
 'rules': ('Would they break the rules to get the job done?', [
    ('Never: their word and their honour are everything', {'honor': {'high': 3, 'low': -2}}),
    ('Only if there is truly no other way', {'honor': {'mid': 2}}),
    ('Yes, if the result is worth it', {'honor': {'low': 3, 'high': -1}}),
    NP]),
 'bushido': ('Which virtue of Bushido matters most to them?', [
    ('Compassion', {'tags': {'healer': 2, 'bodyguard': 1, 'protector-magic': 1}}),
    ('Courage', {'tags': {'frontline': 2, 'monster-hunter': 2, 'all-out': 1}}),
    ('Courtesy', {'tags': {'diplomat': 2, 'artist': 1}}),
    ('Duty', {'tags': {'bodyguard': 2, 'commander': 1}}),
    ('Honesty', {'tags': {'investigator': 2}}),
    ('Honor', {'honor': {'high': 2}}),
    ('Sincerity', {'tags': {'diplomat': 1, 'mystic': 1}}),
    ('None of them: results matter more', {'honor': {'low': 3}}),
    NP]),
 'faith': ('How religious are they?', [
    ('Deeply: prayer and meditation shape their life', {'tags': {'mystic': 3, 'spirits': 2}, 'roles': {'Monk': 1}}),
    ('Respectful, like most samurai', {}),
    ('Not very: steel and results matter more', {'tags': {'mystic': -2, 'spirits': -1}}),
    NP]),
 'companion': ('Who or what would you like at their side?', [
    ('A loyal horse', {'tags': {'cavalry': 2}, 'homes': {'plains': 1}}),
    ('A hunting falcon or a war-cat', {'tags': {'beast': 3}}),
    ('A ship and its crew', {'tags': {'sailor': 3}}),
    ('A fine blade, their family\'s pride', {'tags': {'duelist': 2}}),
    ('A book or a brush', {'tags': {'scholar': 2, 'artist': 2}}),
    ('A network of informants', {'tags': {'schemer': 2, 'investigator': 1}}),
    ('No one: they walk alone', {'tags': {'traveller': 2, 'stealth': 1, 'mystic': 1}}),
    NP]),
 'death': ('Every samurai thinks about how they will die. How will yours?', [
    ('In a last stand, holding the line', {'tags': {'frontline': 2, 'bodyguard': 2}}),
    ('In a duel', {'tags': {'duelist': 3}}),
    ('Fighting the darkness, far from home', {'tags': {'monster-hunter': 3}}),
    ('Of old age, surrounded by students', {'tags': {'scholar': 2, 'mystic': 2, 'healer': 1}}),
    ('Quietly, with secrets no one ever learns', {'tags': {'stealth': 2, 'schemer': 2}}),
    ('At the head of an army', {'tags': {'commander': 3}}),
    ('Somewhere no one from home has ever been', {'tags': {'traveller': 2, 'sailor': 1, 'cavalry': 1}}),
    NP]),
}

def questions_for(ans):
    """The adaptive order. ans maps question id -> answer index (or None while unasked)."""
    order = ['magic', 'complexity', 'niche']
    caster = ans.get('magic') == 0
    if caster:
        order += ['magickind', 'element']
    else:
        order += ['approach']
        a = ans.get('approach')
        order += ['court'] if a in (1, 4) else ['fight']
    order += ['ambition', 'home', 'rules', 'bushido']
    if not caster: order += ['faith']
    order += ['companion', 'death']
    return order

def effects(ans):
    for qid in questions_for(ans):
        i = ans.get(qid)
        if i is None: continue
        yield Q[qid][1][i][1]

def score(s, ans):
    t = 0
    for e in effects(ans):
        for tag, w in e.get('tags', {}).items():
            t += w * (2 if tag in s['primary'] else 1 if tag in s['secondary'] else 0)
        for role, w in e.get('roles', {}).items():
            if role in s['roles']: t += w
        for home, w in e.get('homes', {}).items():
            if home in s['homes']: t += w
        t += e.get('honor', {}).get(s['band'], 0)
        t += e.get('cx', {}).get(s['cx'], 0)
        t += e.get('niche', {}).get(s['niche'], 0)
        el = e.get('element')
        if el:
            if s['choose_affinity'] or s['affinity'] == el: t += 3
            elif s['deficiency'] == el: t -= 2
    return t

def allowed(s, ans):
    f = ans.get('magic')
    if f == 0: return 'Shugenja' in s['roles']
    if f in (1, 2): return 'Shugenja' not in s['roles']
    return True

def recommend(ans):
    pool = [s for s in SCHOOLS if allowed(s, ans)]
    ranked = sorted(pool, key=lambda s: (-score(s, ans), s['cx'], s['niche'], s['name']))
    # One card per school name (Toritaka Bushi is offered by both the Crab and the Falcon).
    seen, uniq = set(), []
    for s in ranked:
        if s['name'] in seen: continue
        seen.add(s['name']); uniq.append(s)
    top = score(uniq[0], ans)
    hard = [uniq[0]]
    if len(uniq) > 1 and (top <= 0 or score(uniq[1], ans) >= 0.8 * top): hard.append(uniq[1])
    soft, clans = [], {}
    for s in hard: clans[s['clan']] = clans.get(s['clan'], 0) + 1
    for s in uniq[len(hard):]:
        if len(soft) == 4: break
        if clans.get(s['clan'], 0) >= 2: continue
        soft.append(s); clans[s['clan']] = clans.get(s['clan'], 0) + 1
    wild = None
    if any(e.get('wildcard') for e in effects(ans)) or ans.get('niche') is None:
        shown = {s['name'] for s in hard + soft}
        wild = next((s for s in uniq if s['niche'] == 3 and s['name'] not in shown and score(s, ans) >= 0.5 * top), None)
    return hard, soft, wild, uniq

def random_answers(rng, p_np=0.15):
    ans = {}
    for qid in ['magic', 'complexity', 'niche', 'approach', 'fight', 'court', 'magickind', 'element',
                'ambition', 'home', 'rules', 'bushido', 'faith', 'companion', 'death']:
        opts = Q[qid][1]
        ans[qid] = len(opts) - 1 if rng.random() < p_np else rng.randrange(len(opts) - 1)
    # keep only the questions this path actually asks
    asked = questions_for(ans)
    return {k: v for k, v in ans.items() if k in asked}

def best_path_for(target, rng, tries=60):
    """Hill-climb the answers to put target as high as possible. Returns (rank, answers)."""
    best = (10**9, None)
    for t in range(tries):
        ans = random_answers(rng, 0.3)
        if 'Shugenja' in target['roles']: ans['magic'] = 0
        elif ans.get('magic') == 0: ans['magic'] = 2
        ans = {k: v for k, v in ans.items() if k in questions_for(ans)}
        def rank_of(a):
            hard, soft, wild, uniq = recommend(a)
            names = [s['name'] for s in uniq]
            return names.index(target['name']) if target['name'] in names else 999
        cur = rank_of(ans)
        improved = True
        while improved and cur > 0:
            improved = False
            for qid in list(questions_for(ans)):
                if qid == 'magic' and 'Shugenja' in target['roles']: continue
                for i in range(len(Q[qid][1])):
                    if ans.get(qid) == i: continue
                    trial = dict(ans); trial[qid] = i
                    if qid == 'magic' and i == 0: continue
                    trial = {k: v for k, v in trial.items() if k in questions_for(trial)}
                    for need in questions_for(trial):
                        trial.setdefault(need, len(Q[need][1]) - 1)
                    r = rank_of(trial)
                    if r < cur: ans, cur, improved = trial, r, True
        if cur < best[0]: best = (cur, ans)
        if cur == 0: break
    return best

if __name__ == '__main__':
    rng = random.Random(7)
    # 1. Reachability: every school can be the top recommendation on some answer path.
    worst = []
    for s in SCHOOLS:
        r, a = best_path_for(s, rng)
        worst.append((r, s['name']))
    worst.sort(reverse=True)
    unreachable_top = [n for r, n in worst if r > 0]
    unreachable_hard = [n for r, n in worst if r > 1]
    print('schools:', len(SCHOOLS), '| unique names:', len({s["name"] for s in SCHOOLS}))
    print('not reachable as #1:', len(unreachable_top), unreachable_top[:20])
    print('not reachable as a hard pick (top 2):', len(unreachable_hard), unreachable_hard)
    # 2. Balance and empty results over random players.
    N = 20000
    hard_count, any_count, small = {}, {}, 0
    hard_sizes = {1: 0, 2: 0}
    for _ in range(N):
        ans = random_answers(rng)
        hard, soft, wild, uniq = recommend(ans)
        if len(uniq) < 6: small += 1
        hard_sizes[len(hard)] += 1
        for s in hard: hard_count[s['name']] = hard_count.get(s['name'], 0) + 1
        for s in hard + soft + ([wild] if wild else []): any_count[s['name']] = any_count.get(s['name'], 0) + 1
    print('random players:', N, '| results with fewer than 6 schools:', small, '| hard pick sizes:', hard_sizes)
    top = sorted(hard_count.items(), key=lambda x: -x[1])[:8]
    print('most frequent hard picks (% of players):', [(n, round(100 * c / N, 1)) for n, c in top])
    never = [s['name'] for s in SCHOOLS if s['name'] not in any_count]
    print('never shown in hard/soft/wildcard across random players:', len(never), never)
