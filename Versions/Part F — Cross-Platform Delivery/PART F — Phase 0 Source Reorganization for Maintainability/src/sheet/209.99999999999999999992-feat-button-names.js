  // ============ PART H PHASE 15.2.10 — ONE NAME PER BUTTON JOB ============
  // Phase 15, Release 15b, unit B18 (one name per button job). The owner's rulings of 24 November 2026 on the
  // inventory of the sheet's buttons, and the mock-up board approved on 25 November 2026: 19 cards approved, Touch of
  // the Void kept as "Keep control (TN 30)", Reset approved as a word, built "Next, before group 3". One word for each
  // job a button does, and a spoken name that says what the button acts on. This unit is the words and the spoken
  // names (and the Combat tab's i's, drawn by 1155-button-names.css); the Reset buttons' one size and the i at the
  // right end of its row are units of their own (B18.1, B18.2).
  //   G01 Reset          "Reset session" reads "Reset" on seven cards (Kharmic Tie, Luck, Dark Paragon, Great Destiny,
  //                      Haunted, Unlucky, the Ancestor card), heard "Reset {name} for a new session"; the round
  //                      counter's Reset is heard "Reset the round counter"; the three lines that name the button say
  //                      "Reset" (Great Destiny's used message, the Ancestor gift's roll-preview note, Kharmic Tie's
  //                      i window).
  //   G02 Change         Change and Choose… are heard with the card's name; the wizard's "Choose again" reads "Change".
  //   G03 Remove         a row's ✕ is heard "Remove {row}" (Skills and each Emphasis, Advantages, Disadvantages,
  //                      Techniques, items, weapons). The written Remove and Delete stay.
  //   G04 Close, Cancel  a window's corner ✕ is heard "Close {window}" when the window only shows something, "Cancel
  //                      {window}" when it holds a choice not kept yet; the shared question and message window's ✕
  //                      "Cancel question" or "Close notice".
  //   G05 OK, Confirm    "Got it" reads "OK"; a plain "Yes" and "No" read "Confirm" and "Cancel".
  //   G06 Use            an Ancestor's "Use it now" reads "Use", heard "Use {gift}", in its card and in its question;
  //                      Great Destiny's Use is heard "Use Great Destiny: …"; the two gift notes that name the button
  //                      say "Use".
  //   G07 Spend Void     the Ancestor price question's "Spend a Void Point" reads "Spend Void".
  //   G08 Reroll         "Re-roll 1s", "Re-roll selected" and Kakita's button read "Reroll …"; "Spend Luck (n/m)" reads
  //                      "Reroll with Luck (n/m)"; Toku's "Reroll with Toku’s Luck (n/1)". "GM invokes Unlucky" and
  //                      "Add Sun Tao’s die" stay.
  //   G09 Clear          the dice tray's two Clear buttons are heard "Clear the dice" and "Clear the other dice".
  //   G10 + Add          "+ Emph" reads "+ Add Emphasis"; the Library's "+Book" reads "+ Add Book"; the court
  //                      window's "Add court" reads "+ Add court".
  //   G12 i              every i is heard "{thing} information"; the Combat tab's ⓘ and 👁 are drawn as the sheet's
  //                      ring i (their glyph hidden, not removed).
  //   G14 − and +        heard "Decrease {thing}" and "Increase {thing}" (Honour, Glory, Status, Taint, the Void Ring,
  //                      the Arrows window, Rank settings). Unlucky's pair and the Wounds pair stay, and so do the
  //                      creation wizard's, which were not on the approved list.
  //   G16 Export PDF     a saved character's "Export to PDF" reads "Export PDF".
  // Each change is made only where today's exact words are found, as the control is drawn: in each Advantage and
  // Disadvantage row after every layer has drawn it; after every recalculation, in the sheet's lists, steppers and
  // cards; in the question and message window as it is asked for; in a roll's result as it is shown; and in the
  // windows, menus and wizard steps as each is built. Words this unit does not recognise go through unchanged.
  // Words and spoken names only (and the Combat i's look): what each button does, its class, its title and the save
  // file are unchanged. Screen only; nothing is saved.
  const ONE_NAME_PER_JOB_ENABLED = true;

  const BN15 = (function(){
    const api = {installed: false, parts: {}};
    const $ = function(id){ return document.getElementById(id); };
    const norm = function(s){ return String(s === undefined || s === null ? '' : s).replace(/\s+/g, ' ').trim(); };
    const words = function(el){ return el ? norm(el.textContent) : ''; };
    // A control's own words. Anything drawn inside it stays: without Release 15a A04, Phase 4.54 (Part I) puts its i
    // inside the button it explains (Luck's Reset, a card's Choose…).
    const setText = function(el, text){
      if(!el) return;
      if(!el.children.length){ if(el.textContent !== text) el.textContent = text; return; }
      const nodes = Array.prototype.filter.call(el.childNodes, function(n){ return n.nodeType === 3 && n.nodeValue.trim(); });
      if(!nodes.length){ el.insertBefore(document.createTextNode(text), el.firstChild); return; }
      if(nodes[0].nodeValue !== text) nodes[0].nodeValue = text;
      for(let i = 1; i < nodes.length; i++) nodes[i].nodeValue = '';
    };
    const setLabel = function(el, label){ if(el && label && el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label); };
    const own = Object.prototype.hasOwnProperty;
    // Spoken names this unit wrote, so they follow a renamed row; names other units wrote are left as they are.
    const mine = typeof WeakSet === 'function' ? new WeakSet() : null;
    const ours = function(el, label){ if(!el || !label) return; setLabel(el, label); if(mine) mine.add(el); };
    const isOurs = function(el){ return !!(mine && el && mine.has(el)); };
    api.enabled = function(){ return ONE_NAME_PER_JOB_ENABLED === true && !!document.body; };

    // The name of the row or card a control sits on: an Advantage's (or a Technique's) name box, a Skill's, a weapon's
    // or an item's. '' when it has none yet.
    api.entryName = function(el){
      const entry = el && el.closest ? el.closest('.entry') : null;
      if(entry){ const n = entry.querySelector('.en-name'); return n ? norm(n.value) : ''; }
      const tr = el && el.closest ? el.closest('tr') : null;
      if(tr){
        const n = tr.querySelector('.sk-name, .wp-name, .eq-name');
        return n ? norm(n.value) : '';
      }
      return '';
    };

    // ---- G01 Reset ----
    api.RESET = Object.freeze({was: 'Reset session', text: 'Reset'});
    api.resetSpoken = function(name){ return 'Reset ' + name + ' for a new session'; };
    api.reset = function(button, name){
      if(!button || words(button) !== api.RESET.was) return false;
      setText(button, api.RESET.text);
      setLabel(button, api.resetSpoken(name || 'this ability'));
      return true;
    };
    api.ROUNDS = 'Reset the round counter';
    api.LINES = Object.freeze({
      used: /^(.+ is already used this session\. )Reset session( to use it again\.)$/,
      giftWas: 'Used this session. It is ready again after Reset session on the Ancestor card (Clan & School).',
      giftNow: 'Used this session. It is ready again after Reset on the Ancestor card (Clan & School).',
      tieWas: 'Reset session gives back all ',
      tieNow: 'Reset gives back all '
    });
    // A button's old words, where an i's window uses them as its heading.
    api.HEADINGS = Object.freeze({'Reset session': 'Reset'});
    // ---- G06 Use ----
    api.USE =Object.freeze({was: 'Use it now', text: 'Use', noteWas: 'press “Use it now” on this card', noteNow: 'press “Use” on this card'});
    // ---- G05, G06, G07: the words of the sheet's question and message window ----
    api.OK_WORDS = Object.freeze({'Got it': 'OK', 'Yes': 'Confirm', 'Spend a Void Point': 'Spend Void', 'Use it now': 'Use'});
    api.CANCEL_WORDS = Object.freeze({'No': 'Cancel', 'Spend a Void Point': 'Spend Void'});
    api.okWord = function(w){ return typeof w === 'string' && own.call(api.OK_WORDS, w) ? api.OK_WORDS[w] : w; };
    api.cancelWord = function(w){ return typeof w === 'string' && own.call(api.CANCEL_WORDS, w) ? api.CANCEL_WORDS[w] : w; };
    api.alertText = function(message){
      return typeof message === 'string' && api.LINES.used.test(message) ? message.replace(api.LINES.used, '$1Reset$2') : message;
    };
    // ---- G04 the corner ✕ ----
    api.CLOSE = Object.freeze(['manualRollPromptClose', 'rollModalClose', 'skillInfoClose', 'untrainedSkillsClose', 'stanceInfoClose',
      'castWhyX', 'spellScrollsX', 'arrowsPickerClose', 'voidInfoClose', 'woundInfoClose']);
    api.CANCEL = Object.freeze(['rollPreviewClose', 'advConfigX', 'universalSpellPickX', 'handPickClose', 'arrowPickClose',
      'rangePickClose', 'affinityPickX', 'deficiencyPickX']);
    // Windows that show a thing's information: "Close Calligraphy information".
    api.INFO_WINDOWS = Object.freeze(['skillInfoClose', 'stanceInfoClose']);
    api.QUESTION = 'Cancel question';
    api.NOTICE = 'Close notice';
    // ---- G09 Clear ----
    api.CLEAR = Object.freeze({dicePickerClear: 'Clear the dice', otherDiceClear: 'Clear the other dice'});
    // ---- G12 the Combat tab's i's ----
    api.COMBAT_I = Object.freeze({combatTnInfoBtn: 'TN & Initiative information', combatAttackInfoBtn: 'Attack & Damage information'});
    // ---- G14 − and + ----
    api.STEPS = Object.freeze([
      [/^Add (.+) points$/, 'Increase $1 points'], [/^Subtract (.+) points$/, 'Decrease $1 points'],
      [/^One more (.+)$/, 'Increase $1'], [/^One fewer (.+)$/, 'Decrease $1'],
      [/^Raise (.+)$/, 'Increase $1'], [/^Lower (.+)$/, 'Decrease $1'],
      [/^Gain one (.+) point$/, 'Increase $1 points by one'], [/^Lose one (.+) point$/, 'Decrease $1 points by one']
    ]);

    // G02: Change and Choose… with the card's name. A name another unit gave (Kharmic Tie's) is kept.
    api.change = function(button, name){
      if(!button || !name) return false;
      const w = words(button), label = button.getAttribute('aria-label') || '';
      const verb = w === 'Change' ? 'Change' : w === 'Choose…' ? 'Choose' : '';
      if(!verb || (label.indexOf(verb + ' ') === 0 && !isOurs(button))) return false;
      ours(button, verb + ' ' + name);
      return true;
    };
    // G03: a row's ✕.
    api.remove = function(button, name){
      if(!button || !/^[✕×]$/.test(words(button))) return false;
      ours(button, 'Remove ' + (name || 'this entry'));
      return true;
    };
    // G06: Great Destiny's (and Dark Fate's) Use, heard with what it does.
    api.destinyUse = function(button){
      if(!button || words(button) !== 'Use') return false;
      const label = button.getAttribute('aria-label') || '';
      const m = /^([^:]+):\s*(.*)$/.exec(label);
      if(!m || label.indexOf('Use ') === 0) return false;
      setLabel(button, 'Use ' + m[1] + ': ' + m[2]);
      return true;
    };
    // G12: "Explain: {thing}" and "{thing}: how it is worked out" are heard "{thing} information".
    api.info = function(button){
      const label = button && button.getAttribute ? button.getAttribute('aria-label') || '' : '';
      const m = /^Explain:\s*(.+)$/.exec(label) || /^(.+?): how it is worked out$/.exec(label);
      if(!m) return false;
      // An i named from a button's old words (Luck's i explains its Reset) takes the button's new word.
      setLabel(button, (own.call(api.HEADINGS, m[1]) ? api.HEADINGS[m[1]] : m[1]) + ' information');
      return true;
    };
    // The hidden words the corner ✕'s and the four cards' − and + are named from (aria-labelledby).
    api.holder = function(){
      let holder = $('bn15Words');
      if(!holder){
        holder = document.createElement('div');
        holder.id = 'bn15Words';
        holder.hidden = true;
        document.body.appendChild(holder);
      }
      return holder;
    };
    api.count = 0;
    api.spans = typeof WeakMap === 'function' ? new WeakMap() : null;
    api.nameBy = function(button, name){
      let span = api.spans ? api.spans.get(button) : null;
      if(!span){
        span = document.createElement('span');
        span.id = 'bn15Name' + (++api.count);
        api.holder().appendChild(span);
        if(api.spans) api.spans.set(button, span);
      }
      if(span.textContent !== name) span.textContent = name;
      if(button.getAttribute('aria-labelledby') !== span.id) button.setAttribute('aria-labelledby', span.id);
    };
    // G14: a − or + heard "Decrease …" or "Increase …". The Honour, Glory, Status and Taint cards' own − and + keep their
    // aria-label and are named through aria-labelledby (which a screen reader reads first): Release 15a A08 tells those
    // eight from every other control by their aria-label, to keep a burst of quick taps as one Undo.
    api.stepper = function(button){
      const w = words(button);
      if(!/^[−+\-]$/.test(w)) return false;
      const label = button.getAttribute('aria-label') || '';
      for(let i = 0; i < api.STEPS.length; i++){
        const re = api.STEPS[i][0];
        if(!re.test(label)) continue;
        if(button.closest('.cp7-adjust')) api.nameBy(button, label.replace(re, api.STEPS[i][1]));
        else setLabel(button, label.replace(re, api.STEPS[i][1]));
        return true;
      }
      if(!label && button.classList.contains('stepbtn') && button.dataset.ring){
        const ring = button.dataset.ring.charAt(0).toUpperCase() + button.dataset.ring.slice(1);
        setLabel(button, (w === '+' ? 'Increase ' : 'Decrease ') + ring + ' Ring');
        return true;
      }
      return false;
    };
    // G12: the Combat tab's i, drawn as the ring i by the stylesheet (body.bn15-on).
    api.ringI = function(button, label){
      if(!button) return;
      if(label) setLabel(button, label);
      button.classList.add('bn15-i');
    };

    // ---- One Advantage, Disadvantage or Technique entry, after every layer has drawn it ----
    api.entry = function(div){
      if(!div || !div.querySelectorAll) return;
      const nameEl = div.querySelector('.en-name');
      const name = nameEl ? norm(nameEl.value) : '';
      Array.prototype.forEach.call(div.querySelectorAll('button'), function(b){
        if(api.reset(b, name)) return;
        if(b.classList.contains('adv-config-btn')) api.change(b, name);
        if(b.classList.contains('dsx4532-btn')) api.destinyUse(b);
        api.info(b);
      });
      Array.prototype.forEach.call(div.querySelectorAll('.rm-btn'), function(b){
        if(b.closest('.entry') === div) api.remove(b, name);
      });
    };
    api.lists = function(){
      ['advList', 'disadvList', 'techList'].forEach(function(id){
        const list = $(id);
        if(list) Array.prototype.forEach.call(list.querySelectorAll('.entry'), api.entry);
      });
    };
    // ---- The rows of the Skills, Weapons and Equipment tables ----
    api.skillRow = function(tr){
      const name = api.entryName(tr);
      Array.prototype.forEach.call(tr.querySelectorAll('.rm-btn'), function(b){
        if(b.classList.contains('emph-item-del')){ if(/^[✕×]$/.test(words(b))) ours(b, 'Remove Emphasis'); }
        else api.remove(b, name);
      });
      const add = tr.querySelector('.emph-add-btn');
      if(add && words(add) === '+ Emph') setText(add, '+ Add Emphasis');
      if(add && words(add) === '+ Add Emphasis') ours(add, 'Add Emphasis' + (name ? ' to ' + name : ''));
    };
    api.weaponRow = function(tr){
      const name = api.entryName(tr);
      Array.prototype.forEach.call(tr.querySelectorAll('.rm-btn'), function(b){ api.remove(b, name); });
      const eye = tr.querySelector('.wp-info-btn');
      if(eye){ api.ringI(eye); ours(eye, (name || 'Weapon') + ' information'); }
    };
    api.itemRow = function(tr){
      const name = api.entryName(tr);
      Array.prototype.forEach.call(tr.querySelectorAll('.rm-btn'), function(b){ api.remove(b, name); });
    };
    api.tables = function(){
      [['skillsBody', api.skillRow], ['weaponsBody', api.weaponRow], ['equipBody', api.itemRow]].forEach(function(t){
        const body = $(t[0]);
        if(body) Array.prototype.forEach.call(body.querySelectorAll(':scope > tr'), t[1]);
      });
    };
    // ---- The Ancestor card's once-a-session line ----
    api.sessionLine = function(box, ancestor){
      if(!box || !box.querySelector || !ancestor) return;
      const gift = (typeof ANC48 === 'object' && ANC48 && ANC48.SESSION_NAME && ANC48.SESSION_NAME[ancestor.session]) || '';
      const use = box.querySelector('.anc48-session-use');
      if(use && words(use) === api.USE.was){
        setText(use, api.USE.text);
        if(gift) setLabel(use, 'Use ' + gift);
      }
      api.reset(box.querySelector('.anc48-session-reset'), ancestor.name ? ancestor.name + '’s gift' : 'the Ancestor’s gift');
    };
    api.ancestor = function(){
      setLabel($('anc48Info'), 'Ancestors information');
      const box = $('anc48Session');
      if(box && typeof ANC48 === 'object' && ANC48 && typeof ANC48.active === 'function') api.sessionLine(box, ANC48.active());
    };
    // ---- Everything the sheet draws in its pages, after a recalculation ----
    api.sheet = function(){
      api.lists();
      api.tables();
      Array.prototype.forEach.call(document.querySelectorAll('#cp7-section button, .rp7-controls button, .ta7-controls button, ' +
        '.ring-card .stepbtn[data-ring]'), api.stepper);
      ['at15QaInfo', 'wp15LineInfo', 'wp15QaInfo'].forEach(function(id){ const b = $(id); if(b) api.info(b); });
      api.ancestor();
    };
    // ---- A roll's result ----
    api.emphasisBar = function(){
      const bar = $('emphasisRerollBar');
      if(!bar) return;
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function(b){
        const w = words(b);
        if(w === 'Re-roll 1s') setText(b, 'Reroll 1s');
        else if(w === 'Re-roll selected') setText(b, 'Reroll selected');
      });
    };
    api.result = function(){
      const body = $('rollModalBody');
      if(!body) return;
      Array.prototype.forEach.call(body.querySelectorAll('.adv-config-spend-luck'), function(b){
        const m = /^Spend Luck \((\d+)\/(\d+)\)$/.exec(words(b));
        if(!m) return;
        setText(b, 'Reroll with Luck (' + m[1] + '/' + m[2] + ')');
        setLabel(b, 'Reroll with Luck: roll the whole roll again and keep the higher result, ' + m[1] + ' of ' + m[2] + ' left');
      });
      Array.prototype.forEach.call(body.querySelectorAll('.anc48-after-btn'), function(b){
        const w = words(b);
        let m;
        if((m = /^Re-roll with Kakita (.*)$/.exec(w))) setText(b, 'Reroll with Kakita ' + m[1]);
        else if((m = /^Spend Toku’s Luck (.*)$/.exec(w))) setText(b, 'Reroll with Toku’s Luck ' + m[1]);
      });
      api.emphasisBar();
    };
    // ---- The question and message window ----
    api.okLabelled = false;
    api.windowCall = function(previous, kind){
      return function(message, okLabel){
        const args = Array.prototype.slice.call(arguments);
        let gift = '';
        try {
          if(kind === 'alert'){
            args[0] = api.alertText(args[0]);
            args[1] = api.okWord(args[1]);
          } else {
            if(args[1] === api.USE.was){
              const state = document.querySelector('#anc48Session .anc48-session-state');
              gift = state ? norm(state.textContent).split(':')[0] : '';
            }
            args[1] = api.okWord(args[1]);
            args[3] = api.cancelWord(args[3]);
          }
          if(api.okLabelled){ const ok = $('appConfirmOk'); if(ok) ok.removeAttribute('aria-label'); api.okLabelled = false; }
        } catch(e){}
        const out = previous.apply(this, args);
        try {
          setLabel($('appConfirmX'), kind === 'alert' ? api.NOTICE : api.QUESTION);
          if(gift){ setLabel($('appConfirmOk'), 'Use ' + gift); api.okLabelled = true; }
        } catch(e){}
        return out;
      };
    };
    // ---- The corner ✕ of each window: its verb and the window's own heading, as the heading reads when it is heard ----
    api.corners = function(){
      const holder = api.holder();
      [['bn15WordClose', 'Close'], ['bn15WordCancel', 'Cancel'], ['bn15WordInfo', 'information'], ['bn15WordWindow', 'window']].forEach(function(w){
        if($(w[0])) return;
        const span = document.createElement('span');
        span.id = w[0];
        span.textContent = w[1];
        holder.appendChild(span);
      });
      api.CLOSE.concat(api.CANCEL).forEach(function(id){
        const x = $(id);
        if(!x) return;
        const overlay = x.closest('.roll-modal-overlay');
        const heading = overlay ? overlay.querySelector('h3') : null;
        if(heading && !heading.id) heading.id = 'bn15Title-' + id;
        const ids = [api.CLOSE.indexOf(id) !== -1 ? 'bn15WordClose' : 'bn15WordCancel', heading ? heading.id : 'bn15WordWindow'];
        if(api.INFO_WINDOWS.indexOf(id) !== -1) ids.push('bn15WordInfo');
        x.setAttribute('aria-labelledby', ids.join(' '));
      });
    };
    // ---- The windows, menus and pages built on demand ----
    api.stances = function(){
      Array.prototype.forEach.call(document.querySelectorAll('#stanceTiles .stance-info-btn'), function(b){
        const m = /^(.+) stance rules$/.exec(b.getAttribute('aria-label') || '');
        api.ringI(b, m ? m[1] + ' stance information' : '');
      });
    };
    api.arrows = function(){
      Array.prototype.forEach.call(document.querySelectorAll('#arrowsPickerList .arrow-tick-btn'), api.stepper);
    };
    api.wizard = function(){
      Array.prototype.forEach.call(document.querySelectorAll('.cw1121-undo'), function(b){
        if(words(b) === 'Choose again') setText(b, 'Change');
      });
    };
    api.library = function(){
      const plus = $('l13Add');
      // The words replace the button's content, its separate + included, as the board showed them.
      if(plus && words(plus) === '+Book'){ plus.textContent = '+ Add Book'; setLabel(plus, 'Add Book'); }
    };
    api.court = function(){
      Array.prototype.forEach.call(document.querySelectorAll('#advConfigGrid .court4514-add'), function(b){
        if(words(b) === 'Add court') setText(b, '+ Add court');
      });
    };
    api.pdf = function(){
      Array.prototype.forEach.call(document.querySelectorAll('.pdf111-export'), function(b){
        if(words(b) === 'Export to PDF') setText(b, 'Export PDF');
      });
    };
    api.tieWindow = function(){
      const body = $('stanceInfoBody');
      if(!body) return;
      Array.prototype.forEach.call(body.querySelectorAll('.kt15-rule'), function(p){
        if(p.textContent.indexOf(api.LINES.tieWas) !== -1) p.textContent = p.textContent.replace(api.LINES.tieWas, api.LINES.tieNow);
      });
    };
    // The two Ancestor gift notes that tell the player to press "Use it now", in the Ancestor list itself (the card's
    // gift list and the roll preview read them from there).
    api.giftNotes = function(){
      if(typeof ANC48 !== 'object' || !ANC48 || !Array.isArray(ANC48.LIBRARY)) return 0;
      let changed = 0;
      ANC48.LIBRARY.forEach(function(a){
        (a && Array.isArray(a.gifts) ? a.gifts : []).forEach(function(g){
          if(g && typeof g.note === 'string' && g.note.indexOf(api.USE.noteWas) !== -1){ g.note = g.note.split(api.USE.noteWas).join(api.USE.noteNow); changed++; }
        });
      });
      return changed;
    };

    // Wraps one function held in a variable or a property, calling the unit's pass after it. Returns the wrapper.
    const after = function(previous, pass){
      return function(){
        const out = previous.apply(this, arguments);
        try { pass.apply(this, arguments); } catch(e){}
        return out;
      };
    };
    const wrapProperty = function(holder, key, pass, part){
      if(!holder || typeof holder[key] !== 'function') return false;
      holder[key] = after(holder[key], pass);
      api.parts[part] = true;
      return true;
    };

    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      // Each Advantage and Disadvantage row, after every earlier layer has drawn it.
      if(typeof refreshAdvConfigControl === 'function'){
        refreshAdvConfigControl = after(refreshAdvConfigControl, function(div){ api.entry(div); });
        api.parts.rows = true;
      }
      // Phase 4.54's i's (Part I), wherever they are drawn: the lists and the configuration window's options.
      if(typeof R454 === 'object' && R454) wrapProperty(R454, 'decorate', function(scope){
        if(scope && scope.querySelectorAll) Array.prototype.forEach.call(scope.querySelectorAll('.adv-config-info'), api.info);
      }, 'explain');
      // An i's window takes its heading from the words of the button the i explains, as they were when the i was drawn
      // (Luck's i explains its Reset): a heading that is a button's old words is shown with its new word.
      if(typeof R454 === 'object' && R454 && typeof R454.show === 'function'){
        const previousShow = R454.show;
        R454.show = function(title){
          const args = Array.prototype.slice.call(arguments);
          if(typeof title === 'string' && own.call(api.HEADINGS, title)) args[0] = api.HEADINGS[title];
          return previousShow.apply(this, args);
        };
        api.parts.explainWindow = true;
      }
      // The sheet's pages, after every recalculation.
      if(typeof recalcAll === 'function'){
        recalcAll = after(recalcAll, function(){ api.sheet(); });
        api.parts.sheet = true;
      }
      // Names follow a row's name as it is typed.
      [['skillsBody', 'tr', api.skillRow], ['weaponsBody', 'tr', api.weaponRow], ['equipBody', 'tr', api.itemRow],
       ['advList', '.entry', api.entry], ['disadvList', '.entry', api.entry], ['techList', '.entry', api.entry]].forEach(function(t){
        const host = $(t[0]);
        if(!host) return;
        const follow = function(e){ const row = e.target && e.target.closest ? e.target.closest(t[1]) : null; if(row && host.contains(row)) t[2](row); };
        host.addEventListener('input', follow);
        host.addEventListener('change', follow);
      });
      // The question and message window, as each is asked for.
      if(typeof appConfirm === 'function'){ appConfirm = api.windowCall(appConfirm, 'confirm'); api.parts.confirm = true; }
      if(typeof appConfirm3Way === 'function'){ appConfirm3Way = api.windowCall(appConfirm3Way, 'confirm'); api.parts.confirm3 = true; }
      if(typeof appAlert === 'function'){ appAlert = api.windowCall(appAlert, 'alert'); api.parts.alert = true; }
      // The same three functions, as the sheet now calls them: for the harness, to ask the two questions its test
      // characters cannot reach (the bonus spell slot, Hida Atarasi's price) exactly as the sheet asks them.
      api.window = {confirm: typeof appConfirm === 'function' ? appConfirm : null,
        confirm3: typeof appConfirm3Way === 'function' ? appConfirm3Way : null, alert: typeof appAlert === 'function' ? appAlert : null};
      // A roll's result as it is shown, and the Emphasis reroll's bar each time it is drawn again.
      if(typeof showRollResult === 'function'){
        showRollResult = after(showRollResult, function(){ api.result(); });
        api.parts.result = true;
      }
      if(typeof attachEmphasisReroll === 'function'){
        attachEmphasisReroll = after(attachEmphasisReroll, function(){
          api.emphasisBar();
          // The bar is drawn again inside its own buttons' and the dice's handlers; these run after them.
          const bar = $('emphasisRerollBar'), row = $('rollDiceRow');
          if(bar){ bar.addEventListener('click', api.emphasisBar); bar.addEventListener('change', api.emphasisBar); }
          if(row) row.addEventListener('click', api.emphasisBar, true);
        });
        api.parts.emphasis = true;
      }
      // The Combat tab's stances, the Arrows window and the Ancestor card's once-a-session line, as each is drawn.
      if(typeof renderStanceTiles === 'function'){ renderStanceTiles = after(renderStanceTiles, function(){ api.stances(); }); api.parts.stances = true; }
      if(typeof renderArrowsPicker === 'function'){ renderArrowsPicker = after(renderArrowsPicker, function(){ api.arrows(); }); api.parts.arrows = true; }
      if(typeof ANC48 === 'object' && ANC48 && typeof ANC48.sessionLine === 'function'){
        const previousLine = ANC48.sessionLine;
        ANC48.sessionLine = function(a){
          const box = previousLine.apply(this, arguments);
          try { api.sessionLine(box, a); } catch(e){}
          return box;
        };
        api.parts.ancestor = true;
      }
      // The creation wizard's steps, the School choices window, the Library's shelf, the court window, the Characters menu
      // and Kharmic Tie's i window, as each is built.
      if(typeof CW112 === 'object' && CW112) wrapProperty(CW112, 'render', function(){ api.wizard(); }, 'wizard');
      if(typeof SC8 === 'object' && SC8) wrapProperty(SC8, 'render', function(){ api.wizard(); }, 'schoolChoices');
      if(typeof LIBPAGE13 === 'object' && LIBPAGE13) wrapProperty(LIBPAGE13, 'mount', function(){ api.library(); }, 'library');
      if(typeof CS4514 === 'object' && CS4514) wrapProperty(CS4514, 'open', function(){ api.court(); }, 'court');
      if(typeof PDF111 === 'object' && PDF111) wrapProperty(PDF111, 'decorate', function(){ api.pdf(); }, 'pdf');
      if(typeof KT15 === 'object' && KT15) wrapProperty(KT15, 'show', function(){ api.tieWindow(); }, 'tieWindow');
      // The lines that name a button, where the sheet keeps them.
      if(typeof AG7 === 'object' && AG7 && AG7.USED_NOTE === api.LINES.giftWas){ AG7.USED_NOTE = api.LINES.giftNow; api.parts.giftNote = true; }
      if(api.giftNotes()) api.parts.useNotes = true;
      // The Wound penalty's i and Quick Access's Armor TN i (Release 15b A14 and B04) are named from their units' own
      // label as they are drawn: "{thing}: how it is worked out" becomes "{thing} information".
      [typeof WP15 === 'object' ? WP15 : null, typeof AT15 === 'object' ? AT15 : null].forEach(function(unit){
        const m = unit && typeof unit.LABEL === 'string' ? /^(.+?): how it is worked out$/.exec(unit.LABEL) : null;
        if(m){ unit.LABEL = m[1] + ' information'; api.parts.infoLabels = true; }
      });
      // Controls in the page's own markup.
      Object.keys(api.CLEAR).forEach(function(id){ setLabel($(id), api.CLEAR[id]); });
      Object.keys(api.COMBAT_I).forEach(function(id){ api.ringI($(id), api.COMBAT_I[id]); });
      setLabel($('btnResetRounds'), api.ROUNDS);
      api.corners();
      // Whatever is already drawn.
      api.sheet();
      api.stances();
      api.library();
      api.pdf();
      document.body.classList.add('bn15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(ONE_NAME_PER_JOB_ENABLED) BN15.install();
  // ============ END PART H PHASE 15.2.10 BN15 ============
