"""Builds finder-data.json for the review page from the prototype, plus oracle.json (400 answer sets and the
prototype's results) for checking the page's port of the scoring. Run extract-tech.js first."""
import json, os, sys, re, random
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, '..', 'prototype')
sys.path.insert(0, P)
from finder import Q, SCHOOLS, DATA, recommend, random_answers, questions_for
from tables import warnings, TAG_WORDS, HOME_WORDS, CX, NICHE
tech = json.load(open(os.path.join(HERE, 'tech1.json')))
famlib = dict(DATA['fam']); famlib.update(DATA['minfam'])
lore = {r['name']: r['lore'] for r in DATA['rows']}
skills = {r['name']: r['skills'] for r in DATA['rows']}
benefit = {r['name']: r['benefit'] for r in DATA['rows']}
def family(s):
    best = None
    for name, trait in famlib.get(s['clan'], []):
        if re.search(r'(^|\s)' + re.escape(name) + r'(\s|$)', s['name']):
            if not best or len(name) > len(best[0]): best = [name, trait]
    return best
SRC = {'Hiruma Scout [Bushi]': 'Imperial Histories 1 p.147', 'Yotsu Bushi School (Heroes of Rokugan) [Bushi]': 'Imperial Histories 1 p.276'}
schools = []
for s in SCHOOLS:
    ask, know = warnings(s)
    schools.append({'n': s['name'], 'c': s['clan'], 'k': s['kind'], 'r': sorted(s['roles']), 'b': s['band'], 'h': s['honor'],
        'p': sorted(s['primary']), 's': sorted(s['secondary']), 'o': sorted(s['homes']), 'x': s['cx'], 'u': s['niche'],
        'a': s['affinity'], 'd': s['deficiency'], 'ca': bool(s['choose_affinity']), 'src': s['source'] or SRC.get(s['name'], ''),
        'lore': (lore[s['name']] or {}).get('text', ''), 'fam': family(s), 'ben': benefit[s['name']], 'sk': skills[s['name']],
        't1': tech[s['name']]['tech'], 't1d': tech[s['name']]['desc'], 'ask': ask, 'know': know})
qs = {qid: {'q': text, 'a': [[label, eff] for label, eff in answers]} for qid, (text, answers) in Q.items()}
# Oracle: 400 random answer sets and what the prototype recommends, for checking the page's port.
rng = random.Random(11)
oracle = []
for i in range(400):
    ans = random_answers(rng, 0.2)
    if i % 5 == 0:   # some players stop early with "See my results now"
        asked = questions_for(ans); cut = rng.randrange(6, len(asked) + 1)
        ans = {k: v for k, v in ans.items() if k in asked[:cut]}
    hard, soft, wild, uniq = recommend(ans)
    oracle.append({'ans': ans, 'hard': [x['name'] for x in hard], 'soft': [x['name'] for x in soft], 'wild': wild['name'] if wild else None,
                   'all': [x['name'] for x in uniq]})
json.dump({'schools': schools, 'q': qs, 'tags': TAG_WORDS, 'homes': HOME_WORDS, 'cx': CX, 'niche': NICHE}, open(os.path.join(HERE, 'finder-data.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(oracle, open(os.path.join(HERE, 'oracle.json'), 'w'))
print('finder-data bytes', os.path.getsize(os.path.join(HERE, 'finder-data.json')), '| families matched', sum(1 for x in schools if x['fam']), 'of', len(schools))
print('no family:', [x['n'] for x in schools if not x['fam']])
