  // BUGFIX PX7: printable values and page selection, independent of the DOM and PDF library.
  const TEMPLATE_PDF_ENABLED = true;
  const PX7Logic = (() => {
    const text = value => String(value ?? '').normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
    const chunks = (items, size) => Array.from({length:Math.ceil(items.length/size)}, (_,i) => items.slice(i*size,(i+1)*size));
    const filename = name => (text(name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/g,'').slice(0,100) || 'Character') + '.pdf';
    function plan(s){
      const f=s.fields, m={}, pages=[{template:'all',values:m}], extra=[];
      const note=(label,value)=>{if(text(value).trim())extra.push({label,text:text(value)});};
      const map={NAME:'name',CLAN:'clan',SCHOOL:'school',RANK:'insightRank',INSIGHT:'insightPts',GENDER:'gender',AGE:'age',HEIGHT:'height',WEIGHT:'weight',HAIR:'hair',EYES:'eyes',FATHER:'father',MOTHER:'mother',BROTHERS:'brothers',SISTERS:'sisters',SPOUSE:'spouse','MARITAL STATUS':'maritalStatus',TN_BASE:'baseTN',TN_CUR:'currentTN',ARMOR_TYPE:'armorName',ARMOR_TN:'armorTN',ARMOR_RD:'armorRed',INITIATIVE_CUR:'initiative',KOKU:'koku',BU:'bu',ZENI:'zeni'};
      Object.entries(map).forEach(([key,value])=>{m[key]=text(f['f_'+value]);});
      m.EXP=text(f.f_xpSpent)+' / '+text(f.f_xpTotal);
      Object.entries(s.rings).forEach(([key,value])=>m[key.toUpperCase()]=text(value));
      Object.entries(s.traits).forEach(([key,value])=>m[key.toUpperCase()]=text(value));
      ['honor','glory','status','taint'].forEach(key=>{
        const state=s.social[key]; if(!state)return;
        m[key.toUpperCase()]=text(state.rank);
        for(let i=1;i<=9;i++)m[key.toUpperCase()+'_DOT.'+i]=i<=state.points%10;
        if(state.points>=10)note(key==='glory'?'Glory awaiting recognition':'Status awaiting recognition','Approved Rank '+state.rank+'; '+state.points+' points. Dots show the remainder; Rank has not been promoted.');
      });
      s.wounds.forEach((value,i)=>m[['HEALTHY','NICKED','GRAZED','HURT','INJURED','CRIPPLED','DOWN','OUT'][i]]=text(value));
      const skills=(rows,values)=>rows.forEach((r,i)=>{
        const n=i+1; Object.entries({NAME:r.name,RANK:r.rank,TRAIT:r.trait,ROLL:r.pool,EMPH_MA:r.emph,IS_SCHOOL:r.school}).forEach(([k,v])=>values['SKILL_'+k+'.'+n]=v);
      });
      skills(s.skills.slice(0,23),m);
      chunks(s.skills.slice(23),37).forEach(rows=>{const values={};skills(rows,values);pages.push({template:'skill',values});});
      ['adv','disadv'].forEach((key)=>{
        const prefix=key==='adv'?'ADVANTAGE':'DISADVANTAGE';
        s[key].forEach((r,i)=>{
          if(i<17){m[prefix+'_NM.'+(i+1)]=r.name;m[prefix+'_PT.'+(i+1)]=text(r.cost);}
          if(i>=17||r.desc)note(prefix+': '+r.name,'Points: '+text(r.cost)+(r.desc?'\n'+r.desc:''));
        });
      });
      s.weapons.slice(0,2).forEach((r,i)=>Object.entries({TYPE:r.name,ATK:r.roll,DMG:r.dmg,NOTES:r.notes}).forEach(([k,v])=>m['WEAP_'+k+'.'+(i+1)]=v));
      chunks(s.weapons.slice(2),10).forEach(rows=>{const values={};rows.forEach((r,i)=>Object.entries({TYPE:r.name,ATK:r.roll,DMG:r.dmg,NOTES:r.notes}).forEach(([k,v])=>values['WEAPON.'+k+'.'+i]=v));pages.push({template:'weapons',values});});
      const equipmentSlots=[];[18,18,15].forEach((count,col)=>{for(let row=0;row<count;row++)equipmentSlots.push('EQUIP_LINE.'+row+'.'+col);});
      s.equip.forEach((r,i)=>{const value=r.name+' x'+r.qty+(r.notes?' - '+r.notes:'');if(i<equipmentSlots.length)m[equipmentSlots[i]]=value;else note('Equipment',value);});
      const groups=new Map(), kata=[],kiho=[],spells=[];
      s.tech.forEach(r=>{
        const school=text(r.desc).match(/^\[School Technique\s*[—-]\s*Rank (\d+), (.+?)\]/i);
        if(school){const name=school[2];if(!groups.has(name))groups.set(name,[]);groups.get(name).push({...r,rank:Number(school[1]),desc:r.desc.slice(school[0].length).trim()});}
        else if(/^\[Kata\s*[—-]/i.test(r.desc))kata.push(r);
        else if(/^\[Kiho\s*[—-]/i.test(r.desc))kiho.push(r);
        else if(r.spellElement||/^\[Spell\s*[—-]/i.test(r.desc))spells.push(r);
        else note('Ability: '+r.name,r.desc||'Recorded ability; no description.');
      });
      groups.forEach((tech,name)=>{
        const school=s.schools.find(x=>x.name===name),kind=school?.kind||'courtier',values={};
        if(kind==='shugenja'){
          values['SCHOOL_NM.1']=name;values['AFFINITY.1']=school.affinity;values['DEFICIENCY.1']=school.deficiency;values['SCHOOL_TECH.1']=tech.map(t=>t.name+'\n'+t.desc).join('\n\n');
        }else if(kind==='monk'){
          values['MONK_SCHOOL.1']=name;values['MONK_TECH.1']=tech.map(t=>t.name).join('; ');values['MONK_TECH_DESC.1.1']=tech.map(t=>t.desc).join('\n\n');
        }else{
          values['BUSHI_SCHOOL_NM.0']=name;
          const used=new Set();tech.forEach(t=>{if(t.rank>=1&&t.rank<=5&&!used.has(t.rank)){used.add(t.rank);values['BUSHI_TECH.'+(t.rank-1)+'.0']=t.name;values['BUSHI_TECH_TEXT.'+(t.rank-1)+'.0']=t.desc;}else note(name+': '+t.name,t.desc);});
        }
        pages.push({template:kind,values});
      });
      chunks(kata,6).forEach(rows=>{const values={};rows.forEach((r,i)=>{values['KATA_NM.'+(i+1)]=r.name;values['KATA_RING_MA.'+(i+1)]=(r.desc.match(/^\[Kata\s*[—-]\s*([^\]]+)\]/i)||[])[1]||'';note('Kata: '+r.name,r.desc);});pages.push({template:'bushi',values});});
      chunks(kiho,12).forEach(rows=>{const values={};rows.forEach((r,i)=>{const n=i+1,meta=(r.desc.match(/^\[Kiho\s*[—-]\s*(\w+)\s+(\d+),\s*([^\]]+)/i)||[]);values['KIHO_NM.'+n]=r.name;values['KIHO_ELEM.'+n]=meta[1]||'';values['KIHO_MASTERY.'+n]=meta[2]||'';values['KIHO_TYPE.'+n]=meta[3]||'';note('Kiho: '+r.name,r.desc);});pages.push({template:'monk',values});});
      chunks(spells,6).forEach(rows=>{const values={};rows.forEach((r,i)=>{const n='.2.'+(i+1);Object.entries({NM:r.name,ELEM:r.spellElement,MASTERY:r.spellMastery,TAGS:r.spellKeywords,EFFECT:r.desc}).forEach(([k,v])=>values['SPELL_'+k+n]=v||'');});pages.push({template:'spells',values});});
      note('Family',f.f_family);note('Void points currently available',s.voidCurrent);note('Wounds taken',f.f_woundsTaken);
      ['appearance','personality','history','notes'].forEach(key=>note(key[0].toUpperCase()+key.slice(1),f['f_'+key]));
      m.MISCELLANEOUS='Snapshot of current character. Skill pools are base pools; declare situational modifiers when rolling. XP: spent / total awarded. Wound totals use the app settings, which may differ from the preprinted formula. See continuation pages for ability details and notes.';
      return {name:text(f.f_name)||'Character',pages,extra};
    }
    return {text,chunks,filename,plan};
  })();
