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
  // Round 2, after the owner's device round (comments 2, 5 and 8; "Approve as shown", 24 November 2026):
  //   - Lord Moon's Curse's "Resist Lord Moon (TN 20)" takes the check buttons' size, not Release 15a A07's 44 px
  //     (the stylesheet 1154-check-button-names.css, under body.cn15-on, which this unit sets);
  //   - Touch of the Void's "Willpower (TN 30)" (Feature 4.5.33, Part I) takes the check buttons' outlined look and
  //     reads "Keep control (TN 30)", spoken "Keep control (TN 30): Touch of the Void, Willpower roll after you
  //     spend a Void Point";
  //   - ten failure lines lose their "Tell the GM …" sentence: seven of Feature 4.5.31's, Touch of the Void's, Cursed
  //     by the Realm's for Toshigoku (Feature 4.5.10, Part I) and Elemental Imbalance's message (Feature 4.5.2's
  //     Willpower gates, Part I), which keeps "the GM decides what happens" because the rule leaves it to the GM.
  //   Each line is replaced only where its exact words are found: the seven in Feature 4.5.31's list when this unit
  //   installs, Touch of the Void's and Toshigoku's where the roll is asked for (so a reroll that copies the roll's
  //   words gets the new ones), and Elemental Imbalance's where the sheet's message window is asked for. Any other
  //   words go through unchanged.
  // Words and looks only: the rolls, their TNs, titles and pass lines, the Void Point spent, the switches and the
  // boxes are those features' own. Screen only; nothing is saved.
  const CHECK_BUTTON_NAMES_ENABLED = true;

  const CN15 = (function(){
    const api = {installed: false, parts: {}};
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
    // Round 2: Touch of the Void's button.
    api.TOUCH = Object.freeze({
      key: 'touch of the void',
      was: 'Willpower (TN 30)',
      text: 'Keep control (TN 30)',
      spoken: 'Keep control (TN 30): Touch of the Void, Willpower roll after you spend a Void Point'
    });
    // Round 2: the failure lines, each as it was and as it now reads.
    api.CHECK_FAILS = Object.freeze({
      'brash': Object.freeze({was: 'You attack (or challenge) the one who provoked you, at once. Tell the GM: the sheet does not act for you.',
        now: 'You attack (or challenge) the one who provoked you, at once.'}),
      'can\'t lie': Object.freeze({was: 'You must correct the lie. Tell the GM: the sheet does not act for you.',
        now: 'You must correct the lie.'}),
      'contrary': Object.freeze({was: 'You must argue your side of the dispute. Tell the GM: the sheet does not act for you.',
        now: 'You must argue your side of the dispute.'}),
      'epilepsy': Object.freeze({was: 'You have a seizure. Tell the GM: the sheet does not act for you. Each round, the End seizure button rolls to end it.',
        now: 'You have a seizure. Each round, the End seizure button rolls to end it.'}),
      'overconfident': Object.freeze({was: 'You do not see it, and press on. Tell the GM: the sheet does not act for you.',
        now: 'You do not see it, and press on.'}),
      'rumormonger': Object.freeze({was: 'You pass the rumor on. Tell the GM: the sheet does not act for you.',
        now: 'You pass the rumor on.'}),
      'soft-hearted': Object.freeze({was: 'You cannot bring yourself to kill. Tell the GM: the sheet does not act for you.',
        now: 'You cannot bring yourself to kill.'})
    });
    api.ROLL_FAILS = Object.freeze([
      Object.freeze({title: /^Touch of the Void — Willpower vs TN \d+$/,
        was: 'You are Dazed for one Round. Tell the GM: the sheet does not track Dazed.', now: 'You are Dazed for one Round.'}),
      Object.freeze({title: /^Cursed by the Realm \(Toshigoku\) — Willpower vs TN \d+$/,
        was: 'You are overcome by the urge to fight. Tell the GM — this sheet does not act for you.', now: 'You are overcome by the urge to fight.'})
    ]);
    api.IMBALANCE = Object.freeze({
      was: 'You failed the Elemental Imbalance Willpower check. Tell the GM; the consequences are determined by the GM. Your Spell Casting Roll still proceeds.',
      now: 'You failed the Elemental Imbalance Willpower check: the GM decides what happens. Your Spell Casting Roll still proceeds.'
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
    // Touch of the Void's button, as Feature 4.5.33 made it (the row's first part). Other words are left as they are.
    api.touch = function(key, parts){
      const button = parts && parts[0];
      if(key !== api.TOUCH.key || !button || button.tagName !== 'BUTTON' || button.textContent !== api.TOUCH.was) return parts;
      button.classList.add('ghost');
      button.textContent = api.TOUCH.text;
      button.setAttribute('aria-label', api.TOUCH.spoken);
      return parts;
    };
    // The roll's options with the failure line's new words, or the same options when nothing matches.
    api.rollFail = function(title, opts){
      const tn = opts && opts.tnConfig;
      if(!tn || typeof tn.failText !== 'string') return opts;
      const line = api.ROLL_FAILS.find(function(l){ return l.was === tn.failText && l.title.test(String(title || '')); });
      return line ? Object.assign({}, opts, {tnConfig: Object.assign({}, tn, {failText: line.now})}) : opts;
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
      // Round 2. Feature 4.5.31's failure lines: changed in its list, before any check is rolled.
      Object.keys(api.CHECK_FAILS).forEach(function(key){
        const spec = CHK4531.CHECKS[key], line = api.CHECK_FAILS[key];
        if(spec && spec.fail === line.was) spec.fail = line.now;
      });
      api.parts.checks = true;
      // Touch of the Void's button, when Feature 4.5.33 is present.
      if(typeof VI4533 === 'object' && VI4533 && typeof VI4533.lines === 'function'){
        const previousLines = VI4533.lines;
        VI4533.lines = function(key){
          const parts = previousLines.apply(this, arguments);
          try { return api.touch(key, parts); } catch(e){ return parts; }
        };
        api.parts.touch = true;
      }
      // Touch of the Void's and Toshigoku's failure lines, where the roll is asked for.
      if(typeof rollWithModifiers === 'function'){
        const previousRoll = rollWithModifiers;
        rollWithModifiers = function(title){
          const args = Array.prototype.slice.call(arguments);
          try { args[4] = api.rollFail(title, args[4]); } catch(e){}
          return previousRoll.apply(this, args);
        };
        api.parts.rolls = true;
      }
      // Elemental Imbalance's message, where the sheet's message window is asked for.
      if(typeof appAlert === 'function'){
        const previousAlert = appAlert;
        appAlert = function(message){
          const args = Array.prototype.slice.call(arguments);
          if(message === api.IMBALANCE.was) args[0] = api.IMBALANCE.now;
          return previousAlert.apply(this, args);
        };
        api.parts.alert = true;
      }
      // Lord Moon's Curse's button: the stylesheet waits for this class.
      if(document.body) document.body.classList.add('cn15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(CHECK_BUTTON_NAMES_ENABLED) CN15.install();
  // ============ END PART H PHASE 15.2.6 CN15 ============
