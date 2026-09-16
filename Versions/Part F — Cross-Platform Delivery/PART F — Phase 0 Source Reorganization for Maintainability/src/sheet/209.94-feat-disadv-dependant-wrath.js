  // ========= PART I FEATURE 4.58: DEPENDANT AND WRATH OF THE KAMI =========
  //
  // D02 and D07, two of the audit's remaining missing configuration handlers. Both are
  // "pick one thing, price it, show a reminder" entries with no dice-engine work, which is why
  // they ship together: the whole phase is one install() each plus a badge.
  //
  // FOUR THINGS WERE CHECKED LIVE FIRST, and three of them changed the design.
  //
  // 1. D45 CANNOT HOST AN OPTIONAL FIELD. The audit proposed a multi-field Dependant modal
  //    (name, helplessness, frequency, points). D45.readStep() validates EVERY step with
  //    `!!picked` for a text field, so a blank one blocks Next -- there is no optional step and
  //    adding one would mean editing 4.5.2's own function. So the modal asks the single REQUIRED
  //    thing (the agreed amount) and the optional detail lives on the row, where blank is
  //    naturally fine. Better on a phone anyway: one decision in the modal, detail edited in
  //    place.
  //
  // 2. NEITHER ENTRY MAY ADD A configTypes STRING. 4.5.2's own harness pins api.configTypes to
  //    an exact twelve-element array (D45-SCHEMA-TYPES). Appending the audit's proposed
  //    'agreedPointsPick' would fail that check, and no fixture correction could fix it the way
  //    4.57 corrected R453-CAT-06 -- an exact-array assertion cannot pass both with this phase
  //    present and removed. So both entries reuse an existing shape honestly: Dependant is
  //    D45's `rankPick` (its no-ladder form IS "one free positive integer", the same shape
  //    Unlucky uses), and Wrath of the Kami is `elementPick`.
  //
  // 3. REUSING elementPick IS SAFE, and that was not obvious. Elemental Imbalance is the only
  //    other elementPick and it carries a Willpower gate before casting -- exactly the "no
  //    change to the player's own casting" the audit forbids here. Grepped: `elementPick`
  //    appears ONLY inside 209.85, in the definition map, the configTypes list, and the built-in
  //    validate/steps that a per-definition validate/steps overrides. Every Elemental Imbalance
  //    behaviour, including the gate and 4.55's Shugenja eligibility rule, is keyed on the
  //    NAME, not the type. Nothing can leak.
  //
  // 4. D45 WOULD HAVE WRITTEN 'Rank undefined' INTO DEPENDANT'S LEGACY value FIELD.
  //    D45.confirm() sets `c.value = String(c.tenet||c.element||c.target||c.tier||('Rank '+c.rank))`
  //    and Dependant has none of those -- its number is `points`. The `finalize` hook runs on the
  //    next line, which is what it is for; this phase uses it rather than renaming its field to
  //    `rank` to suit a display string.
  //
  // WHAT NEITHER ENTRY DOES. Dependant records no NPC and simulates nothing. Wrath of the Kami
  // registers NO pre-roll modifier: the Free Raise belongs to the OTHER caster, so there is
  // nothing to apply to this character's pool -- it is a reminder to communicate, the same
  // approach already approved for Magic Resistance.
  const DISADV_DEPENDANT_WRATH_ENABLED = true;

  const R458 = (function(){
    const api = {};
    api.enabled = function(){ return DISADV_DEPENDANT_WRATH_ENABLED; };
    api.DEPENDANT = 'Dependant';
    api.WRATH = 'Wrath of the Kami';

    // The five elements a spell in THIS sheet's own library can carry, taken from that library
    // rather than from the Rings list: RINGS holds four (Void is not a Ring row), while the spell
    // data carries Air 80, Earth 58, Fire 46, Water 43 and Void 30. 'Universal' (3 spells) is
    // deliberately NOT offered -- it marks a spell any shugenja may cast, not an element the kami
    // could be wrathful in. See this phase's README: the audit asked for the element list to be
    // confirmed rather than assumed from the Ring list, and this is a measured answer to that,
    // not a source citation.
    api.ELEMENTS = ['Air', 'Earth', 'Fire', 'Water', 'Void'];

    api.intOf = function(value){
      const text = String(value === undefined || value === null ? '' : value).trim();
      if(!/^\d+$/.test(text)) return null;
      const number = Number(text);
      return Number.isSafeInteger(number) && number >= 1 ? number : null;
    };

    api.textOf = function(value){
      return typeof value === 'string' ? value.trim() : '';
    };

    // ---------- D02. Dependant ----------
    // "Roughly 2-6" in the catalogue is guidance the book gives, not a ladder. It is never
    // turned into a dropdown of legal values and never enforced as a range: the number is a
    // player/GM agreement, and the audit is explicit that inventing tiers would misrepresent it.
    api.dependant = {
      type: 'rankPick',
      steps: function(){
        return [{ field: 'points', label: 'Agreed point value — what you and your GM settled on',
          number: true, min: 1 }];
      },
      validate: function(config){ return api.intOf(config && config.points) !== null; },
      finalize: function(config){
        const points = api.intOf(config.points);
        config.value = points === null ? '' : points + ' points';
      },
      resolve: function(config){
        const points = api.intOf(config.points);
        if(points === null) return null;
        const who = api.textOf(config.dependant);
        return {
          cost: points, points: points,
          dependant: who, arrangement: api.textOf(config.arrangement),
          summary: 'Agreed at ' + points + ' point' + (points === 1 ? '' : 's') +
            (who ? ' — ' + who : '') + '. The amount is your agreement with the GM, not a fixed scale.',
        };
      },
      decorate: function(div, row, config, effect){ api.decorateDependant(div, row, effect); },
    };

    // The two optional fields. They are rebuilt on every refresh because D45.refresh() clears
    // row.innerHTML, so they commit on `change` (blur or Enter) rather than on every keystroke:
    // writing per-keystroke would re-render the row mid-word and take the caret with it.
    api.decorateDependant = function(div, row, effect){
      if(!api.enabled() || !row || !effect || effect.name !== api.DEPENDANT) return;
      const wrap = document.createElement('span');
      wrap.className = 'dep458-fields';

      const field = function(key, label, value){
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'dep458-input';
        input.value = value || '';
        input.placeholder = label;
        input.setAttribute('aria-label', label);
        input.addEventListener('change', function(){
          const config = readAdvConfig(div);
          if(!config) return;
          config[key] = input.value.trim();
          writeAdvConfig(div, config.type, config);
          recalcAll();
        });
        wrap.appendChild(input);
        return input;
      };

      field('dependant', 'Who depends on you (optional)', effect.dependant);
      field('arrangement', 'The arrangement (optional)', effect.arrangement);
      row.appendChild(wrap);
    };

    // ---------- D07. Wrath of the Kami ----------
    // Shugenja are awarded 4 rather than 3. That is the catalogue's own "Shugenja pay 4" read as
    // a Disadvantage award, and it is a PRICE difference only -- unlike Elemental Imbalance,
    // being a shugenja is not a requirement here, so no eligibility gate is registered and a
    // bushi may take it at 3.
    api.wrath = {
      type: 'elementPick',
      steps: function(){
        return [{ field: 'element', label: 'Choose the Element whose spells the kami turn against you',
          options: api.ELEMENTS.map(function(name){ return { value: name, label: name }; }) }];
      },
      validate: function(config){ return api.ELEMENTS.indexOf(config && config.element) !== -1; },
      resolve: function(config, state){
        if(api.ELEMENTS.indexOf(config.element) === -1) return null;
        const shugenja = !!(state && state.shugenja);
        return {
          cost: shugenja ? 4 : 3, element: config.element, shugenja: shugenja,
          summary: 'Incoming ' + config.element + ' spells targeting you grant their caster one Free Raise. ' +
            'Your own casting, spell slots and Rings are unchanged — tell the GM when a ' +
            config.element + ' spell is cast at you.',
        };
      },
      decorate: function(div, row, config, effect){ api.decorateWrath(row, effect); },
    };

    api.decorateWrath = function(row, effect){
      if(!api.enabled() || !row || !effect || effect.name !== api.WRATH) return;
      const badge = document.createElement('span');
      badge.className = 'wrath458-badge';
      badge.textContent = 'Incoming ' + effect.element + ': caster gains one Free Raise';
      row.appendChild(badge);
    };

    return api;
  })();

  if(R458.enabled() && typeof D45 === 'object' && D45 && typeof D45.install === 'function'){
    D45.install(R458.DEPENDANT, R458.dependant);
    D45.install(R458.WRATH, R458.wrath);
  }
