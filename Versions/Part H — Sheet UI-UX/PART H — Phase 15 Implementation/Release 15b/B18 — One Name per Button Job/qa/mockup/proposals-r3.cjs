'use strict';
// B18 round 3 (the owner's device round, 27 November 2026: "I think we should remove the "i" from lucky and I think the
// rank picker for unlucky need to chandd"). Four looks, drawn in the test browser only (no application file is edited):
//  LUCKI      Luck's i goes. Its window only repeats the Reset button ("Reset" / "Restore Luck to its per-session
//             maximum"); it is the one Reset whose i says nothing more (Kharmic Tie's and Dark Paragon's i's say how
//             the advantage works, and they stay).
//  UNLUCKY    Unlucky's rank window takes the look of Wealthy's and Perceived Honor's, the other two rank windows with
//             no top Rank: heading "Choose a Rank", "Unlucky — choose how many Ranks.", the bold "Rank — 2 XP per rank"
//             over the number box, and a note in the sheet's own words (the catalogue line, Core p.162).
//  IMBALANCE  Elemental Imbalance's first step (its Rank) takes the same look, with no note (it has none today, and no
//             empty bar); its second step (the Element) is left.
//  EMPTYBAR   the empty bar under the other Disadvantage windows (Dependant, Antisocial, Elemental Imbalance's Element
//             step) is hidden while it has nothing to say. It still shows a message ("Enter a whole number …") when
//             there is one: it is the window's message box.
// installCss(page, looks) adds the style-sheet looks; windowLook(page, look) redraws an open window.
const CSS={
 LUCKI:'@media screen{html body .adv-config-luck-controls>.adv-config-info{display:none!important}}',
 EMPTYBAR:'@media screen{html body #advConfigNote:empty{display:none}}',
};
const WINDOW={
 UNLUCKY:{title:'Choose a Rank',sub:'Unlucky — choose how many Ranks.',label:'Rank — 2 XP per rank',
  note:'Once per session for each Rank, the GM may force a reroll of one of your rolls, keeping the second result.'},
 IMBALANCE:{title:'Choose a Rank',sub:'Elemental Imbalance — choose how many Ranks.',label:'Rank — 2 XP per rank',
  note:''},
};
async function installCss(p,looks){
 await p.evaluate(([css,looks])=>{for(const k of looks){if(!css[k]||document.getElementById('b18r3-'+k))continue;
  const s=document.createElement('style');s.id='b18r3-'+k;s.textContent=css[k];document.head.appendChild(s);}},[CSS,looks]);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
// Redraws the open D45 number step in the rank windows' look: the same elements and classes Wealthy's window uses
// (.adv-rank-label, .adv-rank-input), so the sheet's own styles draw it. The number already in the box is kept.
async function windowLook(p,look){
 await p.evaluate(w=>{
  const old=document.querySelector('#advConfigGrid input[type=number]');const value=old?old.value:'';const hadFocus=!!old&&document.activeElement===old;
  document.getElementById('advConfigTitle').textContent=w.title;
  document.getElementById('advConfigSubtitle').textContent=w.sub;
  const g=document.getElementById('advConfigGrid');g.textContent='';
  const l=document.createElement('label');l.className='adv-rank-label';l.htmlFor='advConfigRankInput';l.textContent=w.label;
  const i=document.createElement('input');Object.assign(i,{id:'advConfigRankInput',className:'adv-rank-input',type:'number',min:'1',step:'1',inputMode:'numeric'});
  i.value=value;g.append(l,i);
  // Today's window puts the caret in the box as it opens, so the picture of the new look does too.
  if(hadFocus)i.focus();
  const n=document.getElementById('advConfigNote');n.textContent=w.note;n.style.display=w.note?'':'none';
 },WINDOW[look]);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
module.exports={installCss,windowLook,CSS,WINDOW};
