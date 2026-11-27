# Spot check for the owner

## What this is

This checks that the book-reading step **read the books accurately**. It does not ask what you think of any rating.

For each School below, open the book at the page given and answer each check **yes** or **no**: does the page say this?
Different wording is fine; it only has to mean the same thing.

- Answer **yes** if the page says it.
- Answer **no** if the page says something different, or does not say it at all.

**An item passes** when every check under it is yes. **If more than one of the ten items fails**, the reading cannot be
trusted and the audit is redone before its ratings are used.

**Pages.** The printed page is the number at the bottom of the book's page. The PDF page is where your PDF viewer shows
it. Core Rulebook: PDF page = printed page + 3. The Great Clans and Book of Air: PDF page = printed page + 1.

You don't need to judge whether the rating is right. That is the group's short list (`SHORT-LIST.md`).

---

## 1. Kakita Bushi: Core Rulebook p.109 (PDF 112) · **passed** (owner, 27 November 2026)

- [x] Tea Ceremony is in the School's Skills list.
- [x] The text says the School concentrates on duelling, and its other skills are secondary.

## 2. Ide Emissary: Core Rulebook p.131 (PDF 134)

- [ ] The Ide often deal with foreigners, having spent a long time in the Burning Sands.
- [ ] Rank 1 is about adapting to unfamiliar customs and not giving offence.
- [ ] Horsemanship is in the School's Skills list.

## 3. Tsuruchi Bounty Hunter: The Great Clans p.167 (PDF 168)

- [ ] Bounty Hunters travel across the Empire hunting fugitives.
- [ ] The text mentions a contract with the Emerald Champion.

## 4. Yoritomo Bushi: Core Rulebook p.120 (PDF 123)

- [ ] Rank 1: no penalties for rough or uneven ground.
- [ ] Rank 4: moving at least 5 feet gives a bonus to Armor TN.
- [ ] The text says the style uses more movement than most Schools.

## 5. Fukurokujin's Eyes: Book of Air p.194 (PDF 195)

- [ ] The order is hereditary, passed down within a few bloodlines.
- [ ] It descends from an old tribe that joined the Hida.
- [ ] Nothing on the page calls it heretical, banned, or tied to one era of history.

## 6. Doji Courtier: Core Rulebook p.110 (PDF 113)

- [ ] The School has no spells, kiho or tattoos.
- [ ] Rank 1 only works while your Honor is 6.0 or higher.
- [ ] Rank 1 includes a Contested Roll (to learn what favours someone needs).

## 7. Matsu Beastmaster: The Great Clans p.137 (PDF 138)

- [ ] Rank 1 gives you a warcat that attacks when you direct it.
- [ ] A warcat that isn't attacking guards you.

## 8. Shrine of the Seven Thunders: Core Rulebook p.232 (PDF 235)

- [ ] The monks rarely leave their monastery.
- [ ] The Technique makes all three starting kiho come from the same element.

## 9. Temple of Osano-Wo: Core Rulebook p.233 (PDF 236)

- [ ] It is described as the most militant sect of the Brotherhood.
- [ ] Its Devotion is Fortunist.

## 10. Chuda Shugenja (Snake Clan): Core Rulebook p.224 (PDF 227)

- [ ] The founder, Isawa Chuda, was an Imperial Magistrate sworn to destroy maho users.
- [ ] The page does not say outright that the School's members travel.

---

## Result

Items that failed (number and which check):

-

Items 8 and 9 also compare their order with another on a different page (Shinmaki, Emerald Empire p.206; Tengoku's
Fist, Book of Fire p.191). Checking only the page above is enough.

*The ten Schools were chosen at random by `check_evidence.py --spot-check` (fixed seed). Each check states, as a plain
fact, the evidence recorded for it in `book-evidence.json`. Re-running that command writes the older one-line format
over this file.*
