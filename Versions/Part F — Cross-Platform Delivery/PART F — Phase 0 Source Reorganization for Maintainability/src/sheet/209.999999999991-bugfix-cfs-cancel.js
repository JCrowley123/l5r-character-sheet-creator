  // ============ BUGFIX CFSCANCEL — THE CLAN & SCHOOL PICKERS GO BACK AFTER CANCEL ============
  // FT-44 (the owner's check B1, 22 October 2026): Cancel on the question before Apply Family or Apply School left the
  // pickers on the new pick, and opening the open character from the Characters list (which does not load it again)
  // kept it there. Both now set the pickers back to the character's own Clan, Family and School through
  // CFSSYNC.sync() (Release 5a's Clan and School Pickers Follow the Character). Display only, as that fix is.
  // Interface: CFSCANCEL.enabled(), .asking(text), .restore(). Switch CFS_CANCEL_ENABLED.
  const CFS_CANCEL_ENABLED = true;

  var CFSCANCEL = (function(){
    const api = {};
    let asked = '';   // the Apply question a person's tap is about to raise
    api.enabled = function(){
      return CFS_CANCEL_ENABLED === true && typeof CFSSYNC === 'object' && !!CFSSYNC && CFSSYNC.enabled();
    };
    api.expect = function(which){ asked = api.enabled() ? CFSSYNC.question(which) : ''; };
    // True once, for the confirmation that is that question; any other confirmation clears it.
    api.asking = function(text){ const mine = !!asked && text === asked; asked = ''; return mine; };
    api.restore = function(){ return api.enabled() ? CFSSYNC.sync() : false; };
    return api;
  })();

  if(CFS_CANCEL_ENABLED){
    // UI hook: a person's tap on the two Apply buttons, seen before CFSSYNC's own capture listener asks.
    window.addEventListener('click', function(e){
      const btn = e.isTrusted && e.target && e.target.closest ? e.target.closest('#cfs_applySchool, #cfs_applyFamily') : null;
      if(btn) CFSCANCEL.expect(btn.id === 'cfs_applySchool' ? 'school' : 'family');
    }, true);
    const cfsCancelPreviousConfirm = appConfirm;
    appConfirm = function(message){
      const mine = CFSCANCEL.asking(message);
      const answer = cfsCancelPreviousConfirm.apply(this, arguments);
      if(mine && answer && typeof answer.then === 'function'){
        answer.then(function(ok){
          if(ok) return;
          try { CFSCANCEL.restore(); }
          catch(err){ if(window.console && console.warn) console.warn('L5R sheet: Clan & School pickers not restored —', err && err.message); }
        });
      }
      return answer;
    };
    // UI hook: the Characters list's Open on the character already open (Phase 11), which only closes the list.
    if(typeof CL11 === 'object' && CL11 && typeof CL11.openCharacter === 'function'){
      const cfsCancelPreviousOpen = CL11.openCharacter;
      CL11.openCharacter = async function(id){
        const same = !!id && id === currentId;
        const result = await cfsCancelPreviousOpen.apply(this, arguments);
        if(same) CFSCANCEL.restore();
        return result;
      };
    }
  }
  // ============ END BUGFIX CFSCANCEL ============
