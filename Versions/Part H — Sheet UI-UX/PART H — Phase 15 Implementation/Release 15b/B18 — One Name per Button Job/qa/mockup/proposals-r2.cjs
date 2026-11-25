'use strict';
// B18 round 2 (the owner, 25 November 2026, on the Reset card: "a pass needs to be done to make sure that they are the
// same size" and "my gut says that where appropriate the "i" should be on the right hand side"). Two looks, drawn in the
// test browser only with a style sheet (no application file is edited):
//  SIZE    every Reset, and the buttons on its row (Use, − and +, Next round), take one look: 28 px tall (the height of the
//          i beside them, and Unlucky's fingertip size), the letters of Change and Choose… on the same cards (capitals,
//          .78rem).
//  IRIGHT  the i sits at the right end of its row, as Kharmic Tie's already does (B17): Luck, Dark Paragon, Seven
//          Fortunes' Curse and the "Needs a choice" cards. Kharmic Tie is left as it is.
// install(page, looks) turns them on; the round-1 words (proposals.cjs) are installed separately.
const CSS={
 SIZE:'@media screen{html body .adv-config-reset-session,html body .dp4523-session .dp4523-reset,html body .dp4523-session .dp4523-use,'+
  'html body .dsx4532-btn,html body .unlucky-btn,html body .anc48-session .anc48-session-reset,html body .anc48-session .anc48-session-use,'+
  'html body .combat-round-box button{box-sizing:border-box;min-height:28px;height:auto;min-width:28px;padding:2px 10px;font-size:.78rem;'+
  'line-height:1;text-transform:uppercase;letter-spacing:.06em;vertical-align:middle}}',
 IRIGHT:'@media screen{html body .adv-config-row>.adv-config-resource-controls:has(>.adv-config-info){flex:1 1 auto}'+
  'html body .adv-config-resource-controls>.adv-config-info{margin-left:auto!important}'+
  'html body .adv-config-row>.adv-config-info,html body .adv-config-row>.dp4523-info,html body .adv-config-row>.ip15-hotei-info{margin-left:auto!important}}',
};
async function install(p,looks){
 await p.evaluate(([css,looks])=>{for(const k of looks){if(document.getElementById('b18r2-'+k))continue;
  const s=document.createElement('style');s.id='b18r2-'+k;s.textContent=css[k];document.head.appendChild(s);}},[CSS,looks]);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
module.exports={install,CSS};
