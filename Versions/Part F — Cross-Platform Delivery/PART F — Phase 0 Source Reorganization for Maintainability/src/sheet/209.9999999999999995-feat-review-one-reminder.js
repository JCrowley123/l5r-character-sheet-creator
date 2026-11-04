  // ============ PART H PHASE 15.1.1 — REVIEW: ONE REMINDER FOR EACH OPEN SCHOOL CHOICE ============
  // Phase 15, Release 15a, finding A01 (owner's rulings Q1, 1 November 2026). The wizard's Review showed an open
  // School choice twice: once in Phase 11.2.2's "Still to choose" box and again in the character check's card
  // ("<School>: 1 free Skill choice still open ... Still to choose: Any one Weapon Skill."). The cards stay, as the
  // owner ruled. This layer drops from the box ONLY an item that a card for the same School already names in its
  // own "Still to choose:" list; anything else in the box (the Lore subject, Kiho picks, a School with no recorded
  // spell line) is shown once, as a card beside the check's own. The "every choice is made" line is kept.
  // Nothing here changes a choice, a finding, the overspend warning, Finish or its confirmation: it only arranges
  // what Review already shows. With the switch off, or without Phase 11.2.2's box, Review is exactly as before.
  const REVIEW_ONE_REMINDER_ENABLED = true;

  // Pure logic: which open items a card already names. No DOM, no sheet state.
  const RR15Logic = {
    // The items a card's own "Still to choose: a; b, c." list names, read from its last such list.
    named: function(detail){
      const text = String(detail || '');
      const at = text.lastIndexOf('Still to choose: ');
      return at < 0 ? '' : text.slice(at + 'Still to choose: '.length);
    },
    // True only when the card is for this School and its list names exactly this item, bounded by the list's own
    // separators ("; " for Skills, ", " for spells) and its closing full stop. Nothing is matched by similarity.
    names: function(finding, school, text){
      if(!finding || !school || !text) return false;
      if(String(finding.title || '').indexOf(school + ': ') !== 0) return false;
      const list = RR15Logic.named(finding.detail);
      if(!list) return false;
      const escaped = String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp('(?:^|; |, )' + escaped + '(?=; |, |\\.(?:\\s|$))').test(list);
    },
    // items: [{step, text}] from the wizard; findings: [{title, detail}] the Review's cards show.
    split: function(items, findings, school){
      const duplicates = [], unique = [];
      (items || []).forEach(function(item){
        const named = (findings || []).some(function(f){ return RR15Logic.names(f, school, item && item.text); });
        (named ? duplicates : unique).push(item);
      });
      return {duplicates: duplicates, unique: unique};
    }
  };

  const RR15 = (function(){
    const api = {installed: false, last: null};
    api.enabled = function(){ return REVIEW_ONE_REMINDER_ENABLED; };
    // UI hook: after Review has drawn, rearrange its "Still to choose" box. Reads only what Review drew from.
    api.arrange = function(body){
      api.last = null;
      if(!api.enabled() || !body) return;
      const box = body.querySelector('#cw1122Still');
      if(!box || !box.classList.contains('cw1122-open')) return;
      const findings = typeof CW112.findings === 'function' ? (CW112.findings() || []) : [];
      const school = typeof CW112.appliedSchool === 'function' ? CW112.appliedSchool() : '';
      const result = RR15Logic.split(CW1122.allOpen(), findings, school);
      api.last = result;
      box.remove();
      if(!result.unique.length) return;
      let list = body.querySelector('ul.cw112-findings');
      if(!list){
        list = document.createElement('ul');
        list.className = 'cw112-findings';
        const done = Array.from(body.children).find(function(n){ return n.matches('p.cw112-done, p.cw112-note'); });
        if(done) body.insertBefore(list, done); else body.appendChild(list);
      }
      // Beside the School's own cards: after the last card for this School, else before the check's first information
      // card, so an error or warning (the overspend) stays first.
      const cards = Array.from(list.children);
      const lastOwn = school ? cards.filter(function(li){
        const strong = li.querySelector('strong');
        return !!strong && strong.textContent.indexOf(school + ': ') === 0;
      }).pop() : null;
      const firstInfo = lastOwn ? lastOwn.nextElementSibling
        : (cards.find(function(li){ return li.classList.contains('cw112-info'); }) || null);
      result.unique.forEach(function(item){
        const li = document.createElement('li');
        li.className = 'rr15-reminder';
        const strong = document.createElement('strong');
        strong.textContent = item.step + ': ' + item.text;
        li.appendChild(strong);
        const span = document.createElement('span');
        span.textContent = ' Still to choose. You can finish this on the sheet.';
        li.appendChild(span);
        list.insertBefore(li, firstInfo);
      });
    };
    api.install = function(){
      if(api.installed || typeof CW112 !== 'object' || !CW112 || !Array.isArray(CW112.steps)) return;
      if(typeof CW1122 !== 'object' || !CW1122 || typeof CW1122.allOpen !== 'function') return;
      const review = CW112.steps.find(function(s){ return s && s.id === 'review'; });
      if(!review || typeof review.render !== 'function') return;
      const previous = review.render;
      review.render = function(body){
        const out = previous.apply(this, arguments);
        api.arrange(body);
        return out;
      };
      api.installed = true;
    };
    api.install();
    return api;
  })();
  // ============ END PART H PHASE 15.1.1 ============
