  // ============ PART K PHASE 11.2 — CREATION WIZARD ============
  // A full-screen, step-by-step way to make a character, launched by the Characters screen's
  // "Create New Character" (Phase 11). The owner chose full screens over a guided mode on the
  // sheet (24 September 2026).
  //
  // NEW SCREENS, NO NEW RULES. Every choice is carried out by the sheet's own controls: the
  // wizard sets #cfs_clan / #cfs_minorClan / #cfs_family / #cfs_school and fires their change
  // events, then presses the sheet's own Apply Family and Apply School buttons, so Apply School
  // still asks its own Affinity, Deficiency, Honor and specialisation questions. Traits are
  // raised through the Trait inputs' own input event and Void through the sheet's own stepper.
  // Every option list is read from the sheet (its selects, schoolsForPicker()). So the result
  // is exactly what doing the same by hand produces, and a harness checks that it is.
  //
  // GATED BY THE VALIDATOR. Each step's Next unlocks when that step is done and Phase 5's
  // (Part J) validateCharacter() reports no error for it; Finish needs no error at all. Warnings
  // and notes are shown, never blocking. Without Phase 5 the wizard still gates on whether each
  // choice was applied, and says the check is unavailable.
  //
  // THIS STAGE covers Name, Clan, Family, School, Rings & Traits and Review. Skills and
  // Advantages/Disadvantages are the next stage; until then Review says to finish them on the
  // sheet. The character is saved from the first step (Phase 11 creates it), so leaving part
  // way keeps it in the Characters list, unfinished.
  const CREATION_WIZARD_ENABLED = true;

  const CW112 = (function(){
    const api = {};
    api.enabled = function(){ return CREATION_WIZARD_ENABLED; };
    api.view = null;
    api.index = 0;
    api.state = {};   // what was chosen in the wizard: clan, minor, family, school
    api.busy = false; // true while Apply School is waiting on its own questions

    const $ = function(id){ return document.getElementById(id); };
    function el(tag, cls, text){
      const node = document.createElement(tag);
      if(cls) node.className = cls;
      if(text !== undefined) node.textContent = text;
      return node;
    }
    function fire(node, type){ node.dispatchEvent(new Event(type, {bubbles:true})); }
    function options(select){
      return Array.from(select.options).filter(function(o){ return o.value !== ''; })
        .map(function(o){ return {value:o.value, label:o.textContent}; });
    }
    function monFor(name){
      if(typeof CLAN_MON_DATA !== 'object' || !CLAN_MON_DATA) return null;
      return CLAN_MON_DATA[name] || null;
    }
    api.findings = function(){
      if(typeof validateCharacter !== 'function') return null;
      return validateCharacter().findings;
    };
    function errorsFor(ids){
      const all = api.findings();
      if(!all) return [];
      return all.filter(function(f){ return f.severity === 'error' && (!ids || ids.indexOf(f.id) >= 0); });
    }
    api.appliedSchool = function(){
      const list = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      return list.length ? list[0].name : '';
    };

    // ---- Steps ----
    // Each: title, intro, render(body), check() -> '' when Next may unlock, else the reason.
    const TRAIT_RULES = ['trait-range', 'trait-below-free-floor', 'xp-overspend'];
    api.steps = [
      { id:'name', title:'Name', intro:'Every character needs a name. You can change it later on the sheet.',
        render: function(body){
          const input = el('input', 'cw112-input');
          input.type = 'text';
          input.id = 'cw112Name';
          input.autocomplete = 'off';
          input.setAttribute('aria-label', 'Character name');
          input.value = $('f_name').value;
          input.addEventListener('input', function(){
            $('f_name').value = input.value;
            fire($('f_name'), 'input');
            fire($('f_name'), 'change');
            api.refreshNav();
          });
          body.appendChild(input);
        },
        check: function(){ return $('f_name').value.trim() ? '' : 'Enter a name to continue.'; } },

      { id:'clan', title:'Clan', intro:'Choose your Clan. Minor Clans and the Brotherhood of Shinsei are at the end.',
        render: function(body){
          const grid = el('div', 'cw112-cards');
          options($('cfs_clan')).forEach(function(o){
            grid.appendChild(api.card(o.label, null, monFor(o.value), api.state.clan === o.value, async function(){
              if(api.state.clan === o.value) return;
              if(!(await api.startOverIfApplied())) return;
              api.state.clan = o.value;
              api.state.minor = null;
              api.state.family = null;
              api.state.school = null;
              $('cfs_clan').value = o.value;
              fire($('cfs_clan'), 'change');
              api.render();
            }));
          });
          body.appendChild(grid);
          if(api.state.clan === 'Minor Clan'){
            body.appendChild(el('h3', 'cw112-sub', 'Which Minor Clan?'));
            const minors = el('div', 'cw112-cards');
            options($('cfs_minorClan')).forEach(function(o){
              minors.appendChild(api.card(o.label, null, null, api.state.minor === o.value, async function(){
                if(api.state.minor === o.value) return;
                if(!(await api.startOverIfApplied())) return;
                api.state.minor = o.value;
                api.state.family = null;
                api.state.school = null;
                $('cfs_minorClan').value = o.value;
                fire($('cfs_minorClan'), 'change');
                api.render();
              }));
            });
            body.appendChild(minors);
          }
        },
        check: function(){
          if(!api.state.clan) return 'Choose a Clan to continue.';
          if(api.state.clan === 'Minor Clan' && !api.state.minor) return 'Choose a Minor Clan to continue.';
          return '';
        } },

      { id:'family', title:'Family', intro:'Choose your Family. Its +1 Trait is free and is applied as you choose.',
        render: function(body){
          const fams = options($('cfs_family'));
          if(!fams.length){
            body.appendChild(el('p', 'cw112-note', 'No Family is listed for this choice, so there is nothing to apply here.'));
            return;
          }
          const grid = el('div', 'cw112-cards');
          fams.forEach(function(o){
            grid.appendChild(api.card(o.value, o.label.replace(o.value, '').trim(), null, api.state.family === o.value, function(){
              $('cfs_family').value = o.value;
              $('cfs_applyFamily').click();
              api.state.family = $('f_family').value === o.value ? o.value : null;
              api.render();
            }));
          });
          body.appendChild(grid);
          if(api.state.family) body.appendChild(el('p', 'cw112-done', 'Applied: ' + api.state.family + '.'));
        },
        check: function(){
          if(!options($('cfs_family')).length) return '';
          return api.state.family && $('f_family').value === api.state.family ? '' : 'Choose a Family to continue.';
        } },

      { id:'school', title:'School', intro:'Choose your School. Some Schools ask a question of their own before they apply.',
        render: function(body){
          const schools = typeof schoolsForPicker === 'function' ? schoolsForPicker() : [];
          if(!schools.length){
            body.appendChild(el('p', 'cw112-note', 'No School is listed for this Clan.'));
            return;
          }
          const grid = el('div', 'cw112-cards');
          schools.forEach(function(sc){
            const bits = [];
            if(sc.benefit) bits.push('+1 ' + sc.benefit);
            if(sc.honorChoices && sc.honorChoices.length) bits.push('Honor ' + sc.honorChoices.join(' or '));
            else if(sc.honor !== null && sc.honor !== undefined) bits.push('Honor ' + sc.honor);
            grid.appendChild(api.card(sc.name, bits.join(' · '), null, api.state.school === sc.name, function(){
              api.applySchool(sc.name);
            }));
          });
          body.appendChild(grid);
          if(api.state.school){
            body.appendChild(el('p', 'cw112-done', 'Applied: ' + api.state.school + '.'));
            const sc = schools.find(function(s){ return s.name === api.state.school; });
            // The School library's own fields, one per line.
            if(sc){
              const info = el('dl', 'cw112-summary');
              [['Skills', sc.skills], ['Outfit', sc.outfit], ['Techniques', (sc.tech || []).join(' · ')]].forEach(function(pair){
                if(!pair[1]) return;
                info.appendChild(el('dt', '', pair[0]));
                info.appendChild(el('dd', '', pair[1]));
              });
              body.appendChild(info);
            }
          }
          errorsFor(['caster-lock-conflict']).forEach(function(f){ body.appendChild(el('p', 'cw112-error', f.title)); });
        },
        check: function(){
          if(!api.state.school || api.appliedSchool() !== api.state.school) return 'Choose a School to continue.';
          const errs = errorsFor(['caster-lock-conflict']);
          return errs.length ? errs[0].title : '';
        } },

      { id:'traits', title:'Rings & Traits', intro:'Spend experience on your Traits and Void. A Ring is the lower of its two Traits. Free points from your Family and School cannot be taken back.',
        render: function(body){
          const xp = el('p', 'cw112-xp');
          xp.id = 'cw112Xp';
          xp.textContent = 'Experience left: ' + $('f_xpRemain').value + ' of ' + $('f_xpTotal').value;
          body.appendChild(xp);
          const list = el('div', 'cw112-traits');
          RINGS.forEach(function(r){
            const ring = el('div', 'cw112-ring');
            ring.appendChild(el('h3', 'cw112-sub', r.name + ' Ring ' + $('ring_' + r.key).value));
            r.traits.forEach(function(t){ ring.appendChild(api.traitRow(t.name, 'trait_' + t.key)); });
            list.appendChild(ring);
          });
          const v = el('div', 'cw112-ring');
          v.appendChild(el('h3', 'cw112-sub', 'Void Ring'));
          v.appendChild(api.traitRow('Void', 'ring_void'));
          list.appendChild(v);
          body.appendChild(list);
          errorsFor(TRAIT_RULES).forEach(function(f){ body.appendChild(el('p', 'cw112-error', f.title)); });
        },
        check: function(){
          const errs = errorsFor(TRAIT_RULES);
          return errs.length ? errs[0].title : '';
        } },

      { id:'review', title:'Review', intro:'Here is your character so far, with the sheet’s own check.',
        render: function(body){
          const summary = el('dl', 'cw112-summary');
          [['Name', $('f_name').value.trim()], ['Clan', $('f_clan').value], ['Family', $('f_family').value],
           ['School', api.appliedSchool()],
           ['Rings', RINGS.map(function(r){ return r.name + ' ' + $('ring_' + r.key).value; }).concat('Void ' + $('ring_void').value).join(' · ')],
           ['Experience left', $('f_xpRemain').value]].forEach(function(pair){
            summary.appendChild(el('dt', '', pair[0]));
            summary.appendChild(el('dd', '', pair[1] || '—'));
          });
          body.appendChild(summary);
          const all = api.findings();
          if(!all){
            body.appendChild(el('p', 'cw112-note', 'The sheet’s character check is not available in this build.'));
          } else if(!all.length){
            body.appendChild(el('p', 'cw112-done', 'The sheet’s check finds nothing to fix.'));
          } else {
            const list = el('ul', 'cw112-findings');
            all.forEach(function(f){
              const li = el('li', 'cw112-finding cw112-' + f.severity);
              li.appendChild(el('strong', '', f.title));
              if(f.detail) li.appendChild(el('span', '', ' ' + f.detail));
              list.appendChild(li);
            });
            body.appendChild(list);
          }
          body.appendChild(el('p', 'cw112-note', 'Skills and Advantages/Disadvantages are not in the wizard yet: finish them on the sheet after you press Finish.'));
        },
        check: function(){
          const errs = errorsFor(null);
          return errs.length ? 'Fix the errors above to finish: ' + errs[0].title : '';
        } },
    ];

    // The sheet can replace a Family with a Family and a School with a School, but has no way to
    // take one away. So a new Clan after either was applied starts the sheet over, through its own
    // reset, keeping only the name.
    api.startOverIfApplied = async function(){
      if(!$('f_familyApplied').value && !$('f_schoolApplied').value && !api.appliedSchool()) return true;
      const ok = await appConfirm('A different Clan starts your Family, School and Traits again. Your name is kept.', 'Start again', 'ghost', 'Keep my choices');
      if(!ok) return false;
      const name = $('f_name').value;
      resetToBaseline();
      $('f_name').value = name;
      fire($('f_name'), 'input');
      return true;
    };
    api.card = function(title, sub, img, selected, onPick){
      const b = el('button', 'cw112-card' + (selected ? ' cw112-selected' : ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if(img){
        const i = document.createElement('img');
        i.src = img;
        i.alt = '';
        b.appendChild(i);
      }
      const text = el('span', 'cw112-card-text');
      text.appendChild(el('span', 'cw112-card-title', title));
      if(sub) text.appendChild(el('span', 'cw112-card-sub', sub));
      b.appendChild(text);
      b.addEventListener('click', function(){ if(!api.busy) onPick(); });
      return b;
    };
    api.traitRow = function(name, inputId){
      const row = el('div', 'cw112-trait');
      const input = $(inputId);
      const value = parseInt(input.value || '0', 10);
      const floor = Math.max(1, parseInt(input.dataset.free || '1', 10) || 1);
      row.appendChild(el('span', 'cw112-trait-name', name));
      const minus = el('button', 'cw112-step', '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Lower ' + name);
      minus.disabled = value <= floor;
      const val = el('span', 'cw112-trait-val', String(value));
      const plus = el('button', 'cw112-step', '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Raise ' + name);
      plus.disabled = value >= 10;
      minus.dataset.step = '-1';
      plus.dataset.step = '1';
      [minus, plus].forEach(function(b){
        b.addEventListener('click', function(){ api.stepTrait(inputId, parseInt(b.dataset.step, 10)); });
      });
      row.appendChild(minus);
      row.appendChild(val);
      row.appendChild(plus);
      return row;
    };
    // Void goes through the sheet's own stepper; a Trait through its own input event, which is
    // what derives the Ring and recalculates experience.
    api.stepTrait = function(inputId, step){
      if(inputId === 'ring_void'){
        const btn = document.querySelector('#ringsWrap .stepbtn[data-ring="void"][data-step="' + step + '"]');
        if(btn) btn.click();
      } else {
        const input = $(inputId);
        input.value = Math.max(1, Math.min(10, parseInt(input.value || '0', 10) + step));
        fire(input, 'input');
        fire(input, 'change');
      }
      api.render();
    };
    // Apply School can stop to ask its own questions; wait for it to finish or be cancelled.
    api.applySchool = async function(name){
      $('cfs_school').value = name;
      fire($('cfs_school'), 'change');
      api.busy = true;
      api.refreshNav();
      try {
        $('cfs_applySchool').click();
        await new Promise(function(resolve){
          const started = Date.now();
          (function wait(){
            const asking = Array.from(document.querySelectorAll('.roll-modal-overlay')).some(function(o){ return o.style.display === 'flex'; });
            if(api.appliedSchool() === name && !asking) return resolve();
            if(!asking && Date.now() - started > 400) return resolve();   // cancelled, or nothing to ask
            setTimeout(wait, 60);
          })();
        });
      } finally {
        api.busy = false;
      }
      api.state.school = api.appliedSchool() === name ? name : api.state.school;
      api.render();
    };

    // ---- Frame ----
    api.build = function(){
      if(api.view) return api.view;
      const view = el('div', 'cw112-view');
      view.id = 'cw112View';
      view.hidden = true;
      view.setAttribute('role', 'dialog');
      view.setAttribute('aria-modal', 'true');
      view.setAttribute('aria-labelledby', 'cw112Title');
      const head = el('div', 'cw112-head');
      const progress = el('p', 'cw112-progress');
      progress.id = 'cw112Progress';
      head.appendChild(progress);
      const dots = el('div', 'cw112-dots');
      dots.id = 'cw112Dots';
      head.appendChild(dots);
      const title = el('h2', 'cw112-title');
      title.id = 'cw112Title';
      title.tabIndex = -1;
      head.appendChild(title);
      const intro = el('p', 'cw112-intro');
      intro.id = 'cw112Intro';
      head.appendChild(intro);
      view.appendChild(head);
      const body = el('div', 'cw112-body');
      body.id = 'cw112Body';
      view.appendChild(body);
      const nav = el('div', 'cw112-nav');
      const reason = el('p', 'cw112-reason');
      reason.id = 'cw112Reason';
      reason.setAttribute('role', 'status');
      nav.appendChild(reason);
      const buttons = el('div', 'cw112-buttons');
      const back = el('button', 'ghost cw112-back', '‹ Back');
      back.type = 'button';
      back.id = 'cw112BackBtn';
      const exit = el('button', 'ghost cw112-exit', 'Exit');
      exit.type = 'button';
      exit.id = 'cw112Exit';
      const next = el('button', 'cw112-next', 'Next ›');
      next.type = 'button';
      next.id = 'cw112Next';
      buttons.appendChild(back);
      buttons.appendChild(exit);
      buttons.appendChild(next);
      nav.appendChild(buttons);
      view.appendChild(nav);
      document.body.appendChild(view);
      api.view = view;
      back.addEventListener('click', function(){ if(api.index > 0 && !api.busy){ api.index--; api.render(true); } });
      next.addEventListener('click', function(){ api.next(); });
      exit.addEventListener('click', function(){ api.exit(); });
      return view;
    };
    api.render = function(moveFocus){
      if(!api.view) return;
      const step = api.steps[api.index];
      $('cw112Progress').textContent = 'New character · Step ' + (api.index + 1) + ' of ' + api.steps.length;
      const dots = $('cw112Dots');
      dots.textContent = '';
      api.steps.forEach(function(s, i){
        dots.appendChild(el('span', 'cw112-dot' + (i < api.index ? ' cw112-dot-done' : i === api.index ? ' cw112-dot-now' : '')));
      });
      $('cw112Title').textContent = step.title;
      $('cw112Intro').textContent = step.intro;
      const body = $('cw112Body');
      const scroll = api.view.scrollTop;
      body.textContent = '';
      step.render(body);
      if(!moveFocus) api.view.scrollTop = scroll;
      api.refreshNav();
      if(moveFocus){
        api.view.scrollTop = 0;
        $('cw112Title').focus({preventScroll:true});
      }
    };
    api.refreshNav = function(){
      if(!api.view) return;
      const step = api.steps[api.index];
      const reason = api.busy ? 'Waiting for the School’s own questions…' : step.check();
      const last = api.index === api.steps.length - 1;
      const next = $('cw112Next');
      next.textContent = last ? 'Finish' : 'Next ›';
      next.disabled = !!reason;
      $('cw112Reason').textContent = reason;
      $('cw112BackBtn').disabled = api.index === 0 || api.busy;
    };
    api.next = function(){
      if(api.busy || api.steps[api.index].check()) return;
      if(api.index === api.steps.length - 1){ api.finish(); return; }
      api.index++;
      api.render(true);
    };
    api.start = function(){
      api.build();
      api.index = 0;
      api.state = {};
      api.view.hidden = false;
      api.render(true);
    };
    api.close = function(){
      if(api.view) api.view.hidden = true;
      if(typeof CL11 === 'object' && CL11) CL11.flush();
    };
    api.finish = function(){
      api.close();
      setStatus('"' + $('f_name').value.trim() + '" is ready. Skills and Advantages are next, on the sheet.');
    };
    api.exit = async function(){
      const ok = await appConfirm('Leave the wizard? Your character is saved as it is now, and stays in your Characters list to finish on the sheet.', 'Leave', 'ghost', 'Stay');
      if(!ok) return;
      api.close();
      setStatus('Wizard closed. Your character is saved; finish it on the sheet.');
    };
    api.isOpen = function(){ return !!api.view && !api.view.hidden; };
    return api;
  })();

  // Launched from Phase 11's Create New Character, reached by property at call time.
  if(typeof CL11 === 'object' && CL11 && typeof CL11.createNew === 'function'){
    const cw112PreviousCreate = CL11.createNew;
    CL11.createNew = async function(){
      const result = await cw112PreviousCreate.apply(this, arguments);
      if(CW112.enabled() && currentId) CW112.start();
      return result;
    };
  }
  // ============ END PART K PHASE 11.2 ============
