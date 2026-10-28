  // BUGFIX AG7: Ancestor gifts (owner ruling R25, 23 October 2026). A once-a-session gift already used shows as used
  // in the roll preview, and cannot be ticked, until Reset session; Management can set the favour badge directly.
  const ANCESTOR_GIFTS_ENABLED = true;
  const AG7Logic = {
    STATES: ['kept', 'lost', 'regained', 'final'],
    LABELS: {kept:'Favour kept', lost:'Favour lost (it may return once)', regained:'Favour returned once', final:'Favour lost for good'},
    of(s){ return !s ? '' : s.final ? 'final' : s.lost ? 'lost' : s.regained ? 'regained' : 'kept'; },
    allowed(noReturn){ return noReturn ? ['kept', 'final'] : AG7Logic.STATES.slice(); },
    // The saved state with its favour set; each result is one the Ancestor card accepts.
    set(s, state, noReturn){
      if(!s || AG7Logic.allowed(noReturn).indexOf(state) === -1) return null;
      const flags = {kept:{lost:false, regained:false, final:false}, lost:{lost:true, regained:false, final:false},
        regained:{lost:false, regained:true, final:false}, final:{lost:true, regained:!noReturn, final:true}}[state];
      return Object.assign({}, s, flags);
    },
    // A declaration whose once-a-session use is spent, unless this very roll is the one it was paid for.
    used(declaration, sessionUsed, paidHere){
      return !!(declaration && declaration.price && declaration.price.session && sessionUsed && !paidHere);
    }
  };
  const AG7 = (() => {
    const api = {};
    api.enabled = () => ANCESTOR_GIFTS_ENABLED && typeof ANC48 === 'object' && !!ANC48 && ANC48.enabled() &&
      typeof RD4515 === 'object' && !!RD4515;
    api.USED_LABEL = ' — used this session';
    api.USED_NOTE = 'Used this session. It is ready again after Reset session on the Ancestor card (Clan & School).';
    api.context = null;   // the roll the preview's declarations were started for
    api.isUsed = (key, context) => {
      const prefix = ANC48.PROVIDER + ':';
      return String(key).indexOf(prefix) === 0 &&
        AG7Logic.used(ANC48.DECLARATIONS[String(key).slice(prefix.length)], ANC48.sessionUsed(), !!context && context === ANC48.paidContext);
    };
    if(api.enabled()){
      const start = RD4515.start, offered = RD4515.offered, toggle = RD4515.toggle, html = RD4515.html;
      RD4515.start = function(context){ api.context = context; return start.apply(this, arguments); };
      RD4515.offered = function(context){
        return offered.apply(this, arguments).map(o => api.isUsed(o.key, context)
          ? Object.assign({}, o, {label:o.label + api.USED_LABEL, note:api.USED_NOTE, used:true}) : o);
      };
      RD4515.toggle = function(key, checked){
        if(checked === true && api.isUsed(key, api.context)) return false;
        return toggle.apply(this, arguments);
      };
      RD4515.html = function(context){
        let out = html.apply(this, arguments);
        RD4515.offered(context).filter(o => o.used).forEach(o => {
          const attr = 'data-rd4515-key="' + escAttr(o.key) + '"';
          out = out.split(attr).join(attr + ' disabled');
        });
        return out;
      };
    }
    return api;
  })();
