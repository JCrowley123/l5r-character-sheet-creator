  // ============ PART H PHASE 15.1.4.1 — ONE WAY TO SHOW CHOICES IN PICKERS: EACH RULE INLINE ============
  // Phase 15, Release 15a, unit A04.1: the owner's comment 2 at G1's review (7 November 2026), approved as mocked up the
  // same day. It extends A04's single information pattern into the pickers. The pickers explained their options three
  // ways: Paragon, Dark Paragon, Touch of the Spirit Realms and Soul of Artistry show each option's rule in full on the
  // option; Seven Fortunes' Blessing (Phase 4.5.21 (Part I)) hides each behind its own "Rule" disclosure; and the
  // Phase 4.5.2 (Part I) pickers whose options carry a rule (Consumed, Failure of Bushido, Cursed by the Realm, Seven
  // Fortunes' Curse) hide it behind Phase 4.54's (Part I) i on each option. The owner chose inline, as Paragon does.
  // An observer on the configuration window's grid finds each option that carries a rule disclosure (fb4521-rule, or
  // d45-tooltip) and copies the rule, word for word, into a span of its own at the end of the option's label, after
  // its name and price, which it sets in bold. The option's first text span keeps its exact text. The disclosure and
  // the per-option i are then not drawn (the stylesheet, 1138-inline-rules.css), and the option takes Paragon's card.
  // After choosing, the row's i keeps the text, as before. The pickers' own fragments are not changed.
  // Everything waits for body.ir15-on, which the switch sets: with the switch off the pickers are exactly as before.
  const INLINE_RULES_ENABLED = true;

  const IR15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return INLINE_RULES_ENABLED; };
    api.ITEMS = '#advConfigGrid .fb4521-item:not(.ir15-item), #advConfigGrid .d45-option:not(.ir15-item)';
    // The separator after the name and price: a full stop after "Name — 4 XP", a dash after a bare name or a ")".
    api.separator = function(text){ return / — /.test(text) && !/\)$/.test(text) ? '. ' : ' — '; };
    // Only marks options not yet marked, so the mutation it causes finds nothing more and the observer settles at once.
    api.sweep = function(){
      if(!document.body.classList.contains('ir15-on')) return 0;
      let marked = 0;
      document.querySelectorAll(api.ITEMS).forEach(function(item){
        const details = item.querySelector(':scope > details.fb4521-rule, :scope > details.d45-tooltip');
        const label = item.querySelector(':scope > label');
        if(!details || !label) return;
        const body = details.querySelector(':scope > span');
        const rule = (body ? body.textContent : '').trim();
        if(!rule) return;
        const name = label.querySelector(':scope > span');
        const text = name ? name.textContent.trim() : '';
        if(name && !name.querySelector('b')){
          const cut = text.indexOf(' — ');
          const bold = document.createElement('b');
          bold.textContent = cut < 0 ? text : text.slice(0, cut);
          name.textContent = '';
          name.appendChild(bold);
          if(cut >= 0) name.appendChild(document.createTextNode(text.slice(cut)));
        }
        const span = document.createElement('span');
        span.className = 'ir15-rule';
        span.textContent = api.separator(text) + rule;
        label.appendChild(span);
        label.classList.add('ir15-opt');
        item.classList.add('ir15-item');
        marked++;
      });
      return marked;
    };
    api.install = function(){
      if(api.installed || !INLINE_RULES_ENABLED) return false;
      const grid = document.getElementById('advConfigGrid');
      if(!grid) return false;
      api.installed = true;
      document.body.classList.add('ir15-on');
      // Phase 4.54's (Part I) heading for an option's i leaves out what is not the option's own label; the inline rule
      // is not, so it is added to that list (read by property at call time). Soft: without Phase 4.54 nothing is added.
      if(typeof R454 === 'object' && R454 && typeof R454.EXCLUDE_FROM_LABEL === 'string' && R454.EXCLUDE_FROM_LABEL.indexOf('.ir15-rule') === -1)
        R454.EXCLUDE_FROM_LABEL += ', .ir15-rule';
      if(typeof MutationObserver === 'function'){
        api.observer = new MutationObserver(api.sweep);
        api.observer.observe(grid, {childList: true, subtree: true});
      }
      api.sweep();
      return true;
    };
    return api;
  })();
  IR15.install();
  // ============ END PART H PHASE 15.1.4.1 ============
