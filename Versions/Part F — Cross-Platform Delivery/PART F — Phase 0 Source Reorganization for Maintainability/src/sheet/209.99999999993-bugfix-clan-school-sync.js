  // ============ BUGFIX CFSSYNC — THE CLAN & SCHOOL PICKERS FOLLOW THE LOADED CHARACTER ============
  // The Clan & School tab's four pickers (#cfs_clan, #cfs_minorClan, #cfs_family, #cfs_school) are staging controls
  // that no save holds, so after a load they kept their first options (Crab, Hida, Hida Bushi) and Play mode showed
  // those as the character's. After every load (Import, Load, the Characters list) they are set to the character's own
  // Clan, Family and School. Display only: Apply is never fired and no saved field is written. After a reset (New,
  // Delete, a blank sheet) they return to their first options, as on a fresh page, except while the creation wizard
  // is open: it resets the sheet mid-step and then stages its own pick.
  // A person's Apply Family or Apply School asks first when it would replace what the character has (owner's ruling
  // 5, 21 October 2026); the wizard clicks Apply by script and is never stopped mid-step.
  // Interface: CFSSYNC.enabled(), .target({clan, family, school}), .sync(), .question('family'|'school').
  // Switches CFS_SYNC_ENABLED, CFS_APPLY_GUARD_ENABLED.
  const CFS_SYNC_ENABLED = true;
  const CFS_APPLY_GUARD_ENABLED = true;

  var CFSSYNC = (function(){
    const api = {};
    const BROTHERHOOD = 'Brotherhood of Shinsei', MINOR = 'Minor Clan';
    const keys = function(o){ return o && typeof o === 'object' ? Object.keys(o) : []; };
    const named = function(list, name){ return Array.isArray(list) && list.some(function(s){ return s && s.name === name; }); };
    api.enabled = function(){ return CFS_SYNC_ENABLED === true; };

    // Logic: the picker values that describe a character. Pure; reads the School and Family libraries only.
    // Returns { clan, minorClan, family, school } or null when neither the Clan nor the School is recognised.
    api.target = function(rec){
      const clan = String((rec && rec.clan) || '').trim();
      const family = String((rec && rec.family) || '').trim();
      const school = String((rec && rec.school) || '').trim();
      const greatClans = keys(FAMILY_LIBRARY).concat(keys(SCHOOL_LIBRARY)).filter(function(c){ return c !== MINOR && c !== BROTHERHOOD; });
      const minorClans = keys(MINOR_CLAN_LIBRARY).concat(keys(MINOR_CLAN_SCHOOL_LIBRARY));
      const out = { clan: null, minorClan: null, family: family, school: school };
      if(clan && greatClans.indexOf(clan) >= 0) out.clan = clan;
      else if(clan && minorClans.indexOf(clan) >= 0){ out.clan = MINOR; out.minorClan = clan; }
      else if(school){
        // No recognised Clan: the School's own picker list says where it is offered.
        const great = keys(SCHOOL_LIBRARY).find(function(c){ return named(SCHOOL_LIBRARY[c], school); });
        const minor = great ? null : keys(MINOR_CLAN_SCHOOL_LIBRARY).find(function(c){ return named(MINOR_CLAN_SCHOOL_LIBRARY[c], school); });
        if(great) out.clan = great;
        else if(minor){ out.clan = MINOR; out.minorClan = minor; }
        else if(named(BROTHERHOOD_SCHOOL_LIBRARY, school)) out.clan = BROTHERHOOD;
      }
      return out.clan ? out : null;
    };

    // The character's own record: the School applied on this tab, else the first of its Schools, else #f_school.
    api.record = function(){
      const field = function(id){ const el = document.getElementById(id); return el ? el.value : ''; };
      const applied = typeof getSchoolApplied === 'function' ? getSchoolApplied() : null;
      const list = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      const school = (applied && applied.school) || (list[0] && list[0].name) || field('f_school');
      return { clan: field('f_clan'), family: field('f_family'), school: school };
    };

    // UI hook: the Clan & School tab's pickers and their refresh functions (080-identity-build-ui.js).
    // A value the rebuilt list lacks (a School from another Clan's list) is shown as one extra, inert option:
    // Apply finds no library entry for it and changes nothing.
    function choose(select, value){
      if(!select || !value) return;
      if(!Array.from(select.options).some(function(o){ return o.value === value; })){
        const extra = new Option(value, value);
        extra.setAttribute('data-cfssync', 'extra');
        select.add(extra);
      }
      select.value = value;
    }
    api.sync = function(){
      if(!api.enabled()) return false;
      const t = api.target(api.record());
      const clanSel = document.getElementById('cfs_clan'), minorSel = document.getElementById('cfs_minorClan');
      if(!clanSel || !minorSel) return false;
      if(t){ clanSel.value = t.clan; if(t.minorClan) choose(minorSel, t.minorClan); }
      else { clanSel.selectedIndex = 0; minorSel.selectedIndex = 0; }
      refreshMinorClanVisibility();
      refreshFamilyOptions();
      refreshSchoolOptions();
      if(t){
        choose(document.getElementById('cfs_family'), t.family);
        choose(document.getElementById('cfs_school'), t.school);
        renderSchoolInfo();
      }
      if(typeof renderAncestorCard === 'function') renderAncestorCard();
      return true;
    };

    // What Apply would replace, as the question to ask, or '' when nothing applied would be replaced or nothing
    // valid is staged (Apply then changes nothing and says so itself).
    api.question = function(which){
      const clanSel = document.getElementById('cfs_clan'), minorSel = document.getElementById('cfs_minorClan');
      if(which === 'family'){
        const applied = typeof getFamilyApplied === 'function' ? getFamilyApplied() : null;
        const fam = (document.getElementById('cfs_family') || {}).value;
        const lib = clanSel.value === MINOR ? (MINOR_CLAN_LIBRARY[minorSel.value] || []) : (FAMILY_LIBRARY[clanSel.value] || []);
        if(!applied || !applied.family || !lib.some(function(f){ return f[0] === fam; })) return '';
        return applied.family === fam
          ? 'Apply ' + fam + ' again? Its Trait bonus is given again.'
          : 'Replace your Family, ' + applied.family + ', with ' + fam + '? Its Trait bonus moves with it.';
      }
      const school = (document.getElementById('cfs_school') || {}).value;
      if(!named(schoolsForPicker(), school)) return '';
      const list = (typeof getSchoolsList === 'function' ? getSchoolsList() : []).map(function(s){ return s && s.name; }).filter(Boolean);
      const applied = typeof getSchoolApplied === 'function' ? getSchoolApplied() : null;
      const current = (applied && applied.school) || list[0];
      if(!current) return '';
      const others = list.filter(function(n){ return n !== current; });
      const paths = (typeof pathsTaken === 'function' ? pathsTaken() : []).map(function(p){ return p && p.name; }).filter(Boolean);
      const lost = [];
      if(others.length) lost.push('your other ' + (others.length > 1 ? 'Schools' : 'School') + ' (' + others.join(', ') + ')');
      if(paths.length) lost.push('your Alternate ' + (paths.length > 1 ? 'Paths' : 'Path') + ' (' + paths.join(', ') + ')');
      return (current === school
        ? 'Apply ' + school + ' again? Its Skills, Techniques and Honor are set again'
        : 'Replace your School, ' + current + ', with ' + school + '? Its Skills, Techniques and Honor are set again')
        + (lost.length ? ', and ' + lost.join(' and ') + ' will be removed.' : '.');
    };
    return api;
  })();

  if(CFS_SYNC_ENABLED){
    const cfsSyncPreviousApply = applyData;
    applyData = function(){
      const result = cfsSyncPreviousApply.apply(this, arguments);
      if(result !== false){
        try { CFSSYNC.sync(); }
        catch(e){ if(window.console && console.warn) console.warn('L5R sheet: Clan & School pickers not updated —', e && e.message); }
      }
      return result;
    };
    const cfsSyncPreviousReset = resetToBaseline;
    resetToBaseline = function(){
      const result = cfsSyncPreviousReset.apply(this, arguments);
      if(!(typeof CW112 === 'object' && CW112 && typeof CW112.isOpen === 'function' && CW112.isOpen())){
        try { CFSSYNC.sync(); }
        catch(e){ if(window.console && console.warn) console.warn('L5R sheet: Clan & School pickers not reset —', e && e.message); }
      }
      return result;
    };
  }
  // UI hook: the Clan & School tab's two Apply buttons. A capture listener, after Phase 4.7's own (which refuses Apply
  // School over an Advanced School and so still wins). Only a person's click is held; the confirmed one is replayed by
  // script, which this listener lets through like the wizard's.
  if(CFS_APPLY_GUARD_ENABLED){
    document.addEventListener('click', function(e){
      const btn = e.isTrusted && e.target && e.target.closest ? e.target.closest('#cfs_applySchool, #cfs_applyFamily') : null;
      if(!btn) return;
      const ask = CFSSYNC.question(btn.id === 'cfs_applySchool' ? 'school' : 'family');
      if(!ask) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      appConfirm(ask, 'Replace', 'ghost', 'Cancel').then(function(ok){ if(ok) btn.click(); });
    }, true);
  }
  // ============ END BUGFIX CFSSYNC ============
