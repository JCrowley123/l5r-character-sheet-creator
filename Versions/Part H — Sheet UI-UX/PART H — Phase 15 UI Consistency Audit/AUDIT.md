# Phase 15 UI consistency audit

Audit: 31 October 2026 · Q1–Q8 accepted: 1 November 2026 · no app build

Owner accepted Q1–Q8 as recommended on 1 November 2026. The approved Phase 15 delivery rules govern implementation: one independently removable finding at a time, owner testing/acceptance before progression, all 15a before 15b, and removal of any finding/group/phase preserves retained work and character data. A13/B15 are accepted retain-current-design decisions; A19/FT-24 and A20/FT-28 are included. Earlier grouped-delivery estimates require revision. Q1–Q8 are settled and must not be asked again without a material change. Implementation has not started; the 8b/8c work order remains in place. Audit evidence remains from Release 8a.1 on 31 October. The first-pass full-suite goal was not achieved: run 1 passed; run 2 failed and was not rerun.

## Method and limits

- Local Release 8a.1 HTML: SHA-256 a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2; 17,459,752 bytes. Starting main 2a3bdf23; app built at 5bfcb18e. No application source, manifest, service worker or production artifact changed.
- Installed Chromium via Playwright. Phone 390 × 844 with touch/mobile emulation; desktop 1440 × 1000 with mouse. Blank and synthetic dense characters, Play and Manage, every applicable carousel page. Combat is Play-only; Spell Slots appears for the caster. Synthetic combinations exercise layout, not character legality.
- Wizard: Kuni Shugenja step by step on phone and desktop, overspent with unfinished choices; Matsu Beastmaster and Order of the Nameless Gift on phone. Characters empty/populated and menu; Search categories, facets, long list and detail; Library empty/import/correction/grid/list/reader/chapter/find; History; representative configuration, technique, court and export dialogs. Desktop auxiliary screens accompany the detailed phone walks.
- Browser print (8 pages) and template export (7 pages) generated; all pages rendered and inspected. The Library PDF is the existing synthetic test-book generator output, not sourcebook text. No new rule or count was inferred from memory.
- 190 original PNGs in screenshots/. This HTML embeds readable WebP copies of every image for offline sharing; Markdown links originals. Per-capture observations, fixtures and helper scripts in qa/. Captures are observations, not automated regression assertions.
- Limits: no iPhone/WebKit or native Edge acceptance run. In screenshot captures document.fonts was empty: fallback rendering was inspected, not final Google-font rendering or formal contrast compliance. Elevated QA separately loaded real Google Fonts in its navigation probe. Font isolation affects only one logic harness, not visual/print testing.
- Owner reports not reproduced here are marked in their findings. FT-49 stuck zoom-out and the first Manage tap need native-device evidence. Exact historical fixtures for two wound entries, Jigoku and the open Skill picker label must be added before implementation; their images here show context, not a fresh reproduction.

## QA — first-pass goal not achieved

- **4× CPU preflight:** 345/345 across nine harnesses; all pinned counts unchanged.
- **Discovery:** 6,673/6,673, fresh execution.
- **Full run 1:** Candidate 6,673/6,673 (173 leaves), retained 6,579/6,579 (169 leaves), no reused leaves. Exact removal to 8a hash 2a9f66ed444f50b001ef0b670ea71cb370fc65fc24146ddf9cd1a7ce1f4a2084.
- **Full run 2 — FAILED:** 6,657 checks completed. Spell Names leaf 140 executed zero of its 16 assertions: page.goto timed out after 60 seconds waiting for load. Wrapper/count failures cascade from that missing leaf. Retained run 2 did not start.
- **Diagnosis:** Deterministic probes show a remote stylesheet can block initialization, and a pending font can hold load after CL11.ready and DOMContentLoaded. The original failure had no request trace: its exact stalled resource remains unknown. This is a demonstrated dependency risk, not proof of that historical request.
- **Scoped correction:** Only the Spell Names logic harness aborts requests to the exact fonts.googleapis.com and fonts.gstatic.com hosts before navigation. It retains load, CL11.ready, every assertion, the 16 total and all negative pins. No global runner/visual network policy changed; no timeout lengthened.
- **Edited harness verification:** 16/16 at 4× CPU. The original baseline plus six mutants each executed all 16 checks and matched exact pinned failures. Earlier diagnostic-preload proof is preserved separately. No full-suite retry followed the failure.
- **Remaining QA status:** The correction has targeted evidence, not two fresh full passes. First-pass success cannot be recovered retrospectively. A later authorized release must perform its normal new-candidate preflight and first-time full validation; these failed results must never be relabelled a pass.

Evidence: [chain](qa/chain-result.json), [run 1](qa/final-run-1/summary.json), [run 2](qa/final-run-2/summary.json), [failed leaf](qa/final-run-2/candidate-leaves/140.json), [investigation](qa/investigation/INVESTIGATION.md), [edited-harness proof](qa/investigation/fixed-proof.json).

## Findings

Sizes: S = bounded presentation; M = shared or multi-screen interaction; L = functional state or print layout. Relative sizes, not separate point estimates. Q1–Q8 are accepted; implementation follows the separate finding-by-finding start/acceptance process.

### A01 · One reminder for each open School choice

**Review, 30 October · 15a · M · Owner ruled the direction; Q1 settles unique reminders**

**Observed:** Kuni and Matsu repeat free-Skill findings in the top Still to choose box and the cards. The monk capture also contains a Lore-subject and three-Kiho reminder only in that box; those are not duplicates.

**Why it matters:** Removing the whole box blindly would lose unfinished work.

**Proposed:** Keep the sheet cards as ruled. Suppress only matching duplicate findings; move unique Lore, Kiho or other open-choice reminders into the same card presentation. Keep XP overspend and Finish confirmation unchanged. Coordinate with 8b/8c provenance; do not implement those pickers here.

Evidence: [phone-wizard-kuni-review-top](screenshots/phone-wizard-kuni-review-top.png), [phone-wizard-matsu-review-findings](screenshots/phone-wizard-matsu-review-findings.png), [phone-wizard-monk-review-findings](screenshots/phone-wizard-monk-review-findings.png), [desktop-wizard-kuni-review-findings](screenshots/desktop-wizard-kuni-review-findings.png)

### A02 · Floating controls cover the sheet

**Phase 9 floating buttons; FT-18 · 15a · M · Q2**

**Observed:** At 390 px the Quick Access circle overlays section titles; the return-to-top control competes with the bottom tabs and the dice launcher covers lower content. Search already has a persistent app-bar entry.

**Why it matters:** Headings and controls lose space exactly where the phone has least room.

**Proposed:** Reserve one compact Quick Access/Dice action strip above the bottom tabs with content padding and safe-area allowance. Show one return-to-top control only after scrolling; no extra destination bar. Preserve existing shortcuts, page position and tab behavior.

