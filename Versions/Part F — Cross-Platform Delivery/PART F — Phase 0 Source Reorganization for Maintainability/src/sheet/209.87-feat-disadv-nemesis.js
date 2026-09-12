  // PART I FEATURE 4.522 — Sworn Enemy (independently removable).
  // Purchased Kharmic Nemesis and the situational "opposing this enemy" toggle are separate
  // fields. The former changes the refund; the latter changes Void availability only while on.
  const D45_NEMESIS_ENABLED = true;
  if(typeof D45 !== 'undefined' && D45_NEMESIS_ENABLED){
    const enemyDefinition = {
      type:'insightDifferencePick',
      title:'Configure Sworn Enemy',
      prompt:'Name the enemy, record the Insight Rank difference, and choose Kharmic Nemesis',
      note:'The basic refund is 3 XP. Add 1 XP for each Insight Rank above yours. Kharmic Nemesis adds 2 XP and prevents Void spending while the active toggle is on.',
      steps: function(){
        return [
          {field:'target', label:'Name your Sworn Enemy', text:true},
          {field:'difference', label:'Enemy Insight Rank difference (0 or more)', number:true, min:0},
          {field:'nemesis', label:'Purchase Kharmic Nemesis (+2 XP refund)', check:true}
        ];
      },
      validate: function(config){
        return !!config && config.type === 'insightDifferencePick' &&
          typeof config.target === 'string' && !!config.target.trim() &&
          D45.integer(config.difference,0) && typeof config.nemesis === 'boolean' &&
          typeof config.active === 'boolean' && (!config.active || config.nemesis);
      },
      finalize: function(config){
        config.target = String(config.target || '').trim();
        config.difference = Number(config.difference);
        config.nemesis = config.nemesis === true;
        config.active = config.nemesis && config.active === true;
      },
      decorate: function(div,row,config){
        row.classList.add('d45-nemesis-row');
        if(config.nemesis) D45.toggle(div,row,config,'active','Nemesis active / opposing this enemy');
      }
    };
    D45.install('Sworn Enemy', enemyDefinition);

    const enemyComplete = D45.complete;
    D45.complete = function(schema,config){
      if(schema && schema.name === 'Sworn Enemy') return !!enemyDefinition.validate(config);
      return enemyComplete(schema,config);
    };
    const enemyResolve = D45.resolve;
    D45.resolve = function(name,config){
      const schema = D45.schema(name);
      if(schema && schema.name === 'Sworn Enemy'){
        if(!enemyDefinition.validate(config)) return null;
        const difference = Number(config.difference), nemesis = config.nemesis === true;
        const cost = 3 + difference + (nemesis ? 2 : 0);
        return {
          effect:'disadvConfig', name:'Sworn Enemy', cost, target:String(config.target).trim(),
          difference, nemesis, active:nemesis && config.active === true,
          summary:'Sworn Enemy: '+String(config.target).trim()+' — Insight difference '+difference+
            '; refund '+cost+' XP'+(nemesis?' (Kharmic Nemesis +2).':'')
        };
      }
      return enemyResolve(name,config);
    };
    D45.modules.nemesis = {
      voidReason: function(){
        const active = D45.active('Sworn Enemy').find(function(item){ return item.effect.nemesis && item.effect.active; });
        return active ? 'Sworn Enemy — Kharmic Nemesis is active against '+active.effect.target+'; Void Points cannot be spent while opposing this enemy.' : '';
      }
    };
  }
