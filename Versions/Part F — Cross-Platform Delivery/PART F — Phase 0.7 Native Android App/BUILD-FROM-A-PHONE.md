# Building the APK from an iPhone

You do not need a computer, a Codespace, or Replit. The APK is compiled by
GitHub, on GitHub's machines, and you collect the finished file.

This is why: GitHub's Linux runners already have the Android SDK installed. A
Codespace does not — you would be installing it by hand through a terminal on a
phone, and again every time the container was rebuilt. Replit has the same
problem plus too little memory to run Gradle reliably.

---

## One-time setup: add the signing passphrase

**Do this before the first build.** Without it every build fails on purpose, at
the last step, rather than handing you an APK Android would refuse to install.

1. Open **github.com** in Safari and sign in.
2. Go to the **l5r-character-sheet-creator** repository.
3. Tap **Settings**. If you cannot see it, tap **aA** in the address bar →
   **Request Desktop Website**, then look along the repository's tab row.
4. In the left sidebar: **Secrets and variables** → **Actions**.
5. Tap **New repository secret**.
6. **Name:** `KEYSTORE_PASSPHRASE` — exactly that, capitals and underscore.
7. **Secret:** paste the passphrase given to you in chat.
8. Tap **Add secret**.

GitHub will never show you the value again, which is expected. If it is ever
lost, see *If the passphrase is lost* at the bottom — it is recoverable, but not
freely, so keep a copy somewhere safe.

The repository **Settings** tab does not exist in the GitHub iOS app. Safari is
the only route on a phone.

---

## Getting an APK

A build starts by itself whenever `main` changes, so most of the time one is
already waiting for you. To start one yourself:

1. github.com → the repository → **Actions**.
2. In the left sidebar choose **Android APK**.
3. Tap **Run workflow** → **Run workflow**.

Then wait. The first build takes about eight minutes because Gradle downloads
its dependencies; later ones are quicker.

## Collecting it

1. **Actions** → tap the run at the top of the list.
2. If it has a green tick, scroll to **Artifacts** at the bottom.
3. Tap **l5r-sheet-apk**. Safari saves a `.zip` to **Files**.
4. In Files, tap the `.zip` — iOS unpacks it and leaves
   `l5r-sheet-1.0.<number>.apk` beside it.

Your iPhone cannot install that file; nothing on iOS can. It is for an Android
device, and you already have the iPhone version installed from the web app. To
get it to an Android phone, share the file from Files by whatever route you
normally use — AirDrop will not work, but a messaging app, email, or a cloud
link all will.

## What the person with the Android phone does

1. Open the file on the phone. Android will say installing from this source is
   not allowed — that is normal for anything outside the Play Store.
2. Tap **Settings** in that prompt and allow installs for whichever app is
   opening the file (usually Files or the messaging app).
3. Go back and tap **Install**.

Updating later is the same steps with a newer APK. It installs **over** the old
one and characters are kept, because every build is signed with the same key and
carries a higher version number. That is the whole reason for the passphrase
step above.

---

## If a build fails

Open the failed run and tap the red step. The build prints a numbered progress
line for each of its six stages, so the last one printed tells you where it
stopped.

| Message | Meaning |
|---|---|
| `KEYSTORE_PASSPHRASE not set` | The secret is missing or misnamed. Check for a typo in the name — it is case-sensitive. |
| `bad decrypt` | The secret's value is wrong. Delete it and add it again, taking care not to include a trailing space. |
| `signed: NO` | The APK compiled but came out unsigned; the build stops rather than give you one that cannot be installed. Same two causes as above. |
| Anything in stage 5 | A genuine build error. Send me the failed step's log and I will fix it. |

## If the passphrase is lost

The encrypted keystore in `keystore/release.keystore.enc` cannot be opened
without it, and a new keystore means a **new signing identity**: Android would
then treat the app as a different app, and the new APK would refuse to install
over the old one. Recovering means uninstalling first — which deletes saved
characters unless they are exported first.

So: keep a copy in a password manager. It is the one piece of this project that
cannot be regenerated from the repository.
