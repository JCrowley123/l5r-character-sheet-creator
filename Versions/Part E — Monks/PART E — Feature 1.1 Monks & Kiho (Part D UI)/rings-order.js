/* ============================================================
   PART D — FEATURE 2.1 · RING DOM ORDER

   Feature 2 arranges the five Ring cards on a pentagon with CSS
   transforms alone. That moves them on screen without moving them in
   the document, so sequential focus still runs in the order the sheet
   built them — Air, Earth, Fire, Water, Void — and tabbing round the
   figure zigzags: upper right, upper left, lower right, lower left,
   bottom.

   CSS cannot fix this. `order` and `flex-direction` reposition boxes
   but deliberately leave sequential focus navigation alone, which is
   exactly why a visual-only reorder is a WCAG 2.4.3 problem rather
   than a styling detail. The only honest fix is to put the cards into
   the document in the order they are read on screen.

   So this moves them, once, into clockwise order from the top:

       Air 1:12  ->  Fire 3:36  ->  Void 6:00  ->  Water 8:24  ->  Earth 10:48

   WHY THIS IS SAFE
   The sheet addresses every ring field by id (`ring_air`, `trait_reflexes`
   and so on) and delegates its ring clicks from #ringsWrap with
   `closest()`. Nothing reads `children[n]`, `:nth-child` or
   `firstElementChild` on the rings — checked against the trunk before
   this was written — so no handler, calculation, save or load depends
   on the order of these five nodes.

   SCOPE
   The order applies everywhere, not only to the pentagon. Below 600px,
   and on paper, the sheet's own grid now also lists the rings clockwise
   instead of Air/Earth/Fire/Water/Void. That is deliberate: document
   order and reading order then agree in every layout, which is the
   point of the fix. To put the printed sheet back to the traditional
   order without giving up the focus fix, add `order:` values to
   `.ring-card` inside the @media print block of rings-circular.css.
   ============================================================ */
(function(){
  'use strict';

  var ORDER = ['air', 'fire', 'void', 'water', 'earth'];

  function reorder(){
    var wrap = document.getElementById('ringsWrap');
    if(!wrap) return false;

    var cards = [];
    for(var i = 0; i < ORDER.length; i++){
      var card = wrap.querySelector('.ring-card[data-ring-key="' + ORDER[i] + '"]');
      // Bail if the sheet has not finished building: a partial reorder would be
      // worse than none, and the retry below will catch the complete set.
      if(!card || card.parentNode !== wrap) return false;
      cards.push(card);
    }

    // appendChild MOVES an existing node rather than copying it, so walking the
    // list once leaves the five cards in exactly this sequence. Any card the
    // sheet might add that is not in ORDER keeps its place ahead of them.
    for(var j = 0; j < cards.length; j++) wrap.appendChild(cards[j]);
    return true;
  }

  function run(){
    try{
      if(reorder()) return;
      // The sheet builds the rings synchronously in its own script, which runs
      // before this one, so the first attempt normally succeeds. These are for
      // the case where that ever stops being true.
      var tries = 0;
      var timer = setInterval(function(){
        if(reorder() || ++tries > 40) clearInterval(timer);
      }, 50);
    }catch(e){
      // A reordering failure must never take the sheet down with it. The
      // pentagon still renders; only the focus order stays as it was.
      if(window.console && console.warn) console.warn('[rings-order] ' + e);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
