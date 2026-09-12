  // PART I FEATURE 4.521 — Phobia (independently removable).
  // This module owns only Phobia's schema extension, active toggle, and non-damage modifier.
  // It is deliberately reached through D45's extension table; deleting this fragment removes
  // the definition and module without changing the core Disadvantage resolver.
  const D45_PHOBIA_ENABLED = true;
  if(typeof D45 !== 'undefined' && D45_PHOBIA_ENABLED){
    const phobiaDefinition = {
      type:'toggleModifier',
      tiers:[1,2,3],
      title:'Choose a Phobia rank',
      prompt:'Choose the XP refund and rank of this Phobia',
      note:'When active/confronted, all supported roll target numbers increase by 5 per rank. Damage rolls are excluded by the player-companion scope.',
      steps: function(){
        return [{ field:'rank', label:'Choose Phobia rank', options:[1,2,3].map(function(rank){
          return { value:String(rank), label:rank+' XP refund (Rank '+rank+')' };
        }) }];
      },
      validate: function(config){
        return !!config && config.type === 'toggleModifier' &&
          [1,2,3].indexOf(Number(config.rank)) !== -1 &&
          typeof config.active === 'boolean';
      },
      finalize: function(config){
        config.rank = Number(config.rank);
        config.active = config.active === true;
      },
      decorate: function(div,row,config,effect){
        row.classList.add('d45-phobia-row');
        D45.toggle(div,row,config,'active','Active / confronted');
      }
    };
    D45.install('Phobia', phobiaDefinition);

    const phobiaComplete = D45.complete;
    D45.complete = function(schema,config){
      if(schema && schema.name === 'Phobia') return !!phobiaDefinition.validate(config);
      return phobiaComplete(schema,config);
    };
    const phobiaResolve = D45.resolve;
    D45.resolve = function(name,config){
      const schema = D45.schema(name);
      if(schema && schema.name === 'Phobia'){
        if(!phobiaDefinition.validate(config)) return null;
        const rank = Number(config.rank);
        return {
          effect:'disadvConfig', name:'Phobia', cost:rank, rank,
          active:config.active === true,
          summary:'Phobia Rank '+rank+' — when active/confronted, all supported roll TNs increase by '+(5*rank)+'; damage rolls are excluded.'
        };
      }
      return phobiaResolve(name,config);
    };
    D45.modules.phobia = {
      modifiers: function(context){
        if(!context || context.kind === ROLL_KINDS.DAMAGE) return [];
        return D45.active('Phobia').filter(function(item){ return item.effect.active; }).map(function(item){
          return {
            source:'adv-config', label:'Phobia', totalDelta:-(5 * item.effect.rank),
            note:'Active/confronted Phobia Rank '+item.effect.rank+' (TN +'+(5 * item.effect.rank)+')'
          };
        });
      }
    };
  }