Evidence: [phone-management-blank-identity](screenshots/phone-management-blank-identity.png), [phone-management-dense-skills](screenshots/phone-management-dense-skills.png), [phone-play-dense-combat](screenshots/phone-play-dense-combat.png)

### A03 · Top-align columns and simplify long Skill cards

**New layout findings · 15a · M · Q1**

**Observed:** With unequal lists the desktop Advantage column begins far below the Disadvantage column. Phone Skill rows spend much of a viewport on repeated scaffolding and notes.

**Why it matters:** Unnecessary scrolling makes related entries difficult to compare.

**Proposed:** Top-align both columns. Give phone Skill cards a compact name/rank/roll row with secondary editing and Mastery details under a labelled disclosure; retain every value, School tick and action. Do not move Management into another screen.

Evidence: [desktop-management-dense-adv-disadv](screenshots/desktop-management-dense-adv-disadv.png), [desktop-card-hotei](screenshots/desktop-card-hotei.png), [phone-management-dense-skills](screenshots/phone-management-dense-skills.png)

### A04 · A single accessible information pattern

**FT-14, FT-37; info buttons, 25 September · 15a · M · Q3**

**Observed:** Gold italic I, circled i, eye and question-mark treatments coexist. Hotei repeats summary, rule explanation and manual-action text. Inspection also found information buttons nested inside configuration buttons.

**Why it matters:** Repeated prose hides state; nested buttons make keyboard and touch behavior ambiguous.

**Proposed:** Use the existing upright circled i for reference detail on Skills, spells, Advantages and Disadvantages. Make it a sibling button with an accessible name and adequate touch area. Keep selection, cost, current state, unpaid/disabled reasons and actionable warnings visible; put static explanation behind the disclosure. Keep Help/Why cannot I cast semantics distinct where they explain an error.

Evidence: [phone-card-hotei](screenshots/phone-card-hotei.png), [phone-picker-wealthy](screenshots/phone-picker-wealthy.png), [phone-management-dense-skills](screenshots/phone-management-dense-skills.png)

### A05 · Make the limb picker fit the shared controls

**FT-12 · 15a · S · Owner requested consistency; Q1**

**Observed:** Missing Limb uses a small native select beside larger sheet buttons.

**Why it matters:** The field reads as an unrelated widget and is hard to hit.

**Proposed:** Keep the native select, with the shared label, spacing, font and touch height. Do not add a custom menu for a short finite list.

Evidence: [phone-card-missing-limb](screenshots/phone-card-missing-limb.png), [desktop-card-missing-limb](screenshots/desktop-card-missing-limb.png)

### A06 · Separate grant actions and their state

**FT-42 · 15a · S · Owner ruled Phase 15; Q1**

**Observed:** Add koku and Already added sit against one another and compete for emphasis. Wealthy shares the grant pattern.

**Why it matters:** A state acknowledgement looks like another equally important grant action.

**Proposed:** Use a compact action group with a clear gap: primary Add N koku, secondary Already added. Show granted state beside it, retain the one-time guard and reversal behavior, keep touch targets large.

Evidence: [phone-card-zakyo](screenshots/phone-card-zakyo.png), [desktop-card-zakyo](screenshots/desktop-card-zakyo.png), [phone-picker-wealthy](screenshots/phone-picker-wealthy.png)

### A07 · Align the Moon row

**Moon row, 29 October · 15a · S · Owner ruled; Q1**

**Observed:** Full moon tonight, Medium and Change sit on different visual baselines.

**Why it matters:** The setting and the session toggle are difficult to scan as one entry.

**Proposed:** Use a labelled severity row and a separate aligned full-moon toggle; preserve Resist Lord Moon (TN n), state, extra-pip order and all rules.

Evidence: [phone-card-moon](screenshots/phone-card-moon.png), [desktop-card-moon](screenshots/desktop-card-moon.png)

### A08 · Undo a burst of quick point changes

**FT-47 · 15a · M · Owner ruled grouping; Q4 fixes boundary**

**Observed:** Measured Honor 4 + 7 points, three quick + taps, then Undo: it returns to 4 + 9 and Undo disappears. Only the last tap is reverted.

**Why it matters:** An accidental burst needs several reversals but only one is available.

**Proposed:** Group consecutive minus/plus taps on the same characteristic with a rolling five-second gap. Undo restores the value before the first tap. A different card, typed adjustment, recognition, open/save transition or unrelated action ends the group. Keep one coherent History change and matching undo record; pin boundary cases.

Evidence: [phone-undo-after-three-taps](screenshots/phone-undo-after-three-taps.png), [phone-characteristic-controls](screenshots/phone-characteristic-controls.png)

### A09 · Phone text entry and repeated taps

**FT-49 · 15a · M · Owner preserves zoom; Q1**

**Observed:** Rank and Points inputs measured 14 px; adjustment input 16 px. Steppers measured 44 × 44 with touch-action:auto. The iPhone zoom failures are owner reports, not reproduced in Chromium.

**Why it matters:** Small input text and default repeated-tap behavior are plausible contributors; the stuck zoom-out case remains unexplained.

**Proposed:** Use at least 16 px editable input text on phones and touch-action:manipulation on buttons/steppers only. Preserve pinch zoom and ordinary double-tap zoom elsewhere. Validate all three reported cases on Safari and the installed iPhone app before calling FT-49 fixed; do not force-reset viewport scale.

Evidence: [phone-characteristic-controls](screenshots/phone-characteristic-controls.png)

### A10 · Cross-page actions must move focus

**FT-50, FT-52 · 15a · M · Owner ruled; Q1**

**Observed:** Owner reported the Advanced School button below its hint baseline and focus remaining on Identity. Source inspection confirms AP7.go scrolls Techniques but never moves focus. The dense audit fixture does not meet an Advanced School prerequisite, so the button is hidden in these screenshots.

**Why it matters:** Keyboard and assistive-technology users can remain on the old page after navigation.

**Proposed:** Centre the hint and compact desktop button in a wrapping row; retain 44 px touch height. On every cross-page action, focus the destination heading after carousel settlement, without reopening the keyboard. Test source-page inertness and return navigation.

Evidence: [desktop-management-dense-identity](screenshots/desktop-management-dense-identity.png), [desktop-management-dense-techniques](screenshots/desktop-management-dense-techniques.png)

### A11 · Space explanatory text below fields

**FT-51 · 15a · S · Owner ruled; Q1**

**Observed:** Insight and Spent XP explanations sit hard against the fields above.

**Why it matters:** Labels, values and supporting notes blend together.

**Proposed:** Apply a shared small helper-text gap and readable line height to these field groups, then inspect equivalent groups across the sheet.

Evidence: [desktop-management-dense-identity](screenshots/desktop-management-dense-identity.png), [phone-identity-top](screenshots/phone-identity-top.png)

### A12 · Collapse resistance choices into one line

**R6 · 15a · M · Owner already ruled closed Resisting?**

**Observed:** Honor resistance choices for Intimidation, Temptation and Fear consume several lines in the roll preview.

**Why it matters:** Situational choices overwhelm the roll being prepared.

