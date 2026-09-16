  // ========= PART I FEATURE 4.54: CONFIGURATION UX PASS =========
  //
  // The 13 September feedback and the 16 September real-device pass both asked for a UX round on
  // the configured Advantage/Disadvantage surface. This phase was scoped from MEASUREMENTS taken
  // at 375px against the live build, not from the wording of those reports, and the measurements
  // moved the scope substantially in both directions:
  //
  //   * "several modal option cards overflow on narrow screens" -- down to ONE case. Only
  //     Consumed's "Determination — 6 XP" label still overflowed (165px of text in a 134px box).
  //     Phase 4.5's own #advConfigGrid override already fixed the rest.
  //   * "use a consistent circled-i icon wherever a tooltip appears" -- far bigger than an icon
  //     choice. The explanations are carried in `title=` attributes, and `title=` does NOTHING
  //     on a touch device: there is no hover. Measured 60 of them on the configured entries,
  //     of which ~36 carry real explanatory text -- including all seven tenet rules for Consumed
  //     and all seven for Failure of Bushido. That is the bulk of this phase.
  //   * The roll preview's own modifier row squeezed its label column to 54px, wrapping
  //     "Friend of the Elements" onto three lines while the note beside it kept 229px.
  //
  // REAL-DEVICE CORRECTION (16 September 2026). "Simply unreadable" above OVERSTATED the
  // original gap for the tenet cards specifically: Phase 4.5.2 (209.85-feat-disadv-config.js)
  // already builds a native, hover-independent "▶ Rule" <details> disclosure carrying the same
  // text, on every option that also carries the `title=` this phase decorates. Adding a second
  // affordance on top of an existing one was reported back as confusing rather than helpful, and
  // that same disclosure's hidden body text was leaking into this phase's own heading capture
  // (`element.textContent` traverses a closed `<details>` exactly as it does visible text),
  // producing a garbled multi-line modal title. Both are fixed below: the superseded disclosure
  // is hidden wherever this phase's own button replaces it (api.hideSupersededDisclosure), and
  // headings are read through api.labelTextFor, which excludes that disclosure's subtree first.
  // The `title=` attributes elsewhere -- the ~24 that carry a plain "choose the Ring" style
  // button hint with no competing in-place disclosure -- were genuinely hover-only and remain
  // this phase's real, uncorrected finding.
  //
  // WHAT IS DELIBERATELY NOT HERE. Shortening the entries' explanatory copy was on the same
  // feedback list and is NOT done: measured, the worst entry runs 197 characters against the
  // 151 of Magic Resistance, which that feedback named as the good example. Four entries exceed
  // the benchmark and none by much, so the project owner's call was to defer it rather than
  // rewrite rules copy on a marginal case. Recorded in the audit as still open.
  //
  // ---------------------------------------------------------------------------------------
  // HOW THE CIRCLED-i IS ADDED, AND WHY NOT AT THE 60 CALL SITES
  //
  // The `title=` attributes are written by four different fragments across three earlier
  // releases. Editing all sixty in place would rewrite lines this phase does not own, and its
  // removal could not put them back -- the same reasoning that made Feature 4.53 a wrapper.
  //
  // So the affordance is added GENERICALLY instead: one decorator walks the configured surface,
  // finds elements carrying an explanatory `title=`, and appends a small button to each. The
  // `title=` is left in place, so desktop hover keeps working exactly as before and this phase
  // adds a second, touch-reachable route to the same text rather than replacing the first.
  //
  // The button carries NO TEXT. Its glyph comes from a CSS ::after rule, deliberately: several
  // existing harnesses assert on the exact `textContent` of a configured row, and a button that
  // contributed an "i" to that string would break them for a purely cosmetic reason.
  //
  // A title shorter than MIN_EXPLANATORY_TITLE, or one that merely repeats the element's own
  // visible text, is skipped -- those are UI labels ("Cancel"), not explanations, and an info
  // button on every one of them would be the clutter this phase is meant to reduce.
  // ---------------------------------------------------------------------------------------

  // One-line kill-switch, per this project's convention for a feature phase. With this false no
  // info button is added, no wording is changed, and the CSS below still loads but matches
  // nothing this phase creates.
  const ADV_CONFIG_UX_ENABLED = true;

  const R454 = (function(){
    const api = {};

    api.enabled = function(){
      return ADV_CONFIG_UX_ENABLED && typeof advConfigRowFor === 'function';
    };

    // A `title` shorter than this is a control label, not an explanation.
    api.MIN_EXPLANATORY_TITLE = 20;

    // ---------- Wording ----------
    //
    // "XP refund" reads as though the sheet is handing points back, when what the player is
    // choosing is how bad the Disadvantage is. Applied by wrapping Phase 4.5.2's own `steps()`
    // -- a real seam it already exposes -- rather than by rewriting its source, so the change
    // travels with this fragment and leaves that release's code untouched.
    api.STEP_LABELS = {
      'XP refund': 'Severity',
      'Rank — 2 XP refunded per rank': 'Rank — 2 XP per rank',
    };

    // The rendered summary line is assembled inline inside 4.5.2's row renderer, which exposes
    // no seam to wrap, so these two are corrected on the painted node instead. Exact-string
    // replacements only: a substitution that had to guess would be worse than the wording.
    api.SUMMARY_TEXT = [
      ['Status-linked refund:', 'Status-linked value:'],
      [' Refund: ', ' Value: '],
    ];

    api.rewordSummaries = function(scope){
      if(!scope || !scope.querySelectorAll) return 0;
      let changed = 0;
      scope.querySelectorAll('.d45-summary').forEach(function(node){
        let text = node.textContent;
        api.SUMMARY_TEXT.forEach(function(pair){
          if(text.indexOf(pair[0]) !== -1) text = text.split(pair[0]).join(pair[1]);
        });
        if(text !== node.textContent){ node.textContent = text; changed++; }
      });
      return changed;
    };

    // ---------- The info affordance ----------

    api.show = function(title, body){
      // Reuses the sheet's existing info overlay, per the roadmap's "no new modal system".
      // Stacking above an already-open configuration modal is handled by the sheet's own
      // modal-stacking observer, which promotes whichever overlay was shown most recently.
      if(typeof populateInfoOverlay === 'function'){ populateInfoOverlay(title || 'Details', '', body); return true; }
      if(typeof appAlert === 'function'){ appAlert(body); return true; }
      return false;
    };

    // REAL-DEVICE CORRECTION (16 September 2026): Phase 4.5.2 already builds its own in-place
    // disclosure for exactly this text -- see api.hideSupersededDisclosure below -- and that
    // element's hidden body text was leaking into every textContent read here, since
    // textContent traverses a closed <details> exactly as it does visible text. A Consumed
    // tenet card's "own" text therefore came out as "Determination — 6 XPRuleYou cannot spend
    // Void Points…" with no separator, which produced a garbled, three-line modal title. This
    // helper is now the one place that decides what an option's own label actually is: a clone
    // with the superseded disclosure removed before anything reads its text.
    api.EXCLUDE_FROM_LABEL = '.d45-tooltip, .adv-config-info';
    api.labelTextFor = function(element){
      const clone = element.cloneNode(true);
      clone.querySelectorAll(api.EXCLUDE_FROM_LABEL).forEach(function(node){ node.remove(); });
      return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    };

    api.isExplanatory = function(element){
      const title = String(element.getAttribute('title') || '').trim();
      if(title.length < api.MIN_EXPLANATORY_TITLE) return false;
      return title !== api.labelTextFor(element);
    };

    // Phase 4.5.2's own "▶ Rule" <details> disclosure (209.85-feat-disadv-config.js) carries
    // the SAME text as the title= this phase just made reachable through a tap. Real-device
    // feedback reported the two together as a confusing doubled affordance, not two genuinely
    // different pieces of information. Hidden, not removed: a later re-render of this option
    // (the modal rebuilds its whole grid on every step navigation) recreates the disclosure
    // fresh each time regardless, so nothing here needs to survive across renders, and hiding
    // rather than deleting keeps Phase 4.5.2's own DOM/data shape completely intact for
    // whatever it does with that element next.
    api.hideSupersededDisclosure = function(element){
      const disclosure = element.querySelector('.d45-tooltip');
      if(disclosure) disclosure.hidden = true;
    };

    api.decorate = function(scope){
      if(!api.enabled() || !scope || !scope.querySelectorAll) return 0;
      let added = 0;
      scope.querySelectorAll('[title]').forEach(function(element){
        if(element.dataset && element.dataset.uxInfo) return;                 // already considered
        if(element.classList && element.classList.contains('adv-config-info')) return;
        if(!api.isExplanatory(element)){
          if(element.dataset) element.dataset.uxInfo = 'skip';
          return;
        }
        const title = String(element.getAttribute('title') || '').trim();
        // Captured BEFORE the button is appended, so the heading is the option's own wording
        // rather than anything this phase adds to it -- and via labelTextFor, never the
        // superseded disclosure's own hidden text either.
        const heading = api.labelTextFor(element).slice(0, 60) || 'Details';
        element.dataset.uxInfo = 'done';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'adv-config-info';
        // No text node: the glyph is a CSS ::after, so this adds nothing to textContent.
        button.setAttribute('aria-label', 'Explain: ' + heading);
        button.addEventListener('click', function(event){
          // Several of these sit inside a label or a clickable option card, where a bare click
          // would toggle the choice as a side effect of asking what it means.
          event.preventDefault();
          event.stopPropagation();
          api.show(heading, title);
        });
        element.appendChild(button);
        api.hideSupersededDisclosure(element);
        added++;
      });
      return added;
    };

    // Everything this phase paints, in one pass, so the hooks below stay one-liners.
    api.pass = function(scope){
      if(!api.enabled()) return 0;
      return api.decorate(scope) + api.rewordSummaries(scope);
    };

    api.passLists = function(){
      let total = 0;
      ['advList', 'disadvList'].forEach(function(id){
        const list = document.getElementById(id);
        if(list) total += api.pass(list);
      });
      return total;
    };

    // The configuration modal re-renders its own body as the player moves between steps, so a
    // one-shot decoration at open time would miss every step after the first. An observer keeps
    // it correct for paths this phase does not know about, including any a later release adds.
    // It disconnects around its own writes: appending a button inside the observed subtree would
    // otherwise re-enter this callback forever.
    api.watchModal = function(){
      const overlay = document.getElementById('advConfigModalOverlay');
      if(!overlay || typeof MutationObserver !== 'function' || api.observer) return null;
      api.observer = new MutationObserver(function(){
        api.observer.disconnect();
        try { api.pass(overlay); }
        finally { api.observer.observe(overlay, { childList: true, subtree: true }); }
      });
      api.observer.observe(overlay, { childList: true, subtree: true });
      return api.observer;
    };

    return api;
  })();

  if(R454.enabled()){
    // Rows: decorate after whatever repainted them. Keeps the previous binding and delegates,
    // the same composition Feature 4.53 uses, so this sits outside 4.53's wrapper rather than
    // replacing it.
    const r454PrevRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      r454PrevRefresh(div);
      R454.pass(div);
    };

    // Wording, through the seam Phase 4.5.2 already exposes.
    if(typeof D45 === 'object' && D45 && typeof D45.steps === 'function'){
      const r454PrevSteps = D45.steps;
      D45.steps = function(schema, config){
        const steps = r454PrevSteps(schema, config) || [];
        return steps.map(function(step){
          if(!step || !step.label) return step;
          const replacement = R454.STEP_LABELS[step.label];
          return replacement ? Object.assign({}, step, { label: replacement }) : step;
        });
      };
    }

    const r454PrevInit = initAdvConfig;
    initAdvConfig = function(){
      r454PrevInit();
      R454.watchModal();
      R454.passLists();
    };
  }
