# Removing the Disadvantages point release

This folder owns the Disadvantages expansion of Phase 4.5. The source marker is
`PART I FEATURE 4.52`; its exact numeric identity deliberately differs from the
existing modal phase's `PART I PHASE 4.5`. The folder keeps the roadmap's point
release number. Moving the existing Part I folder into a new theme wrapper is
deferred to preserve its documented external paths.

## Ownership and independent components

| Scope | Exact marker | Source fragments |
|---|---|---|
| Core | `PART I FEATURE 4.52` | `src/sheet/209.85-feat-disadv-config.js`, `src/css/55-disadv-config.css` |
| Phobia | `PART I FEATURE 4.521` | `src/sheet/209.86-feat-disadv-phobia.js`, `src/css/56-disadv-phobia.css` |
| Sworn Enemy / Nemesis | `PART I FEATURE 4.522` | `src/sheet/209.87-feat-disadv-nemesis.js`, `src/css/57-disadv-nemesis.css` |
| Willpower gates | `PART I FEATURE 4.523` | `src/sheet/209.88-feat-disadv-gates.js` |

Each new fragment has a manifest entry. Shared additions, if needed, use the
paired insertion protocol in `qa/REMOVAL-PROTOCOL.md`. No whole-file snapshot is
used by the remover. Existing source bytes, line endings, manifest order, and
unrelated future fragments are retained.

Phobia, Nemesis, and the Willpower gates have separate removal scopes. A
component's own state, controls and effects must live in its fragment; any CSS
or named hook outside that fragment must be paired with its exact component
marker. Generic guarded component interfaces in the core may remain, provided
they contain no component-specific schema, identifiers, styles or registrations.
Deleting a component must leave its saved data legible as unsupported configuration
instead of inventing replacement rules or silently activating another effect.

## Declared dependencies

- The expansion requires the existing Phase 4.5 modal host, config resolver,
  configuration persistence, and the existing `adv-config` contributor. Remove
  this expansion first when removing the original Phase 4.5. The point-release
  README is the authoritative dependency note for this later addition; the
  original rollback document remains the historical contract for the older phase.
- The expansion uses the established pre-roll preview and roll-result flow for
  Willpower checks and existing Luck/Void options. The gate fragment must guard
  optional APIs and degrade without throwing when a supported optional feature
  is absent. Its rules for nested resources and spell-slot consumption live in
  the gate fragment so those policies can be replaced independently.
- The roll registry keeps its existing single `adv-config` seat. This release
  extends that contributor; it must not add another registry entry. The pipeline
  baseline suite therefore retains its existing count and contributor-order
  expectations.
- The save format is versioned by the expansion's wrappers. Removing this
  release restores the existing version-2 build and its existing newer-save
  refusal. The remover does not rewrite character saves.

The original ownership checker uses prefix matching. Its reports for the old
modal phase can therefore show this expansion as an explicitly declared
dependent. The new remover itself uses exact numeric markers and rejects foreign
markers even when a number begins with the same digits.

## Scratch removal

Make a disposable copy of the Phase 0 directory. The remover refuses the live
source tree, its parents, its descendants, and symlink targets. Pass the root of
the copy to the following command, from this release's directory:

```text
python qa/remove-phase.py COPY --scope all --expect-sha 4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481
python COPY/build/recombine.py --verify
```

The expected hash is the independently recorded build from immediately before
this expansion: **2,428,891 bytes**. A mismatch refuses the operation before any
file is changed. Use `--dry-run` to inspect the full plan without changing the
copy. The remover updates only the manifest entries and expected hash plus its
owned source blocks/fragments; it does not generate the output HTML itself.

Individual removal uses the same tool:

```text
python qa/remove-phase.py COPY --scope phobia
python qa/remove-phase.py COPY --scope nemesis
python qa/remove-phase.py COPY --scope gates
```

Use a fresh copy for each independent proof. Without `--expect-sha`, the tool
reports a projected hash rather than claiming comparison with a prior build.
The retained component/source bytes and the other phase harnesses must then be
compared independently. Full removal also works after one or more components
have already been removed.

For a later build with unrelated additions, omit the historical expected hash
only after independently establishing the correct later baseline. The surgical
plan preserves those additions; copying an old source snapshot would not.

## Removing the complete modal phase as well

First remove this point release using the command above. Then run the original
modal phase's existing `qa/remove-phase.py` against the same scratch copy and
rebuild. The second removal's independently recorded output is **2,322,320 bytes**,
SHA-256 `9dbaf6c626f2baba33df8547078bc158ef32926c8fc7ea1b0b1501f4c8b116e4`.
Never run the original remover first: its older span rules were written before
this dependency existed.

## Required evidence before shipping

The release's final QA report must record measured current-build and removed-build
hashes, the combined-removal hash, independent Phobia/Nemesis/Gates results, and
every retained phase harness result. The prior hash constants above are comparison
oracles; they are not a substitute for a fresh end-of-work proof.

Run `python qa/test-removal.py` for the removal tool's independent positive and
negative fixtures. It checks byte/EOL preservation, exact numeric identity,
refusal of foreign and sibling markers, malformed insertion boundaries, duplicate
manifest entries, path escape, live-tree protection, wrong-hash refusal before
writes, retained future fragments, and full removal after an individual removal.
Run the Phase 0 `qa/feature-dependencies.py` on the current core and each component
before the scratch proof, and account for every reference it attributes to a
different owner. No claim of completed production QA is made by the fixture suite.
