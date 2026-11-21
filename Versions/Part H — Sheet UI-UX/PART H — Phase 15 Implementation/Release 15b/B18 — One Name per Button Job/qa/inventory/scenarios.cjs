'use strict';
// B18 stage 1: how each window and each full-screen page is brought up on the test character, so its buttons can be read.
// Nothing here changes the character or any application file: each opener only presses a control that opens something,
// and each scenario is closed again (or the page is thrown away) before the next one.
const {settle,wait,tab}=require('./common.cjs');
const vis=(p,sel)=>p.locator(sel).filter({visible:true});
async function press(p,phone,sel,ms=400){
 const loc=vis(p,sel).first();if(!(await loc.count()))return false;
 await loc.scrollIntoViewIfNeeded();if(phone)await loc.tap();else await loc.click();await settle(p);await wait(ms);return true;
}
const appItem=(p,phone,name)=>press(p,phone,`.ab113-item:text-is("${name}")`,900);
// Search keeps the category it was left in; go back to its home tiles before choosing one.
async function searchHome(c){if(!await appItem(c.p,c.phone,'Search'))return false;if(await vis(c.p,'.s14-up').count())await press(c.p,c.phone,'.s14-up',600);return true;}
const openOverlays=p=>p.evaluate(()=>[...document.querySelectorAll('.roll-modal-overlay')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0).map(e=>e.id));
const viewOpen=p=>p.evaluate(()=>{const v=document.getElementById('cl11View');return !!v&&getComputedStyle(v).display!=='none'&&v.getBoundingClientRect().width>0;});
const menuOpen=p=>p.evaluate(()=>{const v=document.getElementById('pm128Menu');return !!v&&getComputedStyle(v).display!=='none'&&v.getBoundingClientRect().width>0;});
// Closes whatever is open: Escape first, then a close-type button in the top window, then the app bar's Sheet.
async function closeAll(p,phone){
 for(let i=0;i<5;i++){
  const ov=await openOverlays(p),v=await viewOpen(p),m=await menuOpen(p);
  if(!ov.length&&!v&&!m)return true;
  if(i<2){await p.keyboard.press('Escape');await wait(250);continue;}
  if(ov.length){
   const top='#'+ov[ov.length-1];
   const b=vis(p,top+' button').filter({hasText:/^(cancel|close|done|ok|no|✕|×|x)$/i}).first();
   if(await b.count()){if(phone)await b.tap();else await b.click();await wait(250);continue;}
  }
  if(v){await appItem(p,phone,'Sheet');continue;}
  await p.mouse.click(5,5);await wait(200);
 }
 return !(await openOverlays(p)).length&&!(await viewOpen(p));
}
// Each scenario: id, the modes it applies to, a short title and run(ctx) -> true when something opened.
// The tab it needs is opened first; "view" scenarios read inside #cl11View.
const S=[
 {id:'quick-access',title:'Quick Access panel',tab:'Skills',run:c=>press(c.p,c.phone,'#quickAccessToggleBtn'),within:'#quickAccessPanel',close:c=>press(c.p,c.phone,'#quickAccessToggleBtn')},
 {id:'dice-tray',title:'Manual dice (floating 10)',tab:'Skills',run:c=>press(c.p,c.phone,'#floatingDiceBtn')},
 {id:'more-menu',title:'⋯ More menu',tab:'Skills',run:c=>press(c.p,c.phone,'#pm128More'),within:'#pm128Menu'},
 {id:'roll-preview',title:'Roll preview (a skill roll)',tab:'Skills',run:c=>press(c.p,c.phone,'.sk-roll')},
 {id:'roll-result',title:'Roll result',tab:'Skills',run:async c=>{if(!await press(c.p,c.phone,'.sk-roll'))return false;return press(c.p,c.phone,'#rollPreviewGo',1500);}},
 {id:'skill-info',title:'Skill information (i)',tab:'Skills',run:c=>press(c.p,c.phone,'.sk-info-btn')},
 {id:'untrained-skills',title:'Untrained Skills',tab:'Skills',run:c=>press(c.p,c.phone,'#btnUntrainedSkills')},
 {id:'add-skill',title:'Add Skill picker',tab:'Skills',modes:['management'],run:c=>press(c.p,c.phone,'#addSkill')},
 {id:'load-all-skills',title:'Load full skill list',tab:'Skills',modes:['management'],run:c=>press(c.p,c.phone,'#loadAllSkills')},
 {id:'add-advantage',title:'Add Advantage picker',tab:'Adv & Disadv',modes:['management'],run:c=>press(c.p,c.phone,'#addAdv')},
 {id:'add-disadvantage',title:'Add Disadvantage picker',tab:'Adv & Disadv',modes:['management'],run:c=>press(c.p,c.phone,'#addDisadv')},
 {id:'adv-choose',title:'Choose… (an Advantage that needs a choice)',tab:'Adv & Disadv',modes:['management'],run:c=>press(c.p,c.phone,'.adv-config-btn:text-is("Choose…")')},
 {id:'adv-change',title:'Change (a choice already made)',tab:'Adv & Disadv',modes:['management'],run:c=>press(c.p,c.phone,'.adv-config-btn:text-is("Change")')},
 {id:'adv-info',title:'Advantage information (i)',tab:'Adv & Disadv',run:c=>press(c.p,c.phone,'.adv-config-info')},
 {id:'hotei-info',title:'Hotei information (i)',tab:'Adv & Disadv',run:c=>press(c.p,c.phone,'.ip15-hotei-info')},
 {id:'dark-paragon-info',title:'Dark Paragon information (i)',tab:'Adv & Disadv',run:c=>press(c.p,c.phone,'.dp4523-info')},
 {id:'remove-entry',title:'Remove an Advantage (✕)',tab:'Adv & Disadv',modes:['management'],run:c=>press(c.p,c.phone,'#advList .rm-btn')},
 {id:'add-technique',title:'Add Technique / Kata / Spell',tab:'Techniques',modes:['management'],run:c=>press(c.p,c.phone,'#addTech')},
 {id:'kiho-info',title:'Kiho rules information (i)',tab:'Techniques',run:c=>press(c.p,c.phone,'#kihoRulesInfoBtn')},
 {id:'spell-cast',title:'Cast a spell',tab:'Spell Slots',run:c=>press(c.p,c.phone,'.spell-cast-btn')},
 {id:'cast-why',title:'Why can’t I cast this? (?)',tab:'Spell Slots',run:c=>press(c.p,c.phone,'.cast-why-btn')},
 {id:'add-spell-scroll',title:'Add spell scroll',tab:'Spell Slots',run:c=>press(c.p,c.phone,'#addSpellScroll')},
 {id:'add-item',title:'Add Item',tab:'Equipment',run:c=>press(c.p,c.phone,'#addEquip')},
 {id:'add-arrows',title:'Add Arrows',tab:'Equipment',run:c=>press(c.p,c.phone,'#addArrows')},
 {id:'school-badge-info',title:'Affinity (i badge)',tab:'Clan & School',run:c=>press(c.p,c.phone,'#cfs_affinityBadgeBtn')},
 {id:'ancestor-info',title:'About Ancestors (i)',tab:'Clan & School',run:c=>press(c.p,c.phone,'#anc48Info')},
 {id:'ancestor-badge',title:'Lost ancestor’s favour (badge)',tab:'Clan & School',modes:['management'],run:c=>press(c.p,c.phone,'#anc48Badge')},
 {id:'void-info',title:'Void Points information (i)',tab:'Rings & Traits',run:c=>press(c.p,c.phone,'#voidInfoBtn')},
 {id:'taint-check',title:'Check Taint growth',tab:'Identity',run:c=>press(c.p,c.phone,'#ta7-check')},
 {id:'stance-info',title:'Stance rules (i)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'.stance-info-btn')},
 {id:'combat-tn-info',title:'TN & Initiative formula (i)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'#combatTnInfoBtn')},
 {id:'combat-attack-info',title:'Attack & Damage formula (i)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'#combatAttackInfoBtn')},
 {id:'wound-info',title:'A wound level (window)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'.wound-seg')},
 {id:'initiative-roll',title:'Roll Initiative (preview)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'#btnRollInitiative')},
 {id:'weapon-roll',title:'Roll attack (preview)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'.wp-roll-btn')},
 {id:'weapon-info',title:'Weapon Info (eye)',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'.wp-info-btn')},
 {id:'add-weapon',title:'Add Weapon',tab:'Combat',modes:['play'],run:c=>press(c.p,c.phone,'#addWeapon')},
 {id:'honour-tap-undo',title:'Undo line after a quick tap (Honour +)',tab:'Identity',within:'.cp7-feedback',run:async c=>{const l=vis(c.p,'[aria-label="Add Honour points"]').first();if(!await l.count())return false;if(c.phone)await l.tap();else await l.click();await settle(c.p);await wait(700);return true;}},
 {id:'characters',title:'Characters screen (nothing saved yet)',tab:'Skills',view:true,run:c=>appItem(c.p,c.phone,'Characters')},
 {id:'characters-saved',title:'Characters screen with a saved character',tab:'Skills',view:true,run:async c=>{if(!await press(c.p,c.phone,'#btnSave',700))return false;return appItem(c.p,c.phone,'Characters');}},
 {id:'characters-row-menu',title:'A saved character’s row menu',tab:'Skills',view:true,run:async c=>{if(!await press(c.p,c.phone,'#btnSave',700))return false;if(!await appItem(c.p,c.phone,'Characters'))return false;return press(c.p,c.phone,'#cl11View .cl11-menu, #cl11View .cl11-more, #cl11View button[aria-haspopup], #cl11View button:text-is("⋯")',500);}},
 {id:'creation-confirm',title:'Create New Character: the discard question',tab:'Skills',reopen:true,run:async c=>{if(!await appItem(c.p,c.phone,'Characters'))return false;return press(c.p,c.phone,'#cl11Create',900);}},
 {id:'creation-wizard',title:'Create New Character: the wizard’s first screen',tab:'Skills',within:'#cw112View',reopen:true,run:async c=>{if(!await appItem(c.p,c.phone,'Characters'))return false;if(!await press(c.p,c.phone,'#cl11Create',900))return false;return press(c.p,c.phone,'#appConfirmOk',1500);}},
 {id:'search-category',title:'Search: one category’s list',tab:'Skills',view:true,run:async c=>{if(!await searchHome(c))return false;return press(c.p,c.phone,'.s14-cat:has-text("Skills")',900);}},
 {id:'search-detail',title:'Search: a detail (an Advantage)',tab:'Skills',view:true,run:async c=>{if(!await searchHome(c))return false;if(!await press(c.p,c.phone,'.s14-cat:has-text("Advantages")',900))return false;return press(c.p,c.phone,'.s14-row',900);}},
 {id:'search-school-detail',title:'Search: a detail (a School)',tab:'Skills',view:true,run:async c=>{if(!await searchHome(c))return false;if(!await press(c.p,c.phone,'.s14-cat:has-text("Schools")',900))return false;return press(c.p,c.phone,'.s14-row',900);}},
 {id:'search-query',title:'Search: a typed query',tab:'Skills',view:true,run:async c=>{if(!await searchHome(c))return false;await c.p.locator('#s14Input').fill('crab');await wait(1200);return true;}},
 {id:'library-home',title:'Library',tab:'Skills',view:true,run:c=>appItem(c.p,c.phone,'Library')},
 {id:'search-home',title:'Search',tab:'Skills',view:true,run:c=>appItem(c.p,c.phone,'Search')},
];
module.exports={searchHome,S,press,appItem,closeAll,openOverlays,viewOpen,menuOpen,vis};
