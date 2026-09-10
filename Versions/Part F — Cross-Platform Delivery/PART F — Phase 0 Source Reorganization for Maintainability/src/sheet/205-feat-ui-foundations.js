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
  // window.scrollTo.
  //
  // FINDING THAT PANEL IS THE WHOLE PROBLEM, and the obvious answer is wrong. The carousel is a
  // horizontal scroll-snap track: EVERY page stays in the DOM side by side, and which one you
  // are looking at is a function of the track's horizontal scroll offset. `hidden` marks only
  // CONDITIONAL pages — Spell Slots while the character is not a caster — never "the tab you
  // are not on". Eleven of the twelve pages are un-hidden at any moment, so
  // `querySelector('.car-page:not([hidden])')` returns the first one in DOM order (a clone of
  // the last page) no matter where the carousel actually is. That was this feature's first
  // implementation, and it shipped: the button read a page nobody was looking at, saw
  // scrollTop 0 forever, and never appeared. See the README, "The bug my own harness hid".
  //
  // So: pick the page whose horizontal centre is nearest the track's viewport centre. That is
  // true mid-swipe as well as after the snap settles, needs no carousel API, and cannot be
  // fooled by the loop clones (whichever copy is actually on screen is the one it finds).
  function getActiveCarPage(){
    const track = document.querySelector('.car-track');
    if(!track) return null;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = null, bestDist = Infinity;
    for(const p of track.children){
      if(!p.classList || !p.classList.contains('car-page')) continue;
      if(p.hasAttribute('hidden')) continue;
      const dist = Math.abs((p.offsetLeft + p.offsetWidth / 2) - mid);
      if(dist < bestDist){ bestDist = dist; best = p; }
    }
    return best;
  }
  // Instant, not smooth — this sheet's own standing rule is no animation or motion (see
  // CLAUDE.md, "Design decisions already made"); a scroll-to-top control is exactly the kind
  // of micro-interaction that rule already rejected once for the carousel itself.
  function scrollToTop(){
    const page = getActiveCarPage();
    if(page) page.scrollTop = 0;
  }
  const SCROLL_TOP_SHOW_AFTER = 300; // px scrolled before the button earns its place on screen
  // `evt` is the scroll event when there is one. A scroll event names the exact element that
  // moved, which is better than re-deriving it: it is right during a loop teleport (when the
  // copy under the finger is a clone) and costs no geometry. A horizontal swipe scrolls the
  // TRACK instead, and that is the signal that the active page changed — fall through to
  // getActiveCarPage() for those, which is what makes the button update when you change tabs.
  function updateScrollTopVisibility(evt){
    const btn = document.getElementById('scrollTopBtn');
    if(!btn) return;
    const target = evt && evt.target;
    const scrolled = (target && target.classList && target.classList.contains('car-page'))
      ? target
      : getActiveCarPage();
    btn.hidden = !scrolled || scrolled.scrollTop < SCROLL_TOP_SHOW_AFTER;
  }
  // Wired from init() in 210-test-seam-and-init.js, once the fixed-layers markup exists.
  function initScrollToTop(){
    const btn = document.getElementById('scrollTopBtn');
    if(!btn) return;
    btn.addEventListener('click', scrollToTop);
    // Capture-phase delegation, not a per-page addEventListener pass. `scroll` events don't
    // bubble, but capture-phase dispatch still reaches ancestors, so ONE listener here on
    // `document` catches every .car-page's scroll AND the track's own horizontal scroll —
    // including the two CLONE pages the carousel creates for its infinite-loop wraparound
    // (10-carousel.js) only AFTER this function runs. A
    // `querySelectorAll('.car-page').forEach(...)` taken here would enumerate the ten pages
    // that exist right now and silently miss both clones.
    //
    // The track's horizontal scroll arriving through the same listener is what makes the
    // button correct across a tab change, which fires no scroll event on any page. Leaving a
    // tab puts it back at its own top — the carousel marks off-screen pages `inert` and their
    // computed content-visibility becomes `auto`, which drops the scroll offset with the
    // skipped layout (measured, not assumed) — so arriving anywhere means arriving at the top,
    // and the button has to be re-hidden to match.
    document.addEventListener('scroll', updateScrollTopVisibility, { capture:true, passive:true });
    updateScrollTopVisibility();
  }
  // ============ END PART H PHASE 1 ============
