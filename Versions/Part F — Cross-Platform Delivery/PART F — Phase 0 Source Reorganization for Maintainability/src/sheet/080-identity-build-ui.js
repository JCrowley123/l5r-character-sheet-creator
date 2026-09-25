  // ---------- Clan / Family / School picker wiring ----------
  const TRAIT_ID_MAP = {
    'Reflexes':'trait_reflexes','Awareness':'trait_awareness','Stamina':'trait_stamina','Willpower':'trait_willpower',
    'Agility':'trait_agility','Intelligence':'trait_intelligence','Strength':'trait_strength','Perception':'trait_perception',
  };
  // Family/School Trait bonuses raise both the trait's value AND its "free floor" (data-free),
  // so the bonus point itself never shows up as spent XP — only points bought above that floor do.
  function grantFreeTraitBonus(traitName, amount){
    let el;
    if(traitName==='Void'){ el = document.getElementById('ring_void'); }
    else { const id = TRAIT_ID_MAP[traitName]; el = id ? document.getElementById(id) : null; }
    if(!el) return;
    el.value = parseInt(el.value||'2',10) + amount;
    el.dataset.free = String(parseInt(el.dataset.free||'2',10) + amount);
  }

  // ---------- Family / School "applied contribution" tracking ----------
  // Family and School bonuses (trait bonus, and for School: its skills) must be *replaceable*,
  // not permanently stacked. We persist exactly what the currently-applied Family/School
  // granted in two small hidden f_-prefixed JSON fields (auto-saved/loaded by the same
  // generic `[id^="f_"]` sweep already used for f_schoolsData above) — then Apply Family/
  // Apply School always revert whatever the previous record says was granted BEFORE granting
  // the newly-selected one. That makes re-applying the same choice a no-op, and switching
  // choices a clean swap, no matter how many times Apply is clicked.
  // (Characters saved before this tracking existed simply have no record to revert on their
  // first Apply after upgrading — we never guess at or delete un-tracked history.)
  function getFamilyApplied(){
    const raw = document.getElementById('f_familyApplied').value;
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }
  function saveFamilyApplied(rec){
    document.getElementById('f_familyApplied').value = JSON.stringify(rec);
  }
  function getSchoolApplied(){
    const raw = document.getElementById('f_schoolApplied').value;
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }
  function saveSchoolApplied(rec){
    document.getElementById('f_schoolApplied').value = JSON.stringify(rec);
  }
  function findSkillRowByName(name){
    const el = Array.from(document.querySelectorAll('#skillsBody .sk-name'))
      .find(el=>el.value.trim().toLowerCase()===name.trim().toLowerCase());
    return el ? el.closest('tr') : null;
  }
  // Removes one free (school-granted) Emphasis matching `emph` from a skill row, if still present.
  function removeFreeEmphasisIfPresent(tr, emph){
    if(!emph) return;
    const row = Array.from(tr.querySelectorAll('.emph-container .emph-item-row'))
      .find(r=>{
        if(r.dataset.free!=='1') return false;
        const w = r.querySelector('.sk-emph-select, .sk-emph-text');
        return w && w.value.trim().toLowerCase()===emph.trim().toLowerCase();
      });
    if(row) row.remove();
  }
  // Reverts whatever the previously-applied Family granted (its +1 Trait), if any.
  function revertFamilyApplied(){
    const prev = getFamilyApplied();
    if(prev && prev.trait){ grantFreeTraitBonus(prev.trait, -(prev.amount||1)); }
  }
  // Reverts whatever the previously-applied School granted: its +1 Trait benefit, every skill
  // it touched, and every starting-outfit Equipment row it added. A skill row the School itself
  // created is removed entirely; a skill that already existed (and the School only bumped its
  // rank/added an Emphasis to) has just that rank/Emphasis rolled back to what it was
  // immediately before, leaving the rest of the row (and any unrelated skills) untouched.
  // Equipment rows are matched purely by their schoolGranted tag (set in makeEquipRow when the
  // School added them), so a since-renamed item is still found and removed correctly — School
  // Rank Techniques are reverted separately, by applyUnlockedTechniquesToList on the next
  // recalcAll (it compares f_schoolTechGranted the same way), not here.
  function revertSchoolApplied(){
    const prev = getSchoolApplied();
    if(!prev) return;
    if(prev.trait){ grantFreeTraitBonus(prev.trait, -(prev.amount||1)); }
    (prev.skillGrants||[]).forEach(g=>{
      const tr = findSkillRowByName(g.name);
      if(!tr) return;
      if(g.createdRow){
        tr.remove();
      } else {
        if(typeof g.priorRank==='number'){ tr.querySelector('.sk-rank').value = g.priorRank; }
        if(typeof g.priorFree==='number'){ tr.querySelector('.sk-rank').dataset.free = String(g.priorFree); }
        if(typeof g.priorSchoolChecked==='boolean'){ tr.querySelector('.sk-school').checked = g.priorSchoolChecked; }
        if(g.addedEmph){ removeFreeEmphasisIfPresent(tr, g.addedEmph); }
      }
    });
    if(prev.school){
      Array.from(document.querySelectorAll('#equipBody tr')).forEach(tr=>{
        if(tr.dataset.schoolGranted === prev.school) tr.remove();
      });
    }
    // Brotherhood monk creation deltas, undone so that switching from a monk School to any
    // other School leaves no monk baseline behind. The Void bonus goes back through
    // grantFreeTraitBonus so BOTH the value and its free floor come down together - reverting
    // only the value would silently bill the player XP for a rank the School had given away.
    // Glory/Status are restored to the exact values captured immediately before applying.
    if(prev.monk){
      if(prev.monk.voidBonus) grantFreeTraitBonus('Void', -prev.monk.voidBonus);
      const restore = (id, val)=>{ if(val !== undefined && val !== null){ const el = document.getElementById(id); if(el) el.value = val; } };
      restore('f_gloryRank',  prev.monk.priorGloryRank);
      restore('f_gloryPts',   prev.monk.priorGloryPts);
      restore('f_statusRank', prev.monk.priorStatusRank);
      restore('f_statusPts',  prev.monk.priorStatusPts);
    }
  }
  const clanSel = document.getElementById('cfs_clan');
  const minorClanSel = document.getElementById('cfs_minorClan');
  const familySel = document.getElementById('cfs_family');
  const schoolSel = document.getElementById('cfs_school');

  // "Minor Clan" is a synthetic Clan option (not a key in FAMILY_LIBRARY/SCHOOL_LIBRARY
  // itself) that reveals the Minor Clan sub-select; Families for it come from
  // MINOR_CLAN_LIBRARY[minorClanSel.value] instead of FAMILY_LIBRARY[clanSel.value].
  // "Brotherhood of Shinsei" is a second synthetic Clan option, built exactly like 'Minor
  // Clan' above: it is not a key in either library, it just switches which list the School
  // picker draws from. It needs no sub-select - the Brotherhood is not subdivided by clan -
  // and it offers no Families, so the Family picker correctly falls through to "none listed".
  const allClanNames = Array.from(new Set([...Object.keys(FAMILY_LIBRARY), ...Object.keys(SCHOOL_LIBRARY), 'Minor Clan', 'Brotherhood of Shinsei']));
  clanSel.innerHTML = allClanNames.map(c=>`<option value="${escAttr(c)}">${escAttr(c)}</option>`).join('');
  minorClanSel.innerHTML = Object.keys(MINOR_CLAN_LIBRARY).map(mc=>`<option value="${escAttr(mc)}">${escAttr(mc)}</option>`).join('');

  function isMinorClan(){ return clanSel.value === 'Minor Clan'; }
  function isBrotherhood(){ return clanSel.value === 'Brotherhood of Shinsei'; }
  // Single source of truth for "which Schools does the picker show right now", so the four
  // call sites below cannot drift apart as libraries are added.
  function schoolsForPicker(){
    if(isBrotherhood()) return BROTHERHOOD_SCHOOL_LIBRARY;
    if(isMinorClan()) return MINOR_CLAN_SCHOOL_LIBRARY[minorClanSel.value] || [];
    return SCHOOL_LIBRARY[clanSel.value] || [];
  }
  function refreshMinorClanVisibility(){
    document.getElementById('cfs_minorClanWrap').style.display = isMinorClan() ? 'block' : 'none';
  }
  function refreshFamilyOptions(){
    const fams = isMinorClan() ? (MINOR_CLAN_LIBRARY[minorClanSel.value] || []) : (FAMILY_LIBRARY[clanSel.value] || []);
    familySel.innerHTML = fams.map(f=>`<option value="${escAttr(f[0])}">${escAttr(f[0])} (+1 ${escAttr(f[1])})</option>`).join('') || '<option value="">— none listed —</option>';
  }
  function refreshSchoolOptions(){
    const schools = schoolsForPicker();
    schoolSel.innerHTML = schools.map(s=>`<option value="${escAttr(s.name)}">${escAttr(s.name)}</option>`).join('') || '<option value="">— none listed for this clan —</option>';
    renderSchoolInfo();
  }
  function renderSchoolInfo(){
    const schools = schoolsForPicker();
    const sc = schools.find(s=>s.name===schoolSel.value);
    const info = document.getElementById('cfs_schoolInfo');
    if(!sc){ info.innerHTML=''; return; }
    const benefitText = sc.benefit ? `Benefit +1 ${escHtml(sc.benefit)} · ` : '';
    // A Brotherhood School shows its Devotion where a Clan School shows nothing. devotion.type
    // is null for the Fudoist Order (Imperial Histories 2), so that case reads "none".
    const devotionText = sc.devotion
      ? `Devotion: ${escHtml(sc.devotion.type || 'none')}${sc.devotion.fortune ? ` (${escHtml(sc.devotion.fortune)})` : ''} · `
      : '';
    const honorText = (sc.honorChoices && sc.honorChoices.length)
      ? `Honor ${sc.honorChoices.join(' or ')} (you choose at creation)`
      : ((sc.honor === null || sc.honor === undefined) ? 'Honor not printed in source' : `Honor ${sc.honor}`);
    info.innerHTML = `<strong>${escHtml(sc.name)}</strong> — ${devotionText}${benefitText}${honorText} · Skills: ${escHtml(sc.skills)}<br>Outfit: ${escHtml(sc.outfit)}<br>Techniques (names only): ${sc.tech.map(escHtml).join(' · ')}`;
    // Preview the creation deltas before Apply is clicked, so the Void/Glory/Status changes are
    // not a surprise. Applying is what actually sets them - see the cfs_applySchool handler.
    if(sc.brotherhood){
      // A School whose own Trait benefit is +1 Void (Hoshi Tsurui Zumi) stacks that on top of
      // the monk baseline, so quote the real figure rather than the generic 3.
      const monkVoid = MONK_CREATION.voidRank + (sc.benefit === 'Void' ? 1 : 0);
      if(sc.specialisationChoices) info.innerHTML += `<br><em>You also choose at creation: ${escHtml(sc.specialisationChoices.join(' or '))}.</em>`;
      if(sc.setting) info.innerHTML += `<br><em>Setting: ${escHtml(sc.setting)}</em>`;
      info.innerHTML += `<br><em>Monk: Void starts at ${monkVoid}${sc.benefit === 'Void' ? ' (3 as a monk, +1 from this School\u2019s own benefit)' : ''}, Glory 1 / Status 0, and Glory gain is halved thereafter. Begins knowing ${sc.startingKiho || 3} Kiho.</em>`;
    }
  }
  clanSel.addEventListener('change', ()=>{
    refreshMinorClanVisibility();
    refreshFamilyOptions();
    refreshSchoolOptions();
  });
  minorClanSel.addEventListener('change', ()=>{ refreshFamilyOptions(); refreshSchoolOptions(); });
  schoolSel.addEventListener('change', renderSchoolInfo);
  refreshMinorClanVisibility();
  refreshFamilyOptions();
  refreshSchoolOptions();

  document.getElementById('cfs_applyFamily').addEventListener('click', ()=>{
    const clan = clanSel.value, fam = familySel.value;
    const lib = isMinorClan() ? (MINOR_CLAN_LIBRARY[minorClanSel.value] || []) : (FAMILY_LIBRARY[clan] || []);
    const entry = lib.find(f=>f[0]===fam);
    if(!entry){ setStatus('No family selected.'); return; }
    const traitName = entry[1];
    // Replace, don't stack: undo whatever the previously-applied Family granted first.
    revertFamilyApplied();
    // For a Minor Clan family, record the actual Minor Clan name (e.g. "Badger") as the
    // character's Clan — "Minor Clan" itself is just the picker option, not a real Clan.
    document.getElementById('f_clan').value = isMinorClan() ? minorClanSel.value : clan;
    document.getElementById('f_family').value = fam;
    grantFreeTraitBonus(traitName, 1);
    saveFamilyApplied({ family: fam, trait: traitName, amount: 1 });
    recalcAll();
    setStatus(`Applied ${fam}: +1 ${traitName} (free — no XP cost).`);
  });

  // Affinity Element picker for Schools that let the player choose their own Affinity
  // (currently only Isawa Shugenja — see affinityChoice:true in SCHOOL_LIBRARY). Same
  // self-contained Promise-modal pattern as appConfirm() below: resolves with the chosen
  // Element string on Confirm, or null if the X button (or an empty selection) cancels —
  // in which case the caller applies nothing at all, so there is nothing to undo.
  const AFFINITY_ELEMENTS = ['Air','Earth','Fire','Water','Void'];
  // Both pickers share one modal, so each sets its own heading text on the way in rather than
  // inheriting whatever the previous caller left behind.
  function setPickModalText(title, subtitle, note){
    const overlay = document.getElementById('affinityPickModalOverlay');
    const h3 = overlay.querySelector('h3');
    const notation = overlay.querySelector('.notation');
    const noteEl = overlay.querySelector('.affinity-pick-note');
    if(h3) h3.textContent = title;
    if(notation) notation.textContent = subtitle;
    if(noteEl){ noteEl.textContent = note || ''; noteEl.style.display = note ? '' : 'none'; }
  }
  // Starting Honor as a player choice. The Fudoist Order (Imperial Histories 2 p.287) prints
  // "Starting Honor: 1.5 or 4.5" because its Technique scales off the gap between the
  // character's Honor Rank and his opponent's, so a deliberately dishonourable Fudoist is a
  // legitimate build rather than a mistake. Same Promise-modal contract as the Affinity picker:
  // resolves with the chosen number, or null if cancelled, in which case nothing is applied.
  function pickStartingHonor(sc){
    return new Promise(resolve=>{
      const overlay = document.getElementById('affinityPickModalOverlay');
      const grid = document.getElementById('affinityPickGrid');
      setPickModalText('Choose Starting Honor', sc.name + ' \u2014 select one',
        'This School lets you begin at either Honor Rank. Its Technique rewards the gap between your Honor and your opponent\u2019s, so a low Honor Rank is a deliberate build, not a penalty.');
      grid.innerHTML = (sc.honorChoices||[]).map(v=>`
        <div class="affinity-pick-item" data-el="${escAttr(String(v))}">
          <label for="honorPick_${escAttr(String(v))}">Honor ${escHtml(String(v))}</label>
          <input type="checkbox" id="honorPick_${escAttr(String(v))}">
        </div>`).join('');
      overlay.style.display = 'flex';
      const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
      const boxes = items.map(item=>item.querySelector('input[type="checkbox"]'));
      boxes.forEach((box,i)=>{
        box.addEventListener('change', ()=>{
          if(box.checked){
            boxes.forEach((other,j)=>{ if(j!==i){ other.checked = false; items[j].classList.remove('checked'); } });
            items[i].classList.add('checked');
          } else { items[i].classList.remove('checked'); }
        });
      });
      const confirmBtn = document.getElementById('affinityPickConfirm');
      const xBtn = document.getElementById('affinityPickX');
      const cleanup = (result)=>{
        overlay.style.display = 'none';
        confirmBtn.removeEventListener('click', onConfirm);
        xBtn.removeEventListener('click', onCancel);
        resolve(result);
      };
      const onConfirm = ()=>{
        const chosen = items.find(item=>item.querySelector('input[type="checkbox"]').checked);
        if(!chosen){ setStatus('Select a starting Honor Rank before confirming.'); return; }
        cleanup(parseFloat(chosen.dataset.el));
      };
      const onCancel = ()=>cleanup(null);
      confirmBtn.addEventListener('click', onConfirm);
      xBtn.addEventListener('click', onCancel);
    });
  }
  // The Fudoist Order's second creation choice, same Promise-modal contract as the others.
  function pickSpecialisation(sc){
    return new Promise(resolve=>{
      const overlay = document.getElementById('affinityPickModalOverlay');
      const grid = document.getElementById('affinityPickGrid');
      setPickModalText('Choose Specialisation', sc.name + ' \u2014 select one',
        'Your Honor-gap bonus applies to whichever you pick.');
      grid.innerHTML = (sc.specialisationChoices||[]).map(t=>`
        <div class="affinity-pick-item" data-el="${escAttr(t)}">
          <label>${escHtml(t)}</label>
          <input type="checkbox">
        </div>`).join('');
      overlay.style.display = 'flex';
      const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
      const boxes = items.map(item=>item.querySelector('input[type="checkbox"]'));
      boxes.forEach((box,i)=>{
        box.addEventListener('change', ()=>{
          if(box.checked){
            boxes.forEach((other,j)=>{ if(j!==i){ other.checked = false; items[j].classList.remove('checked'); } });
            items[i].classList.add('checked');
          } else { items[i].classList.remove('checked'); }
        });
      });
      const confirmBtn = document.getElementById('affinityPickConfirm');
      const xBtn = document.getElementById('affinityPickX');
      const cleanup = (result)=>{
        overlay.style.display = 'none';
        confirmBtn.removeEventListener('click', onConfirm);
        xBtn.removeEventListener('click', onCancel);
        resolve(result);
      };
      const onConfirm = ()=>{
        const chosen = items.find(item=>item.querySelector('input[type="checkbox"]').checked);
        if(!chosen){ setStatus('Select a specialisation before confirming.'); return; }
        cleanup(chosen.dataset.el);
      };
      const onCancel = ()=>cleanup(null);
      confirmBtn.addEventListener('click', onConfirm);
      xBtn.addEventListener('click', onCancel);
    });
  }
  function pickAffinityElement(){
    return new Promise(resolve=>{
      const overlay = document.getElementById('affinityPickModalOverlay');
      const grid = document.getElementById('affinityPickGrid');
      setPickModalText('Choose Affinity', 'Isawa Shugenja \u2014 select one Element',
        'Isawa Shugenja has no Deficiency.');
      grid.innerHTML = AFFINITY_ELEMENTS.map(el=>`
        <div class="affinity-pick-item" data-el="${escAttr(el)}">
          <label for="affinityPick_${escAttr(el)}">${escHtml(el)}</label>
          <input type="checkbox" id="affinityPick_${escAttr(el)}">
        </div>`).join('');
      overlay.style.display = 'flex';
      const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
      const boxes = items.map(item=>item.querySelector('input[type="checkbox"]'));
      // Ticking one box unticks every other — only one Element can be selected at a time.
      boxes.forEach((box,i)=>{
        box.addEventListener('change', ()=>{
          if(box.checked){
            boxes.forEach((other,j)=>{ if(j!==i){ other.checked = false; items[j].classList.remove('checked'); } });
            items[i].classList.add('checked');
          } else {
            items[i].classList.remove('checked');
          }
        });
      });
      const confirmBtn = document.getElementById('affinityPickConfirm');
      const xBtn = document.getElementById('affinityPickX');
      const cleanup = (result)=>{
        overlay.style.display = 'none';
        confirmBtn.removeEventListener('click', onConfirm);
        xBtn.removeEventListener('click', onCancel);
        resolve(result);
      };
      const onConfirm = ()=>{
        const chosen = items.find(item=>item.querySelector('input[type="checkbox"]').checked);
        if(!chosen){ setStatus('Select an Element before confirming.'); return; }
        cleanup(chosen.dataset.el);
      };
      const onCancel = ()=>cleanup(null);
      confirmBtn.addEventListener('click', onConfirm);
      xBtn.addEventListener('click', onCancel);
    });
  }

  // Deficiency Element picker for a School that requires the player to choose it (currently
  // only Chuda Shugenja — see elementDeficiencyChoice:true in SCHOOL_LIBRARY). Same
  // self-contained Promise-modal pattern as pickAffinityElement() above: resolves with the
  // chosen Element string on Confirm, or null if the X button (or an empty selection)
  // cancels — in which case the caller applies nothing at all, so there is nothing to undo.
  // Void is excluded, same as pickUniversalSpellElement() below — Chuda's Deficiency Element
  // can only ever be Air/Earth/Fire/Water, per its own rules.
  const DEFICIENCY_ELEMENTS = ['Air','Earth','Fire','Water'];
  function pickDeficiencyElement(){
    return new Promise(resolve=>{
      const overlay = document.getElementById('deficiencyPickModalOverlay');
      const grid = document.getElementById('deficiencyPickGrid');
      grid.innerHTML = DEFICIENCY_ELEMENTS.map(el=>`
        <div class="affinity-pick-item" data-el="${escAttr(el)}">
          <label for="deficiencyPick_${escAttr(el)}">${escHtml(el)}</label>
          <input type="checkbox" id="deficiencyPick_${escAttr(el)}">
        </div>`).join('');
      overlay.style.display = 'flex';
      const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
      const boxes = items.map(item=>item.querySelector('input[type="checkbox"]'));
      // Ticking one box unticks every other — only one Element can be selected at a time.
      boxes.forEach((box,i)=>{
        box.addEventListener('change', ()=>{
          if(box.checked){
            boxes.forEach((other,j)=>{ if(j!==i){ other.checked = false; items[j].classList.remove('checked'); } });
            items[i].classList.add('checked');
          } else {
            items[i].classList.remove('checked');
          }
        });
      });
      const confirmBtn = document.getElementById('deficiencyPickConfirm');
      const xBtn = document.getElementById('deficiencyPickX');
      const cleanup = (result)=>{
        overlay.style.display = 'none';
        confirmBtn.removeEventListener('click', onConfirm);
        xBtn.removeEventListener('click', onCancel);
        resolve(result);
      };
      const onConfirm = ()=>{
        const chosen = items.find(item=>item.querySelector('input[type="checkbox"]').checked);
        if(!chosen){ setStatus('Select an Element before confirming.'); return; }
        cleanup(chosen.dataset.el);
      };
      const onCancel = ()=>cleanup(null);
      confirmBtn.addEventListener('click', onConfirm);
      xBtn.addEventListener('click', onCancel);
    });
  }

  document.getElementById('cfs_applySchool').addEventListener('click', async ()=>{
    const clan = clanSel.value;
    const schools = schoolsForPicker();
    const sc = schools.find(s=>s.name===schoolSel.value);
    if(!sc){ setStatus('No school selected.'); return; }
    // Schools that require the player to pick their own Affinity (currently only Isawa
    // Shugenja) are gated on that choice BEFORE anything else happens — nothing below this
    // point runs until Confirm is clicked with an Element ticked, so cancelling (the X
    // button) leaves the character completely untouched and there is nothing to undo.
    let chosenAffinity = null;
    if(sc.affinityChoice){
      chosenAffinity = await pickAffinityElement();
      if(!chosenAffinity){ setStatus(`${sc.name} not applied — no Affinity selected.`); return; }
    }
    // Same gating, same reasoning, for a School that requires the player to pick its
    // Deficiency Element instead (currently only Chuda Shugenja). Independent of the
    // Affinity gate above — a School could in principle need both — and checked before
    // anything is touched, so cancelling here is equally a full no-op.
    let chosenDeficiency = null;
    if(sc.elementDeficiencyChoice){
      chosenDeficiency = await pickDeficiencyElement();
      if(!chosenDeficiency){ setStatus(`${sc.name} not applied — no Deficiency selected.`); return; }
    }
    // Same gating, same reasoning, for a School whose starting Honor is a player choice
    // (currently only the Fudoist Order). Cancelling leaves the character untouched.
    let chosenHonor = null;
    if(sc.honorChoices && sc.honorChoices.length){
      chosenHonor = await pickStartingHonor(sc);
      if(chosenHonor === null){ setStatus(`${sc.name} not applied \u2014 no starting Honor selected.`); return; }
    }
    // And its second choice. Gated before anything is applied, like the others, so cancelling
    // either pick leaves the character completely untouched.
    let chosenSpecialisation = null;
    if(sc.specialisationChoices && sc.specialisationChoices.length){
      chosenSpecialisation = await pickSpecialisation(sc);
      if(chosenSpecialisation === null){ setStatus(`${sc.name} not applied \u2014 no specialisation selected.`); return; }
    }
    // Replace, don't stack: undo whatever the previously-applied School granted first (its
    // trait benefit, and every skill it added/bumped) before granting the newly-selected one.
    revertSchoolApplied();
    // Clear any Affinity/Deficiency a previous School's player-choice may have stored;
    // re-set below if the newly-applied School (sc) needs one itself.
    document.getElementById('f_schoolAffinity').value = '';
    document.getElementById('f_schoolDeficiencyElement').value = '';
    // Seven Thunders' locked starting Element belongs to the School being replaced, and so
    // does the Fudoist Order's specialisation.
    document.getElementById('f_monkKihoElement').value = '';
    document.getElementById('f_monkSpecialisation').value = '';
    // So does any Alternate Path: a Path replaces a Rank of THIS School, so switching School
    // discards it, exactly as the School's own Rank Techniques are discarded.
    savePathTaken({});
    document.getElementById('f_school').value = sc.name;
    // Establishes (or resets) this School as the character's original School — Schools
    // added later via "+ Add School" (Multiple Schools) get appended after this one.
    // anchorInsightRank:0 means no offset — this School's Rank tracks raw Insight Rank
    // directly (floored at 1, per standard chargen), matching the single-School system.
    saveSchoolsList([{ name: sc.name, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0 }]);
    document.getElementById('headerName').textContent = document.getElementById('f_name').value.trim() || document.getElementById('headerName').textContent;
    // Trait benefit (Fuzake Shugenja has no Benefit listed on its source page — grantFreeTraitBonus
    // silently no-ops on an empty trait name, so this stays safe either way)
    if(sc.benefit) grantFreeTraitBonus(sc.benefit, 1);
    // Honor. Unchanged for a monk: the "Playing a Monk" sidebar alters Void, Glory and Status
    // only, and each Brotherhood School carries its own Honor exactly like any other School.
    // The Order of Eternity is the one School with honor:null - the Book of Void simply prints
    // no Honor line for it - so its Honor field is left alone rather than overwritten with a
    // guess or with the string "null".
    // A player-chosen Honor (Fudoist Order) wins over the School's printed value, which for
    // that School is null anyway.
    const honorToSet = (chosenHonor !== null) ? chosenHonor : sc.honor;
    if(honorToSet !== null && honorToSet !== undefined){
      document.getElementById('f_honorRank').value = honorToSet;
      document.getElementById('f_honorPts').value = honorToSet;
    }
    // Brotherhood monk creation deltas (Core Rulebook p.231). Category 2 ONLY - gated on
    // brotherhood:true, never on monk:true or on "[Monk]" appearing in the name, so a Togashi
    // Tattooed Order character is completely unaffected by this block. The priors are captured
    // AFTER revertSchoolApplied() ran above, so re-applying a monk School repeatedly cannot
    // stack, and switching monk School to monk School records a clean non-monk baseline.
    let monkRec = null;
    if(sc.brotherhood){
      const val = id=>{ const el = document.getElementById(id); return el ? el.value : undefined; };
      monkRec = {
        voidBonus: MONK_CREATION.voidRank - 2,
        priorGloryRank: val('f_gloryRank'),   priorGloryPts: val('f_gloryPts'),
        priorStatusRank: val('f_statusRank'), priorStatusPts: val('f_statusPts'),
      };
      // Raises the free floor as well as the value, so the third rank of Void is a grant and
      // not something the XP calculator bills for - same mechanism as a School Trait benefit.
      grantFreeTraitBonus('Void', monkRec.voidBonus);
      document.getElementById('f_gloryRank').value  = MONK_CREATION.gloryRank;
      document.getElementById('f_gloryPts').value   = MONK_CREATION.gloryPts;
      document.getElementById('f_statusRank').value = MONK_CREATION.statusRank;
      document.getElementById('f_statusPts').value  = MONK_CREATION.statusPts;
    }
    // Skills — add concrete named skills (skip "any one X" placeholders). Every skill this
    // application touches is recorded into skillGrants below so the next Apply School (on a
    // different School) can precisely undo just this contribution — see revertSchoolApplied.
    let addedSkills = 0, skippedChoices = 0;
    const skillGrants = [];
    // BUGFIX SCHOOLSKILLROWS BEGIN school-skill-choice-state
    // A free choice or an Emphasis list the library writes across commas is read whole, so its
    // pieces add no rows of their own.
    const schoolSkillRowsReader = (typeof SCHOOL_SKILL_ROWS === 'object' && SCHOOL_SKILL_ROWS) ? SCHOOL_SKILL_ROWS.choiceReader(sc.skills) : null;
    // END SCHOOLSKILLROWS school-skill-choice-state
    sc.skills.split(',').forEach(raw=>{
      let token = raw.trim();
      if(!token) return;
      // BUGFIX SCHOOLSKILLROWS BEGIN school-skill-choice-token
      if(schoolSkillRowsReader){
        const piece = schoolSkillRowsReader(token);
        if(piece === 'choice'){ skippedChoices++; return; }
        if(piece === 'continuation') return;
        if(typeof piece === 'string') token = piece;
      }
      // END SCHOOLSKILLROWS school-skill-choice-token
      if(/^any /i.test(token)){ skippedChoices++; return; }
      // strip a trailing rank number like "Defense 2" -> name Defense, rank 2; strip parenthetical emphasis
      let rank = 1;
      const rankMatch = token.match(/(\d+)\s*$/);
      if(rankMatch){ rank = parseInt(rankMatch[1],10); token = token.replace(/\s*\d+\s*$/,'').trim(); }
      const emphMatch = token.match(/^(.*?)\s*\(([^)]+)\)$/);
      let name = token, emph = '';
      if(emphMatch){ name = emphMatch[1].trim(); emph = emphMatch[2].trim(); }
      const existing = Array.from(document.querySelectorAll('#skillsBody .sk-name')).find(el=>el.value.trim().toLowerCase()===name.toLowerCase());
      if(existing){
        const tr = existing.closest('tr');
        const rankEl = tr.querySelector('.sk-rank');
        const schoolCheckbox = tr.querySelector('.sk-school');
        const priorRank = parseInt(rankEl.value||'0',10);
        const priorFree = parseInt(rankEl.dataset.free||'0',10);
        const priorSchoolChecked = schoolCheckbox.checked;
        rankEl.value = Math.max(priorRank, rank);
        // The School granting (or re-granting, on reapply) a Rank in this skill makes that
        // whole Rank free — same as a brand-new row via makeSkillRow below — regardless of
        // whether the row already existed before Apply School touched it.
        rankEl.dataset.free = String(Math.max(priorFree, rank));
        schoolCheckbox.checked = true;
        let addedEmph = null;
        if(emph){
          const already = getEmphValues(tr).some(v=>v.toLowerCase()===emph.toLowerCase());
          if(!already){ addEmphasisItem(tr, emph, true); addedEmph = emph; }
        }
        skillGrants.push({ name, createdRow:false, priorRank, priorFree, priorSchoolChecked, addedEmph });
      } else {
        const lib = findSkill(name);
        document.getElementById('skillsBody').appendChild(makeSkillRow({name, trait: lib?lib.trait:'', rank, emph, freeEmph: emph, school:true}));
        addedSkills++;
        skillGrants.push({ name, createdRow:true });
      }
    });
    // Outfit -> Equipment table. Tagged schoolGranted:sc.name so revertSchoolApplied() can
    // remove exactly these rows (and only these) the next time a different School is applied —
    // see makeEquipRow and revertSchoolApplied above.
    let addedItems = 0;
    sc.outfit.split(',').forEach(raw=>{
      const item = raw.trim();
      if(!item) return;
      document.getElementById('equipBody').appendChild(makeEquipRow({name:item, qty:1, notes:'Starting outfit', schoolGranted: sc.name}));
      addedItems++;
    });
    if(chosenSpecialisation){ document.getElementById('f_monkSpecialisation').value = chosenSpecialisation; }
    if(chosenAffinity){ document.getElementById('f_schoolAffinity').value = chosenAffinity; }
    if(chosenDeficiency){ document.getElementById('f_schoolDeficiencyElement').value = chosenDeficiency; }
    saveSchoolApplied({ school: sc.name, trait: sc.benefit, amount: 1, skillGrants, affinity: chosenAffinity, deficiencyElement: chosenDeficiency, monk: monkRec });
    recalcAll();
    const benefitMsg = sc.benefit ? `+1 ${sc.benefit} (free), ` : '';
    const affinityMsg = chosenAffinity ? `Affinity ${chosenAffinity}, ` : '';
    const deficiencyMsg = chosenDeficiency ? `Deficiency ${chosenDeficiency}, ` : '';
    const monkMsg = monkRec ? 'Void 3, Glory 1, Status 0 (Glory gain is halved from here \u2014 the sheet does not track that for you), ' : '';
    const specMsg = chosenSpecialisation ? `specialising in ${chosenSpecialisation}, ` : '';
    const honorMsg = (honorToSet === null || honorToSet === undefined)
      ? 'Honor not printed in this School\u2019s source (left unchanged)'
      : ((chosenHonor !== null) ? `Honor ${honorToSet} (your choice)` : `Honor ${honorToSet}`);
    setStatus(`Applied ${sc.name}: ${affinityMsg}${deficiencyMsg}${benefitMsg}${monkMsg}${specMsg}${honorMsg}, ${addedSkills} skills added${skippedChoices?` (${skippedChoices} "choose one" left for you)`:''}, ${addedItems} outfit items added.`);
  });

  // ---------- Multiple Schools UI wiring ----------
  document.getElementById('btnAddSchoolToggle').addEventListener('click', ()=>{
    const sel = document.getElementById('addSchoolSelect');
    sel.style.display = sel.style.display==='none' ? 'block' : 'none';
  });
  document.getElementById('addSchoolSelect').addEventListener('change', (e)=>{
    const sel = e.target;
    if(!sel.value) return;
    addSchoolToCharacter(sel.value);
    sel.value = '';
    sel.style.display = 'none';
  });

  let currentId = null; // storage id of loaded character
  let statusTimer = null;

  function setStatus(msg){
    const el = document.getElementById('statusMsg');
    el.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(()=>{ el.textContent=''; }, 3500);
  }
  function stampSeal(){
    const s = document.getElementById('seal');
    s.classList.add('stamped');
    setTimeout(()=>s.classList.remove('stamped'), 700);
  }

  // ---------- Build Rings UI ----------
  const ringsWrap = document.getElementById('ringsWrap');
  RINGS.forEach(r=>{
    const card = document.createElement('div');
    card.className='ring-card';
    card.dataset.ringKey = r.key;
    card.innerHTML = `
      <div class="ring-top">
        ${RING_ICON_IMG[r.key] ? `<img class="ring-icon-img" src="${RING_ICON_IMG[r.key]}" alt="${r.name} symbol">` : ''}
        <div class="ring-name" data-ring-key="${r.key}" data-ring-name="${r.name}" title="Click to make a ${r.name} Ring Roll (rank kept rank, Ten Dice Rule applies, 10s explode)">${r.name}</div>
        <div class="ring-val">
          <input type="number" id="ring_${r.key}" value="2" readonly style="background:#efe9d8;">
        </div>
      </div>
      ${r.traits.map(t=>`
        <div class="trait-row">
          <label for="trait_${t.key}" data-trait-key="${t.key}" data-trait-name="${t.name}" title="Click to make a ${t.name} Trait Roll (rank kept rank, Ten Dice Rule applies, 10s explode)">${t.name}</label>
          <input type="number" id="trait_${t.key}" min="1" max="10" value="2" data-free="2">
        </div>`).join('')}
      <div class="void-note">Ring = lower of its two traits (auto)</div>
    `;
    ringsWrap.appendChild(card);
  });
  // Void card
  const voidCard = document.createElement('div');
  voidCard.className='ring-card';
  voidCard.dataset.ringKey = 'void';
  voidCard.innerHTML = `
    <div class="ring-name" data-ring-key="void" data-ring-name="Void" title="Click to make a Void Ring Roll (rank kept rank, Ten Dice Rule applies, 10s explode)">Void</div>
    <div class="ring-val">
      <button type="button" class="stepbtn" data-step="-1" data-ring="void">−</button>
      <input type="number" id="ring_void" min="1" max="10" value="2" data-free="2">
      <button type="button" class="stepbtn" data-step="1" data-ring="void">+</button>
    </div>
    <div class="void-pts-block">
      <div class="void-pts-row">
        <label for="void_current" style="margin-bottom:0;">Void Points (current)</label>
        <button type="button" class="void-eye-btn" id="voidInfoBtn" title="What can Void Points be spent on?">&#128065;</button>
      </div>
      <input type="number" id="void_current" min="0" value="2" style="display:none;">
      <div class="void-pips" id="voidPips"></div>
    </div>
    <div class="void-note">Click a filled circle to spend a Void Point. Click (or right-click) a blank circle to get it back.</div>
  `;
  ringsWrap.appendChild(voidCard);

  // ---------- Build Spell Slots UI ----------
  // Same structural basis as the Void Points tracker above: one row per element, a row of
  // pips, and a hidden input tracking state for save/load. The *count* of pips is always
  // derived live from the matching Ring's rank (renderSpellPips) — never stored — so it can
  // never drift out of sync.
  //
  // Fill semantics here are the opposite of the Void Points tracker on purpose: a Spell Slot
  // pip starts BLANK (available) and gets FILLED when a slot is used — either automatically
  // by casting a spell from the Techniques/Kata/Spells list (see castSpell() below) or
  // manually by clicking the pip directly (for spells cast outside that list, or to correct
  // a mistake). Clicking a filled pip restores it to available, e.g. after a night's rest.
  //
  // Bonus slots (Void Ring Rank, usable on any element) draw from a single SHARED pool for
  // availability — one hidden input (#spell_bonus_used_shared) tracks total bonus slots used
  // across every element combined, and no element may spend one once that total reaches Void
  // Rank. But which pip strip SHOWS a slot as used is per-element: each row also has its own
  // #spell_bonus_used_visual_<key> counter, so casting a bonus-slot spell with Earth only
  // fills Earth's bonus strip — Fire's strip is untouched unless Fire itself spends one. See
  // renderSpellBonusPips(key).
  const spellSlotsWrap = document.getElementById('spellSlotsWrap');
  SPELL_ELEMENTS.forEach(el=>{
    const row = document.createElement('div');
    row.className = 'spell-slot-row';
    row.dataset.element = el.key;
    row.innerHTML = `
      ${SPELL_ICON_COLORIZE
        ? `<div class="spell-icon-img" role="img" aria-label="${el.name} symbol"
             style="--pip-color:var(${el.colorVar}); -webkit-mask-image:url('${SPELL_ICON_IMG[el.key]}'); mask-image:url('${SPELL_ICON_IMG[el.key]}');"></div>`
        : `<img class="spell-icon-img spell-icon-img--plain" src="${SPELL_ICON_IMG[el.key]}" alt="${el.name} symbol">`}
      <div class="spell-name">${el.name}</div>
      <div class="spell-pips-row">
        <div class="spell-pips" id="spellPips_${el.key}"></div>
        <div class="spell-bonus-pips" id="spellBonusPips_${el.key}"></div>
      </div>
      <input type="number" id="spell_used_${el.key}" min="0" value="0" style="display:none;">
      <input type="number" id="spell_bonus_used_visual_${el.key}" min="0" value="0" style="display:none;">
    `;
    spellSlotsWrap.appendChild(row);
  });
  // The one shared bonus-slot counter every element's bonus-pip strip reads from and writes
  // to — see the comment above. Lives outside any one row since it isn't per-element data.
  spellSlotsWrap.insertAdjacentHTML('beforeend', `<input type="number" id="spell_bonus_used_shared" min="0" value="0" style="display:none;">`);
  // Single click toggles a pip: blank (available) -> filled (used), filled -> blank. Both the
  // automatic castSpell() flow and this manual click land on the same hidden inputs, so the
  // two stay perfectly in sync with each other.
  spellSlotsWrap.addEventListener('click', e=>{
    const bonusPip = e.target.closest('.spell-bonus-pip');
    if(bonusPip){
      // BUGFIX SPELLSLOT BEGIN bonus-pip-tap
      // A hand-tapped bonus pip goes through the same shared-pool check casting makes. Guarded, so
      // without that fragment the original handler below runs exactly as before.
      if(typeof ssaBonusPipTap === 'function' && ssaBonusPipTap(bonusPip)) return;
      // END SPELLSLOT bonus-pip-tap
      // Shared pool gates whether a NEW bonus slot can be spent at all, but which row's pip
      // strip shows it filled is per-element — see spell_bonus_used_visual_<key> below.
      const key = bonusPip.closest('.spell-slot-row').dataset.element;
      const sharedHidden = document.getElementById('spell_bonus_used_shared');
      const visualHidden = document.getElementById('spell_bonus_used_visual_'+key);
      let shared = parseInt(sharedHidden.value||'0',10);
      let visual = parseInt(visualHidden.value||'0',10);
      if(bonusPip.classList.contains('filled')){
        // Un-spend: only this element's fill count and the shared pool shrink.
        sharedHidden.value = Math.max(0, shared - 1);
        visualHidden.value = Math.max(0, visual - 1);
      } else {
        // Spend: shared pool tracks total usage across every element, visual tracks this
        // element's own pip fill. renderSpellBonusPips() re-clamps both against rank/shared
        // availability, so no separate bounds check is needed here.
        sharedHidden.value = shared + 1;
        visualHidden.value = visual + 1;
      }
      renderSpellBonusPips();
      return;
    }
    const pip = e.target.closest('.spell-pip');
    if(!pip) return;
    const key = pip.closest('.spell-slot-row').dataset.element;
    const hidden = document.getElementById('spell_used_'+key);
    let used = parseInt(hidden.value||'0',10);
    used += pip.classList.contains('filled') ? -1 : 1;
    hidden.value = Math.max(0, used);
    renderSpellPips(key);
  });

  ringsWrap.addEventListener('click', e=>{
    const stepBtn = e.target.closest('.stepbtn');
    if(stepBtn){
      const input = document.getElementById('ring_'+stepBtn.dataset.ring);
      let v = parseInt(input.value||'0',10) + parseInt(stepBtn.dataset.step,10);
      v = Math.max(1, Math.min(10, v));
      input.value = v;
      recalcAll();
      return;
    }
    const nameBtn = e.target.closest('.ring-name');
    if(nameBtn){
      const key = nameBtn.dataset.ringKey;
      const ringName = nameBtn.dataset.ringName;
      const rank = parseInt(document.getElementById('ring_'+key).value||'0',10);
      // Ring Roll: roll and keep dice both equal to the Ring's Rank (XkX),
      // going through the same rollDicePool()/showRollResult() pipeline as every
      // other roll on the sheet, so the Ten Dice Rule and exploding 10s apply.
      // PART C FEATURE 3 - routed through P2 so wound penalties reach Ring rolls.
      // PART G PHASE 4 - the Rank is declared on the context so the breakdown can name what
      // made the pool. Inert data: no contributor reads it.
      rollWithModifiers(`${ringName} Ring Roll`,
        makeRollContext(ROLL_KINDS.RING, { ringName, ringValue:rank }), rank, rank);
      return;
    }
    const traitLabel = e.target.closest('.trait-row label');
    if(traitLabel){
      const key = traitLabel.dataset.traitKey;
      const traitName = traitLabel.dataset.traitName;
      const rank = parseInt(document.getElementById('trait_'+key).value||'0',10);
      // Trait Roll: same XkX pattern as a Ring Roll, using the Trait's own Rank.
      // PART C FEATURE 3 - routed through P2 so wound penalties reach Trait rolls.
      // PART G PHASE 4 - as above, the Rank travels with the roll for the breakdown.
      rollWithModifiers(`${traitName} Trait Roll`,
        makeRollContext(ROLL_KINDS.TRAIT, { traitName, traitValue:rank }), rank, rank);
      return;
    }
  });

  // auto-derive ring value from lower trait when traits change
  RINGS.forEach(r=>{
    r.traits.forEach(t=>{
      document.getElementById('trait_'+t.key).addEventListener('input', ()=>{
        const vals = r.traits.map(tt=>parseInt(document.getElementById('trait_'+tt.key).value||'0',10));
        document.getElementById('ring_'+r.key).value = Math.min(...vals);
        recalcAll();
      });
    });
  });
