# Connecting Cloudflare Pages — step by step

This is the part I cannot do from here: it needs your Cloudflare and GitHub
accounts. Everything the build side needs is already committed and tested.

Budget about ten minutes. Nothing here is irreversible — deleting the Pages
project removes the deployment and touches nothing in the repo.

---

## Before you start

You need a Cloudflare account (the free plan is sufficient — this project stays
comfortably inside its limits). Sign up at <https://dash.cloudflare.com/sign-up>
if you do not have one. No domain purchase is required; Pages gives you a
`*.pages.dev` address.

---

## 1. Create the Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** tab →
   **Connect to Git**.
2. **Connect GitHub**. You will be sent to GitHub to authorise the Cloudflare
   Pages app.
3. On GitHub's authorisation screen choose **Only select repositories** and pick
   **`l5r-character-sheet-creator`** alone.

   Granting access to all repositories also works, but there is no reason to —
   Cloudflare only ever needs to read this one.

4. Back in Cloudflare, select `l5r-character-sheet-creator` and press
   **Begin setup**.

## 2. Build settings

| Field | Value |
|---|---|
| Project name | `l5r-character-sheet-creator` (this becomes your URL) |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `python3 build.py` |
| Build output directory | `dist` |
| Root directory | *leave blank* |

Those two middle values are the whole integration. `build.py` sits at the repo
root precisely so this form contains no spaces or em-dashes.

**Leave the root directory blank.** Pointing it anywhere else, or pointing the
*output* directory at the repo root, would publish the entire repository — every
legacy build, the `Art/` folder, the whole `Versions/` tree — to an open URL.
`dist/` is a dedicated folder holding exactly one file, and that is the point.

## 3. Environment variable

Still on the setup screen, expand **Environment variables (advanced)** and add:

| Variable | Value |
|---|---|
| `PYTHON_VERSION` | `3.11` |

Cloudflare's build image ships several Python versions and this pins the one it
uses. If you skip it and the build fails with something like `python3: command
not found`, this is the fix.

## 4. Deploy

Press **Save and Deploy**. The first build takes a minute or two.

Watch the build log. A successful run prints the recombine's own output:

```
built  : l5r-character-sheet.html
sha256 : 211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64
verify : BYTE-IDENTICAL to the pre-split build

published : dist/index.html
identical to the Phase 0 build: yes
```

When it finishes you get a URL like
`https://l5r-character-sheet-creator.pages.dev`.

## 5. Verify it — from your machine, not mine

**The cloud session cannot reach `*.pages.dev`.** Its egress proxy denies the
connection outright (`gateway answered 403 to CONNECT`), so the request never
leaves the sandbox. That is a limitation of where I run, not a verdict on your
deployment — but it does mean this check has to be run by you.

From the repo root:

```powershell
python build.py
python "Versions\Part F — Cross-Platform Delivery\PART F — Phase 0.5 Hosting & Deployment Pipeline\qa\verify_served.py" https://your-project.pages.dev
```

Standard-library Python only — nothing to install. It fetches the deployed URL
and compares its sha256 against your freshly built `dist/index.html`.

That single comparison is the whole verification. If the bytes match, the
deployed page **is** the file that already passed Phase 0's full behavioural
suite — 14 flows, both test seams, every element id. Identical bytes cannot
behave differently, so there is nothing further to test. If they do not match,
the deploy is stale or came from different sources, and the message tells you
which.

Expect `PASS` on all three checks. Paste the output here either way.

## 6. The one thing only you can do

Open the URL **on your phone, using mobile data rather than your home wifi.**

The roadmap asks for this specifically and neither a desktop nor a cloud
container can stand in for it: it is what proves the site is genuinely reachable
from outside your own network, rather than merely resolving on the machine that
set it up.

---

## What this changes about privacy — read this bit

**Your repository stays private.** Connecting Pages does not alter its
visibility, and the free plan does not require making it public. That part is
settled and I have recorded the pre-connection state (`"visibility": "private"`)
so it can be checked again afterwards.

**The deployed URL is a different matter. It is open and unauthenticated.**
Anyone who has the link can open the sheet — no login, no allowlist. It is the
same trust model as an "anyone with the link" shared document. The repo being
private and the deployed link being unlisted are two separate things, and only
the first is enforced by anything.

For this project that is almost certainly fine: it is a character sheet, and the
whole point is handing the link to your group. But it is worth knowing rather
than assuming, because `*.pages.dev` names are predictable enough that "nobody
will guess it" is not a security control.

**If you would rather the link were not open**, Cloudflare Access can put a login
in front of it — free for up to 50 users, configured under Zero Trust, no code
changes. Say the word and I will write that up as a follow-up. It is out of
scope for this phase as the roadmap defines it, so I have not assumed it.

## Two things that may surprise you later

**Preview deployments.** Cloudflare builds *every* branch it sees, not just
`main`, and gives each its own URL. Because I push to both `main` and
`claude/relaxed-ritchie-2lsy62`, you will see preview deployments appear for the
latter. They are harmless, but they are also open URLs. You can switch this off
under **Settings → Builds & deployments → Preview deployments → None** if you
would rather only `main` deployed.

**A failed build leaves the last good deploy live.** Cloudflare does not take the
site down when a build fails; it keeps serving the previous successful one. That
is usually what you want, but it means a broken build is quiet — the site keeps
working while being out of date. `qa/verify-deployment.js` catches exactly this
by comparing the served bytes against your local build, which is why that check
exists rather than just pinging for a 200.