**Proposed:** One initially closed Resisting? disclosure, with selected state/count visible in its summary. Expand to the existing labelled choices; preserve all bonus calculations, exclusivity and reset behavior. A selected resistance must never become invisible.

Evidence: [phone-roll-preview](screenshots/phone-roll-preview.png), [phone-resisting-rows](screenshots/phone-resisting-rows.png)

### A13 · Keep campaign wounds beside Earth

**FT-48 · Declined change · S · Q5**

**Observed:** Campaign multipliers and the threshold preview are beside Earth in Manage. Combat is a Play-only page.

**Why it matters:** Moving the editor to Combat would cut across the accepted mode split.

**Proposed:** Retain the editor and preview here; keep Combat’s plain pointer to Rings & Traits. Revisit location only if the later separate-Manage review changes the mode structure. No second editable copy.

Evidence: [phone-wound-settings](screenshots/phone-wound-settings.png), [phone-management-dense-rings-traits](screenshots/phone-management-dense-rings-traits.png), [phone-play-dense-combat](screenshots/phone-play-dense-combat.png)

### A14 · Explain wound penalties once

**Wound text, 8 October · 15b · S · Q1**

**Observed:** The owner’s two-wound-entry example is correct but confusing; current dense captures cover the track, not that exact two-entry state.

**Why it matters:** Base rank penalty and modifiers can be mistaken for one another.

**Proposed:** Use one net penalty on the track and an info breakdown showing rank penalty, each signed modifier and total. Preserve the existing arithmetic and reduced-penalty floors. Add the owner’s two-entry fixture before building; this is presentation only.

Evidence: [phone-play-dense-combat](screenshots/phone-play-dense-combat.png), [phone-quick-access](screenshots/phone-quick-access.png)

### A15 · Court chips should be direct controls

**A04 device pass · 15a · S · Recorded recommendation; Q3**

**Observed:** The row has court chips alongside the configuration action; adding a court requires entering the editor.

**Why it matters:** The visual chip suggests an action without a consistently sized target.

**Proposed:** Make each whole chip a labelled selection button; place Add court on the row. Keep rename/remove in the editor and retain the selected/in-session state.

Evidence: [phone-court-chips](screenshots/phone-court-chips.png), [phone-picker-courts](screenshots/phone-picker-courts.png)

### A16 · Remove the redundant bottom information button

**A01–A16 device pass, seven pickers · 15a · S · Recorded recommendation; Q3**

**Observed:** The older device pass identified a bottom i duplicating option text and the row’s info control. Current representative pickers still mix reference and configuration controls.

**Why it matters:** A generic extra information action adds visual noise without a clear subject.

**Proposed:** Remove the redundant bottom i only from the seven identified legacy pickers; keep option explanations and row information. Inventory those seven against their historical test IDs before editing, and retain a single accessible way to every explanation.

Evidence: [phone-picker-wealthy](screenshots/phone-picker-wealthy.png), [phone-picker-courts](screenshots/phone-picker-courts.png), [phone-technique-picker](screenshots/phone-technique-picker.png)

### A17 · Fill the splash without cutting off the title

**FT-41 · 15a · M · Owner ruled fill; Q6**

**Observed:** The image uses object-fit:contain. This phone ratio nearly matches the portrait image; owner evidence records paper bands at other phone/laptop ratios.

**Why it matters:** Presentation changes with aspect ratio, especially desktop and rotation.

**Proposed:** Use cover with separate portrait/landscape focal positions that keep the seal/title in view, or a matching edge extension if cover cannot preserve them. Test 390×844, 844×390, 1536×864 and narrow landscape. Keep first-paint coverage and readiness/error dismissal exactly as shipped.

Evidence: [phone-splash](screenshots/phone-splash.png)

### A18 · Investigate the first Manage tap on an iPhone

**First Manage tap, 1 October · 15a · S investigation · Owner report; Q1**

**Observed:** The historical iPhone delay was not measurable in prior headless tests. This desktop Chromium audit does not reproduce an iPhone timing failure.

**Why it matters:** A cosmetic rewrite without a reproduction could add risk and solve nothing.

**Proposed:** Reserve a bounded instrumented native-device check: input event to mode-painted frame on first and second taps, same character. Fix only a demonstrated bottleneck. If it does not recur, close as not reproduced with the measurements; no arbitrary delay or full mode redesign.

Evidence: [phone-management-blank-identity](screenshots/phone-management-blank-identity.png), [desktop-management-blank-identity](screenshots/desktop-management-blank-identity.png)

### A19 · Undo the most recent Void-card spend

**FT-24 · 15a · L · Design ruled 9 October; Q7 approves inclusion**

**Observed:** The parked functional request is wider than layout: card spending has no single action that restores the pip, removes its bonus and drops its pending Willpower roll. The screenshots are context, not a new failure reproduction.

**Why it matters:** A mistaken spend is difficult to reverse safely.

**Proposed:** A separate removable functional layer: Undo the latest card spend until the next roll, Next Round or Reset. Restore the exact resource and pending effect once, including Touch of the Void. Do not conflate this with an after-preview refund or general History undo. Pin invalidation and double-undo cases.

Evidence: [phone-play-dense-combat](screenshots/phone-play-dense-combat.png)

### A20 · Choose a Trait for one Skill roll

**FT-28 · 15a · L · Parked by owner; Q7 approves exact scope**

**Observed:** The Skill row rolls its default Trait; alternate pairings were documented in the existing Skill Traits audit. No new sourcebook ruling was made here.

**Why it matters:** Players must switch to the generic dice tray for an alternate pairing.

**Proposed:** An optional Trait selector in the Skill roll preview for that roll only, defaulting to the accepted catalogue Trait. Clearly label a nondefault choice, reset on next opening, preserve Skill/emphasis/unskilled modifiers. Do not change saved Skill data or calculate career XP. Re-read AUDIT — Skill Traits and the cited pages before implementing any rule-dependent behavior.

Evidence: [phone-management-dense-skills](screenshots/phone-management-dense-skills.png)

### B01 · Use short thematic check labels

**FT-11 · 15b · S · Q8**

**Observed:** Generic Check labels and inconsistent phrasing obscure the action’s purpose.

**Why it matters:** A player must reread the entry before pressing a routine button.

**Proposed:** Proposed labels: Brash — Resist insult; Overconfident — Measure the enemy; Can’t Lie — Discretion check; Contrary — Cooperate; Rumormonger — Resist gossip; Soft-Hearted — Resolve check; Lost Love — Steady yourself — Spend Void. Keep TN visible and retain all mechanical conditions and costs.

Evidence: [phone-card-checks](screenshots/phone-card-checks.png), [desktop-card-checks](screenshots/desktop-card-checks.png)

### B02 · State actual and catalogue price consistently

**FT-13 · 15b · S · Owner requested consistency; Q1**

**Observed:** The owner recorded inconsistent changed-price wording for Social Position and Kharmic Tie with Blissful Betrothal. The synthetic dense fixture is not a pricing-rules proof.

