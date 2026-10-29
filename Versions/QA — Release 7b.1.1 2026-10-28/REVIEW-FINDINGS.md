# Release 7b.1.1 — code review findings (28–29 October 2026)

One read-only review of the three layers (GP7, GR7, AB7), their QA folders, the seam blocks, the manifest and the
removal-chain entries, after the layers passed their own checks and before the full suite. No correctness defects were
found in GR7 or GP7. Three findings:

1. **AB7 is not the same height as Check Taint growth with a mouse (low; wording).** The Go button is about 26 px tall
   with a mouse; Check Taint growth is 44 px there because its card's buttons keep 44 px everywhere. Compact with a
   mouse is what the kickoff asked for, so the comment and README now say "Check Taint growth's text, padding and
   border; compact with a mouse, 44 px on touch". Comment only; the rule is unchanged (candidate rebuilt, AB7 9/9,
   variants 4/4, removal 6/6 again).
2. **GR7's resistance-check half is tested only through its logic (low; test strength).** Probed for a path through
   the screen: no Ancestor gift is offered on the Willpower check made inside a cast (Ichiro Fureheshu on an Elemental
   Imbalance cast offers nothing there; Seppun's only price problem, a used session, cannot be ticked since R25). The
   half mirrors SSA992's own refund rule and stays defensive, checked by GR-SETTLE-RESIST. Recorded in GR7's README.
   The Maho cast and the ✕ on a three-way prompt reach the same `return false` in the Ancestors' gate as the tested ✕.
3. **Nit: the touch rule keys on `(pointer:coarse)` alone.** Kept as the kickoff set out: the iPhone gets 44 px, and the
   owner's Edge gets the compact button they asked for. The sheet's wider tap-target query is noted in AB7's README as
   the alternative.

Checked and fine (the reviewer's own list): no double refund (SSA992 calls `SSA992.refund` through the property, so
GR7's mark sees it); a Willpower check rolled and failed keeps the slot; no payment from another roll can be picked up;
reset or load still drops a late refund; ✕ on both prompt kinds is caught; Dark Paragon's cancels sit inside SSA992's
wrapper; nothing holds `rollPreviewGate`, `SSA992.refund` or `AS47.renderChoice` early except the picker listener D1
fixes; GP7's Begin training claim holds; the removers differ from AG7's only in their constants; every `SURFACE_RE`
uses base64-safe lookarounds; comments are lean.

Outside this release, noted by the reviewer: if Dark Paragon's Determination is paid and an Ancestor's prompt then
cancels the roll, that Honor or Void Point stays spent (older than 7b.1; not built here).
