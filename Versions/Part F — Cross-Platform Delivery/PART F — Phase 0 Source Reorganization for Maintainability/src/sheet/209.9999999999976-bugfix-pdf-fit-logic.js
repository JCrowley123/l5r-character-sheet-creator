  // BUGFIX PF7: PDF layout rules, independent of the browser and document writer.
  const PDF_LAYOUT_REFINEMENTS_ENABLED = true;
  const PF7Logic = (()=>{
    const abbreviations={Awareness:'Aware',Reflexes:'Ref',Perception:'Perc',Intelligence:'Int',Willpower:'Will',Stamina:'Sta',Strength:'Str',Agility:'Agi',Void:'Void'};
    function plan(snapshot){
      const p=PX7Logic.plan(snapshot);
      p.pages[0].values.MISCELLANEOUS='';
      for(const section of p.pages)for(const key of Object.keys(section.values))if(/^SKILL_TRAIT\./.test(key))section.values[key]=abbreviations[section.values[key]]||section.values[key];
      p.woundMultiplier=Number(snapshot.fields.f_woundMultiplier)||2;
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
