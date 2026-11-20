'use strict';
// Group 1 (15b) test characters, each the audit's dense Kuni Shugenja (A03's `dense` fixture) with only the entries
// one finding needs. Written to the output folder and opened from the file, as a player would.
const {fs,path,DENSE}=require('./common.cjs');
const clone=o=>JSON.parse(JSON.stringify(o));
function base(name){const f=clone(DENSE);f.fields.f_name=name;return f;}
const FIX={
 // A14: the owner's two-entry example of 8 October (4.5.29 check W2.3): Low Pain Threshold with Strength of the Earth,
 // the character Nicked. Earth 2. No other entry touches the Wounds.
 a14(){const f=base('G1 wounds');
  f.adv=[{name:'Strength of the Earth',cost:'3',desc:''}];
  f.disadv=[{name:'Low Pain Threshold',cost:'4',desc:''}];
  return f;},
 // B02: every price another entry changes, side by side: Blissful Betrothal (the Tie to the spouse), the dense
 // character's Social Position under it (6 → 4, saved as such), a Kharmic Tie Rank 3 (3 → 1) and Large at the Crab
 // price (Feature 4.5.25: 4 → 3).
 b02(){const f=base('G1 prices');
  const sp=f.adv.find(a=>a.name==='Social Position');
  f.adv=[{name:'Blissful Betrothal',cost:'3',desc:'',config:{type:'dsx4532',spouse:true}},sp,
   {name:'Kharmic Tie',cost:'3',desc:'',config:{type:'rankPick',value:'Rank 3',rank:3,target:'Aiko',remaining:3}},
   {name:'Large',cost:'3',desc:'',clanPrice:{n:'large',s:'fixed',v:3,b:'crab'}}];
  f.disadv=[];return f;},
 // B04: Blind alone (Reflexes 2: base 2 + 5 = 7).
 b04(){const f=base('G1 blind');f.adv=[];f.disadv=[{name:'Blind',cost:'6',desc:''}];return f;},
 // B14: Touch of the Spirit Realms (Jigoku), Lost, Taint Rank 4.
 // Kharmic Tie (owner, round 1): Rank 3, tied to Aiko, one use spent this session (2 of 3 left). No Blissful Betrothal.
 kt(){const f=base('G1 Kharmic Tie');
  f.adv=[{name:'Kharmic Tie',cost:'3',desc:'',config:{type:'rankPick',value:'Rank 3',rank:3,target:'Aiko',remaining:2}}];
  f.disadv=[];return f;},
 // Round 3: a long name at Rank 5, all uses left, to show the row on a phone when the badge needs the room.
 ktLong(){const f=FIX.kt();f.fields.f_name='G1 Kharmic Tie long';
  f.adv[0].cost='5';f.adv[0].config={type:'rankPick',value:'Rank 5',rank:5,target:'Kakita Yoshiko',remaining:5};return f;},
 b14(){const f=base('G1 jigoku');f.fields.f_taint='4.2';
  f.adv=[{name:'Touch of the Spirit Realms',cost:'5',desc:'',config:{type:'spiritRealmTouch',revision:1,value:'Jigoku',realm:'Jigoku',lost:true}}];
  f.disadv=[];return f;},
};
function write(out,key){const f=FIX[key]();const file=path.join(out,`g1-${key}.l5r.json`);fs.writeFileSync(file,JSON.stringify(f));return {file,name:f.fields.f_name};}
module.exports={FIX,write};
