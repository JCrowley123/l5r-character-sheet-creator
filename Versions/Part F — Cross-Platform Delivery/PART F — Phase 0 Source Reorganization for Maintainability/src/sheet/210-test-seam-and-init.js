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

  // ---- PART I PHASE 4.5: Modal-Configured Advantages/Disadvantages ----
  // resolveAdvDisadvEffect is exported because it is the phase's pure core -- a check can hand
  // it a name and a picked value and read back the effect without a character sheet existing at
  // all. advConfigTraitXpDiscount is the one number recalcAll() actually consumes, so it is
  // asserted directly rather than only through the XP total it feeds. Added by a guarded
  // Object.assign after the main literal, per CLAUDE.md: a bare reference inside that literal
  // would throw while CONSTRUCTING the seam if this fragment were deleted, taking the whole
  // seam and init() with it.
 if (typeof resolveAdvDisadvEffect === 'function') {
   Object.assign(window.__L5R_TEST__, {
     ADV_CONFIG_ENABLED, ADV_CONFIG_ROLL_EFFECTS_ENABLED, advConfigRollModifiers,
     ADV_DISADV_CONFIG_SCHEMA, advConfigSchemaFor, advConfigOptionsFor,
     normalizeAdvName, readAdvConfig, writeAdvConfig, resolveAdvDisadvEffect,
     activeAdvConfigEffects, advConfigTraitXpDiscount, refreshAllAdvConfigControls,
     openAdvConfigModal, closeAdvConfigModal, confirmAdvConfigModal,
   });
 }

  // PART I PHASE 4.5 - completion-pass seams. Each submodule is guarded individually, so a
  // surgical removal of the especially isolated Kharmic Tie or Sacred Weapon layer leaves the
  // base seam and the app initialisation healthy rather than constructing a dead reference.
  if (typeof resolveExtendedAdvConfigEffect === 'function') {
    Object.assign(window.__L5R_TEST__, {
      ADV_CONFIG_EXTENDED_ENABLED, ADV_CONFIG_GENTRY_OPTIONS,
      isExtendedAdvConfigComplete, resolveExtendedAdvConfigEffect,
      advConfigSummaryForEffect, openExtendedAdvConfigModal,
      confirmExtendedAdvConfigModal, closeExtendedAdvConfigModal,
      newAdvConfigSourceId, advConfigExtendedRollModifiers,
    });
  }
  if (typeof advConfigKharmicEntries === 'function') {
    Object.assign(window.__L5R_TEST__, {
      ADV_CONFIG_KHARMIC_TIE_ENABLED, advConfigKharmicEntries,
      advConfigKharmicSetRemaining, resetAdvConfigKharmicTie,
      advConfigKharmicPreviewHtml, advConfigKharmicPreviewToggle,
      advConfigKharmicPreviewCommit, advConfigKharmicRollModifiers,
    });
  }
  if (typeof advConfigLuckEntries === 'function') {
    Object.assign(window.__L5R_TEST__, {
      ADV_CONFIG_SESSION_RESOURCES_ENABLED, advConfigLuckEntries,
      advConfigLuckSetRemaining, resetAdvConfigLuck,
      renderAdvConfigSessionResources, advConfigLuckRerollResult,
      onAdvConfigRollResult,
    });
  }
  if (typeof ensureAdvConfigSacredWeapon === 'function') {
    Object.assign(window.__L5R_TEST__, {
      ADV_CONFIG_SACRED_WEAPON_ENABLED, ADV_CONFIG_SACRED_WEAPON_PROFILES,
      advConfigSacredWeaponProfileForClan, advConfigSacredWeaponProfileById,
      ensureAdvConfigSacredWeapon, advConfigSacredWeaponEntryForRow,
      removeAdvConfigOwnedEquipment,
    });
  }

  // PART I FEATURE 4.53 BEGIN repairs-seam
  // Configuration repairs (209.89-feat-adv-config-repairs.js). Guarded and assigned after the
  // main literal for the same reason every 4.5 seam above is: a bare reference to a deleted
  // fragment's identifier inside the literal would throw while the seam object is being
  // CONSTRUCTED, taking init() down with it.
  if (typeof R453 === 'object' && R453) {
    Object.assign(window.__L5R_TEST__, {
      ADV_CONFIG_REPAIRS_ENABLED, R453,
    });
  }
  // END REPAIRS453 repairs-seam
  // PART I FEATURE 4.54 BEGIN ux-seam
  // Configuration UX pass (209.9-feat-adv-config-ux.js). Guarded and assigned after the main
  // literal for the same reason every 4.5 seam above is.
  if (typeof R454 === 'object' && R454) {
    Object.assign(window.__L5R_TEST__, {
      ADV_CONFIG_UX_ENABLED, R454,
    });
  }
  // END UX454 ux-seam
  // PART I FEATURE 4.55 BEGIN eligibility-seam
  // Eligibility gates + Great Potential skill validation (209.91-feat-adv-eligibility-gates.js).
  // Guarded and assigned after the main literal for the same reason every 4.5 seam above is.
  if (typeof R455 === 'object' && R455) {
    Object.assign(window.__L5R_TEST__, {
      ADV_ELIGIBILITY_GATES_ENABLED, R455,
    });
  }
  // END GATES455 eligibility-seam
  // PART I FEATURE 4.56 BEGIN rank-entries-seam
  // Perceived Honor and Wealthy rank handlers (209.92-feat-adv-rank-entries.js). Guarded and
  // assigned after the main literal for the same reason every 4.5 seam above is.
  if (typeof R456 === 'object' && R456) {
    Object.assign(window.__L5R_TEST__, {
      ADV_RANK_ENTRIES_ENABLED, R456,
    });
  }
  // END RANKS456 rank-entries-seam
  // PART I FEATURE 4.5.13 BEGIN named-advantages-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof N4513 === 'object' && N4513) {
    Object.assign(window.__L5R_TEST__, { ADV_NAMED_ENTRIES_ENABLED, N4513 });
  }
  // END NAMED4513 named-advantages-seam
  // PART I FEATURE 4.5.14 BEGIN court-servant-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof CS4514 === 'object' && CS4514) {
    Object.assign(window.__L5R_TEST__, { ADV_COURT_SERVANT_ENABLED, CS4514 });
  }
  // END CS4514 court-servant-seam
  // PART I FEATURE 4.5.15 BEGIN roll-declarations-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof RD4515 === 'object' && RD4515) {
    Object.assign(window.__L5R_TEST__, { ROLL_DECLARATIONS_ENABLED, RD4515 });
  }
  // END DECL4515 roll-declarations-seam
  // PART I FEATURE 4.5.16 BEGIN heart-vengeance-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof HV4516 === 'object' && HV4516) {
    Object.assign(window.__L5R_TEST__, { ADV_HEART_VENGEANCE_ENABLED, HV4516 });
  }
  // END HV4516 heart-vengeance-seam
  // PART I FEATURE 4.5.17 BEGIN wealthy-grant-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof W4517 === 'object' && W4517) {
    Object.assign(window.__L5R_TEST__, { ADV_WEALTHY_GRANT_ENABLED, W4517 });
  }
  // END W4517 wealthy-grant-seam
  // PART I FEATURE 4.5.18 BEGIN paragon-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof P4518 === 'object' && P4518) {
    Object.assign(window.__L5R_TEST__, { ADV_PARAGON_ENABLED, P4518 });
  }
  // END P4518 paragon-seam
  // PART I FEATURE 4.5.19 BEGIN soul-artistry-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof SA4519 === 'object' && SA4519) {
    Object.assign(window.__L5R_TEST__, { ADV_SOUL_ARTISTRY_ENABLED, SA4519 });
  }
  // END SA4519 soul-artistry-seam
  // PART I FEATURE 4.5.20 BEGIN void-versatility-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof VV4520 === 'object' && VV4520) {
    Object.assign(window.__L5R_TEST__, { ADV_VOID_VERSATILITY_ENABLED, VV4520 });
  }
  // END VV4520 void-versatility-seam
  // PART I FEATURE 4.5.21 BEGIN fortune-blessing-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof FB4521 === 'object' && FB4521) {
    Object.assign(window.__L5R_TEST__, { ADV_FORTUNE_BLESSING_ENABLED, FB4521 });
  }
  // END FB4521 fortune-blessing-seam
  // PART I FEATURE 4.5.22 BEGIN naishou-citizen-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof NC4522 === 'object' && NC4522) {
    Object.assign(window.__L5R_TEST__, { ADV_NAISHOU_CITIZEN_ENABLED, NC4522 });
  }
  // END NC4522 naishou-citizen-seam
  // PART I FEATURE 4.5.23 BEGIN dark-paragon-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof DP4523 === 'object' && DP4523) {
    Object.assign(window.__L5R_TEST__, { ADV_DARK_PARAGON_ENABLED, DP4523 });
  }
  // END DP4523 dark-paragon-seam
  // PART I FEATURE 4.5.24 BEGIN spirit-realms-seam
  // Guarded post-literal assignment; this release can be removed without aborting init.
  if (typeof TR4524 === 'object' && TR4524) {
    Object.assign(window.__L5R_TEST__, { ADV_SPIRIT_REALMS_ENABLED, TR4524 });
  }
  // END TR4524 spirit-realms-seam
  // PART I FEATURE 4.57 BEGIN unlucky-seam
  // Unlucky (209.93-feat-disadv-unlucky.js). Guarded and assigned after the main literal for the
  // same reason every 4.5 seam above is. showRollResult is exported here too: it is the dice
  // engine's own function, and a harness cannot drive an Unlucky reroll without it.
  if (typeof R457 === 'object' && R457) {
    Object.assign(window.__L5R_TEST__, {
      DISADV_UNLUCKY_ENABLED, R457, showRollResult,
    });
  }
  // END UNLUCKY457 unlucky-seam
  // PART I FEATURE 4.58 BEGIN dependant-wrath-seam
  // Dependant (D02) and Wrath of the Kami (D07), 209.94-feat-disadv-dependant-wrath.js. Guarded
  // and assigned after the main literal for the same reason every 4.5 seam above is.
  if (typeof R458 === 'object' && R458) {
    Object.assign(window.__L5R_TEST__, {
      DISADV_DEPENDANT_WRATH_ENABLED, R458,
    });
  }
  // END AGREED458 dependant-wrath-seam
  // PART I FEATURE 4.59 BEGIN doubt-seam
  // Doubt (209.95-feat-disadv-doubt.js). Guarded and assigned after the main literal for the same
  // reason every 4.5 seam above is. ROLL_KINDS and getPreRollModifiers are exported here too:
  // a harness cannot prove the damage exclusion without building a real damage context.
  if (typeof R459 === 'object' && R459) {
    Object.assign(window.__L5R_TEST__, {
      DISADV_DOUBT_ENABLED, R459,
    });
  }
  // END DOUBT459 doubt-seam
  // PART I FEATURE 4.5.10 BEGIN realm-seam
  // Cursed by the Realm (209.96-feat-disadv-realm.js). Guarded and assigned after the main literal
  // for the same reason every 4.5 seam above is. ADV_LIBRARY is exported here too: Yomi's branch
  // reads the character's ancestral entries, and only DISADV_LIBRARY was on the seam before, so a
  // harness could not check the Advantage half of that claim at all.
  if (typeof R4510 === 'object' && R4510) {
    Object.assign(window.__L5R_TEST__, {
      DISADV_REALM_ENABLED, R4510, ADV_LIBRARY,
    });
  }
  // END REALM4510 realm-seam
  // PART I FEATURE 4.5.11 BEGIN fortune-seam
  // Guarded Object.assign AFTER the main object literal, never inline shorthand inside it: a bare
  // reference to an undeclared identifier there throws while CONSTRUCTING the seam, taking the
  // whole seam and all of init() with it. DISADV_LIBRARY is exported here because this entry is a
  // Disadvantage and its catalogue row (name, cat, cost) is the oracle its own checks read --
  // Feature 4.5.10 exported ADV_LIBRARY for the same reason, and the Disadvantage side was the
  // half still missing.
  if (typeof F4511 === 'object' && F4511) {
    Object.assign(window.__L5R_TEST__, {
      DISADV_FORTUNE_ENABLED, F4511, DISADV_LIBRARY,
    });
  }
  // END FORTUNE4511 fortune-seam
  // PART I FEATURE 4.5.12 BEGIN bishamon-seam
  // Guarded Object.assign AFTER the main object literal, for the reason 4.5.11's block above
  // gives. getWeaponDamageDice is already exported by the trunk, so this phase's checks read the
  // REAL damage maths rather than anything it owns -- the oracle rule in CLAUDE.md.
  if (typeof F4512 === 'object' && F4512) {
    Object.assign(window.__L5R_TEST__, {
      DISADV_BISHAMON_ENABLED, F4512,
    });
  }
  // END BISHAMON4512 bishamon-seam
  // BUGFIX MASTERYRANK BEGIN mastery-label-seam
  // Guarded Object.assign AFTER the main object literal, for the reason 4.5.11's and 4.5.12's
  // blocks above give: a bare reference to an undeclared identifier inside the literal throws
  // while CONSTRUCTING the seam, taking the whole seam and all of init() with it.
  //
  // getWeaponDamageDice is already exported by the trunk, so this fix's checks read the REAL
  // breakdown rather than anything it owns -- the oracle rule in CLAUDE.md. The three pure
  // helpers are exported as well so the threshold arithmetic can be checked directly, including
  // the supersede rule for explosion thresholds, which no shipped skill exercises today.
  if(typeof masteryRankLabelRewrite === 'function'){
    Object.assign(window.__L5R_TEST__, {
      MASTERY_RANK_LABEL_FIX_ENABLED,
      masteryRankLabelRewrite, masteryContributingRanks, masteryExplosionRanks, masteryRankPhrase,
    });
  }
  // END MASTERYRANK mastery-label-seam
  // BUGFIX NEGMOD BEGIN negmod-seam
  // Guarded Object.assign AFTER the main object literal, for the reason the blocks above give:
  // a bare reference to an undeclared identifier inside the literal throws while CONSTRUCTING
  // the seam, taking the whole seam and all of init() with it.
  //
  // Both helpers are pure, so the sign and wording rules can be checked directly -- but the
  // suite drives REAL rolls for the two rendered strings rather than trusting these, because a
  // helper that is correct and never reached would satisfy a check that only asked the helper.
  if(typeof rollTotalModNote === 'function'){
    Object.assign(window.__L5R_TEST__, {
      NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED, signedRollMod, rollTotalModNote,
    });
  }
  // END NEGMOD negmod-seam
  // BUGFIX SPELLSLOT BEGIN spell-slot-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof SSA992 === 'object' && SSA992){
    Object.assign(window.__L5R_TEST__, {
      SPELL_SLOT_ACCOUNTING_FIX_ENABLED, SPELL_SLOT_REFUND_ENABLED, BONUS_PIP_GUARD_ENABLED,
      SSA992, ssaBonusPipTap,
    });
  }
  // END SPELLSLOT spell-slot-seam
  // PART K PHASE 11 BEGIN characters-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof CL11 === 'object' && CL11){
    Object.assign(window.__L5R_TEST__, {
      CHARACTERS_LIST_ENABLED, CHARACTERS_AUTOSAVE_ENABLED, CHARACTERS_SHARE_ENABLED,
      CL11, initCharactersList,
    });
  }
  // END CHARLIST11 characters-seam
  // PART K PHASE 11.2 BEGIN wizard-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof CW112 === 'object' && CW112){
    Object.assign(window.__L5R_TEST__, { CREATION_WIZARD_ENABLED, CW112 });
  }
  // END WIZARD112 wizard-seam
  // PART K PHASE 11.2.1 BEGIN wizard2-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof CW1121 === 'object' && CW1121){
    Object.assign(window.__L5R_TEST__, { WIZARD_SKILLS_ADV_ENABLED, CW1121 });
  }
  // END WIZARD1121 wizard2-seam
  // PART K PHASE 11.2.2 BEGIN wizard3-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init(). SPELL_LIBRARY (trunk) was not on the seam; the Spells step's checks
  // need it to name the spells they add.
  if(typeof CW1122 === 'object' && CW1122){
    Object.assign(window.__L5R_TEST__, { WIZARD_FREE_CHOICES_ENABLED, CW1122, SPELL_LIBRARY });
  }
  // END WIZARD1122 wizard3-seam
  // PART K PHASE 11.2.3 BEGIN wizard4-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof CW1123 === 'object' && CW1123){
    Object.assign(window.__L5R_TEST__, { WIZARD_STARTING_SPELLS_ENABLED, CW1123 });
  }
  // END WIZARD1123 wizard4-seam
  // PART K PHASE 11.2.4 BEGIN wizard5-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof CW1124 === 'object' && CW1124){
    Object.assign(window.__L5R_TEST__, { WIZARD_STARTING_SPELLS_ALL_ENABLED, CW1124 });
  }
  // END WIZARD1124 wizard5-seam
  // BUGFIX IMPORTFILTER BEGIN import-filter-seam
  // Guarded post-literal assignment, as every seam block above, so removing the fragment can
  // never abort init().
  if(typeof IMPORT_FILE_FILTER === 'object' && IMPORT_FILE_FILTER){
    Object.assign(window.__L5R_TEST__, { IMPORT_FILE_FILTER_FIX_ENABLED, IMPORT_FILE_FILTER });
  }
  // END IMPORTFILTER import-filter-seam
  // BUGFIX SCHOOLSKILLROWS BEGIN school-skill-rows-seam
  if (typeof SCHOOL_SKILL_ROWS === 'object' && SCHOOL_SKILL_ROWS) {
    Object.assign(window.__L5R_TEST__, { SCHOOL_SKILL_ROWS_FIX_ENABLED, SCHOOL_SKILL_ROWS,
      hasSchoolSkillOverlap, schoolConcreteSkillNames });
  }
  // END SCHOOLSKILLROWS school-skill-rows-seam
  // PART K PHASE 12 BEGIN modes-seam
  if (typeof MODES12 === 'object' && MODES12) {
    Object.assign(window.__L5R_TEST__, { MODES12_ENABLED, MODES12 });
  }
  // END MODES12 modes-seam
  // PART K PHASE 12.1 BEGIN modes-clan-school-seam
  if (typeof MODES121 === 'object' && MODES121) {
    Object.assign(window.__L5R_TEST__, { MODES121_ENABLED, MODES121 });
  }
  // END MODES121 modes-clan-school-seam
  // PART K PHASE 12.2 BEGIN modes-identity-seam
  if (typeof MODES122 === 'object' && MODES122) {
    Object.assign(window.__L5R_TEST__, { MODES122_ENABLED, MODES122 });
  }
  // END MODES122 modes-identity-seam
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
    // PART I PHASE 4.5 - Modal-configured Advantages/Disadvantages (209.8-feat-adv-config.js):
    // wires the picker modal's confirm/cancel controls and paints the first pass of per-entry
    // configuration controls. Guarded for the same reason as the three above.
    if (typeof initAdvConfig === 'function') initAdvConfig();
    await refreshCharSelect();
    // PART K PHASE 11 BEGIN characters-init
    // The Characters screen (209.993-feat-characters-list.js) needs the reset sheet and the
    // filled picker above. Guarded for the same reason as the calls above.
    if (typeof initCharactersList === 'function') await initCharactersList();
    // END CHARLIST11 characters-init
  })();

})();