**Why it matters:** The player cannot easily tell whether a displayed cost includes the discount.

**Proposed:** Use Actual N XP · catalogue M XP with the reason in information detail, consistently with Clan-priced rows. Read the existing price engine’s outputs; do not recompute or change prices in this layer.

Evidence: [phone-management-dense-adv-disadv](screenshots/phone-management-dense-adv-disadv.png)

### B03 · Give Leadership a concise action label

**FT-19 · 15b · S · Q8**

**Observed:** Leadership’s action includes the long School Rank + 1k1 formula as well as descriptive text.

**Why it matters:** The button is difficult to scan at phone width.

**Proposed:** Label it Lead an ally. Put the formula and use condition beside it or in its information detail, while keeping any required current amount visible before activation.

Evidence: [phone-management-dense-adv-disadv](screenshots/phone-management-dense-adv-disadv.png), [desktop-management-dense-adv-disadv](screenshots/desktop-management-dense-adv-disadv.png)

### B04 · Avoid repeating Blind under Armor TN

**FT-20 · 15b · S · Q8**

**Observed:** Quick Access adds a Blind explanation below Armor TN, whose existing breakdown already explains the base.

**Why it matters:** The same rule competes with the current value.

**Proposed:** Remove only the duplicate line once the Armor TN information exposes the complete Blind contribution; keep the value and a clearly reachable breakdown.

Evidence: [phone-quick-access](screenshots/phone-quick-access.png)

### B05 · Keep success wording restrained

**FT-22 · 15b · S · Q8**

**Observed:** You keep your head is the owner-reported Touch of the Void success wording. The roll-preview image is context; no random success was forced for this audit.

**Why it matters:** Its tone differs from the surrounding rules feedback.

**Proposed:** Use You remain in control. Preserve the roll result, TN, failure condition and cost messages.

Evidence: [phone-roll-preview](screenshots/phone-roll-preview.png)

### B06 · Reduce repeated Clan and School prose

**FT-43; Clan & School clutter · 15b · S · Owner ruled Phase 15; Q1**

**Observed:** The page repeats School identity, application guidance and reference prose around its controls.

**Why it matters:** The player has to work through the same context before finding an action.

**Proposed:** Keep one identity summary and one Apply/Cancel instruction in Manage; place background/reference prose behind information. Play retains the selected School and useful Technique link. Do not remove pending-change or School-choice warnings.

Evidence: [phone-management-dense-clan-school](screenshots/phone-management-dense-clan-school.png), [desktop-management-dense-clan-school](screenshots/desktop-management-dense-clan-school.png)

### B07 · Keep Search controls reachable while scrolling

**FT-17, FT-18 · 15b · M · Q2**

**Observed:** Deep result scrolling loses the query and filters while the app bar remains at the top. Search already exists in that bar, so another global destination bar would duplicate it.

**Why it matters:** Changing a query requires returning through a long list.

**Proposed:** A compact sticky query/category region within Search, optional filters in a disclosure, and a return-to-top action in that region. Keep result scroll and focus restoration when closing a detail. Retain the existing global Search entry; decline a second bottom navigation bar.

Evidence: [phone-search-home](screenshots/phone-search-home.png), [phone-search-scrolled](screenshots/phone-search-scrolled.png), [desktop-search-home](screenshots/desktop-search-home.png)

### B08 · Clarify Search facets without discarding useful filters

**FT-25, FT-26, FT-27 · 15b · M · Q5**

**Observed:** Cost has equal prominence to primary facets. Weapon Type is Weapon/Arrow rather than a kind, while Skill already groups kinds. Clans and Families are mixed.

**Why it matters:** Filters take space and their labels do not always match the user’s question.

**Proposed:** Move Cost into More filters, retaining its capability. Use Skill as the primary weapon-kind filter and label the existing Weapon/Arrow discriminator Item type in More filters. Add All / Clans / Families. Preserve combinations, counts and clear/reset behavior.

Evidence: [phone-search-advantages](screenshots/phone-search-advantages.png), [phone-search-weapons](screenshots/phone-search-weapons.png), [phone-search-clans](screenshots/phone-search-clans.png)

### B09 · Refresh Skill picker Trait labels

**FT-29 · 15b · S · Owner explicitly parked; Q1**

**Observed:** The owner recorded Intimidation labelled Willpower in the picker while its added row uses Awareness. Current row captured; this audit did not recapture the open picker label.

**Why it matters:** Conflicting labels undermine trust even when the roll is correct.

**Proposed:** Generate picker labels from the final corrected catalogue, after later layers apply. Compare every picker Trait to its resulting row; change labels only. Keep this independent of FT-28.

Evidence: [phone-management-dense-skills](screenshots/phone-management-dense-skills.png)

### B10 · Remove old-name tags but retain search aliases

**FT-36 · 15b · S · Tag removal requested; Q5 retains aliases**

**Observed:** Formerly labels are still displayed for the two renamed spells.

**Why it matters:** Migration wording keeps taking room after the correction is familiar.

**Proposed:** Hide Formerly tags in results and details, retaining both old names as search aliases and old-save/scroll compatibility. The Spell Names test’s display assertion will need a switch-aware expectation with its count unchanged; the alias checks must stay.

Evidence: [phone-search-former-spell](screenshots/phone-search-former-spell.png)

### B11 · Search must say four different Blackmail targets

**Scorpion Instigator, 29 October · 15b · S · Already assigned 15b**

**Observed:** Search lists Blackmail (Advantage), while the School picker’s accepted requirement is four different people.

**Why it matters:** A player preparing for the School sees an incomplete requirement.

**Proposed:** Use the accepted picker’s four-different-people wording in Search with the existing citation. Do not alter eligibility, counting, or reintroduce the removed confirmation.

Evidence: [phone-search-instigator](screenshots/phone-search-instigator.png)

### B12 · Make browser print complete and compact

**FT-30, FT-35 · 15b · L · Owner ruled print work; Q1**

**Observed:** The dense browser PDF has 8 pages: large gaps, an overwide Rings row, an empty Skills Roll column and screen actions on paper. The long weapon name and notes now wrap; the old clipping failure was not reproduced. The 7-page template PDF uses continuation references for overflow.

**Why it matters:** Paper is wasted and interactive controls look like character information.

**Proposed:** Fix Rings width first; hide actions, spinners, empty Roll columns and screen-only instructions while retaining character state. Top-align Advantage columns, avoid unnecessary forced page breaks and suppress truly empty panels. Guard long weapon/notes and all carried state. No fixed page-count target: complete readable output wins. Preserve the accepted template and its continuation pages; do not compress its intentional writing space.

Evidence: [browser-print-dense-01](screenshots/browser-print-dense-01.png), [browser-print-dense-03](screenshots/browser-print-dense-03.png), [browser-print-dense-04](screenshots/browser-print-dense-04.png), [browser-print-dense-05](screenshots/browser-print-dense-05.png), [browser-print-dense-07](screenshots/browser-print-dense-07.png), [template-export-dense-07](screenshots/template-export-dense-07.png)

