'use strict';
// B18 mock-up characters: the inventory's test character (A03's dense Kuni Shugenja with the per-session entries:
// Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky and the Kuni Ancestor, its gift spent) and three
// small variants, each with only the entries one picture needs. Written to the output folder and opened by Import.
const {fs,path}=require('./common.cjs');
const INV=require('../inventory/fixtures.cjs');
const clone=o=>JSON.parse(JSON.stringify(o));
const FIX={
 // Everything the inventory read: G01, G02, G03, G04, G05, G08, G09, G10, G12, G14, G16.
 sessions(){const f=INV.sessions();f.fields.f_name='B18 mock-up';return f;},
 // G01 and G06: only the cards with a once-a-session button (Kharmic Tie, Luck, Dark Paragon, Great Destiny; Haunted,
 // Unlucky), so they sit together on a phone.
 resets(){const f=INV.sessions();f.fields.f_name='B18 resets';
  f.adv=f.adv.filter(a=>['Kharmic Tie','Luck','Dark Paragon','Great Destiny'].includes(a.name));
  f.disadv=f.disadv.filter(d=>['Haunted','Unlucky'].includes(d.name));return f;},
 // G02 and G12: the cards with Change or Choose… (Wealthy not yet chosen; Kharmic Tie, Luck and Dark Paragon chosen).
 changes(){const f=INV.sessions();f.fields.f_name='B18 changes';
  f.adv=f.adv.filter(a=>['Wealthy','Kharmic Tie','Luck','Dark Paragon'].includes(a.name));f.disadv=[];return f;},
 // The Imperial character with the Seppun Ancestor, whose gift has "Use it now" (G06), and Great Destiny's Use.
 imperial(){const f=INV.ancestorImperial();f.fields.f_name='B18 mock-up Imperial';return f;},
 // G07 and G11: Lost Love, Touch of the Void and Cursed by the Realm (Toshigoku) on their own.
 checks(){const f=INV.sessions();f.fields.f_name='B18 checks';f.adv=[];
  const lost=f.disadv.find(d=>d.name==='Lost Love');
  f.disadv=[clone(lost),{name:'Touch of the Void',cost:'3',desc:''},{name:'Cursed by the Realm',cost:'3',desc:'',config:{type:'realmPick',realm:'Toshigoku',value:'Toshigoku'}}];
  return f;},
 // G03 and G10: Darling of the Court with two courts (its window has "Add court" and a Remove per court).
 court(){const f=INV.sessions();f.fields.f_name='B18 court';f.disadv=[];
  f.adv=[{name:'Darling of the Court',cost:'4',desc:'',config:{type:'courtList',revision:1,courts:['Kyuden Doji','Otosan Uchi'],selected:'Kyuden Doji',inSession:false,value:'Kyuden Doji, Otosan Uchi'}}];
  return f;},
};
function write(out,key){const f=FIX[key]();const file=path.join(out,`b18-mock-${key}.l5r.json`);fs.writeFileSync(file,JSON.stringify(f));return {file,name:f.fields.f_name};}
module.exports={FIX,write};
