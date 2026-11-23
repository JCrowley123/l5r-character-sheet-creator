'use strict';
// Group 2 of Release 15b: each proposal drawn inside the test browser from the sheet's own values. Scratch only: no
// application file is edited. Each function wraps one of the sheet's own drawing functions (exposed on the test seam)
// so the proposal survives the sheet's redraws, or, where the text is a literal inside a closure, rewrites the drawn
// text as it appears.

// B01 (Q8, accepted 1 November): the seven labels, the TN kept in the label as Epilepsy's and Lord Moon's already are.
// The spoken name starts with the visible words (B18 inventory §5: today none of the six check buttons does).
const B01_LABELS = {
  'brash':'Resist insult (TN 25)',
  'overconfident':'Measure the enemy (TN 20)',
  'can\'t lie':'Discretion check (TN 20)',
  'contrary':'Cooperate',
  'rumormonger':'Resist gossip (TN 5 × Glory)',
  'soft-hearted':'Resolve check (TN 20)',
};
const LOST_LOVE = 'Steady yourself — Spend Void';
async function b01(p){
  await p.evaluate(([L, LOST])=>{
    const T = window.__L5R_TEST__, C = T.CHK4531, build = C.build;
    C.build = function(div, key, row){
      const out = build.apply(this, arguments);
      const spec = C.CHECKS[key], btn = row.querySelector('.chk4531-btn');
      if(L[key] && spec && btn){
        btn.textContent = L[key];
        btn.setAttribute('aria-label', L[key] + ': ' + spec.name + ', ' + spec.trait + ' roll ' + spec.why);
      }
      if(key === 'lost love'){
        const b = Array.prototype.find.call(row.querySelectorAll('.chk4531-btn'), x => /Void/.test(x.textContent));
        if(b){ b.textContent = LOST; b.setAttribute('aria-label', LOST + ': Lost Love, a Void Point sets the memory aside'); }
      }
      return out;
    };
    document.querySelectorAll('#disadvList .chk4531-row').forEach(r => r.remove());
    C.decorate();
  }, [B01_LABELS, LOST_LOVE]);
}

// B03 (Q8): "Lead an ally", with the formula and the current School Rank beside it ("1k1 + 1 (School Rank)"), so the
// amount is visible before the button is used. Today's note under it is unchanged, so the row keeps its height.
// The sheet-wide question: Quick, the one other button of the same feature with the same "condition: formula" shape,
// follows the same pattern: B18 G06's word for using an ability now, "Use", with "+2 (Reflexes)" beside it and the
// spoken name "Use Quick: …" (B18's pattern "Use {ability}: {what it does}"). Quick's word depends on the open G06
// ruling. quick=false leaves Quick as today.
async function b03(p, quick = true){
  await p.evaluate(quick=>{
    const T = window.__L5R_TEST__, V = T.VI4533, lines = V.lines;
    const amount = text => { const s = V.make('span', 'vi4533-note g2-amount', text); return s; };
    V.lines = function(key){
      const out = lines.apply(this, arguments);
      if(key === 'leadership' && out[0]){
        const rank = V.schoolRank();
        out[0].textContent = 'Lead an ally';
        out[0].setAttribute('aria-label', 'Lead an ally: roll 1k1 + ' + rank + ' (School Rank) for one ally’s Initiative Score');
        out.splice(1, 0, amount('1k1 + ' + rank + ' (School Rank)'));
      }
      if(quick && key === 'quick' && out[0]){
        const r = V.trait('Reflexes');
        out[0].textContent = 'Use';
        out[0].setAttribute('aria-label', 'Use Quick: add ' + r + ' (Reflexes) to your Initiative Score for the rest of the skirmish');
        out.splice(1, 0, amount('+' + r + ' (Reflexes)'));
      }
      return out;
    };
    T.recalcAll();
  }, quick);
}

// B05 (Q8): "You remain in control." The sheet-wide question: Lord Moon's Curse, the one other check whose success
// is about keeping control, reads "You remain in control tonight." with the same words. moon=false leaves it as today.
// The texts are literals inside closures, so the drawn note is rewritten as it appears.
async function b05(p, moon = true){
  await p.evaluate(moon=>{
    const swap = {'You keep your head.':'You remain in control.'};
    if(moon) swap['Willpower roll passed. You keep control tonight.'] = 'Willpower roll passed. You remain in control tonight.';
    const note = document.getElementById('rollResultNote') || document.getElementById('rollModalBody');
    const fix = () => document.querySelectorAll('#rollResultNote').forEach(n => { if(swap[n.textContent]) n.textContent = swap[n.textContent]; });
    new MutationObserver(fix).observe(document.getElementById('rollModalOverlay'), {subtree:true, childList:true, characterData:true});
    fix();
  }, moon);
}

// B09: the Skills page's picker labels drawn from the catalogue as it stands after every layer (Intimidation:
// Awareness), whenever the picker is drawn or redrawn.
async function b09(p){
  await p.evaluate(()=>{
    const T = window.__L5R_TEST__, sel = document.getElementById('skillQuickAdd');
    const fix = () => sel.querySelectorAll('option').forEach(o => {
      if(!o.value) return;
      const lib = T.findSkill(o.value);
      const want = lib ? lib.name + ' (' + lib.trait + ')' : o.textContent;
      if(o.textContent !== want) o.textContent = want;
    });
    new MutationObserver(fix).observe(sel, {childList:true, subtree:true});
    fix();
  });
}

module.exports = {b01, b03, b05, b09, B01_LABELS, LOST_LOVE};
