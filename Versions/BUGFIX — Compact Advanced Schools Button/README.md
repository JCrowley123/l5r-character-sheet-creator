# Compact Advanced Schools Button

**Status, 28 October 2026:** built for Release 7b.1.1 on branch `claude/release-7b1-1-2026-10-28`; not merged. The release's QA folder is `QA — Release 7b.1.1 2026-10-28`.

Device check E1 of Release 7b.1 (Pass, with your note, 28 October 2026): "Go to Advanced Schools" was too big beside its one-line hint. It now has the Taint card's Check Taint growth button's text, padding and border: 10 px text, 5 px × 10 px padding and the cards' light border. With a mouse it is compact, about 26 px tall (Check Taint growth stays 44 px there, as its card's buttons do); on a touch screen it keeps a 44 px tap height, the same as Check Taint growth.

## How it is built

One stylesheet, no switch (remove it to roll back). No save state.

- `src/css/59.9999999982-bugfix-compact-school-button.css`

R16's pointer (`59.9999999979-bugfix-school-pointer.css`) gives `.ap7-go` a 44 px minimum height everywhere. This layer's rule is more specific (`.ap7-pointer .ap7-go`) and keeps the 44 px only under `@media (pointer:coarse)`, as the release's kickoff set out. A touch laptop whose main pointer is a mouse or trackpad gets the compact button; the sheet's wider tap-target query (`(max-width:768px), (hover:none) and (pointer:coarse)`) would be the alternative if that should change.

## Checks

- `qa/school-button-harness.js`: the button's computed size against the Check Taint growth button, at 1280 px with a mouse and at 390 px on a touch screen. Uses the 7b.1 Matsu test character. Screenshots before (main) and after: `qa/shots-before/`, `qa/shots-after/`.
- Own checks 9/9 on the candidate, and 9/9 at 4× CPU throttling. On main, AB-DESKTOP-FONT, AB-DESKTOP-HEIGHT, AB-DESKTOP-BORDER and AB-PHONE-FONT fail, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`): **main (baseline)** fails exactly 4 pinned checks; **no-coarse**, **no-border** and **tall-desktop** fail exactly 1 each.
- AB-GO-OPENS was corrected after its first run (`qa/first-run.log`). It expected the Identity page to go inert after a real tap on Go; on main and on the candidate alike, the tapped button keeps focus and so keeps Identity live. It now reads the carousel's active tab (Techniques) and the Techniques page's inert flag.
- Removal (`qa/test-removal.py`): 6/6. With no seam block, the refusals tested are a foreign marker inside the stylesheet and the tag left in a retained source.
