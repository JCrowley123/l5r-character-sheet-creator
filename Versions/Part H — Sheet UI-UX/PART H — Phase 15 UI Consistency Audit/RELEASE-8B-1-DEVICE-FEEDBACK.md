# Phase 15 follow-up · Starting spells on phone and laptop

On 3 November 2026 the owner reported that the Release 8b.1 functional checks passed on iPhone and laptop. The six screenshots raised the following presentation issues for Release 15a. These are follow-ups to the 31 October audit. Its original 36 findings keep their identifiers. Give each follow-up its own comparison, acceptance and removal step under the [Phase 15 delivery rules](PHASE-15-DESIGN-RULES.md).

### 8b.1-UI-01 · Starting-spell review and its actions

The Given, Water, Air and Earth groups use fieldsets and tall checkbox rows. The owner wants the options to fit the app’s other pickers. On both measured layouts, **Confirm starting spells** touches the Earth border and starts 2 CSS pixels to its left. Confirm sits inside the dialog body, while **Later** sits in the footer.

Compare with the app’s existing choice dialogs. Align the actions to a common inset and put a visible gap between the last option group and the actions. At phone and laptop widths, check that long lists scroll, each choice remains easy to tap, Confirm saves the selection and Later discards the draft.

### 8b.1-UI-02 · Keep the spell name readable after confirming its School

The bordered box is the existing editable spell-name field. Release 8b inserts a separate text label immediately after it. The name, School label, Cast, help and Memorised controls share one line that cannot wrap. The owner’s iPhone screenshots show a narrow blank field, then a caret and keyboard when it receives focus. The laptop screenshot shows the same field displaying Sense, with the School label beside it.

In a temporary Edge session at 390 CSS pixels wide, the Sense field was 20 pixels wide including its border and padding, leaving zero pixels for text. Temporarily hiding the label in that session gave the field 107 pixels of text space. At 1,440 pixels the same field had 775 pixels of text space with the label visible. The field and exported character state both contained Sense and its School grant was Kitsu Shugenja.

Keep the spell name readable first. The owner is open to keeping the School only in the saved record. If an on-screen cue is useful, their preference is the short wording **School spell**, possibly as a badge. Compare those options during this finding’s review. Allow space for long spell names and make the full School attribution available where needed for characters with multiple Schools. Check Manage and Play on iPhone Safari and laptop Edge. Confirm that editing, saving and reopening still work and that an ordinary reward has no School grant.

### 8b.1-UI-03 · Separate Remove from Memorised

The × is positioned in the card’s upper-right corner, over the right end of the Memorised label. The hit areas overlapped by 34 × 33 CSS pixels at phone width and about 21 × 25 at desktop width. Give each control its own space. In Manage, tap the label to toggle memorisation and use × separately to remove a disposable spell. Repeat with School and reward spells on both devices. Check that Play retains its usual controls.

The numeric results are from installed Edge using the synthetic older Kitsu character on the tested build. The owner supplied the native iPhone and laptop observations. [Measurements](qa/2026-11-03-school-spells/measurements.json) · [Phone-width spell row](qa/2026-11-03-school-spells/sense-390.png) · [Desktop spell row](qa/2026-11-03-school-spells/sense-1440.png)
