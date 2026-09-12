  // PART I FEATURE 4.52 — Disadvantage configuration and persistence adapter.
  // This entire fragment is removable. It wraps existing entry points without changing
  // their source or adding a modifier-registry seat. Optional behaviours install below.
  const DISADV_CONFIG_ENABLED = true;
  const D45 = (function(){
    // Authoritative Social Skill list supplied by the player. Antisocial applies its
    // configured −1k0/−1k1 penalty only to these seven skills; keep the list local to
    // the ring-fenced Disadvantage contributor so future list changes cannot affect
    // unrelated roll modifiers.
    const SOCIAL_SKILLS = Object.freeze([
      'Acting','Courtier','Etiquette','Perform','Sincerity','Intimidation','Temptation'
    ]);
    const api = { socialSkills:SOCIAL_SKILLS, modules:{}, rollContext:null };
    // Point-release save contract.  The older persistence fragment still understands the
    // version-2 core shape; this adapter writes/reads version 3 and deliberately downgrades
    // only the migrated payload passed to that legacy loader.  Keeping the public version here
    // makes the bump explicit without editing (and therefore coupling removal to) an earlier
    // phase's production fragment.
    api.SAVE_SCHEMA_VERSION = 3;
    api.LEGACY_SCHEMA_VERSION = 2;
    api.enabled = () => DISADV_CONFIG_ENABLED && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED;
    const norm = s => String(s || '').trim().toLowerCase();
    const value = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const integer = (n, min) => (typeof n === 'number' || typeof n === 'string') && /^\d+$/.test(String(n)) && Number.isSafeInteger(Number(n)) && Number(n) >= min;
    api.integer = integer;
    api.state = function(){
      const schools = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      const schoolSkills = new Set();
      schools.forEach(s => schoolConcreteSkillNames(s.name).forEach(n => schoolSkills.add(n)));
      document.querySelectorAll('#skillsBody tr').forEach(row => {
        if(row.querySelector('.sk-school')?.checked) schoolSkills.add(row.querySelector('.sk-name').value.trim());
      });
      return { clan:value('f_clan').trim(), status:value('f_statusRank'),
        ninja:schools.some(s => /\bninja\b/i.test(s.name)),
        shugenja:typeof characterCasterLock === 'function' && characterCasterLock() === 'shugenja',
        deficiency:value('f_schoolDeficiencyElement'), schoolSkills:Array.from(schoolSkills).filter(Boolean).sort() };
    };
    api.skills = () => Array.from(new Set(SKILL_LIBRARY.map(s=>s.name).concat(
      Array.from(document.querySelectorAll('#skillsBody .sk-name')).map(el=>el.value.trim())))).filter(Boolean).sort();
    const consumed = {
      Control:{cost:4, note:'−1k1 to all Etiquette and Sincerity rolls.'},
      Determination:{cost:6, note:'You cannot spend Void Points to enhance die rolls. Other Void expenditures remain available.'},
      Insight:{cost:4, note:'Whenever you use the chosen School Skill, make a Willpower Trait Roll at TN 20 or become lost in reverie. Pain, loud noise, shaking, or similar intervention can snap you out of it.'},
      Knowledge:{cost:4, note:'When you encounter a topic, area of research, or new idea, make a Willpower Trait Roll at TN 25 or decide to study it.'},
      Perfection:{cost:5, note:'Every Skill or Spell Casting Roll requires one extra Raise for no effect, or automatically fails.'},
      Strength:{cost:5, note:'Called Shot, Feint, and Disarm require one extra Raise for no effect. −1k0 to Etiquette rolls.'},
      Will:{cost:4, note:'−1k1 to all Courtier and Temptation Skill Rolls.'}
    };
    const bushido = {
      Compassion:{cost:3, note:'Spend a Void Point before acting on behalf of someone of lower Status or social caste.'},
      Courage:{cost:4, note:'When facing an opponent of higher Glory or Status, or a Shadowlands opponent, all your roll TNs increase by 5. Apply this situational increase at the table.'},
      Courtesy:{cost:4, note:'A Social Skill Roll to apologize or avoid giving offense requires one Raise for no effect, or automatically fails.'},
      Duty:{cost:6, note:'You cannot spend Void Points to negate Wounds.'},
      Honesty:{cost:3, note:'You cannot spend Void Points on a Sincerity Skill Roll to which the Honesty emphasis could apply, whether or not you have that emphasis. Declare this situation at the table.'},
      Honor:{cost:3, note:'You cannot add your Honor Rank to a roll to resist Intimidation or Temptation.'},
      Sincerity:{cost:4, note:'A Sincerity roll to convince someone requires one extra Raise for no effect, or automatically fails.'}
    };
    api.tenets = {Consumed:consumed, 'Failure of Bushido':bushido};
    const definitions = {
      Antisocial:{type:'tierPick', tiers:[2,4]},
      Blackmailed:{type:'statusLinked'},
      'Cast Out':{type:'tierPick', tiers:[1,3]},
      Compulsion:{type:'tierPick', tiers:[2,3,4]},
      Consumed:{type:'tenetPick', tenets:consumed},
      'Elemental Imbalance':{type:'elementPick'},
      'Enlightened Madness':{type:'targetPick'},
      'Failure of Bushido':{type:'tenetPick', tenets:bushido},
      Obligation:{type:'tierPick', tiers:[3,6]}
    };
    api.definitions = definitions;
    // The point-release schema is deliberately explicit about the shapes it accepts.  Keeping
    // this list public makes migration/QA able to distinguish a future configuration from a
    // malformed one without relying on a silent fallback in the resolver.
    api.configTypes = Object.freeze([
      // Point-release Disadvantage shapes.
      'tierPick','rankPick','elementPick','tenetPick','targetPick','insightDifferencePick','toggleModifier','statusLinked',
      // Existing Phase 4.5 Advantage shapes exposed here for migration/QA introspection.
      'dualTierPick','languagePick','skillPick','clanWeaponAutoPick'
    ]);
    api.install = (name, definition) => { definitions[name] = definition; };
    api.schema = name => {
      if(!api.enabled()) return null;
      const canonical = Object.keys(definitions).find(n=>norm(n)===norm(name));
      return canonical ? Object.assign({name:canonical, d45:true, effect:'disadvConfig', title:'Configure '+canonical, prompt:'Choose '+canonical+' configuration'}, definitions[canonical]) : null;
    };
    api.complete = function(s, c){
      if(!s || !c || Array.isArray(c) || s.type!==c.type) return false;
      if(s.validate) return s.validate(c);
      if(s.type==='tierPick') return integer(c.tier,1) && s.tiers.includes(Number(c.tier));
      if(s.type==='rankPick') return integer(c.rank,1) && (!s.ranks || s.ranks.includes(Number(c.rank)));
      if(s.type==='statusLinked') return c.value==='Status';
      if(s.type==='tenetPick') return Object.hasOwn(s.tenets,c.tenet) &&
        (s.name!=='Consumed' || c.tenet!=='Insight' || typeof c.skill==='string' && !!c.skill.trim());
      if(s.type==='elementPick') return integer(c.rank,1) && Number.isSafeInteger(15+5*Number(c.rank)) && RINGS.some(r=>r.name===c.element);
      if(s.type==='targetPick') return [4,6].includes(Number(c.tier)) && ['Ring','Skill','Tattoo'].includes(c.targetType) &&
        typeof c.target==='string' && !!c.target.trim() && (c.targetType!=='Ring' || RINGS.some(r=>r.name===c.target) || c.target==='Void');
      return false;
    };
    api.problem = function(s,c,state){
      if(!api.complete(s,c)) return c ? 'Unknown or incomplete configuration — choose again.' : 'Needs a choice';
      if(s.name==='Blackmailed' && !integer(state.status,0)) return 'Enter a valid Status Rank.';
      if(s.name==='Elemental Imbalance'){
        if(!state.shugenja) return 'Requires a Shugenja School.';
        if(norm(state.deficiency)===norm(c.element)) return 'This element is deficient — choose another element.';
      }
      if(s.name==='Consumed' && c.tenet==='Insight' && !state.schoolSkills.includes(c.skill)) return 'Choose one of your School Skills.';
      if(s.name==='Enlightened Madness' && c.targetType==='Skill' && !api.skills().includes(c.target)) return 'Unknown Skill — choose a current Skill.';
      return '';
    };
    api.resolve = function(name,c){
      const s=api.schema(name), state=api.state();
      if(!s || api.problem(s,c,state)) return null;
      let cost, summary='', more={};
      if(s.resolve) return Object.assign({effect:'disadvConfig',name:s.name},s.resolve(c,state));
      if(s.type==='tierPick') cost=Number(c.tier);
      if(s.name==='Antisocial'){
      cost+=norm(state.clan)==='crab'?1:0;
        more={tier:Number(c.tier)};
        summary=(Number(c.tier)===2?'−1k0':'−1k1')+' to Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, and Temptation rolls.';
      } else if(s.name==='Blackmailed'){
        cost=Number(state.status); summary='Status-linked refund: current Status Rank '+cost+'.';
      } else if(s.name==='Cast Out') summary=(cost===1?'One temple':'A major Brotherhood sect')+' — its monks treat your Glory Rank as Infamy.';
      else if(s.name==='Compulsion'){
        more.tn=15+5*(cost-2);
        summary='To resist your compulsion: Willpower Trait Roll, TN '+more.tn+'. TN 15 at 2 points; +5 per additional point, maximum TN 25 at 4 points. The player decides when this applies.';
      } else if(s.type==='tenetPick'){
        const tenet=s.tenets[c.tenet]; cost=tenet.cost;
        if(s.name==='Consumed'){
          if(c.tenet==='Perfection' && norm(state.clan)==='crane') cost=6;
          else if(norm(state.clan)==='spider') cost+=1;
        } else if(state.ninja) cost+=1;
        more={tenet:c.tenet,skill:c.skill||''};
        summary=c.tenet+(c.skill?' — '+c.skill:'')+': '+tenet.note;
      } else if(s.name==='Elemental Imbalance'){
        cost=2*Number(c.rank); more={rank:Number(c.rank),element:c.element,tn:15+5*Number(c.rank)};
        summary=c.element+' — Rank '+more.rank+'; before casting: Willpower TN '+more.tn+'. Failure is reported to the GM; the spell still proceeds.';
      } else if(s.name==='Enlightened Madness'){
        cost=Number(c.tier); more={tn:cost===4?20:30,targetType:c.targetType,target:c.target};
        summary=c.targetType+': '+c.target+' — Willpower TN '+more.tn+'. Failure cancels the action; GM control for eight hours.';
        if(c.targetType==='Tattoo') summary+=' Tattoo automation is not yet available; use the manual check.';
      } else if(s.name==='Obligation') summary=cost===3?'Minor obligation — narrative reminder.':'Major obligation — narrative reminder.';
      return Object.assign({effect:'disadvConfig',name:s.name,cost,summary},more);
    };
    api.active = function(name){
      if(!api.enabled()) return [];
      return Array.from(document.querySelectorAll('#disadvList .entry')).map(div=>{
        const n=div.querySelector('.en-name')?.value, config=readAdvConfig(div);
        return {div,config,effect:api.resolve(n,config)};
      }).filter(item=>item.effect && (!name || norm(item.effect.name)===norm(name)));
    };
    api.modifiers = function(ctx){
      if(!api.enabled() || !ADV_CONFIG_ROLL_EFFECTS_ENABLED || !ctx || ctx.kind===ROLL_KINDS.DAMAGE) return [];
      const out=[], skill=norm(ctx.skillName), skillRoll=[ROLL_KINDS.SKILL,ROLL_KINDS.ATTACK].includes(ctx.kind);
      const info=(e,display)=>out.push({source:'adv-config',label:e.name,informational:true,display, note:e.summary});
      const dice=(e,kept)=>out.push({source:'adv-config',label:e.name,rolledDelta:-1,keptDelta:kept,note:e.tenet||'Social Skill penalty'});
      api.active().forEach(({effect:e})=>{
        if(e.name==='Antisocial' && skillRoll && Array.isArray(api.socialSkills) && api.socialSkills.some(s=>norm(s)===skill)) dice(e,e.tier===4?-1:0);
        if(e.name==='Consumed'){
          if(e.tenet==='Control' && skillRoll && ['etiquette','sincerity'].includes(skill)) dice(e,-1);
          else if(e.tenet==='Strength' && skillRoll && skill==='etiquette') dice(e,0);
          else if(e.tenet==='Will' && skillRoll && ['courtier','temptation'].includes(skill)) dice(e,-1);
          if(e.tenet==='Perfection' && (skillRoll || ctx.kind===ROLL_KINDS.SPELL)) info(e,'Required extra Raise for no effect');
          if(e.tenet==='Insight' && skillRoll && skill===norm(e.skill)) info(e,'Willpower TN 20 or become lost in reverie');
          if(e.tenet==='Knowledge') info(e,e.summary);
          if(e.tenet==='Strength' && ctx.kind===ROLL_KINDS.ATTACK) info(e,'Called Shot / Feint / Disarm: required extra Raise');
        }
        if(e.name==='Failure of Bushido'){
          if(['Compassion','Courage','Honor'].includes(e.tenet) || e.tenet==='Courtesy' && skillRoll ||
            ['Honesty','Sincerity'].includes(e.tenet) && skillRoll && skill==='sincerity') info(e,'Conditional rule — '+e.tenet);
        }
        if(e.name==='Cast Out') info(e,'Monks of the named sect treat Glory as Infamy.');
        if(e.name==='Compulsion') info(e,e.summary);
      });
      Object.values(api.modules).forEach(m=>{ if(m.modifiers) out.push(...m.modifiers(ctx)); });
      return out;
    };
    api.voidReason = function(key,ctx){
      if(!api.enabled()) return '';
      for(const module of Object.values(api.modules)){
        const reason=module.voidReason?.(key,ctx); if(reason) return reason;
      }
      if(['k1','skill'].includes(key) && api.active('Consumed').some(i=>i.effect.tenet==='Determination')) return 'Consumed — Determination prevents enhancing die rolls with Void.';
      if(key==='damage' && api.active('Failure of Bushido').some(i=>i.effect.tenet==='Duty')) return 'Failure of Bushido — Duty prevents spending Void to negate Wounds.';
      return '';
    };
    const make=(tag,cls,text)=>{const el=document.createElement(tag); if(cls)el.className=cls; if(text!==undefined)el.textContent=text; return el;};
    api.toggle = function(div,row,c,field,label){
      const wrap=make('label','d45-toggle-label'), input=make('input','d45-toggle');
      input.type='checkbox'; input.checked=c[field]===true; input.dataset.d45Toggle=field;
      input.addEventListener('change',()=>{const next=Object.assign({},readAdvConfig(div),{[field]:input.checked});writeAdvConfig(div,next.type,next);recalcAll();renderVoidPanel();});
      wrap.append(input,document.createTextNode(label));row.appendChild(wrap);
    };
    api.refresh = function(div,s){
      let c=readAdvConfig(div);
      if(s.name==='Blackmailed' && !c){ c={type:'statusLinked',value:'Status'}; writeAdvConfig(div,c.type,c); }
      const wrong=div.parentElement?.id!=='disadvList';
      const problem=wrong?'This entry belongs in Disadvantages.':api.problem(s,c,api.state());
      const e=problem?null:api.resolve(s.name,c), row=advConfigRowFor(div);
      row.className='adv-config-row d45-row '+(e?'configured':'unconfigured');row.innerHTML='';
      const cost=div.querySelector('.en-cost'); if(cost)cost.value=e?e.cost:0;
      const text=make('span',e?'d45-summary':'adv-config-warn',e?e.summary+' Refund: '+e.cost+' XP.':problem);
      text.title=e?e.summary:problem; row.appendChild(text);
      if(!wrong && s.type!=='statusLinked'){
        const btn=make('button','ghost adv-config-btn',e?'Change':'Choose…');btn.type='button';btn.onclick=()=>api.open(div,s);row.appendChild(btn);
      }
      if(e && s.decorate) s.decorate(div,row,c,e);
      if(e && e.name==='Enlightened Madness' && e.targetType==='Tattoo' && api.gates?.checkTattoo){
        const btn=make('button','ghost d45-tattoo-check','Check tattoo use'); btn.type='button';
        btn.onclick=()=>api.gates.checkTattoo(e.target);row.appendChild(btn);
      }
    };
    let modal=null;
    api.modalState=()=>modal?{name:modal.s.name,index:modal.index,fields:modal.steps.map(s=>s.field)}:null;
    api.steps = function(s,c){
      const tier=(tiers)=>({field:'tier',label:'XP refund',options:tiers.map(n=>({value:String(n),label:n+' XP'+(s.name==='Antisocial' && norm(api.state().clan)==='crab'?' (Crab: '+(n+1)+' XP)':'')}))});
      if(s.steps)return s.steps(c);
      if(s.type==='tierPick')return [tier(s.tiers)];
      if(s.type==='rankPick')return [{field:'rank',label:'Choose a rank',options:(s.ranks||[]).map(n=>({value:String(n),label:'Rank '+n}))}];
      if(s.type==='tenetPick'){
        const steps=[{field:'tenet',label:'Choose a tenet',options:Object.entries(s.tenets).map(([name,t])=>({value:name,label:name+' — '+(s.name==='Consumed'?(name==='Perfection'&&norm(api.state().clan)==='crane'?6:t.cost+(norm(api.state().clan)==='spider'?1:0)):t.cost+(api.state().ninja?1:0))+' XP',note:t.note}))}];
        if(s.name==='Consumed' && c.tenet==='Insight')steps.push({field:'skill',label:'Choose one of your School Skills',options:api.state().schoolSkills.map(n=>({value:n,label:n}))});
        return steps;
      }
      if(s.type==='elementPick')return [{field:'rank',label:'Rank — 2 XP refunded per rank',number:true,min:1},
        {field:'element',label:'Choose a non-deficient element',options:RINGS.map(r=>({value:r.name,label:r.name,disabled:norm(api.state().deficiency)===norm(r.name)}))}];
      if(s.type==='targetPick')return [tier([4,6]),{field:'targetType',label:'Choose the affected kind',options:['Ring','Skill','Tattoo'].map(n=>({value:n,label:n}))},
        c.targetType==='Tattoo'?{field:'target',label:'Name your tattoo (manual acknowledgement; tattoo automation is not yet available)',text:true}:
        {field:'target',label:'Choose the affected '+(c.targetType||'Ring'),options:(c.targetType==='Skill'?api.skills():RINGS.map(r=>r.name).concat('Void')).map(n=>({value:n,label:n}))}];
      return [];
    };
    api.open=function(div,s){
      if(!api.enabled())return;
      closeAdvConfigModal();
      if(s.name==='Elemental Imbalance'&&!api.state().shugenja){appAlert('Only Shugenja may take Elemental Imbalance. Apply a Shugenja School first.');return;}
      modal={div,s,c:Object.assign({},readAdvConfig(div)||{}),index:0,focus:document.activeElement};
      advConfigTargetEntry=div;
      api.renderModal();
    };
    api.close=function(){
      const focus=modal?.focus; modal=null;
      document.getElementById('d45-back')?.remove();
      document.getElementById('advConfigConfirm').textContent='Confirm';
      document.getElementById('advConfigModalOverlay').classList.remove('d45-modal');
      if(focus?.isConnected) focus.focus({preventScroll:true});
    };
    api.renderModal=function(){
      if(!modal)return;
      const {s,c}=modal;
      modal.steps=api.steps(s,c); const step=modal.steps[modal.index];
      if(!step){
        // A malformed saved configuration must never leave an open modal throwing from its
        // renderer. Preserve the payload for the unconfigured warning and close this attempt.
        console.warn('D45 modal has no valid step', s.name, modal.index, modal.steps.length);
        api.close();
        const overlay=document.getElementById('advConfigModalOverlay');
        if(overlay) overlay.style.display='none';
        advConfigTargetEntry=null;
        return;
      }
      const overlay=document.getElementById('advConfigModalOverlay'), grid=document.getElementById('advConfigGrid');
      overlay.classList.add('d45-modal'); overlay.style.display='flex';grid.innerHTML='';
      document.getElementById('advConfigTitle').textContent=s.name;
      document.getElementById('advConfigSubtitle').textContent=step.label+' — step '+(modal.index+1)+' of '+modal.steps.length;
      const note=document.getElementById('advConfigNote');note.style.display='';note.textContent=step.note||'';
      if(step.options){
        step.options.forEach((opt,i)=>{
          // Keep the universal picker's item/label nesting so the existing Phase 4.5
          // geometry harness can measure both nodes. The input remains a real form control;
          // the outer tile is only the visual/state wrapper.
          const item=make('div','affinity-pick-item d45-option');item.dataset.d45Option=opt.value;
          const input=make('input');input.type='radio';input.name='d45-choice';input.value=opt.value;input.id='d45-option-'+i;
          input.dataset.d45Field=step.field;input.checked=String(c[step.field])===opt.value;input.disabled=!!opt.disabled;
          if(input.checked)item.classList.add('checked');if(input.disabled)item.classList.add('d45-disabled');
          input.onchange=()=>{grid.querySelectorAll('.d45-option').forEach(e=>e.classList.remove('checked'));item.classList.add('checked');};
          const label=make('label','d45-option-label'); label.htmlFor=input.id;
          label.append(input,make('span','',opt.label)); item.appendChild(label);
          if(opt.note){const details=make('details','d45-tooltip');details.append(make('summary','','Rule'),make('span','',opt.note));item.title=opt.note;item.appendChild(details);}
          grid.appendChild(item);
        });
        if(!step.options.length)note.textContent='No School Skills are available. Apply your School and record its chosen School Skills first.';
      } else {
        const label=make('label','d45-input-label',step.label), input=make('input');
        input.type=step.check?'checkbox':step.number?'number':'text';input.id='d45-'+step.field;input.dataset.d45Field=step.field;
        if(step.check)input.checked=c[step.field]===true;else input.value=c[step.field]===undefined?'':String(c[step.field]);
        if(step.number){input.min=step.min;input.step='1';input.inputMode='numeric';}
        label.appendChild(input);grid.appendChild(label);
      }
      document.getElementById('d45-back')?.remove();
      const confirm=document.getElementById('advConfigConfirm');confirm.textContent=modal.index<modal.steps.length-1?'Next':'Confirm';
      // Insight adds its second stage only after its tenet has been chosen.
      if(s.name==='Consumed'&&step.field==='tenet')confirm.textContent='Next';
      if(modal.index){const back=make('button','ghost','Back');back.type='button';back.id='d45-back';back.onclick=()=>{api.readStep(false);modal.index--;api.renderModal();};confirm.before(back);}
      grid.querySelector('input:checked, input:not(:disabled)')?.focus({preventScroll:true});
    };
    api.readStep=function(required){
      if(!modal)return false;
      const step=modal.steps[modal.index],grid=document.getElementById('advConfigGrid');
      const input=step.options?grid.querySelector('input:checked'):grid.querySelector('input');
      const picked=step.check?!!input?.checked:input?.value.trim();
      const valid=step.check || (step.number?integer(picked,step.min)&&Number.isSafeInteger(15+5*Number(picked)):!!picked);
      if(!valid){if(required)document.getElementById('advConfigNote').textContent=step.number?'Enter a whole number of '+step.min+' or greater.':'Choose a value before continuing.';return false;}
      if(['tenet','targetType'].includes(step.field)&&modal.c[step.field]!==picked){delete modal.c.skill;delete modal.c.target;}
      modal.c[step.field]=step.number?Number(picked):picked;
      return true;
    };
    api.confirm=function(){
      if(!modal)return false;
      if(!api.readStep(true))return true;
      modal.steps=api.steps(modal.s,modal.c);
      if(modal.index<modal.steps.length-1){modal.index++;api.renderModal();return true;}
      const {div,s,c}=modal;c.type=s.type;
      if(c.tier!==undefined)c.tier=Number(c.tier);
      c.value=String(c.tenet||c.element||c.target||c.tier||('Rank '+c.rank));
      if(s.finalize)s.finalize(c);
      const issue=api.problem(s,c,api.state());
      if(issue){document.getElementById('advConfigNote').textContent=issue;return true;}
      writeAdvConfig(div,s.type,c);closeAdvConfigModal();recalcAll();setStatus(s.name+' configured.');return true;
    };
    api.migrate=function(data){
      const copy=JSON.parse(JSON.stringify(data));
      if(Number(copy.schemaVersion||1)<api.SAVE_SCHEMA_VERSION){
        [...(copy.adv||[]),...(copy.disadv||[])].forEach(e=>{
          const c=e.config;if(!c || c.type!=='severityTier')return;
          const name=norm(e.name);
          if(name==='antisocial'){
            const tier={'−1k0':2,'-1k0':2,'−1k1':4,'-1k1':4}[c.value];if(tier)e.config={type:'tierPick',tier,value:String(tier)};
          } else if(name==='cast out'){
            const tier={'One temple':1,'A major Brotherhood sect':3}[c.value];if(tier)e.config={type:'tierPick',tier,value:String(tier)};
          } else if(name==='enlightened madness'){
            const tier={'TN 20':4,'TN 30':6}[c.value];if(tier)e.config={type:'targetPick',tier,value:'',migrationNote:'Choose the affected Ring, Skill, or Tattoo.'};
          } else if(['luck','magic resistance'].includes(name)){
            const match=/^Rank ([1-3])$/.exec(c.value);if(match){const rank=Number(match[1]);e.config={type:'rankPick',rank,value:c.value};if(name==='luck')e.config.remaining=rank;}
          }
        });
      }
      copy.schemaVersion=api.SAVE_SCHEMA_VERSION;return copy;
    };
    return api;
  })();

  if(D45.enabled()){
    // All adapters are local to this fragment. Removing it restores the original bindings.
    const d45OldSchema=advConfigSchemaFor;
    advConfigSchemaFor=function(name){return D45.schema(name)||d45OldSchema(name);};
    const d45OldComplete=advConfigIsComplete;
    advConfigIsComplete=function(s,c){return s?.d45?D45.complete(s,c):d45OldComplete(s,c);};
    const d45OldResolve=resolveAdvDisadvEffect;
    resolveAdvDisadvEffect=function(name,c){return D45.schema(name)?D45.resolve(name,c):d45OldResolve(name,c);};
    const d45OldRefresh=refreshAdvConfigControl;
    refreshAdvConfigControl=function(div){
      const name=div.querySelector('.en-name')?.value,s=D45.schema(name);
      if(s){D45.refresh(div,s);return;}
      d45OldRefresh(div);
    };
    const d45OldOpen=openExtendedAdvConfigModal;
    openExtendedAdvConfigModal=function(div,s){if(s?.d45){D45.open(div,s);return true;}return d45OldOpen(div,s);};
    const d45OldConfirm=confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal=function(){return D45.confirm()||d45OldConfirm();};
    const d45OldClose=closeExtendedAdvConfigModal;
    closeExtendedAdvConfigModal=function(){D45.close();return d45OldClose();};
    const d45OldModifiers=advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers=function(ctx){return (d45OldModifiers(ctx)||[]).concat(D45.modifiers(ctx));};
    const d45OldRecalc=recalcAll;
    let d45Recalculating=false;
    recalcAll=function(){
      if(d45Recalculating)return;
      d45Recalculating=true;
      try{refreshAllAdvConfigControls();return d45OldRecalc();}finally{d45Recalculating=false;}
    };
    const d45OldCanVoid=canSpendVoid;
    canSpendVoid=function(key){const reason=D45.voidReason(key,D45.rollContext);return reason?{ok:false,reason}:d45OldCanVoid(key);};
    const d45OldGetModifiers=getPreRollModifiers;
    getPreRollModifiers=function(ctx){
      return d45OldGetModifiers(ctx).filter(m=>m.source!=='void'||!D45.voidReason(/Skill/.test(m.label)?'skill':'k1',ctx));
    };
    if(typeof showRollPreview==='function'){
      const d45OldPreview=showRollPreview;
      showRollPreview=async function(req){const saved=D45.rollContext;D45.rollContext=req.context;try{return await d45OldPreview(req);}finally{D45.rollContext=saved;}};
    }
    const d45OldCollect=collectData;
    collectData=function(){const data=d45OldCollect();data.schemaVersion=D45.SAVE_SCHEMA_VERSION;return data;};
    const d45OldApply=applyData;
    applyData=function(data){
      const version=data?.schemaVersion===undefined?1:Number(data.schemaVersion);
      if(!data||!Number.isInteger(version)||version<1||version>D45.SAVE_SCHEMA_VERSION){appAlert('Load refused — this sheet supports save formats 1 through '+D45.SAVE_SCHEMA_VERSION+'. Your current character has been preserved.');return false;}
      D45.gates?.reset?.();
      const migrated=D45.migrate(data);migrated.schemaVersion=D45.LEGACY_SCHEMA_VERSION;
      const result=d45OldApply(migrated);recalcAll();return result;
    };
    const d45OldReset=resetToBaseline;
    resetToBaseline=function(){D45.gates?.reset?.();return d45OldReset();};
    const d45OldInit=initAdvConfig;
    initAdvConfig=function(){
      d45OldInit();
      ['f_clan','f_statusRank','f_school','f_schoolsData','f_schoolDeficiencyElement'].forEach(id=>{
        const el=document.getElementById(id);if(el){el.addEventListener('input',recalcAll);el.addEventListener('change',recalcAll);}
      });
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&D45.modalState()){e.preventDefault();closeAdvConfigModal();}});
      if(window.__L5R_TEST__)Object.assign(window.__L5R_TEST__,{D45});
    };
  }
