  // ========= PART J PHASE 8: CASTING DIAGNOSTICS ("Why can't I cast this?") =========
  //
  // Answers one question about a spell already sitting on the Techniques/Kata/Spells list:
  // could you cast this RIGHT NOW, and if not, why?
  //
  // That question had no owner before this phase. Every other gate in the sheet runs at
  // ACQUISITION time -- techQuickAddOptionsHTML() padlocks a spell you may not learn -- and
  // castSpell() itself checks nothing but whether a slot is free. So once an entry is on the
  // list its Cast button is unconditional, and a character who has since taken a Bushi School,
  // lost School Rank, or had a Deficiency applied keeps a Cast button the picker would now
  // refuse to hand them.
  //
  // THIS PHASE NEVER BLOCKS A CAST. It reports, exactly as Phase 5 (Part J) reports on character
  // legality: the Cast button behaves identically whether this fragment is present or deleted,
  // and no arithmetic anywhere reads anything computed here. That is deliberate. A diagnostic
  // that is wrong about a rule should cost the player an explanation, never a spell.
  //
  // ---------------------------------------------------------------------------------------
  // WHY THIS IS A REGISTRY AND NOT A LIST OF IFS
  //
  // Phase 6 of Part G, Kata/Technique Synergy Detection, is a declared dependency of this phase
  // in the roadmap and is NOT built -- it is blocked on technique rules text this repository
  // does not carry (of the 338 technique names the School libraries reference, 98 have no
  // description at all and the other 240 are labelled in-code as paraphrases, not exact rules
  // text). The six reasons below are all enforceable from rules the sheet already encodes, so
  // they are built now; what Phase 6 adds later is the EXCEPTIONS -- a technique or kata that
  // LIFTS one of these restrictions.
  //
  // It has to be able to do that without this file being edited, or Phase 6's code would end
  // up living inside this phase's marker blocks and neither would be surgically removable.
  // So the shape here is copied from PREROLL_MODIFIER_REGISTRY in 130-round-and-pipeline.js,
  // whose own comment states the contract: "Each later feature registers its own contributor
  // and never edits this pipeline." Same here. Phase 6 will call
  // registerCastingDiagnostic('synergy-exceptions', 50, fn) from its own fragment.
  //
  // A contributor may do either of two things, which is the other half of what Phase 6 needs:
  //   * return findings   -- add a reason, the way the six built-in rules do;
  //   * return a suppression ({ suppresses:'rank-too-low', reason:'...' }) -- cancel a reason
  //     another rule raised, which is what "this technique lets you ignore that" means.
  // The precedent for a contributor kind that does not simply add is Feature 6 (Part C)'s
  // `informational` modifier in the roll pipeline, whose deltas are forced to zero.
  //
  // A suppressed blocker does not vanish -- it is rewritten as a note saying it was lifted and
  // by what. This project has already learned that lesson once: in the Void offer list, an
  // option refused for a real reason that disappeared silently was reported as a broken
  // feature (see BUGFIX -- Void Offer List (Wrong Baseline, Silent Refusal)).
  // ---------------------------------------------------------------------------------------

  // One-line kill-switch, per this project's convention for a feature phase. With this false
  // getCastingDiagnostics() reports nothing, the button is never attached, and the sheet is
  // exactly as it was before this phase.
  const CASTING_DIAGNOSTICS_ENABLED = true;

  // Severity vocabulary. Deliberately this phase's OWN constants rather than Phase 5 (Part J)'s
  // ('error'/'warning'/'info'): sharing them would make one phase's removal edit the other's
  // rules, which is precisely what CLAUDE.md's surgical-removability contract forbids. The
  // words differ too, because they mean different things -- Phase 5 grades how wrong a
  // character sheet is, this grades whether a spell will leave your hands.
  const CASTING_SEVERITY_ORDER = { blocker: 0, caution: 1, note: 2 };
  const CASTING_BADGES = {
    blocker: { icon: '✕', label: 'Blocks this cast' },
    caution: { icon: '⚠', label: 'May block this cast' },
    note:    { icon: 'ℹ', label: 'Worth knowing' },
  };

  function castingFinding(id, severity, title, detail){
    return { id: id, severity: severity, title: title, detail: detail };
  }
  // The shape a contributor returns to CANCEL a finding rather than add one. Exported on the
  // test seam so Phase 6 -- and this phase's own harness -- can build one without copying it.
  function castingSuppression(id, reason){
    return { suppresses: id, reason: reason || '' };
  }

  // ---------- The registry ----------
  // Lower priority runs first. Order only affects the order findings are collected in; they
  // are sorted by severity before display, so this is for readability, not correctness.
  const CASTING_DIAGNOSTIC_REGISTRY = [];
  function registerCastingDiagnostic(id, priority, fn){
    if(typeof fn !== 'function') return false;
    const entry = { id: id, priority: priority || 0, fn: fn };
    const existing = CASTING_DIAGNOSTIC_REGISTRY.findIndex(function(r){ return r.id === id; });
    if(existing >= 0) CASTING_DIAGNOSTIC_REGISTRY[existing] = entry;
    else CASTING_DIAGNOSTIC_REGISTRY.push(entry);
    CASTING_DIAGNOSTIC_REGISTRY.sort(function(a,b){ return a.priority - b.priority; });
    return true;
  }
  function unregisterCastingDiagnostic(id){
    const i = CASTING_DIAGNOSTIC_REGISTRY.findIndex(function(r){ return r.id === id; });
    if(i >= 0){ CASTING_DIAGNOSTIC_REGISTRY.splice(i, 1); return true; }
    return false;
  }

  // ---------- The context ----------
  // Every DOM read this phase performs happens HERE, once, and every rule below is a pure
  // function of the object this returns. Two reasons, both practical: a rule that cannot
  // reach the document cannot accidentally depend on render order, and Phase 6 will want to
  // ask "could this be cast" about a spell that is not currently painted on screen.
  function makeCastingContext(entry){
    if(!entry) return null;
    const nameInput = entry.querySelector('.en-name');
    const name = ((nameInput && nameInput.value) || '').trim();
    const elementKey = entry.dataset.spellElement || '';
    const isUniversal = elementKey === 'universal';
    const isMaho = entry.dataset.spellIsMaho === 'true';
    const mastery = Math.max(0, Math.round(parseFloat(entry.dataset.spellMastery || '0') || 0));
    const keywords = (entry.dataset.spellKeywords || '').split(',')
      .map(function(k){ return k.trim(); }).filter(Boolean);
    const isMemorised = entry.dataset.isMemorised === 'true';
    const elMeta = SPELL_ELEMENTS.find(function(e){ return e.key === elementKey; });
    const elementName = elMeta ? elMeta.name : (isUniversal ? 'Universal' : '');

    // Slot state for one element key, read the same way castSpell() reads it.
    function slotsFor(key){
      const ringEl = document.getElementById('ring_' + key);
      const usedEl = document.getElementById('spell_used_' + key);
      if(!ringEl || !usedEl) return null;
      const max = Math.max(0, Math.min(10, parseInt(ringEl.value || '0', 10) || 0));
      const used = Math.max(0, Math.min(max, parseInt(usedEl.value || '0', 10) || 0));
      return { max: max, used: used, free: max - used };
    }
    const bonusRingEl = document.getElementById('ring_void');
    const bonusUsedEl = document.getElementById('spell_bonus_used_shared');
    const bonusMax = bonusRingEl ? Math.max(0, Math.min(10, parseInt(bonusRingEl.value || '0', 10) || 0)) : 0;
    const bonusUsed = bonusUsedEl ? Math.max(0, Math.min(bonusMax, parseInt(bonusUsedEl.value || '0', 10) || 0)) : 0;

    // Which School locked the caster path, so the report can name it rather than just assert
    // a category. Uses the same two functions characterCasterLock() itself walks.
    const casterLock = characterCasterLock();
    let casterLockSchool = '';
    if(casterLock){
      const list = getSchoolsList();
      for(let i = 0; i < list.length; i++){
        if(schoolCasterCategory(findSchoolLibraryEntry(list[i].name)) === casterLock){
          casterLockSchool = list[i].name; break;
        }
      }
    }

    // Deficiency attribution, mirroring universalSpellElementBlockReason()'s own test so this
    // phase and that pop-up can never disagree about whether a Deficiency is the cause.
    const elementalProfile = getActiveSchoolElementalProfile();
    const keywordProfile = getActiveSchoolKeywordProfile();
    const fixedDeficiency = !!(elementalProfile.deficiency && elementalProfile.deficiency === elementName);
    const chosenDeficiency = !!(keywordProfile.deficiencyElement && keywordProfile.deficiencyElement === elementName
      && !(keywordProfile.deficiencyExcludesKeyword && keywords.indexOf(keywordProfile.deficiencyExcludesKeyword) >= 0));

    // Universal spells name no Element, so "can you cast it" is really "is there an Element
    // left you could cast it IN". Reuse the pop-up's own reason function verbatim.
    const universalOptions = isUniversal
      ? UNIVERSAL_SPELL_ELEMENTS.map(function(el){
          return { element: el, blockReason: universalSpellElementBlockReason(el, mastery, keywords, isMaho) };
        })
      : [];

    return {
      name: name,
      elementKey: elementKey,
      elementName: elementName,
      isUniversal: isUniversal,
      isMaho: isMaho,
      mastery: mastery,
      keywords: keywords,
      isMemorised: isMemorised,
      hasScroll: hasSpellScroll(name),
      casterLock: casterLock,
      casterLockSchool: casterLockSchool,
      effRank: isUniversal ? effectiveSchoolRankForElement('Universal')
                           : effectiveSchoolRankForSpell(elementName, keywords),
      fixedDeficiency: fixedDeficiency,
      chosenDeficiency: chosenDeficiency,
      deficiencyElement: elementalProfile.deficiency || keywordProfile.deficiencyElement || '',
      slots: isUniversal ? null : slotsFor(elementKey),
      bonusMax: bonusMax,
      bonusUsed: bonusUsed,
      bonusFree: bonusMax - bonusUsed,
      universalOptions: universalOptions,
    };
  }

  // ---------- The six built-in rules ----------
  // Each reports against the sheet's OWN deciding code rather than a second opinion about the
  // rule. Where a rule here disagrees with what the sheet does, the sheet is right and this is
  // the bug -- that is the invariant the harness tests against.

  // 1. School restriction. Mirrors techQuickAddOptionsHTML()'s own bushi branch:
  //    `if(casterLock === 'bushi') return s.maho === true && hasSpellScroll(s.name);`
  function castingRuleSchoolRestriction(ctx){
    if(ctx.casterLock === 'bushi' && !ctx.isMaho){
      return castingFinding('school-restriction', 'blocker',
        'Your School cannot cast this',
        'You hold a Bushi School' + (ctx.casterLockSchool ? ' (' + ctx.casterLockSchool + ')' : '')
        + '. A Bushi casts Maho spells only, and only from a scroll — an ordinary spell is not '
        + 'available to you at any Rank. The spell picker already refuses to add one; this entry '
        + 'predates the School, or was added before it.');
    }
    if(!ctx.casterLock){
      return castingFinding('school-restriction', 'note',
        'No School recorded yet',
        'Nothing on the Identity tab commits you to a Shugenja or Bushi path, so your effective '
        + 'School Rank for this spell is ' + ctx.effRank + '.');
    }
    return null;
  }

  // 2. Rank too low. Stays silent when a Deficiency is the cause -- rule 3 says it better, and
  //    two findings for one gate would be double-reporting. This is the same split the sheet
  //    already makes inside universalSpellElementBlockReason().
  function castingRuleRankTooLow(ctx){
    if(ctx.isMaho) return null;           // RAW: Maho has no School/Insight Rank limitation to cast.
    if(ctx.isUniversal) return null;      // handled per-Element by rule 6.
    if(ctx.fixedDeficiency || ctx.chosenDeficiency) return null;
    if(ctx.effRank >= ctx.mastery) return null;
    return castingFinding('rank-too-low', 'blocker',
      'Your School Rank is too low',
      'This is a Mastery ' + ctx.mastery + ' spell and your effective School Rank in '
      + ctx.elementName + ' is ' + ctx.effRank + '.');
  }

  // 3. Deficiency lockout. The same gate as rule 2, attributed to its cause.
  function castingRuleDeficiencyLockout(ctx){
    if(ctx.isMaho || ctx.isUniversal) return null;
    if(!(ctx.fixedDeficiency || ctx.chosenDeficiency)) return null;
    if(ctx.effRank >= ctx.mastery) return null;
    return castingFinding('deficiency-lockout', 'blocker',
      'A Deficiency puts this spell out of reach',
      'Your School has a Deficiency in ' + ctx.elementName + ', dropping your effective School '
      + 'Rank to ' + ctx.effRank + '. This Mastery ' + ctx.mastery + ' spell needs at least '
      + ctx.mastery + '.');
  }

  // 4. Missing scroll. Memorisation overrides it entirely, which is the sheet's own rule --
  //    see the makeEquipRow remove handler, where a memorised spell is excluded from the
  //    scroll's dependents.
  function castingRuleMissingScroll(ctx){
    if(ctx.isMemorised) return null;
    if(ctx.hasScroll) return null;
    return castingFinding('missing-scroll', 'blocker',
      'You do not have the scroll',
      'Casting from a scroll needs "Spell Scroll — ' + (ctx.name || 'this spell')
      + '" in your Equipment, and nothing there matches. Memorising the spell removes this '
      + 'requirement permanently.');
  }

  // 5. Not memorised. Only worth saying when the scroll IS present -- otherwise rule 4 has
  //    already said the stronger version of it.
  function castingRuleNotMemorised(ctx){
    if(ctx.isMemorised) return null;
    if(!ctx.hasScroll) return null;
    return castingFinding('not-memorised', 'note',
      'Castable only while you hold the scroll',
      'This spell is not memorised, so it depends on the scroll staying in your Equipment. '
      + 'Memorising it costs ' + ctx.mastery + ' XP and makes it permanent.');
  }

  // 6. Wrong element. For a Universal spell this is the real question -- it names no Element,
  //    so casting it means picking one you can actually cast in. Delegates every per-Element
  //    verdict to universalSpellElementBlockReason(), the same function the picker uses, so
  //    the report and the picker cannot disagree.
  //    A single-Element spell has no "wrong element" case in this sheet's rules: its Element
  //    is fixed at add time and rules 2 and 3 already cover being unable to cast in it.
  function castingRuleWrongElement(ctx){
    if(!ctx.isUniversal) return null;
    const blocked = ctx.universalOptions.filter(function(o){ return !!o.blockReason; });
    if(!blocked.length) return null;
    if(blocked.length === ctx.universalOptions.length){
      return castingFinding('wrong-element', 'blocker',
        'No Element is available for this spell',
        'A Universal spell is cast using one Element of your choice, and every one of '
        + ctx.universalOptions.map(function(o){ return o.element; }).join(', ')
        + ' is currently out of reach. ' + blocked[0].blockReason);
    }
    return castingFinding('wrong-element', 'caution',
      'Some Elements are not available',
      'You may cast this using '
      + ctx.universalOptions.filter(function(o){ return !o.blockReason; })
          .map(function(o){ return o.element; }).join(' or ')
      + '. Not available: ' + blocked.map(function(o){ return o.element; }).join(', ') + '.');
  }

  // 7. Spell slots. NOT one of the roadmap's six, and added deliberately: it is the only
  //    refusal the sheet actually enforces at cast time (castSpell() alerts "All ... spell
  //    slots used"), so a report that omitted it would be silent about the one thing that
  //    stops a cast today. Recorded as a scope addition in this phase's README.
  function castingRuleNoSlots(ctx){
    if(ctx.isMaho) return null;           // Maho consumes no spell slot -- see castMahoSpell().
    if(ctx.isUniversal) return null;      // the slot spent depends on the Element picked at cast time.
    if(!ctx.slots) return null;
    if(ctx.slots.free > 0) return null;
    if(ctx.bonusFree > 0){
      return castingFinding('no-slots', 'caution',
        'No ' + ctx.elementName + ' slots left — a bonus slot would be spent',
        'All ' + ctx.slots.max + ' of your ' + ctx.elementName + ' slots are used. Casting will '
        + 'offer the shared bonus pool instead (' + ctx.bonusFree + ' of ' + ctx.bonusMax + ' left).');
    }
    return castingFinding('no-slots', 'blocker',
      'No spell slots left',
      'All ' + ctx.slots.max + ' ' + ctx.elementName + ' slots and all ' + ctx.bonusMax
      + ' shared bonus slots are spent.');
  }

  registerCastingDiagnostic('school-restriction',  10, castingRuleSchoolRestriction);
  registerCastingDiagnostic('rank-too-low',        20, castingRuleRankTooLow);
  registerCastingDiagnostic('deficiency-lockout',  30, castingRuleDeficiencyLockout);
  registerCastingDiagnostic('wrong-element',       40, castingRuleWrongElement);
  registerCastingDiagnostic('missing-scroll',      50, castingRuleMissingScroll);
  registerCastingDiagnostic('not-memorised',       60, castingRuleNotMemorised);
  registerCastingDiagnostic('no-slots',            70, castingRuleNoSlots);

  // ---------- The collector ----------
  // Runs every contributor, contains one that throws (the others still report -- a broken
  // future contributor must not be able to silence the six that work), applies suppressions,
  // and sorts worst-first.
  function getCastingDiagnostics(ctx){
    const empty = { findings: [], counts: { blocker: 0, caution: 0, note: 0 }, castable: true };
    if(!CASTING_DIAGNOSTICS_ENABLED || !ctx) return empty;
    const raw = [];
    const suppressions = {};
    CASTING_DIAGNOSTIC_REGISTRY.forEach(function(rule){
      let got;
      try { got = rule.fn(ctx); }
      catch(err){
        raw.push(castingFinding('rule-threw', 'note',
          'Check "' + rule.id + '" could not run', String((err && err.message) || err)));
        return;
      }
      if(!got) return;
      (Array.isArray(got) ? got : [got]).forEach(function(f){
        if(!f) return;
        if(f.suppresses) suppressions[f.suppresses] = { reason: f.reason || '', by: rule.id };
        else raw.push(f);
      });
    });
    const findings = raw.map(function(f){
      const s = suppressions[f.id];
      if(!s) return f;
      // Lifted, not deleted: the player is told the restriction existed and what removed it.
      return castingFinding(f.id + '-lifted', 'note', f.title + ' — lifted',
        s.reason || ('Lifted by "' + s.by + '".'));
    });
    findings.sort(function(a,b){
      return CASTING_SEVERITY_ORDER[a.severity] - CASTING_SEVERITY_ORDER[b.severity];
    });
    const counts = { blocker: 0, caution: 0, note: 0 };
    findings.forEach(function(f){ if(counts[f.severity] !== undefined) counts[f.severity]++; });
    return { findings: findings, counts: counts, castable: counts.blocker === 0 };
  }

  // Convenience: context + diagnostics for one entry element, which is what the UI wants.
  function diagnoseCastability(entry){
    return getCastingDiagnostics(makeCastingContext(entry));
  }

  // ---------- UI ----------
  // The button is created HERE, not in makeEntry(), so the whole visual surface of this phase
  // lives inside this fragment and the shared file carries one guarded line.
  function attachCastingDiagnosticButton(entry, isSpellEntry){
    if(!CASTING_DIAGNOSTICS_ENABLED) return;
    if(!entry || !isSpellEntry) return;
    const top = entry.querySelector('.entry-top');
    if(!top || top.querySelector('.cast-why-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ghost cast-why-btn';
    btn.textContent = '?';
    btn.title = 'Why can’t I cast this?';
    btn.setAttribute('aria-label', 'Why can’t I cast this?');
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      openCastingDiagnostics(entry);
    });
    const castBtn = top.querySelector('.spell-cast-btn');
    if(castBtn && castBtn.nextSibling) top.insertBefore(btn, castBtn.nextSibling);
    else if(castBtn) top.appendChild(btn);
    else top.appendChild(btn);
    refreshCastingDiagnosticButton(entry);
  }

  // Passive state on the button itself, so a blocked spell is visible without opening
  // anything. Recomputed on demand rather than cached -- the answer depends on School, Rank,
  // Equipment and slot state, any of which can change after the entry was built.
  function refreshCastingDiagnosticButton(entry){
    if(!CASTING_DIAGNOSTICS_ENABLED || !entry) return;
    const btn = entry.querySelector('.cast-why-btn');
    if(!btn) return;
    let report;
    try { report = diagnoseCastability(entry); }
    catch(err){ return; }
    btn.classList.toggle('cwd-blocked', report.counts.blocker > 0);
    btn.classList.toggle('cwd-caution', report.counts.blocker === 0 && report.counts.caution > 0);
    btn.textContent = report.counts.blocker > 0 ? '✕' : '?';
  }

  // Every spell entry currently on the list. Called from recalcAll() so the badges follow a
  // School change, a Rank edit, or a scroll being removed.
  function refreshAllCastingDiagnosticButtons(){
    if(!CASTING_DIAGNOSTICS_ENABLED) return;
    const list = document.getElementById('techList');
    if(!list) return;
    Array.prototype.forEach.call(list.querySelectorAll('.entry'), function(entry){
      refreshCastingDiagnosticButton(entry);
    });
  }

  function castingDiagnosticsHTML(report, ctx){
    if(!report.findings.length){
      return '<div class="cwd-clean">Nothing is stopping this cast.</div>';
    }
    return report.findings.map(function(f){
      const badge = CASTING_BADGES[f.severity] || CASTING_BADGES.note;
      return '<div class="cwd-row cwd-' + f.severity + '" data-rule="' + escAttr(f.id) + '">'
        + '<span class="cwd-badge cwd-badge-' + f.severity + '" title="' + escAttr(badge.label) + '">'
        + badge.icon + '</span>'
        + '<div class="cwd-text"><strong>' + escHtml(f.title) + '</strong>'
        + '<div class="cwd-detail">' + escHtml(f.detail) + '</div></div>'
        + '</div>';
    }).join('');
  }

  function openCastingDiagnostics(entry){
    const overlay = document.getElementById('castWhyModalOverlay');
    if(!overlay) return;
    const ctx = makeCastingContext(entry);
    const report = getCastingDiagnostics(ctx);
    const subtitle = document.getElementById('castWhySubtitle');
    const body = document.getElementById('castWhyBody');
    if(subtitle){
      subtitle.textContent = (ctx && ctx.name ? ctx.name : 'This spell')
        + (ctx && ctx.elementName ? ' — ' + ctx.elementName : '')
        + (ctx && ctx.mastery ? ', Mastery ' + ctx.mastery : '');
    }
    if(body) body.innerHTML = castingDiagnosticsHTML(report, ctx);
    overlay.style.display = 'flex';
    if(typeof refreshModalStacking === 'function') refreshModalStacking(overlay);
  }
  function closeCastingDiagnostics(){
    const overlay = document.getElementById('castWhyModalOverlay');
    if(!overlay) return;
    overlay.style.display = 'none';
    if(typeof refreshModalStacking === 'function') refreshModalStacking(overlay);
  }

  // Wired from init(). Guarded there, so removing this fragment leaves a no-op call.
  function initCastingDiagnostics(){
    if(!CASTING_DIAGNOSTICS_ENABLED) return;
    const overlay = document.getElementById('castWhyModalOverlay');
    if(!overlay) return;
    const x = document.getElementById('castWhyX');
    if(x) x.addEventListener('click', closeCastingDiagnostics);
    overlay.addEventListener('click', function(e){
      if(e.target === overlay) closeCastingDiagnostics();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && overlay.style.display === 'flex') closeCastingDiagnostics();
    });
    refreshAllCastingDiagnosticButtons();
  }
