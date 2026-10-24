  // BUGFIX TA7: separate Rank/point editors over the existing decimal Taint save field.
  const TA7 = (() => {
    const api = {}, $ = id => document.getElementById(id);
    let ui, last = {rank:0, points:0};
    api.enabled = () => TAINT_POINTS_ENABLED;
    api.read = () => TA7Logic.fromScore($('f_taint').value);
    api.rank = () => api.read()?.rank ?? 0;
    api.value = () => TA7Logic.score(api.read()) ?? 0;
    api.render = () => {
      if(!ui) return;
      const state = api.read();
      if(!state) {ui.check.disabled = true; return;}
      last = state;
      if(document.activeElement !== ui.rank) ui.rank.value = state.rank;
      if(document.activeElement !== ui.points) ui.points.value = state.points;
      ui.score.textContent = state.rank + '.' + state.points;
      ui.pips.forEach((b,i) => b.setAttribute('aria-pressed', String(i < state.points)));
      const rule = TA7Logic.growth(state);
      ui.check.disabled = !rule;
      ui.note.textContent = rule ? rule.label + ': Earth vs TN ' + rule.tn + ', ' + rule.interval + '. Core p.276.' :
        state.rank === 0 ? 'No Taint: no growth check is needed.' : 'Core Table 4.2 gives no growth TN above Level 4. Ask your GM.';
    };
    api.write = (rank, points) => {
      const state = TA7Logic.normalize(rank, points);
      if(!state) return false;
      $('f_taint').value = String(TA7Logic.score(state));
      if(ui) {ui.rank.value = state.rank; ui.points.value = state.points;}
      api.render();
      // UI hook: preserve dirty tracking and all existing readers of the saved field.
      $('f_taint').dispatchEvent(new Event('input', {bubbles:true}));
      recalcAll();
      return true;
    };
    api.addPoints = delta => {const s=api.read();return !!s && api.write(s.rank,s.points+delta);};
    api.growthCheck = () => {
      const state=api.read(), rule=TA7Logic.growth(state), earth=getRingValueByName('Earth');
      if(!rule || !Number.isInteger(earth) || earth<1) {setStatus('Enter valid Taint and Earth values before checking growth.');return Promise.resolve(null);}
      const context=makeRollContext(ROLL_KINDS.RING,{ringName:'Earth',ringValue:earth,ta7Growth:true});
      return rollWithModifiers('Taint growth — '+rule.label+' (TN '+rule.tn+')',context,earth,earth,{
        tnConfig:{tn:rule.tn,successText:'Taint does not grow.',failText:'Taint grows by one point when this result is closed.',
          onClose:success=>{if(success===false){api.addPoints(1);setStatus('Taint growth: one point added.');}}}
      });
    };
    const applies = c => !!c?.ta7Growth && c.kind === ROLL_KINDS.RING && c.ringName === 'Earth';
    api.provider = {
      label:'Taint growth',
      offers:c=>applies(c)?[{key:'tea',label:'Jade Petal Tea drunk daily (+2k2)',note:'Growth checks only. Core p.276.'}]:[],
      modifiers:(c,keys)=>applies(c)&&keys.includes('tea')?[{label:'Daily Jade Petal Tea',rolledDelta:2,keptDelta:2,totalDelta:0}]:[]
    };
    api.mount = () => {
      const saved=$('f_taint'), parent=saved.closest('.field');saved.hidden=true;
      parent.querySelector('label').textContent='Taint';
      const box=document.createElement('div');box.className='ta7-controls';
      const button=(text,label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;};
      const input=(id,label)=>{const e=document.createElement('input');e.type='number';e.id=id;e.min='0';e.step='1';e.setAttribute('aria-label',label);return e;};
      const rank=input('ta7-rank','Taint Rank'),points=input('ta7-points','Taint points');points.removeAttribute('min');
      const rankRow=document.createElement('div');rankRow.className='ta7-stepper';
      const pointRow=document.createElement('div');pointRow.className='ta7-stepper';
      const adjust=(part,delta)=>{const s=api.read();if(s)api.write(part==='rank'?Math.max(0,s.rank+delta):s.rank,part==='points'?s.points+delta:s.points);};
      rankRow.append('Rank',button('−','Lower Taint Rank',()=>adjust('rank',-1)),rank,button('+','Raise Taint Rank',()=>adjust('rank',1)));
      pointRow.append('Points',button('−','Lose one Taint point',()=>adjust('points',-1)),points,button('+','Gain one Taint point',()=>adjust('points',1)));
      const score=document.createElement('output');score.className='ta7-score';score.setAttribute('aria-live','polite');
      const pipRow=document.createElement('div');pipRow.className='ta7-pips';pipRow.setAttribute('role','group');pipRow.setAttribute('aria-label','Taint point pips');
      const pips=Array.from({length:9},(_,i)=>button(String(i+1),'Taint: '+(i+1)+' points in this Rank',()=>{const s=api.read();if(s)api.write(s.rank,s.points===i+1?0:i+1);}));pips.forEach(b=>pipRow.append(b));
      const check=button('Check Taint growth','Check Taint growth',()=>api.growthCheck());check.id='ta7-check';
      const note=document.createElement('p');note.className='hint';
      box.append(rankRow,score,pipRow,pointRow,check,note);parent.append(box);
      ui={rank,points,score,pips,check,note};api.render();
      [rank,points].forEach(e=>{
        e.addEventListener('input',()=>{if(rank.value!==''&&points.value!=='')api.write(rank.value,points.value);});
        e.addEventListener('change',()=>{if(!api.write(rank.value,points.value)){api.write(last.rank,last.points);setStatus('Taint Rank and points must be whole numbers.');}});
      });
    };
    return api;
  })();
  if(TA7.enabled()) {
    TA7.mount();
    if(typeof RD4515==='object' && RD4515) RD4515.register('taint-growth',TA7.provider);
    if(typeof TR4524==='object' && TR4524) TR4524.taint=TA7.rank;
    if(typeof ANC48==='object' && ANC48) ANC48.taint=TA7.value;
    const ta7Recalc=recalcAll;
    recalcAll=function(){const out=ta7Recalc.apply(this,arguments);TA7.render();return out;};
    const ta7Apply=applyData;
    applyData=function(){const out=ta7Apply.apply(this,arguments);TA7.render();return out;};
    const ta7Reset=resetToBaseline;
    resetToBaseline=function(){const out=ta7Reset.apply(this,arguments);TA7.render();return out;};
  }
