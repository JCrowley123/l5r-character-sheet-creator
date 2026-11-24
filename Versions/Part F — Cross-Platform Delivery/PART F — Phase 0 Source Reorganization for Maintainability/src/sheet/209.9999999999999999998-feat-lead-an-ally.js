  // ============ PART H PHASE 15.2.7 — LEAD AN ALLY ============
  // Phase 15, Release 15b, unit B03 (group 2, action labels and wording), approved by the owner on 24 November 2026
  // ("Approve as recommended": Leadership and Quick on one pattern); "Lead an ally" is Q8's, accepted on 1 November 2026.
  // Feature 4.5.33 (Part I) draws two Advantage buttons whose label is a condition and a formula. Each becomes a short
  // name, with the amount beside it, filled in from the character:
  //   Leadership (Core p.151)  "Lead an ally (School Rank + 1k1)"  becomes  "Lead an ally"  1k1 + 1 (School Rank)
  //   Quick (Core p.152)       "Did not act first: +Reflexes"      becomes  "Use"           +2 (Reflexes)
  // The spoken names say what each does: "Lead an ally: roll 1k1 + 1 (School Rank) for one ally’s Initiative Score",
  // "Use Quick: add 2 (Reflexes) to your Initiative Score for the rest of the skirmish". The amount follows the School
  // Rank and Reflexes, because the row is drawn again on every recalculation.
  // "Use" is B18's suggestion for its job group G06 (using an ability now); if B18 rules otherwise, the word changes
  // with B18's own build.
  // Round 2, after the owner's device round (comment 3; "Approve as shown", 24 November 2026): both buttons take the
  // outlined look of every other button on these cards (the class ghost), in place of Feature 4.5.33's black fill.
  // Words and look only: the roll, once a Round, the round ledger, the notes under the buttons, the greyed-out reasons
  // and Feature 4.5.35's (Part I) Initiative Score line are Feature 4.5.33's and 4.5.35's own. Screen only; nothing is
  // saved.
  const LEAD_AN_ALLY_ENABLED = true;

  const LA15 = (function(){
    const api = {installed: false};
    api.LEAD_WAS = 'Lead an ally (School Rank + 1k1)';
    api.QUICK_WAS = 'Did not act first: +Reflexes';
    api.enabled = function(){
      return LEAD_AN_ALLY_ENABLED === true && typeof VI4533 === 'object' && !!VI4533 && typeof VI4533.lines === 'function' &&
        typeof VI4533.make === 'function' && typeof VI4533.schoolRank === 'function' && typeof VI4533.trait === 'function';
    };
    api.amount = function(text){ return VI4533.make('span', 'la15-amount', text); };
    api.lead = function(button){
      const rank = VI4533.schoolRank();
      const amount = '1k1 + ' + rank + ' (School Rank)';
      button.textContent = 'Lead an ally';
      button.setAttribute('aria-label', 'Lead an ally: roll ' + amount + ' for one ally’s Initiative Score');
      return api.amount(amount);
    };
    api.quick = function(button){
      const reflexes = VI4533.trait('Reflexes');
      const known = Number.isFinite(reflexes);
      button.textContent = 'Use';
      button.setAttribute('aria-label', 'Use Quick: add ' + (known ? reflexes + ' (Reflexes)' : 'your Reflexes') +
        ' to your Initiative Score for the rest of the skirmish');
      return api.amount(known ? '+' + reflexes + ' (Reflexes)' : '+Reflexes');
    };
    // The row's parts as Feature 4.5.33 made them: the button first. Text it does not recognise is left as it is.
    api.reword = function(key, parts){
      const button = parts && parts[0];
      if(!button || button.tagName !== 'BUTTON') return parts;
      let amount = null;
      if(key === 'leadership' && button.textContent === api.LEAD_WAS) amount = api.lead(button);
      else if(key === 'quick' && button.textContent === api.QUICK_WAS) amount = api.quick(button);
      if(amount){
        button.classList.add('ghost');
        parts.splice(1, 0, amount);
      }
      return parts;
    };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const previousLines = VI4533.lines;
      VI4533.lines = function(key){
        const parts = previousLines.apply(this, arguments);
        try { return api.reword(key, parts); } catch(e){ return parts; }
      };
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(LEAD_AN_ALLY_ENABLED) LA15.install();
  // ============ END PART H PHASE 15.2.7 LA15 ============