### B13 · Move and update the colophon

**Phase 9 colophon · 15b · S · Q2**

**Observed:** Browser print still carries the old Part E build line and backup guidance; the colophon adds competing text near navigation.

**Why it matters:** Obsolete build wording makes the current release look stale.

**Proposed:** Put current provenance/credits in About from the existing menu, remove stale or screen-only copy from print, and preserve required attribution/license content in an accessible location. Avoid adding another floating control.

Evidence: [browser-print-dense-08](screenshots/browser-print-dense-08.png), [phone-play-dense-background](screenshots/phone-play-dense-background.png)

### B14 · Separate Jigoku’s total from its calculation

**A01–A16 Lost wording · 15b · S · Recorded recommendation; Q8**

**Observed:** The historical device pass proposed a clearer Lost label; the dense fixture did not include Jigoku and this wording was not freshly reproduced.

**Why it matters:** A condition label and the arithmetic should be distinguishable.

**Proposed:** Use +8 to total — Taint Rank 4 × 2 (Lost) for that example, generated from current values; never hard-code 8 or Rank 4. Preserve the actual formula and gate.

Evidence: [phone-resisting-rows](screenshots/phone-resisting-rows.png)

### B15 · Retain the Library’s book correction dropdown

**FT-40; Library mock-up list · Declined change · S · Q5**

**Observed:** The native correction select has 16 named books plus Another book. It fits this screen and the recognition/Change flow matches the agreed mock-up. The imported PDF was a synthetic test fixture.

**Why it matters:** A second custom search picker adds complexity without evidence that this finite list is hard to use.

**Proposed:** Keep the dropdown and recognition summary; revisit a searchable picker if the catalogue grows substantially or native-device use shows a problem. The broader mock-up change list is already implemented, so do not reopen it as Phase 15 work.

Evidence: [phone-library-correction](screenshots/phone-library-correction.png), [phone-library-recognised](screenshots/phone-library-recognised.png), [desktop-library-empty](screenshots/desktop-library-empty.png)

### B16 · Keep a citation range together

**New Search citation finding · 15b · S · Q1**

**Observed:** The Not in Library badge interrupts the displayed page range between pp.249 and -250.

**Why it matters:** The reference becomes harder to read and can look like two separate citations.

**Proposed:** Render the whole book/page-range link, then its Library state badge as a sibling. Keep the link destination and missing-book action unchanged.

Evidence: [phone-search-instigator](screenshots/phone-search-instigator.png)

## Every parked item has a destination

Later owner rulings override older roadmap paragraphs; closed work remains a regression boundary.

| Item | Disposition |
|---|---|
| FT-01 | Closed in 7b.1 (R14): held Skills omitted; no new build. |
| FT-02, FT-03 | Declined for Phase 15: future progression/planner remain after-project reviews (R18). |
| FT-04, FT-05, FT-06 | Closed by R15/R16 and 7b.1; pointer presentation/focus is A10. |
| FT-07 | Rules/counting closed in 7b.2; remaining Search text is B11 (15b). |
| FT-08 | No recurrence captured; retain R19’s conditional investigation, not a speculative Phase 15 change. |
| FT-09, FT-33 | Closed by Cycle 7a characteristic work; new Undo/zoom observations are A08/A09. |
| FT-10 | Closed by R20 reading; no Phase 15 work. |
| FT-11 | B01 · 15b |
| FT-12 | A05 · 15a |
| FT-13 | B02 · 15b |
| FT-14 | A04 · 15a |
| FT-15 | Closed by Search Facets; preserve ordering. |
| FT-16 | Declined for Phase 15: separate catalogue cycle G under R12; no broad rewriting here. |
| FT-17 | B07 · 15b |
| FT-18 | A02/B07; keep app-bar Search, decline duplicate destination bar. |
| FT-19 | B03 · 15b |
| FT-20 | B04 · 15b |
| FT-21 | Closed in 6a; retain preview-scroll regression. |
| FT-22 | B05 · 15b |
| FT-23 | Closed in 6a; preserve dice-total semantics. |
| FT-24 | A19 · 15a functional layer, Q7 |
| FT-25, FT-26, FT-27 | B08 · 15b; capability retained, presentation clarified. |
| FT-28 | A20 · 15a functional layer, Q7 |
| FT-29 | B09 · 15b |
| FT-30 | B12 · 15b; earlier weapon clipping fixed, pagination remains. |
| FT-31 | Closed by original-template PDF in 7a; preserve templates/continuations. |
| FT-32 | Closed by 0.6.1–0.6.3; only splash fit is A17. |
| FT-34 | Closed by Cycle 1 focus fix; preserve detail return focus/scroll. |
| FT-35 | B12 · 15b |
| FT-36 | B10 · 15b |
| FT-37 | A04 · 15a |
| FT-38 | Closed in 6a; keep disabled Void reasons visible. |
| FT-39 | R10 automatic spending shipped where supported; every-Technique scope declined here, after project. |
| FT-40 | B15 · retain dropdown, decline redesign at present size. |
| FT-41 | A17 · 15a |
| FT-42 | A06 · 15a |
| FT-43 | B06 · 15b |
| FT-44, FT-45 | Closed in 6a; no repeat build. |
| FT-46 | Reference entries shipped in 7b.2; rules implementation after project, outside Phase 15. |
| FT-47 | A08 · 15a |
| FT-48 | A13 · retain current location, decline relocation. |
| FT-49 | A09 · 15a, native-device validation required. |
| FT-50, FT-52 | A10 · 15a |
| FT-51 | A11 · 15a |
| R6 | A12 · 15a; already ruled closed Resisting? |
| Review duplicate box | A01 · 15a, preserve unique Lore/Kiho reminders. |
| Moon alignment | A07 · 15a |
| Phase 9 floating controls / colophon | A02 · 15a / B13 · 15b |
| Skills/Spells/Advantages/Disadvantages info; older gold i | A04 · 15a |
| First Manage tap | A18 · bounded 15a device investigation |
| Clan & School clutter | B06 · 15b |
| Wound track wording | A14 · 15b; R5 arithmetic already shipped. |
| A01–A16 bottom i / A04 court chips / Lost wording | A16/A15 · 15a; B14 · 15b. A03/A09 rules and A14 spill are separate parked rule reviews, not silently included. |
| Library mock-up change list | Already applied; B15 explicitly reviews the one remaining FT-40 choice. |
| R8 separate Manage / R9 Characters Print | R8 remains after Phase 15; R9 closed because Export PDF exists. |
| iPhone home-screen printing observation | No Phase 15 code change proposed; native behavior not retested. Preserve working export routes, do not turn the historical platform claim into a new verified finding. |
| 8a.1 provenance caveats / 8b / 8c | Assigned to work-order steps 3a/3b, not bundled into Phase 15. |
| Older slow-storage save race | Remains parked under the owner’s 28 October ruling; fix before introducing slower storage, not as UI work. |

