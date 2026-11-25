"""Step 2 of the rating audit: weigh the app's own evidence for every rating, by the rubric.

    node extract-evidence.js        (after `python3 build.py` at the repository root)
    python3 -I rater.py             writes worksheet.json, WORKSHEET.md and book-worklist.json

Nothing here changes a rating. It reports, for each School, which ratings the app's evidence backs, which it does not,
which ratings it suggests adding, and what the book-reading pass (step 3) must settle.
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'prototype'))
from rubric import LABELS, HOMES, CONDITION_WORDS, GREAT_CLANS, UNUSUAL_TEXT, COMPLEXITY, NICHE
from ratings import R

INDEX = os.path.join(HERE, '..', '..', 'SOURCEBOOK INDEX — Page Map', 'index.json')
BOOKS = {b['title']: b for b in json.load(open(INDEX))['books']}
EVID = json.load(open(os.path.join(HERE, 'app-evidence.json')))
CASTER_ONLY = {'protector-magic', 'battle-magic', 'strange-magic'}
CX_WORDS = {1: 'Straightforward', 2: 'Some extra', 3: 'Involved'}
NICHE_WORDS = {1: 'Common', 2: 'Uncommon', 3: 'Unusual'}
MISSING_SOURCE = {'Hiruma Scout [Bushi]': 'Imperial Histories 1 p.147',
                  'Yotsu Bushi School (Heroes of Rokugan) [Bushi]': 'Imperial Histories 1 p.276'}

CITATION = re.compile(r'\((Core Rulebook|The Great Clans|Imperial Histories|Emerald Empire|Book of|Secrets of the Empire|Sword and Fan|'
                      r'Strongholds of the Empire|Naishou Province|Enemies of the Empire|Unexpected Allies)[^)]*\)')

def clean(text):
    """Drop the page citations some Technique texts end with: a book's title is not evidence of how a School plays."""
    return CITATION.sub('', text)

def hits(patterns, text):
    text = clean(text)
    return any(re.search(p, text, re.I) for p in patterns)

def label_evidence(s, label, clans):
    definition, skill_pats, text_pats = LABELS[label]
    if label in CASTER_ONLY and not s['shugenja']:
        return 0, ['not a caster']
    score, where = 0, []
    for t in s['techniques']:
        if hits(text_pats, t['text']):
            score += 2; where.append('Rank %d Technique' % t['rank'])
    if hits(text_pats, s['lore']):
        score += 2; where.append('description')
    if label == 'scholar':
        if len(re.findall(r'\bLore\b', s['skills'])) >= 2: score += 1; where.append('Skills (two or more Lores)')
    elif skill_pats and hits(skill_pats, s['skills']):
        score += 1; where.append('Skills')
    if label in ('archer', 'cavalry', 'beast') and hits(text_pats + [r'\byumi\b', r'\bpony\b'], s['outfit']):
        score += 1; where.append('Outfit')
    if label == 'forbidden' and 'Spider' in clans:
        score += 2; where.append('Clan: Spider')
    if label == 'mystic' and s['brotherhood']:
        score += 2; where.append('Brotherhood monk')
    return score, where

def home_evidence(s, home, clans, roles):
    definition, home_clans, pats = HOMES[home]
    score, where = 0, []
    if any(c in home_clans for c in clans):
        score += 2; where.append('Clan')
    if home == 'court' and 'Courtier' in roles:
        score += 2; where.append('Courtier School')
    if hits(pats, s['lore']):
        score += 2; where.append('description')
    for t in s['techniques']:
        if hits(pats, t['text']):
            score += 2; where.append('Rank %d Technique' % t['rank']); break
    return score, where

def rubric_complexity(s):
    rank1 = clean(s['techniques'][0]['text']) if s['techniques'] else ''
    every = clean(' '.join([s['lore']] + [t['text'] for t in s['techniques']]))
    if s['shugenja']: return 3, 'casts spells'
    if s['brotherhood']: return 3, 'Brotherhood monk (kiho)'
    if re.search(r'\btattoo', every, re.I) or re.search(r'\bkiho\b', rank1, re.I): return 3, 'tattoos or kiho'
    found = [p.strip('\\b') for p in CONDITION_WORDS if re.search(p, rank1, re.I)]
    if found: return 2, 'Rank 1 has: ' + ', '.join(sorted(set(w.replace('\\', '') for w in found)))
    return 1, 'Rank 1 is a constant bonus'

def rubric_niche(s, clans, source):
    name = s['name']
    if 'Spider' in clans: return 3, 'Spider Clan'
    if '[Ninja]' in name or name.startswith('Goju'): return 3, 'ninja'
    if 'Snake' in clans: return 3, 'a destroyed Clan'
    if source.startswith('Imperial Histories'): return 3, 'one historical era (Imperial Histories)'
    if hits(UNUSUAL_TEXT, s['lore']): return 3, 'description: heretical, controversial or one era'
    if source.startswith('Core Rulebook') and any(c in GREAT_CLANS for c in clans): return 1, 'Core Rulebook, Great Clan'
    return 2, 'supplement, Minor Clan, Imperial or Brotherhood'

