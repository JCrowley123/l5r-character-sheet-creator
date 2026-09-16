  // ========= PART I FEATURE 4.56: PERCEIVED HONOR AND WEALTHY =========
  //
  // Two of the audit's 23 missing configuration handlers (A10 and A16). Both are rank-priced
  // Advantages that have sat in the catalogue with an editable points box and no way to record
  // the rank that box is supposed to price.
  //
  // WHY THIS IS NOT BUILT ON PHASE 4.5.2's D45.install() SEAM, which would have been far less
  // code. D45 exposes a public install(), already implements a `rankPick` that accepts any
  // positive integer with no cap, and supports per-definition steps/validate/resolve hooks --
  // on paper an exact fit for "a free-number rank, matching the Elemental Imbalance style".
  // It was tried, live, before this fragment was written. D45.refresh() opens with
  //
  //     const wrong = div.parentElement?.id !== 'disadvList';
  //
  // and renders "This entry belongs in Disadvantages." for anything else. The modal opened, the
  // number input rendered and the config stored correctly -- and the row still priced at 0 with
  // no summary, because that check is a deliberate invariant of a Disadvantage-only module, not
  // an oversight to work around. Two Advantages do not belong there. So the free-number rank is
  // added on the ADVANTAGE side instead, as its own config type.
  //
  // WHAT THE CATALOGUE ALREADY HAS. Feature 4.53 corrected both entries' data in place:
  // Perceived Honor 3 -> 2 XP per rank with matching text, and Wealthy's "1 less per rank"
  // discount wording -> "1 less off the total". Nothing here re-corrects them; this adds only
  // the handler those corrected prices were waiting for.
  const ADV_RANK_ENTRIES_ENABLED = true;

  const R456 = (function(){
    const api = {};
    api.enabled = function(){ return ADV_RANK_ENTRIES_ENABLED; };

    const norm = function(value){ return String(value || '').trim().toLowerCase(); };

    // Its own type rather than 209.81's `rankPick`, which is a fixed ladder of pre-priced
    // options. Neither entry has a rank cap in the source, and the audit is explicit that one
    // must not be invented, so the rank is typed rather than chosen from a list.
    api.TYPE = 'rankFreePick';

    // A rank is a positive whole number. Rejected: blank, 0, negative, fractional, exponent
    // notation, and anything with trailing characters -- parseInt would accept "3x" as 3.
    api.rankOf = function(value){
      const text = String(value === undefined || value === null ? '' : value).trim();
      if(!/^\d+$/.test(text)) return null;
      const rank = Number(text);
      return Number.isSafeInteger(rank) && rank >= 1 ? rank : null;
    };

    api.honorRank = function(){
      const element = document.getElementById('f_honorRank');
      const rank = element ? Number(element.value) : NaN;
      return Number.isFinite(rank) ? rank : 0;
    };

    // Core p.155 prices Wealthy as rank x 1 XP with a SINGLE 1-XP reduction off the total for a
    // Crane, Unicorn or Imperial character. Not once per rank, and not once per matching
    // identity -- a character cannot hold two of these three anyway, but the discount is
    // written as one subtraction from the total either way.
    api.DISCOUNT_CLANS = ['crane', 'unicorn', 'imperial'];

    api.wealthyDiscount = function(){
      const element = document.getElementById('f_clan');
      return api.DISCOUNT_CLANS.indexOf(norm(element && element.value)) !== -1;
    };

    api.ENTRIES = {
      'Perceived Honor': {
        title: 'Choose a Rank',
        prompt: 'Perceived Honor — choose how many Ranks.',
        label: 'Rank — 2 XP per rank',
        note: 'Anyone reading your Honor Rank perceives it as that many Ranks higher. Your actual ' +
          'Honor is unchanged, and so is everything that depends on it — Honor spending, ' +
          'Honor-based resistance, and any roll that adds your Honor Rank.',
        price: function(rank){ return { cost: 2 * rank }; },
        summary: function(rank){
          const actual = api.honorRank();
          return 'Rank ' + rank + ' — read as Honor ' + (actual + rank) +
            ' (actual ' + actual + ', unchanged)';
        },
      },
      'Wealthy': {
        title: 'Choose a Rank',
        prompt: 'Wealthy — choose how many Ranks.',
        label: 'Rank — 1 XP per rank',
        note: 'Each Rank entitles you to 2 extra koku at character creation. The entitlement is ' +
          'recorded here as a reminder only: no money is added to your sheet, so recalculating, ' +
          'reloading or importing can never mint it twice. Crane, Unicorn and Imperial ' +
          'characters pay 1 XP less off the total, once.',
        price: function(rank){
          const discounted = api.wealthyDiscount();
          // Rank 1 with the discount costs 0 XP. That is the source's arithmetic, and the audit
          // is explicit that no minimum may be borrowed from another Advantage to avoid it.
          return { cost: Math.max(0, rank - (discounted ? 1 : 0)), discounted: discounted };
        },
        summary: function(rank, price){
          return 'Rank ' + rank + ' — ' + price.cost + ' XP' +
            (price.discounted ? ' (clan discount −1)' : '') +
            '; entitles ' + (2 * rank) + ' koku at creation';
        },
      },
    };

    api.entryFor = function(name){
      const wanted = norm(name);
      const key = Object.keys(api.ENTRIES).find(function(entry){ return norm(entry) === wanted; });
      return key ? Object.assign({ name: key }, api.ENTRIES[key]) : null;
    };

    api.complete = function(schema, config){
      if(!schema || schema.type !== api.TYPE || !config || config.type !== api.TYPE) return false;
      return api.rankOf(config.rank) !== null;
    };

    api.resolve = function(name, config){
      if(!api.enabled()) return null;
      const entry = api.entryFor(name);
      if(!entry || !config || config.type !== api.TYPE) return null;
      const rank = api.rankOf(config.rank);
      if(rank === null) return null;
      const price = entry.price(rank);
      return Object.assign({
        effect: 'rankEntry', entryName: entry.name, rank: rank, cost: price.cost,
        label: 'Rank ' + rank,
      }, price);
    };

    // The row summary. Recomputed from the CURRENT sheet on every refresh rather than stored,
    // which is what makes Perceived Honor's readout follow the Honor field: change Honor and the
    // perceived figure moves with it, because nothing here cached the old one.
    api.summaryFor = function(effect){
      if(!effect || effect.effect !== 'rankEntry') return '';
      const entry = api.entryFor(effect.entryName);
      if(!entry) return '';
      return escHtml(entry.summary(effect.rank, effect));
    };

    // ---------- The modal ----------
    api.INPUT_ID = 'advConfigRankInput';

    api.open = function(div, schema){
      const entry = api.entryFor(schema.name);
      const overlay = document.getElementById('advConfigModalOverlay');
      if(!entry || !overlay) return false;
      const current = readAdvConfig(div);
      advConfigTargetEntry = div;
      // 209.81's own modal state, so commitExtendedAdvConfig() below can do the write, close,
      // recalc and status line exactly as it does for every other extended type.
      advConfigExtendedModal = { kind: api.TYPE, schema: schema, config: current || {}, step: 'only' };
      document.getElementById('advConfigTitle').textContent = entry.title;
      document.getElementById('advConfigSubtitle').textContent = entry.prompt;
      const noteEl = document.getElementById('advConfigNote');
      noteEl.textContent = entry.note;
      noteEl.style.display = '';
      const existing = current ? api.rankOf(current.rank) : null;
      document.getElementById('advConfigGrid').innerHTML =
        '<label class="adv-rank-label" for="' + api.INPUT_ID + '">' + escHtml(entry.label) + '</label>' +
        '<input id="' + api.INPUT_ID + '" class="adv-rank-input" type="number" min="1" step="1" ' +
        'inputmode="numeric" value="' + escAttr(existing === null ? '' : String(existing)) + '">';
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      overlay.style.display = 'flex';
      const input = document.getElementById(api.INPUT_ID);
      if(input) input.focus({ preventScroll: true });
      return true;
    };

    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== api.TYPE) return false;
      const entry = api.entryFor(state.schema.name);
      const input = document.getElementById(api.INPUT_ID);
      const rank = api.rankOf(input && input.value);
      if(!entry) return false;
      if(rank === null){
        setStatus('Enter a whole Rank of 1 or more before confirming.');
        return true;
      }
      return commitExtendedAdvConfig(
        { type: api.TYPE, rank: rank, value: 'Rank ' + rank },
        entry.name + ' configured for Rank ' + rank + '.');
    };

    return api;
  })();

  if(R456.enabled()){
    Object.keys(R456.ENTRIES).forEach(function(name){
      const entry = R456.ENTRIES[name];
      registerAdvConfigSchema(name, {
        type: R456.TYPE,
        effect: 'rankEntry',
        title: entry.title,
        prompt: entry.prompt,
        note: entry.note,
      });
    });

    // Unknown types fall through 209.8's advConfigIsComplete to this hook, which is the seam its
    // own comment nominates for "specialised types validate in their own later fragment".
    const r456PrevComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      if(schema && schema.type === R456.TYPE) return R456.complete(schema, config);
      return r456PrevComplete(schema, config);
    };

    const r456PrevOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){
      if(schema && schema.type === R456.TYPE && R456.open(div, schema)) return true;
      return r456PrevOpen(div, schema);
    };

    const r456PrevConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){
      if(R456.confirm()) return true;
      return r456PrevConfirm();
    };

    // Outermost of the resolve chain, and it answers ONLY for its own two entries. Feature
    // 4.53's repairs below it price other entries and gate Friendly Kami; neither applies here,
    // and letting them re-price a cost this phase already computed is the failure worth avoiding.
    const r456PrevResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      const own = R456.resolve(name, config);
      if(own) return own;
      return r456PrevResolve(name, config);
    };

    const r456PrevSummary = advConfigSummaryForEffect;
    advConfigSummaryForEffect = function(effect, schema, config, div){
      const own = R456.summaryFor(effect);
      if(own) return own;
      return r456PrevSummary(effect, schema, config, div);
    };
  }