## Coverage gallery

- [browser-print-dense-01](screenshots/browser-print-dense-01.png)
- [browser-print-dense-02](screenshots/browser-print-dense-02.png)
- [browser-print-dense-03](screenshots/browser-print-dense-03.png)
- [browser-print-dense-04](screenshots/browser-print-dense-04.png)
- [browser-print-dense-05](screenshots/browser-print-dense-05.png)
- [browser-print-dense-06](screenshots/browser-print-dense-06.png)
- [browser-print-dense-07](screenshots/browser-print-dense-07.png)
- [browser-print-dense-08](screenshots/browser-print-dense-08.png)
- [desktop-card-checks](screenshots/desktop-card-checks.png)
- [desktop-card-hotei](screenshots/desktop-card-hotei.png)
- [desktop-card-missing-limb](screenshots/desktop-card-missing-limb.png)
- [desktop-card-moon](screenshots/desktop-card-moon.png)
- [desktop-card-zakyo](screenshots/desktop-card-zakyo.png)
- [desktop-characters](screenshots/desktop-characters.png)
- [desktop-export-dialog](screenshots/desktop-export-dialog.png)
- [desktop-history](screenshots/desktop-history.png)
- [desktop-library-empty](screenshots/desktop-library-empty.png)
- [desktop-management-blank-adv-disadv](screenshots/desktop-management-blank-adv-disadv.png)
- [desktop-management-blank-background](screenshots/desktop-management-blank-background.png)
- [desktop-management-blank-clan-school](screenshots/desktop-management-blank-clan-school.png)
- [desktop-management-blank-equipment](screenshots/desktop-management-blank-equipment.png)
- [desktop-management-blank-identity](screenshots/desktop-management-blank-identity.png)
- [desktop-management-blank-rings-traits](screenshots/desktop-management-blank-rings-traits.png)
- [desktop-management-blank-skills](screenshots/desktop-management-blank-skills.png)
- [desktop-management-blank-techniques](screenshots/desktop-management-blank-techniques.png)
- [desktop-management-dense-adv-disadv](screenshots/desktop-management-dense-adv-disadv.png)
- [desktop-management-dense-background](screenshots/desktop-management-dense-background.png)
- [desktop-management-dense-clan-school](screenshots/desktop-management-dense-clan-school.png)
- [desktop-management-dense-equipment](screenshots/desktop-management-dense-equipment.png)
- [desktop-management-dense-identity](screenshots/desktop-management-dense-identity.png)
- [desktop-management-dense-rings-traits](screenshots/desktop-management-dense-rings-traits.png)
- [desktop-management-dense-skills](screenshots/desktop-management-dense-skills.png)
- [desktop-management-dense-spell-slots](screenshots/desktop-management-dense-spell-slots.png)
- [desktop-management-dense-techniques](screenshots/desktop-management-dense-techniques.png)
- [desktop-play-blank-adv-disadv](screenshots/desktop-play-blank-adv-disadv.png)
- [desktop-play-blank-background](screenshots/desktop-play-blank-background.png)
- [desktop-play-blank-clan-school](screenshots/desktop-play-blank-clan-school.png)
- [desktop-play-blank-combat](screenshots/desktop-play-blank-combat.png)
- [desktop-play-blank-equipment](screenshots/desktop-play-blank-equipment.png)
- [desktop-play-blank-identity](screenshots/desktop-play-blank-identity.png)
- [desktop-play-blank-rings-traits](screenshots/desktop-play-blank-rings-traits.png)
- [desktop-play-blank-skills](screenshots/desktop-play-blank-skills.png)
- [desktop-play-blank-techniques](screenshots/desktop-play-blank-techniques.png)
- [desktop-play-dense-adv-disadv](screenshots/desktop-play-dense-adv-disadv.png)
- [desktop-play-dense-background](screenshots/desktop-play-dense-background.png)
- [desktop-play-dense-clan-school](screenshots/desktop-play-dense-clan-school.png)
- [desktop-play-dense-combat](screenshots/desktop-play-dense-combat.png)
- [desktop-play-dense-equipment](screenshots/desktop-play-dense-equipment.png)
- [desktop-play-dense-identity](screenshots/desktop-play-dense-identity.png)
- [desktop-play-dense-rings-traits](screenshots/desktop-play-dense-rings-traits.png)
- [desktop-play-dense-skills](screenshots/desktop-play-dense-skills.png)
- [desktop-play-dense-spell-slots](screenshots/desktop-play-dense-spell-slots.png)
- [desktop-play-dense-techniques](screenshots/desktop-play-dense-techniques.png)
- [desktop-search-home](screenshots/desktop-search-home.png)
- [desktop-theme-lion](screenshots/desktop-theme-lion.png)
- [desktop-theme-phoenix](screenshots/desktop-theme-phoenix.png)
- [desktop-theme-scorpion](screenshots/desktop-theme-scorpion.png)
- [desktop-wizard-kuni-advantages-disadvantages-4](screenshots/desktop-wizard-kuni-advantages-disadvantages-4.png)
- [desktop-wizard-kuni-clan](screenshots/desktop-wizard-kuni-clan.png)
- [desktop-wizard-kuni-family](screenshots/desktop-wizard-kuni-family.png)
- [desktop-wizard-kuni-name](screenshots/desktop-wizard-kuni-name.png)
- [desktop-wizard-kuni-overspent](screenshots/desktop-wizard-kuni-overspent.png)
- [desktop-wizard-kuni-review-5](screenshots/desktop-wizard-kuni-review-5.png)
- [desktop-wizard-kuni-review-findings](screenshots/desktop-wizard-kuni-review-findings.png)
- [desktop-wizard-kuni-school](screenshots/desktop-wizard-kuni-school.png)
- [desktop-wizard-kuni-skills-0](screenshots/desktop-wizard-kuni-skills-0.png)
- [desktop-wizard-kuni-skills-1](screenshots/desktop-wizard-kuni-skills-1.png)
- [desktop-wizard-kuni-spells-2](screenshots/desktop-wizard-kuni-spells-2.png)
- [desktop-wizard-kuni-spells-3](screenshots/desktop-wizard-kuni-spells-3.png)
- [desktop-wizard-kuni-traits](screenshots/desktop-wizard-kuni-traits.png)
- [phone-card-checks](screenshots/phone-card-checks.png)
- [phone-card-hotei](screenshots/phone-card-hotei.png)
- [phone-card-missing-limb](screenshots/phone-card-missing-limb.png)
- [phone-card-moon](screenshots/phone-card-moon.png)
- [phone-card-zakyo](screenshots/phone-card-zakyo.png)
- [phone-characteristic-controls](screenshots/phone-characteristic-controls.png)
- [phone-characters-empty](screenshots/phone-characters-empty.png)
- [phone-characters-menu](screenshots/phone-characters-menu.png)
- [phone-characters-populated](screenshots/phone-characters-populated.png)
- [phone-court-chips](screenshots/phone-court-chips.png)
- [phone-history](screenshots/phone-history.png)
- [phone-identity-top](screenshots/phone-identity-top.png)
- [phone-library-add-empty](screenshots/phone-library-add-empty.png)
- [phone-library-chapters](screenshots/phone-library-chapters.png)
- [phone-library-correction](screenshots/phone-library-correction.png)
- [phone-library-empty](screenshots/phone-library-empty.png)
- [phone-library-find](screenshots/phone-library-find.png)
- [phone-library-grid](screenshots/phone-library-grid.png)
- [phone-library-menu](screenshots/phone-library-menu.png)
- [phone-library-reader](screenshots/phone-library-reader.png)
- [phone-library-recognised](screenshots/phone-library-recognised.png)
- [phone-library-shelf](screenshots/phone-library-shelf.png)
- [phone-manage-clan-school](screenshots/phone-manage-clan-school.png)
- [phone-management-blank-adv-disadv](screenshots/phone-management-blank-adv-disadv.png)
- [phone-management-blank-background](screenshots/phone-management-blank-background.png)
- [phone-management-blank-clan-school](screenshots/phone-management-blank-clan-school.png)
- [phone-management-blank-equipment](screenshots/phone-management-blank-equipment.png)
- [phone-management-blank-identity](screenshots/phone-management-blank-identity.png)
- [phone-management-blank-rings-traits](screenshots/phone-management-blank-rings-traits.png)
- [phone-management-blank-skills](screenshots/phone-management-blank-skills.png)
- [phone-management-blank-techniques](screenshots/phone-management-blank-techniques.png)
- [phone-management-dense-adv-disadv](screenshots/phone-management-dense-adv-disadv.png)
- [phone-management-dense-background](screenshots/phone-management-dense-background.png)
- [phone-management-dense-clan-school](screenshots/phone-management-dense-clan-school.png)
- [phone-management-dense-equipment](screenshots/phone-management-dense-equipment.png)
- [phone-management-dense-identity](screenshots/phone-management-dense-identity.png)
- [phone-management-dense-rings-traits](screenshots/phone-management-dense-rings-traits.png)
- [phone-management-dense-skills](screenshots/phone-management-dense-skills.png)
- [phone-management-dense-spell-slots](screenshots/phone-management-dense-spell-slots.png)
- [phone-management-dense-techniques](screenshots/phone-management-dense-techniques.png)
- [phone-picker-courts](screenshots/phone-picker-courts.png)
- [phone-picker-wealthy](screenshots/phone-picker-wealthy.png)
- [phone-play-blank-adv-disadv](screenshots/phone-play-blank-adv-disadv.png)
- [phone-play-blank-background](screenshots/phone-play-blank-background.png)
- [phone-play-blank-clan-school](screenshots/phone-play-blank-clan-school.png)
- [phone-play-blank-combat](screenshots/phone-play-blank-combat.png)
- [phone-play-blank-equipment](screenshots/phone-play-blank-equipment.png)
- [phone-play-blank-identity](screenshots/phone-play-blank-identity.png)
- [phone-play-blank-rings-traits](screenshots/phone-play-blank-rings-traits.png)
- [phone-play-blank-skills](screenshots/phone-play-blank-skills.png)
- [phone-play-blank-techniques](screenshots/phone-play-blank-techniques.png)
- [phone-play-dense-adv-disadv](screenshots/phone-play-dense-adv-disadv.png)
- [phone-play-dense-background](screenshots/phone-play-dense-background.png)
- [phone-play-dense-clan-school](screenshots/phone-play-dense-clan-school.png)
- [phone-play-dense-combat](screenshots/phone-play-dense-combat.png)
- [phone-play-dense-equipment](screenshots/phone-play-dense-equipment.png)
- [phone-play-dense-identity](screenshots/phone-play-dense-identity.png)
- [phone-play-dense-rings-traits](screenshots/phone-play-dense-rings-traits.png)
- [phone-play-dense-skills](screenshots/phone-play-dense-skills.png)
- [phone-play-dense-spell-slots](screenshots/phone-play-dense-spell-slots.png)
- [phone-play-dense-techniques](screenshots/phone-play-dense-techniques.png)
- [phone-quick-access](screenshots/phone-quick-access.png)
- [phone-resisting-rows](screenshots/phone-resisting-rows.png)
- [phone-roll-preview](screenshots/phone-roll-preview.png)
- [phone-search-advantages](screenshots/phone-search-advantages.png)
- [phone-search-clans](screenshots/phone-search-clans.png)
- [phone-search-former-spell](screenshots/phone-search-former-spell.png)
- [phone-search-home](screenshots/phone-search-home.png)
- [phone-search-instigator](screenshots/phone-search-instigator.png)
- [phone-search-scrolled](screenshots/phone-search-scrolled.png)
- [phone-search-spells](screenshots/phone-search-spells.png)
- [phone-search-weapons](screenshots/phone-search-weapons.png)
- [phone-splash](screenshots/phone-splash.png)
- [phone-technique-picker](screenshots/phone-technique-picker.png)
- [phone-undo-after-three-taps](screenshots/phone-undo-after-three-taps.png)
- [phone-wizard-kuni-advantages-disadvantages-3](screenshots/phone-wizard-kuni-advantages-disadvantages-3.png)
- [phone-wizard-kuni-clan](screenshots/phone-wizard-kuni-clan.png)
- [phone-wizard-kuni-family](screenshots/phone-wizard-kuni-family.png)
- [phone-wizard-kuni-finish-confirm](screenshots/phone-wizard-kuni-finish-confirm.png)
- [phone-wizard-kuni-name](screenshots/phone-wizard-kuni-name.png)
- [phone-wizard-kuni-overspent](screenshots/phone-wizard-kuni-overspent.png)
- [phone-wizard-kuni-review-4](screenshots/phone-wizard-kuni-review-4.png)
- [phone-wizard-kuni-review-bottom](screenshots/phone-wizard-kuni-review-bottom.png)
- [phone-wizard-kuni-review-top](screenshots/phone-wizard-kuni-review-top.png)
- [phone-wizard-kuni-school](screenshots/phone-wizard-kuni-school.png)
- [phone-wizard-kuni-skills-0](screenshots/phone-wizard-kuni-skills-0.png)
- [phone-wizard-kuni-skills](screenshots/phone-wizard-kuni-skills.png)
- [phone-wizard-kuni-spells-1](screenshots/phone-wizard-kuni-spells-1.png)
- [phone-wizard-kuni-spells-2](screenshots/phone-wizard-kuni-spells-2.png)
- [phone-wizard-kuni-traits](screenshots/phone-wizard-kuni-traits.png)
- [phone-wizard-matsu-advantages-disadvantages-2](screenshots/phone-wizard-matsu-advantages-disadvantages-2.png)
- [phone-wizard-matsu-clan](screenshots/phone-wizard-matsu-clan.png)
- [phone-wizard-matsu-family](screenshots/phone-wizard-matsu-family.png)
- [phone-wizard-matsu-name](screenshots/phone-wizard-matsu-name.png)
- [phone-wizard-matsu-review-3](screenshots/phone-wizard-matsu-review-3.png)
- [phone-wizard-matsu-review-findings](screenshots/phone-wizard-matsu-review-findings.png)
- [phone-wizard-matsu-school](screenshots/phone-wizard-matsu-school.png)
- [phone-wizard-matsu-skills-0](screenshots/phone-wizard-matsu-skills-0.png)
- [phone-wizard-matsu-skills-1](screenshots/phone-wizard-matsu-skills-1.png)
- [phone-wizard-matsu-traits](screenshots/phone-wizard-matsu-traits.png)
- [phone-wizard-monk-advantages-disadvantages-4](screenshots/phone-wizard-monk-advantages-disadvantages-4.png)
- [phone-wizard-monk-clan](screenshots/phone-wizard-monk-clan.png)
- [phone-wizard-monk-family](screenshots/phone-wizard-monk-family.png)
- [phone-wizard-monk-kiho-2](screenshots/phone-wizard-monk-kiho-2.png)
- [phone-wizard-monk-kiho-3](screenshots/phone-wizard-monk-kiho-3.png)
- [phone-wizard-monk-name](screenshots/phone-wizard-monk-name.png)
- [phone-wizard-monk-review-5](screenshots/phone-wizard-monk-review-5.png)
- [phone-wizard-monk-review-findings](screenshots/phone-wizard-monk-review-findings.png)
- [phone-wizard-monk-school](screenshots/phone-wizard-monk-school.png)
- [phone-wizard-monk-skills-0](screenshots/phone-wizard-monk-skills-0.png)
- [phone-wizard-monk-skills-1](screenshots/phone-wizard-monk-skills-1.png)
- [phone-wizard-monk-traits](screenshots/phone-wizard-monk-traits.png)
- [phone-wound-settings](screenshots/phone-wound-settings.png)
- [template-export-dense-01](screenshots/template-export-dense-01.png)
- [template-export-dense-02](screenshots/template-export-dense-02.png)
- [template-export-dense-03](screenshots/template-export-dense-03.png)
- [template-export-dense-04](screenshots/template-export-dense-04.png)
- [template-export-dense-05](screenshots/template-export-dense-05.png)
- [template-export-dense-06](screenshots/template-export-dense-06.png)
- [template-export-dense-07](screenshots/template-export-dense-07.png)

