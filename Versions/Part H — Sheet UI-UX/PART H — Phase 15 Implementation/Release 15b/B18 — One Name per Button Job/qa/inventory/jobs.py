"""B18 stage 1: which job each control does. Ordered rules, first match wins. Read by merge.py.

A job is what the button does for the player, in plain words, not what it is called. The groups are the jobs that more
than one label (or more than one spoken-name pattern) is used for, plus the groups that are one word everywhere.
"""
import re

# group id -> (short name for the table, plain-words title)
GROUPS = {
    'G01': ('Giving back once-per-session uses', 'Giving back a once-per-session use'),
    'G02': ('Reopening a choice', 'Reopening a choice you already made'),
    'G03': ('Taking an entry off the sheet', 'Taking something off the sheet'),
    'G04': ('The corner ✕ of a window', 'The ✕ in the corner of a window'),
    'G05': ('Window footers', 'The buttons at the foot of a window'),
    'G06': ('Using an ability now', 'Using a once-per-session ability now'),
    'G07': ('Spending a Void Point', 'Spending a Void Point'),
    'G08': ('Rerolling', 'Rolling again'),
    'G09': ('Clearing', 'Clearing what you entered'),
    'G10': ('Adding', 'Adding something'),
    'G11': ('Rolling and checking', 'Rolling the dice'),
    'G12': ('Information', 'The information buttons'),
    'G13': ('Undo', 'Undo'),
    'G14': ('Plus and minus', 'Plus and minus buttons'),
    'G15': ('Moving around', 'Moving around the sheet'),
    'G16': ('Saving and exporting', 'Saving, copying and exporting'),
    'G17': ('Applying to the sheet', 'Applying a choice to the sheet'),
    'G18': ('Manage and Done', 'Switching between Play and Manage'),
    'G19': ('Choosing from a list', 'Choosing one thing from a list'),
    'G20': ('Ticks in the roll preview', 'Ticks in the roll preview'),
    'G21': ('Pips', 'Pips you tap to spend or give back'),
    'G22': ('Disclosures', 'Headings that open and close'),
    'G23': ('Other', 'Everything else'),
}

JOB_OF_GROUP = {
    'G01': 'Give back this entry’s uses for a new session', 'G02': 'Open a choice again', 'G03': 'Take something away',
    'G04': 'Close the window', 'G05': 'Finish or leave a window', 'G06': 'Use a once-per-session ability now', 'G07': 'Spend a Void Point',
    'G08': 'Roll again', 'G09': 'Empty what was entered', 'G10': 'Add an entry', 'G11': 'Make a roll', 'G12': 'Open an explanation',
    'G13': 'Take back the last spend or tap', 'G14': 'Add or take away one', 'G15': 'Go to another page', 'G16': 'Save, copy or hand over the character',
    'G17': 'Apply a choice to the sheet', 'G18': 'Switch between Play and Manage', 'G19': 'Choose one thing', 'G20': 'Tick an option for this roll',
    'G21': 'Spend or give back one pip', 'G22': 'Open or close a section', 'G23': 'A one-off action',
}

NAV_IDS = re.compile(r'^(car-tab-\d+|carPrev|carNext|scrollTopBtn)$')


