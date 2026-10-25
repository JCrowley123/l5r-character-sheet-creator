  // BUGFIX PX7: snapshot and browser download adapter. No character values are changed.
  const PX7 = (() => {
    const api={};
    api.enabled=()=>TEMPLATE_PDF_ENABLED;
    api.snapshot=()=>{
      const s=JSON.parse(JSON.stringify(collectData()));
      // UI hook: read effective displayed Traits/Rings, including temporary reductions.
      Object.keys(s.rings).forEach(key=>s.rings[key]=document.getElementById('ring_'+key)?.value??s.rings[key]);
      Object.keys(s.traits).forEach(key=>s.traits[key]=document.getElementById('trait_'+key)?.value??s.traits[key]);
      s.social={};['honor','glory','status'].forEach(key=>{
        s.social[key]=typeof RP7==='object'&&RP7?.enabled()?RP7.read(key):{rank:Number(s.fields['f_'+key+'Rank']),points:Math.round((Number(s.fields['f_'+key+'Pts'])%1)*10)};
      });
      s.social.taint=typeof TA7==='object'&&TA7?.enabled()?TA7.read():{rank:Math.floor(Number(s.fields.f_taint)),points:Math.round((Number(s.fields.f_taint)%1)*10)};
      s.wounds=computeWoundThresholds(Number(s.rings.earth));
      s.skills.forEach(skill=>{const pool=rollSkillTenDice(Number(skill.rank),getTraitValueByName(skill.trait));skill.pool=pool.finalRolled+'k'+pool.finalKept+(pool.bonus?' +'+pool.bonus:'');});
      s.schools=getSchoolsList().map(school=>{
        const entry=findAnySchoolLibraryEntry(school.name),category=schoolCasterCategory(entry);
        return {name:school.name,kind:category==='shugenja'?'shugenja':category==='bushi'?'bushi':/monk/i.test(school.name)||entry?.brotherhood?'monk':'courtier',affinity:entry?.affinityChoice&&school.name===s.fields.f_school?s.fields.f_schoolAffinity||'':entry?.affinity||'',deficiency:entry?.elementDeficiencyChoice&&school.name===s.fields.f_school?(s.fields.f_schoolDeficiencyElement||'')+(s.fields.f_schoolDeficiencyElement&&entry.elementDeficiencyExcludesKeyword?' (except '+entry.elementDeficiencyExcludesKeyword+')':''):entry?.deficiency||''};
      });
      return JSON.parse(JSON.stringify(s));
    };
    api.download=result=>{
      const url=URL.createObjectURL(new Blob([result.bytes],{type:'application/pdf'})),a=document.createElement('a');
      a.href=url;a.download=result.filename;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    };
    api.exportCurrent=async id=>{
      if(!api.enabled()||currentId!==id)return false;
      setStatus('Creating character-sheet PDF…');
      try{
        const snapshot=api.snapshot();
        const result=await PX7Writer.generate(snapshot);
        if(currentId!==id){setStatus('PDF cancelled because the selected character changed.');return false;}
        api.download(result);setStatus('PDF ready: '+result.pages+' pages.');return true;
      }catch(error){setStatus('PDF export failed: '+error.message);console.error(error);return false;}
    };
    return api;
  })();
