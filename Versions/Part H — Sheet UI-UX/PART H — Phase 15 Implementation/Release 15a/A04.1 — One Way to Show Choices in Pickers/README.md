# Release 15a · A04.1 — One Way to Show Choices in Pickers

Group G2, unit 5 of 5. This was the owner's comment 2 at G1's review (7 November 2026), and was approved as mocked up the same day ([G2 mock-ups](<../G2 — Small Layout Fixes/MOCKUP.md>)). It extends A04's single information pattern into the pickers. Built on 7 November 2026 (Claude), on branch `claude/release-15a-a04.1`, stacked on A11. The group tip carries G2's records.

## What changes

The inventory (step 1) opened all 56 pickers. They explained their options three ways:

- **Inline:** Paragon, Dark Paragon, Touch of the Spirit Realms and Soul of Artistry show each option's rule in full on the option.
- **A "Rule" disclosure on each option:** Seven Fortunes' Blessing (Phase 4.5.21, Part I).
- **Phase 4.54's i on each option:** Consumed, Failure of Bushido, Cursed by the Realm and Seven Fortunes' Curse (Phase 4.5.2's pickers whose options carry a rule).

The owner chose inline. Those five pickers now show each option's rule in full on the option:

- **In Paragon's option card:** the same border, radius, padding, font, line height and alignment, measured equal to Paragon's own.
- **One running paragraph:** the name in bold, then the price, then the rule, word for word as its disclosure held it.
- **Not drawn any more:** the "Rule" disclosure and the per-option i.
- **Tapping anywhere on the card,** the rule text included, chooses the option.
- **After choosing,** the row's i keeps the text, as before.

The other 47 pickers show only names and costs, or have no option list, so they have nothing to move and are untouched. Paragon itself is untouched.

**The long windows on a phone, measured at the mock-up (today → inline):**

| Picker | Height (px) |
|---|---|
| Seven Fortunes' Blessing | 801 → 1,369 |
| Cursed by the Realm | 1,109 → 1,231 |
| Seven Fortunes' Curse | 827 → 978 |
| Failure of Bushido | 811 → 855 |
| Consumed | 811 → 829 |

The window scrolls, and Confirm stays reachable (checked).

**How it is built.** An observer on the window's grid copies each disclosure's text into a span of its own at the end of the option's label. The option's first text span keeps its exact text, so older checks that read it still pass. The stylesheet stops drawing the disclosure and the i, which stay in the DOM. The pickers' own fragments are not changed.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A04.1 (this branch, the whole group) | `d243a6e794076b73982ecc5b1770b04c25e6f04946a75eb78d78cb814f2eda90` | 17,609,051 |
| A04.1 removed (A11) | `d8965a9f8c419d85e3587cc5ab5ec0798c75e0292036c0896c7d9a6f6aff3907` | 17,602,520 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/inline-rules-harness.js` (46 checks, pinned before the first run) | 46/46 |
| Own harness with A11 removed and A04.1 kept | 46/46 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A04.1's own blocks |
| Phase 4.5.21 (Part I), Seven Fortunes' Blessing (one declared conditional fixture, below) | 77/77, and 77/77 with A04.1 removed |
| Phase 4.54 (Part I), configuration UX pass | 28/28 |
| Phase 4.5.2 (Part I), Disadvantages | 163/163 |
| Phase 4.5.10 (Part I), Cursed by the Realm | 62/62 |
| Phase 4.5.11 (Part I), Seven Fortunes' Curse | 74/74 |
| Phase 4.5.22 (Part I), Naishou Citizen (reads the Blessing's prices) | 36/36 |
| Phase 4.5.18 (Part I), Paragon | 80/80 |
| A04 | 35/35 |
| A16 | 50/50 |

**A04's remover never matches this unit's marker:** its pattern matches `15.1.4` only when no digit follows, so `15.1.4.1` is not a hit. Checked against the regex, as A03.1 was.

**Fixes while building, before any result was used:**

- **Phase 4.5.21's FB-GEOMETRY (4 checks)** measured the Blessing's "Rule" disclosures, which A04.1 no longer draws. It now measures the rule where it is shown (`.ir15-rule`) when A04.1's seam key is present, and the disclosures otherwise. Same ids and count. It passes both ways and is declared in both ROLLBACK files.
- **Phase 4.54's own heading for an option's i** took in the new inline rule, turning its screen-reader name into "Explain: Control — 4 XP. −1k1 …" (its SUPERSEDE-03/04 caught it). A04.1 now adds `.ir15-rule` to that phase's own list of what is not the label (`R454.EXCLUDE_FROM_LABEL`, read by property). No change to that phase's checks.
- **The card's alignment** was `left`; Paragon's is `start`. Now `start`, so the card measures equal to Paragon's.
- **The harness's tap on the rule** now lands on the rule's last line. An inline span's box starts on the name's line, so the first attempt reached the bold name.

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md).