## Usage and remote access

Start and pre-full meter readings unavailable; no reliable whole-step Codex-point cost can be calculated. 2026-10-31 17:56 UTC: five-hour 77% used, weekly 29% used; 2026-10-31 23:24 UTC: five-hour 8% used, weekly 34% used; 2026-10-31 23:27 UTC: five-hour 21% used, weekly 36% used. Account-wide, not task billing; no reset credit used. Model: GPT-6 family; exact product model/effort unavailable. Remote Control unverified: computer-use approval timed out; owner asked to confirm desktop Connections. Do not assume iPhone remote access is enabled.

## Approved scope and historical estimates

| Release | Scope | Planning points |
|---|---|---|
| 15a · layout and controls | A01–A12, A15–A20; A13 retains wound location. Shared controls/disclosures, floating controls, Review, Moon/koku/court rows, phone input, focus, resistance, splash, bounded native Manage investigation. FT-24 and FT-28 are separate functional layers. | 20 (15–27) |
| 15b · text, Search and print | A14 and B01–B14, B16; B15 retains Library correction. Wording/prices, duplicate text, sticky Search/facets/aliases, Instigator/citation, complete browser print and colophon. Preserve template PDF. | 12 (9–16) |
| Both release groups · historical estimate | Original targets were 15a 15 and 15b 12. Five extra centre points expose the two functional items rather than charging them as polish. | 32 (24–43) |

