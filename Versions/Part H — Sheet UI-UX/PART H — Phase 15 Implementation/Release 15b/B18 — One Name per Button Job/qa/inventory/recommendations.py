"""B18 stage 1: Claude's recommendations, one per job group, for the owner to rule on. Read by build_outputs.py.

Each group has: plain (a title in plain words), job, meaning (do the differences carry meaning?), word (the recommended visible
word or pattern), spoken (the recommended spoken-name pattern), keep (True when the recommendation is to leave the labels as
they are), why, alts (other words the owner could pick), changes (a function over a row returning what would change, or None),
extra (places outside the buttons that name the label), pins (labels whose harness pins matter).
These are proposals. Nothing is built until the owner has ruled on each group.
"""
import re


def _lab(r):
    return (r['label'] or '').strip()


def _spk(r):
    return (r['spoken'] or '')


def _g02(r):
    l = _lab(r)
    if l == 'Choose again':
        return 'wizard "Choose again" → "Change"'
    if _spk(r).startswith('Configure'):
        return 'spoken name "Configure …" → "Change {thing}" / "Choose {thing}"'
    if l in ('Change', 'Choose…') and r['reach'] == 'live' and 'Adv' in r['where']:
        return 'give the button a spoken name of its own ("Change {thing}")'
    return None


