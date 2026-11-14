  // ============ PART H PHASE 15.1.32 — ONE RESISTING? LINE ============
  // Phase 15, Release 15a, unit A12 (group G5, undo and the roll preview), approved by the owner on 14 November 2026,
  // "ring-fenced with extra care": R6, the owner's ruling of 7 October 2026, one closed "Resisting?" line. The number
  // 32 is this unit's marker only; the unit keeps its identifier, A12.
  // The roll preview's "Declare for this roll" (Part I 4.5.15's registry, RD4515) lists every choice that might apply
  // to a roll. The resistance choices are offered on every Skill, Trait, Ring and dice-tray roll, because the sheet
  // cannot tell which roll is a resistance, and they took most of the section. Here they sit in one native disclosure
  // at the top of the section, closed when a preview opens: "Resisting?" and how many choices it holds. Opened, it
  // shows the registry's own labelled choices and notes, Honour's first, each under its source. A ticked choice is
  // named with its bonus on the closed line ("1 chosen", "Honour +4"), so a ticked resistance is never hidden.
  // The choices it gathers are the fifteen resistances listed in KEYS; every other choice stays where it is.
  // Ring-fenced:
  //   - It changes no other layer's code. It wraps only the roll preview's optional hook rd4515PreviewHtml, by name,
  //     and rearranges the markup the registry has already made; it reads the registry (offered, armed) and never
  //     arms, clears or recomputes a choice. The checkboxes are the registry's own, so the preview's own listeners
  //     tick them as before; bonuses, totals and the reset for each roll are the registry's.
  //   - With no resistance choice on a roll, with the switch off, or while paused (tests only), the markup is the
  //     registry's, unchanged. Anything unexpected in that markup, or any error here, leaves it unchanged too.
  //   - Nothing is saved: the line's open state lives only while one preview is open.
  const RESISTING_LINE_ENABLED = true;

  const RS15 = (function(){
    const api = {installed: false, paused: false};
    // The resistance choices: Honour's own (Core Rulebook p.91); four Advantages (4.5.27); Seven Fortunes' Blessing
    // (4.5.21); Touch of the Spirit Realms (4.5.24); the Ancestors' resistance gifts (Phase 4.8).
    api.KEYS = Object.freeze(['honour-resistance:resist',
      'situational-entries:balance', 'situational-entries:clear-thinker', 'situational-entries:heartless', 'situational-entries:irreproachable',
      'fortune-blessing:jurojin', 'fortune-blessing:hotei', 'spirit-realms:meido', 'spirit-realms:tengoku',
      'ancestors:kaimetsu-provoked', 'ancestors:moto-resist', 'ancestors:yamatsu-resist', 'ancestors:hitomi-resist',
      'ancestors:reichin-fear', 'ancestors:reichin-bloodspeaker']);
    let shown = {context: null, open: false};   // the one preview open now, and whether its line is open
    api.enabled = function(){
      return RESISTING_LINE_ENABLED && typeof RD4515 === 'object' && !!RD4515 && RD4515.enabled() && typeof rd4515PreviewHtml === 'function';
    };
    // "Honour +4", "Balance +1k0", "Ancestor +1k1": the choice's name (or its source's) and its bonus.
    api.short = function(offer){
      const label = String(offer.label), at = label.lastIndexOf(' — '), named = /^([^:]+):/.exec(label);
      const bonus = at < 0 ? '' : label.slice(at + 3).replace(/ to the total$/, '');
      return (named ? named[1] : offer.providerLabel) + (bonus ? ' ' + bonus : '');
    };
    // The registry's finished markup for this roll, with the resistance choices moved into the line; or the markup
    // as it came.
    api.html = function(context, html){
      if(api.paused || typeof html !== 'string' || !html) return html;
      const offers = RD4515.offered(context).filter(function(o){ return api.KEYS.indexOf(o.key) !== -1; });
      if(!offers.length) return html;
      if(shown.context !== context) shown = {context: context, open: false};
      const armed = RD4515.armed(context);
      const box = document.createElement('template');
      box.innerHTML = html;
      const block = box.content.firstElementChild, head = block && block.firstElementChild;
      if(!block || box.content.children.length !== 1 || !block.classList.contains('rd4515-declare') || !head || !head.classList.contains('rd4515-head')) return html;
      const inputs = {};
      block.querySelectorAll('input[data-rd4515-key]').forEach(function(i){ inputs[i.getAttribute('data-rd4515-key')] = i; });
      const moved = [];
      for(const offer of offers){
        const input = inputs[offer.key], label = input && input.parentNode;
        if(!label || label.tagName !== 'LABEL' || !label.classList.contains('rd4515-opt') || label.parentNode !== block) return html;
        const note = label.nextElementSibling && label.nextElementSibling.classList.contains('rd4515-opt-note') ? label.nextElementSibling : null;
        moved.push({offer: offer, label: label, note: note});
      }
      // Honour's own choice first; the rest in the registry's order.
      moved.sort(function(a, b){ return (a.offer.provider === 'honour-resistance' ? 0 : 1) - (b.offer.provider === 'honour-resistance' ? 0 : 1); });
      const line = document.createElement('details'), summary = document.createElement('summary'), body = document.createElement('div');
      line.className = 'rs15-line';
      body.className = 'rs15-body';
      let source = null;
      moved.forEach(function(m){
        if(m.offer.providerLabel !== source){
          source = m.offer.providerLabel;
          const h = document.createElement('div');
          h.className = 'rd4515-source';
          h.textContent = source;
          body.appendChild(h);
        }
        body.appendChild(m.label);
        if(m.note) body.appendChild(m.note);
      });
      // A source heading left with nothing under it goes.
      Array.prototype.slice.call(block.children).forEach(function(el){
        if(el.classList.contains('rd4515-source') && !(el.nextElementSibling && el.nextElementSibling.classList.contains('rd4515-opt'))) el.remove();
      });
      const chosen = moved.filter(function(m){ return armed.indexOf(m.offer.key) !== -1; });
      const q = document.createElement('span'), count = document.createElement('span');
      q.className = 'rs15-q';
      q.textContent = 'Resisting?';
      count.className = 'rs15-count';
      count.textContent = chosen.length ? chosen.length + ' chosen' : moved.length + (moved.length === 1 ? ' option' : ' options');
      summary.appendChild(q);
      summary.appendChild(count);
      if(chosen.length){
        const names = document.createElement('span');
        names.className = 'rs15-chosen';
        names.textContent = chosen.map(function(m){ return api.short(m.offer); }).join(' · ');
        summary.appendChild(names);
        line.classList.add('rs15-has');
      }
      if(shown.open) line.setAttribute('open', '');
      line.appendChild(summary);
      line.appendChild(body);
      head.after(line);
      return box.innerHTML;
    };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      // UI hook: the roll preview asks this name for the registry's markup (the Smart Roll Preview, through a typeof guard).
      const previous = rd4515PreviewHtml;
      rd4515PreviewHtml = function(context){
        const html = previous.apply(this, arguments);
        try { return api.html(context, html); } catch(e){ return html; }
      };
      // The line's open state for this preview, kept across the preview's redraw on every tick.
      document.addEventListener('toggle', function(event){
        const t = event.target;
        if(t && t.classList && t.classList.contains('rs15-line')) shown.open = t.open;
      }, true);
      api.installed = true;
      return true;
    };
    return api;
  })();
  RS15.install();
  // ============ END PART H PHASE 15.1.32 ============
