  // BUGFIX AU8: on a sheet not yet saved as a character, a change undone no longer leaves the sheet looking changed (the
  // audit log's known limit, the 7c review's finding 4; the owner's answer, 30 October 2026). The History keeps both
  // entries, as it should. Only the question "is there unsaved work on this sheet?" leaves the History out, so opening
  // another character over a sheet that is back as it started does not ask to discard it.
  const UNDONE_CHANGE_CLEAN_ENABLED = true;
  const AU8Logic = {
    // A collectData() JSON text without its History; a text that is not a saved sheet comes back unchanged.
    withoutHistory(text){
      let data = null;
      try { data = JSON.parse(text); } catch(e){ return text; }
      if(!data || typeof data !== 'object' || !('auditLog' in data)) return text;
      delete data.auditLog;
      return JSON.stringify(data);
    }
  };
  const AU8 = (() => {
    const api = {};
    api.enabled = () => UNDONE_CHANGE_CLEAN_ENABLED && typeof CL11 === 'object' && !!CL11 &&
      typeof AL71 === 'object' && !!AL71 && AL71.enabled();
    // An unsaved sheet that, History aside, is exactly the untouched one.
    api.unchanged = () => !currentId && typeof CL11.blank === 'string' &&
      AU8Logic.withoutHistory(CL11.snapshot()) === AU8Logic.withoutHistory(CL11.blank);
    if(api.enabled() && typeof CL11.confirmDiscard === 'function'){
      const previousConfirm = CL11.confirmDiscard;
      CL11.confirmDiscard = function(){
        if(api.enabled() && api.unchanged()) return Promise.resolve(true);
        return previousConfirm.apply(this, arguments);
      };
    }
    return api;
  })();