Planning equivalents on the existing Claude-point scale, not measured Codex cost or calendar promises. These figures are historical grouped-delivery estimates. The owner now requires a separate removable unit and acceptance step for every finding; re-estimate before implementation. Without FT-24/FT-28, 15a’s centre estimate is 15. Work order: this audit → approve 8b scope → 8b → book reading/8c → separately approve 15a/15b starts → device fixes → reassessment. FT-16 remains its own later catalogue cycle. Audit completion does not approve a build or merge.

Each future build pins exact assertions/negative variants and provides switches, removers, registry entries and exact predecessor restoration. Cover long names, empty/dense states, focus, touch, both modes, saved state and relevant cancel/Undo boundaries. Changed harnesses at 4× CPU, discovery, then two fresh full passes on mains/keep-awake. Inspect local print and prepare the device checklist before asking to merge. After owner merge approval: downloaded live bytes, smoke/offline and changed-row walk. No new full suite has been started by this audit.

## Owner rulings — accepted 1 November 2026

Q1–Q8 were accepted as recommended on 1 November 2026. Original recommendation text is preserved below; the independent-removal and individual-acceptance rules govern delivery. No build or merge has started.

### Q1 · Approve the proposed scopes, not a build start

15a includes the listed layout/control work and unique Review reminders; 15b includes the listed text/Search/browser-print work. Preserve every warning, state and rule called out above. Estimates below include release QA and rollback. 8b and 8c remain ahead of both; approval here does not authorize either implementation or a merge.

### Q2 · Use one navigation system

Reserve a compact action strip above the existing tabs; keep Search in the app bar; make Search’s own query/category region sticky; move the colophon to About. No second destination bar or separate Manage screen.

### Q3 · Adopt one information/disclosure treatment

Upright circled i as a separate labelled control, static prose behind it, live state and reasons visible. Whole court chips select; Add court sits on the row; remove only the redundant bottom i in the seven legacy pickers.

### Q4 · Use a rolling five-second Undo group

Same characteristic’s consecutive −/+ taps are one change until five seconds without a tap or another action ends the group. Restore the value before the first tap and record the grouped change consistently in History.

### Q5 · Keep useful capability with simpler presentation

Keep wounds beside Earth, the current Library dropdown, former-spell search aliases and Cost/Weapon–Arrow filters under More filters. Add a Clan/Family split. These are the explicit retain/decline calls.

### Q6 · Fill the splash while preserving the title

Approve cover with tested portrait/landscape focal positioning; if the title cannot fit an extreme ratio, extend matching edges rather than crop the title. Retain all startup safeguards.

### Q7 · Include the two bounded functional items in 15a

Include FT-24’s already-ruled Void spend Undo and FT-28’s one-roll Trait choice as separate removable layers. They account for 5 planning points (range 3–7) within 15a; deferring both reduces 15a’s centre estimate from 20 to 15.

### Q8 · Approve the wording set

Use B01’s seven action labels, Lead an ally, You remain in control, the actual/catalogue cost pattern, Blind’s single breakdown and the value-driven Jigoku line. Keep TNs, prices, eligibility and costs intact.
