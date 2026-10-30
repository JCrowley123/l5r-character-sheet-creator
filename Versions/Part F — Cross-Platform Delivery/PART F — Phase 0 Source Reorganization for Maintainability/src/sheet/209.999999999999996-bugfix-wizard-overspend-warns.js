  // BUGFIX XW8: the creation wizard no longer blocks Next while more experience is spent than the character has (the
  // owner's ruling, 29 October 2026), because Disadvantages bought later can bring the total back. No step blocks for the
  // overspend; each step that showed it as an error shows it as a warning, Review shows it in plain words with the
  // amount over, and Finish warns once and goes on. Every other reason a step gives still blocks Next, as before.
  const WIZARD_OVERSPEND_WARNS_ENABLED = true;
  const XW8Logic = {
    ID:'xp-overspend',
    // The amount over, rounded as the validator rounds it, or 0.
    over(spent, total){ return spent > total ? Math.round((spent - total) * 100) / 100 : 0; },
    stepText(over){ return 'You have spent ' + over + ' XP more than you have. You can go on: a Disadvantage gives experience back.'; },
    reviewText(over, spent, total){
      return 'You have spent ' + over + ' XP more than you have (' + spent + ' of ' + total + '). You can still finish, ' +
        'and bring it back on the sheet with a Disadvantage or by lowering a purchase.';
    },
    finishText(over){
      return 'You have spent ' + over + ' XP more than you have. Finish anyway? You can bring it back on the sheet with a ' +
        'Disadvantage or by lowering a purchase.';
    },
    without(findings){ return findings ? findings.filter(f => !(f && f.id === XW8Logic.ID)) : findings; }
  };
  const XW8 = (() => {
    const api = {};
    const $ = id => document.getElementById(id);
    const num = id => parseFloat(($(id) || {}).value || '0');
    let quiet = 0;   // above 0 while a step's check runs: the overspend is left out of what it reads
    api.enabled = () => WIZARD_OVERSPEND_WARNS_ENABLED && typeof CW112 === 'object' && !!CW112 && CW112.enabled();
    api.amounts = () => { const spent = num('f_xpSpent'), total = num('f_xpTotal'); return {spent, total, over:XW8Logic.over(spent, total)}; };
    // The validator's own verdict, so the warning and the old block can never disagree.
    api.overspent = () => { const all = CW112.findings(); return !!all && all.some(f => f.id === XW8Logic.ID); };
    // A step's check, run with the overspend left out of the findings it reads. Steps come and go with the School,
    // so each is wrapped the first time the wizard reads it.
    api.guard = step => {
      if(!step || step.xw8Guarded || typeof step.check !== 'function') return;
      const previousCheck = step.check;
      step.check = function(){ quiet++; try { return previousCheck.apply(this, arguments); } finally { quiet--; } };
      step.xw8Guarded = true;
    };
    api.guardAll = () => CW112.steps.forEach(api.guard);
    // UI hook: the step's red "Overspent by" line becomes the warning; on Review it heads the page.
    api.decorate = () => {
      const body = CW112.view && $('cw112Body');
      if(!body || !api.overspent()) return;
      const a = api.amounts(), last = CW112.index === CW112.steps.length - 1;
      const warn = document.createElement('p');
      warn.className = 'cw112-warning xw8-warning';
      warn.id = 'xw8Warning';
      warn.textContent = last ? XW8Logic.reviewText(a.over, a.spent, a.total) : XW8Logic.stepText(a.over);
      const red = Array.from(body.querySelectorAll('p.cw112-error')).filter(p => /^Overspent by /.test(p.textContent));
      if(last) body.insertBefore(warn, body.firstChild);
      else if(red.length) red[0].before(warn);
      red.forEach(p => p.remove());
      body.querySelectorAll('li.cw112-finding.cw112-error').forEach(li => {
        const title = li.querySelector('strong');
        if(title && /^Overspent by /.test(title.textContent)) li.className = 'cw112-finding cw112-warning';
      });
    };
    if(api.enabled()){
      const style = document.createElement('style');
      style.textContent = '.xw8-warning{margin:0 0 12px;padding:8px 10px;border:1px solid #9a6b00;border-radius:8px;' +
        'background:rgba(154,107,0,.08);font-weight:600}';
      document.head.appendChild(style);
      const previousFindings = CW112.findings;
      CW112.findings = function(){
        const all = previousFindings.apply(this, arguments);
        return quiet && api.enabled() ? XW8Logic.without(all) : all;
      };
      const previousRefreshNav = CW112.refreshNav;
      CW112.refreshNav = function(){ if(api.enabled()) api.guardAll(); return previousRefreshNav.apply(this, arguments); };
      const previousNext = CW112.next;
      CW112.next = function(){ if(api.enabled()) api.guardAll(); return previousNext.apply(this, arguments); };
      const previousRender = CW112.render;
      CW112.render = function(){
        const out = previousRender.apply(this, arguments);
        if(api.enabled()) api.decorate();
        return out;
      };
      // Finish warns once; Stay keeps the wizard open on Review. One question at a time (Enter on the focused Finish
      // would ask again), and Finish goes on only if the wizard is still open on Review when it is answered.
      let asking = false;
      const previousFinish = CW112.finish;
      CW112.finish = async function(){
        if(api.enabled() && api.overspent()){
          if(asking) return;
          asking = true;
          let ok = false;
          try { ok = await appConfirm(XW8Logic.finishText(api.amounts().over), 'Finish', 'ghost', 'Stay'); }
          finally { asking = false; }
          if(!ok || !CW112.isOpen() || CW112.index !== CW112.steps.length - 1) return;
        }
        return previousFinish.apply(this, arguments);
      };
    }
    return api;
  })();
