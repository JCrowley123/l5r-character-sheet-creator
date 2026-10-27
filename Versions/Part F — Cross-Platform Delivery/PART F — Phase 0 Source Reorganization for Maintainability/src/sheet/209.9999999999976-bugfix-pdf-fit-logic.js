  // BUGFIX PF7: PDF layout rules, independent of the browser and document writer.
  const PDF_LAYOUT_REFINEMENTS_ENABLED = true;
  const PF7Logic = (()=>{
    const abbreviations={Awareness:'Aware',Reflexes:'Ref',Perception:'Perc',Intelligence:'Int',Willpower:'Will',Stamina:'Sta',Strength:'Str',Agility:'Agi',Void:'Void'};
    function plan(snapshot){
      const p=PX7Logic.plan(snapshot);
      p.pages[0].values.MISCELLANEOUS='';
      for(const section of p.pages)for(const key of Object.keys(section.values))if(/^SKILL_TRAIT\./.test(key))section.values[key]=abbreviations[section.values[key]]||section.values[key];
      // Use the frozen thresholds themselves so optional wound layers cannot leave a stale caption.
      const earth=Number(snapshot.rings.earth), wounds=snapshot.wounds.map(Number);
      p.woundMultiplier=earth>0?(wounds[1]-wounds[0])/earth:null;
      const healthy=earth>0?wounds[0]/earth:null;
      const regular=Number.isSafeInteger(healthy)&&healthy>0&&Number.isSafeInteger(p.woundMultiplier)&&p.woundMultiplier>0&&wounds.every((value,i)=>value===earth*(healthy+i*p.woundMultiplier));
      p.woundCaption=regular?'Healthy: Earth x'+healthy+'; each later level: Earth x'+p.woundMultiplier:'Wound thresholds follow the current sheet settings.';
  // BUGFIX PDA7 BEGIN appendix-plan
      if(typeof PDA7Logic === 'object' && PDA7Logic?.enabled()) PDA7Logic.amend(p,snapshot);
  // END PDA7 appendix-plan
      return p;
    }
    const lineFields=(template,fields)=>template==='bushi'?fields.filter(f=>/^(?:EXTRA_NOTES\.|BUSHI_SCHOOL_NM\.|BUSHI_TECH\.|KATA_(?:NM|RING_MA|DURATION)\.)/.test(f.name)):[];
    function label(key){
      const names={NAME:'Character name',SCHOOL:'School',EXP:'Experience',MISCELLANEOUS:'Miscellaneous'};
      if(names[key])return names[key];
      const match=key.match(/^SKILL_(NAME|TRAIT|EMPH_MA|ROLL|RANK)\.(\d+)$/);
      if(match)return 'Skill '+match[2]+' '+({NAME:'name',TRAIT:'Trait',EMPH_MA:'emphases and mastery',ROLL:'roll',RANK:'Rank'}[match[1]]);
      return key.replace(/BUSHI_TECH_TEXT/g,'School technique effect').replace(/BUSHI_TECH/g,'School technique').replace(/_/g,' ').replace(/\./g,' ');
    }
    return {plan,lineFields,label,abbreviations};
  })();
