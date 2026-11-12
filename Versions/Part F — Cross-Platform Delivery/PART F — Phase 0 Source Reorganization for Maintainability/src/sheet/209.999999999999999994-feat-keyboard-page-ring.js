  // ============ PART H PHASE 15.1.26 — THE PAGE RING ONLY FOR THE KEYBOARD ============
  // Phase 15, Release 15a, finding A10.1 (group G4): the owner's item of 12 November 2026, approved as mocked up the
  // same day (option A). The number 26 is this unit's marker only; the finding keeps its identifier, A10.1.
  // On iPhone Safari, after the School-choice window closed, a gold line ran round the page until the mode changed.
  // It is the page's own focus ring (.car-page:focus-visible, the carousel's stylesheet): every page can take focus so
  // a keyboard can scroll it, and a closing window gives focus back to what had it, which on an iPhone is the page,
  // because Safari does not focus a tapped button. Safari then draws the ring for focus given by script.
  // This unit draws the page's ring only when the page is reached with the keyboard. It notes how the person last
  // moved: a navigation key (Tab, the arrows, Enter, Escape, Space, Home, End, Page Up, Page Down) marks the keyboard,
  // except keys typed into a text box, where only Tab and Escape do; a tap, click or touch clears it. The stylesheet (1144-keyboard-page-ring.css) hides the page's ring unless the
  // keyboard is marked. Focus itself still goes where it went before; only the outline is affected, and only on pages.
  // Everything waits for body.kr15-on, which the switch sets: with the switch off the sheet is exactly as before.
  const KEYBOARD_PAGE_RING_ENABLED = true;

  const KR15 = (function(){
    const api = {installed: false};
    const KEYS = /^(Tab|Escape|Enter| |Spacebar|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|PageUp|PageDown)$/;
    api.enabled = function(){ return KEYBOARD_PAGE_RING_ENABLED; };
    api.keyboard = function(){ return document.body.classList.contains('kr15-keyboard'); };
    // Typing in a text box is not moving round the page: there only Tab and Escape count. An iPhone's Return key and
    // every space typed in a name send Enter and Space, and a window closed by Return in its own search box would
    // otherwise give focus back to the page with the ring drawn (G4's code review, 12 November 2026).
    const TYPING = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=range]):not([type=color]):not([type=file]), textarea, [contenteditable=""], [contenteditable="true"]';
    api.onKey = function(event){
      if(event.ctrlKey || event.metaKey || event.altKey || !KEYS.test(event.key)) return;
      const target = event.target;
      if(target && target.closest && target.closest(TYPING) && event.key !== 'Tab' && event.key !== 'Escape') return;
      document.body.classList.add('kr15-keyboard');
    };
    api.onPointer = function(){ document.body.classList.remove('kr15-keyboard'); };
    api.install = function(){
      if(api.installed || !KEYBOARD_PAGE_RING_ENABLED) return false;
      api.installed = true;
      document.body.classList.add('kr15-on');
      // Capture phase, so a handler that stops the event further down does not hide the keyboard or the pointer.
      document.addEventListener('keydown', api.onKey, true);
      document.addEventListener('pointerdown', api.onPointer, true);
      document.addEventListener('touchstart', api.onPointer, {capture: true, passive: true});
      document.addEventListener('mousedown', api.onPointer, true);
      return true;
    };
    return api;
  })();
  KR15.install();
  // ============ END PART H PHASE 15.1.26 ============
