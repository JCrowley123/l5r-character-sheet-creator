  // ============ PART K PHASE 12.6 — PLAY AND MANAGEMENT MODES: TECHNIQUES ============
  // Phase 12's Techniques tab (the owner chose to build it before Advantages & Disadvantages,
  // whose number, 12.5, stays reserved). Techniques is read-and-use in Play (roadmap, Phase 12): an
  // entry's name, XP and description, its remove button and a spell's "memorised" tick are Management
  // only, and so are the Techniques picker, the Alternate Path picker and Add. What stays live: a
  // spell's Cast button, the "Why can't I cast this?" button (Phase 8, Part J) and the Kiho rules
  // button.
  //
  // Advantage and Disadvantage rows are built by the same function (makeEntry) with the same classes,
  // so every row selector here is scoped to #techList: this part must not reach the Advantages tab.
  // Registers through part 1's MODES12, so it HARD-DEPENDS on part 1.
  const MODES126_ENABLED = true;

  const MODES126 = {
    selector: [
      '#techQuickAdd', '#pathPicker', '#addTech',
      '#techList .en-name', '#techList .en-cost', '#techList .en-desc', '#techList .rm-btn',
      '#techList .spell-memo-checkbox'
    ].join(', ')
  };

  if(MODES126_ENABLED && typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function'){
    MODES12.register(MODES126.selector);
  }
  // ============ END PART K PHASE 12.6 MODES126 ============
