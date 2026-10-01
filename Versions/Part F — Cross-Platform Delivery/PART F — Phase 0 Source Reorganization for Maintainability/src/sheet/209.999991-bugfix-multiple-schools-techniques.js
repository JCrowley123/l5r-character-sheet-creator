  // ============ BUGFIX MSTECH — MULTIPLE SCHOOLS KEEP EARLIER TECHNIQUES ============
  // The Multiple Schools Advantage (Core Rulebook p.151, and the sidebar on p.152) stops progress
  // in the character's current School and starts the next one at Rank 1; the character keeps what
  // the first dojo taught. The trunk's applyUnlockedTechniquesToList() treats ANY change of the
  // active School as the School being replaced, and strips the previous School's granted Technique
  // rows and its free Kiho picks. Adding a School with "+ Add School" changes the active School
  // too, so the earlier School's Techniques vanished the moment the new School unlocked (measured
  // 1 October 2026: a Rank 3 Hida Bushi lost all three on adding Hiruma Bushi).
  //
  // The Schools list tells the two cases apart. A previous School that is still one of the
  // character's earlier Schools was added past, not replaced: its rows stay, and the trunk is
  // handed no previous grant to strip. A previous School that is gone from the list (Apply School
  // starts a new list; typing in the School field renames the active one) was replaced: the trunk
  // strips it exactly as before, and the rows of any other School no longer in the list (kept
  // earlier by this fix) go with it, so a real School change still leaves only the new School's.
  //
  // Rebinds the trunk function, as the configured Disadvantages fragment rebinds its own trunk
  // hooks; recalcAll() and the test seam resolve the binding when they call it. No CSS, markup,
  // save field or seam key. Kill switch: MSTECH_ENABLED.
  const MSTECH_ENABLED = true;
  const msTechTrunkApply = applyUnlockedTechniquesToList;
  const MSTECH_ROW_PREFIX = /^\[School Technique — Rank \d+, /;

  function msTechSchoolNames(){
    return getSchoolsList().map(e=>e && e.name).filter(Boolean);
  }
  // Which School a granted row belongs to, from the tag the trunk stamps on it. Matched against
  // the library's School names, the list's, and the names the rows' own tags carry (a typed,
  // custom School), longest first, because a name may itself contain "]" ("Kaiu Engineer
  // [Artisan/Bushi]"). A row without the tag is never touched.
  function msTechTaggedSchool(text, names){
    if(!MSTECH_ROW_PREFIX.test(text)) return null;
    const rest = text.replace(MSTECH_ROW_PREFIX, '');
    return names.find(n=>rest.indexOf(n + ']') === 0) || null;
  }
  function msTechClearDroppedSchools(){
    const kept = msTechSchoolNames();
    const names = Array.from(new Set(allSchoolEntries().map(e=>e.name)
      .concat(kept, Array.from(document.querySelectorAll('#techList .entry .en-desc'))
        .map(d=>(d.value.match(/^\[School Technique — Rank \d+, (.+?)\] /) || [])[1]).filter(Boolean))))
      .sort((a,b)=>b.length - a.length);
    Array.from(document.querySelectorAll('#techList .entry')).forEach(div=>{
      const desc = div.querySelector('.en-desc');
      const school = desc ? msTechTaggedSchool(desc.value, names) : null;
      if(school && kept.indexOf(school) < 0) div.remove();
    });
    kihoRows().forEach(div=>{
      const school = names.find(n=>kihoRowIsFree(div, n));
      if(school && kept.indexOf(school) < 0) div.remove();
    });
  }
  applyUnlockedTechniquesToList = function(schoolName, rank){
    if(!MSTECH_ENABLED) return msTechTrunkApply(schoolName, rank);
    const prev = getSchoolTechGranted();
    const changed = !!(prev && prev.school && prev.school !== schoolName);
    const earlier = changed && msTechSchoolNames().slice(0, -1).indexOf(prev.school) >= 0;
    if(earlier) saveSchoolTechGranted(null);
    const result = msTechTrunkApply(schoolName, rank);
    if(changed && !earlier) msTechClearDroppedSchools();
    return result;
  };
  // ============ END BUGFIX MSTECH ============
