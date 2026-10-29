  // BUGFIX RC7: at creation no Trait, Void Ring or Skill goes above 4 (Core p.103; owner's answers Q6 and Q7, 29 October
  // 2026). A character is in creation while the creation wizard is open: its raises stop at 4 and the validator warns of
  // one above 4. Nothing is changed or reported once the wizard closes. The validator's 1-10 range check stays.
  const CREATION_CAP_ENABLED = true;
  const RC7Logic = {
    CAP:4,
    over(value){ return value > RC7Logic.CAP; },
    // May a step of `step` from `value` go ahead?
    allows(value, step){ return step <= 0 || value + step <= RC7Logic.CAP; },
    title(name, value){ return name + ' is ' + value + ', above 4 at creation'; },
    detail:'A starting character begins play with no Trait, Ring or Skill above 4 (Core p.103).',
    refusal:'At creation nothing goes above 4 (Core p.103).'
  };
  const RC7 = (() => {
    const api = {};
    const value = el => parseInt((el && el.value) || '0', 10) || 0;
    api.enabled = () => CREATION_CAP_ENABLED && typeof CW112 === 'object' && !!CW112 && CW112.enabled();
    api.inCreation = () => api.enabled() && CW112.isOpen();
    // [{name, value}] for each Trait, the Void Ring and each named Skill.
    api.items = () => {
      const out = [];
      RINGS.forEach(r => r.traits.forEach(t => out.push({name:t.name, value:value(document.getElementById('trait_' + t.key))})));
      out.push({name:'Void', value:value(document.getElementById('ring_void'))});
      const body = document.getElementById('skillsBody');
      Array.from(body ? body.rows : []).forEach(tr => {
        const name = tr.querySelector('.sk-name'), rank = tr.querySelector('.sk-rank');
        if(name && name.value.trim() && rank) out.push({name:name.value.trim(), value:value(rank)});
      });
      return out;
    };
    api.findings = () => api.inCreation() ? api.items().filter(i => RC7Logic.over(i.value))
      .map(i => validationFinding('creation-cap', 'warning', RC7Logic.title(i.name, i.value), RC7Logic.detail)) : [];
    // A raise past 4 in the wizard is refused and said.
    api.refuses = (el, step) => {
      if(!api.inCreation() || RC7Logic.allows(value(el), step)) return false;
      setStatus(RC7Logic.refusal);
      CW112.render();
      return true;
    };
    // UI hook: each wizard + button whose value is already 4 is disabled, with the reason.
    api.capButtons = () => {
      if(!api.inCreation() || !CW112.view) return;
      CW112.view.querySelectorAll('.cw112-trait').forEach(row => {
        const val = row.querySelector('.cw112-trait-val'), plus = row.querySelector('button[aria-label^="Raise "]');
        if(!val || !plus || RC7Logic.allows(parseInt(val.textContent, 10) || 0, 1)) return;
        plus.disabled = true;
        plus.title = RC7Logic.refusal;
      });
    };
    if(api.enabled()){
      if(typeof CHARACTER_VALIDATOR_RULES === 'object' && typeof validationFinding === 'function'){
        CHARACTER_VALIDATOR_RULES.push({id:'creation-cap', fn:api.findings});
      }
      const previousStepTrait = CW112.stepTrait;
      CW112.stepTrait = function(inputId, step){
        if(api.refuses(document.getElementById(inputId), step)) return;
        return previousStepTrait.apply(this, arguments);
      };
      if(typeof CW1121 === 'object' && CW1121 && typeof CW1121.stepRank === 'function'){
        const previousStepRank = CW1121.stepRank;
        CW1121.stepRank = function(tr, step){
          if(api.refuses(tr && tr.querySelector('.sk-rank'), step)) return;
          return previousStepRank.apply(this, arguments);
        };
      }
      const previousRender = CW112.render;
      CW112.render = function(){
        const out = previousRender.apply(this, arguments);
        api.capButtons();
        return out;
      };
    }
    return api;
  })();
