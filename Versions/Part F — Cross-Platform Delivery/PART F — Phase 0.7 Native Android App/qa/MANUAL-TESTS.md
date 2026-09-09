# Phase 0.7 — device tests

These are the roadmap's validation suite for the Android app. Every one needs a
physical Android phone, which is why none of them is automated and why this
phase is marked *built, not validated*.

You need: an Android phone (7.0 or newer), and two APKs — any build, then a
later one. `BUILD-FROM-A-PHONE.md` explains how to get them.

If something disappoints, say **which numbered test** and **what you saw**. The
automated side covers the mechanism; these cover how a real phone chooses to
present it.

---

## 1. It installs

1. Open the APK on the phone.
2. Android will refuse and offer a settings link — expected for anything outside
   the Play Store. Allow installs for whichever app opened the file.
3. Tap **Install**.

**Pass:** it installs and appears in the app drawer as **L5R Sheet**.

**If it fails:** note the exact wording. "App not installed" has several distinct
causes and the message distinguishes them — a signature conflict with an existing
copy reads differently from a corrupt download.

## 2. The icon and splash look right

1. Look at it in the app drawer, and on the home screen.
2. Open it and watch the moment before the sheet appears.

**Pass:** the samurai artwork, not a generic Android robot or a white square.
Nothing important cut off at the edges — you should see all five element mons
down the left and the whole of "CHARACTER CREATOR". The brief screen while it
loads shows the same artwork centred on a near-black background.

**Worth reporting either way:** whether your launcher shows it as a circle, a
squircle or a rounded square. The icon is built to survive all three, and this is
the only way to confirm it does.

## 3. It fills the screen

**Pass:** no browser address bar, no URL, nothing identifying it as a web page.
It should be indistinguishable from any other app.

## 4. It works with no network — the important one

1. Open the app once, normally.
2. Turn on **aeroplane mode**. Check WiFi is off too.
3. Close the app fully — swipe it away from the recent-apps list.
4. Open it again.

**Pass:** it opens and works exactly as before. Create a character, roll dice,
switch between sections.

Unlike the web app there is no "Ready to use offline" wait here — everything is
inside the APK from the moment it installs, so this should work on the very first
launch. If it does not, that is a real defect and worth reporting in detail.

## 5. Characters survive closing the app

1. Create a character and fill in enough to recognise it.
2. Close the app fully — swipe it away, do not just background it.
3. Reopen.

**Pass:** the character is exactly as you left it.

## 6. Characters survive an app UPDATE — the one most likely to fail

This is the test the signing setup exists for, and the only one that catches a
whole class of mistake.

1. With the app installed and a character saved, open the **newer** APK.
2. Install it. Android should offer to update in place.
3. Open the app.

**Pass:** it installs **without asking you to uninstall first**, and the
character is still there afterwards.

**Fail, and stop:** if Android says the app is already installed with a different
signature, or if the only way forward is uninstalling. That means two builds were
signed with different keys, and every player would lose their characters on the
next update. Report it before distributing anything further.

## 7. It survives a reboot

Restart the phone, open the app.

**Pass:** the character is still there.

---

## What each result means

| Test | If it fails |
|---|---|
| 1 install | Build or distribution problem — fixable, nothing at stake |
| 2 icons | Cosmetic; the icon generator needs adjusting |
| 3 full screen | Capacitor configuration |
| 4 offline | Real defect — the point of the phase |
| 5 persistence | Serious: character data is not durable |
| 6 update | **Stop distributing.** Signing is wrong and updates will destroy data |
| 7 reboot | Same class as 5 |

Tests 4, 5 and 6 are the roadmap's high-risk rows. Until they have been run on a
real device, Phase 0.7's regression matrix stays open regardless of what the
build says.
