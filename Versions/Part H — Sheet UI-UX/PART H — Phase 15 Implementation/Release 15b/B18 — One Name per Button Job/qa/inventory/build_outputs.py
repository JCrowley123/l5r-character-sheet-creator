#!/usr/bin/env python3
"""B18 stage 1: writes INVENTORY.md and inventory.json from the merged table, the harness pins and the recommendations.

Usage:
  python build_outputs.py pin-groups <table.json> <groups.json>        labels to search the harnesses for
  python build_outputs.py write <table.json> <pins.json> <raw.json> <out folder>
"""
import importlib.util, json, os, re, sys
from collections import defaultdict, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


R = load('recommendations')
J = load('jobs')
GLYPHS = {'\u2715', '\u2212', '+', '\u24d8', '\u24be', '\U0001f441', '?', 'i', '\u203a', '\u2039', '\u22ef', '(icon)'}


def pin_groups(table_path, out):
    t = json.load(open(table_path, encoding='utf-8'))
    labels = set()
    for r in t['rows']:
        l = r['label']
        if l and not re.search(r'[{}]|^\(', l) and (len(l) >= 2 or l == '\u2715'):
            labels.add(l)
    for g in R.GROUP_ADVICE.values():
        labels.update(g['pins'])
    labels.update(['Export to PDF', 'Subtract', 'One fewer', 'One more', 'Add Honour points', 'Decrease wounds', 'Increase wounds', 'Configure ', 'Explain: '])
    json.dump({'all': sorted(labels)}, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False)
    print('labels to search', len(labels))


def srcs(r, n=2):
    return ', '.join('%s:%d' % (s['file'], s['line']) for s in r['source'][:n]) or '(not found)'


def esc(s):
    return (s or '').replace('|', '\\|').replace('\n', ' ')


