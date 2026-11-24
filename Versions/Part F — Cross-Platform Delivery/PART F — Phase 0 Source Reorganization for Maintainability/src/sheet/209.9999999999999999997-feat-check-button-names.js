  // ============ PART H PHASE 15.2.6 — CHECK BUTTONS NAMED FOR WHAT THEY DO ============
  // Phase 15, Release 15b, unit B01 (group 2, action labels and wording), approved by the owner on 24 November 2026
  // ("Approve as recommended"); the words are Q8's, accepted on 1 November 2026.
  // Seven Disadvantage rows of Feature 4.5.31 (Part I) name their button for what it does. The TN stays in the
  // label, as Epilepsy's "Avoid (TN 15)" already shows it:
  //   Brash          "Check (TN 25)"         becomes  "Resist insult (TN 25)"
  //   Overconfident  "Check (TN 20)"         becomes  "Measure the enemy (TN 20)"
  //   Can't Lie      "Check (TN 20)"         becomes  "Discretion check (TN 20)"
  //   Contrary       "Check"                 becomes  "Cooperate" (its TN is in the box before it)
  //   Rumormonger    "Check (TN 5 × Glory)"  becomes  "Resist gossip (TN 5 × Glory)"
  //   Soft-Hearted   "Check (TN 20)"         becomes  "Resolve check (TN 20)"
  //   Lost Love      "Spend a Void Point"    becomes  "Steady yourself — Spend Void"
  // Each spoken name starts with the words on the button, then the entry, the Trait and when it is rolled:
  // "Resist insult (TN 25): Brash, Willpower roll when threatened or insulted".
  // "Spend Void" is B18's suggestion for its job group G07 (spending a Void Point); if B18 rules otherwise, the word
  // changes with B18's own build. Epilepsy's two buttons are already named for what they do and are not touched.
  // Words only: the roll, its TN, title and result lines, the Void Point spent, the switches and the boxes are
  // Feature 4.5.31's own. Screen only; nothing is saved.
  const CHECK_BUTTON_NAMES_ENABLED = true;

  const CN15 = (function(){
    const api = {installed: false};
    api.LABELS = Object.freeze({
      'brash': 'Resist insult (TN 25)',
      'overconfident': 'Measure the enemy (TN 20)',
      'can\'t lie': 'Discretion check (TN 20)',
      'contrary': 'Cooperate',
      'rumormonger': 'Resist gossip (TN 5 × Glory)',
      'soft-hearted': 'Resolve check (TN 20)'
    });
    api.LOST_LOVE = Object.freeze({
      was: 'Spend a Void Point',
      wasSpoken: 'Lost Love: spend a Void Point to set the memory aside',
      text: 'Steady yourself — Spend Void',
      spoken: 'Steady yourself — Spend Void: Lost Love, a Void Point sets the memory aside'
    });
    api.enabled = function(){
      return CHECK_BUTTON_NAMES_ENABLED === true && typeof CHK4531 === 'object' && !!CHK4531 &&
        typeof CHK4531.checkButton === 'function' && typeof CHK4531.button === 'function' &&
        !!CHK4531.CHECKS && typeof CHK4531.CHECKS === 'object';
    };
    api.label = function(key){
      return Object.prototype.hasOwnProperty.call(api.LABELS, key) ? api.LABELS[key] : null;
    };
    // The spoken name: the button's words first.
    api.spoken = function(text, spec){
      return text + ': ' + spec.name + ', ' + spec.trait + ' roll ' + spec.why;
    };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const previousCheckButton = CHK4531.checkButton;
      CHK4531.checkButton = function(key){
        const button = previousCheckButton.apply(this, arguments);
        try {
          const text = api.label(key), spec = CHK4531.CHECKS[key];
          if(text && spec && button){
            button.textContent = text;
            button.setAttribute('aria-label', api.spoken(text, spec));
          }
        } catch(e){}
        return button;
      };
      const previousButton = CHK4531.button;
      CHK4531.button = function(text, label){
        const L = api.LOST_LOVE;
        if(text === L.was && label === L.wasSpoken){
          const args = Array.prototype.slice.call(arguments);
          args[0] = L.text;
          args[1] = L.spoken;
          return previousButton.apply(this, args);
        }
        return previousButton.apply(this, arguments);
      };
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(CHECK_BUTTON_NAMES_ENABLED) CN15.install();
  // ============ END PART H PHASE 15.2.6 CN15 ============
