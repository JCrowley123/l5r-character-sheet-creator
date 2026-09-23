  // ========= PART I FEATURE 4.5.15: PER-ROLL DECLARATION REGISTRY =========
  // One general home for "tick this box if it applies to THIS roll" options in the roll preview,
  // instead of a hardwired set of preview hooks per entry. An entry registers a provider that
  // says what it offers for a roll context and what an armed option does; this fragment owns the
  // checkbox markup, the transient state, the reset rules and the route to the dice.
  //
  // Arming is bound to the exact roll context the preview opened with. The real roll reads its
  // modifiers with that same object, so a declaration applies to that roll (and a reroll of it)
  // and can never leak into a later roll -- including one that skips the preview. Nothing is
  // ever saved. Damage is excluded here centrally, before any provider is asked.
  //
  // Reaches the dice through the existing 'adv-config' registry seat (advConfigExtendedRollModifiers),
  // so the registry stays at seven seats. The three older hardwired declarations are unchanged.
  const ROLL_DECLARATIONS_ENABLED = true;

  const RD4515 = (function(){
    const api = {};
    const providers = [];
    let state = null;
    api.ID_RE = /^[a-z0-9][a-z0-9-]*$/;
    api.enabled = function(){
      return ROLL_DECLARATIONS_ENABLED && ADV_CONFIG_ENABLED && ADV_CONFIG_ROLL_EFFECTS_ENABLED;
    };
    api.eligible = function(context){
      return api.enabled() && !!context && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS &&
        context.kind !== ROLL_KINDS.DAMAGE;
    };

    // provider: {label, offers(context) -> [{key, label, note?}], modifiers(context, keys) -> [mod]}.
    // Registering an existing id replaces it, so a provider can never be listed twice.
    api.register = function(id, provider){
      if(typeof id !== 'string' || !api.ID_RE.test(id) || !provider ||
         typeof provider.offers !== 'function' || typeof provider.modifiers !== 'function') return false;
      api.unregister(id);
      providers.push({id:id, label:String(provider.label || id), offers:provider.offers, modifiers:provider.modifiers});
      return true;
    };
    api.unregister = function(id){
      const at = providers.findIndex(function(p){ return p.id === id; });
      if(at !== -1) providers.splice(at, 1);
      if(state) Object.keys(state.armed).forEach(function(k){ if(k.split(':')[0] === id) delete state.armed[k]; });
    };
    api.providerIds = function(){ return providers.map(function(p){ return p.id; }); };

    // A provider that throws, or returns junk, offers nothing rather than breaking the roll.
    api.offered = function(context){
      if(!api.eligible(context)) return [];
      const out = [];
      providers.forEach(function(p){
        let list;
        try { list = p.offers(context); } catch(e){ list = []; }
        (Array.isArray(list) ? list : []).forEach(function(o){
          if(!o || typeof o.key !== 'string' || !api.ID_RE.test(o.key) || typeof o.label !== 'string') return;
          out.push({provider:p.id, providerLabel:p.label, key:p.id + ':' + o.key, label:o.label,
            note:typeof o.note === 'string' ? o.note : ''});
        });
      });
      return out;
    };

    api.start = function(context){ state = api.eligible(context) ? {context:context, armed:{}} : null; };
    api.cancel = function(){ state = null; };
    api.toggle = function(key, checked){
      if(!state || !api.offered(state.context).some(function(o){ return o.key === key; })) return false;
      if(checked === true) state.armed[key] = true; else delete state.armed[key];
      return true;
    };
    // Armed keys for THIS context only, and only while still offered for it.
    api.armed = function(context){
      if(!state || state.context !== context) return [];
      const offered = api.offered(context).map(function(o){ return o.key; });
      return Object.keys(state.armed).filter(function(k){ return offered.indexOf(k) !== -1; });
    };
    api.modifiers = function(context){
      const keys = api.armed(context);
      if(!keys.length) return [];
      const out = [];
      providers.forEach(function(p){
        const mine = keys.filter(function(k){ return k.split(':')[0] === p.id; })
          .map(function(k){ return k.slice(p.id.length + 1); });
        if(!mine.length) return;
        let mods;
        try { mods = p.modifiers(context, mine); } catch(e){ mods = []; }
        (Array.isArray(mods) ? mods : []).forEach(function(m){
          if(!m) return;
          const num = function(v){ return Number.isFinite(v) ? v : 0; };
          out.push({source:'adv-config', label:String(m.label || p.label),
            rolledDelta:num(m.rolledDelta), keptDelta:num(m.keptDelta), totalDelta:num(m.totalDelta),
            note:String(m.note || 'Declared for this roll')});
        });
      });
      return out;
    };

    api.html = function(context){
      if(!state || state.context !== context) return '';
      const offers = api.offered(context);
      if(!offers.length) return '';
      let html = '<div class="rd4515-declare"><div class="rd4515-head">Declare for this roll</div>';
      let group = null;
      offers.forEach(function(o){
        if(o.provider !== group){
          group = o.provider;
          html += '<div class="rd4515-source">' + escHtml(o.providerLabel) + '</div>';
        }
        html += '<label class="rd4515-opt"><input type="checkbox" data-rd4515-key="' + escAttr(o.key) + '"' +
          (state.armed[o.key] ? ' checked' : '') + '><span>' + escHtml(o.label) + '</span></label>' +
          (o.note ? '<div class="rd4515-opt-note">' + escHtml(o.note) + '</div>' : '');
      });
      return html + '<div class="rd4515-note">Declared for this roll only; nothing is saved.</div></div>';
    };
    return api;
  })();

  // Phase 3's (Part G) preview calls these through typeof guards, so deleting this fragment
  // leaves each call a silent no-op.
  function rd4515PreviewStart(context){ if(typeof RD4515 === 'object' && RD4515) RD4515.start(context); }
  function rd4515PreviewCancel(){ if(typeof RD4515 === 'object' && RD4515) RD4515.cancel(); }
  function rd4515PreviewToggle(key, checked){ if(typeof RD4515 === 'object' && RD4515) RD4515.toggle(key, checked); }
  function rd4515PreviewHtml(context){ return (typeof RD4515 === 'object' && RD4515) ? RD4515.html(context) : ''; }

  if(RD4515.enabled() && typeof advConfigExtendedRollModifiers === 'function'){
    const rd4515PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (rd4515PreviousModifiers(context) || []).concat(RD4515.modifiers(context));
    };
  }