def main(table_path, pins_path, raw_path, outdir):
    t = json.load(open(table_path, encoding='utf-8'))
    pins_doc = json.load(open(pins_path, encoding='utf-8'))
    pins = pins_doc['groups']['all']
    rows = t['rows']
    by = defaultdict(list)
    for r in rows:
        by[r['group']].append(r)
    x_inst = sum(r['instances'] or 0 for r in rows if r['label'] == '\u2715' and r['group'] == 'G03' and r['reach'] == 'live' and r['spoken'] == '\u2715')

    # ---- per-row "would change", and per-group tables
    for r in rows:
        adv = R.GROUP_ADVICE[r['group']]
        r['wouldChange'] = adv['changes'](r) or ''

    # ---- findings beyond naming
    glyph_named = [r for r in rows if r['reach'] == 'live' and r['spoken'] in GLYPHS and not r['aria']]
    mismatch = [r for r in rows if r['reach'] == 'live' and r['label'] and re.search(r'[A-Za-z]{3}', r['label']) and r['aria']
                and r['label'].lower().rstrip('\u2026') not in r['aria'].lower() and not r['label'].startswith('{') and not r['label'].startswith('(') and r['kind'] != 'summary']
    pins_for = lambda lab: pins.get(lab) or {'files': 0, 'copies': 0, 'by_name': {}}

    # ---- A04.2: the order of controls on each Advantage / Disadvantage card (laptop, Manage and Play)
    raw = json.load(open(raw_path, encoding='utf-8'))
    seq = defaultdict(lambda: defaultdict(list))
    for rec in raw['records']:
        if rec['state'] == 'tab' and rec['device'] == 'laptop' and rec['page'] in ('Adv & Disadv', 'Clan & School') and rec['card']:
            if rec['page'] == 'Clan & School' and 'anc48Card' not in rec['card']:
                continue
            if rec['label'].startswith('+ Add') or rec['label'].startswith('+ Load'):
                continue
            name = rec['card'].split(': ', 1)[-1] or 'Ancestor card'
            lab = rec['label'] if rec['label'] and rec['label'] != '\u2715' else ('i' if 'info' in rec['cls'] else rec['label'] or '?')
            if lab == '\u2715':
                continue
            seq[(rec['page'], name)][rec['mode']].append(lab[:30])
    verdict = {
        'Wealthy': 'meets it (with "Choose\u2026" for "Change")', 'Kharmic Tie': 'no today: two i buttons and Reset session between; B17 (approved) brings Change and one i onto the badge\u2019s row',
        'Zakyo Toshi Citizen': 'meets the front of it (Choose\u2026, i), then two koku buttons', 'Luck': 'partly: the i comes after Reset session',
        'Dark Paragon': 'partly: Change then i, then Reset session', 'Great Destiny': 'not applicable: no Change, no i', 'Lord Moon\u2019s Curse': 'no: Change, no i',
        'Seven Fortunes\u2019 Curse': 'meets it (Change, one i)', 'Haunted': 'not applicable: Reset session only', 'Unlucky': 'no: Change, a \u2212 and a +, Reset session, no i',
        'Ancestor card': 'partly: Reset session and the favour badge on the card; its i is on the section heading'}

    # ---------------- inventory.json
    groups_out = []
    for gid in sorted(by):
        a = R.GROUP_ADVICE[gid]
        pl = []
        for lab in a['pins']:
            p = pins_for(lab)
            pl.append({'label': lab, 'harness_files': p['files'], 'copies': p['copies'], 'examples': list(p['by_name'].items())[:6]})
        groups_out.append({'id': gid, 'plain': a['plain'], 'job': a['job'], 'asks_owner': a['question'], 'recommended_word': a['word'], 'recommended_spoken': a['spoken'],
                           'keep_as_is': bool(a.get('keep')), 'differences_carry_meaning': a['meaning'], 'why': a['why'].replace('{x_instances}', str(x_inst)),
                           'other_words_offered': a['alts'], 'controls': len(by[gid]),
                           'places_that_would_change': [r['id'] for r in by[gid] if r['wouldChange']], 'other_places': a['extra'], 'harness_pins': pl})
    ctl = []
    for r in rows:
        d = {k: r[k] for k in ('id', 'group', 'job', 'label', 'labelExamples', 'kind', 'idAttr', 'cls', 'aria', 'title', 'spoken', 'where_kind', 'where', 'mode', 'devices',
                               'sizes', 'instances', 'cards', 'reach', 'note', 'wouldChange') if k in r}
        d['spoken_src'] = r['spokenSrc']
        d['source'] = ['%s:%d' % (s['file'], s['line']) for s in r['source']]
        ctl.append(d)
    meta = {'unit': 'B18 \u2014 One Name per Button Job, stage 1 (inventory, read-only)', 'build_sha256': t['source_sha256'], 'captured_utc': t['captured_utc'],
            'controls': len(rows), 'live': sum(1 for r in rows if r['reach'] == 'live'), 'source_only': sum(1 for r in rows if r['reach'] == 'source only'),
            'hidden_in_page': sum(1 for r in rows if r['reach'] == 'hidden in the page'), 'groups': len(by), 'groups_with_a_question': sum(1 for g in R.GROUP_ADVICE.values() if g['question']),
            'raw_control_reads': t['raw_records'], 'windows_and_pages_read': sorted(set(s['title'] for s in t['scenarios'])),
            'source_paths_are_relative_to': 'Versions/Part F \u2014 Cross-Platform Delivery/PART F \u2014 Phase 0 Source Reorganization for Maintainability/src/'}
    json.dump({'meta': meta, 'groups': groups_out, 'controls': ctl}, open(os.path.join(outdir, 'inventory.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)

    # ---------------- INVENTORY.md
    L = []
    w = L.append
    w('# B18 \u00b7 One Name per Button Job \u2014 stage 1: the inventory')
    w('')
    w('Prepared by Claude on **21 November 2026**. Read-only: no application file was edited and nothing was pushed to `main`. Build `921f3ac9\u20266150` (17,718,601 bytes), the live Release 15a sheet. Stage 2 is the owner\u2019s ruling on each group; stage 3 is the build, a group of its own. The table of every control is [inventory.json](inventory.json); how it was made is in [REPRODUCTION.md](REPRODUCTION.md).')
    w('')
    w('The owner\u2019s words that started this unit (20 November 2026, verbatim):')
    w('')
    w('> I approve round 3.  But I think we need to make a note that again phase 15 was meant to be a UI/UX consistency pass.')
    w('>')
    w('> If in one place I use the phrase reset and in another I have reset session.  I feel that an additional unit is needed to check the whole sheet to see if there are other buttons that do similar jobs but should maybe have one consistent naming convention.')
    w('')
    w('The owner approved the three-stage plan ("Approve as proposed"). B17 builds with "Reset session" until the owner rules on group G01.')
    w('')
    w('## 1. The result in one table')
    w('')
    m = meta
    w('**%d controls** in **%d job groups** (%d of them put to the owner as a question; the rest need no ruling). %d were read live on the test character, %d from the source because the live test could not reach them (%d of those are the button words of the sheet\u2019s one question window and one message window), and %d exist in the page but are never shown.' % (
        m['controls'], m['groups'], m['groups_with_a_question'], m['live'], m['source_only'], sum(1 for r in rows if r['where'].startswith('Question or message')), m['hidden_in_page']))
    w('')
    w('| Group | Job in plain words | Controls | Words today | Recommended | Asked |')
    w('|---|---|---|---|---|---|')
    for gid in sorted(by):
        a = R.GROUP_ADVICE[gid]
        words = OrderedDict()
        for r in by[gid]:
            if r['label'] and not r['label'].startswith('{') and r['label'] not in words:
                words[r['label']] = 1
        wtxt = ', '.join('\u201c%s\u201d' % x for x in list(words)[:7]) + (' \u2026' if len(words) > 7 else '')
        w('| %s | %s | %d | %s | %s | %s |' % (gid, esc(a['plain']), len(by[gid]), esc(wtxt), esc(a['word']), 'yes' if a['question'] else 'no'))
    w('')
    w('## 2. Method')
    w('')
    w('- **Character:** A03\u2019s dense test character (`dense`), plus a Kharmic Tie (Rank 3, Aiko, 2 of 3 left), Luck, Dark Paragon, Great Destiny, an Ancestor (Kuni, once-a-session gift spent), and, on the Disadvantage side, Haunted and Unlucky. A second run of the same character as an Imperial with the Seppun Ancestor showed the Ancestor card\u2019s \u201cUse it now\u201d.')
    w('- **Sizes and modes:** a phone (390\u00d7844, touch, scale 2) and a laptop (1440\u00d71000), each in Manage and in Play. Every carousel tab was read with its disclosures opened; then each window and page below was opened in turn and read.')
    w('- **What counts as a control:** `button`, `summary`, links, `role=button`, and any element with a pointer cursor that is not a form field (chips, rows with a tick, the Ring names). For each: the visible label (as written in the source; most are drawn in capitals by the style sheet), its spoken name (aria-labelledby, then aria-label, then its content, then its title, which is what a screen reader uses), its title, where it is, the modes and sizes where it showed, and the source file and line.')
    w('- **Windows and pages opened:** %s.' % '; '.join(sorted(set(s['title'] for s in t['scenarios']))))
    w('- **Three kinds of row.** *Live* rows were read in the page. *Source only* rows are controls the test character could not bring up (Library reader, the wizard\u2019s later screens, Ancestor after-roll gifts, the PDF window, Darling of the Court, \u2026); each was found by a scan of the source and read by hand (`qa/inventory/static_extra.py`). The button words of the question and message windows come from reading every call of `appConfirm`, `appConfirm3Way` and `appAlert` (`dialog_labels.py`): %d calls, %d different words. *Hidden* rows are in the page but never shown to a player (the older toolbar, the Rank settings steppers).' % (sum(r['instances'] or 0 for r in rows if r['where'].startswith('Question or message') and ('no button' not in r['where'])), sum(1 for r in rows if r['where'].startswith('Question or message'))))
    w('- **Labels built at runtime** (a name joined to a word, a word passed to a helper) are why a text search is not enough; the live read and the call reader fill the gap, and the source column points to where the word is made.')
    w('- **Source lines** are under `Versions/Part F \u2014 Cross-Platform Delivery/PART F \u2014 Phase 0 Source Reorganization for Maintainability/src/`. A row can carry more than one place when one label is written in several files.')
    w('- **Harness pins:** every script (`.js .cjs .mjs .py`) in a `qa/` folder under `Versions/`, and every checks file (%d files), was searched for each label as a quoted string, as a word in a regular expression, or in a Playwright text selector (two words or more also as plain text). Short words (Use, Add, Done, Close) over-match, so the counts are an upper bound and each hit must be read at build time. The B18 scripts and the Release 15b mock-up scripts were excluded.' % pins_doc['harness_files_searched'])
    w('')
    w('### What the live read could not reach')
    w('')
    w('- The Library reader and book manager need the owner\u2019s book files; their buttons are source-only rows.')
    w('- The creation wizard was read on its first screen only; its later screens are source-only rows.')
    w('- Pressing the "+ Add \u2026" buttons adds a blank row (its controls are in the page read) and removing an entry removes it at once, so neither opens a window.')
    w('- Result-window buttons that appear only after a matching roll (Dark Paragon\u2019s reroll, the Ancestor gifts of Kakita, Sun Tao and Toku) are source-only rows.')
    w('- The Void spend Undo line and the Honour tap Undo line are hidden until used; they are in the Undo group from the source.')
    w('- A few windows (Roll preview with a Void option ticked, Cast with every Element) were opened once; the buttons are the same.')
    w('')
    w('## 3. The groups')
    for gid in sorted(by):
        a = R.GROUP_ADVICE[gid]
        w('')
        w('### %s \u00b7 %s' % (gid, a['plain']))
        w('')
        w('- **Job:** %s' % a['job'])
        w('- **Controls:** %d.' % len(by[gid]))
        w('- **Do the differences carry meaning?** %s' % a['meaning'])
        if gid in ('G19', 'G20', 'G21', 'G22', 'G23', 'G15', 'G17', 'G13', 'G18'):
            lab = OrderedDict()
            for r in by[gid]:
                lab.setdefault(r['label'] or '(no text)', 0)
                lab[r['label'] or '(no text)'] += 1
            w('- **Recommended:** leave as they are. Words: %s.' % ', '.join('\u201c%s\u201d' % x for x in list(lab)[:40]))
            w('- All controls of this group are in [inventory.json](inventory.json) (group `%s`).' % gid)
            continue
        w('- **Recommended word:** %s.  **Spoken name:** %s.%s' % (a['word'], a['spoken'], '  (Keep as it is.)' if a.get('keep') else ''))
        w('- **Why:** %s' % a['why'].replace('{x_instances}', str(x_inst)))
        if a['alts']:
            w('- **Other choices for the owner:** %s.' % '; '.join(a['alts']))
        w('')
        w('| ID | Label | Spoken name | Where | Mode | Source | Would change |')
        w('|---|---|---|---|---|---|---|')
        for r in by[gid]:
            sp = r['spoken'] if r['spoken'] != r['label'] else '(same)'
            lab = r['label'] if r['label'] else '(no text)'
            if lab == '10' and 'dice' in r['cls']:
                lab = '(the d10 icon)'
            if r['instances'] and r['instances'] > 1 and r['reach'] == 'live':
                lab += ' \u00d7%d' % r['instances']
            w('| %s | %s | %s | %s | %s | %s | %s |' % (r['id'], esc(lab[:60]), esc(sp[:70]), esc(r['where'][:46]), esc(r['mode']), esc(srcs(r)), esc(r['wouldChange'])))
        chg = [r for r in by[gid] if r['wouldChange']]
        w('')
        w('**Places that would change:** %s' % (('%d controls above (the "Would change" column)' % len(chg)) if chg else 'none'))
        for e in a['extra']:
            w('- also: %s' % e)
        if a['pins']:
            w('')
            w('**Harnesses that pin today\u2019s words** (files; copies carried by older releases):')
            for lab in a['pins']:
                p = pins_for(lab)
                ex = ', '.join('%s\u00d7%d' % (k, v['copies']) for k, v in list(p['by_name'].items())[:8])
                w('- \u201c%s\u201d: %d files, %d copies. %s' % (lab, p['files'], p['copies'], ex))
        if a.get('a042'):
            w('')
            w('**A04.2:** rows in this group sit on cards that A04.2 will redraw; see section 4. The owner ruled that the Reset rows are scheduled with A04.2.')
    w('')
    w('## 4. Which rows meet the parked A04.2 pattern')
    w('')
    w('A04.2\u2019s pattern is **a badge on the left, then Change, then one i**. Below is the order of the buttons on each Advantage and Disadvantage card today (laptop; the \u2715 left out). Play hides Change, so the same card is shorter there.')
    w('')
    w('| Card | Manage | Play | Meets the pattern? |')
    w('|---|---|---|---|')
    for (page, name), v in seq.items():
        if not any(re.search(r'Reset|Use|Change|Choose|^i$|Check|Spend', x) for x in v.get('management', []) + v.get('play', [])):
            continue
        w('| %s%s | %s | %s | %s |' % (esc(name), ' (Clan & School)' if page == 'Clan & School' else '', esc(' \u00b7 '.join(v.get('management', [])) or '\u2014'), esc(' \u00b7 '.join(v.get('play', [])) or '\u2014'), esc(verdict.get(name, 'not applicable: checks, not a Change card'))))
    w('')
    w('Reset-session rows that would move with A04.2: Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky and the Ancestor card. The rows that already meet the pattern (Wealthy, Seven Fortunes\u2019 Curse, the front of Zakyo Toshi Citizen) do not change under A04.2.')
    w('')
    w('## 5. Findings beyond the words')
    w('')
    w('These are about the spoken name rather than the visible word. They are not decided here; they are inputs to the rulings above.')
    w('')
    w('- **%d live controls are announced as a bare glyph** (no aria-label): %s.' % (len(glyph_named), '; '.join(sorted(set('%s on %s' % (r['label'] or r['spoken'], r['where'][:22]) for r in glyph_named))[:14])))
    w('- **%d live controls have a spoken name that does not contain their visible word** (a voice-control user who says what they see will not reach them): %s.' % (len(mismatch), '; '.join(sorted(set('\u201c%s\u201d is announced \u201c%s\u201d' % (r['label'][:20], r['aria'][:36]) for r in mismatch))[:10])))
    w('- **Tooltips do not become names.** When a button has text or a glyph its `title` is not what a screen reader says. Windows\u2019 corner \u2715 buttons (Close/Cancel) and the \u2715 on skill and weapon rows (Remove) are announced as \u201c\u2715\u201d.')
    w('- **"Click"** appears in the spoken names of the pips ("Filled \u2014 click to spend this Void Point"), which is not the verb on a touch screen.')
    w('- **Older controls still in the page:** the first toolbar\u2019s Load, New Blank, Delete, Import JSON and Characters buttons, and the Rank settings steppers, exist in the page and are never shown. They carry words of their own (e.g. "New Blank", "Load"); removing them is not part of B18, but a rename would have to decide about them.')
    lap = sorted(set(r['label'][:24] for r in rows if r['reach'] == 'live' and r['devices'] == ['laptop'] and r['label']))
    pho = sorted(set(r['label'][:24] for r in rows if r['reach'] == 'live' and r['devices'] == ['phone'] and r['label']))
    w('- **Seen on one size only** (live rows): laptop only: %s; phone only: %s. (Most of these are state, such as a window opened on one size, not a different control.)' % (', '.join(lap[:12]) or 'none', ', '.join(pho[:12]) or 'none'))
    w('- **"Add court" is built twice**, once with a "+" and once without (Darling of the Court and the court badges).')
    w('')
    w('## 6. The owner\u2019s answers')
    w('')
    ans_path = os.path.join(outdir, 'owner-answers.json')
    if os.path.exists(ans_path):
        A = json.load(open(ans_path, encoding='utf-8'))
        w('Given by the owner on the ruling page, **24 November 2026** (22:54 to 23:01 UTC), read from the page’s store (`%s`). Every word below that is in quotation marks is the owner’s, verbatim; the "Word" column is the page’s own text for the option chosen.' % A['source'])
        w('')
        w('| Group | Question | Answer | Word | Owner’s note, verbatim |')
        w('|---|---|---|---|---|')
        for a in A['answers']:
            ch = {'suggest': 'Use my suggestion', 'keep': 'Keep as it is', 'other': 'Another word: ' + a['other']}[a['choice']]
            w('| %s | %s | %s | %s | %s |' % (a['id'], esc(a['title']), ch, esc(a['word']), esc('“%s”' % a['note']) if a['note'] else ''))
        w('')
        w('And the note on the card for the groups left alone, verbatim:')
        w('')
        w('> %s' % A['rest_note'])
        w('')
        w('Read as:')
        w('')
        w('- **All 14 questions: "Use my suggestion".** The recommended words in section 3 are the owner’s rulings for G01, G02, G03, G04, G05, G06, G07, G08, G09, G10, G11, G12, G14 and G16. G09 (Clear) and G11 (Roll/Cast/Check) are rulings to keep what is there, with the single change in G11 (Touch of the Void’s "Willpower (TN 30)" becomes "Check (TN 30)").')
        w('- **G01 settles B17’s word:** "Reset". B17 is live with "Reset session", so the build will change the Kharmic Tie row too (round 3 measured that a short name’s row is then one line on a phone in Manage).')
        w('- **G03 is not cleared to build.** The owner chose the suggestion but is unsure of it and wants a mock-up that compares how it is now with how it will be before it is built.')
        w('- **A rule for the whole unit:** before anything is changed or built, the owner wants a mock-up that compares how it is now with how it will look after the change. Stage 3 therefore starts with a mock-up board (today beside the proposal, phone and laptop), as the 15b process already requires, and builds only what the owner approves on it.')
        w('- **The nine groups left alone** (Undo, Moving around, Applying, Manage and Done, Choosing from a list, Ticks, Pips, Headings, One-off actions): no objection was made, so they stay as they are.')
        w('- **Order:** B18’s place in 15b is to be set; its Reset rows are scheduled with the parked A04.2.')
    w('')
    w('## 7. Usage')
    w('')
    w('Weekly meter (all models, account-wide): **42%** at the start of stage 1 and **54%** at the end, so stage 1 took about **12 points**. The five-hour meter went from 9% to 95% over the same work. The weekly meter resets at 01:00 UTC on 25 November. Recording the owner’s answers on 24 November took under one point; the account reading then was 93% weekly (other sessions had used the rest) and 24% five-hour.')
    w('')
    open(os.path.join(outdir, 'INVENTORY.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(L))
    print('INVENTORY.md lines', len(L), ' glyph-named', len(glyph_named), ' mismatch', len(mismatch), ' x_inst', x_inst)


if __name__ == '__main__':
    if sys.argv[1] == 'pin-groups':
        pin_groups(sys.argv[2], sys.argv[3])
    else:
        main(*sys.argv[2:6])
