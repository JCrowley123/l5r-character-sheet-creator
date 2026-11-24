import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from finder import Q, recommend, score, questions_for
def idx(qid, text):
    for i, (t, e) in enumerate(Q[qid][1]):
        if t.startswith(text): return i
    raise KeyError((qid, text))
EX = {
 'A new player who wants a classic warrior': {'magic': 'No:', 'complexity': 'Keep it simple', 'niche': 'A classic', 'approach': 'A sword', 'fight': 'In the front line',
   'ambition': 'Standing between', 'home': 'On a great wall', 'rules': 'Only if', 'bushido': 'Courage', 'faith': 'Respectful', 'companion': 'No preference', 'death': 'In a last stand'},
 'A curious player who wants something different': {'magic': 'A touch', 'complexity': 'Some extra', 'niche': 'Open to', 'approach': 'A sword', 'fight': 'No preference',
   'ambition': 'Standing between', 'home': 'On the road', 'rules': 'Only if', 'bushido': 'Honesty', 'faith': 'Deeply', 'companion': 'No one', 'death': 'Fighting the darkness'},
 'A player who wants a healer': {'magic': 'Yes', 'complexity': 'Some extra', 'niche': 'No preference', 'magickind': 'Healing', 'element': 'Air',
   'ambition': 'The people they saved', 'home': 'Elegant courts', 'rules': 'Never', 'bushido': 'Compassion', 'companion': 'A book', 'death': 'Of old age'},
}
out = {}
for title, picks in EX.items():
    ans = {}
    for qid in ['magic','complexity','niche','approach','fight','court','magickind','element','ambition','home','rules','bushido','faith','companion','death']:
        if qid in picks: ans[qid] = idx(qid, picks[qid])
    asked = questions_for(ans)
    ans = {k: v for k, v in ans.items() if k in asked}
    hard, soft, wild, uniq = recommend(ans)
    print('==', title, '(questions asked:', len(asked), ')')
    print('  answers:', [(q, Q[q][1][ans[q]][0]) for q in asked if q in ans])
    print('  hard:', [(s['name'], s['clan'], score(s, ans)) for s in hard])
    print('  soft:', [(s['name'], s['clan'], score(s, ans)) for s in soft])
    print('  wildcard:', (wild['name'], wild['clan'], score(wild, ans)) if wild else None)
    out[title] = {'answers': [[Q[q][0], Q[q][1][ans[q]][0]] for q in asked if q in ans],
                  'hard': [[s['name'], s['clan']] for s in hard], 'soft': [[s['name'], s['clan']] for s in soft],
                  'wild': [wild['name'], wild['clan']] if wild else None}
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'examples.json'), 'w'), indent=1)
