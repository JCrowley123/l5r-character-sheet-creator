  // BUGFIX CP7: compact controls and reversible point changes.
  const CP7 = (()=>{
    const api={}, names=['honor','glory','status','taint'],titles={honor:'Honour',glory:'Glory',status:'Status',taint:'Taint'},views=new Map();
    let notice,undoButton,last=null;
    api.enabled=()=>COMPACT_POINTS_ENABLED&&typeof RP7==='object'&&RP7?.enabled()&&typeof TA7==='object'&&TA7?.enabled();
    api.read=name=>name==='taint'?TA7.read():RP7.read(name);
    const describe=(name,state)=>titles[name]+': Rank '+state.rank+', Points '+state.points+'.';
    function message(text,error=false){if(notice){notice.textContent=text;notice.setAttribute('role',error?'alert':'status');}}
    function validUndo(){return !!last&&last.character===currentId&&CP7Logic.same(api.read(last.name),last.after);}
    api.render=name=>{
      const ui=views.get(name),s=api.read(name);if(!ui||!s)return;
      ui.rank.textContent=s.rank;ui.points.textContent=s.points;
      ui.pips.forEach((pip,i)=>pip.classList.toggle('filled',i<s.points%10));
      ui.pipRow.setAttribute('aria-label',s.points%10+' of 9 point pips filled');
      if(document.activeElement!==ui.rankEdit)ui.rankEdit.value=s.rank;
      if(ui.recognize)ui.recognize.textContent=RP7.labels.recognize;
      if(undoButton)undoButton.hidden=!validUndo();
    };
    api.renderAll=()=>names.forEach(api.render);
    function write(name,s){
      if(name==='taint')return TA7.write(s.rank,s.points);
      const ok=RP7.write(name,s.rank,s.points);if(ok)RP7.changed(name);return ok;
    }
    api.commit=(name,next)=>{
      const before=api.read(name);
      if(!before||!next){message('The change could not be applied. Check the current Rank and Points.',true);return false;}
      if(CP7Logic.same(before,next)){message(titles[name]+' is already at that value or its limit.',true);return false;}
      try{
        if(!write(name,next))throw new Error('The value was refused.');
        const after=api.read(name);
        if(!after)throw new Error('The result could not be read.');
        last={name,before:{...before},after:{...after},character:currentId};
        message(describe(name,after));api.renderAll();return true;
      }catch(error){
        try{write(name,before);}catch(_){}
        message('The change could not be applied. '+error.message,true);return false;
      }
    };
    api.adjust=(name,value,direction)=>{
      const amount=CP7Logic.amount(value),s=api.read(name);
      if(amount===null||![1,-1].includes(direction)){message('Enter a positive whole number: 1 or greater, with no decimals or minus sign.',true);return false;}
      if(!s){message('Check the current Rank and Points before making an adjustment.',true);return false;}
      const next=name==='taint'?TA7Logic.normalize(s.rank,s.points+direction*amount):RP7Logic.normalize(name,s.rank,s.points+direction*amount);
      const ok=api.commit(name,next);
      if(ok&&views.has(name))views.get(name).amount.value='1';
      return ok;
    };
    api.undo=()=>{
      if(!validUndo()){last=null;if(undoButton)undoButton.hidden=true;message('That change can no longer be undone because the character or value changed.',true);return false;}
      const change=last;
      try{if(!write(change.name,change.before))throw new Error('The previous value was refused.');last=null;message('Undone. '+describe(change.name,api.read(change.name)));api.renderAll();return true;}
      catch(error){message('Undo could not be applied. '+error.message,true);return false;}
    };
    api.clear=()=>{last=null;views.forEach(ui=>{ui.amount.value='1';});message('');api.renderAll();};
    // BUGFIX CE7 BEGIN undo-expiry
    // UI hook: expire feedback without erasing an amount being typed or an error.
    api.ce7ExpireUndo=()=>{last=null;if(undoButton)undoButton.hidden=true;if(notice?.getAttribute('role')!=='alert')message('');};
    // END CE7 undo-expiry
    function button(text,label,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;}
    api.mount=()=>{
      const old=document.getElementById('f_honorRank')?.closest('.rank-block')?.parentElement;
      if(!old||document.getElementById('cp7-section'))return;
      old.classList.add('cp7-legacy');document.getElementById('f_taint').closest('.field').classList.add('cp7-legacy');
      const host=document.createElement('section');host.id='cp7-section';host.setAttribute('aria-label','Honour, Glory, Status and Taint');old.before(host);
      const grid=document.createElement('div');grid.className='cp7-grid';host.append(grid);
      const settings=document.createElement('details');settings.className='cp7-management print-hide';settings.innerHTML='<summary>Rank settings</summary>';const settingsGrid=document.createElement('div');settingsGrid.className='cp7-settings-grid';settings.append(settingsGrid);
      names.forEach(name=>{
        const card=document.createElement('div');card.className='cp7-card';card.dataset.cp7=name;
        card.innerHTML='<h3>'+titles[name]+'</h3><div class="cp7-values"><span>Rank</span><output class="cp7-rank"></output><span>Points</span><output class="cp7-points"></output></div><div class="cp7-pips" role="img"></div><div class="cp7-adjust print-hide"></div>';
        const pipRow=card.querySelector('.cp7-pips'),pips=Array.from({length:9},(_,i)=>{const e=document.createElement('span');e.textContent=i+1;e.setAttribute('aria-hidden','true');pipRow.append(e);return e;});
        const amount=document.createElement('input');amount.type='text';amount.inputMode='numeric';amount.pattern='[1-9][0-9]*';amount.value='1';amount.id='cp7-'+name+'-amount';amount.setAttribute('aria-label',titles[name]+' points to add or subtract');amount.setAttribute('aria-describedby','cp7-notice');
        card.querySelector('.cp7-adjust').append(button('−','Subtract '+titles[name]+' points',()=>api.adjust(name,amount.value,-1)),amount,button('+','Add '+titles[name]+' points',()=>api.adjust(name,amount.value,1)));
        grid.append(card);
        const group=document.createElement('div');group.innerHTML='<label for="cp7-'+name+'-rank">'+titles[name]+' Rank</label>';
        const rankEdit=document.createElement('input');rankEdit.type='text';rankEdit.inputMode='numeric';rankEdit.id='cp7-'+name+'-rank';rankEdit.dataset.cp7Management='true';
        const applyRank=()=>{
          if(typeof MODES12==='object'&&MODES12?.isPlay())return;
          const text=rankEdit.value.trim(),rank=/^\d+$/.test(text)?Number(text):NaN,s=api.read(name);
          if(!Number.isSafeInteger(rank)||rank<0||(name!=='taint'&&rank>10)){message('Enter a whole Rank '+(name==='taint'?'of zero or greater.':'between 0 and 10.'),true);return;}
          const next=name==='taint'?TA7Logic.normalize(rank,s?.points):RP7Logic.normalize(name,rank,s?.points);api.commit(name,next);
        };
        const rankApply=button('Set Rank','Set '+titles[name]+' Rank',applyRank);rankApply.dataset.cp7Management='true';group.append(rankEdit,rankApply);
        let recognize=null;
        if(name==='glory'||name==='status'){
          recognize=button(RP7.labels.recognize,RP7.labels.recognize+' — '+titles[name],()=>{if(RP7.management())api.commit(name,RP7Logic.recognize(name,api.read(name)));});recognize.dataset.cp7Management='true';group.append(recognize);
        }
        settingsGrid.append(group);views.set(name,{rank:card.querySelector('.cp7-rank'),points:card.querySelector('.cp7-points'),pips,pipRow,amount,rankEdit,recognize});
      });
      const feedback=document.createElement('div');feedback.className='cp7-feedback print-hide';notice=document.createElement('span');notice.id='cp7-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');undoButton=button('Undo','Undo the last characteristic change',api.undo);undoButton.id='cp7-undo';undoButton.hidden=true;feedback.append(notice,undoButton);host.append(feedback);
      const actions=document.createElement('div');actions.className='cp7-growth print-hide';const growth=document.getElementById('ta7-check'),note=growth?.nextElementSibling;if(growth)actions.append(growth);if(note)actions.append(note);host.append(actions,settings);
      ['honorChoiceNote','gloryMonkNote'].forEach(id=>{const e=document.getElementById(id);if(e)host.append(e);});
      if(typeof MODES12==='object'&&MODES12)MODES12.register('[data-cp7-management]');api.renderAll();
    };
    return api;
  })();
  if(CP7.enabled()){
    CP7.mount();
    const cp7SocialRender=RP7.render;RP7.render=function(name){cp7SocialRender.call(this,name);CP7.render(name);};
    const cp7TaintRender=TA7.render;TA7.render=function(){cp7TaintRender.apply(this,arguments);CP7.render('taint');};
    const cp7Apply=applyData;applyData=function(){const result=cp7Apply.apply(this,arguments);if(result!==false)CP7.clear();return result;};
    const cp7Reset=resetToBaseline;resetToBaseline=function(){const result=cp7Reset.apply(this,arguments);CP7.clear();return result;};
  }
