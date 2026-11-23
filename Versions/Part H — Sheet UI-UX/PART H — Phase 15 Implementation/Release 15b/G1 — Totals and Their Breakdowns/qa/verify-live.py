"""Release 15b group 1 deployment checks (A14, B04, B14 and B17, on top of Release 15a), G6's verify-live.py with the group's
four units added (23 November 2026, Claude): each adds its own harness and the layers its light check ran
(qa/light/<unit>-touched/summary.json; B17's from its second run, on the fixed build), each counted once; nothing else
changed. Before that, Release 15a group G6 deployment checks (A19 revision 1, A20 and A19.1, on top of G5's A08 and the automatic-entries group's AE1, AE2, AE3, G4's A09, A10, A10.1,
A17, G3's 8b.1-UI-01, -02, -03, G2's A05, A06, A07, A11, A04.1 and G1's A04, A15, A16, A03.1): the automatic-entries group's
verify-live.py with A08 added (18 November 2026, Claude), then G5's with A19, A20 and A19.1 added (19 November 2026, Claude):
each adds its own harness and the layers its light check ran (qa/light/<unit>/summary.json), each counted once; nothing else changed. A08 adds its own harness and the twelve layers its light
check ran (qa/light/a08-touched-run.log), each counted once. A17 adds the splash layer's harness, run on the downloaded page and site
folder without the fast-splash preload, as the suite's service-worker leaf runs it. A03's 23 harnesses always run; each unit present
in the deployed page (found by its marker) adds its own harness and those of the layers it touches. --local verifies the committed
package without changing the live source; --url=<site> checks a hosted preview instead of production; --files-only compares the seven
files and runs no harness. Feature failures are never retried; only deployment propagation is polled."""
from pathlib import Path
import datetime, hashlib, json, re, shutil, subprocess, sys, tempfile, time, urllib.request

