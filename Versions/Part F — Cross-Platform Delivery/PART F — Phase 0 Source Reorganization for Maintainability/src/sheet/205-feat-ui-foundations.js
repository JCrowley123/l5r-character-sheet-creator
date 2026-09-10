  // ============ PART H PHASE 1: UI/UX FOUNDATIONS ============
  // One feature this phase adds — see this phase's own README for the full audit:
  //   A scroll-to-top button, since each Section panel (.car-page) scrolls independently
  //   and a long tab (Skills, Equipment) can leave a player stranded far below the tabs.
  //
  // WHAT THIS PHASE DID NOT NEED TO BUILD. The roadmap's brief also asks for "colour-coded
  // spell lists" and "colour-coded affinity/deficiency indicators" — both already exist:
  // the Spell Slots tracker's element icons are already colour-matched to their pips
  // (SPELL_ICON_COLORIZE, 010-prelude.js), and the Applied School's Affinity/Deficiency
  // badge (renderAppliedSchoolAffinity, 050-kiho-rules.js) already carries the gold/maroon
  // is-affinity/is-deficiency treatment. Building either again would be the exact duplication
  // this phase's own Engineering Scope asks to avoid, not new work — see the README.
  //
  // A Ring-card colour accent for the same Affinity/Deficiency fact was built and shipped in
  // this phase, then explicitly reverted at the project owner's request after seeing it live —
  // a product-taste call, not a bug. See the README's "Reverted: the Ring accent" for the
  // record of what it did and why it's gone.
  //
  // NO GLOBAL UI STATE MANAGER. The brief allows for one "if not already present" and none is
  // needed here: the scroll button's visibility is derived live from a DOM scrollTop read, the
  // same DOM-as-model approach every other feature on this sheet already uses.

  // ---- Scroll-to-top ----------------------------------------------------------------------
  // Each Section panel (.car-page) scrolls independently (overflow-y:auto — see 20-carousel.css)
  // rather than the whole document, so "scroll to top" means the currently VISIBLE panel, not
  // window.scrollTo. The carousel marks the active panel by removing its `hidden` attribute
  // (10-carousel.js) and nothing else, so finding it needs no carousel API at all.
  function getActiveCarPage(){
    return document.querySelector('.car-page:not([hidden])');
  }
  // Instant, not smooth — this sheet's own standing rule is no animation or motion (see
  // CLAUDE.md, "Design decisions already made"); a scroll-to-top control is exactly the kind
  // of micro-interaction that rule already rejected once for the carousel itself.
  function scrollToTop(){
    const page = getActiveCarPage();
    if(page) page.scrollTop = 0;
  }
  const SCROLL_TOP_SHOW_AFTER = 300; // px scrolled before the button earns its place on screen
  function updateScrollTopVisibility(){
    const btn = document.getElementById('scrollTopBtn');
    const page = getActiveCarPage();
    if(!btn || !page) return;
    btn.hidden = page.scrollTop < SCROLL_TOP_SHOW_AFTER;
  }
  // Wired from init() in 210-test-seam-and-init.js, once the fixed-layers markup exists.
  function initScrollToTop(){
    const btn = document.getElementById('scrollTopBtn');
    const track = document.querySelector('.car-track');
    if(!btn || !track) return;
    btn.addEventListener('click', scrollToTop);
    // Capture-phase delegation, not a per-page addEventListener pass. `scroll` events don't
    // bubble, but capture-phase dispatch still reaches ancestors, so ONE listener here on
    // `document` catches every .car-page's scroll — including the two CLONE pages the carousel
    // creates for its infinite-loop wraparound (10-carousel.js) only AFTER this function runs.
    // A `querySelectorAll('.car-page').forEach(...)` taken here would enumerate 10 pages and
    // silently miss both clones, leaving the button permanently broken on whichever tabs get
    // cloned — caught by this phase's own harness, not by inspection.
    document.addEventListener('scroll', updateScrollTopVisibility, { capture:true, passive:true });
    // Switching tabs reveals a DIFFERENT panel, which fires no 'scroll' event of its own —
    // only the carousel's own hidden-attribute toggle marks that a different panel just became
    // visible, so this is what re-checks the button on every tab change. In THIS carousel a
    // freshly-shown panel is always at scrollTop 0 anyway (.car-page[hidden] is display:none,
    // and Chromium resets scroll offset on a display:none element — verified empirically, not
    // assumed), so this observer's own trigger is presently unfalsifiable by scroll position
    // alone. It stays in as the correct mechanism regardless: it would matter the moment
    // .car-page[hidden] ever became visibility:hidden or content-visibility instead, which DO
    // preserve scroll offset, and is one line cheaper than re-deriving that guarantee later.
    new MutationObserver(updateScrollTopVisibility)
      .observe(track, { attributes:true, attributeFilter:['hidden'], subtree:true });
    updateScrollTopVisibility();
  }
  // ============ END PART H PHASE 1 ============
