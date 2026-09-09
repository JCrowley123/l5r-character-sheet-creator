# ROLLBACK — Part F, Phase 0.5 (Hosting & Deployment Pipeline)

## How to revert

Two things, because this phase is the one that deliberately puts a file outside
its own folder.

**1. Delete this folder.**

```
Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.5 Hosting & Deployment Pipeline/
```

**2. Delete `build.py` from the repository root.**

It is this phase's entry point and does nothing without the folder above — it
contains no logic, only a delegation to `deploy/deploy_build.py`. Left behind on
its own it would exit with a "deploy script not found" message and mislead
whoever runs it next. Its own header says the same thing.

Optionally also remove the `dist/` lines from `.gitignore`, and delete any local
`dist/` directory. Neither is tracked, so neither matters much.

## If Cloudflare Pages was already connected

Deleting files does not undeploy anything. To take the site down as well:

1. Cloudflare dashboard → **Workers & Pages** → the project → **Settings** →
   **Delete project**. The `*.pages.dev` URL stops resolving.
2. Optionally revoke Cloudflare's GitHub access: GitHub → **Settings** →
   **Applications** → **Installed GitHub Apps** → **Cloudflare Pages** →
   **Configure** → remove this repository, or uninstall entirely.

Neither step touches the repository's contents or its visibility.

Leaving the Pages project connected after deleting these files is also a valid
state, but a poor one: builds will start failing (`build.py` gone), and because
Cloudflare keeps serving the last successful deploy when a build fails, the site
would stay up serving an increasingly stale copy without any obvious signal.
Delete the project or fix the build — do not leave it half-reverted.

## What rolling back costs

Nothing that existed before this phase.

- **Phase 0 is untouched.** This phase only ever *calls* Phase 0's
  `recombine.py`; it never writes into that folder. The split source tree and
  the single-file build it produces are unaffected.
- **The sheet itself is unaffected.** This phase adds no application code. It
  copies Phase 0's output into a publish directory and changes not one byte of
  it — verified on every run, and the copy is refused if the hashes differ.
- **The repository's privacy is unaffected** either way. It was `private` before
  this phase and connecting Pages does not change that.

You lose only the ability to deploy: the entry point, the publish step, the
drift check, the deployment verification suite, and `SETUP.md`.

## Restore points

This phase produces no build artefact of its own to pin — its output is a copy
of Phase 0's, and it verifies that equality itself on every run rather than
recording a hash here that could go stale.

The hash that matters is Phase 0's, recorded in that phase's `ROLLBACK.md`:

```
211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64
```

Check the whole chain at any time:

```bash
python3 build.py                # builds, prints the Phase 0 hash and the published hash
python3 build.py --check-drift  # confirms the committed build still matches its sources
```

`build.py` refuses to publish if the copy in `dist/` does not hash identically to
what Phase 0 produced, so a corrupted publish fails the build rather than
shipping quietly.
