  // ========= PART I FEATURE 4.5.14: SEVEN FORTUNES' BLESSING (A01) =========
  //
  // A01 was the one entry Feature 4.5.13's own README named as still missing: "Seven Fortunes'
  // Blessing remains the canonical missing variable-configuration Advantage and needs
  // source-confirmed Fortune data before implementation" (BUILD-LEDGER.md, 13 September 2026).
  // That data is now recorded in the audit's own source note
  // (PART I - Phase 4.5 Remaining Configuration Audit/SOURCE-CORE-PREPARATION.md, "A01 - Seven
  // Fortunes' Blessing", printed pp.153-154 / PDF pp.156-157), which is what this fragment quotes.
  //
  // SCOPE, matched to what 4.5.13 shipped for A02 Blackmail rather than to D04a/D04b's fuller
  // roll automation of the mirror-image Curse (Features 4.5.11-4.5.12). Blackmail is a picker
  // plus a calculated XP cost and nothing else -- "this release neither registers a roll
  // contributor nor grants character resources" (209.925's own header). This entry is priced the
  // same way (a Fortune choice, and for Fukurokujin a required Lore Skill, drive the XP total)
  // and is otherwise a reminder: every Fortune's rule text is read out to the player and applied
  // by hand. Building Bishamon's Raise-counting and Strength-Trait bonus, or Hotei's Contested
  // Void Roll defence, as real dice-pipeline effects is the same scale of work D04b needed for
  // its own Bishamon branch (a dedicated damage-path change) and Hotei's activation-cost review
  // -- both explicitly flagged by the audit as needing their own review before automation, not a
  // line of code inside a schema-and-picker release. That work is left for a future point
  // release; nothing here forecloses it.
  //
  // WIRED LIKE 209.925, NOT INSIDE IT. Feature 4.5.13 is already shipped, measured and QA'd
  // (136/136 own, 1128/1128 combined, byte-identical removal) -- editing its fragment to add a
  // fifth entry would mean re-verifying a release this project's own rules say to leave alone
  // ("do not modify previous phases or layers"). This entry is a new fragment that chains onto
  // the SAME extended-config doorway 209.925 uses (isExtendedAdvConfigComplete,
  // resolveAdvDisadvEffect, refreshAdvConfigControl, openExtendedAdvConfigModal,
  // confirmExtendedAdvConfigModal), ordered after 209.925 in the manifest so it wraps 209.925's
  // own bindings exactly the way 209.925 wraps 209.92's. Deleting this fragment restores
  // 209.925's chain untouched.
  //
  // ONE CONFIG TYPE COVERS ALL SEVEN BRANCHES, unlike 209.925's four (one type per named entry):
  // Seven Fortunes' Blessing is one catalogue row with a Fortune picker inside it, the same shape
  // D04a/D04b gave the Curse side. `fortuneBlessingPick` is therefore this fragment's own new
  // config-type string, in this fragment's own name-keyed schema table (per 209.8's own
  // rationale for keeping the schema out of ADV_LIBRARY): completely independent of D45's
  // `fortunePick` string on the Disadvantage side -- different registry, different config-type
  // namespace, so the two cannot collide despite the similar name.
  //
  // FUKUROKUJIN'S SECONDARY FIELD, per the audit's own boundary: "Record the chosen Fortune and
  // require the secondary Lore Skill only for Fukurokujin... Changing to another Fortune must
  // clear that secondary field." `api.complete()` enforces both halves: `loreSkill` is required
  // (non-empty) when the picked Fortune is Fukurokujin, and must be ABSENT for every other
  // Fortune -- so a re-pick away from Fukurokujin cannot leave a stale Lore Skill sitting in a
  // saved config that a later re-read would treat as still meaningful.
  //
  // VARIABLE PRICE, NOT A PROVISIONAL ONE. Like Blackmail (not like Forbidden Knowledge/
  // Inheritance/Way of the Land, whose prices are fixed regardless of their optional notes), this
  // entry's cost depends on the pick itself -- which Fortune, and whether the character's own
  // Clan is one of that Fortune's listed discount Clans. Until the pick is COMPLETE the row shows
  // 0, never a guessed tier, matching 209.8's own "a variable price is not a provisional price"
  // rule and Blackmail's own NAMED-BLANK-PRICE behaviour.
  const ADV_FORTUNE_BLESSING_ENABLED = true;

  const FB4514 = (function(){
    const api = {};
    api.enabled = function(){ return ADV_FORTUNE_BLESSING_ENABLED && ADV_CONFIG_ENABLED; };
    api.NAME = 'Seven Fortunes’ Blessing';

    // Source: printed pp.153-154 / PDF pp.156-157. `award` is the normal cost; `clans` lists the
    // eligible Clan(s) that instead pay `clanAward`; `lore` marks Fukurokujin's secondary field.
    // Every `note` is the source-confirmed effect, worded as an instruction to apply by hand --
    // none of this fragment's numbers move a die or a Trait.
    api.FORTUNES = {
      'Benten': {
        award: 4, clans: ['Crane'], clanAward: 3, lore: false,
        note: 'Apply +0k1 to a Social Skill Roll you make to persuade — not to coerce. Declare it ' +
          'yourself when you roll; this sheet does not add it automatically.',
      },
      'Bishamon': {
        award: 5, clans: ['Crab', 'Lion'], clanAward: 4, lore: false,
        note: 'Declaring and successfully making three Raises on an attack for Increased Damage ' +
          'earns one additional Raise — Free Raises do not count toward it. Separately, apply ' +
          '+1k0 to Strength Trait Rolls. Apply both yourself; this sheet does not count Raises ' +
          'or add either bonus automatically.',
      },
      'Daikoku': {
        award: 4, clans: ['Mantis'], clanAward: 3, lore: false,
        note: 'Apply +1k1 to all Commerce Skill Rolls yourself; this sheet does not add it automatically.',
      },
      'Ebisu': {
        award: 4, clans: ['Unicorn'], clanAward: 3, lore: false,
        note: 'Apply +1k1 to Social Skill Rolls with citizens of Rokugan outside the samurai ' +
          'caste. You judge who qualifies and apply the bonus yourself.',
      },
      'Fukurokujin': {
        award: 4, clans: ['Dragon', 'Phoenix'], clanAward: 3, lore: true,
        note: 'Choose one Lore Skill when you take this blessing. Apply +1k1 to Skill Rolls using ' +
          'that Lore Skill yourself; this sheet does not add it automatically.',
      },
      'Hotei': {
        award: 4, clans: [], clanAward: null, lore: false,
        note: 'An instigator whose effect would make you lose Void Points must first defeat you ' +
          'in a Contested Void Roll. If the effect already requires a Contested Roll, increase ' +
          'your roll by +10 instead. Apply this yourself; this sheet does not track Void-loss instigators.',
      },
      'Jurojin': {
        award: 4, clans: ['Scorpion'], clanAward: 3, lore: false,
        note: 'Apply +2k0 to rolls to resist disease or poison yourself; this sheet does not add ' +
          'it automatically.',
      },
    };

    api.help = 'Core pp.153–154 — seven Fortune blessings. Normal cost is 4 XP, except Bishamon ' +
      'at 5 XP; a listed eligible Clan buys its own branch for 1 point less (Hotei lists none). ' +
      'All benefits below are managed manually with your GM.\n\n' +
      'Benten (Crane 3): +0k1 on a Social Skill Roll used to persuade; coercion is excluded.\n\n' +
      'Bishamon (Crab or Lion 4, base 5): three successful Increased Damage Raises on an attack ' +
      'earn one additional Raise (Free Raises do not count); separately +1k0 on Strength Trait Rolls.\n\n' +
      'Daikoku (Mantis 3): +1k1 on all Commerce Skill Rolls.\n\n' +
      'Ebisu (Unicorn 3): +1k1 on Social Skill Rolls with citizens of Rokugan outside the samurai caste.\n\n' +
      'Fukurokujin (Dragon or Phoenix 3): choose one Lore Skill; +1k1 on Skill Rolls using it.\n\n' +
      'Hotei: an instigator whose effect would make you lose Void Points must first defeat you in ' +
      'a Contested Void Roll; if the effect already requires a Contested Roll, increase your roll ' +
      'by +10 instead.\n\n' +
      'Jurojin (Scorpion 3): +2k0 on rolls to resist disease or poison.\n\n' +
      'Seven Fortunes’ Blessings and Curses are explicitly exempt from the Advantage/Disadvantage ' +
      'opposing-pair restriction: one Fortune can bless while another curses.';

    api.fortuneNames = function(){ return Object.keys(api.FORTUNES); };
    api.spec = function(fortune){ return api.FORTUNES[fortune] || null; };
    api.fortuneOf = function(config){
      const text = config && typeof config.fortune === 'string' ? config.fortune.trim() : '';
      return Object.prototype.hasOwnProperty.call(api.FORTUNES, text) ? text : null;
    };
    api.eligibleClan = function(fortune){
      const spec = api.spec(fortune);
      if(!spec || !spec.clans.length) return false;
      const clan = normalizeAdvName(advConfigCharacterClan());
      if(!clan) return false;
      return spec.clans.some(function(name){ return normalizeAdvName(name) === clan; });
    };
    api.price = function(fortune){
      const spec = api.spec(fortune);
      if(!spec) return 0;
      return api.eligibleClan(fortune) ? spec.clanAward : spec.award;
    };
    api.summary = function(config){
      const fortune = api.fortuneOf(config);
      if(!fortune) return '';
      const spec = api.spec(fortune);
      const lore = spec.lore && typeof config.loreSkill === 'string' && config.loreSkill.trim()
        ? ' (' + config.loreSkill.trim() + ')' : '';
      return fortune + lore + ' — apply blessing manually';
    };

    api.owns = function(schema){ return !!schema && schema.fortuneBlessing4514 === true; };

    api.complete = function(schema, config){
      if(!api.enabled() || !api.owns(schema) || !config || Array.isArray(config) ||
          config.type !== schema.type || config.revision !== 1) return false;
      const allowed = ['type', 'revision', 'value', 'fortune', 'loreSkill'];
      if(Object.keys(config).some(function(key){ return allowed.indexOf(key) === -1; })) return false;
      const fortune = api.fortuneOf(config);
      if(fortune === null) return false;
      const spec = api.spec(fortune);
      if(spec.lore) return typeof config.loreSkill === 'string' && config.loreSkill.trim().length > 0;
      // Changing away from Fukurokujin must clear its Lore Skill, not just stop reading it.
      return config.loreSkill === undefined;
    };

    api.resolve = function(name, config){
      if(!api.enabled()) return null;
      const schema = advConfigSchemaFor(name);
      if(!api.owns(schema) || !api.complete(schema, config)) return null;
      const fortune = api.fortuneOf(config);
      return {
        effect: 'fortuneBlessingReminder', fortune: fortune,
        cost: api.price(fortune), label: api.summary(config),
      };
    };

    api.addInfo = function(scope){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fortuneBlessing4514-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        // The trunk's existing information overlay renders body as textContent, never HTML.
        populateInfoOverlay(api.NAME, 'Reference — not automatic effects', api.help);
      });
      scope.appendChild(button);
    };

    api.refresh = function(div){
      if(!api.enabled()) return false;
      const nameEl = div && div.querySelector('.en-name');
      const schema = nameEl && advConfigSchemaFor(nameEl.value);
      if(!api.owns(schema)) return false;
      const stored = !!div.dataset.advConfig;
      const config = readAdvConfig(div);
      const valid = api.complete(schema, config);
      const wrong = div.parentElement && div.parentElement.id === 'disadvList';
      const costEl = div.querySelector('.en-cost');
      const row = advConfigRowFor(div);
      let warning = '', summaryText = '';
      if(wrong) warning = 'This entry belongs in Advantages; move it there before configuring.';
      else if(stored && !valid) warning = 'Saved setting kept — unsupported or invalid configuration. Review before replacing it.';
      else if(valid){
        const fortune = api.fortuneOf(config);
        if(costEl) costEl.value = api.price(fortune);
        summaryText = api.summary(config);
      } else {
        if(costEl) costEl.value = 0;
        const fortune = api.fortuneOf(config);
        warning = fortune && api.spec(fortune) && api.spec(fortune).lore
          ? 'Needs a chosen Lore Skill — not priced yet'
          : 'Needs a chosen Fortune — not priced yet';
      }
      row.className = 'adv-config-row fortuneBlessing4514-row ' + (warning ? 'unconfigured' : 'configured');
      row.innerHTML = warning
        ? '<span class="adv-config-warn fortuneBlessing4514-warning">' + escHtml(warning) + '</span>'
        : '<span class="adv-config-summary fortuneBlessing4514-badge">' + escHtml(summaryText) + '</span>';
      if(!wrong){
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'ghost adv-config-btn';
        button.textContent = stored ? 'Change' : 'Choose…';
        button.setAttribute('aria-label', 'Configure ' + api.NAME);
        button.addEventListener('click', function(){ openAdvConfigModal(div); });
        row.appendChild(button);
        api.addInfo(row);
      }
      return true;
    };

    api.open = function(div, schema){
      if(!api.enabled() || !api.owns(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){
        setStatus('Seven Fortunes’ Blessing belongs in Advantages.'); return true;
      }
      const config = readAdvConfig(div);
      const currentFortune = api.fortuneOf(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = { kind: 'fortuneBlessing4514', schema: schema };
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose the Fortune whose blessing you have earned';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !api.complete(schema, config)
        ? 'The saved setting is unsupported. Confirming replaces it with this choice. ' : '') +
        'Each blessing’s bonus is applied manually at the table; this sheet does not change any dice roll.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = api.fortuneNames().map(function(fortune){
        const spec = api.spec(fortune);
        const checked = fortune === currentFortune;
        const cost = api.price(fortune);
        return '<div class="affinity-pick-item' + (checked ? ' checked' : '') + '" data-value="' + escAttr(fortune) + '">' +
          '<label for="fortuneBlessing4514_' + escAttr(fortune) + '">' + escHtml(fortune) +
            ' <span class="adv-config-cost">' + cost + ' pt' + (cost === 1 ? '' : 's') + '</span></label>' +
          '<input type="checkbox" id="fortuneBlessing4514_' + escAttr(fortune) + '"' + (checked ? ' checked' : '') + '>' +
          '</div>';
      }).join('');
      const loreWrap = document.createElement('div');
      loreWrap.className = 'fortuneBlessing4514-lore-wrap';
      const currentSpec = currentFortune && api.spec(currentFortune);
      loreWrap.hidden = !(currentSpec && currentSpec.lore);
      loreWrap.innerHTML = '<label class="fortuneBlessing4514-label" for="fortuneBlessing4514Lore">Chosen Lore Skill</label>' +
        '<input class="fortuneBlessing4514-input" id="fortuneBlessing4514Lore" type="text" value="' +
        escAttr(config && typeof config.loreSkill === 'string' ? config.loreSkill : '') + '">';
      grid.appendChild(loreWrap);
      const error = document.createElement('p');
      error.className = 'fortuneBlessing4514-error'; error.setAttribute('role', 'alert'); error.hidden = true;
      grid.appendChild(error);
      api.addInfo(grid);
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
      const boxes = items.map(function(item){ return item.querySelector('input[type="checkbox"]'); });
      // Ticking one box unticks the rest, exactly as the base ringPick/severityTier grid does.
      boxes.forEach(function(box, i){
        box.addEventListener('change', function(){
          if(box.checked){
            boxes.forEach(function(other, j){ if(j !== i){ other.checked = false; items[j].classList.remove('checked'); } });
            items[i].classList.add('checked');
          } else {
            items[i].classList.remove('checked');
          }
          const picked = box.checked ? items[i].dataset.value : null;
          const spec = picked && api.spec(picked);
          loreWrap.hidden = !(spec && spec.lore);
          if(!loreWrap.hidden) document.getElementById('fortuneBlessing4514Lore').focus({ preventScroll: true });
        });
      });
      const firstBox = grid.querySelector('.affinity-pick-item input');
      if(firstBox) firstBox.focus({ preventScroll: true });
      return true;
    };

    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'fortuneBlessing4514') return false;
      const div = advConfigTargetEntry;
      const nameEl = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !nameEl || normalizeAdvName(nameEl.value) !== normalizeAdvName(api.NAME)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const grid = document.getElementById('advConfigGrid');
      const chosen = Array.from(grid.querySelectorAll('.affinity-pick-item'))
        .find(function(item){ return item.querySelector('input[type="checkbox"]').checked; });
      const error = grid.querySelector('.fortuneBlessing4514-error');
      if(!chosen){
        error.textContent = 'Choose a Fortune before confirming.'; error.hidden = false;
        setStatus('Choose a Fortune before confirming.');
        return true;
      }
      const fortune = chosen.dataset.value;
      const spec = api.spec(fortune);
      const config = { type: state.schema.type, revision: 1, fortune: fortune };
      if(spec.lore){
        const loreInput = document.getElementById('fortuneBlessing4514Lore');
        const loreValue = loreInput ? loreInput.value.trim() : '';
        if(!loreValue){
          error.textContent = 'Enter the Lore Skill Fukurokujin blesses before confirming.'; error.hidden = false;
          setStatus('Enter the Lore Skill before confirming.');
          return true;
        }
        config.loreSkill = loreValue;
      }
      config.value = api.summary(config);
      return commitExtendedAdvConfig(config, api.NAME + ': ' + fortune + ' configured.');
    };

    return api;
  })();

  if(FB4514.enabled()){
    registerAdvConfigSchema(FB4514.NAME, {
      type: 'fortuneBlessingPick', effect: 'fortuneBlessingReminder', fortuneBlessing4514: true,
      title: FB4514.NAME, prompt: 'Choose the Fortune whose blessing you have earned',
    });
    const fortuneBlessing4514PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return FB4514.owns(schema) ? FB4514.complete(schema, config) : fortuneBlessing4514PreviousComplete(schema, config);
    };
    const fortuneBlessing4514PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return FB4514.owns(advConfigSchemaFor(name)) ? FB4514.resolve(name, config) : fortuneBlessing4514PreviousResolve(name, config);
    };
    const fortuneBlessing4514PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!FB4514.refresh(div)) fortuneBlessing4514PreviousRefresh(div); };
    const fortuneBlessing4514PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return FB4514.open(div, schema) || fortuneBlessing4514PreviousOpen(div, schema); };
    const fortuneBlessing4514PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return FB4514.confirm() || fortuneBlessing4514PreviousConfirm(); };
  }
