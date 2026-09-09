# Part F, Phase 0.5 — Hosting & Deployment Pipeline

Turns the Phase 0 source tree into a deployed site: push to `main`, Cloudflare
Pages rebuilds from source, the result is live over HTTPS.

Nothing user-facing changes. This phase exists so Phase 0.6 has a real HTTPS
origin to install from — a service worker will not register over `file://` or
plain `http`, so without this the installable web app has nothing to stand on.

**Status: connected and deployed.** Cloudflare Pages builds this repo on every
push to `main`; the first deploy succeeded. Outstanding: verification from a
machine that can reach the URL, and the phone-on-mobile-data check. See
`SETUP.md` steps 5 and 6.

---

## What runs

```
build.py                          (repo root) thin entry point — what Cloudflare runs
  └── deploy/deploy_build.py      the real work
        └── ../PART F — Phase 0/build/recombine.py    the actual build
              └── dist/index.html                      what gets served
```

```bash
python3 build.py                # build the site into dist/
python3 build.py --check-drift  # is the committed build still what its sources produce?
```

`deploy_build.py` owns **no assembly logic**. It shells out to Phase 0's
`recombine.py` and copies the result. That is deliberate: a second
implementation of the concatenation would be a second thing to keep in step, and
the deployed site could drift from the local one without either looking wrong.
The copy is byte-level, not a text re-encode, so no newline translation can
creep in between the two — the same care the repo takes with
`core.autocrlf false`.

## Why `build.py` sits at the repo root

It is the one file this phase puts outside its own folder, and it is a
deliberate exception, taken with sign-off.

A CI build command is a value typed into a web form. The alternative was asking
Cloudflare to run:

```
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.5 Hosting & Deployment Pipeline/deploy/deploy_build.py"
```

— spaces and em-dashes in a field that gets retyped, copy-pasted and edited by
hand later. `python3 build.py` does not have that failure mode.

The roadmap anticipated this: Phase 0.5–0.7 "sit outside the trunk/layer model
entirely — possibly worth their own folder convention outside `Versions/` when
that's convenient to set up." This is the minimum version of that: one thin
file, no logic, everything real still living with its phase. `build.py`
delegates and does nothing else, and says so in its own header.

## `dist/` is gitignored

Cloudflare rebuilds it from source on every push, so committing it would only
create a second copy to drift out of step with the first. Build it locally when
you want to look at it.

## Drift

The layout invites one specific mistake: edit a fragment under Phase 0's `src/`,
forget to re-run the build, and the committed `l5r-character-sheet.html` no
longer matches its own sources. The deployed site would be *correct* (Cloudflare
builds from source) while the committed file quietly lied.

```bash
python3 build.py --check-drift
```

Rebuilds and compares. Deliberately **not** pinned to a fixed hash: once a later
phase edits a fragment on purpose, a fixed hash would fail forever, whereas this
stays correct because it only ever asks "does the committed output match what
the sources currently produce?"

## Verifying a deployment

Two tools, because the machine that can reach the deployment is not always the
machine with a browser stack on it.

**`qa/verify_served.py` — stdlib Python, nothing to install. Use this one.**

```bash
python3 build.py                                    # refresh dist/ first
python3 qa/verify_served.py https://your-project.pages.dev
```

Three checks: https, HTTP 200, and **the served bytes' sha256 against the local
build**. That last one is the whole verification. If the bytes match, the
deployed page *is* the file that already passed Phase 0's full behavioural suite
— 14 flows, both seams, every element id. Identical bytes cannot behave
differently, so testing behaviour again over HTTP would confirm nothing new.

**`qa/verify-deployment.js` — richer, needs Node and Playwright.**

```bash
NODE_PATH=$(npm root -g) node qa/verify-deployment.js https://your-project.pages.dev
```

Six checks: the three above, plus loads-without-page-errors, both test seams
present, and ten real sections rendered. Worth running when a browser stack is
available; strictly speaking redundant when the byte check passes.