GROUP_ADVICE = {
    'G01': dict(
        question=True, plain='Giving back a once-per-session use',
        job='Put the uses of one ability back to full at the start of a new game session. The combat round counter has a button of its own that puts the round count back to the start; it is a different thing but the same kind of act.',
        meaning='No. All seven session buttons give uses back for a new session (Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky and the Ancestor card). The one round-counter "Reset" is a different job (it is not about sessions) but also puts a counter back to its start.',
        word='Reset', spoken='Reset {name} for a new session',
        why='It is the word the owner used for Kharmic Tie, it fits the one-row Kharmic Tie card on a phone (the reason for the question), and the card already shows which ability it belongs to. The spoken name still says "for a new session", so nothing is lost for a screen reader. The round counter’s "Reset" then already matches.',
        alts=['Reset session (keep, and rename the round counter to "Reset rounds")', 'New session', 'Refill'],
        changes=lambda r: ('label "Reset session" → "Reset"; spoken name → "Reset {name} for a new session"' if 'reset session' in _lab(r).lower() else ('spoken name → "Reset the round counter" (label stays "Reset")' if r['idAttr'] == 'btnResetRounds' else None)),
        extra=['src/sheet/209.9999999-feat-damage-sessions-xp.js:197 an alert says "Reset session to use it again."',
               'src/sheet/209.9999999999998-bugfix-ancestor-gifts-logic.js:26 a note says "ready again after Reset session on the Ancestor card"',
               'B17’s planned information window for Kharmic Tie ("Reset session gives back all 3")'],
        pins=['Reset session'], a042=True),
    'G02': dict(
        question=True, plain='Opening a choice again',
        job='Open a window or a list again so a choice you already made can be changed (or made, the first time).',
        meaning='Partly. "Choose…" (nothing chosen yet) and "Change" (a choice exists) are the same button that changes its word with its state; that difference means something and should stay. The rest are the same job under other names: "Choose again" in the creation wizard. "Edit" and "Pick" are not button words anywhere on the sheet (the first text scan found code names and a select’s id, not buttons).',
        word='Change', spoken='Change {thing}  (and "Choose {thing}" before a first choice)',
        why='One word for "reopen what I picked". Keep "Choose…" only for the very first choice. The spoken name should start with the word on the button: today nine kinds of Advantage card have a button that says "Change" or "Choose…" but is announced as "Configure {thing}", which does not match what a voice-control user would say.',
        alts=['Edit', 'Choose again', 'Keep as it is'],
        changes=lambda r: _g02(r),
        extra=[], pins=['Change', 'Choose…', 'Choose again', 'Configure '], a042=True),
    'G03': dict(
        question=True, plain='Taking something off the sheet',
        job='Remove an entry (a skill, an Advantage, an item, a weapon, an emphasis) from the character, or erase a saved character or book from this device.',
        meaning='Yes, and it should stay: "Remove" takes an entry off this sheet; "Delete" erases a saved character or a Library book from the device for good. Those are different acts. The visible ✕ is a picture of Remove. The problem is only the spoken name: on the test character {x_instances} ✕ buttons on rows are announced as just "✕" (a few carry a tooltip "Remove", which a screen reader does not use when the button has text).',
        word='Remove (visible ✕ stays)  ·  Delete for saved characters and books', spoken='Remove {entry name}',
        why='Two words for two different acts, kept. Every ✕ on a row gets a spoken name that says what it removes.',
        alts=['Keep the ✕ with no spoken name', 'Delete for everything'],
        changes=lambda r: ('spoken name "✕" → "Remove {entry name}"' if _lab(r) == '✕' and r['group'] == 'G03' else None),
        extra=[], pins=['Remove', 'Delete', '✕']),
    'G04': dict(
        question=True, plain='The ✕ in the corner of a window',
        job='Close a window from its top corner.',
        meaning='Yes. Today the corner ✕ has a tooltip "Close" on 10 windows (dice tray, roll result, skill information, untrained skills, the information windows, spell scrolls, arrows, Void and wound information) and "Cancel" on 4: the roll preview, the choice window behind Choose… and Change, the spell Element picker, and the one shared question-and-message window that every alert and every "i" text uses. That last one says "Cancel" even when it only shows a message (43 of its 75 calls are messages, such as the Kiho rules, Affinity and Weapon Info). A Close/Cancel difference can mean something (Cancel when the window holds a choice not yet kept, Close when it only shows you something); today it does not follow that.',
        word='✕, announced "Close {window}" or "Cancel {window}"', spoken='Close {window name}  (read-only windows)  ·  Cancel {window name}  (windows holding a choice)',
        why='Keep the Close/Cancel difference, apply it by what the window is, and move it from a tooltip into the spoken name (a button with text ✕ is announced as "✕" today; only Quick Access and History say "Close").',
        alts=['Always "Close"', 'Always "Cancel"', 'Keep as it is'],
        changes=lambda r: ('spoken name "✕" → "%s {window name}"' % ('Cancel' if r['title'].startswith('Cancel') else 'Close') if _lab(r) == '✕' and _spk(r) == '✕' else None),
        extra=[], pins=['✕', 'Close', 'Cancel']),
    'G05': dict(
        question=True, plain='The buttons at the foot of a window',
        job='Answer or dismiss a window: leave it, keep what you chose, or acknowledge a message.',
        meaning='Mostly yes. Cancel (discard) and Confirm (keep) mean different things and should stay. "Done" (changes already applied as you go) is different from "Confirm" (applied at the end): keep both. What does not carry meaning is three words for dismissing a plain message: "OK" (38 calls), "Got it" (5) and, in a few windows, "Close". Plain yes buttons also vary: "OK" (6), "Yes" (1), "Confirm" (2). Named actions ("Delete", "Discard it", "Replace", "Leave", …) are good: they say what happens.',
        word='Message: OK  ·  Yes: Confirm (or the action’s own name)  ·  No: Cancel  ·  Done where changes apply as you go', spoken='the same words',
        why='Three plain words cover every window, and the named actions stay. "Got it" → "OK", plain "Yes"/"OK" in a question → "Confirm", plain "No" → "Cancel".',
        alts=['Close for messages', 'Got it for messages', 'Keep as it is'],
        changes=lambda r: ('"Got it" → "OK"' if _lab(r) == 'Got it' else ('plain "Yes" → "Confirm"' if _lab(r) == 'Yes' else ('plain "No" → "Cancel"' if _lab(r) == 'No' and 'no button' in r['where'] else None))),
        extra=[], pins=['Got it', 'OK', 'Confirm', 'Cancel', 'Done', 'Next']),
    'G06': dict(
        question=True, plain='Using an ability now',
        job='Use a once-per-session ability at a moment of the player’s choosing.',
        meaning='No. "Use" (Great Destiny), "Use {precept}" (Dark Paragon) and "Use it now" (an Ancestor’s once-a-session gift) are the same job.',
        word='Use', spoken='Use {ability}: {what it does}',
        why='One verb. Where a card holds one ability the card names it, so "Use" is enough; where a card holds several (Dark Paragon’s precept) the name stays after the verb.',
        alts=['Use it now', 'Keep as it is'],
        changes=lambda r: ('"Use it now" → "Use"' if _lab(r) == 'Use it now' else None),
        extra=[], pins=['Use', 'Use it now']),
    'G07': dict(
        question=True, plain='Spending a Void Point',
        job='Spend one Void Point on an effect.',
        meaning='No. Seven buttons on the Void card already read "Spend Void: …". Lost Love’s button reads "Spend a Void Point".',
        word='Spend Void', spoken='Spend Void: {effect}',
        why='One pattern with the card’s other seven buttons, and shorter on a phone.',
        alts=['Spend a Void Point', 'Keep as it is'],
        changes=lambda r: ('"Spend a Void Point" → "Spend Void"' if _lab(r) == 'Spend a Void Point' else None),
        extra=[], pins=['Spend a Void Point']),
    'G08': dict(
        question=True, plain='Rolling again',
        job='Roll all or part of a roll again.',
        meaning='In part. The source named in the button (Luck, Kakita, Dark Paragon, an Emphasis) tells the player whose rule applies, which is useful. "GM invokes Unlucky" is not a choice the player makes, so it should read differently. But the spelling splits: "Re-roll" (Emphasis, Kakita) and "Reroll" (Dark Paragon, and the Luck and Unlucky tooltips), and Luck says "Spend Luck" while the others say "with".',
        word='Reroll with {source}', spoken='Reroll with {source}: {what it does}',
        why='One spelling and one pattern for the rerolls a player chooses; keep "GM invokes Unlucky" and "Add Sun Tao’s die" (an added die, not a reroll) as they are.',
        alts=['Re-roll (with the hyphen)', 'Keep as it is'],
        changes=lambda r: ('label → "%s"' % (re.sub(r'^Re-roll', 'Reroll', _lab(r)) if _lab(r).startswith('Re-roll') else _lab(r)) if _lab(r).startswith('Re-roll') else ('"Spend Luck (n/m)" → "Reroll with Luck (n/m)"' if _lab(r).startswith('Spend Luck') else ('"Spend Toku’s Luck" → "Reroll with Toku’s Luck"' if _lab(r).startswith('Spend Toku') else None))),
        extra=[], pins=['Re-roll 1s', 'Spend Luck', 'GM invokes Unlucky']),
    'G09': dict(
        question=True, plain='Clearing what you entered',
        job='Empty the dice you built, or the filters you set.',
        meaning='No difference to resolve. "Clear" (dice tray, two panels) and "Clear filters" (Search) are one word plus its object.',
        word='Clear', spoken='Clear {what}  (Clear the dice, Clear filters)', keep=True,
        why='Already one word. Only the spoken name of the dice tray’s two Clear buttons should say what they clear.',
        alts=['Reset', 'Change the word'],
        changes=lambda r: ('spoken name → "Clear the dice"' if _lab(r) == 'Clear' else None), extra=[], pins=['Clear', 'Clear filters']),
    'G10': dict(
        question=True, plain='Adding something',
        job='Add an entry to a list on the sheet.',
        meaning='Mostly no. "+ Add {thing}" is the common pattern (Skill, Advantage, Disadvantage, Technique, Item, Spell Scroll, Arrows, Weapon, School). Three buttons drift: "+ Emph" (an abbreviation), "+Book" (no space) and the Library’s "Add book". "Create New Character" starts the whole wizard and should keep its own word. "Add 1.5 koku" adds money, a different act.',
        word='+ Add {thing}', spoken='Add {thing}',
        why='Fix the three that drift: "+ Emph" → "+ Add Emphasis", "+Book" → "+ Add Book". The two "Add court" buttons (one with a "+", one without) look like one job built twice.',
        alts=['Keep as it is'],
        changes=lambda r: ('"+ Emph" → "+ Add Emphasis"' if _lab(r) == '+ Emph' else ('"+Book" → "+ Add Book"' if _lab(r) == '+Book' else ('"Add court" and "+ Add court": one job, two buttons' if _lab(r) in ('Add court', '+ Add court') else None))),
        extra=[], pins=['+ Emph', '+Book', '+ Add', '+ Add Skill', 'Add court']),
    'G11': dict(
        question=True, plain='Rolling the dice',
        job='Make a roll.',
        meaning='Yes. "Roll" (dice, attacks, preview), "Cast" (spells) and "Check" (rule checks) mean different things and should stay. Wording of the Disadvantage check buttons is already settled by B01.',
        word='Roll / Cast / Check (as they are)', spoken='Roll {what} · Cast {spell} · Check {what}', keep=True,
        why='One odd one: Touch of the Void’s button is only "Willpower (TN 30)". As a check it would read "Check (TN 30)", like the others. All other roll buttons are named for what they roll.',
        alts=['Keep every roll button as it is'],
        changes=lambda r: ('"Willpower (TN 30)" → "Check (TN 30)"' if _lab(r).startswith('Willpower (TN') else None), extra=[], pins=['Roll', 'Cast', 'Check']),
    'G12': dict(
        question=True, plain='The information buttons',
        job='Open an explanation.',
        meaning='Mostly no. The glyph is "i" on most (A04’s ring), but "ⓘ" on the Combat cards, "👁" on weapon and skill info, and a badge with "ⓘ" in its text. The spoken names split three ways: "{thing} information" (most), "Explain: {thing}" (Advantage cards) and "About Ancestors". "?" on a spell asks a different question ("Why can’t I cast this?") and should stay.',
        word='i', spoken='{Thing} information',
        why='"{thing} information" is already the most used pattern and is pinned by many harnesses; moving the others to it is the smallest change.',
        alts=['Explain: {thing}', 'Keep as it is'],
        changes=lambda r: ('spoken name "Explain: {thing}" → "{thing} information"' if _spk(r).startswith('Explain') else ('glyph "ⓘ" / "👁" → "i", spoken name → "{thing} information"' if _lab(r) in ('ⓘ', '👁') else ('spoken name "About Ancestors" → "Ancestors information"' if _spk(r) == 'About Ancestors' else None))),
        extra=[], pins=['ⓘ', '👁', 'About Ancestors', 'information', 'Skill Info', 'Weapon Info'], a042=True),
    'G13': dict(question=False, plain='Undo', job='Take back the last spend or tap.', meaning='No difference to resolve: "Undo" on the Void spend line and on the Honour/Glory/Status/Taint cards.', word='Undo', spoken='Undo the last {thing}', keep=True, why='Already one word.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G14': dict(
        question=True, plain='Plus and minus buttons',
        job='Add or take away one.',
        meaning='The glyphs (− +) agree everywhere. The spoken verbs do not: Add/Subtract (Honour, Glory, Status, Taint points), Increase/Decrease (wounds), One more/One fewer (arrows), Gain/Lose (older point steppers), Raise/Lower (older Rank steppers), and two steppers in Rings & Traits with no spoken name at all. The Unlucky pair ("Record an Unlucky use the GM forced" / "Give back an Unlucky use") means something else and should stay.',
        word='−  +  (the glyphs stay)', spoken='Increase {thing} / Decrease {thing}',
        why='One verb pair for every counter. Also the two Rings & Traits steppers need a spoken name.',
        alts=['Add / Subtract', 'Keep as it is'],
        changes=lambda r: (None if 'Unlucky' in _spk(r) else ('give a spoken name (today none)' if _lab(r) in ('−', '+') and _spk(r) in ('−', '+') else ('spoken verb → Increase / Decrease' if _lab(r) in ('−', '+') else None))),
        extra=[], pins=['Add Honour points', 'Subtract', 'One fewer', 'One more', 'Decrease wounds', 'Increase wounds']),
    'G15': dict(question=False, plain='Moving around the sheet', job='Go to another page, tab, step or list page.', meaning='Names of places, not actions; they carry meaning and are not in conflict. "Characters" appears as an app-bar item, as a screen tab and as an older hidden toolbar button.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G16': dict(
        question=True, plain='Saving, copying and exporting',
        job='Save the character, copy it, print it, or hand it over as a file.',
        meaning='The words differ because the acts differ (Save, Save As a copy, Print, Export, Import, History). The one pattern slip is "Export JSON" next to "Export to PDF".',
        word='Export PDF  (and "Export JSON" as it is)', spoken='Export {format}',
        why='Drop the "to" so the two read as a pair.',
        alts=['Export to JSON', 'Keep as it is'],
        changes=lambda r: ('"Export to PDF" → "Export PDF"' if _lab(r) == 'Export to PDF' else None), extra=[], pins=['Export to PDF', 'Export JSON']),
    'G17': dict(question=False, plain='Applying a choice to the sheet', job='Apply the Clan, Family or School, a campaign setting, a Rank.', meaning='Different acts (Apply Family, Apply School, Apply, Set, Set Rank, Begin training, Resume). No pair does the same job.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G18': dict(question=False, plain='Switching between Play and Manage', job='Switch mode.', meaning='"Manage" and "Done" are one toggle. The word "Done" is also used for finishing a window; both mean "I am finished here", so no change is proposed.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G19': dict(question=False, plain='Choosing one thing from a list', job='Pick a skill, a Ring, a search result, a stance, a die, a book.', meaning='The label is the thing’s own name; there is no verb to unify.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G20': dict(question=False, plain='Ticks in the roll preview', job='Tick an option for this roll.', meaning='Rows with a check box, named by the option.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G21': dict(question=False, plain='Pips you tap', job='Spend or give back one pip (Void, spell slots).', meaning='No visible word. The spoken name comes from a tooltip ("Filled — click to spend this Void Point") that says "click", which is not the verb on a touch screen.', word='(as they are)', spoken='(as they are)', keep=True, why='Mentioned for the stage 2 build only.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G22': dict(question=False, plain='Headings that open and close', job='Open or close a section.', meaning='Named by the section.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
    'G23': dict(question=False, plain='One-off actions', job='Actions that exist once (Next Round, Set score, Chapters, Show more, and so on).', meaning='Each has a name of its own and no twin.', word='(as they are)', spoken='(as they are)', keep=True, why='Nothing to unify.', alts=[], changes=lambda r: None, extra=[], pins=[]),
}
