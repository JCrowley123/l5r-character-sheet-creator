  // ============ PART K PHASE 12 — PLAY AND MANAGEMENT MODES (part 1: the machinery, and Background) ============
  // Every character is in one of two modes. PLAY is for the table: read, roll, spend, track.
  // MANAGEMENT is for building: add, remove, raise, configure. Owner's rulings, 25 September 2026:
  //   - A character opens in Play when opened from the Characters list or finished in the creation
  //     wizard, and in Management otherwise (a blank sheet, a load or import through the old toolbar).
  //   - The mode is NEVER part of the character: collectData() does not see it, so switching modes
  //     cannot change a save and autosave sees no difference.
  //   - "Inert" means every USER event on a Management-only control is stopped in Play -- typing,
  //     tapping, a script's .click() or dispatched event -- by one capture-phase listener that runs
  //     before any of the sheet's own. The sheet's own code writing a value (a load, autosave, a Void
  //     spend) is not a user event and keeps working.
  //   - The toggle is a small "Manage" button beside the character's name, reading "Done" in
  //     Management. In Play a Management-only field shows its value as plain text, in place.
  //
  // This part locks one tab, Background. Every later part registers its own tab's controls through
  // MODES12.register() from its own fragment, so this fragment is never edited again.
  const MODES12_ENABLED = true;

  const MODES12 = (function(){
    const api = {};
    api.mode = 'management';
    api.selectors = [];
    const GATED = ['click', 'input', 'change', 'beforeinput', 'keydown', 'paste', 'drop', 'cut'];
    // Keys that only move, select or copy; everything else on a locked control is an edit.
    const SAFE_KEYS = /^(Tab|Shift|Control|Alt|Meta|Escape|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|PageUp|PageDown)$/;
    const TEXTLIKE = function(el){
      return el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !/^(checkbox|radio|button|submit|reset|file|range|color)$/i.test(el.type || ''));
    };

    api.isPlay = function(){ return MODES12_ENABLED && api.mode === 'play'; };
    api.selector = function(){ return api.selectors.join(', '); };
    api.register = function(selector){
      if(typeof selector !== 'string' || !selector.trim()) return false;
      if(api.selectors.indexOf(selector) < 0) api.selectors.push(selector);
      api.refresh();
      return true;
    };
    api.lockedBy = function(el){
      const sel = api.selector();
      return (el && el.closest && sel) ? el.closest(sel) : null;
    };

    // Lock records what it changed, so unlocking never touches a control the sheet made read-only
    // or disabled for reasons of its own.
    function lock(el){
      if(el.hasAttribute('data-pm12-locked')) return;
      let changed = '';
      if(TEXTLIKE(el)){ if(!el.readOnly){ el.readOnly = true; changed = 'readonly'; } }
      else if('disabled' in el){ if(!el.disabled){ el.disabled = true; changed = 'disabled'; } }
      el.setAttribute('data-pm12-locked', changed || 'already');
    }
    function unlock(el){
      const changed = el.getAttribute('data-pm12-locked');
      if(changed === 'readonly') el.readOnly = false;
      if(changed === 'disabled') el.disabled = false;
      el.removeAttribute('data-pm12-locked');
    }

    api.refresh = function(){
      const play = api.isPlay();
      const sel = api.selector();
      if(document.body) document.body.classList.toggle('pm12-play', play);
      document.querySelectorAll('[data-pm12-locked]').forEach(function(el){
        if(!play || !sel || !el.matches(sel)) unlock(el);
      });
      if(play && sel) document.querySelectorAll(sel).forEach(lock);
      api.renderToggle();
    };

    api.set = function(mode){
      if(mode !== 'play' && mode !== 'management') return false;
      api.mode = mode;
      api.refresh();
      return true;
    };
    api.toggle = function(){ return api.set(api.mode === 'play' ? 'management' : 'play'); };

    // The one gate. Capture phase on the document, so it runs before every listener the sheet
    // attached to a control, and stopImmediatePropagation keeps them from running at all.
    api.gate = function(e){
      if(!api.isPlay()) return;
      const hit = api.lockedBy(e.target);
      if(!hit) return;
      if(e.type === 'keydown' && (SAFE_KEYS.test(e.key) || ((e.ctrlKey || e.metaKey) && /^[ac]$/i.test(e.key)))) return;
      // A read-only text box may still be tapped to place the caret or select its words.
      if(e.type === 'click' && TEXTLIKE(hit)) return;
      e.stopImmediatePropagation();
      e.preventDefault();
    };

    api.renderToggle = function(){
      const b = document.getElementById('pm12Toggle');
      if(!b) return;
      const play = api.isPlay();
      const text = play ? 'Manage' : 'Done';
      // Written only when it changes: a text change is a DOM mutation the observer below would see.
      if(b.textContent !== text) b.textContent = text;
      b.setAttribute('aria-pressed', play ? 'false' : 'true');
      b.setAttribute('aria-label', play ? 'Manage this character: switch to editing' : 'Done managing: back to Play mode');
    };
    api.buildToggle = function(){
      const seal = document.getElementById('seal');
      if(!seal || !seal.parentNode || document.getElementById('pm12Toggle')) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.id = 'pm12Toggle';
      b.className = 'ghost pm12-toggle print-hide';
      b.addEventListener('click', function(){ api.toggle(); });
      seal.parentNode.insertBefore(b, seal);
      api.renderToggle();
    };

    // Rows a later part locks are built and rebuilt all the time, so in Play new matches are locked
    // as they appear. Locking only sets attributes, which this observer does not watch, so it can
    // never trigger itself.
    api.lockNew = function(){
      const sel = api.selector();
      if(api.isPlay() && sel) document.querySelectorAll(sel).forEach(lock);
    };
    let queued = false;
    api.observer = (typeof MutationObserver === 'function') ? new MutationObserver(function(){
      if(!api.isPlay() || queued) return;
      queued = true;
      Promise.resolve().then(function(){ queued = false; api.lockNew(); });
    }) : null;

    api.install = function(){
      GATED.forEach(function(type){ document.addEventListener(type, api.gate, true); });
      api.buildToggle();
      if(api.observer && document.body) api.observer.observe(document.body, {childList: true, subtree: true});
      api.register('#f_appearance, #f_personality, #f_history, #f_notes');
    };
    return api;
  })();

  if(MODES12_ENABLED){
    MODES12.install();

    // Opening a character from the Characters list lands in Play. A cancelled open leaves the list
    // on screen and the mode as it was. Phase 11 (Part K) is reached by property, so without it
    // this simply does nothing.
    if(typeof CL11 === 'object' && CL11){
      if(typeof CL11.openCharacter === 'function'){
        const modes12PreviousOpen = CL11.openCharacter;
        CL11.openCharacter = async function(){
          const result = await modes12PreviousOpen.apply(this, arguments);
          if(!(typeof CL11.isOpen === 'function' && CL11.isOpen())) MODES12.set('play');
          return result;
        };
      }
      // A new character is built in Management (the wizard drives Management controls). If the
      // player cancels and stays on the list, the mode goes back to what it was.
      if(typeof CL11.createNew === 'function'){
        const modes12PreviousCreate = CL11.createNew;
        CL11.createNew = async function(){
          const before = MODES12.mode;
          MODES12.set('management');
          const result = await modes12PreviousCreate.apply(this, arguments);
          if(typeof CL11.isOpen === 'function' && CL11.isOpen()) MODES12.set(before);
          return result;
        };
      }
    }
    // Finishing the creation wizard (Phase 11.2, Part K) lands in Play.
    if(typeof CW112 === 'object' && CW112 && typeof CW112.finish === 'function'){
      const modes12PreviousFinish = CW112.finish;
      CW112.finish = function(){
        const result = modes12PreviousFinish.apply(this, arguments);
        MODES12.set('play');
        return result;
      };
    }
    // The old toolbar's Load, New Blank and Import stay in Management until a later part replaces it.
    ['btnLoad', 'btnNew'].forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', function(){ MODES12.set('management'); });
    });
    const modes12Import = document.getElementById('fileImport');
    if(modes12Import) modes12Import.addEventListener('change', function(){ MODES12.set('management'); });
  }
  // ============ END PART K PHASE 12 MODES12 ============
