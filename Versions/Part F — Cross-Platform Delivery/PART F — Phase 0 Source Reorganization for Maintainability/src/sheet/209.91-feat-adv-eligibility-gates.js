  // ========= PART I FEATURE 4.55: ELIGIBILITY GATES + GREAT POTENTIAL SKILL VALIDATION =========
  //
  // Two audit items, both scoped from LIVE MEASUREMENT rather than from the reports, because the
  // reports overstated both -- the same trap this phase family has now hit three times running.
  //
  //   * "Friendly Kami can still be selected by a non-Shugenja." True, and confirmed live: the
  //     quick-add option is not disabled, and its configuration modal opens in full on a
  //     character with no School at all. Feature 4.53 fixed the EFFECT (the bonus resolves to
  //     nothing and the row says why); nothing ever gated the PICK.
  //   * "Great Potential's Skill field should offer the character's own Skills, not free text."
  //     Half right. It is NOT a bare text input -- 209.81 already backs it with a <datalist> of
  //     all 44 SKILL_LIBRARY names. The two real defects are that the list is the master
  //     catalogue rather than the Skills this character actually has, and that the field accepts
  //     ANY string with no validation: "Underwater Basket Weaving" was entered, confirmed, and
  //     saved as a configured Skill with no complaint.
  //
  // THE CONSTRAINT THAT SHAPED THE SKILL HALF. Applying a School does NOT populate #skillsBody.
  // Measured: an Isawa Shugenja character reports shugenja=true and five schoolSkills, and its
  // Skills table is still empty. So a strict "your Skills only" dropdown would be EMPTY for most
  // characters mid-build, which is why this keeps the text input and re-orders the list behind it
  // rather than replacing it with a <select>.
  //
  // WHY THE PICKER NEEDS A REFRESH AND NOT JUST A BUILD-TIME FLAG. buildAdvDisadvQuickAdd runs
  // exactly once, at load (040-lib-kata-kiho-spells.js). Eligibility depends on School, which the
  // player types later, so the disabled state has to be recomputed on the recalc cycle.
  const ADV_ELIGIBILITY_GATES_ENABLED = true;

  const R455 = (function(){
    const api = {};
    api.enabled = function(){ return ADV_ELIGIBILITY_GATES_ENABLED; };

    const norm = function(name){ return String(name || '').trim().toLowerCase(); };

    // ---------- Eligibility ----------
    //
    // The picker needs a SHORT label ("Shugenja only") where Feature 4.53's row needs a full
    // sentence ("Requires a Shugenja School -- no bonus applies."), so the wording lives here.
    // The VERDICT deliberately does not: where 4.53 knows an entry, api.ineligible() asks 4.53
    // whether it is eligible and only supplies its own wording. That way the greyed-out option
    // and the row explaining itself can never disagree about WHETHER an entry qualifies -- they
    // are two presentations of one decision, not two decisions. With 4.53 removed, the `needs`
    // check below is the fallback and Friendly Kami keeps working.
    api.RULES = {
      'friendly kami':       { needs:'shugenja', label:'Shugenja only' },
      'elemental imbalance': { needs:'shugenja', label:'Shugenja only' },
    };

    api.shugenja = function(){
      return !!(typeof D45 === 'object' && D45 && typeof D45.state === 'function' && D45.state().shugenja);
    };

    api.ineligible = function(name){
      if(!api.enabled()) return null;
      const rule = api.RULES[norm(name)];
      if(!rule) return null;
      if(typeof R453 === 'object' && R453 && typeof R453.ineligibilityReason === 'function' &&
         R453.ELIGIBILITY && R453.ELIGIBILITY[norm(name)]){
        return R453.ineligibilityReason(name) ? rule.label : null;
      }
      if(rule.needs === 'shugenja') return api.shugenja() ? null : rule.label;
      return null;
    };

    // ---------- The quick-add pickers ----------
    api.PICKERS = ['advQuickAdd', 'disadvQuickAdd'];

    api.decoratePickers = function(){
      if(!api.enabled()) return 0;
      let disabledCount = 0;
      api.PICKERS.forEach(function(id){
        const select = document.getElementById(id);
        if(!select) return;
        Array.prototype.forEach.call(select.options, function(option){
          if(!option.value) return;                       // the "— choose one to add —" placeholder
          // The untouched label is cached on the first pass, so running this every recalc can
          // never stack a second " — Shugenja only" onto a label that already carries one.
          if(option.dataset.baseLabel === undefined) option.dataset.baseLabel = option.textContent;
          const reason = api.ineligible(option.value);
          const wanted = reason ? option.dataset.baseLabel + ' — ' + reason : option.dataset.baseLabel;
          if(option.textContent !== wanted) option.textContent = wanted;
          option.disabled = !!reason;
          if(reason) disabledCount++;
        });
      });
      return disabledCount;
    };

    // ---------- Great Potential's Skill field ----------
    api.ownSkills = function(){
      return Array.prototype.map.call(document.querySelectorAll('#skillsBody .sk-name'), function(el){
        return String(el.value || '').trim();
      }).filter(Boolean);
    };

    api.schoolSkills = function(){
      if(typeof D45 !== 'object' || !D45 || typeof D45.state !== 'function') return [];
      return (D45.state().schoolSkills || []).filter(Boolean);
    };

    api.librarySkills = function(){
      if(typeof D45 === 'object' && D45 && typeof D45.skills === 'function') return D45.skills();
      if(typeof SKILL_LIBRARY === 'undefined') return [];
      return SKILL_LIBRARY.map(function(skill){ return skill.name; });
    };

    // Own rows first, then the School's Skills, then the rest of the catalogue. Order is the
    // whole mechanism here: a <datalist> has no grouping a phone will render, so the only way to
    // surface the Skills that actually matter is to put them at the top of the list.
    api.prioritisedSkills = function(){
      const seen = Object.create(null);
      const out = [];
      const push = function(list){
        list.forEach(function(name){
          const key = norm(name);
          if(!key || seen[key]) return;
          seen[key] = true;
          out.push(name);
        });
      };
      push(api.ownSkills());
      push(api.schoolSkills());
      push(api.librarySkills());
      return out;
    };

    api.isKnownSkill = function(name){
      const key = norm(name);
      if(!key) return false;
      return api.prioritisedSkills().some(function(candidate){ return norm(candidate) === key; });
    };

    // #advConfigFreeText is shared with languagePick, where any string is legitimately valid, so
    // every hook below has to know it is on the Skill step specifically. This reads 209.81's own
    // modal state rather than looking for #advConfigSkillOptions in the DOM: that datalist
    // survives in the grid after the modal closes, so presence of the node proves only that a
    // Skill step happened at some point, not that one is open now.
    api.onSkillStep = function(){
      return !!(advConfigExtendedModal && advConfigExtendedModal.kind === 'skillPick');
    };

    api.HINT_ID = 'advConfigSkillHint';

    api.decorateSkillStep = function(){
      if(!api.enabled() || !api.onSkillStep()) return 0;
      const list = document.getElementById('advConfigSkillOptions');
      if(!list) return 0;
      const skills = api.prioritisedSkills();
      list.innerHTML = skills.map(function(name){
        return '<option value="' + escAttr(name) + '"></option>';
      }).join('');
      const input = document.getElementById('advConfigFreeText');
      if(input && !document.getElementById(api.HINT_ID)){
        const own = api.ownSkills().length;
        const school = api.schoolSkills().length;
        const lead = own ? 'Your Skills are listed first. '
          : (school ? 'Your School’s Skills are listed first. ' : '');
        const hint = document.createElement('p');
        hint.id = api.HINT_ID;
        hint.className = 'adv-config-skill-hint';
        hint.textContent = lead + 'Great Potential raises the Raise cap using this Skill’s Rank, ' +
          'so a Skill you have not taken yet does nothing for you.';
        input.insertAdjacentElement('afterend', hint);
      }
      return skills.length;
    };

    // Returns true when it has REFUSED the confirm, matching the contract 209.81 already uses for
    // its own validation steps (setStatus + return true means "handled, do not commit").
    api.blockUnknownSkill = function(){
      if(!api.enabled() || !api.onSkillStep()) return false;
      const input = document.getElementById('advConfigFreeText');
      const name = String(input && input.value || '').trim();
      if(!name) return false;                     // 209.81's own "Enter a Skill" message still applies
      if(api.isKnownSkill(name)) return false;
      setStatus('“' + name + '” is not one of your Skills or a Skill in the list. ' +
        'Choose an existing Skill, or add it to your Skills table first.');
      return true;
    };

    return api;
  })();

  if(R455.enabled()){
    // The pickers are built once at load but eligibility changes with School, so this rides the
    // recalc cycle. Keeps the previous binding and delegates, composing with Phase 4.5.2's own
    // recalc wrapper rather than replacing it.
    const r455PrevRecalc = recalcAll;
    recalcAll = function(){
      const result = r455PrevRecalc();
      R455.decoratePickers();
      return result;
    };

    // The Skill step's list and hint, after whatever rendered the step.
    const r455PrevRender = renderExtendedAdvConfigModal;
    renderExtendedAdvConfigModal = function(){
      const result = r455PrevRender();
      R455.decorateSkillStep();
      return result;
    };

    // Validation sits OUTSIDE 209.81's and Phase 4.5.2's existing confirm wrappers, so it sees
    // the final value after every other handler has had its turn.
    const r455PrevConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){
      if(R455.blockUnknownSkill()) return true;
      return r455PrevConfirm();
    };

    const r455PrevInit = initAdvConfig;
    initAdvConfig = function(){
      r455PrevInit();
      R455.decoratePickers();
    };
  }
