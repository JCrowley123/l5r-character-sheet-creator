// PART K PHASE 11.2.6 — UI hooks for the rank spell picker.
  if(RS8.enabled()){
    const rs8UI = (function(){
      let dialog, returnTo, generation = 0;
      const el = (tag,text) => { const n=document.createElement(tag); if(text) n.textContent=text; return n; };
      function button(text,action){
        const b=el('button',text); b.type='button'; b.className='ghost'; b.addEventListener('click',action); return b;
      }
      function dismiss(){
        generation++;
        if(!dialog) return;
        const old=dialog; dialog=null; old.close(); old.remove();
        if(returnTo?.isConnected) returnTo.focus();
        returnTo=null;
      }
      function frame(title){
        if(MODES12.isPlay() || CW112.isOpen() || document.querySelector('dialog[open]') && !dialog) return null;
        if(!dialog){
          returnTo=document.activeElement;
          dialog=el('dialog'); dialog.id='rs8Dialog'; dialog.className='sc8-dialog';
          dialog.setAttribute('aria-labelledby','rs8Title');
          dialog.addEventListener('cancel',e=>{ e.preventDefault(); dismiss(); });
          document.body.append(dialog);
        }
        const heading=el('h2',title); heading.id='rs8Title';
        dialog.replaceChildren(heading);
        if(!dialog.open) dialog.showModal();
        return dialog;
      }
      function actions(host,primary,secondary){
        const group=el('p'); group.className='cw1121-add';
        if(primary) group.append(primary);
        const close=button(secondary,dismiss); close.id='rs8Close'; group.append(close); host.append(group);
      }
      function open(grant, offer){
        if(!grant || !RS8.grants(grant.school).includes(grant) || !RS8.left(grant)) return false;
        const host=frame(grant.school+' — Rank '+grant.rank+' spells');
        if(!host) return false;
        const note=el('p'); note.className='cw112-note'; note.setAttribute('role','status');
        const left=RS8.left(grant);
        note.textContent=left+' spell'+(left===1?'':'s')+' left to choose. You can return here from the character check in Manage.';
        host.append(note);
        if(offer){
          const choose=button('Choose spells',()=>open(grant,false)); choose.id='rs8Choose';
          actions(host,choose,'Later'); choose.focus(); return true;
        }
        const body=el('div'); host.append(body);
        const slot={label:'School Rank '+grant.rank};
        CW1124.renderSlots(body,{rs8Grant:grant,slots:[slot]});
        const select=body.querySelector('select');
        if(select){
          const other=RS8.options(grant).filter(x=>!Array.from(select.options).some(o=>o.value===String(x.i)));
          for(const element of new Set(other.map(x=>x.s.element))){
            const group=el('optgroup'); group.label=element;
            other.filter(x=>x.s.element===element).forEach(x=>group.append(new Option(x.s.name+' (Mastery '+x.s.mastery+')',String(x.i))));
            select.append(group);
          }
          // UI hook: keep the wizard form and route this button to its earning rank.
          const add=body.querySelector('#cw1124Add');
          add.addEventListener('click',e=>{
            e.stopImmediatePropagation();
            if(dialog !== host || !host.contains(add) || select.value==='' || !RS8.grant(grant,Number(select.value))) return;
            if(RS8.left(grant)) open(grant,false);
            else {
              host.replaceChildren(el('h2',grant.school+' — Rank '+grant.rank+' spells'),el('p','All spells for this rank have been chosen.'));
              host.firstChild.id='rs8Title'; actions(host,null,'Done'); host.querySelector('#rs8Close').focus();
            }
          },true);
        }
        actions(host,null,'Later'); (select || host.querySelector('#rs8Close')).focus(); return true;
      }
      function earlier(school){
        const ranks=RS8.earlier(school);
        if(!ranks.length) return false;
        const host=frame(school+' — Earlier rank spells');
        if(!host) return false;
        host.append(el('p','Choose an earlier rank and report only the spells you still need from it. Include spells you have already learned when working out how many are missing.'));
        const rankLabel=el('label','School Rank '), rankSelect=el('select');
        rankSelect.id='rs8EarlierRank';
        ranks.forEach(r=>rankSelect.add(new Option('Rank '+r.rank,String(r.rank))));
        rankLabel.append(rankSelect);
        const amountLabel=el('label','Spells still missing '), amount=el('select'); amount.id='rs8Missing';
        amountLabel.append(amount);
        const confirm=button('Confirm missing spells',()=>{
          if(dialog!==host || !host.contains(confirm) || amount.value==='') return;
          const n=Number(rankSelect.value);
          if(!RS8.claim(school,n,Number(amount.value))) return;
          const g=RS8.grants(school).find(entry=>entry.rank===n);
          if(!RS8.left(g)) dismiss(); else open(g,false);
        }); confirm.id='rs8Confirm';
        function reset(){
          const item=ranks.find(r=>String(r.rank)===rankSelect.value);
          amount.replaceChildren(new Option('— choose a number —',''));
          for(let i=0;i<=item.maximum;i++) amount.add(new Option(String(i),String(i)));
          confirm.disabled=true;
        }
        rankSelect.addEventListener('change',reset); amount.addEventListener('change',()=>{confirm.disabled=amount.value==='';});
        reset(); const field=el('p'); field.append(rankLabel); const count=el('p'); count.append(amountLabel);
        host.append(field,count); actions(host,confirm,'Later'); rankSelect.focus(); return true;
      }
      return {open,earlier,dismiss,offer(grants){
        const token=generation;
        queueMicrotask(()=>{
          if(generation!==token || dialog || document.querySelector('dialog[open]') || MODES12.isPlay() || CW112.isOpen()) return;
          const first=grants.find(g=>RS8.grants(g.school).includes(g) && RS8.left(g)); if(first) open(first,true);
        });
      }};
    })();
    RS8.dismiss=rs8UI.dismiss; RS8.offer=rs8UI.offer;
    const rs8Status=CW1124.status, rs8Helpful=CW1124.helpful;
    CW1124.status=function(data){
      if(!data?.rs8Grant) return rs8Status.apply(this,arguments);
      const g=data.rs8Grant, have=g.spells.length;
      return {quotas:[{slot:data.slots[0],want:have+RS8.left(g),have}]};
    };
    CW1124.helpful=function(data){ return data?.rs8Grant ? RS8.options(data.rs8Grant) : rs8Helpful.apply(this,arguments); };
    const rs8Open=SC8.open;
    SC8.open=function(school,kind){
      if(/^rank-\d+$/.test(kind)) return rs8UI.open(RS8.grants(school).find(g=>'rank-'+g.rank===kind),false);
      return rs8Open.apply(this,arguments);
    };
    const rs8Decorate=SC8.decorate;
    SC8.decorate=function(){
      rs8Decorate.apply(this,arguments);
      const host=document.getElementById('validationReport');
      if(!host) return;
      host.querySelectorAll('.rs8-earlier').forEach(b=>b.remove());
      if(MODES12.isPlay() || CW112.isOpen()) return;
      host.querySelectorAll('.sc8-open[data-kind^="rank-"]').forEach(b=>{ b.textContent='Choose Rank '+b.dataset.kind.slice(5)+' spells'; });
      for(const {name} of RS8.schools()){
        if(!RS8.earlier(name).length) continue;
        const b=document.createElement('button'); b.type='button'; b.className='ghost rs8-earlier';
        b.textContent='Review earlier rank spells · '+name; b.addEventListener('click',()=>rs8UI.earlier(name)); host.append(b);
      }
    };
    const rs8AddStarting=CW1122.addSpell;
    CW1122.addSpell=function(index){
      const spell=SPELL_LIBRARY[index];
      if(SC8.inPicker() && spell && RS8.earnedSpell(spell.name) &&
        !CW1123.forSchool(CW112.appliedSchool())?.given.includes(spell.name)) return false;
      return rs8AddStarting.apply(this,arguments);
    };
    const rs8RenderStarting=SC8.render;
    SC8.render=function(){
      const result=rs8RenderStarting.apply(this,arguments);
      if(SC8.dialog?.open && SC8.kind==='spell'){
        SC8.dialog.querySelectorAll('select[id^="cw1123Pick"] option,select#cw1124Pick option').forEach(o=>{
          if(o.value && SPELL_LIBRARY[o.value] && RS8.earnedSpell(SPELL_LIBRARY[o.value].name)) o.remove();
        });
      }
      return result;
    };
    const rs8Mode=MODES12.set;
    MODES12.set=function(){ const result=rs8Mode.apply(this,arguments); if(MODES12.isPlay()) RS8.dismiss(); return result; };
    RS8.install();
  }
