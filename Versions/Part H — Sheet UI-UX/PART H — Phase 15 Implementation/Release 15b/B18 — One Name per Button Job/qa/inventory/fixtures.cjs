'use strict';
// The B18 inventory character: A03's dense character with the entries that bring up the per-session buttons.
// Written to a file and opened by Import, as a player would. No application file is touched.
const {fs,path,DENSE}=require('./common.cjs');
const clone=o=>JSON.parse(JSON.stringify(o));
function sessions(){
 const f=clone(DENSE);f.fields.f_name='B18 inventory';
 const kt=f.adv.find(a=>a.name==='Kharmic Tie');
 kt.config={type:'rankPick',value:'Rank 3',rank:3,target:'Aiko',remaining:2};kt.cost='3';
 f.adv.push(
  {name:'Luck',cost:'3',desc:'',config:{type:'rankPick',value:'Rank 3',rank:3,remaining:2}},
  {name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,value:'Control',precept:'Control',remaining:1}},
  {name:'Great Destiny',cost:'4',desc:''});
 f.disadv.push({name:'Haunted',cost:'3',desc:''},{name:'Unlucky',cost:'4',desc:'',config:{type:'rankPick',value:'Rank 2',rank:2,remaining:1}});
 // An Ancestor of the character's own Clan (Crab, Kuni) with a once-a-session gift; this session's use is spent, so Reset session is live.
 f.fields.f_ancestor=JSON.stringify({v:1,name:'Kuni',lost:false,regained:false,final:false,gm:false,sessionUsed:true});
 return f;
}
// The same character as an Imperial one with the Seppun Ancestor: its gift also has a "Use it now" button.
function ancestorImperial(){
 const f=sessions();f.fields.f_name='B18 inventory Imperial';f.fields.f_clan='Imperial';
 f.fields.f_ancestor=JSON.stringify({v:1,name:'Seppun',lost:false,regained:false,final:false,gm:false,sessionUsed:false});
 return f;
}
function write(out,key){const f=({sessions,ancestorImperial})[key]();const file=path.join(out,`b18-${key}.l5r.json`);fs.writeFileSync(file,JSON.stringify(f));return {file,name:f.fields.f_name};}
module.exports={sessions,ancestorImperial,write};