### The cloud session cannot run either against a live deployment

Its egress proxy refuses the connection:

```
"kind": "connect_rejected",
"detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
"host": "l5r-character-sheet-creator.pages.dev:443"
```

The request never leaves the sandbox. Nothing about that reflects on the
deployment — but it does mean live verification belongs to whoever is running
the desktop, which is why the stdlib-only tool exists alongside the Node one.

### Why the byte comparison, rather than checking for a 200

Cloudflare keeps serving the last good deploy when a build fails. A broken build
is therefore *silent*: the site stays up and quietly goes stale. Pinging for a
200 passes throughout. Comparing sha256 against the local build is what actually
catches it, and it is precisely the failure the roadmap's regression matrix
names — "a failed build doesn't silently leave a stale version live".

### Verified so far

Both tools were exercised against a local `http-server` over `dist/`, including
a deliberately mismatched file to confirm the failure path reports correctly
rather than passing by accident:

| Check | Result |
|---|---|
| responds 200 | pass |
| served bytes match local build | pass — `211b4e54…` both sides |
| served bytes **mismatch** detected | pass — stale content identified and printed |
| loads with no page errors | pass |
| both test seams present | pass — `__L5R_TEST__` 277 keys, `__L5R_CAROUSEL__` 10 methods |
| renders 10 real sections | pass — 10 real + 2 carousel clones, 290 element ids |
| URL is https | **fail, correctly** — the local test is `http` |

The https check failing on an http URL is the check working.

From Cloudflare's own build log, the deploy itself is confirmed:

- `Detected the following tools from environment: python@3.11.14`
- `sha256 : 211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64`
- `verify : BYTE-IDENTICAL to the pre-split build`
- `✨ Success! Uploaded 1 files`

That hash is the same one produced on Linux and on Windows, so the build is now
reproducible on **three** independent platforms. "Uploaded 1 files" also confirms
the publish directory held exactly one file — the repo was not accidentally
published wholesale.

### One thing the tool taught me

The first version asserted "10 sections" and failed against a live page, which
has **12**. The carousel clones the first and last pages so the loop is seamless;
the clones carry `data-clone` and have their ids stripped so they cannot collide.
Ten is the file's count, twelve is the DOM's. The check now counts real pages the
way the carousel's own code does — `section:not([data-clone])` — and reports the
clones separately, so it asserts the invariant that matters rather than a number
that depends on how many clones the loop happens to need.

## Privacy — the part worth reading

**The repository stays private.** Connecting Pages does not change its
visibility and the free plan does not require making it public. Recorded before
connecting, via the GitHub API, so it can be checked again after:

```json
{ "full_name": "JCrowley123/l5r-character-sheet-creator",
  "private": true, "visibility": "private" }
```

**The deployed URL is open and unauthenticated.** Anyone with the link can open
the sheet. Same trust model as an "anyone with the link" shared document. The
repo being private and the deployed link being unlisted are two separate things,
and only the first is enforced by anything — `*.pages.dev` names are predictable
enough that obscurity is not a control.

For a character sheet you intend to hand to your group, that is very likely fine.
It is documented here because the roadmap asks for it explicitly, and because
it is better known than assumed. If you would rather the link were gated,
Cloudflare Access does it free for up to 50 users with no code change; out of
scope for this phase, available on request.

## What remains

Cloudflare is connected and the first deploy succeeded — the build log confirms
sha256 `211b4e54…7f1a64` produced inside Cloudflare's own container, one file
uploaded. Two items are left, both needing a machine that can reach the URL:

1. **Run the byte check.** `python3 qa/verify_served.py https://<url>` from the
   repo root, after `python3 build.py`. Confirms the server is handing out the
   bytes this repo builds, rather than a stale copy from an earlier deploy.
2. **Open it on a phone, on mobile data rather than home wifi.** The roadmap's
   last validation item and the one neither a desktop nor a cloud container can
   stand in for: it proves the site is reachable from outside your own network,
   not merely resolving on the machine that set it up.
