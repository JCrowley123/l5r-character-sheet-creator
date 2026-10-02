# Remove the Rank 0 explosion fix

This layer depends only on the trunk Skill/Attack roll entry point. It does not
depend on the Dice Rolling Entries layer or Soul of Artistry. Later wrappers
which deliberately lift an effective Rank must run before this wrapper or pass
their own later explosion override. The companion release does so and is tested
with this fix removed.

1. Make a separate scratch copy of the Phase 0 folder.
2. Run `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run` from
   this folder; inspect the planned files and hash.
3. Run the same command without `--dry-run`, then run that copy's
   `build/recombine.py`. Run the retained harnesses against its rebuilt HTML.
4. Review the source changes, apply those exact changes to the working branch,
   and remove this release's registry entry and folder. Update the current suite
   runner to chain the preceding release directly.

The tool refuses the live Phase 0 tree, its parents/children, escaped paths,
hard links, malformed or foreign blocks, duplicate entries, and residual owned
symbols. It deletes only `src/sheet/209.999997-bugfix-rank-zero.js`, its manifest
entry, and its guarded `rank-zero-seam` block. It repins the manifest to the
planned result before rebuilding; surrounding bytes and line endings survive.
The ownership scanner calls the general marker `BUGFIX`; the remover also checks
the exact `RANKZERO` identity and refuses other bugfix markers.

For fix-only removal, pass `--expect-sha
319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c` on one line.
The expected output is 3,479,860 bytes. If later layers are retained, that hash
will differ: inspect their declared dependencies and verify their own checks.

Removing this fix alone deliberately restores the untrained table/attack bug.
It does not remove the four Rank 1 effects or Gaijin Name. No saved character
data needs migration or cleanup.
