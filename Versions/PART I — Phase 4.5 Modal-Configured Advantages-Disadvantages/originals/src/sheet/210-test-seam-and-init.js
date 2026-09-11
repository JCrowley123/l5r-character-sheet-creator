  // ---------- PART B: QA test seam ----------
  // The whole sheet lives inside one IIFE, so nothing above is reachable from the console.
  // This single export exists so the Part B / Part C automated test harnesses can call the
  // pure functions directly and assert on their return values. It is READ-ONLY tooling:
  // it exposes existing functions and the static libraries, adds no behaviour, and no
  // production code path on the sheet reads window.__L5R_TEST__. Deleting this one block
  // fully removes the seam without affecting anything else.
  window.__L5R_TEST__ = {
    // static reference data
    WEAPON_LIBRARY, ARROW_LIBRARY, SKILL_LIBRARY, DEFAULT_ARROW, WEAPON_SKILL_ORDER,
    // lookups
    findWeapon, findArrow, findSkill, getCharacterSkillRank,
    // pure structured-mastery helpers (Phase 2)
    getStructuredMastery, getDamageBonus, getExplosionThreshold, getReductionModifier,
    getLegacyMasteryBonus,
    // Part B pure calculation
    getWeaponAttackDice, getWeaponDamageDice,
    // dice (engine + Part B sibling), exposed for distribution assertions only
    applyTenDiceRule, formatRollNotation, rollDicePool, rollWeaponDicePool, rollExplodingD10At,
    // row factory + orchestration (makeSkillRow is exposed so a harness can build the real
    // Skill rows that getCharacterSkillRank reads, rather than faking the markup)
    makeSkillRow, buildWeaponQuickAdd,
    makeWeaponRow, refreshWeaponRow, refreshAllWeaponRows, applyWeaponLibraryLink,
    resolveWeaponContext, rollWeaponAttack, rollWeaponDamage,
    // save/load
    // NB: the sheet's load-side entry point is applyData(), not loadData().
    collectData, applyData, clearAllRows, resetToBaseline, recalcAll,
    SHEET_SCHEMA_VERSION,
    // ---- PART E FEATURE 1: monks & Kiho ----
    KIHO_LIBRARY, KIHO_BAN_BY_DISADVANTAGE, BROTHERHOOD_SCHOOL_LIBRARY,
    KIHO_RULES_TEXT,
    isBrotherhood, schoolsForPicker, findAnySchoolLibraryEntry, ALL_SCHOOL_TECHNIQUES,
    kihoVoidExemption, activeSchoolIsBrotherhood, MONK_CREATION,
    characterCasterLock, findSchoolLibraryEntry, schoolCasterCategory,
    pickStartingHonor, pickSpecialisation, setPickModalText,
    monkSpecialisation, renderMonkFieldNotes,
    MONK_OUTFIT, DISADV_LIBRARY,
    ALTERNATE_PATH_LIBRARY, SCHOOL_NAME_ALIASES, resolveSchoolName, allSchoolEntries,
    getPathTaken, savePathTaken, findPath, pathAtRank, pathsTaken,
    pathClauseMatches, pathAvailableFor, pathsAvailableAt,
    pathRequirementsUnmet, pathNarrativeRequirements, assertPathSchoolsResolve,
    hasAdvantageNamed, hasSkillEmphasis, getTraitValueByName, renderPathPicker,
    kihoEntitlement, kihoOffer, kihoFreePickAllows, kihoRows, kihoRowIsFree,
    cumulativeMonkShugenjaRank, monkKihoElement, renderKihoGrantNote,
    KIHO_DEFAULT_STARTING, KIHO_DEFAULT_GRANT_PER_RANK, KIHO_FREE_TAG,
    applyUnlockedTechniquesToList,
    getSchoolApplied, saveSchoolApplied, revertSchoolApplied, grantFreeTraitBonus,
    renderAppliedSchoolAffinity,
    techniqueDescription, TECH_DESCRIPTIONS, unlockTechniques,
    kihoAcquisition, kihoEligibility, kihoExclusions, kihoSchoolRank,
    hasFriendOfTheBrotherhood,
    techQuickAddOptionsHTML, refreshTechQuickAddOptions,
    // ---- PART C FEATURE 8: Mirumoto Bushi Rank 1 ----
    MIRUMOTO_SCHOOL, MIRUMOTO_R1_TECHNIQUE,
    MIRUMOTO_MAIN_WEAPON, MIRUMOTO_OFF_WEAPON,
    isMirumotoSchoolName, getMirumotoRank, mirumotoRowWeapon, mirumotoRowIs,
    getMirumotoPair, mirumotoTechniqueName,
    getMirumotoPenaltyWaiver, getMirumotoArmorTNBonus,
    mirumotoNoteBits, mirumotoInfoLines,
    getSchoolsList, saveSchoolsList,
    // ---- PART C FEATURE 7: dual-wielding & off-hand penalties ----
    OFF_HAND_RULES, HAND_VALUES, DEFAULT_HAND, normaliseHand,
    getRowHand, setRowHand, weaponRows, getDualWieldPair, isDualWieldActive,
    getOffHandRow, getOffHandExemptRank, skillExemptsOffHand, offHandMasteryAudit,
    OFF_HAND_TECHNIQUE_PATTERNS, getDualWieldTechniqueExemption,
    weaponSizeForRow, offHandPenaltyForSize, getOffHandPenalty, getMainHandPenalty,
    getDualWieldArmorTNBonus, offHandPreRollModifiers,
    promptAttackHand, attachOffHandFollowUp, performWeaponAttack,
    updateHandSelector, handednessNoteBits, makeEntry,
    // ---- PART C FEATURE 6: ammo tracking ----
    ARROW_ICONS, ARROW_EQUIP_PREFIX, arrowIcon,
    arrowEquipLabel, arrowFromEquipLabel, arrowEquipNotes, arrowTooltip,
    arrowEquipRows, getArrowQuantity, anyArrowEquipRows,
    addArrowToEquipment, spendArrow, pruneEmptyArrowRows,
    getLastArrowUsed, setLastArrowUsed, clearLastArrowUsed,
    weaponUsesAmmo, getRowArrowType, setRowArrowType, getSelectedArrowForRow,
    ammoTrackingActive, arrowPreRollModifiers, attachArrowDamageBreakdown,
    promptArrowSelection, renderArrowsPicker, openArrowsPicker, closeArrowsPicker,
    makeEquipRow, refreshEquipRow, refreshAllEquipRows,
    // ---- PART C FEATURE 4: void automation ----
    VOID_SPEND_LIBRARY, VOID_EFFECT_VALUES, findVoidOption,
    getVoidPending, setVoidPending, clearVoidPending,
    armOneRollVoidPending, clearOneRollVoidPending,
    isCombatActive, setCombatActive, getVoidPoints, consumeVoidPoint,
    canSpendVoid, spendVoid, applyVoidDamageReduction,
    getVoidArmorTNBonus, getVoidInitiativeBonus, clearVoidSkirmishEffects,
    voidPreRollModifiers, consumeVoidOneRollEffects, renderVoidPanel,
    renderVoidPips,
    // ---- PART C FEATURE 3: wound penalties ----
    WOUND_PENALTIES, WOUND_LEVELS, getCurrentWoundLevelName, getWoundPenalty,
    woundPreRollModifiers, computeWoundThresholds, renderWounds,
    // ---- PART H PHASE 1.6: wound severity bar ----
    formatWoundPenalty, showWoundInfoModal, WOUND_SEVERITY,
    // ---- PART C FEATURE 2: stance system ----
    STANCE_LIBRARY, DEFAULT_STANCE, STANCE_ICONS, findStance,
    getCurrentStance, setCurrentStance, renderStanceTiles, showStanceInfo, closeStanceInfo,
    getStanceArmorTNBonus, getStanceInitiativeBonus, stancePreRollModifiers,
    // ---- PART H PHASE 1.6: combat-tab formula info (reuses the stance-info overlay) ----
    populateInfoOverlay, showCombatFormulaInfo,
    centerWasLastRound, centerBonusAvailable, consumeCenterBonus, consumeCenterBonusIfApplied,
    getFullDefenseBonus, setFullDefenseBonus, clearFullDefenseBonus, rollFullDefenseDeclaration,
    getRingValueByName,
    // ---- BUGFIX: school free-rank reconstruction ----
    schoolGrantedRankForSkill, inferSchoolFreeFloor, skillCost, skillCumulative,
    // ---- PART C FEATURE 1: range & range penalties ----
    RANGED_WEAPON_SKILLS, RANGE_RULES, isRangedWeapon, weaponListedRange,
    calculateRangePenalty, validateRangeAttack, getRangeModifiers, promptWeaponRange,
    // ---- PART C P1: combat round context ----
    COMBAT_ROUND_DEFAULTS, getCombatRound, setCombatRound, getRoundLedger, saveRoundLedger,
    getRoundSpend, hasSpentThisRound, recordRoundSpend, clearRoundSpend,
    advanceCombatRound, resetCombatRound, renderCombatRoundUI,
    // ---- PART C P2: pre-roll modifier pipeline ----
    PREROLL_MODIFIER_REGISTRY, ROLL_KINDS, registerPreRollModifier, unregisterPreRollModifier,
    makeRollContext, getPreRollModifiers, applyPreRollModifiers, rollWithModifiers,
    attachRollModifierBreakdown,
    // ---- PART C FEATURE 0: Emphasis re-roll ----
    EMPHASIS_REQUIRE_SELECTION, EMPHASIS_MATCH_STRATEGY,
    normaliseEmphasisName, getOwnedEmphases, findMatchingEmphasis, emphasisLibraryAudit,
    skillRollEmphasisContext, weaponAttackEmphasisContext,
    rerollEmphasisDice, emphasisRollOneDie,
    attachEmphasisReroll, applyTopNKeepSuggestion,
    isEmphasisRerollUsed, setEmphasisRerollUsed,
    updateRollKeepState, relevantEmphOptions, getEmphValues,
    rollSkill, rollNotation, performSpellCastRoll,
    renderAllSpellSlots,
  };

  // ---------- Optional feature seams (removable independently of everything above) ----------
  // Each of these three phases ships as exactly one new fragment file plus small guarded hooks
  // into the shared files above -- see each phase's own ROLLBACK.md. Exporting their functions
  // as inline shorthand properties of the literal above (as this file did before) would mean
  // that deleting one phase's fragment file, without also editing this file in the same commit,
  // throws a ReferenceError while building window.__L5R_TEST__ itself -- which would take the
  // whole seam, and everything in init() below (which runs right after), down with it. Adding
  // them here instead, behind the same typeof guard every call site into these phases already
  // uses (110-modals-trackers.js, and the matching guarded calls in init() below), means a
  // removal that forgets this file is inert instead of fatal: the seam keys for the removed
  // phase are simply absent, exactly as if that phase had never been built.
  //
  // Each block's marker sits ABOVE its own `if`, not inside it, so the whole block -- guard
  // line included -- is attributable to one phase. qa/feature-dependencies.py reads these
  // markers to decide which references a phase's own surgical removal already covers; a marker
  // one line lower would leave the guard line itself attributed to the phase above.

  // ---- PART H PHASE 1: UI/UX foundations ----
  if (typeof scrollToTop === 'function') {
    Object.assign(window.__L5R_TEST__, {
      getActiveCarPage, scrollToTop, updateScrollTopVisibility, initScrollToTop,
    });
  }

  // ---- PART H PHASE 2: Quick-Access Sidebar ----
  if (typeof renderQuickAccessPanel === 'function') {
    Object.assign(window.__L5R_TEST__, {
      renderQuickAccessPanel, isQuickAccessPanelOpen, openQuickAccessPanel,
      closeQuickAccessPanel, toggleQuickAccessPanel, initQuickAccessPanel, publishTopbarHeight,
    });
  }

  // ---- PART H PHASE 9: Clan-themed look ----
  if (typeof applyClanTheme === 'function') {
    Object.assign(window.__L5R_TEST__, {
      applyClanTheme, getAppliedClanKey, CLAN_THEME_PALETTE,
    });
  }

  // ---- PART G PHASE 3: Smart Roll Preview ----
  if (typeof showRollPreview === 'function') {
    Object.assign(window.__L5R_TEST__, {
      showRollPreview, rollPreviewGate, buildRollModifierRows, ROLL_PREVIEW_ENABLED,
      ROLL_PREVIEW_VOID_KEYS,
    });
  }

  // ---- PART G PHASE 4: "Explain This Roll" ----
  if (typeof buildRollBasePoolRows === 'function') {
    Object.assign(window.__L5R_TEST__, {
      buildRollBasePoolRows, ROLL_BREAKDOWN_ENABLED,
    });
  }

  // ---- PART J PHASE 5: Character Creation Linting ----
  // Every rule function is exported individually, not just the aggregate: the harness builds a
  // character that trips exactly one rule and asserts that rule alone, which is what keeps a
  // check from passing because some other rule happened to fire.
  if (typeof validateCharacter === 'function') {
    Object.assign(window.__L5R_TEST__, {
      validateCharacter, renderValidationReport, CHARACTER_VALIDATOR_ENABLED,
      CHARACTER_VALIDATOR_RULES,
      ruleCasterLockConflict, ruleBushiSpellViolation, ruleMissingSchoolSkills,
      ruleSchoolChoiceSlots, ruleXpOverspend, ruleXpUnspent, ruleTraitRange,
      ruleTraitBelowFreeFloor, ruleSchoolRankOverInsight,
      validatorConcreteSkills, validatorChoiceSlots, validatorSchoolEntries,
    });
  }

  // ---- PART J PHASE 8: Casting Diagnostics ("Why can't I cast this?") ----
  // The registry's register/unregister pair is exported because it is this phase's EXTENSION
  // POINT, not just its internals: Phase 6 (Part G) will register a contributor through it, and
  // the harness proves that path works before Phase 6 exists to use it. Each rule is exported
  // individually for the same reason Phase 5's are -- so a check can assert one rule alone.
  if (typeof getCastingDiagnostics === 'function') {
    Object.assign(window.__L5R_TEST__, {
      getCastingDiagnostics, makeCastingContext, diagnoseCastability,
      CASTING_DIAGNOSTICS_ENABLED, CASTING_DIAGNOSTIC_REGISTRY,
      registerCastingDiagnostic, unregisterCastingDiagnostic, castingSuppression,
      castingRuleSchoolRestriction, castingRuleRankTooLow, castingRuleDeficiencyLockout,
      castingRuleMissingScroll, castingRuleNotMemorised, castingRuleWrongElement,
      castingRuleNoSlots,
      openCastingDiagnostics, closeCastingDiagnostics, refreshAllCastingDiagnosticButtons,
    });
  }

  // ---------- Init ----------
  (async function init(){
    resetToBaseline();
    // PART C FEATURE 2 - stance tiles + rules modal.
    renderStanceTiles();
    // PART C FEATURE 6 - Add Arrows picker, and a first decoration pass over Equipment.
    document.getElementById('addArrows').addEventListener('click', openArrowsPicker);
    document.getElementById('arrowsPickerClose').addEventListener('click', closeArrowsPicker);
    document.getElementById('arrowsPickerOverlay').addEventListener('click', e=>{
      if(e.target.id === 'arrowsPickerOverlay') closeArrowsPicker();
    });
    refreshAllEquipRows();
    // PART C FEATURE 4 - Void spend panel.
    renderVoidPanel();
    document.getElementById('combatActiveToggle').addEventListener('change', e=>{
      setCombatActive(e.target.checked); recalcAll();
    });
    document.getElementById('voidDamageApply').addEventListener('click', ()=>{
      const res = applyVoidDamageReduction(document.getElementById('voidDamageInput').value);
      if(res) toggleVoidDamageRow(false);
    });
    document.getElementById('voidDamageCancel').addEventListener('click', ()=>toggleVoidDamageRow(false));
    document.getElementById('stanceInfoClose').addEventListener('click', closeStanceInfo);
    document.getElementById('stanceInfoOverlay').addEventListener('click', e=>{
      if(e.target.id==='stanceInfoOverlay') closeStanceInfo();
    });
    // PART H PHASE 1.6: the two Combat-tab formula info buttons, opening through the same
    // stance-info overlay (see showCombatFormulaInfo in 180-feat-stances.js). Both buttons
    // live inside a <summary>, so the click must be stopped before it bubbles -- otherwise
    // opening the formula popup would also toggle the details section open or closed, the
    // same guard renderStanceTiles() already uses for its own info buttons.
    document.getElementById('combatTnInfoBtn').addEventListener('click', e=>{
      e.stopPropagation(); e.preventDefault(); showCombatFormulaInfo('tn');
    });
    document.getElementById('combatAttackInfoBtn').addEventListener('click', e=>{
      e.stopPropagation(); e.preventDefault(); showCombatFormulaInfo('attack');
    });
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape' && document.getElementById('stanceInfoOverlay').style.display==='flex'){
        closeStanceInfo();
      }
    });
    // PART H PHASE 1 - scroll-to-top button (205-feat-ui-foundations.js). Guarded, like the
    // seam export above, so removing this phase's fragment without also touching this file
    // leaves init() intact instead of throwing here and aborting everything after it.
    if (typeof initScrollToTop === 'function') initScrollToTop();
    // PART H PHASE 2 - Quick-Access panel toggle (206-feat-quick-access-sidebar.js). Guarded
    // for the same reason.
    if (typeof initQuickAccessPanel === 'function') initQuickAccessPanel();
    // PART H PHASE 9 - Clan-themed look (207-feat-clan-theming.js). recalcAll() (called by
    // resetToBaseline() above, and by applyData() on every character load) already re-applies
    // this on its own, but an explicit call here means the very first paint is correct too,
    // before anything else has triggered a recalc. Guarded for the same reason as the two above.
    if (typeof applyClanTheme === 'function') applyClanTheme();
    // PART J PHASE 8 - Casting Diagnostics (209.7-feat-casting-diagnostics.js): wires the
    // modal's close controls and paints the first pass of castability badges. Guarded for the
    // same reason as the three above.
    if (typeof initCastingDiagnostics === 'function') initCastingDiagnostics();
    await refreshCharSelect();
  })();

})();