def pdf_pages(source):
    m = re.match(r'(.+?) pp?\.(\d+)', source)
    if not m: return None
    title, printed = m.group(1).strip(), int(m.group(2))
    b = BOOKS.get(title)
    if not b: return None
    first = printed - b['printed_offset']
    return {'book': title, 'file': b['file'], 'printed_page': printed, 'pdf_pages': [first, first + 1, first + 2]}

def main():
    from finder import role_of
    by_name, clans_of = {}, {}
    for s in EVID:
        by_name.setdefault(s['name'], s); clans_of.setdefault(s['name'], []).append(s['clan'])
    sheet = []
    for name, s in by_name.items():
        primary, secondary, homes, cx, niche, flags = R[name]
        clans = clans_of[name]
        roles = role_of({'name': name, 'shugenja': s['shugenja'], 'brotherhood': s['brotherhood']})
        source = s['source'] or MISSING_SOURCE.get(name, '')
        row = {'name': name, 'clans': clans, 'source': source, 'labels': [], 'suggested': [], 'homes': [], 'book': []}
        for lab in primary + secondary:
            sc, where = label_evidence(s, lab, clans)
            verdict = 'backed' if sc >= 2 else 'weak' if sc == 1 else 'no evidence'
            row['labels'].append({'label': lab, 'main': lab in primary, 'score': sc, 'where': where, 'verdict': verdict})
            if verdict != 'backed':
                row['book'].append('Is "%s" right? %s' % (lab, LABELS[lab][0]))
        for lab in LABELS:
            if lab in primary or lab in secondary: continue
            sc, where = label_evidence(s, lab, clans)
            if sc >= 4:
                row['suggested'].append({'label': lab, 'score': sc, 'where': where})
                row['book'].append('Should "%s" be added? %s' % (lab, LABELS[lab][0]))
        for h in homes:
            sc, where = home_evidence(s, h, clans, roles)
            verdict = 'backed' if sc >= 2 else 'no evidence'
            row['homes'].append({'home': h, 'score': sc, 'where': where, 'verdict': verdict})
            if verdict != 'backed':
                row['book'].append('Is the home "%s" right? %s' % (h, HOMES[h][0]))
        rcx, why_cx = rubric_complexity(s)
        rn, why_n = rubric_niche(s, clans, source)
        row['complexity'] = {'rated': cx, 'rubric': rcx, 'why': why_cx, 'agree': rcx == cx}
        row['niche'] = {'rated': niche, 'rubric': rn, 'why': why_n, 'agree': rn == niche}
        if rcx != cx: row['book'].append('Complexity: rated %s, rubric says %s (%s).' % (CX_WORDS[cx], CX_WORDS[rcx], why_cx))
        if rn != niche: row['book'].append('How unusual: rated %s, rubric says %s (%s).' % (NICHE_WORDS[niche], NICHE_WORDS[rn], why_n))
        row['pages'] = pdf_pages(source)
        sheet.append(row)

    # Near-twins (owner's reliability ruling, 25 November): Schools whose draft ratings are almost the same, so no
    # answer can tell them apart. The book pass looks for what separates them, to become a label.
    def profile(n):
        p, sec, homes, cx, niche, flags = R[n]
        roles = role_of({'name': n, 'shugenja': by_name[n]['shugenja'], 'brotherhood': by_name[n]['brotherhood']})
        return set(p) | set(sec) | {'home:' + h for h in homes} | {'role:' + r for r in roles}
    names = list(by_name)
    twins = []
    for i, x in enumerate(names):
        for y in names[i + 1:]:
            px, py = profile(x), profile(y)
            sim = len(px & py) / len(px | py)
            if sim >= 0.75: twins.append((round(sim, 2), x, y))
    twins.sort(reverse=True)
    rows = {r['name']: r for r in sheet}
    for sim, x, y in twins:
        rows[x]['book'].append('Near-twin of "%s" (rated %d%% alike): what separates them? Propose a label for each that the evidence supports.' % (y, round(sim * 100)))
        rows[x].setdefault('twins', []).append({'with': y, 'similarity': sim})
    json.dump(sheet, open(os.path.join(HERE, 'worksheet.json'), 'w'), indent=1, ensure_ascii=False)
    work = [{'name': r['name'], 'clans': r['clans'], 'source': r['source'], 'pages': r['pages'], 'questions': r['book']} for r in sheet if r['book']]
    json.dump(work, open(os.path.join(HERE, 'book-worklist.json'), 'w'), indent=1, ensure_ascii=False)

    labels = [l for r in sheet for l in r['labels']]
    homes_ = [h for r in sheet for h in r['homes']]
    summary = {
        'schools': len(sheet),
        'labels': len(labels), 'labels_backed': sum(l['verdict'] == 'backed' for l in labels),
        'labels_weak': sum(l['verdict'] == 'weak' for l in labels), 'labels_none': sum(l['verdict'] == 'no evidence' for l in labels),
        'main_labels': sum(l['main'] for l in labels), 'main_backed': sum(l['main'] and l['verdict'] == 'backed' for l in labels),
        'suggested': sum(len(r['suggested']) for r in sheet),
        'homes': len(homes_), 'homes_backed': sum(h['verdict'] == 'backed' for h in homes_),
        'complexity_agree': sum(r['complexity']['agree'] for r in sheet), 'niche_agree': sum(r['niche']['agree'] for r in sheet),
        'schools_fully_backed': sum(1 for r in sheet if not r['book']),
        'book_questions': sum(len(r['book']) for r in sheet), 'schools_for_book': len(work),
        'pages_found': sum(1 for r in sheet if r['pages']),
        'near_twin_pairs': len(twins),
    }
    write_markdown(sheet, summary)
    print(json.dumps(summary, indent=1))

