/* ============================================================
   PART D — FEATURE 2.1 · VOID CARD FIT

   Feature 2 sizes the pentagon's container as

       height = 2 * --ring-radius + --ring-card-h

   with `--ring-card-h` a fixed 260px allowance for the tallest card.
   The cards are absolutely positioned and centred on the container, so
   the room left below the centre is `--ring-radius + --ring-card-h / 2`,
   while the bottom card — Void, at 6 o'clock — reaches
   `--ring-radius + its own height / 2`. The allowance therefore has to
   be at least as tall as the Void card, or the card hangs past the
   bottom of the section.

   260px covers the Void card at its default rank of 2. It does not
   cover a high-Void character: the card carries one 26px pip per rank
   with an 8px gap, wrapping three to a row at the narrow card width, so

       rank  2   247.5px   fits
       rank  6   280.5px   fits, the section's own padding absorbs it
       rank  7   315.5px   6.8px past the section border
       rank 10   349.5px   23.8px past the section border

   (measured at a 600px viewport; the margin widens as the cards get
   wider, and the overflow clears entirely at 1280px and above).

   Nothing overlaps and nothing is clipped — `overflow` stays visible —
   but the card visibly escapes the parchment border, so this publishes
   the Void card's real height upward and lets the container reserve
   exactly what the card needs.

   The CSS default stays 260px and acts as a floor, so with scripting
   off, or if this file is deleted, the layout is byte-for-byte the
   Feature 2 layout at every rank that fitted before.
   ============================================================ */
(function(){
  'use strict';

  // Matches the --ring-card-h default in rings-circular.css. Keeping it as a
  // floor means the common case (rank 2, and every rank up to 6) renders at
  // exactly the height Feature 2 rendered it at — this only ever adds room.
  var FLOOR = 260;

  var wrap = null, card = null, last = null, pending = false;

  function raf(fn){
    if(window.requestAnimationFrame) window.requestAnimationFrame(fn);
    else setTimeout(fn, 16);
  }

  // Never measure from inside an observer callback: batch to the next frame so
  // layout has settled, and so a burst of changes costs one measurement.
  //
  // The frame is raced against a short timer because frames are not guaranteed:
  // a background tab, a page the carousel has deferred, or a throttled renderer
  // can stall rAF for as long as it likes, and the container would sit at the
  // floor until something else woke it. Whichever arrives first does the work;
  // publish() is idempotent, so the loser is free.
  function schedule(){
    if(pending) return;
    pending = true;
    var done = false;
    function fire(){
      if(done) return;
      done = true;
      pending = false;
      publish();
    }
    raf(fire);
    setTimeout(fire, 60);
  }

  function publish(){
    if(!card) return;
    var h = card.getBoundingClientRect().height;
    // Zero means the Rings page is not currently rendered — the carousel defers
    // off-screen pages with content-visibility. Measuring that would publish a
    // useless value; the observer fires again when the page comes back.
    if(!h) return;
    var want = Math.max(FLOOR, Math.ceil(h));
    if(want === last) return;
    last = want;
    wrap.style.setProperty('--ring-card-h', want + 'px');
  }

  function start(){
    wrap = document.getElementById('ringsWrap');
    if(!wrap) return false;
    card = wrap.querySelector('.ring-card[data-ring-key="void"]');
    if(!card) return false;

    // The card's height changes for two reasons: the pip row rewraps when the
    // Void rank changes, and the card's width changes with the viewport. A
    // ResizeObserver on the card catches both, and cannot loop — --ring-card-h
    // sizes the container, never the card.
    if(typeof ResizeObserver === 'function'){
      new ResizeObserver(schedule).observe(card);
    }

    // Watched directly as well, rather than left to the ResizeObserver alone.
    // Changing the Void rank rewrites this list, and a notification that arrives
    // a frame or two later leaves the container visibly short in the meantime.
    // This is also the whole mechanism on a browser without ResizeObserver.
    var pips = document.getElementById('voidPips');
    if(pips && typeof MutationObserver === 'function'){
      new MutationObserver(schedule).observe(pips, { childList: true });
    }
    window.addEventListener('resize', schedule);

    publish();
    return true;
  }

  function run(){
    try{
      if(start()) return;
      var tries = 0;
      var timer = setInterval(function(){
        if(start() || ++tries > 40) clearInterval(timer);
      }, 50);
    }catch(e){
      // Failing here costs the extra room and nothing else: the CSS floor still
      // applies, so the layout falls back to exactly what Feature 2 shipped.
      if(window.console && console.warn) console.warn('[rings-fit] ' + e);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
