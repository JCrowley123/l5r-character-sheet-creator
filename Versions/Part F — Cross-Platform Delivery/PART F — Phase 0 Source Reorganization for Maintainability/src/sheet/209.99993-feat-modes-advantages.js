  // ============ PART K PHASE 12.5 — PLAY AND MANAGEMENT MODES: ADVANTAGES AND DISADVANTAGES ============
  // A player's purchased choices are read-only in Play; using those choices is not. Scope row
  // selectors to these two lists: Techniques shares makeEntry and must remain independent.
  // Hotei's Contested Void Roll deliberately shares the configuration-button styling, but is a
  // Play action, not a choice editor. Context/session toggles, court selection, pips, Use/Reset,
  // rerolls, checks and information controls are intentionally not registered.
  const MODES125_ENABLED = true;

  const MODES125 = {
    selector: [
      '#advQuickAdd', '#disadvQuickAdd', '#addAdv', '#addDisadv',
      '#advList .en-name', '#advList .en-cost', '#advList .en-desc', '#advList .rm-btn',
      '#disadvList .en-name', '#disadvList .en-cost', '#disadvList .en-desc', '#disadvList .rm-btn',
      '#advList .adv-config-btn:not(.fb4521-hotei-roll)',
      '#disadvList .adv-config-btn:not(.fb4521-hotei-roll)',
      '#disadvList .dep458-input', '#advList .wealth4517-btn',
      // The shared choice editor is outside the lists. Gate the whole grid (including court
      // Add/Remove and free-text editors), not just the inputs, plus Next/Confirm. Its Close and
      // backdrop remain dismissible. Play roll and information dialogs use different containers.
      '#advConfigGrid', '#advConfigConfirm'
    ].join(', '),
    install: function(){
      if(typeof MODES12 !== 'object' || !MODES12 || typeof MODES12.register !== 'function') return;
      MODES12.register(this.selector);
      // CSS also honours this part's kill switch; a disabled part must not hide the old picker.
      if(document.body) document.body.classList.add('pm125-enabled');
      // A configuration draft opened in Management must not survive the transition to Play.
      // Close through the editor's own cancellation path: no config, XP or character data is
      // written. Wrap the public mode setter rather than adding a second event gate/observer.
      const previousSet = MODES12.set;
      if(typeof previousSet === 'function'){
        MODES12.set = function(){
          const result = previousSet.apply(this, arguments);
          if(MODES12.isPlay() && typeof closeAdvConfigModal === 'function') closeAdvConfigModal();
          return result;
        };
      }
    }
  };

  if(MODES125_ENABLED) MODES125.install();
  // ============ END PART K PHASE 12.5 MODES125 ============
