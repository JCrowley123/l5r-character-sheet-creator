  // ============ PART K PHASE 11.3 — APP BAR: NAVIGATION ============
  // The app's sections and how to reach them. No DOM of its own: a bar, a menu or any later design calls
  // sections(), current() and show(id), and hears changes through onChange(fn). It reuses the screens that exist:
  // the sheet is the Characters screen closed; Characters, Library and Search are that screen's tabs (Phase 11,
  // Part K); Search opens through its page (Phase 14, Part K), which returns to where the reader was.
  const APP_NAV_ENABLED = true;

  const AB113 = (function(){
    const api = {};
    const SECTIONS = [
      { id:'sheet', label:'Sheet' },
      { id:'characters', label:'Characters' },
      { id:'library', label:'Library' },
      { id:'search', label:'Search' },
    ];
    const listeners = [];
    let tab = 'characters';
    let last = null;

    api.enabled = function(){
      return APP_NAV_ENABLED && typeof CL11 === 'object' && !!CL11 && typeof CL11.enabled === 'function' && CL11.enabled();
    };
    api.sections = function(){ return SECTIONS.map(function(s){ return { id:s.id, label:s.label }; }); };
    api.current = function(){ return api.enabled() && CL11.isOpen() ? tab : 'sheet'; };
    api.show = async function(id){
      if(!api.enabled() || !SECTIONS.some(function(s){ return s.id === id; })) return false;
      if(id === 'sheet') CL11.close();
      else if(id === 'search' && typeof SEARCHPAGE14 === 'object' && SEARCHPAGE14 && SEARCHPAGE14.enabled()) await SEARCHPAGE14.open();
      else await CL11.open(id);
      api.notify();
      return true;
    };
    // fn(current) after each change of section. Returns a function that stops the notices.
    api.onChange = function(fn){
      if(typeof fn !== 'function') return function(){};
      listeners.push(fn);
      return function(){ const i = listeners.indexOf(fn); if(i >= 0) listeners.splice(i, 1); };
    };
    api.notify = function(){
      const now = api.current();
      if(now === last) return;
      last = now;
      listeners.slice().forEach(function(fn){ try { fn(now); } catch(e){ console.error(e); } });
    };
    api.install = function(){
      if(!api.enabled()) return;
      // UI hook: the Characters screen's open state and tab are the app's section.
      const baseShowTab = CL11.showTab, baseOpen = CL11.open, baseClose = CL11.close;
      CL11.showTab = function(t){ const out = baseShowTab.apply(this, arguments); tab = t; api.notify(); return out; };
      CL11.open = async function(){ const out = await baseOpen.apply(this, arguments); api.notify(); return out; };
      CL11.close = function(){ const out = baseClose.apply(this, arguments); api.notify(); return out; };
      last = api.current();
    };
    return api;
  })();

  if(APP_NAV_ENABLED) AB113.install();
  // ============ END PART K PHASE 11.3 AB113 ============