def write_markdown(sheet, s):
    L = []
    L.append('# Rating audit, step 2: the app\'s own evidence\n')
    L.append('Generated by `rater.py` from `app-evidence.json` (every School\'s Skills, Outfit, five Techniques and description, '
             'as the app holds them) against the rubric in `rubric.py`. Nothing here changes a rating. Each rating is **backed** '
             '(evidence weighs 2 or more: a matching Technique or the description counts 2, a Skill or the Outfit 1), **weak** (1) '
             'or has **no evidence** (0). Labels the evidence strongly supports but the draft lacks are **suggested**. Everything '
             'not backed goes to the book-reading pass (`book-worklist.json`).\n')
    L.append('| Measure | Count |\n|---|---|')
    L.append('| Schools | %d |' % s['schools'])
    L.append('| Labels backed by the app\'s evidence | %d of %d |' % (s['labels_backed'], s['labels']))
    L.append('| … of them main labels | %d of %d |' % (s['main_backed'], s['main_labels']))
    L.append('| Labels with weak evidence / no evidence | %d / %d |' % (s['labels_weak'], s['labels_none']))
    L.append('| Labels suggested by the evidence | %d |' % s['suggested'])
    L.append('| Homes backed | %d of %d |' % (s['homes_backed'], s['homes']))
    L.append('| Complexity agrees with the rubric | %d of %d |' % (s['complexity_agree'], s['schools']))
    L.append('| How unusual agrees with the rubric | %d of %d |' % (s['niche_agree'], s['schools']))
    L.append('| Schools fully backed already | %d |' % s['schools_fully_backed'])
    L.append('| Near-twin pairs (rated at least 75%% alike) | %d |' % s['near_twin_pairs'])
    L.append('| Questions for the book-reading pass | %d, across %d Schools |' % (s['book_questions'], s['schools_for_book']))
    L.append('')
    order = ['Crab', 'Crane', 'Dragon', 'Lion', 'Phoenix', 'Scorpion', 'Unicorn', 'Mantis', 'Spider', 'Imperial', 'Badger', 'Bat',
             'Boar', 'Dragonfly', 'Falcon', 'Fox', 'Hare', 'Monkey', 'Oriole', 'Ox', 'Snake', 'Sparrow', 'Tortoise', 'Tiger', 'Brotherhood of Shinsei']
    mark = {'backed': '✔', 'weak': '~', 'no evidence': '✘'}
    for clan in order:
        rows = [r for r in sheet if r['clans'][0] == clan]
        if not rows: continue
        L.append('## %s\n' % clan)
        for r in rows:
            L.append('**%s** · %s' % (r['name'], r['source']))
            L.append('- Labels: ' + '; '.join('%s%s %s (%s)' % ('**' + l['label'] + '**' if l['main'] else l['label'], '', mark[l['verdict']],
                     ', '.join(l['where']) or 'nothing found') for l in r['labels']))
            if r['suggested']:
                L.append('- Suggested: ' + '; '.join('%s (%s)' % (x['label'], ', '.join(x['where'])) for x in r['suggested']))
            L.append('- Homes: ' + '; '.join('%s %s (%s)' % (h['home'], mark[h['verdict']], ', '.join(h['where']) or 'nothing found') for h in r['homes']))
            c, n = r['complexity'], r['niche']
            if r.get('twins'):
                L.append('- Near-twin of: ' + '; '.join('%s (%d%% alike)' % (t['with'], round(t['similarity'] * 100)) for t in r['twins']))
            L.append('- Complexity: %s%s · How unusual: %s%s' % (
                CX_WORDS[c['rated']], '' if c['agree'] else ' → rubric says **%s** (%s)' % (CX_WORDS[c['rubric']], c['why']),
                NICHE_WORDS[n['rated']], '' if n['agree'] else ' → rubric says **%s** (%s)' % (NICHE_WORDS[n['rubric']], n['why'])))
            L.append('')
    open(os.path.join(HERE, 'WORKSHEET.md'), 'w').write('\n'.join(L))

if __name__ == '__main__':
    main()
