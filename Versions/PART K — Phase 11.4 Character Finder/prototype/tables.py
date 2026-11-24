"""Writes the generated sections of DESIGN.md (questions, school ratings, warnings) as JSON + Markdown,
from the same data the prototype scores with, so the document cannot drift from the checks."""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from finder import Q, SCHOOLS, questions_for

HERE = os.path.dirname(os.path.abspath(__file__))
TAG_WORDS = {
 'frontline': 'front line', 'duelist': 'duelist', 'archer': 'archer', 'cavalry': 'cavalry', 'unarmed': 'unarmed',
 'skirmisher': 'fast skirmisher', 'bodyguard': 'bodyguard', 'commander': 'commander', 'all-out': 'all-out attacker',
 'monster-hunter': 'monster hunter', 'stealth': 'stealth', 'diplomat': 'diplomat', 'schemer': 'schemer',
 'investigator': 'investigator', 'scholar': 'scholar', 'artist': 'artist', 'merchant': 'merchant', 'craft': 'craftsman',
 'healer': 'healer', 'protector-magic': 'protective magic', 'battle-magic': 'battle magic', 'spirits': 'spirits and the dead',
 'nature': 'nature and weather', 'strange-magic': 'unusual magic', 'forbidden': 'forbidden power', 'mystic': 'mystic',
 'beast': 'animal companion', 'sailor': 'sailor', 'traveller': 'traveller'}
HOME_WORDS = {'wall': 'the Wall', 'court': 'court', 'mountains': 'mountains', 'library': 'libraries and temples',
 'plains': 'plains', 'sea': 'sea', 'battlefield': 'battlefield', 'wilds': 'wilds', 'underworld': 'streets and shadows', 'road': 'the road'}
CX = {1: 'Straightforward', 2: 'Some extra', 3: 'Involved'}
NICHE = {1: 'Common', 2: 'Uncommon', 3: 'Unusual'}
CLAN_ORDER = ['Crab', 'Crane', 'Dragon', 'Lion', 'Phoenix', 'Scorpion', 'Unicorn', 'Mantis', 'Spider', 'Imperial',
 'Badger', 'Bat', 'Boar', 'Dragonfly', 'Falcon', 'Fox', 'Hare', 'Monkey', 'Oriole', 'Ox', 'Snake', 'Sparrow', 'Tortoise', 'Tiger',
 'Brotherhood of Shinsei']

def warnings(s):
    ask, know = [], []
    src = s['source']
    if not src:
        src = {'Hiruma Scout [Bushi]': 'Imperial Histories 1 p.147',
               'Yotsu Bushi School (Heroes of Rokugan) [Bushi]': 'Imperial Histories 1 p.276'}[s['name']]
    if not src.startswith('Core Rulebook'):
        ask.append('From %s: check your GM uses this book.' % src)
    if 'era' in s['flags']:
        ask.append('Belongs to one period of Rokugan\'s history: check it fits your campaign\'s era.')
    if 'timeline' in s['flags']:
        ask.append('Comes from an alternate timeline: check it fits your campaign.')
    if 'spider' in s['flags']:
        ask.append('Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first.')
    if 'ninja' in s['flags']:
        ask.append('Ninja: a secret even within their own Clan, and exposure means disgrace or death. Your GM will need to plan around it.')
    if 'heresy' in s['flags']:
        ask.append('A heretical or controversial order: other monks may treat your character as an enemy.')
    if 'Shugenja' in s['roles']:
        know.append('Casts spells: you will choose starting spells and track spell slots.')
    if s['kind'] == 'brotherhood' or s['name'].startswith('The Hoshi Tsurui'):
        know.append('Uses the kiho rules.')
    if 'tattooed' in s['name'].lower() or 'Zumi' in s['name']:
        know.append('Tattooed monk: the app does not model tattoos yet.')
    if s['kind'] == 'minor' and s['clan'] != 'Mantis':
        know.append('A Minor Clan: your character may be the only one of their Clan in the story.')
    if s['honor'] is not None and s['honor'] <= 2.5:
        know.append('Starts with low Honor (%s): other samurai may distrust them.' % s['honor'])
    if s['clan'] == 'Imperial':
        know.append('Serves the Imperial families rather than a Great Clan.')
    return ask, know

def school_rows():
    seen, rows = set(), []
    for s in sorted(SCHOOLS, key=lambda s: (CLAN_ORDER.index(s['clan']), s['name'])):
        if s['name'] in seen:
            continue
        seen.add(s['name'])
        clans = [x['clan'] for x in SCHOOLS if x['name'] == s['name']]
        ask, know = warnings(s)
        rows.append({
            'name': s['name'], 'clan': ' or '.join(clans), 'type': '/'.join(sorted(s['roles'])),
            'honor': s['honor'], 'source': s['source'] or warnings_source(s),
            'primary': [TAG_WORDS[t] for t in sorted(s['primary'])], 'secondary': [TAG_WORDS[t] for t in sorted(s['secondary'])],
            'homes': [HOME_WORDS[h] for h in sorted(s['homes'])], 'cx': CX[s['cx']], 'niche': NICHE[s['niche']],
            'affinity': s['affinity'] or ('chosen' if s['choose_affinity'] else ''), 'ask': ask, 'know': know})
    return rows

