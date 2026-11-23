'use strict';
// Group 2 (15b) test characters, each the audit's dense Kuni Shugenja (A03's `dense` fixture) with only the entries
// one finding needs. Written to the output folder and opened from the file, as a player would.
const {fs,path,DENSE}=require('./common.cjs');
const clone=o=>JSON.parse(JSON.stringify(o));
function base(name){const f=clone(DENSE);f.fields.f_name=name;return f;}
const pick=(list,names)=>names.map(n=>clone(list.find(e=>e.name===n)));
const FIX={
 // B01: the seven Disadvantages whose buttons Q8 renamed, as the dense character has them (Willpower 4, Perception 3).
 b01(){const f=base('G2 checks');
  f.disadv=pick(DENSE.disadv,['Brash','Overconfident','Can’t Lie','Contrary','Rumormonger','Soft-Hearted','Lost Love']);
  f.adv=[];return f;},
 // B01, the siblings: entries whose buttons are already named for what they do (Epilepsy, Lord Moon's Curse), and
 // Touch of the Void, whose button is the open B18 G11 question.
 b01sib(){const f=base('G2 check siblings');
  f.disadv=[{name:'Epilepsy',cost:'4',desc:''},pick(DENSE.disadv,['Lord Moon’s Curse'])[0],{name:'Touch of the Void',cost:'3',desc:''}];
  f.adv=[];return f;},
 // B03: Leadership as the dense character has it (School Rank 1), and Quick, its sibling on the same feature.
 b03(){const f=base('G2 leadership');
  f.adv=[pick(DENSE.adv,['Leadership'])[0],{name:'Quick',cost:'6',desc:''}];
  f.disadv=[];return f;},
 // B05: Touch of the Void alone (Willpower 4).
 b05(){const f=base('G2 touch of the void');f.adv=[];f.disadv=[{name:'Touch of the Void',cost:'3',desc:''}];return f;},
 // B05's sibling: Lord Moon's Curse at Medium (TN 20), the one other check whose success line is about keeping control.
 b05moon(){const f=base('G2 lord moon');f.adv=[];f.disadv=pick(DENSE.disadv,['Lord Moon’s Curse']);return f;},
 // B09: the dense character without its Intimidation row, so the Skills page's picker offers Intimidation.
 b09(){const f=base('G2 skill picker');f.skills=f.skills.filter(s=>s.name!=='Intimidation');return f;},
 // B09, the whole catalogue: the same character with no Skill rows, so the picker offers every Skill it lists.
 b09all(){const f=base('G2 skill picker all');f.skills=[];return f;},
};
function write(out,key){const f=FIX[key]();const file=path.join(out,`g2-${key}.l5r.json`);fs.writeFileSync(file,JSON.stringify(f));return {file,name:f.fields.f_name};}
module.exports={FIX,write};