def classify(row):
    lab = (row['label'] or '').strip()
    low = lab.lower()
    sp = (row['spoken'] or '').lower()
    cls = row['cls']
    idat = row['idAttr']
    wk = row['where_kind']
    kind = row['kind']

    def out(g, job):
        return {'group': g, 'job': job, 'groupName': GROUPS[g][0]}

    ttl = (row['title'] or '').lower()
    if kind == 'clickable' and 'roll' in ttl and ('click to make' in ttl or 'ring-name' in cls):
        return out('G11', 'Make a roll (the Ring or Trait name)')
    if 'ring-name' in cls:
        return out('G11', 'Make a roll (the Ring or Trait name)')
    if 'other-die' in cls or 'dice-picker' in cls or idat in ('dicePickRolled', 'dicePickKept', 'dicePickKeptMinus', 'otherDiceRoll', 'otherDiceClear'):
        return out('G11', 'Put together a manual roll')
    if 'reset session' in low:
        return out('G01', 'Give back this entry’s uses for a new session')
    if idat == 'btnResetRounds' or (low == 'reset' and 'round' in sp):
        return out('G01', 'Restart the combat round counter (a different job)')
    if idat == 'pm12Toggle':
        return out('G18', 'Switch between Play and Manage')
    if 'adv-config-info' in cls or 'sk-info-btn' in cls or re.search(r'(^|[.-])info(-btn)?($|\.)', cls) or low in ('i', 'ⓘ', 'ⓘ', 'ⓘ', 'Ⓘ', '\U0001f441', '?') or 'information' in sp and len(lab) <= 3:
        return out('G12', 'Open an explanation')
    if 'badge' in cls and 'ⓘ' in lab:
        return out('G12', 'Open an explanation (a badge)')
    if low == 'undo' or 'undo' in cls:
        return out('G13', 'Take back the last spend or tap')
    if kind == 'summary':
        return out('G22', 'Open or close a section')
    if re.match(r'^(change|choose|pick|edit)\b', low) or low in ('choose school skills', 'choose school scrolls'):
        return out('G02', 'Open a choice again')
    if low in ('apply family (+1 trait)', 'apply school', 'apply') or low.startswith('apply '):
        return out('G17', 'Apply the Clan, Family or School to the sheet')
    if low.startswith('spend void') or low == 'spend a void point':
        return out('G07', 'Spend a Void Point')
    if low.startswith('spend luck') or low.startswith('gm invokes unlucky') or low.startswith('reroll') or low.startswith('re-roll'):
        return out('G08', 'Roll again')
    if low in ('use', 'use it', 'use it now') or low.startswith('use '):
        return out('G06', 'Use a once-per-session ability now')
    if low.startswith('clear') or low.startswith('reset filter'):
        return out('G09', 'Empty what was entered')
    if low == 'delete' or low.startswith('delete ') or low.startswith('remove'):
        return out('G03', 'Take it away for good')
    if lab == '✕':
        if wk in ('window', 'window (not opened live)'):
            return out('G04', 'Close the window')
        return out('G03', 'Take an entry off the sheet')
    if low in ('cancel', 'close', 'done', 'ok', 'got it', 'confirm', 'next', 'favour lost', 'discard it', 'exit', 'save', 'keep') and wk != 'sheet-wide' and idat != 'btnSave':
        return out('G05', 'Finish or leave a window')
    if low in ('−', '+', '− remove', '− remove one') or ('stepbtn' in cls) or 'tick-btn' in cls or 'unlucky-btn' in cls:
        return out('G14', 'Add or take away one')
    if 'void-pip' in cls or 'spell-pip' in cls or 'spell-bonus-pip' in cls:
        return out('G21', 'Spend or give back one pip')
    if low.startswith('+') or low.startswith('add ') or low in ('create new character',) or low == 'add' or low.startswith('+ add') or low.startswith('load '):
        return out('G10', 'Add an entry')
    if 'dice-btn' in cls or low.startswith('roll') or low.startswith('check') or low.startswith('resist') or low == 'cast' or low.startswith('lead an ally') or 'spell-cast-btn' in cls:
        return out('G11', 'Make a roll')
    if idat in ('btnSaveAs', 'btnPrint', 'btnExport', 'cl11Import', 'al71SheetHistory', 'btnSave', 'pm128More') or low in ('save', 'save as a copy', 'print', 'export json', 'import json', 'history', '⋯'):
        return out('G16', 'Save, copy or hand over the character')
    if 'ab113' in cls or NAV_IDS.match(idat) or low in ('‹', '›') or low.startswith('‹') or low.endswith('›'):
        return out('G15', 'Go to another page')
    if wk == 'window' and kind == 'clickable' and ('rp-' in cls or low[:1] in ('+', '−', '-') or True) and row['where'].lower().startswith('roll'):
        return out('G20', 'Tick an option for this roll')
    if 'chip' in cls or 'tile' in cls or 's14-' in cls or 'untrained' in cls or low in ('air', 'earth', 'fire', 'water', 'void'):
        return out('G19', 'Choose one thing')
    return out('G23', 'Other')