def warnings_source(s):
    return {'Hiruma Scout [Bushi]': 'Imperial Histories 1 p.147',
            'Yotsu Bushi School (Heroes of Rokugan) [Bushi]': 'Imperial Histories 1 p.276'}.get(s['name'], '')

def question_rows():
    out = []
    order = ['magic', 'complexity', 'niche', 'approach', 'fight', 'court', 'magickind', 'element', 'ambition', 'home', 'rules', 'bushido', 'faith', 'companion', 'death']
    for qid in order:
        text, answers = Q[qid]
        rows = []
        for label, e in answers:
            parts = []
            if e.get('filter') == 'shugenja': parts.append('only Shugenja Schools remain')
            if e.get('filter') == 'no-shugenja': parts.append('Shugenja Schools removed')
            for k, w in e.get('tags', {}).items(): parts.append('%s %+d' % (TAG_WORDS[k], w))
            for k, w in e.get('roles', {}).items(): parts.append('%s %+d' % (k, w))
            for k, w in e.get('homes', {}).items(): parts.append('home: %s %+d' % (HOME_WORDS[k], w))
            for k, w in e.get('honor', {}).items(): parts.append('%s Honor %+d' % (k, w))
            for k, w in e.get('cx', {}).items(): parts.append('%s %+d' % (CX[k], w))
            for k, w in e.get('niche', {}).items(): parts.append('%s %+d' % (NICHE[k], w))
            if e.get('element'): parts.append('Affinity %s +3, Deficiency %s -2' % (e['element'], e['element']))
            if e.get('wildcard'): parts.append('adds a "something different" pick')
            rows.append([label, ', '.join(parts) or 'no effect'])
        out.append({'id': qid, 'text': text, 'answers': rows})
    return out

if __name__ == '__main__':
    rows, qs = school_rows(), question_rows()
    json.dump({'schools': rows, 'questions': qs}, open(os.path.join(HERE, 'design-data.json'), 'w'), indent=1, ensure_ascii=False)
    md = []
    md.append('| School | Clan | Type | Honor | Plays like (main · also) | Home | Complexity | How unusual | Source |')
    md.append('|---|---|---|---|---|---|---|---|---|')
    for r in rows:
        plays = ', '.join(r['primary']) + ((' · ' + ', '.join(r['secondary'])) if r['secondary'] else '')
        md.append('| %s | %s | %s | %s | %s | %s | %s | %s | %s |' % (r['name'], r['clan'], r['type'] + (' (%s)' % r['affinity'] if r['affinity'] else ''),
            r['honor'] if r['honor'] is not None else '–', plays, ', '.join(r['homes']), r['cx'], r['niche'], r['source']))
    tables = {'SCHOOLS': '\n'.join(md)}
    w = ['| School | Ask your GM | Good to know |', '|---|---|---|']
    for r in rows:
        if r['ask'] or r['know']:
            w.append('| %s | %s | %s |' % (r['name'], '<br>'.join(r['ask']) or '–', '<br>'.join(r['know']) or '–'))
    tables['WARNINGS'] = '\n'.join(w)
    qmd = []
    for q in qs:
        qmd.append('**%s** (`%s`)\n' % (q['text'], q['id']))
        qmd.append('| Answer | What it scores |')
        qmd.append('|---|---|')
        for a, e in q['answers']:
            qmd.append('| %s | %s |' % (a, e))
        qmd.append('')
    tables['QUESTIONS'] = '\n'.join(qmd).rstrip()
    design = os.path.join(HERE, '..', 'DESIGN.md')
    doc = open(design, encoding='utf-8').read()
    for key, body in tables.items():
        block = '<!-- generated:%s (prototype/tables.py) -->\n%s\n<!-- end generated:%s -->' % (key, body, key)
        if '{{%s}}' % key in doc:
            doc = doc.replace('{{%s}}' % key, block)
        else:
            doc = re.sub(r'<!-- generated:%s .*?<!-- end generated:%s -->' % (key, key), lambda m: block, doc, flags=re.S)
    open(design, 'w', encoding='utf-8').write(doc)
    from collections import Counter
    print('schools', len(rows), Counter(r['niche'] for r in rows), Counter(r['cx'] for r in rows))
    print('with ask-your-GM', sum(1 for r in rows if r['ask']), '| with good-to-know only', sum(1 for r in rows if r['know'] and not r['ask']), '| neither', sum(1 for r in rows if not r['ask'] and not r['know']))
