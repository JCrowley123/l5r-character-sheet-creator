# Phase 4.5.2 validation suite and regression matrix

`current-suite-runner.js` is the integrated entry point. It invokes the two established Phase 4.5
harnesses, this point-release harness, and the retained phase harnesses against the same immutable
HTML build. This folds the point-release checks into the current suite rather than creating a
parallel, unobserved test track.

## Matrix

| Area | Risk | Coverage in `disadv-config-harness.js` |
|---|---|---|
| XP refunds | High | Antisocial 2/4 with explicit Crab 3/5; Blackmailed live Status; Cast Out, Compulsion, Obligation; Consumed tenets and Clan adjustment; Elemental Imbalance 2×rank; Enlightened Madness; Failure of Bushido/Ninja; Phobia; Sworn Enemy difference and Nemesis |
| Roll modifiers and gates | High | Authoritative seven-skill Antisocial boundary, tenet reminders/hooks, Phobia non-damage global hook, Nemesis Void policy, Maho exclusion, Elemental Imbalance continuation, Enlightened Madness cancellation, and nested resource policy |
| Toggles | High | Phobia active/confronted and Nemesis activity; cost stays tied to the purchased configuration and both toggles reverse immediately |
| Persistence | Medium | Schema-3 contract, explicit migration, all eleven configurations, toggles, pip/resource fields, JSON round-trip, unknown configuration warning, and no serialized gate history |
| UI / UX | Medium | Shared overlay, nested Back/Next steps, free-text and numeric controls, close/cancel behaviour, badges/reminders, tooltips, narrative notices, and 375px viewport geometry |
| Removability | High | Exact marker ownership, independent scope plans, no additional registry seat, fixture safety checks, byte-identical full removal, and unchanged retained harness totals |

## Expected result

At the latest verified build the point-release browser suite reports **163/163**. The integrated
runner reports the following retained totals in the same run:

```text
Phase 4.5 original       51/51
Phase 4.5 Advantages      48/48
Phase 4.5.2 Disadvantages 163/163
Phase 1.5 pipeline        35/35
Phase 3 preview           50/50
Phase 4 explanation       22/22
Phase 1 UI                 9/9
Phase 1.6 wounds          23/23
Phase 2 sidebar           19/19
Phase 5 validation        25/25
Phase 8 casting           36/36
Phase 9 Clan UI           17/17
Spell slots visibility     6/6
```

Removal-specific fixtures (`test-removal.py`) report **23/23**. Full removal from a fresh scratch
copy must rebuild to the pre-expansion 2,428,891-byte artifact with SHA-256
`4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481`, after which the retained
suite is run with `--existing-only`.

## Commands

From the point-release `qa` directory, with the bundled Node runtime and `L5R_CHROME` configured:

```text
node current-suite-runner.js <path-to-l5r-character-sheet.html>
node current-suite-runner.js <path-to-removed-build.html> --existing-only
python test-removal.py
```

The feature-dependency scanner is also run on each new source fragment. Its non-zero reports are
expected for the declared core-to-component relationship; they are reviewed to ensure every such
reference is generic and guarded, rather than treating any cross-fragment reference as an automatic
failure.
