  // ---------- Kiho gating ----------
  // Two unrelated things on this sheet are called "Monk" and they take different mechanics:
  //   1. Clan-affiliated [Monk] Schools already in SCHOOL_LIBRARY (Togashi Tattooed Order,
  //      Hitomi/Hoshi Kikage & Tsurui Zumi, Kuni Witch-Hunter, Asako Henshin, Order of the
  //      Spider Monks). These are structurally ordinary 5-Rank Schools. [Monk] buys them one
  //      thing only: eligibility to purchase Kiho as non-Brotherhood characters, at 1.5x.
  //   2. Brotherhood of Shinsei Schools, which carry brotherhood:true. Only THOSE get the
  //      "Playing a Monk" framework (Void 3, Glory 1/Status 0, starting and per-Rank Kiho).
  // Nothing here may apply case 2's rules to a case 1 School, or deny a case 1 School the
  // purchase option — those are the two ways this feature goes wrong.
  //
  // Whether a character may have Kiho at all, and on what terms, is Core Rulebook p.266, the
  // "Kiho and Non-Brotherhood Kiho" sidebar. Note that the sidebar is explicitly an OPTIONAL
  // GM rule: the default is that only the Brotherhood has Kiho. Everything below implements
  // the sidebar's permissive version, which is what a character sheet wants — a GM running
  // the strict default simply never gives a non-Brotherhood character the Advantage or School.
  //
  // Known discrepancy inside the book, resolved deliberately: the body text on p.261 says
  // flatly that "Non-Brotherhood characters ... use only their Ring", but the p.266 sidebar
  // then breaks that down per category — other Monk Schools use "the same rules for Mastery
  // Level" (i.e. Ring + School Rank), Shugenja use Ring alone, Ninja use School Rank alone.
  // The specific sidebar governs over the general sentence, so that is what is implemented.
  function kihoSchoolRank(){
    return parseInt(document.getElementById('f_rank').value||'0',10) || 0;
  }
  // "Friend of the Brotherhood" (Spiritual, 5 pts / 4 for Dragon) reads "Buy Kiho at
  // Brotherhood-of-Shinsei rates even though you are not from that School" — so it collapses
  // a category-1 Monk School's 1.5x multiplier to 1x. Matched by name in the Advantages list,
  // the same way hasMultipleSchoolsAdvantage()/hasDifferentSchoolAdvantage() already do it.
  function hasFriendOfTheBrotherhood(){
    return Array.from(document.querySelectorAll('#advList .en-name'))
      .some(el=>el.value.trim().toLowerCase()==='friend of the brotherhood');
  }
  // How (and whether) this character may acquire Kiho, per the p.266 sidebar. Returns the XP
  // cost multiplier and which terms count toward Mastery Level, so both the dropdown label and
  // the purchase price come from one place.
  //   brotherhood  School flagged brotherhood:true   1x    Ring + School Rank
  //   clanMonk     School named "[Monk]"             1.5x  Ring + School Rank  (1x w/ Friend)
  //   shugenja     any Shugenja School ever held     2x    Ring only
  //   none         no entitlement at all             —     shown locked
  // Ninja are the sidebar's fourth case (2x, School Rank alone). This sheet has no Ninja
  // School flag to branch on, so they are deliberately not modelled rather than guessed at.
  function kihoAcquisition(){
    const schoolName = (document.getElementById('f_school').value||'').trim();
    const entry = findAnySchoolLibraryEntry(schoolName);
    if(entry && entry.brotherhood){
      return { mode:'brotherhood', costMultiplier:1, usesSchoolRank:true, label:'Brotherhood monk' };
    }
    // The [Monk] descriptor in the School's own name is what marks a category-1 Clan Monk
    // School — the same convention the library already uses for [Artisan/Bushi] and friends.
    if(/\[[^\]]*\bmonk\b[^\]]*\]/i.test(schoolName)){
      const friend = hasFriendOfTheBrotherhood();
      return { mode:'clanMonk', costMultiplier: friend ? 1 : 1.5, usesSchoolRank:true,
               label: friend ? 'Clan [Monk] School, at Brotherhood rates (Friend of the Brotherhood)' : 'Clan [Monk] School (non-Brotherhood)' };
    }
    if(characterCasterLock()==='shugenja'){
      return { mode:'shugenja', costMultiplier:2, usesSchoolRank:false, label:'Shugenja' };
    }
    return { mode:'none', costMultiplier:1, usesSchoolRank:false, label:'' };
  }
  // ONE exclusion mechanism, fed by three sources, so later bans are data rather than new
  // checks bolted onto kihoEligibility():
  //   - the active School or Alternate Path, via banKihoRings / banKihoTypes on its entry
  //   - Disadvantages, via KIHO_BAN_BY_DISADVANTAGE below
  // Returns {kind:'ring'|'type', value, reason} entries. Two known consumers are coming:
  // Uncentered [Spiritual] (Book of Void p.192) bans every Void Kiho — a ban by RING — and
  // the Pure Song Path (Secrets of the Empire pp.242-243) bans every Martial Kiho — a ban by
  // TYPE. Both land here without touching the eligibility maths.
  const KIHO_BAN_BY_DISADVANTAGE = {
    // Uncentered [Spiritual] (Book of Void p.192): "You may not learn any Void Kiho." This is
    // the Ring-based ban the exclusion mechanism was built for in Phase 1 - it needed no new
    // check, only a row here. The Ishiken-do / Void Versatility half of the Disadvantage is
    // Advantage-side and is left to the Disadvantage's own text.
    'uncentered': { kind:'ring', value:'Void', reason:'Uncentered' },
  };
  function kihoExclusions(){
    const out = [];
    const entry = findAnySchoolLibraryEntry((document.getElementById('f_school').value||'').trim());
    if(entry){
      (entry.banKihoRings||[]).forEach(r=>out.push({kind:'ring', value:r, reason:entry.name}));
      (entry.banKihoTypes||[]).forEach(t=>out.push({kind:'type', value:t, reason:entry.name}));
    }
    // Alternate Paths feed the same mechanism - Pure Song's Martial ban needs no new check,
    // only this source. Guarded because Paths do not exist until Phase 6.
    if(typeof pathsTaken === 'function'){
      pathsTaken().forEach(p=>{
        (p.banKihoRings||[]).forEach(r=>out.push({kind:'ring', value:r, reason:p.name}));
        (p.banKihoTypes||[]).forEach(t=>out.push({kind:'type', value:t, reason:p.name}));
      });
    }
    Array.from(document.querySelectorAll('#disadvList .en-name')).forEach(el=>{
      const ban = KIHO_BAN_BY_DISADVANTAGE[el.value.trim().toLowerCase()];
      if(ban) out.push(ban);
    });
    return out;
  }
  // ---------- Kiho grants, starting Kiho, and the purchase cap ----------
  // Core Rulebook p.231 ("Playing a Monk"). A Brotherhood monk begins knowing three Kiho and
  // gains two more, player-chosen, at each School Rank advance. Both numbers are overridable
  // per School (Temples of the Thousand Fortunes starts with four) and, from Phase 6, per Path
  // (Barefoot Brethren grants only one at its Rank).
  const KIHO_DEFAULT_STARTING = 3;
  const KIHO_DEFAULT_GRANT_PER_RANK = 2;
  // THE CAP COUNTS PURCHASED KIHO ONLY, and this is a deliberate reading, not an oversight.
  // p.231: a monk "may purchase additional Kiho by spending a number of Experience Points equal
  // to the Kiho's Mastery Level. These are essentially 'bonus Kiho,' and a character may never
  // know more OF THESE than his cumulative School Rank in all Monk Schools." The words "of
  // these" scope the cap to the purchased Kiho; the starting three and the per-Rank grants sit
  // outside it. Two things corroborate that reading: a total-known cap would be overflowed
  // immediately by the per-Rank grant it sits beside, and the Thousand Fortunes Technique
  // bothers to say its four starting Kiho "do not count against the additional Kiho you can
  // purchase with Experience Points" - a sentence that only means anything against a purchase
  // cap. p.266 says the same thing for non-Brotherhood characters, for whom every Kiho is
  // purchased anyway, so the two readings coincide there and only diverge for Brotherhood monks.
  const KIHO_FREE_TAG = ' · free pick, ';
  function monkKihoElement(){
    const el = document.getElementById('f_monkKihoElement');
    return el ? (el.value||'').trim() : '';
  }
  // Every Kiho row this system has put in #techList, granted or purchased, identified by the
  // meta tag the quick-add stamps into the description - the same convention
  // findSchoolGrantedTechRow() uses for Rank Techniques, and for the same reason: a manually
  // typed entry that happens to share a Kiho's name must never be miscounted as one.
  function kihoRows(){
    return Array.from(document.querySelectorAll('#techList .entry')).filter(div=>{
      const d = div.querySelector('.en-desc');
      return d && d.value.indexOf('[Kiho — ') === 0;
    });
  }
  function kihoRowIsFree(div, schoolName){
    const d = div.querySelector('.en-desc');
    if(!d) return false;
    return d.value.indexOf(KIHO_FREE_TAG) >= 0
      && (schoolName === undefined || d.value.indexOf(KIHO_FREE_TAG + schoolName + ']') >= 0);
  }
  // Cumulative Monk/Shugenja School Rank across every School the character has ever held -
  // "once trained, always counts", the same principle characterCasterLock() uses, summed rather
  // than reduced to a boolean. Frozen entries report their locked frozenRank and the active one
  // reports f_rank, exactly as getMirumotoRank() does for the same list.
  function cumulativeMonkShugenjaRank(){
    let list;
    try { list = getSchoolsList() || []; } catch(e){ return 0; }
    let total = 0;
    list.forEach(entry=>{
      const name = (entry && entry.name) || '';
      const lib = findAnySchoolLibraryEntry(name);
      const isMonk = !!(lib && (lib.brotherhood || lib.monk)) || /\[[^\]]*\bmonk\b[^\]]*\]/i.test(name);
      const isShugenja = !!(lib && lib.shugenja);
      if(!isMonk && !isShugenja) return;
      if(entry.frozen){ total += Math.max(0, parseInt(entry.frozenRank||0,10) || 0); }
      else { total += kihoSchoolRank(); }
    });
    return total;
  }
  // Everything the grant/cap UI needs, computed fresh from state the sheet already stores.
  // Nothing here is persisted: the entitlement is derivable from School + Rank, and the CHOICES
  // live in #techList as tagged rows, so there is no second copy of the truth to drift.
  function kihoEntitlement(){
    const schoolName = (document.getElementById('f_school').value||'').trim();
    const entry = findAnySchoolLibraryEntry(schoolName);
    const brotherhood = !!(entry && entry.brotherhood);
    const rank = kihoSchoolRank();
    const startingKiho = brotherhood ? (entry.startingKiho || KIHO_DEFAULT_STARTING) : 0;
    // kihoGrantOverride is read here so Phase 6 can supply it from the active Path instead.
    const perRank = brotherhood
      ? (entry.kihoGrantOverride === undefined ? KIHO_DEFAULT_GRANT_PER_RANK : entry.kihoGrantOverride)
      : 0;
    // Walk the Ranks rather than multiplying, because the per-Rank grant is overridable AT A
    // SPECIFIC RANK by an Alternate Path: Barefoot Brethren gives one Kiho at its Rank and
    // Servants of Mercy gives none, while every other Rank still gives the normal two.
    let grantedAllowance = 0;
    if(brotherhood){
      grantedAllowance = startingKiho;
      for(let r = 2; r <= rank; r++){
        const p = (typeof pathAtRank === 'function') ? pathAtRank(r) : null;
        grantedAllowance += (p && p.kihoGrantOverride !== undefined) ? p.kihoGrantOverride : perRank;
      }
    }
    // Kiho a Path's Technique grants outright are explicitly exempt from the purchase cap, so
    // they raise it rather than consuming it. Implementing the grant itself (adding the rows)
    // is Technique-effect work and out of scope; this only ensures recording them by hand does
    // not eat the character's purchases.
    // Read from the active School as well as from every Path taken: First Dawn Scholars grants
    // an additional Mystical Kiho by its own Technique, the same grant-and-exempt pattern as
    // Dark Path Sohei's two.
    let capExemptGrants = (entry && entry.grantsExemptFromCap && entry.grantsKiho) || 0;
    if(typeof pathsTaken === 'function'){
      capExemptGrants += pathsTaken().reduce((n,p)=>n + ((p.grantsExemptFromCap && p.grantsKiho) || 0), 0);
    }
    const rows = kihoRows();
    const grantedTaken = rows.filter(r=>kihoRowIsFree(r, schoolName)).length;
    const purchased = rows.filter(r=>!kihoRowIsFree(r)).length;
    const purchasedCap = cumulativeMonkShugenjaRank() + capExemptGrants;
    return {
      brotherhood, schoolName, rank, startingKiho, perRank,
      grantedAllowance, grantedTaken,
      freePicksLeft: Math.max(0, grantedAllowance - grantedTaken),
      overGranted: Math.max(0, grantedTaken - grantedAllowance),
      purchased, purchasedCap,
      purchasesLeft: Math.max(0, purchasedCap - purchased),
      capExemptGrants,
      sameElementStart: !!(entry && entry.startingKihoSameElement),
      elementRankBonus: (entry && entry.kihoElementRankBonus) || 0,
      element: monkKihoElement(),
      // Per-Ring Mastery bonuses granted by an Alternate Path (Student of Hitsu-do's Fire).
      // Reported separately from elementRankBonus because that one is tied to the School's
      // player-chosen starting Element, while these name their own Ring.
      ringRankBonuses: (typeof pathsTaken === 'function')
        ? pathsTaken().filter(p=>p.kihoRingRankBonus)
            .map(p=>({ring:p.kihoRingRankBonus.ring, bonus:p.kihoRingRankBonus.bonus, source:p.name}))
        : [],
    };
  }
  // Mirrors kataEligibility()'s shape, but the Mastery test is the real Kiho formula: Ring
  // PLUS School Rank for a monk, Ring alone for a Shugenja (see kihoAcquisition above).
  // Returns enough for the dropdown to print both the right lock reason and the right price.
  function kihoEligibility(k){
    const acq = kihoAcquisition();
    const ringVal = getRingValueByName(k.ring);
    // Shrine of the Seven Thunders' Walk with the Prophet. The book says the monk's INSIGHT
    // Rank counts as one higher, but Insight Rank appears nowhere in the p.261 eligibility
    // formula (School Rank + Ring), which would make the Technique inert as literally written.
    // Ruled to apply the +1 to the eligibility total instead, which is plainly the intent.
    // Before the Element is locked in by the first starting pick, it could still become any of
    // them, so the bonus shows against all five rather than none.
    const schoolEntry = findAnySchoolLibraryEntry((document.getElementById('f_school').value||'').trim());
    const elementBonus = (schoolEntry && schoolEntry.kihoElementRankBonus
      && (!monkKihoElement() || monkKihoElement() === k.ring)) ? schoolEntry.kihoElementRankBonus : 0;
    // An Alternate Path may raise the same eligibility total for ONE named Ring - Student of
    // Hitsu-do's Special clause counts your Fire Ring as one Rank higher for learning Fire
    // Kiho. Read from pathsTaken() rather than the current Rank's Path, for the same reason
    // the bans are: a Path taken at Rank 2 still applies at Rank 5. Guarded because Paths do
    // not exist until Phase 6. Stacks with the School's own bonus rather than replacing it -
    // no printed pair can currently collide, and summing is the honest reading if one ever does.
    const pathBonus = (typeof pathsTaken === 'function')
      ? pathsTaken().reduce((n,p)=>n + ((p.kihoRingRankBonus && p.kihoRingRankBonus.ring === k.ring)
          ? p.kihoRingRankBonus.bonus : 0), 0)
      : 0;
    const reach = ringVal + (acq.usesSchoolRank ? kihoSchoolRank() : 0) + elementBonus + pathBonus;
    const masteryOk = reach >= k.mastery;
    const banned = kihoExclusions().find(x=>
      (x.kind==='ring' && x.value===k.ring) || (x.kind==='type' && x.value===k.type)) || null;
    // Rebuke of the Heavens (Book of Void p.192) is the only Kiho in any of these books with an
    // acquisition restriction written into the Kiho itself: "This Kiho is only available to
    // monks, not to shugenja." Enforced, unlike the reference-only atemi and staff notes,
    // because it is a flat prohibition rather than combat state the sheet cannot see.
    const monkOnlyBlock = !!(k.monksOnly && acq.mode === 'shugenja');
    // Cost is Mastery Level in XP x the multiplier. The book gives "one and one half times the
    // normal cost" without saying how to round an odd Mastery, so this rounds UP (a Mastery 3
    // Kiho costs 5 XP, not 4). Flip the Math.ceil if your table prefers rounding down.
    const cost = Math.ceil(k.mastery * acq.costMultiplier);
    return {
      eligible: acq.mode!=='none' && masteryOk && !banned && !monkOnlyBlock,
      acq, reach, masteryOk, banned, cost, costMultiplier: acq.costMultiplier, elementBonus,
      pathBonus, monkOnlyBlock,
    };
  }
  // How this character would actually ACQUIRE this Kiho right now: as one of their free
  // School grants, as an XP purchase, or not at all because the purchase cap is full.
  // Eligibility (can they learn it at all) stays separate above; this layer is only about
  // which pool pays for it.
  function kihoOffer(k){
    const elig = kihoEligibility(k);
    if(!elig.eligible) return { offer:'locked', elig, cost:elig.cost, ent:null, reason:null };
    const ent = kihoEntitlement();
    if(ent.freePicksLeft > 0 && kihoFreePickAllows(k, ent)){
      return { offer:'free', elig, cost:0, ent, reason:null };
    }
    if(ent.purchasesLeft > 0) return { offer:'purchase', elig, cost:elig.cost, ent, reason:null };
    return { offer:'blocked', elig, cost:elig.cost, ent,
             reason:'Kiho purchase cap reached (' + ent.purchasedCap + ' = your cumulative Monk/Shugenja School Rank)' };
  }
  // Seven Thunders constrains only the INITIAL starting Kiho to a single Element. The per-Rank
  // grants after them are unconstrained, and a Kiho of another Element can still be PURCHASED
  // at any time - the constraint is on what counts as a free starting pick, not on what the
  // character may ever learn.
  function kihoFreePickAllows(k, ent){
    if(!ent.sameElementStart) return true;
    if(ent.grantedTaken >= ent.startingKiho) return true;
    if(!ent.element) return true;
    return k.ring === ent.element;
  }
  // Spell gating: a Shugenja may only cast/learn a spell whose Mastery Level is at or below
  // their effective School Rank *for that spell's Element* — School Rank adjusted by the
  // active School's Affinity (+1) or Deficiency (-1) for that specific Element, floored at 0.
  // Looks up the active School (f_school) in both SCHOOL_LIBRARY and MINOR_CLAN_SCHOOL_LIBRARY,
  // since Shugenja Schools appear in either depending on Clan (see findSchoolLibraryEntry above,
  // which only covers SCHOOL_LIBRARY — this version covers both without changing that one's
  // existing Bushi/Shugenja-lock behavior elsewhere).
  function findAnySchoolLibraryEntry(schoolName){
    if(!schoolName) return null;
    for(const clan in SCHOOL_LIBRARY){
      const found = SCHOOL_LIBRARY[clan].find(s=>s.name===schoolName);
      if(found) return found;
    }
    for(const mc in MINOR_CLAN_SCHOOL_LIBRARY){
      const found = MINOR_CLAN_SCHOOL_LIBRARY[mc].find(s=>s.name===schoolName);
      if(found) return found;
    }
    // Brotherhood Schools belong to no Clan, so they are a flat array rather than a
    // Clan-keyed map. kihoAcquisition() reads brotherhood:true through this function, so a
    // Brotherhood School missed here would silently be charged the 1.5x non-Brotherhood rate.
    const bro = BROTHERHOOD_SCHOOL_LIBRARY.find(s=>s.name===schoolName);
    if(bro) return bro;
    return null;
  }
  // True when the APPLIED School (f_school, not the picker) is a Brotherhood of Shinsei
  // School. This is the single predicate for "category 2" everywhere in the sheet: the Kiho
  // rate (kihoAcquisition), the Void Point exemption (kihoVoidExemption), and the creation
  // deltas below all read it, so they cannot disagree about what counts as a Brotherhood monk.
  function activeSchoolIsBrotherhood(){
    const entry = findAnySchoolLibraryEntry((document.getElementById('f_school').value||'').trim());
    return !!(entry && entry.brotherhood);
  }
  // Core Rulebook p.231, the "Playing a Monk" sidebar. These apply at character creation to a
  // brotherhood:true School and to nothing else - never to a Clan [Monk] School, whose
  // characters are ordinary samurai with an unusual dojo.
  //   - Void 3 rather than 2. TRAITS ARE UNTOUCHED: the sidebar is explicit that "a monk's
  //     Traits all begin at 2, just like any other character", and only Void differs.
  //   - Glory 1 and Status 0. Honor is NOT affected - it still comes from the School's own
  //     honor field, exactly as for every other School.
  //   - Glory gain is halved thereafter. That is an ongoing advancement rule with no creation
  //     value to set, and this sheet has no Glory ledger to halve, so it is surfaced as a note
  //     on the Monk badge rather than enforced. Deliberately NOT building Glory tracking.
  const MONK_CREATION = { voidRank:3, gloryRank:1, gloryPts:'1.0', statusRank:0, statusPts:'0.0' };
  // Affinity/Deficiency for the active School. Isawa Shugenja (affinityChoice:true) has no
  // fixed Affinity in the library — its player-chosen Element lives in f_schoolAffinity (see
  // pickAffinityElement()/cfs_applySchool above) and it has no Deficiency at all.
  function getActiveSchoolElementalProfile(){
    const entry = findAnySchoolLibraryEntry((document.getElementById('f_school').value||'').trim());
    if(!entry) return { affinity:'', deficiency:'' };
    if(entry.affinityChoice){
      return { affinity: (document.getElementById('f_schoolAffinity').value||'').trim(), deficiency:'' };
    }
    return { affinity: entry.affinity||'', deficiency: entry.deficiency||'' };
  }
  // 'Universal' spells (Commune/Sense/Summon) aren't tied to one Element, so Affinity/
  // Deficiency never applies to them — only the raw School Rank does.
  function effectiveSchoolRankForElement(element){
    const baseRank = parseInt(document.getElementById('f_rank').value||'0',10) || 0;
    if(element==='Universal') return baseRank;
    const { affinity, deficiency } = getActiveSchoolElementalProfile();
    let rank = baseRank;
    if(affinity && affinity===element) rank += 1;
    if(deficiency && deficiency===element) rank -= 1;
    return Math.max(0, rank);
  }
  function spellEligibility(s){
    const effRank = effectiveSchoolRankForElement(s.element);
    return { eligible: s.mastery <= effRank, effRank };
  }
  // Keyword-based Affinity/Deficiency (Yogo Wardmaster, Chuda Shugenja) is a separate system
  // from the element-based one above: it depends on the SPELL's own keywords rather than
  // which Element it's cast in, and only applies at the moment of casting (this function),
  // never to which spells a character is eligible to learn (spellEligibility above still
  // uses the element-only effectiveSchoolRankForElement, deliberately unchanged).
  // Applied at Apply School, not roll time, in the same sense every other fixed (non-player-
  // chosen) School bonus is: it lives as plain data on the SCHOOL_LIBRARY entry itself and is
  // read live via f_school + findAnySchoolLibraryEntry — the exact same place and mechanism
  // getActiveSchoolElementalProfile() already uses for every other School's Affinity/
  // Deficiency, so the roll engine reads it exactly like any other school bonus.
  // elementDeficiencyChoice (Chuda Shugenja only) is a second, independent player choice
  // alongside affinityChoice (Isawa Shugenja): the player picks ONE non-Void Element at Apply
  // School (pickDeficiencyElement(), stored in f_schoolDeficiencyElement — same reasoning as
  // f_schoolAffinity: not statically knowable from the library alone, so it needs its own
  // stored field, unlike Yogo's fixed keywordDeficiency list above).
  function getActiveSchoolKeywordProfile(){
    const entry = findAnySchoolLibraryEntry((document.getElementById('f_school').value||'').trim());
    if(!entry) return { keywordAffinity:null, keywordDeficiency:[], deficiencyElement:'', deficiencyExcludesKeyword:null };
    return {
      keywordAffinity: entry.keywordAffinity || null,
      keywordDeficiency: entry.keywordDeficiency || [],
      deficiencyElement: entry.elementDeficiencyChoice
        ? (document.getElementById('f_schoolDeficiencyElement').value||'').trim()
        : '',
      deficiencyExcludesKeyword: entry.elementDeficiencyExcludesKeyword || null,
    };
  }
  // Full effective School Rank for CASTING a specific spell: starts from the element-based
  // Affinity/Deficiency exactly as before, then layers the active School's keyword-based
  // Affinity/Deficiency on top (Yogo Wardmaster never sets element affinity/deficiency at
  // all, so that first step is already a no-op for them — see its SCHOOL_LIBRARY entry; Chuda
  // Shugenja likewise sets neither — its Deficiency Element choice is handled entirely here,
  // not through the element-based system, precisely because it needs to exempt Maho spells of
  // that Element, which the element-only system has no way to know about).
  //   - has the School's Affinity keyword (e.g. Wards, Maho) AND spell's Element isn't Void -> +1
  //   - has one of the School's fixed Deficiency keywords (e.g. Travel, Craft) -> -1
  //   - spell's Element matches the School's chosen Deficiency Element (Chuda) AND the spell
  //     does NOT carry deficiencyExcludesKeyword (Chuda: 'Maho' — a Maho spell of that Element
  //     is still the Affinity case above, never this one) -> -1
  //   - otherwise -> no change
  // (Affinity is checked first and short-circuits both Deficiency checks — a spell can't
  // plausibly carry both Wards and Travel/Craft in this ruleset, and a Maho spell of Chuda's
  // own Deficiency Element is explicitly meant to stay a +1, never a double-adjustment.)
  // Never drops below 0. Bonus spell slots are a separate mechanic entirely and never affect
  // this value, and nothing about a roll's outcome ever changes which slot was already spent.
  function effectiveSchoolRankForSpell(element, keywords){
    let rank = effectiveSchoolRankForElement(element);
    const { keywordAffinity, keywordDeficiency, deficiencyElement, deficiencyExcludesKeyword } = getActiveSchoolKeywordProfile();
    const spellKeywords = keywords || [];
    const hasKeywordAffinity = keywordAffinity && spellKeywords.includes(keywordAffinity) && element !== 'Void';
    const hasKeywordDeficiency = keywordDeficiency.some(k=>spellKeywords.includes(k));
    const hasElementDeficiency = deficiencyElement && element===deficiencyElement
      && !(deficiencyExcludesKeyword && spellKeywords.includes(deficiencyExcludesKeyword));
    if(hasKeywordAffinity){
      rank += 1;
    } else if(hasKeywordDeficiency || hasElementDeficiency){
      rank -= 1;
    }
    return Math.max(0, rank);
  }
  // Displays the *applied* School's Affinity/Deficiency — both the fixed Element-based kind
  // and the keyword-based kind used by Yogo Wardmaster/Chuda Shugenja — in the Clan/Family/
  // School card, right under the pre-apply preview (#cfs_schoolInfo). Reads live off f_school
  // (plus the player-chosen f_schoolAffinity/f_schoolDeficiencyElement fields for Schools that
  // need them), the exact same source of truth getActiveSchoolElementalProfile()/
  // getActiveSchoolKeywordProfile() already use for spell-casting math, so this always matches
  // whatever School is currently applied — including right after Apply School and after
  // loading a saved character (recalcAll() calls this every time, see below). Hidden entirely
  // when the active School has neither an Affinity nor a Deficiency of any kind.
  function renderAppliedSchoolAffinity(){
    const box = document.getElementById('cfs_appliedAffinity');
    if(!box) return;
    const schoolName = (document.getElementById('f_school').value||'').trim();
    if(!schoolName){ box.style.display='none'; box.innerHTML=''; return; }
    const elemental = getActiveSchoolElementalProfile();
    const kw = getActiveSchoolKeywordProfile();
    const affinities = [], affinityDetails = [];
    if(elemental.affinity){
      affinities.push(elemental.affinity);
      affinityDetails.push(`${elemental.affinity} (Element affinity): +1 effective School Rank when casting ${elemental.affinity} spells, and when determining which ${elemental.affinity} spells you're eligible to learn.`);
    }
    if(kw.keywordAffinity){
      affinities.push(`${kw.keywordAffinity} (keyword)`);
      affinityDetails.push(`${kw.keywordAffinity} (keyword affinity): +1 effective School Rank when casting any spell carrying the "${kw.keywordAffinity}" keyword, as long as that spell's Element isn't Void.`);
    }
    const deficiencies = [], deficiencyDetails = [];
    if(elemental.deficiency){
      deficiencies.push(elemental.deficiency);
      deficiencyDetails.push(`${elemental.deficiency} (Element deficiency): -1 effective School Rank when casting ${elemental.deficiency} spells (never below 0).`);
    }
    if(kw.keywordDeficiency && kw.keywordDeficiency.length){
      deficiencies.push(`${kw.keywordDeficiency.join(', ')} (keyword)`);
      deficiencyDetails.push(`${kw.keywordDeficiency.join(', ')} (keyword deficiency): -1 effective School Rank when casting any spell carrying one of these keywords (never below 0).`);
    }
    if(kw.deficiencyElement){
      const exceptText = kw.deficiencyExcludesKeyword ? ` — except spells carrying the "${kw.deficiencyExcludesKeyword}" keyword, which get their Affinity bonus instead of this penalty` : '';
      deficiencies.push(`${kw.deficiencyElement}${kw.deficiencyExcludesKeyword ? ` (except ${kw.deficiencyExcludesKeyword} spells)` : ''}`);
      deficiencyDetails.push(`${kw.deficiencyElement} (chosen Element deficiency): -1 effective School Rank when casting ${kw.deficiencyElement} spells${exceptText} (never below 0).`);
    }
    // Deliberately NO Monk badge here. It was tried and removed: of the four things it showed,
    // three (Void 3, Glory 1 / Status 0, the Kiho rate) are already visible in their own fields
    // or in the Kiho panel, and only the halved Glory gain was unique - so it now sits beside
    // the Glory field instead, where the number it affects lives. See renderMonkFieldNotes().
    // Affinity and Deficiency keep their badges because neither has a field anywhere on the
    // sheet; that is the bar an affordance here has to clear. A badge per character group
    // (Bushi, Courtier, Artisan, Shugenja, Clan monk) would be decoration restating the School
    // name for four of the five, so the inconsistency was resolved by removing, not multiplying.
    if(!affinities.length && !deficiencies.length){ box.style.display='none'; box.innerHTML=''; return; }
    const badges = [];
    if(affinities.length) badges.push(`<button type="button" class="school-affinity-badge is-affinity" id="cfs_affinityBadgeBtn" title="Tap for details"><span class="badge-label">Affinity</span> ${escHtml(affinities.join(', '))}<span class="badge-hint">ⓘ</span></button>`);
    if(deficiencies.length) badges.push(`<button type="button" class="school-affinity-badge is-deficiency" id="cfs_deficiencyBadgeBtn" title="Tap for details"><span class="badge-label">Deficiency</span> ${escHtml(deficiencies.join(', '))}<span class="badge-hint">ⓘ</span></button>`);
    box.innerHTML = badges.join('');
    box.style.display = '';
    // Click (not just hover) so this also works on touch devices — opens the same modal used
    // elsewhere for read-only notices (appAlert), explaining exactly what this Affinity/
    // Deficiency does mechanically, source by source (an entry per Element- and/or keyword-
    // based contributor, in case a School somehow has both at once).
    const affinityBtn = document.getElementById('cfs_affinityBadgeBtn');
    if(affinityBtn) affinityBtn.addEventListener('click', ()=>appAlert(affinityDetails.join('\n\n'), 'Got it'));
    const deficiencyBtn = document.getElementById('cfs_deficiencyBadgeBtn');
    if(deficiencyBtn) deficiencyBtn.addEventListener('click', ()=>appAlert(deficiencyDetails.join('\n\n'), 'Got it'));
  }
  // Bushi/Shugenja exclusivity applies here too, not just to picking a second School (see
  // characterCasterLock() above): a Bushi character only ever trains Kata, a Shugenja only
  // ever learns Spells, so once the character has committed to one path the other's whole
  // section is left out of the dropdown entirely — Kata/Spells stay grouped by Element
  // exactly as before within whichever section(s) remain.
  function techQuickAddOptionsHTML(){
    const elementOrder = ['Air','Earth','Fire','Water','Void'];
    const casterLock = characterCasterLock();
    let html = '<option value="">— choose a Kata, Kiho or Spell to add —</option>';

    if(casterLock !== 'shugenja'){
      elementOrder.forEach(el=>{
        const items = KATA_LIBRARY.map((k,i)=>({...k,i})).filter(k=>k.ring===el);
        if(!items.length) return;
        html += `<optgroup label="${escAttr(el)} Kata">`;
        items.forEach(k=>{
          const { eligible, schoolOk, ringOk } = kataEligibility(k);
          let label = `${k.name} (${k.ring} ${k.mastery})`;
          if(!eligible){
            const reasons = [];
            if(!schoolOk) reasons.push(`needs ${k.schools}`);
            if(!ringOk) reasons.push(`needs ${k.ring} ${k.mastery}+`);
            label += ` — 🔒 ${reasons.join('; ')}`;
          }
          html += `<option value="kata:${k.i}" ${eligible?'':'disabled'}>${escAttr(label)}</option>`;
        });
        html += '</optgroup>';
      });
    }

    {
      // Kiho, grouped by Element to match the Kata layout above. Deliberately NOT gated on
      // Kata's `casterLock !== 'shugenja'` condition: a Shugenja may buy Kiho (at 2x, using
      // Ring alone), so they must be able to see them — see kihoAcquisition().
      // Ineligible Kiho stay visible but disabled with a "🔒 needs X" label, the same
      // convention Kata and Spells already use, rather than being hidden outright.
      const acq = kihoAcquisition();
      elementOrder.forEach(el=>{
        const items = KIHO_LIBRARY.map((k,i)=>({...k,i})).filter(k=>k.ring===el);
        if(!items.length) return;
        html += `<optgroup label="${escAttr(el)} Kiho">`;
        items.forEach(k=>{
          const offer = kihoOffer(k);
          const { eligible, masteryOk, banned, cost, reach } = offer.elig;
          let label = `${k.name} (${k.ring} ${k.mastery}, ${k.type}${k.atemi ? ', Atemi' : ''})`;
          // Every option that CLEARED the Mastery test states the total it cleared it with, not
          // just the ones that failed. Kiho are the only entry in this dropdown whose gate is a
          // composite - Ring PLUS School Rank, plus any School or Path bonus - so an available
          // Kiho is the one case where a player cannot read the reason off the sheet. (Kata and
          // Spells gate on a single Ring the character can already see, which is why they say
          // nothing here.) Phrased to mirror the 🔒 branch below so the two read as one scale.
          const reachNote = acq.usesSchoolRank
            ? ` · ${k.ring} + School Rank = ${reach}`
            : ` · ${k.ring} = ${reach}`;
          if(offer.offer === 'free'){
            label += ` — free pick${reachNote}`;
          } else if(offer.offer === 'purchase'){
            label += ` — ${cost} XP${reachNote}`;
          } else if(offer.offer === 'blocked'){
            // Blocked by the purchase cap, not by Mastery - so it still cleared the reach test,
            // and saying so distinguishes "you cannot afford this" from "you cannot learn this".
            label += ` — 🔒 ${offer.reason}${reachNote}`;
          } else {
            const reasons = [];
            if(acq.mode==='none') reasons.push('needs a Monk or Shugenja School');
            // Which shortfall to report depends on what actually counts toward Mastery: a
            // Shugenja is measured on Ring alone, so telling them to raise their School Rank
            // would be wrong advice.
            else if(!masteryOk) reasons.push(acq.usesSchoolRank
              ? `needs ${k.ring} + School Rank ${k.mastery}+ (you have ${reach})`
              : `needs ${k.ring} ${k.mastery}+ (you have ${reach})`);
            if(banned) reasons.push(`barred by ${banned.reason}`);
            if(offer.elig.monkOnlyBlock) reasons.push('monks only, not Shugenja');
            label += ` — 🔒 ${reasons.join('; ')}`;
          }
          const selectable = offer.offer === 'free' || offer.offer === 'purchase';
          html += `<option value="kiho:${k.i}" ${selectable?'':'disabled'}>${escAttr(label)}</option>`;
        });
        html += '</optgroup>';
      });
    }

    {
      // Base Visibility Rule (unchanged for non-Maho spells): a spell appears here at all
      // only if spellEligibility() says its Mastery is within effective School Rank for its
      // Element. Maho is EXEMPT from this — "no limitation on School Rank or Insight Rank to
      // cast Maho Spells" — so a Maho spell (s.maho===true) skips the spellEligibility() check
      // entirely and is gated purely on scroll ownership (hasSpellScroll) below, same as every
      // other spell's scroll-gating layer.
      // Scroll gating is a SEPARATE layer on top of the above, exactly like Kata's schoolOk/
      // ringOk gating above: a visible spell without its scroll (hasSpellScroll) still shows,
      // but padlocked (🔒, same style as the Kata lock above) and disabled, so it can be seen
      // but not selected — applies uniformly regardless of Element, Mastery, or School bonuses,
      // and regardless of whether the spell carries a keyword like Maho/Wards/Travel/Craft,
      // since none of that affects scroll possession.
      //
      // Caster-lock gating (Shugenja-only, unchanged for non-Maho spells): a non-Shugenja
      // (casterLock === 'bushi') still can't browse the ordinary Spell list here at all — you
      // need real Shugenja/Spellcraft training to work a spell you already know, not just the
      // Mastery/Rank numbers. The ONE exception is Maho (s.maho===true): a Maho Spell Scroll
      // is a self-contained corrupt ritual that doesn't require Shugenja training to attempt.
      // But unlike the ordinary Shugenja case just below — where every eligible spell in the
      // library is listed and merely padlocked (🔒) until its scroll shows up in Equipment —
      // a non-Shugenja never gets to browse the whole Maho list "to know what to look for":
      // only the exact Maho spell(s) whose scroll they already own (hasSpellScroll) appear at
      // all here. E.g. owning "Spell Scroll — Bleeding" surfaces only Bleeding, not the rest
      // of the Maho list. (For a Shugenja/unset caster, hasSpellScroll gating is unchanged —
      // still shown-but-padlocked, exactly as before, since Shugenja are assumed to already
      // know the wider Element-based spell list from their training.)
      ['Universal', ...elementOrder].forEach(el=>{
        const items = SPELL_LIBRARY.map((s,i)=>({...s,i})).filter(s=>{
          if(s.element!==el) return false;
          if(!s.maho && !spellEligibility(s).eligible) return false;
          if(casterLock === 'bushi') return s.maho === true && hasSpellScroll(s.name);
          return true;
        });
        if(!items.length) return;
        html += `<optgroup label="${escAttr(el)} Spells">`;
        items.forEach(s=>{
          const owned = hasSpellScroll(s.name);
          let label = `${s.name} (${s.element} ${s.mastery})${s.maho ? ' [Maho]' : ''}`;
          if(!owned){
            label += ` — 🔒 Needs "Spell Scroll — ${s.name}" before being able to cast.`;
          }
          html += `<option value="spell:${s.i}" ${owned?'':'disabled'}>${escAttr(label)}</option>`;
        });
        html += '</optgroup>';
      });
    }
    return html;
  }
  // The Alternate Path picker. A PICKER, not a toggle: at Rank 2 a Fortunist Brotherhood monk
  // who is neither Osano-Wo nor Four Temples qualifies for Brotherhood Spy, Defender of the
  // Brotherhood AND Barefoot Brethren simultaneously, so the UI has to offer a choice.
  // Paths are offered for every Rank from 1 up to the character's current Rank, since a Rank 4
  // monk may still take a Path that replaces Rank 2.
  function renderPathPicker(){
    const wrap = document.getElementById('pathPickerWrap');
    const sel = document.getElementById('pathPicker');
    const note = document.getElementById('pathNote');
    if(!wrap || !sel || !note) return;
    const schoolName = (document.getElementById('f_school').value||'').trim();
    const rank = kihoSchoolRank();
    const taken = getPathTaken();
    const seen = {}, avail = [];
    for(let r = 1; r <= Math.max(rank, 1); r++){
      pathsAvailableAt(schoolName, r).forEach(p=>{ if(!seen[p.name]){ seen[p.name] = 1; avail.push(p); } });
    }
    // A Path already taken stays listed even if the character later stops qualifying, so it can
    // always be seen and cleared rather than becoming invisible but still in effect.
    Object.keys(taken).forEach(r=>{
      const p = findPath(taken[r]);
      if(p && !seen[p.name]){ seen[p.name] = 1; avail.push(p); }
    });
    if(!avail.length){ wrap.style.display = 'none'; note.style.display = 'none'; sel.innerHTML = ''; return; }
    const takenNames = Object.keys(taken).map(r=>taken[r]);
    let html = '<option value="">\u2014 no Alternate Path \u2014</option>';
    avail.forEach(p=>{
      const unmet = pathRequirementsUnmet(p);
      const isTaken = takenNames.indexOf(p.name) >= 0;
      let label = p.name + ' (replaces Rank ' + p.techRank + ')';
      if(unmet.length) label += ' \u2014 \ud83d\udd12 needs ' + unmet.join(', ');
      // The padlock has to DISABLE the option, not just decorate it - the same
      // visible-but-unselectable contract Kata, Spells and Kiho all use. A Path already taken
      // stays selectable even if the character has since stopped qualifying, so it can always
      // be cleared rather than becoming locked in.
      const blocked = unmet.length > 0 && !isTaken;
      html += '<option value="' + escAttr(p.name) + '"' + (isTaken ? ' selected' : '')
            + (blocked ? ' disabled' : '') + '>' + escAttr(label) + '</option>';
    });
    sel.innerHTML = html;
    wrap.style.display = '';
    // Notes for the active Path: what it costs you, and what no sheet can check for you.
    const active = takenNames.map(findPath).filter(Boolean);
    const bits = [];
    active.forEach(p=>{
      bits.push('<strong>' + escHtml(p.name) + '</strong> replaces your Rank ' + p.techRank + ' Technique (' + escHtml(p.source) + ')');
      const nar = pathNarrativeRequirements(p);
      if(nar.length) bits.push('confirm with your GM: ' + escHtml(nar.join('; ')));
      if(p.kihoGrantOverride !== undefined) bits.push('grants ' + p.kihoGrantOverride + ' Kiho at that Rank instead of the usual ' + KIHO_DEFAULT_GRANT_PER_RANK);
      if(p.grantsKiho) bits.push('its Technique grants ' + p.grantsKiho + ' Kiho that do not count against your purchase cap');
      (p.banKihoTypes||[]).forEach(t=>bits.push('you may not learn or use <strong>' + escHtml(t) + '</strong> Kiho'));
      if(p.conditional) bits.push((p.conditional.severity === 'permanent' ? '<strong>Permanent:</strong> ' : 'Conditional: ') + escHtml(p.conditional.text));
    });
    if(bits.length){ note.innerHTML = bits.join(' \u00b7 '); note.style.display = ''; }
    else { note.innerHTML = ''; note.style.display = 'none'; }
  }
  document.getElementById('pathPicker').addEventListener('change', ()=>{
    const sel = document.getElementById('pathPicker');
    const chosen = findPath(sel.value);
    // Safety net behind the disabled attribute, matching the Kata/Spell/Kiho quick-add: never
    // trust the control alone. A Path whose requirements are unmet is refused here even if the
    // option was somehow selectable, and the picker is put back to what is actually recorded.
    if(chosen){
      const unmet = pathRequirementsUnmet(chosen);
      const alreadyTaken = Object.keys(getPathTaken()).some(r=>getPathTaken()[r] === chosen.name);
      if(unmet.length && !alreadyTaken){
        appAlert(chosen.name + ' requires ' + unmet.join(', ') + '.', 'Got it');
        renderPathPicker();
        return;
      }
    }
    const rec = {};
    // One Path per Rank, and this picker manages a single choice at a time - selecting a Path
    // replaces whatever was recorded, and the blank option clears it.
    if(chosen) rec[String(chosen.techRank)] = chosen.name;
    savePathTaken(rec);
    recalcAll();
    setStatus(chosen ? ('Alternate Path set: ' + chosen.name + ' (replaces Rank ' + chosen.techRank + ').')
                     : 'Alternate Path cleared.');
  });
  function monkSpecialisation(){
    const el = document.getElementById('f_monkSpecialisation');
    return el ? (el.value||'').trim() : '';
  }
  // Rules that belong beside the number they affect, rather than in a badge somewhere else.
  //   Glory: a Brotherhood monk's Glory gain is halved for the rest of his advancement (Core
  //          Rulebook p.231). There is no Glory-award mechanic on this sheet to halve, so the
  //          reminder sits by the field the player edits by hand.
  //   Honor: the Fudoist Order's bonus is twice the gap between the character's Honor Rank and
  //          his OPPONENT'S. The sheet models one character and has no opponent, so it states
  //          the rule and the choice rather than pretending it can compute it.
  function renderMonkFieldNotes(){
    const gloryNote = document.getElementById('gloryMonkNote');
    const honorNote = document.getElementById('honorChoiceNote');
    const entry = findAnySchoolLibraryEntry((document.getElementById('f_school').value||'').trim());
    if(gloryNote){
      const show = activeSchoolIsBrotherhood();
      gloryNote.textContent = show
        ? 'Monk: Glory gain is halved for the rest of this character\u2019s advancement. The sheet does not track Glory awards, so halve them yourself when you record one.'
        : '';
      gloryNote.style.display = show ? '' : 'none';
    }
    if(honorNote){
      const spec = monkSpecialisation();
      const show = !!(entry && entry.specialisationChoices && spec);
      honorNote.textContent = show
        ? entry.name + ': you specialise in ' + spec + '. Add twice the difference between your Honor Rank and your opponent\u2019s to those rolls \u2014 not applied automatically, since the sheet has no opponent to measure against.'
        : '';
      honorNote.style.display = show ? '' : 'none';
    }
  }
  // The Kiho rules reference. This used to sit open above the Techniques list and ran to about
  // eleven lines on a phone, which buried the free-pick counter and the quick-add beneath it.
  // The detail is unchanged - it just lives behind the same round info button the Skill rows
  // and the Affinity/Deficiency badges already use, so the panel keeps one line of guidance
  // and the rest is a tap away.
  const KIHO_RULES_TEXT = [
    'ACTIVATION',
    'Unless a Kiho\u2019s own text says otherwise, activate it by spending a Void Point (a Free Action), or by rolling Meditation / Void against TN 15 (a Complex Action) or TN 30 (a Simple Action).',
    'ATEMI',
    'An (Atemi) Kiho activates as part of its activating attack, and is a Free Action either way \u2014 whether you pay with a Void Point or with the TN 15 roll.',
    'WHAT THIS SHEET DOES NOT TRACK',
    'You may have only one each of Internal, Kharmic and Mystical Kiho active at any time. Several Martial Kiho may be active at once, but you may deliver only one Kiho effect per unarmed strike per Turn. The sheet does not track which Kiho you currently have active \u2014 that is combat state, and it is yours to keep.',
    'SPENDING VOID',
    'Use \u201cSpend Void: Activate a Kiho\u201d in the Void panel to pay for one. For a Brotherhood School that spend counts as a School Technique, so it is exempt from the one-Void-Point-per-Round limit both ways round: it is never blocked by a point already spent this Round, and it does not use up the Round\u2019s allowance. The exemption is Brotherhood-only \u2014 a Clan [Monk] School pays the ordinary price.',
  ].join('\n');
  (function(){
    const btn = document.getElementById('kihoRulesInfoBtn');
    if(btn) btn.addEventListener('click', ()=>appAlert(KIHO_RULES_TEXT, 'Got it'));
  })();
  // The free-pick / purchase-cap counter under the Kiho quick-add. Reads kihoEntitlement()
  // only - it renders state, it never decides anything.
  function renderKihoGrantNote(){
    const box = document.getElementById('kihoGrantNote');
    if(!box) return;
    const ent = kihoEntitlement();
    // Nothing to say for a character with no route to Kiho at all.
    if(!ent.brotherhood && ent.purchasedCap <= 0 && ent.purchased === 0 && ent.grantedTaken === 0){
      box.style.display = 'none'; box.innerHTML = ''; return;
    }
    const bits = [];
    if(ent.brotherhood){
      if(ent.overGranted > 0){
        bits.push(`<strong>${ent.overGranted} free Kiho more than this School grants at Rank ${ent.rank}</strong> — remove ${ent.overGranted}, or raise your School Rank`);
      } else {
        bits.push(`Free Kiho picks: <strong>${ent.freePicksLeft}</strong> of ${ent.grantedAllowance} left`);
      }
      if(ent.sameElementStart){
        bits.push(ent.element
          ? `starting Element locked to <strong>${escHtml(ent.element)}</strong> (+${ent.elementRankBonus} to meet its Mastery)`
          : `your first ${ent.startingKiho} picks must share one Element`);
      }
    }
    // Outside the brotherhood block on purpose: Student of Hitsu-do also replaces a Rank of
    // Kikage Zumi, Kuni Witch-Hunter and Asako Henshin, all category-1 Clan [Monk] Schools.
    ent.ringRankBonuses.forEach(b=>{
      bits.push(`<strong>${escHtml(b.ring)}</strong> Kiho Mastery +${b.bonus} (${escHtml(b.source)})`);
    });
    bits.push(`Purchased: <strong>${ent.purchased}</strong> of ${ent.purchasedCap} (cap = cumulative Monk/Shugenja School Rank)`);
    // Considered and deliberately NOT done: free picks can sit spare while XP-bought Kiho are
    // held (delete a granted Kiho, or advance a School Rank, and the counter reads "1 free
    // left, 1 purchased" with a training slot empty). Promoting the bought Kiho into the free
    // slot would not break balance - the ceiling is grants + cap whichever bucket a Kiho sits
    // in - but RAW draws a firm line between Kiho granted by training and bonus Kiho bought
    // for their Mastery Level in XP, with no rule converting one into the other, and doing it
    // automatically would silently refund XP. A prompt suggesting the swap was tried and
    // removed at the user's request. The counter reports the two buckets and nothing else.
    box.innerHTML = bits.join(' · ');
    box.style.display = '';
  }
  function refreshTechQuickAddOptions(){
    const sel = document.getElementById('techQuickAdd');
    if(!sel) return;
    const prevValue = sel.value;
    sel.innerHTML = techQuickAddOptionsHTML();
    // restore selection only if that option still exists and is still enabled
    const stillValid = prevValue && Array.from(sel.options).some(o=>o.value===prevValue && !o.disabled);
    sel.value = stillValid ? prevValue : '';
  }
  function buildTechQuickAdd(){
    const sel = document.getElementById('techQuickAdd');
    sel.innerHTML = techQuickAddOptionsHTML();

    sel.addEventListener('change', ()=>{
      if(!sel.value) return;
      const [kind, idxStr] = sel.value.split(':');
      const idx = parseInt(idxStr,10);
      if(kind==='kata'){
        const k = KATA_LIBRARY[idx];
        if(!kataEligibility(k).eligible){ sel.value=''; return; } // safety: ignore if somehow triggered while locked
        const meta = `[Kata — ${k.ring} ${k.mastery}${k.schools && k.schools!=='Any' ? `, Schools: ${k.schools}` : ''}] `;
        document.getElementById('techList').appendChild(makeEntry({name:k.name, cost:k.mastery, desc:meta+k.desc}, true, 'XP'));
        setStatus(`Added ${k.name} (${k.mastery} XP).`);
      } else if(kind==='kiho'){
        const k = KIHO_LIBRARY[idx];
        const offer = kihoOffer(k);
        // safety: ignore if somehow triggered while locked or over the purchase cap
        if(offer.offer !== 'free' && offer.offer !== 'purchase'){ sel.value=''; return; }
        const isFree = offer.offer === 'free';
        // Cost is Mastery x the acquisition multiplier, NOT a flat Mastery charge like Kata —
        // a Clan [Monk] School pays 1.5x and a Shugenja 2x (Core Rulebook p.266).
        // Free picks are tagged with the granting School, so a later School change can revert
        // exactly those rows - the same tag-and-revert contract Rank Techniques already use.
        const freeTag = isFree ? `${KIHO_FREE_TAG}${(document.getElementById('f_school').value||'').trim()}` : '';
        const meta = `[Kiho — ${k.ring} ${k.mastery}, ${k.type}${k.atemi ? ' (Atemi)' : ''}${freeTag}] `;
        // The first free starting pick under Seven Thunders locks the Element for the rest.
        if(isFree && offer.ent && offer.ent.sameElementStart && !offer.ent.element){
          document.getElementById('f_monkKihoElement').value = k.ring;
        }
        // p.261: an atemi Kiho activates as part of its activating attack and is a Free Action
        // either way, so that line is derived from the atemi flag rather than stored per Kiho.
        const activation = k.activation
          ? ` Activation: ${k.activation}`
          : (k.atemi
              ? ' Activation: as part of the activating atemi attack — a Free Action, by Void Point or a TN 15 Meditation / Void roll.'
              : ' Activation: Void Point (Free Action), or Meditation / Void vs. TN 15 (Complex Action) or TN 30 (Simple Action).');
        document.getElementById('techList').appendChild(makeEntry({name:k.name, cost:offer.cost, desc:meta+k.desc+activation}, true, 'XP'));
        setStatus(isFree
          ? `Added ${k.name} as a free School Kiho (0 XP).`
          : `Added ${k.name} (${offer.cost} XP).`);
      } else if(kind==='spell'){
        const s = SPELL_LIBRARY[idx];
        // Maho bypasses the Mastery/effective-School-Rank eligibility check entirely (see
        // techQuickAddOptionsHTML above) — only scroll ownership gates it.
        if(!s.maho && !spellEligibility(s).eligible){ sel.value=''; return; } // safety: ignore if somehow triggered while over Mastery
        if(!hasSpellScroll(s.name)){ sel.value=''; return; } // safety: ignore if somehow triggered while locked (missing scroll)
        const meta = `[Spell — ${s.element} ${s.mastery}${s.maho ? ', Maho' : ''}] `;
        // Air/Earth/Fire/Water/Void spells get a Cast button tied straight to their Spell
        // Slots row. A 'Universal' spell (Commune/Sense/Summon) isn't tied to one row — it
        // gets the marker 'universal' instead, which makeEntry() also renders a Cast button
        // for, but wired to castUniversalSpell() (element-picker-first) rather than castSpell()
        // directly — see the techList click handler below. Maho spells (spellIsMaho) route
        // through castMahoSpell() instead of either of those, regardless of element — see that
        // click handler.
        const elKey = s.element.toLowerCase();
        const spellElement = SPELL_ELEMENTS.some(e=>e.key===elKey) ? elKey : (s.element==='Universal' ? 'universal' : '');
        document.getElementById('techList').appendChild(makeEntry({name:s.name, cost:0, desc:meta+s.desc, spellElement, spellMastery:s.mastery, spellKeywords:s.keywords||[], spellIsMaho:s.maho===true}, true, 'XP'));
        setStatus(`Added ${s.name}.`);
      }
      recalcAll();
      sel.value = '';
    });
  }
  buildTechQuickAdd();
