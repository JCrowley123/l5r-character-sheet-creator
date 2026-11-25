"""Steps 3 to 5 of the rating audit: check the evidence recorded from the books (and the wikis).

    python3 -I check_evidence.py --template            create book-evidence.json from book-worklist.json (never overwrites)
    python3 -I check_evidence.py --book-text DIR       check book-evidence.json; DIR is extract_pages.py's scratch folder

book-evidence.json holds one entry per School, one answer per question in book-worklist.json:
    decision    keep | remove | add | change | unsure
    to          for "change": the new value (a Home, a complexity or a how-unusual level)
    evidence    what the page says, IN OUR OWN WORDS, one or two short sentences
    page        the printed page, as "Core Rulebook p.106" (never the PDF viewer's page)
    source      book | wiki   (the books are primary; a wiki only corroborates)
    confidence  clear | judgement   (judgement calls go to the owner's group on SHORT-LIST.md)

Checks: every question answered; every decided answer has evidence and a page; no evidence shares a run of 8 or more
words with the book text for that School (the project's own-words rule, as Phase 6 (Part G) applied it). Writes
SHORT-LIST.md (the judgement calls) and exits 1 if any check fails.
"""
import argparse, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, 'book-worklist.json')
EVIDENCE = os.path.join(HERE, 'book-evidence.json')
DECISIONS = {'keep', 'remove', 'add', 'change', 'unsure'}
PAGE = re.compile(r'^[A-Z][\w ]+? \d? ?p\.\s?\d+$')

def words(text):
    return re.findall(r"[a-z0-9']+", text.lower())

def shared_run(a, b, n=8):
    wa, wb = words(a), words(b)
    grams = {tuple(wb[i:i + n]) for i in range(len(wb) - n + 1)}
    for i in range(len(wa) - n + 1):
        if tuple(wa[i:i + n]) in grams: return ' '.join(wa[i:i + n])
    return None

def template():
    if os.path.exists(EVIDENCE):
        sys.exit('book-evidence.json already exists; not overwritten.')
    work = json.load(open(WORK, encoding='utf-8'))
    out = [{'name': w['name'], 'answers': [{'question': q, 'decision': '', 'to': '', 'evidence': '', 'page': '', 'source': 'book',
             'confidence': ''} for q in w['questions']]} for w in work]
    json.dump(out, open(EVIDENCE, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('Wrote', EVIDENCE, 'with', sum(len(x['answers']) for x in out), 'questions.')

def check(book_text):
    work = {w['name']: w['questions'] for w in json.load(open(WORK, encoding='utf-8'))}
    ev = {e['name']: e for e in json.load(open(EVIDENCE, encoding='utf-8'))}
    problems, short, done = [], [], 0
    for name, questions in work.items():
        entry = ev.get(name)
        if not entry: problems.append('%s: no entry' % name); continue
        answers = {a['question']: a for a in entry['answers']}
        text = ''
        if book_text:
            f = os.path.join(book_text, re.sub(r'[^\w\- ]', '', name).strip() + '.txt')
            if os.path.exists(f): text = open(f, encoding='utf-8').read()
        for q in questions:
            a = answers.get(q)
            if not a or not a.get('decision'): problems.append('%s: unanswered: %s' % (name, q)); continue
            if a['decision'] not in DECISIONS: problems.append('%s: unknown decision %r' % (name, a['decision'])); continue
            if a['decision'] == 'change' and not a.get('to'): problems.append('%s: "change" without "to": %s' % (name, q))
            if a['decision'] != 'unsure':
                if not a.get('evidence'): problems.append('%s: no evidence: %s' % (name, q))
                if not PAGE.match(a.get('page', '').strip()): problems.append('%s: page not as "Book p.N": %r' % (name, a.get('page')))
            if text and a.get('evidence'):
                run = shared_run(a['evidence'], text)
                if run: problems.append('%s: evidence copies the book ("%s ..."): rewrite in our own words' % (name, run))
            if a['decision'] == 'unsure' or a.get('confidence') == 'judgement':
                short.append((name, q, a))
            done += 1
    lines = ['# Short list for the group', '',
             'Judgement calls the evidence could not settle (rating audit, step 5). For each: keep, change or remove, and why.', '']
    for name, q, a in short:
        lines.append('- **%s**: %s %s' % (name, q, ('Evidence so far: ' + a['evidence']) if a.get('evidence') else ''))
    open(os.path.join(HERE, 'SHORT-LIST.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('%d answers checked, %d judgement calls on SHORT-LIST.md, %d problems' % (done, len(short), len(problems)))
    for p in problems[:60]: print('  ', p)
    return 1 if problems else 0

def spot_check(n=10, seed=2026):
    """The owner's spot check: n decided answers from n different Schools, chosen at random, each with its page.
    The owner opens each page and confirms the evidence says what the audit claims. More than one wrong: redo the audit."""
    import random
    ev = json.load(open(EVIDENCE, encoding='utf-8'))
    pool = [(e['name'], a) for e in ev for a in e['answers'] if a.get('decision') in ('keep', 'remove', 'add', 'change') and a.get('page')]
    rng, seen, pick = random.Random(seed), set(), []
    for name, a in rng.sample(pool, len(pool)):
        if name in seen: continue
        seen.add(name); pick.append((name, a))
        if len(pick) == n: break
    lines = ['# Spot check for the owner', '', 'Open each page and tick it if the evidence says what the book says. '
             'If more than one is wrong, the audit is redone before its ratings are used.', '']
    for i, (name, a) in enumerate(pick, 1):
        lines.append('%d. [ ] **%s**, %s: %s (decision: %s%s)' % (i, name, a['page'], a['evidence'], a['decision'], (' to ' + a['to']) if a.get('to') else ''))
    open(os.path.join(HERE, 'SPOT-CHECK.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('Wrote SPOT-CHECK.md with', len(pick), 'items')

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--template', action='store_true')
    ap.add_argument('--spot-check', action='store_true')
    ap.add_argument('--book-text', default='')
    a = ap.parse_args()
    if a.template: template()
    elif a.spot_check: spot_check()
    else: sys.exit(check(a.book_text))