QA = Path(__file__).resolve().parent
V = next(d for d in QA.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
URL = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--url=')), 'https://l5r-character-sheet-creator.pages.dev/')
FILES_ONLY = '--files-only' in sys.argv
LOCAL = '--local' in sys.argv
LOCAL_FILES = {}
# --ref=<branch> compares a preview with that branch's committed build (default HEAD), so one checkout checks every
# stacked branch's preview.
REF = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--ref=')), 'HEAD')
PREVIEW = re.sub(r'^https?://|\.l5r-character-sheet-creator\.pages\.dev/?$', '', URL).strip('/')
OUT = QA / ('local' if LOCAL else 'live' if URL == 'https://l5r-character-sheet-creator.pages.dev/' else 'hosted-preview/' + PREVIEW)
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
R15B = QA.parent.parent                                   # Release 15b/
R15A = R15B.parent / 'Release 15a'                        # Release 15a/
A03 = R15A / 'A03 — Top-Aligned Columns and Compact Skill Cards' / 'qa'
# Each G1 unit: its marker, and its own harness plus the harnesses of the layers it touches, with their pinned counts.
UNITS = [('A04', 'PART H PHASE 15.1.4'), ('A15', 'PART H PHASE 15.1.15'), ('A16', 'PART H PHASE 15.1.16'), ('A03.1', 'PART H PHASE 15.1.3.1'),
         ('A05', 'PART H PHASE 15.1.5'), ('A06', 'PART H PHASE 15.1.6'), ('A07', 'PART H PHASE 15.1.7'), ('A11', 'PART H PHASE 15.1.11'),
         ('A04.1', 'PART H PHASE 15.1.4.1'),
         ('8b.1-UI-01', 'PART H PHASE 15.1.21'), ('8b.1-UI-02', 'PART H PHASE 15.1.22'), ('8b.1-UI-03', 'PART H PHASE 15.1.23'),
         ('A09', 'PART H PHASE 15.1.24'), ('A10', 'PART H PHASE 15.1.25'), ('A10.1', 'PART H PHASE 15.1.26'), ('A17', 'PART H PHASE 15.1.27'),
         ('AE1', 'PART H PHASE 15.1.28'), ('AE2', 'PART H PHASE 15.1.29'), ('AE3', 'PART H PHASE 15.1.30'),
         ('A08', 'PART H PHASE 15.1.31'), ('A19', 'PART H PHASE 15.1.33'), ('A20', 'PART H PHASE 15.1.34'), ('A19.1', 'PART H PHASE 15.1.35'),
         ('A14', 'PART H PHASE 15.2.1'), ('B04', 'PART H PHASE 15.2.3'), ('B14', 'PART H PHASE 15.2.4'), ('B17', 'PART H PHASE 15.2.5')]
TOUCHED = {
    'A04': [(R15A / 'A04 — One Information Pattern/qa/info-pattern-harness.js', 35),
            (V / 'PART I — Phase 4.5.4 Configuration UX Pass/qa/adv-config-ux-harness.js', 28),
            (V / 'PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js', 225),
            (V / 'PART I — Phase 4.5.36 Weakness and the Curse of Hotei/qa/weakness-hotei-harness.js', 45),
            (V / 'BUGFIX — Hotei Where the Sheet Spends Void/qa/hotei-auto-harness.js', 16),
            (V / 'PART I — Phase 4.5.11 Seven Fortunes Curse/qa/disadv-fortune-harness.js', 74)],
    'A15': [(R15A / 'A15 — Court Badges/qa/court-badges-harness.js', 33),
            (V / 'PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js', 225),
            (V / 'PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js', 212),
            (V / 'PART K — Phase 12 Play and Management Modes/qa/modes-harness.js', 25),
            (V / 'Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/qa/clan-theming-harness.js', 17)],
    'A16': [(R15A / 'A16 — No Bottom i in the Seven Pickers/qa/picker-info-harness.js', 50),
            (V / 'PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/fortune-blessing-harness.js', 77),
            (V / 'PART I — Phase 4.5.23 Dark Paragon/qa/dark-paragon-harness.js', 67),
            (V / 'PART I — Phase 4.5.18 Paragon/qa/paragon-harness.js', 80),
            (V / 'PART I — Phase 4.5.19 Soul of Artistry/qa/soul-artistry-harness.js', 92),
            (V / 'PART I — Phase 4.5.24 Touch of the Spirit Realms/qa/spirit-realms-harness.js', 50),
            (V / 'PART I — Phase 4.5.20 Void Versatility/qa/void-versatility-harness.js', 66)],
    'A03.1': [(R15A / 'A03.1 — Masteries in the Skill Information/qa/skill-masteries-harness.js', 19),
              (V / 'BUGFIX — Skill Traits/qa/skill-traits-harness.js', 38)],
    'A05': [(R15A / 'A05 — Missing Limb Picker/qa/limb-picker-harness.js', 22),
            (V / 'PART I — Phase 4.5.31 Checks and Conditions/qa/checks-conditions-harness.js', 101),
            (V / 'PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js', 212)],
    'A06': [(R15A / 'A06 — Grant Actions and Their State/qa/grant-actions-harness.js', 20),
            (V / 'PART I — Phase 4.5.17 Wealthy Koku Grant/qa/wealthy-grant-harness.js', 87),
            (V / 'PART I — Phase 4.5.40 Supplement Identity and Outfit/qa/identity-outfit-harness.js', 21)],
    'A07': [(R15A / 'A07 — The Moon Row/qa/moon-row-harness.js', 26),
            (V / 'BUGFIX — Moon Curse Full Moon/qa/moon-harness.js', 17),
            (V / 'BUGFIX — Moon Resist Label/qa/moon-label-harness.js', 5)],
    'A11': [(R15A / 'A11 — Explanatory Text Gaps and One Left Edge/qa/text-edges-harness.js', 22),
            (V / 'PART K — Phase 12 Play and Management Modes/qa/modes-harness.js', 25),
            (V / 'PART K — Phase 12.2 Play Mode Identity/qa/identity-harness.js', 17),
            (V / 'PART I — Phase 4.5.32 Damage, Sessions and XP/qa/damage-sessions-xp-harness.js', 69)],
    'A04.1': [(R15A / 'A04.1 — One Way to Show Choices in Pickers/qa/inline-rules-harness.js', 56),
              (V / 'PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/fortune-blessing-harness.js', 77),
              (V / 'PART I — Phase 4.5.2 Disadvantages/qa/disadv-config-harness.js', 163),
              (V / 'PART I — Phase 4.5.10 Cursed by the Realm/qa/disadv-realm-harness.js', 62),
              (V / 'PART I — Phase 4.5.11 Seven Fortunes Curse/qa/disadv-fortune-harness.js', 74),
              (V / 'PART I — Phase 4.5.22 Naishou Citizen/qa/naishou-citizen-harness.js', 36),
              (V / 'PART I — Phase 4.5.4 Configuration UX Pass/qa/adv-config-ux-harness.js', 28)],
    '8b.1-UI-01': [(R15A / '8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js', 32),
                   (V / 'BUGFIX — Older School Choices/qa/older-review-harness.js', 20),
                   (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/school-choices-harness.js', 30)],
    '8b.1-UI-02': [(R15A / '8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js', 28),
                   (V / 'PART K — Phase 12.6 Play Mode Techniques/qa/techniques-harness.js', 16),
                   (V / 'Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/qa/casting-diagnostics-harness.js', 36)],
    '8b.1-UI-03': [(R15A / '8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js', 34),
                   (V / 'PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js', 212),
                   (V / 'PART I — Phase 4.5.2 Disadvantages/qa/disadv-config-harness.js', 163)],
    'A09': [(R15A / 'A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js', 20),
            (V / 'BUGFIX — Characteristic Card Editing/qa/card-editing-harness.js', 46),
            (V / 'BUGFIX — Compact Characteristic Controls/qa/compact-points-harness.js', 33),
            (V / 'PART K — Phase 12.2 Play Mode Identity/qa/identity-harness.js', 17)],
    'A10': [(R15A / 'A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js', 23),
            (V / 'BUGFIX — Advanced Schools Pointer/qa/school-pointer-harness.js', 12),
            (V / 'BUGFIX — Compact Advanced Schools Button/qa/school-button-harness.js', 9),
            (V / 'PART I — Phase 4.7 Advanced Schools/qa/advanced-schools-harness.js', 196),
            (V / 'BUGFIX — Screen Focus from the App Bar/qa/screen-focus-harness.js', 11)],
    'A10.1': [(R15A / 'A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js', 16),
              (V / 'BUGFIX — Search Focus on Close/qa/search-focus-harness.js', 12),
              (V / 'BUGFIX — Screen Focus from the App Bar/qa/screen-focus-harness.js', 11)],
    'A17': [(R15A / 'A17 — The Splash Fills the Screen/qa/splash-fill-harness.js', 25)],
    # The automatic-entries group: each unit's own harness and the layers its preview checks ran (verify-preview.py).
    'AE1': [(R15A / 'AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js', 13),
            (V / 'PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/wizard5-harness.js', 71),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/school-choices-harness.js', 30)],
    'AE2': [(R15A / 'AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js', 21),
            (V / 'BUGFIX — Older School Choices/qa/older-review-harness.js', 20),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/review-regression-harness.js', 6),
            (V / 'PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js', 70),
            (V / 'Part J — Data Integrity & Validation/PART J — Phase 7 Save Format and Migration/qa/save-format-harness.js', 45),
            (V / 'BUGFIX — Clan and School Pickers Follow the Character/qa/cfs-sync-harness.js', 72)],
    'AE3': [(R15A / 'AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js', 20),
            (R15A / '8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js', 34),
            (V / 'PART K — Phase 12.6 Play Mode Techniques/qa/techniques-harness.js', 16)],
    # G5: A08's own harness and the layers its light check ran.
    'A08': [(R15A / 'A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js', 21),
            (R15A / 'A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js', 20),
            (V / 'BUGFIX — Undone Change Not Unsaved Work/qa/undone-change-harness.js', 6),
            (V / 'Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log/qa/audit-harness.js', 17),
            (V / 'BUGFIX — Characteristic Card Editing/qa/card-editing-harness.js', 46),
            (V / 'PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js', 70),
            (V / 'PART K — Phase 12 Play and Management Modes/qa/modes-harness.js', 25),
            (V / 'Part J — Data Integrity & Validation/PART J — Phase 7 Save Format and Migration/qa/save-format-harness.js', 45),
            (V / 'BUGFIX — Social Rank and Points/qa/social-rank-points-harness.js', 30),
            (V / 'BUGFIX — Taint Points and Growth/qa/taint-harness.js', 26),
            (V / 'BUGFIX — Imperial Scion Shared Status/qa/scion-harness.js', 12),
            (V / 'BUGFIX — Honour Resistance Bonus/qa/honour-harness.js', 20),
            (V / 'BUGFIX — Compact Characteristic Controls/qa/compact-points-harness.js', 33)],
    # G6: each unit's own harness and the layers its light check ran (A19's revision 1 run, A20's final run, A19.1's).
    'A19': [(R15A / 'A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js', 25),
            (R15A / 'A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js', 21),
            (R15A / 'A07 — The Moon Row/qa/moon-row-harness.js', 26),
            (V / 'BUGFIX — After-Preview Refund/qa/refund-harness.js', 9),
            (V / 'BUGFIX — Moon Curse Full Moon/qa/moon-harness.js', 17),
            (V / 'BUGFIX — Void Raise Not on Initiative/qa/void-raise-harness.js', 12),
            (V / 'BUGFIX — Hotei Where the Sheet Spends Void/qa/hotei-auto-harness.js', 16),
            (V / 'BUGFIX — Ancestor Gifts Used and Favour/qa/ancestor-gifts-harness.js', 12),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js', 35),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js', 50),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 4 Explain This Roll/qa/roll-breakdown-harness.js', 22),
            (V / 'Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/qa/wound-bar-harness.js', 23),
            (V / 'Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/qa/quick-access-sidebar-harness.js', 19),
            (V / 'PART I — Phase 4.5.20 Void Versatility/qa/void-versatility-harness.js', 66),
            (V / 'PART I — Phase 4.5.23 Dark Paragon/qa/dark-paragon-harness.js', 67),
            (V / 'PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js', 70),
            (V / 'PART K — Phase 12 Play and Management Modes/qa/modes-harness.js', 25),
            (V / 'PART K — Phase 12.7 Play Mode Combat/qa/combat-harness.js', 55),
            (V / 'Part J — Data Integrity & Validation/PART J — Phase 7 Save Format and Migration/qa/save-format-harness.js', 45),
            (V / 'PART I — Phase 4.8 Ancestors/qa/ancestors-harness.js', 349),
            (V / 'BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)/qa/ancfix-harness.js', 28),
            (V / 'PART I — Phase 4.5.29 Wound Entries/qa/wound-entries-harness.js', 45),
            (V / 'PART I — Phase 4.5.31 Checks and Conditions/qa/checks-conditions-harness.js', 101),
            (V / 'PART I — Phase 4.5.33 Void and Initiative Entries/qa/void-initiative-harness.js', 44),
            (V / 'PART I — Phase 4.5.36 Weakness and the Curse of Hotei/qa/weakness-hotei-harness.js', 45),
            (V / 'BUGFIX — Roll Preview Opens at the Top/qa/roll-preview-top-harness.js', 10),
            (V / 'BUGFIX — Void Card Reasons on a Phone/qa/void-reasons-harness.js', 14)],
    'A20': [(R15A / 'A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js', 18),
            (R15A / 'A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js', 21),
            (R15A / 'A03 — Top-Aligned Columns and Compact Skill Cards/qa/compact-skills-harness.js', 37),
            (V / 'BUGFIX — After-Preview Refund/qa/refund-harness.js', 9),
            (V / 'BUGFIX — Empty Quiver Rolls On/qa/quiver-harness.js', 8),
            (V / 'PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js', 51),
            (V / 'PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-expansion-harness.js', 48),
            (V / 'PART I — Phase 4.5.2 Disadvantages/qa/disadv-config-harness.js', 163),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js', 35),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js', 50),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 4 Explain This Roll/qa/roll-breakdown-harness.js', 22),
            (V / 'PART I — Phase 4.5.7 Unlucky/qa/disadv-unlucky-harness.js', 32),
            (V / 'PART I — Phase 4.5.8 Dependant and Wrath of the Kami/qa/disadv-dependant-wrath-harness.js', 55),
            (V / 'PART I — Phase 4.5.9 Doubt/qa/disadv-doubt-harness.js', 38),
            (V / 'PART I — Phase 4.5.10 Cursed by the Realm/qa/disadv-realm-harness.js', 62),
            (V / 'PART I — Phase 4.5.11 Seven Fortunes Curse/qa/disadv-fortune-harness.js', 74),
            (V / 'PART I — Phase 4.5.12 Seven Fortunes Curse Bishamon/qa/disadv-bishamon-harness.js', 51),
            (V / 'BUGFIX — Negative Roll Modifier Display/qa/negative-roll-modifier-harness.js', 12),
            (V / 'PART I — Phase 4.5.15 Roll Declaration Registry/qa/roll-declarations-harness.js', 53),
            (V / 'PART I — Phase 4.5.20 Void Versatility/qa/void-versatility-harness.js', 66),
            (V / 'PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/fortune-blessing-harness.js', 77),
            (V / 'PART I — Phase 4.5.23 Dark Paragon/qa/dark-paragon-harness.js', 67),
            (V / 'PART I — Phase 4.5.24 Touch of the Spirit Realms/qa/spirit-realms-harness.js', 50),
            (V / 'BUGFIX — Apply School Skill Rows/qa/school-skill-rows-harness.js', 37),
            (V / 'PART K — Phase 12.4 Play Mode Skills/qa/skills-harness.js', 17),
            (V / 'BUGFIX — Rank 0 Skill Rolls Explode/qa/rank-zero-harness.js', 19),
            (V / 'PART I — Phase 4.5.26 Dice Rolling Entries/qa/dice-entries-harness.js', 110),
            (V / 'PART I — Phase 4.5.27 Situational Roll Entries/qa/situational-entries-harness.js', 117),
            (V / 'PART I — Phase 4.5.28 Situational Entry Buttons and Gates/qa/situational-buttons-harness.js', 71),
            (V / 'PART I — Phase 4.5.30 Automatic Roll Entries/qa/automatic-entries-harness.js', 41),
            (V / 'BUGFIX — Skill Traits/qa/skill-traits-harness.js', 38),
            (V / 'PART I — Phase 4.5.36 Weakness and the Curse of Hotei/qa/weakness-hotei-harness.js', 45),
            (V / 'BUGFIX — Roll Preview Opens at the Top/qa/roll-preview-top-harness.js', 10),
            (V / 'BUGFIX — Honour Resistance Bonus/qa/honour-harness.js', 20)],
    'A19.1': [(R15A / 'A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js', 9),
            (R15A / 'A07 — The Moon Row/qa/moon-row-harness.js', 26),
            (V / 'BUGFIX — Moon Curse Full Moon/qa/moon-harness.js', 17),
            (V / 'BUGFIX — Hotei Where the Sheet Spends Void/qa/hotei-auto-harness.js', 16),
            (V / 'Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/qa/wound-bar-harness.js', 23),
            (V / 'Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/qa/quick-access-sidebar-harness.js', 19),
            (V / 'PART K — Phase 12 Play and Management Modes/qa/modes-harness.js', 25),
            (V / 'PART K — Phase 12.7 Play Mode Combat/qa/combat-harness.js', 55),
            (V / 'PART I — Phase 4.5.33 Void and Initiative Entries/qa/void-initiative-harness.js', 44),
            (V / 'PART I — Phase 4.5.36 Weakness and the Curse of Hotei/qa/weakness-hotei-harness.js', 45),
            (V / 'BUGFIX — Void Card Reasons on a Phone/qa/void-reasons-harness.js', 14)],
}
# Release 15b group 1: each unit's own harness and the layers its light check ran, read from its light summary.
def _light(name):
    return [(V / row['harness'], row['total']) for row in json.load(open(QA / 'light' / name / 'summary.json', encoding='utf-8'))['rows']]
TOUCHED['A14'] = [(R15B / 'A14 — One Net Wound Penalty/qa/net-wound-harness.js', 17)] + _light('a14-touched')
TOUCHED['B04'] = [(R15B / 'B04 — One Armor TN Breakdown/qa/armor-tn-harness.js', 12)] + _light('b04-touched')
TOUCHED['B14'] = [(R15B / "B14 — Jigoku's Total, Then Its Arithmetic/qa/jigoku-total-harness.js", 10)] + _light('b14-touched')
TOUCHED['B17'] = [(R15B / 'B17 — One Row for Kharmic Tie/qa/kharmic-row-harness.js', 13)] + _light('b17-touched-2')
SPLASH = F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-harness.js'
# The older harnesses print their totals in three shapes: "N/M checks passed", {"passed":N,"total":M} and
# {"total":M,"passed":N} (Phase 4.54's), or "FEATURE 4.5.11 — N/M checks passed".
def count_of(out):
    found = re.findall(r'(\d+)/(\d+) checks passed', out)
    found += re.findall(r'"passed":\s*(\d+),\s*"total":\s*(\d+)', out)
    found += [(p, t) for t, p in re.findall(r'"total":\s*(\d+),\s*"passed":\s*(\d+)', out)]
    return found[-1] if found else None


def committed(path):
    # Deployment builds from Git blobs; older PWA files in this checkout carry CRLF.
    return subprocess.check_output(['git', 'show', REF + ':' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    if LOCAL: return LOCAL_FILES[name]
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'g1=' + str(int(time.time())),
                                     headers={'Cache-Control': 'no-cache', 'User-Agent': 'L5R release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = committed(SOURCE).decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
    if LOCAL:
        LOCAL_FILES[''] = expected
    for attempt in range(21):           # the deploy takes a few minutes to go live; the bytes themselves are never retried
        actual = download('')
        if actual == expected:
            break
        print('waiting for the deploy:', hashlib.sha256(actual).hexdigest()[:12], len(actual), flush=True)
        time.sleep(30)
    else:
        print('DEPLOYMENT NOT CURRENT: expected', hashlib.sha256(expected).hexdigest(), len(expected))
        return 2
    digest = hashlib.sha256(expected)
    names = ['manifest.webmanifest'] + ['icons/' + p.name for p in sorted((PWA / 'icons').glob('*.png'))]
    for name in names:
        digest.update(name.encode('utf-8'))
        digest.update(committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name))
    sw_id = digest.hexdigest()[:16]
    if LOCAL:
        LOCAL_FILES['sw.js'] = committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii'))
        for name in names:
            LOCAL_FILES[name] = committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name)
        site = OUT / 'site'
        for name, data in LOCAL_FILES.items():
            target = site / (name or 'index.html')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    sw = download('sw.js')
    if sw != committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii')):
        print('DEPLOYED SERVICE WORKER DIFFERS from build', sw_id)
        return 3
    lines = ['Live page matches the expected PWA build byte for byte.', 'Service worker matches build ' + sw_id + '.']
    results = {}
    with tempfile.TemporaryDirectory(prefix='l5r-15b-g1-live-') as tmp:
        site = Path(tmp).resolve() / 'site'
        (site / 'icons').mkdir(parents=True)
        (site / 'index.html').write_bytes(actual)
        (site / 'sw.js').write_bytes(sw)
        asset_hashes = {}
        for name in names:
            data = download(name)
            expected_asset = committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name)
            if data != expected_asset:
                raise RuntimeError('Deployed asset differs: ' + name)
            (site / name).write_bytes(data)
            asset_hashes[name] = hashlib.sha256(data).hexdigest()
        sheet = site / 'index.html'
        fast = ['--require', str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
                '--require', str(F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
        runs = [
            (A03/'compact-skills-harness.js', [sheet], 37, fast),
            (V/'PART K — Phase 12.4 Play Mode Skills/qa/skills-harness.js', [sheet], 17, fast),
            (R15A/'A02 — Floating Controls Above the Tabs/qa/floating-strip-harness.js', [sheet], 23, fast),
            (V/'Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/qa/ui-foundations-harness.js', [sheet], 9, fast),
            (V/'Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/qa/quick-access-sidebar-harness.js', [sheet], 19, fast),
            (V/'PART K — Phase 11.3 App Bar/qa/appbar-harness.js', [sheet], 25, fast),
            (V/'BUGFIX — Carousel Settles on Its Destination/qa/carousel-destination-harness.js', [sheet], 9, fast),
            (R15A/'A01 — One Reminder per School Choice/qa/review-reminder-harness.js', [sheet], 31, fast),
            (V/'PART K — Phase 11.2.6 Rank Advancement Spell Choices/qa/rank-spell-harness.js', [sheet], 36, fast),
            (V/'BUGFIX — Older School Choices/qa/legacy-grants-harness.js', [sheet], 4, fast),
            (V/'BUGFIX — Older School Choices/qa/older-review-harness.js', [sheet], 20, fast),
            (V/'BUGFIX — Older School Choices/qa/allocation-boundaries-harness.js', [sheet], 5, fast),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/school-choices-harness.js', [sheet], 30, fast),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/review-regression-harness.js', [sheet], 6, fast),
            (V / 'BUGFIX — Free Choice Note Clears/qa/free-choice-harness.js', [sheet], 9, fast),
            (V / 'BUGFIX — Starting Spells Are Scrolls/qa/scrolls-harness.js', [sheet], 5, fast),
            (V / 'BUGFIX — Wizard Skill Remove/qa/wizard-remove-harness.js', [sheet], 5, fast),
            (V / 'PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js', [sheet], 43, fast),
            (V / 'PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js', [sheet], 32, fast),
            (V / 'PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/qa/wizard3-harness.js', [sheet], 52, fast),
            (V / 'PART K — Phase 11.2.3 Wizard Starting Spells/qa/wizard4-harness.js', [sheet], 25, fast),
            (V / 'PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/wizard5-harness.js', [sheet], 71, fast),
            (V / 'BUGFIX — Apply School Skill Rows/qa/school-skill-rows-harness.js', [sheet], 37, fast),
        ]
        text = actual.decode('utf-8', 'replace')
        present = [u for u, marker in UNITS if re.search(re.escape(marker) + r'(?![\d.]*\d)', text)]
        seen = {str(h) for h, *_ in runs}
        for unit in present:
            for harness, total in TOUCHED[unit]:
                if str(harness) not in seen:
                    seen.add(str(harness))
                    runs.append((harness, [sheet], total, fast))
        if 'A17' in present:
            runs.append((SPLASH, [sheet, site], 19, []))
        lines.append('G1 units in the deployed page: ' + (', '.join(present) or 'none'))
        EXPECT = (len(runs), sum(t for _, _, t, _ in runs))
        if FILES_ONLY: runs = []
        for harness, args, total, preload in runs:
            print("Checking deployed files:", harness.name, flush=True)
            run = subprocess.run([NODE, *preload, str(harness), *map(str, args)], cwd=str(V.parent),
                                 capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=1200)
            label = harness.parent.parent.name + '/' + harness.name
            lines.append('== ' + label + '\n' + run.stdout + run.stderr)
            counts = count_of(run.stdout)
            results[label] = {'counts': counts, 'expected': total,
                              'passed': run.returncode == 0 and counts == (str(total), str(total))}
    passed = (FILES_ONLY and not results) or (len(results) == EXPECT[0] and sum(r['expected'] for r in results.values()) == EXPECT[1] and all(r['passed'] for r in results.values()))
    report = {'commit': subprocess.check_output(['git','rev-parse',REF], cwd=V.parent, text=True).strip(), 'downloaded_asset_sha256': asset_hashes, 'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': 'local build preview' if LOCAL else URL,
              'source_sha256': hashlib.sha256(committed(SOURCE)).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'service_worker_sha256': hashlib.sha256(sw).hexdigest(),
              'g1_units': present, 'expected': {'harnesses': EXPECT[0], 'checks': EXPECT[1]}, 'harnesses': results, 'passed': passed}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / ('files-only.json' if FILES_ONLY else 'live-verification.json')).write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps({k: v for k, v in report.items() if k not in ('harnesses', 'downloaded_asset_sha256')}, indent=2))
    for label, r in results.items():
        print(('PASS ' if r['passed'] else 'FAIL ') + label + ' ' + '/'.join(r['counts'] or ['?']))
    total = sum(r['expected'] for r in results.values())
    print('LIVE VERIFICATION ' + ('PASSED: all seven files match (files only, no harness run)' if FILES_ONLY and passed else f'PASSED: {total}/{total} on the deployed files' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
