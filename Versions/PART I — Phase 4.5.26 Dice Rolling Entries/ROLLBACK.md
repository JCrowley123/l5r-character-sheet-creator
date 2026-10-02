# Remove Dice Rolling Entries

Remove this dependent before removing the base Advantages configuration layer
(Phase 4.5, Part I), whose modifier and Luck reroll functions it wraps. Gaijin
Name reads the Disadvantages layer's Social list (Phase 4.5.2, Part I); remove
this dependent before removing that parent if the complete rule is required.
The `D45` lookup is guarded, so an absent parent disables Gaijin Name cleanly.
Ancestor hooks are optional. This release and the Rank 0 fix are independently
removable; neither requires Soul of Artistry or Play/Management.

1. Copy the Phase 0 folder to a separate scratch directory.
2. From this folder run `python -B qa/remove-phase.py <absolute-scratch-folder>
   --dry-run` on one line, then inspect the plan.
3. Run without `--dry-run`, rebuild with that copy's `build/recombine.py`, and
   run retained harnesses against the rebuilt HTML.
4. Review and apply the exact removal to the working branch. Remove this
   release's folder and its registry entry; select the Rank 0 fix's suite runner
   if that fix remains, otherwise the Clan and School Prices runner.

The remover deletes only `209.999998-feat-dice-entries.js`, its manifest entry,
and its owned `dice-entries-seam`/`dice-pool` blocks. At the latter it restores
the exact three-line original expression kept in `qa/pipeline-original.txt`.
It preserves surrounding bytes and line endings and repins the manifest. It
refuses the live source tree, parents/children, unsafe links/paths, foreign or
malformed markers, duplicate entries and leftover owned symbols before writing.

With no later layers, `--expect-sha
8508e42f51a3c28bb3415557309d323a9448997b12d56e66d9ea56207cd65178` (on one line)
requires the exact 3,480,934-byte fix-only result. Both removers, in either order,
restore main `6e6da0b`'s 3,479,860-byte build with SHA-256
`319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c`.
Use actual retained-layer hashes when subsequent features are present.

Character data, purchased Skill ranks and prices need no migration. Removing
this layer returns these five entries to their previous non-automated behavior.
The separately owned Rank 0 fix remains active unless removed separately.
