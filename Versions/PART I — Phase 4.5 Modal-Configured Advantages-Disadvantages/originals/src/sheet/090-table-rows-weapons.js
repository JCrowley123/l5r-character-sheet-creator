  // ---------- Generic dynamic table row helpers ----------
  // ---- BUGFIX: reconstruct a School skill's FREE RANK for legacy saves -------------------
  // THE BUG. collectData() records `freeFloor` -- how much of a skill's Rank the School gave for
  // free -- but that field did not always exist. A save written before it was added records only
  // {rank, school:true}, and makeSkillRow's old fallback assumed the ENTIRE current Rank was
  // School-granted:
  //
  //     data.school ? Math.max(1, data.rank || 1) : 0
  //
  // So a School that granted Defense at Rank 2, bought up to Rank 3 with XP, reloaded as "all
  // three Ranks free": its cost silently became 0 xp and the character's XP total dropped.
  //
  // THE FIX. Do not guess from the current Rank. Reconstruct the free Rank from the School that
  // actually granted the skill, parsing the School's own skills string with the SAME rule Apply
  // School uses ("Defense 2" -> 2, "Kenjutsu (Katana)" -> 1, a bare name -> 1), and take the
  // highest grant across every School the character has. Falls back to 1 -- the standard "first
  // Rank free" School rule -- when the skill is not a named School skill (it filled an "any one
  // Skill" slot) or no School can be resolved. Never exceeds the skill's current Rank.
  //
  // This runs ONLY when `freeFloor` is absent. A save written by any build that records it keeps
  // its explicit value untouched, so nothing about current saves changes.
  function schoolGrantedRankForSkill(schoolName, skillName){
    if(!schoolName || !skillName) return 0;
    const entry = findAnySchoolLibraryEntry(String(schoolName).trim());
    if(!entry || !entry.skills) return 0;
    const target = String(skillName).trim().toLowerCase();
    let best = 0;
    entry.skills.split(',').forEach(raw=>{
      let token = raw.trim();
      if(!token || /^any /i.test(token)) return;          // "any one Skill" is a player choice
      let rank = 1;
      const rankMatch = token.match(/(\d+)\s*$/);
      if(rankMatch){ rank = parseInt(rankMatch[1],10); token = token.replace(/\s*\d+\s*$/,'').trim(); }
      const emphMatch = token.match(/^(.*?)\s*\(([^)]+)\)$/);
      const name = emphMatch ? emphMatch[1].trim() : token;
      if(name.toLowerCase() === target && rank > best) best = rank;
    });
    return best;
  }
  function inferSchoolFreeFloor(skillName, currentRank){
    const rank = Math.max(0, parseInt(currentRank,10) || 0);
    let best = 0;
    const seen = {};
    const consider = n => {
      const name = String(n||'').trim();
      if(!name || seen[name.toLowerCase()]) return;
      seen[name.toLowerCase()] = true;
      const granted = schoolGrantedRankForSkill(name, skillName);
      if(granted > best) best = granted;
    };
    // Every School the character has taken (Multiple Schools included), then the active one.
    try { (getSchoolsList()||[]).forEach(e=>consider(e && e.name)); } catch(e){ /* no list yet */ }
    const cur = document.getElementById('f_school');
    if(cur) consider(cur.value);
    const applied = document.getElementById('f_schoolApplied');
    if(applied) consider(applied.value);   // garbage resolves to null in findAnySchoolLibraryEntry
    if(best <= 0) best = 1;                // standard "first Rank free"
    return Math.min(best, rank);
  }
  function makeSkillRow(data){
    data = data || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="sk-name-row">
          <input type="text" class="sk-name" value="${escAttr(data.name||'')}" placeholder="Skill name">
          <button type="button" class="sk-info-btn" title="Skill Info">👁</button>
        </div>
        <div class="sk-mastery-note"></div>
      </td>
      <td class="col-narrow"><input type="text" class="sk-trait" value="${escAttr(data.trait||'')}" placeholder="Trait"></td>
      <td class="col-xnarrow"><input type="number" class="sk-rank" value="${data.rank??0}" min="0" inputmode="numeric" pattern="[0-9]*" data-free="${data.freeFloor !== undefined ? data.freeFloor : (data.school ? inferSchoolFreeFloor(data.name, data.rank) : 0)}"></td>
      <td>
        <div class="emph-container"></div>
        <button type="button" class="ghost emph-add-btn" title="Add Emphasis">+ Emph</button>
        <div class="emph-limit-note"></div>
      </td>
      <td class="col-check"><input type="checkbox" class="sk-school" ${data.school?'checked':''} title="First rank free (school skill)"></td>
      <td class="col-narrow sk-cost" style="text-align:right;color:var(--ink-soft);font-size:.78rem;"></td>
      <td class="col-xnarrow"><button type="button" class="dice-btn sk-roll" title="Roll Trait+Rank, keep Trait (Unskilled: roll and keep Trait)">🎲</button></td>
      <td class="col-xnarrow"><button type="button" class="rm-btn" title="Remove">✕</button></td>
    `;
    tr.querySelector('.sk-name').addEventListener('change', ()=>{
      const lib = findSkill(tr.querySelector('.sk-name').value);
      if(lib && !tr.querySelector('.sk-trait').value.trim()){
        tr.querySelector('.sk-trait').value = lib.trait;
      }
      refreshEmphWidgetsForSkill(tr);
      recalcAll();
    });
    tr.querySelector('.sk-roll').addEventListener('click', ()=>{
      const name = tr.querySelector('.sk-name').value.trim() || 'Skill';
      const traitName = tr.querySelector('.sk-trait').value.trim();
      const rank = parseInt(tr.querySelector('.sk-rank').value||'0',10);
      if(!traitName){ setStatus('Set a Trait for this skill before rolling.'); return; }
      rollSkill(name, traitName, rank);
    });
    tr.querySelector('.rm-btn').addEventListener('click', ()=>{ tr.remove(); recalcAll(); });
    tr.querySelector('.sk-info-btn').addEventListener('click', ()=>showSkillInfoModal(tr));

    tr.querySelector('.emph-add-btn').addEventListener('click', ()=>{
      const { usableSlots } = getUsableEmphSlots(tr);
      const count = tr.querySelectorAll('.emph-container .emph-item-row').length;
      if(usableSlots===0 || count>=usableSlots) return;
      addEmphasisItem(tr);
      recalcAll();
    });

    // Pre-populate any Emphases carried in the data (comma-separated, kept for save-file compatibility).
    // freeEmph lists which of those were granted free by Family/School (no XP cost).
    const freeEmphSet = new Set((data.freeEmph||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));
    (data.emph||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(e=>addEmphasisItem(tr, e, freeEmphSet.has(e.toLowerCase())));
    refreshEmphWidgetsForSkill(tr);
    return tr;
  }
  // Emphases per Skill Rank: 1 at Rank 1, 2 at Rank 3, 3 at Rank 5, 4 at Rank 7, 5 at Rank 9. 2 XP each.
  // The actual usable count is also hard-capped by how many Emphases the skill actually has.
  function maxEmphasesForRank(rank){
    if(rank>=9) return 5;
    if(rank>=7) return 4;
    if(rank>=5) return 3;
    if(rank>=3) return 2;
    if(rank>=1) return 1;
    return 0;
  }
  function relevantEmphOptions(lib){
    if(!lib || !lib.emph) return [];
    const t = lib.emph.trim();
    if(/^varies/i.test(t) || /^by /i.test(t) || t==='—' || /^none$/i.test(t)) return [];
    return t.split(',').map(s=>s.trim()).filter(Boolean);
  }
  // Usable slots = min(rank-based slots, total Emphases that exist for this skill). "Varies by
  // sub-skill" skills (free-text, no fixed list) have no hard ceiling — only rank limits them.
  function getUsableEmphSlots(tr){
    const rank = parseInt(tr.querySelector('.sk-rank').value||'0',10);
    const rankSlots = maxEmphasesForRank(rank);
    const lib = findSkill(tr.querySelector('.sk-name').value);
    const options = relevantEmphOptions(lib);
    const totalAvailable = options.length>0 ? options.length : Infinity;
    const usableSlots = Math.min(rankSlots, totalAvailable);
    return { rank, rankSlots, totalAvailable, usableSlots };
  }
  // Values already assigned to OTHER rows of this same skill (so a chosen Emphasis disappears
  // from every other row's dropdown, and reappears the moment it's removed or changed).
  function usedEmphValuesExcluding(rows, excludeRow){
    return new Set(
      rows.filter(r=>r!==excludeRow)
        .map(r=>{ const w=r.querySelector('.sk-emph-select, .sk-emph-text'); return w?w.value.trim().toLowerCase():''; })
        .filter(Boolean)
    );
  }
  // One row per Emphasis: a <select> when the skill has a known list, else a free-text box
  // (Craft, Lore, Artisan, etc. "vary by sub-skill" so there's no fixed list to offer).
  function buildEmphItemHTML(options, selectedEmph, isFree){
    const freeBadge = isFree ? `<span class="emph-free-badge" title="Granted free by Family/School — no XP cost">Free</span>` : '';
    if(options.length){
      const extra = selectedEmph && !options.some(o=>o.toLowerCase()===selectedEmph.toLowerCase()) ? [selectedEmph] : [];
      const allOpts = [...options, ...extra];
      return `
        <select class="sk-emph-select">
          ${allOpts.map(o=>`<option value="${escAttr(o)}" ${o.toLowerCase()===(selectedEmph||'').toLowerCase()?'selected':''}>${escAttr(o)}</option>`).join('')}
        </select>
        ${freeBadge}
        <button type="button" class="rm-btn emph-item-del" title="Remove Emphasis">✕</button>
      `;
    }
    return `
      <input type="text" class="sk-emph-text" value="${escAttr(selectedEmph||'')}" placeholder="Emphasis name">
      ${freeBadge}
      <button type="button" class="rm-btn emph-item-del" title="Remove Emphasis">✕</button>
    `;
  }
  function addEmphasisItem(tr, selectedEmph, isFree){
    const container = tr.querySelector('.emph-container');
    const lib = findSkill(tr.querySelector('.sk-name').value);
    const allOptions = relevantEmphOptions(lib);
    const existingRows = Array.from(container.querySelectorAll('.emph-item-row'));
    const used = usedEmphValuesExcluding(existingRows, null);
    const available = allOptions.filter(o=>!used.has(o.toLowerCase()));
    const row = document.createElement('div');
    row.className = 'emph-item-row' + (isFree ? ' free' : '');
    row.dataset.free = isFree ? '1' : '0';
    row.innerHTML = buildEmphItemHTML(available, selectedEmph, isFree);
    container.appendChild(row);
    row.querySelector('.emph-item-del').addEventListener('click', ()=>{ row.remove(); recalcAll(); });
  }
  // Rebuilds every Emphasis row for this skill: each row's dropdown only offers Emphases not
  // already picked by its siblings (so removing/changing one immediately frees it up elsewhere),
  // and the skill name change is what re-derives the option list itself.
  function refreshEmphWidgetsForSkill(tr){
    const lib = findSkill(tr.querySelector('.sk-name').value);
    const allOptions = relevantEmphOptions(lib);
    const rows = Array.from(tr.querySelectorAll('.emph-container .emph-item-row'));
    rows.forEach(row=>{
      const oldWidget = row.querySelector('.sk-emph-select, .sk-emph-text');
      const curVal = oldWidget ? oldWidget.value.trim() : '';
      const isFree = row.dataset.free==='1';
      const used = usedEmphValuesExcluding(rows, row);
      const available = allOptions.filter(o=>!used.has(o.toLowerCase()));
      row.innerHTML = buildEmphItemHTML(available, curVal, isFree);
      row.querySelector('.emph-item-del').addEventListener('click', ()=>{ row.remove(); recalcAll(); });
    });
    renderEmphCapUI(tr);
  }
  function getEmphValues(tr){
    return Array.from(tr.querySelectorAll('.emph-container .sk-emph-select, .emph-container .sk-emph-text'))
      .map(el=>el.value.trim()).filter(Boolean);
  }
  // Only Emphases NOT granted free by Family/School cost XP.
  function getPaidEmphCount(tr){
    return Array.from(tr.querySelectorAll('.emph-container .emph-item-row'))
      .filter(row=>row.dataset.free!=='1')
      .map(row=>row.querySelector('.sk-emph-select, .sk-emph-text'))
      .filter(w=>w && w.value.trim()).length;
  }
  function renderEmphCapUI(tr){
    const { rank, rankSlots, totalAvailable, usableSlots } = getUsableEmphSlots(tr);
    const count = tr.querySelectorAll('.emph-container .emph-item-row').length;
    const atCap = usableSlots>0 && count>=usableSlots;
    // The pool of Emphases is the true ceiling once it's <= what the current rank would allow —
    // meaning no future rank increase will ever unlock another slot for this skill.
    const cappedByAvailability = isFinite(totalAvailable) && totalAvailable <= rankSlots;
    const addBtn = tr.querySelector('.emph-add-btn');
    addBtn.disabled = atCap || usableSlots===0;

    const note = tr.querySelector('.emph-limit-note');
    if(usableSlots===0){
      note.textContent = 'Rank 1+ required to purchase an Emphasis.';
      addBtn.title = 'Reach Rank 1 in this skill to purchase an Emphasis.';
    } else {
      const suffix = cappedByAvailability ? ' – no more to be unlocked' : '';
      if(atCap && cappedByAvailability){
        note.innerHTML = `${count} / ${usableSlots} emphases at rank ${rank}${suffix}<br><strong style="color:var(--shu-dark);">Max Emphases assigned</strong>`;
        addBtn.title = 'Max Emphases assigned';
      } else {
        note.textContent = `${count} / ${usableSlots} emphases at rank ${rank}${suffix}`;
        if(atCap){
          // Rank-limited (not availability-limited): more Emphases exist, just not unlocked yet.
          const nextUnlockRank = {0:1,1:3,2:5,3:7,4:9}[rankSlots];
          addBtn.title = nextUnlockRank!==undefined ? `Rank ${nextUnlockRank}+ required for another Emphasis in this skill.` : '';
        } else {
          addBtn.title = '';
        }
      }
    }
    note.style.color = count>usableSlots ? 'var(--shu)' : 'var(--ink-soft)';
  }
  function renderSkillMasteryNote(tr){
    const lib = findSkill(tr.querySelector('.sk-name').value);
    const noteEl = tr.querySelector('.sk-mastery-note');
    if(!lib || !noteEl) { if(noteEl) noteEl.innerHTML=''; return; }
    const rank = parseInt(tr.querySelector('.sk-rank').value||'0',10);
    const tiers = [3,5,7].filter(t=>lib.m[t]);
    if(tiers.length===0){ noteEl.innerHTML=''; return; }
    noteEl.innerHTML = tiers.map(t=>{
      const reached = rank>=t;
      return `<span style="display:block;${reached?'color:var(--shu-dark);font-weight:600;':'color:#a89f8c;'}">R${t}${reached?' ✓':''}: ${escHtml(lib.m[t])}</span>`;
    }).join('');
  }
  // ================= PART B: CORE WEAPONS SYSTEM — row factory =================
  // Mirrors makeSkillRow(): a name input that auto-fills the rest of the row from the library
  // on change, a note line under the name showing what the link resolved to, and roll buttons
  // that hand off to the orchestration wrappers. Structured state lives in hidden inputs
  // (.wp-key, .wp-skill-name, .wp-dmg-roll, .wp-dmg-keep, .wp-keywords) per DOM-as-model; the
  // visible Attack/Damage/Size/Notes boxes stay free text so nothing about a legacy row breaks.
  //
  // MIGRATION CONTRACT for pre-Part-B saves (no `key` field on the saved object):
  //   * If the row's name matches a library weapon, the row adopts the link (so it gains the
  //     Skill column, Size, and the note line) — but any Attack/Damage text it already had is
  //     preserved AND that box is flagged manual, so the row still rolls exactly the numbers it
  //     rolled before. No existing character's dice change on load.
  //   * A legacy row with an EMPTY Attack/Damage box links fully and starts computing, since
  //     there is no prior behaviour to preserve.
  //   * A row whose name matches nothing stays a plain free-text row, exactly as before.
  // Clearing a manual box (or re-picking the weapon from the dropdown) re-adopts the computed
  // value — that's the opt-in path from a legacy row to a fully linked one.
  function makeWeaponRow(data){
    data = data || {};
    const tr = document.createElement('tr');
    const isLegacy = (data.key === undefined);
    const lib = isLegacy ? findWeapon(data.name) : findWeapon(data.key);
    const key = isLegacy ? (lib ? lib.name : '') : (data.key || '');
    const rollText = data.roll || '';
    const dmgText = data.dmg || '';
    // Explicit saved flags win; otherwise a legacy row's already-populated boxes become manual.
    const manualAttack = data.manualAttack !== undefined
      ? (data.manualAttack === true || data.manualAttack === 'true')
      : (isLegacy && !!rollText.trim() && !!lib);
    const manualDamage = data.manualDamage !== undefined
      ? (data.manualDamage === true || data.manualDamage === 'true')
      : (isLegacy && !!dmgText.trim() && !!lib);
    tr.dataset.manualAttack = manualAttack ? '1' : '0';
    tr.dataset.manualDamage = manualDamage ? '1' : '0';
    tr.innerHTML = `
      <td>
        <div class="wp-name-row">
          <input type="text" class="wp-name" list="weaponNameList" value="${escAttr(data.name||'')}" placeholder="Weapon name">
          <button type="button" class="wp-info-btn" title="Weapon Info">👁</button>
        </div>
        <!-- PART C FEATURE 7 - wp_hand. A visible control rather than a hidden field: RAW
             says handedness "is determined by the player", so it is the player's to set. Kept
             out of the table's columns so the printed sheet is unchanged, and hidden entirely
             until a second weapon row exists (updateHandSelector). -->
        <div class="wp-hand-row">
          <label>Hand</label>
          <select class="wp-hand">
            <option value="main">Main-hand</option>
            <option value="off">Off-hand</option>
          </select>
        </div>
        <div class="wp-link-note"></div>
        <input type="hidden" class="wp-key" value="${escAttr(key)}">
        <input type="hidden" class="wp-dmg-roll" value="${escAttr(data.dmgRoll??'')}">
        <input type="hidden" class="wp-dmg-keep" value="${escAttr(data.dmgKeep??'')}">
        <input type="hidden" class="wp-keywords" value="${escAttr(data.keywords||'')}">
        <!-- PART C FEATURE 6 - wp_arrowType: which arrow this bow is loaded with. Hidden rather
             than a visible control because the ammunition popup is where it gets chosen. -->
        <input type="hidden" class="wp-arrow-type" value="${escAttr(data.arrowType||'')}">
      </td>
      <td class="col-narrow"><input type="text" class="wp-skill" value="${escAttr(data.skill || (lib?lib.skill:''))}" placeholder="Skill"></td>
      <td class="col-narrow"><div class="roll-cell"><input type="text" class="wp-roll" value="${escAttr(rollText)}" placeholder="auto" style="width:52px;"><button type="button" class="dice-btn wp-roll-btn" title="Roll attack">🎲</button></div></td>
      <td class="col-narrow"><div class="roll-cell"><input type="text" class="wp-dmg" value="${escAttr(dmgText)}" placeholder="auto" style="width:52px;"><button type="button" class="dice-btn wp-dmg-btn" title="Roll damage">🎲</button></div></td>
      <td class="col-xnarrow"><input type="text" class="wp-size" value="${escAttr(data.size || (lib?lib.size:''))}"></td>
      <td><input type="text" class="wp-notes" value="${escAttr(data.notes || (lib&&isLegacy?'' : (data.notes||'')))}"></td>
      <td class="col-xnarrow"><button type="button" class="rm-btn" title="Remove">✕</button></td>
    `;
    // Name change re-runs the library link, exactly like makeSkillRow's .sk-name handler.
    tr.querySelector('.wp-name').addEventListener('change', ()=>{
      applyWeaponLibraryLink(tr, tr.querySelector('.wp-name').value);
      refreshWeaponRow(tr);
    });
    // Typing into Attack/Damage flags that box manual; emptying it hands control back to the
    // computed value. This is the only thing that sets the manual flags after load.
    tr.querySelector('.wp-roll').addEventListener('input', ()=>{
      tr.dataset.manualAttack = tr.querySelector('.wp-roll').value.trim() ? '1' : '0';
      refreshWeaponRow(tr);
    });
    tr.querySelector('.wp-dmg').addEventListener('input', ()=>{
      tr.dataset.manualDamage = tr.querySelector('.wp-dmg').value.trim() ? '1' : '0';
      refreshWeaponRow(tr);
    });
    tr.querySelector('.wp-skill').addEventListener('change', ()=>refreshWeaponRow(tr));
    // PART C FEATURE 7 - handedness. normaliseHand keeps a pre-Feature-7 save (no `hand` key at
    // all) on the main-hand default, which is what makes an old character load as a
    // single-weapon character no matter how many weapons are listed.
    tr.querySelector('.wp-hand').value = normaliseHand(data.hand);
    tr.querySelector('.wp-hand').addEventListener('change', ()=>{
      refreshAllWeaponRows();
      recalcAll();
    });
    tr.querySelector('.wp-roll-btn').addEventListener('click', ()=>rollWeaponAttack(tr));
    tr.querySelector('.wp-dmg-btn').addEventListener('click', ()=>rollWeaponDamage(tr));
    tr.querySelector('.wp-info-btn').addEventListener('click', ()=>showWeaponInfoModal(tr));
    tr.querySelector('.rm-btn').addEventListener('click', ()=>{
      tr.remove();
      // PART C FEATURE 7 - dropping to one weapon must take the dual-wield UI, the penalties and
      // the Armor TN bonus away with it.
      refreshAllWeaponRows();
      recalcAll();
    });

    // A brand-new row created from the library (data.key set, nothing typed yet) gets its
    // Notes pre-filled from the entry; a legacy row keeps whatever Notes it saved.
    if(!isLegacy && lib && !(data.notes||'').trim() && lib.notes){
      tr.querySelector('.wp-notes').value = lib.notes;
    }
    refreshWeaponRow(tr);
    return tr;
  }
  // Writes the library link (key/skill/size/keywords/notes) onto a row for a given weapon name.
  // Only fills Size and Notes when they are blank or were themselves library-derived, so a
  // player's own edits are never clobbered — the same "don't overwrite what the user typed"
  // rule makeSkillRow uses when it auto-fills a Trait.
  function applyWeaponLibraryLink(tr, name){
    const lib = findWeapon(name);
    const keyEl = tr.querySelector('.wp-key');
    const skillEl = tr.querySelector('.wp-skill');
    const sizeEl = tr.querySelector('.wp-size');
    const notesEl = tr.querySelector('.wp-notes');
    const kwEl = tr.querySelector('.wp-keywords');
    if(!lib){
      keyEl.value = '';
      kwEl.value = '';
      return;
    }
    keyEl.value = lib.name;
    skillEl.value = lib.skill;
    sizeEl.value = lib.size;
    kwEl.value = (lib.keywords||[]).join(', ');
    if(!notesEl.value.trim() && lib.notes) notesEl.value = lib.notes;
  }
  // Recomputes everything derived on a weapon row: the Attack/Damage notation for linked,
  // non-manual boxes, the hidden structured damage dice, and the note line under the name.
  // Safe to call at any time and as often as needed — it only ever writes derived values.
  function refreshWeaponRow(tr){
    // PART C FEATURE 7 - before the unlinked-row early return below, so a custom weapon can be
    // declared off-hand too. (A custom row still rolls its free-text notation and takes no
    // automated penalty -- that is Part B's standing contract for unlinked rows, unchanged.)
    updateHandSelector(tr);
    const keyEl = tr.querySelector('.wp-key');
    const noteEl = tr.querySelector('.wp-link-note');
    const rollEl = tr.querySelector('.wp-roll');
    const dmgEl = tr.querySelector('.wp-dmg');
    const entry = keyEl ? findWeapon(keyEl.value) : null;
    const skillName = (tr.querySelector('.wp-skill').value||'').trim() || (entry ? entry.skill : '');
    const manualAttack = tr.dataset.manualAttack === '1';
    const manualDamage = tr.dataset.manualDamage === '1';

    if(!entry){
      tr.querySelector('.wp-dmg-roll').value = '';
      tr.querySelector('.wp-dmg-keep').value = '';
      if(noteEl){
        noteEl.innerHTML = (tr.querySelector('.wp-name').value||'').trim()
          ? `<span class="wp-note-custom">Custom weapon — rolls whatever you type in the Attack and Damage boxes.</span>`
          : '';
      }
      return;
    }
    const skillRank = getCharacterSkillRank(skillName);
    const atk = getWeaponAttackDice(skillName);
    // PART C FEATURE 6 - the row previews the arrow it is loaded with, so the Damage box always
    // reads what the damage button will actually roll. With no arrow selected this resolves to
    // the library default and the box is byte-identical to Feature 4.
    const dmg = getWeaponDamageDice(entry, skillRank, { arrow: getRowArrowType(tr) });
    tr.querySelector('.wp-dmg-roll').value = dmg.numDice;
    tr.querySelector('.wp-dmg-keep').value = dmg.keepDice;
    if(!manualAttack) rollEl.value = atk.numDice > 0 ? atk.notation : '';
    if(!manualDamage) dmgEl.value = dmg.numDice > 0 ? dmg.notation : '';
    rollEl.classList.toggle('wp-manual', manualAttack);
    dmgEl.classList.toggle('wp-manual', manualDamage);

    if(noteEl){
      const bits = [];
      bits.push(`<span class="wp-note-link">${escHtml(entry.skill)} ${atk.unskilled ? '— Unskilled' : `Rank ${skillRank}`} · ${escHtml(atk.traitName||'—')} ${atk.traitValue}</span>`);
      const kw = [entry.size].concat(entry.keywords||[]).filter(Boolean);
      if(kw.length) bits.push(`<span class="wp-note-kw">${escHtml(kw.join(' · '))}</span>`);
      // PART C FEATURE 7 - handedness, the penalty it carries, and what waives it. Returns
      // nothing at all unless the character is actually holding two weapons.
      handednessNoteBits(tr, entry, skillName, skillRank).forEach(b=>bits.push(b));
      // PART C FEATURE 6 - only once ammo tracking is active for this row, so a bow belonging to
      // a character who has never bought arrows keeps exactly the note line it had before.
      if(weaponUsesAmmo(entry) && ammoTrackingActive(tr)){
        const nocked = getRowArrowType(tr);
        // With an arrow nocked the count is that TYPE's; with none nocked it is everything the
        // character is carrying, because "0 in quiver" beside a full quiver would be a lie.
        const left = nocked ? getArrowQuantity(nocked)
                            : ARROW_LIBRARY.reduce((n,a)=>n + getArrowQuantity(a.name), 0);
        bits.push(`<span class="wp-note-kw">Arrow: ${escHtml(nocked || 'none nocked')} · ${left} in quiver</span>`);
      }
      if(dmg.explodeOn) bits.push(`<span class="wp-note-mastery">Damage dice explode on ${dmg.explodeOn}+</span>`);
      if(dmg.reductionMod) bits.push(`<span class="wp-note-mastery">Target Reduction ${dmg.reductionMod<0?'−':'+'}${Math.abs(dmg.reductionMod)} (apply manually)</span>`);
      if(dmg.source === 'legacy-fallback') bits.push(`<span class="wp-note-warn">Mastery data mismatch — using free-text values</span>`);
      if(manualAttack || manualDamage){
        const which = manualAttack && manualDamage ? 'Attack and Damage are' : (manualAttack ? 'Attack is' : 'Damage is');
        bits.push(`<span class="wp-note-manual">${which} manual — clear the box to use the computed roll</span>`);
      }
      noteEl.innerHTML = bits.join('<br>');
    }
  }
  function refreshAllWeaponRows(){
    document.querySelectorAll('#weaponsBody tr').forEach(tr=>{
      if(tr.querySelector('.wp-key')) refreshWeaponRow(tr);
    });
  }
  // Read-only detail popup for a weapon row, mirroring showSkillInfoModal()'s role for skills:
  // it explains where every number in the row came from, using the same pure functions the
  // roll buttons use, so what the player reads is exactly what the dice will do.
  function showWeaponInfoModal(tr){
    const keyEl = tr.querySelector('.wp-key');
    const entry = keyEl ? findWeapon(keyEl.value) : null;
    const name = (tr.querySelector('.wp-name').value||'').trim() || 'Weapon';
    // appAlert() writes with textContent into a `white-space:pre-line` box, so this is plain
    // text with real newlines — no markup (the same convention renderAppliedSchoolAffinity()
    // uses for its Affinity/Deficiency pop-ups).
    if(!entry){
      appAlert(`${name} isn't linked to the weapon library, so it has no reference entry.\n\nIts Attack and Damage boxes are rolled exactly as typed. Pick a weapon from "Add from Weapon List", or type its canonical name, to link it.`);
      return;
    }
    const skillName = (tr.querySelector('.wp-skill').value||'').trim() || entry.skill;
    const skillRank = getCharacterSkillRank(skillName);
    const atk = getWeaponAttackDice(skillName);
    // PART C FEATURE 6 - explain the row as it is actually loaded, not as an empty quiver.
    const dmg = getWeaponDamageDice(entry, skillRank, { arrow: getRowArrowType(tr) });
    const kw = [entry.size].concat(entry.keywords||[]).filter(Boolean).join(', ');
    const lines = [];
    lines.push(`${entry.name} — ${entry.skill}`);
    lines.push(`Printed DR ${entry.damage.roll}k${entry.damage.keep} · Keywords: ${kw}`);
    if(entry.range) lines.push(`Range: ${entry.range} ft`);
    // PART C FEATURE 7 - handedness, and what it costs, for a character holding two weapons.
    if(isDualWieldActive()){
      const hand = getRowHand(tr);
      const size = weaponSizeForRow(tr, entry);
      if(hand === 'off'){
        const p = getOffHandPenalty(entry, skillName, skillRank, size);
        lines.push(`Held in: off hand (${size || 'unsized'})`);
        lines.push(p.exempt
          ? `Off-hand penalty: none — waived by ${p.exemptSource}`
          : `Off-hand penalty: ${p.penalty} to the total of every attack roll`);
      } else {
        const m = getMainHandPenalty();
        lines.push('Held in: main hand');
        lines.push(m.exempt
          ? `Dual-wield penalty: none — waived by ${m.exemptSource}`
          : `Dual-wield penalty: ${m.penalty} to the total of every attack roll while a second weapon is held`);
      }
      lines.push(`Wielding two weapons: Armor TN +${getDualWieldArmorTNBonus()} (Insight Rank)`);
    }
    // PART C FEATURE 8 - School Automation. Shown to any Mirumoto Bushi of Rank 1 or better,
    // whether or not the daisho pairing is currently set, so an inactive waiver explains itself.
    if(typeof mirumotoInfoLines === 'function'){
      const mLines = mirumotoInfoLines();
      if(mLines.length) lines.push.apply(lines, mLines);
    }
    // PART C FEATURE 6 - ammunition, for the weapons that fire it.
    if(weaponUsesAmmo(entry)){
      const nocked = findArrow(getRowArrowType(tr) || DEFAULT_ARROW);
      if(nocked){
        lines.push(`Loaded with: ${nocked.name} — DR ${nocked.damage.roll}k${nocked.damage.keep}, ${nocked.cost} bu`);
        lines.push(`Arrow special rules: ${nocked.special}`);
        lines.push(`In your quiver: ${getArrowQuantity(nocked.name)}`);
      }
    }
    lines.push('');
    lines.push(`ATTACK ROLL — ${atk.notation}`);
    lines.push(atk.debugExplanation);
    lines.push('');
    lines.push(`DAMAGE ROLL — ${dmg.notation}`);
    dmg.breakdown.forEach(step=>lines.push('• '+step));
    if(dmg.source === 'legacy-fallback'){
      lines.push('');
      lines.push('Note: structured mastery data disagreed with the free-text mastery text for this Skill, so the free-text values were used instead.');
    }
    if(entry.notes){ lines.push(''); lines.push(entry.notes); }
    appAlert(lines.join('\n'));
  }
  // Quick-add dropdown, grouped by Weapon Skill — the direct counterpart of buildSkillQuickAdd().
  // Also fills the <datalist> that the name box autocompletes against.
  function buildWeaponQuickAdd(){
    const sel = document.getElementById('weaponQuickAdd');
    if(!sel) return;
    let html = '<option value="">— choose a weapon to add —</option>';
    const seen = new Set();
    const groups = WEAPON_SKILL_ORDER.concat(
      WEAPON_LIBRARY.map(w=>w.skill).filter(s=>!WEAPON_SKILL_ORDER.includes(s))
    );
    groups.forEach(skill=>{
      if(seen.has(skill)) return;
      seen.add(skill);
      const items = WEAPON_LIBRARY.filter(w=>w.skill===skill);
      if(!items.length) return;
      html += `<optgroup label="${escAttr(skill)}">`;
      items.forEach(w=>{
        const dr = w.ammo ? `Str ${w.bowStrength}, ${w.ammo}` : `${w.damage.roll}k${w.damage.keep}`;
        html += `<option value="${escAttr(w.name)}">${escAttr(w.name)} (${escAttr(dr)}, ${escAttr(w.size)})</option>`;
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
    const dl = document.getElementById('weaponNameList');
    if(dl) dl.innerHTML = WEAPON_LIBRARY.map(w=>`<option value="${escAttr(w.name)}"></option>`).join('');
    sel.addEventListener('change', ()=>{
      const lib = findWeapon(sel.value);
      if(lib){
        document.getElementById('weaponsBody').appendChild(makeWeaponRow({
          key: lib.name, name: lib.name, skill: lib.skill, size: lib.size,
          keywords: (lib.keywords||[]).join(', '), notes: lib.notes || '',
          roll:'', dmg:'', manualAttack:false, manualDamage:false,
        }));
        refreshAllWeaponRows();   // PART C FEATURE 7 - a second weapon reveals the Hand selector
        setStatus(`Added ${lib.name}.`);
      }
      sel.value = '';
    });
  }
  // ================= END PART B row factory =================
  function makeEquipRow(data){
    data = data || {};
    const tr = document.createElement('tr');
    // Tags a row as part of a School's starting outfit, so revertSchoolApplied() can remove
    // exactly (and only) the previously-applied School's items on the next Apply — the same
    // "replace, don't stack" principle as the Trait/Skill/Technique grants above, applied to
    // Equipment. Untagged rows (manually added, or from Family/other sources) are never touched.
    if(data.schoolGranted) tr.dataset.schoolGranted = data.schoolGranted;
    tr.innerHTML = `
      <td>
        <div class="eq-name-row">
          <span class="eq-arrow-icon" aria-hidden="true"></span>
          <input type="text" class="eq-name" value="${escAttr(data.name||'')}">
        </div>
      </td>
      <td class="col-xnarrow"><input type="number" class="eq-qty" value="${data.qty??1}" min="0"></td>
      <td><input type="text" class="eq-notes" value="${escAttr(data.notes||'')}"></td>
      <td class="col-xnarrow"><button type="button" class="rm-btn">✕</button></td>
    `;
    // Spell-scroll removal gating: if this row's Item name is a spell scroll ("Spell Scroll —
    // {spell}") AND that spell is currently in the Spell/Kata list (techList) with a Cast
    // button (i.e. it was actually added, not just visible-but-locked), removing the row would
    // strand that spell without its required scroll — so warn first, once per affected spell
    // entry, and only actually remove anything (scroll row AND the dependent spell entries) if
    // every warning is Confirmed. Cancelling any one of them aborts the whole removal: the
    // scroll stays equipped, every dependent spell stays in the list, nothing else happens.
    // A row that isn't a recognized scroll (spellNameFromScrollLabel returns null) or that
    // has no dependent spell skips straight to a normal removal — no popup, no behavior change.
    // Memorisation overrides scroll dependency entirely: a memorised spell is excluded from
    // dependentEntries below, so it never gets a warning pop-up and is never removed — the
    // scroll row itself is still removed normally, exactly as if nothing depended on it.
    tr.querySelector('.rm-btn').addEventListener('click', async ()=>{
      const spellName = spellNameFromScrollLabel(tr.querySelector('.eq-name').value);
      if(spellName){
        const dependentEntries = Array.from(document.querySelectorAll('#techList .entry')).filter(entry=>
          entry.dataset.spellElement && entry.dataset.isMemorised !== 'true' &&
          (entry.querySelector('.en-name').value||'').trim().toLowerCase()===spellName.toLowerCase()
        );
        for(const entry of dependentEntries){
          const spellDisplayName = (entry.querySelector('.en-name').value||'').trim() || spellName;
          const proceed = await appConfirm(`Removing this spell scroll will remove your ability to cast ${spellDisplayName}. Continue?`, 'Confirm', 'ghost', 'Cancel');
          if(!proceed) return; // Cancel — scroll remains equipped, spell remains, no further action
        }
        dependentEntries.forEach(entry=>entry.remove());
      }
      tr.remove();
      recalcAll(); // re-locks (or unlocks) every visible spell in techQuickAdd against the new Equipment state
    });
    // PART C FEATURE 6 - an arrow row carries its icon and its DR/cost/special tooltip, kept in
    // step as the Item name is edited, so renaming a row into or out of arrow-hood is immediate.
    // An arrow row whose quantity is COMMITTED at 0 removes itself (spec 5.1.C). That is bound
    // to `change`, not `input`, so typing the "1" of "10" over a "0" never deletes the row
    // mid-keystroke, and it is scoped to arrow rows so an ordinary item may sit at 0 in peace.
    tr.querySelector('.eq-name').addEventListener('input', ()=>refreshEquipRow(tr));
    tr.querySelector('.eq-qty').addEventListener('change', ()=>{
      if(!arrowFromEquipLabel(tr.querySelector('.eq-name').value)) return;
      if((parseInt(tr.querySelector('.eq-qty').value || '0', 10) || 0) <= 0){
        tr.remove();
        recalcAll();
      }
    });
    refreshEquipRow(tr);
    return tr;
  }
  // Whether the Equipment table contains the scroll for a given spell — matches the exact
  // label the Spell Scrolls pop-up generates ("Spell Scroll — {name}"), case-insensitively,
  // against every row's Item name. Single source of truth for the gating below: the
  // Technique/Spell quick-add dropdown reads it forwards (does this spell have its scroll?)
  // and makeEquipRow's remove button reads its inverse, spellNameFromScrollLabel, to recognize
  // when a row being removed is a scroll at all.
  function hasSpellScroll(spellName){
    const target = `spell scroll — ${(spellName||'').trim().toLowerCase()}`;
    return Array.from(document.querySelectorAll('#equipBody .eq-name')).some(inp=>(inp.value||'').trim().toLowerCase()===target);
  }
  function spellNameFromScrollLabel(label){
    const m = /^spell scroll\s*[—–-]\s*(.+)$/i.exec((label||'').trim());
    return m ? m[1].trim() : null;
  }
  function makeEntry(data, withCost, costLabel){
    data = data || {};
    const div = document.createElement('div');
    div.className='entry';
    // spellElement (air/earth/fire/water/void, or 'universal' for Commune/Sense/Summon) is
    // only set on entries added from SPELL_LIBRARY for a real spell (not Kata, not a blank
    // custom entry) — see buildTechQuickAdd's 'spell' branch above. Its presence is what
    // turns an entry into a clickable "Cast" button wired to the Spell Slots tracker.
    // spellMastery is that spell's Mastery Level, carried alongside it so castSpell()'s
    // Casting Roll can compute TN = 5 + (5 × Mastery) at cast time without re-parsing it out
    // of the free-text description.
    if(data.spellElement) div.dataset.spellElement = data.spellElement;
    if(data.spellMastery !== undefined && data.spellMastery !== null && data.spellMastery !== '') div.dataset.spellMastery = data.spellMastery;
    // Maho spells route through castMahoSpell() instead of the normal castSpell()/
    // castUniversalSpell() pipeline (no spell slot consumed, no Mastery/Rank limitation, the
    // blood-source pop-up, Wounds, and Taint gain — see castMahoSpell() and the techList
    // click handler below) — carried the same add-time-captured way as spellElement/
    // spellMastery above so a renamed entry still casts using what it actually is.
    if(data.spellIsMaho) div.dataset.spellIsMaho = 'true';
    // Carried the same way as spellElement/spellMastery above — captured at add-time from
    // SPELL_LIBRARY rather than re-derived by name lookup at cast-time, so a renamed entry
    // (or one whose SPELL_LIBRARY data later changes) still casts using what it actually is.
    // Accepts either an array (fresh add from SPELL_LIBRARY) or the comma-joined string
    // collectData() saves it as (a reload/import round-trip) — normalized to an array either way.
    const spellKeywordsArr = Array.isArray(data.spellKeywords)
      ? data.spellKeywords
      : (typeof data.spellKeywords === 'string' && data.spellKeywords ? data.spellKeywords.split(',') : []);
    if(spellKeywordsArr.length) div.dataset.spellKeywords = spellKeywordsArr.join(',');
    const elMeta = data.spellElement ? SPELL_ELEMENTS.find(e=>e.key===data.spellElement) : null;
    const isUniversalSpell = data.spellElement === 'universal';
    const castTitle = data.spellIsMaho
      ? 'Cast this Maho spell — no spell slot used; asks whose blood fuels the ritual'
      : (elMeta
        ? `Cast this spell — uses a ${elMeta.name} spell slot`
        : 'Cast this spell — choose an Element to use its spell slot');
    // Spell Memorisation (see the #techList click handler below for the purchase logic).
    // isSpellEntry mirrors the spellMastery check above rather than reusing spellMastery
    // directly, so a falsy-but-defined Mastery of 0 (not used in SPELL_LIBRARY today, but
    // kept future-proof) still counts as a spell entry. Kata/custom entries have no
    // spellMastery at all and never get the tick box. Spells also skip the generic en-cost
    // "XP" field entirely (below) — a spell has no freeform cost of its own; only Memorising
    // it costs XP, tracked separately via memorisationXpCost/dataset.isMemorised.
    const isSpellEntry = data.spellMastery !== undefined && data.spellMastery !== null && data.spellMastery !== '';
    if(isSpellEntry){
      div.dataset.isMemorised = data.isMemorised ? 'true' : 'false';
      // Only carried once actually memorised — an un-memorised spell has no cost to persist.
      if(data.isMemorised && data.memorisationXpCost !== undefined && data.memorisationXpCost !== null && data.memorisationXpCost !== ''){
        div.dataset.memorisationXpCost = data.memorisationXpCost;
      }
    }
    const memoTitle = data.isMemorised
      ? 'Memorised — remains castable and ignores Spell Scroll requirements even while checked; untick to un-memorise and refund the XP'
      : `Memorise this spell — spends ${data.spellMastery} XP (its Mastery Rank) while checked`;
    div.innerHTML = `
      <button type="button" class="rm-btn">✕</button>
      <div class="entry-top">
        <input type="text" class="en-name" value="${escAttr(data.name||'')}" placeholder="Name">
        ${(withCost && !isSpellEntry)? `<input type="number" class="en-cost" value="${data.cost??0}" placeholder="${escAttr(costLabel||'Points')}">` : ''}
        ${(elMeta || isUniversalSpell) ? `<button type="button" class="ghost spell-cast-btn" title="${escAttr(castTitle)}">Cast</button>` : ''}
        ${isSpellEntry ? `<label class="spell-memo-label" title="${escAttr(memoTitle)}"><input type="checkbox" class="spell-memo-checkbox" ${data.isMemorised ? 'checked' : ''}> Memorised</label>` : ''}
      </div>
      <textarea class="en-desc" placeholder="Description">${escHtml(data.desc||'')}</textarea>
    `;
    div.querySelector('.rm-btn').addEventListener('click', ()=>{ div.remove(); recalcAll(); });
    // PART J PHASE 8 - the "Why can't I cast this?" button (209.7-feat-casting-diagnostics.js).
    // The button is built and wired inside that fragment, not here, so this phase's whole
    // visual surface stays in one file and deleting it leaves this line a silent no-op.
    if(typeof attachCastingDiagnosticButton === 'function') attachCastingDiagnosticButton(div, isSpellEntry);
    return div;
  }
  function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
