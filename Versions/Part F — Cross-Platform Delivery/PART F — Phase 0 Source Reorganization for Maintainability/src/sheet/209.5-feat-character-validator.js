  // ============ PART J PHASE 5: CHARACTER CREATION LINTING ============
  // One place that answers "is this character legal, and if not, why not?" -- as a standing
  // check over the whole sheet rather than a guard that only fires on the one code path that
  // happens to own the mistake.
  //
  // WHY THIS IS CONSOLIDATION, NOT NEW RULES. The audit that opened this phase found that most
  // of the deciding was already built, and built well: characterCasterLock() already knows a
  // character can never hold both a Bushi and a Shugenja School; schoolConcreteSkillNames()
  // already parses a School's skill string correctly (dropping rank suffixes, parenthetical
  // Emphases and "any one X" choice slots); recalcAll() already computes XP spent exactly, via
  // traitCost/voidCost/skillCost and their free floors. What none of it does is SAY SO. Each
  // check lives at the moment of one action -- the Add School button, the spell picker's
  // filter, the technique unlock gate -- so a character that arrives by any other route
  // (a JSON import, a hand-edited save, a School applied before a Skill was later deleted)
  // is never re-examined, and the sheet reports nothing at all.
  //
  // So every rule below reads the sheet and reuses the sheet's own deciding functions. This
  // file owns no rules content of its own. Where a rule needs a fact the sheet already
  // computes, it asks for it rather than recomputing -- the same line Phase 3 and Phase 4 took
  // for the roll pipeline, and for the same reason: a second implementation is free to drift,
  // and a validator that disagrees with the sheet it validates is worse than no validator.
  //
  // WHAT IS DELIBERATELY NOT HERE. The roadmap's rule list names "over-capped rings". The
  // sheet caps nothing about a Ring today, and the RAW that would say where the cap sits
  // (the character-creation Trait ceiling) is in sourcebooks this environment does not have.
  // Per the roadmap's own Process Requirement #3, that rule is NOT invented here -- it is
  // recorded as an open item in this phase's README, alongside what IS checkable about Traits
  // without any sourcebook: the range the sheet's own inputs already declare, and the free
  // floors Apply Family / Apply School already granted. See the README's "What needs the
  // sourcebooks" section.
  //
  // SEVERITY IS ADVICE, NEVER ENFORCEMENT. Nothing in this phase blocks an edit, clamps a
  // value, or refuses a save. A findings list that is wrong about an edge case must cost the
  // player nothing more than an inaccurate line of text they can ignore -- which is also what
  // makes this phase safe to remove: delete it and the sheet behaves exactly as it does now.
  const CHARACTER_VALIDATOR_ENABLED = true;

  // 'error'   -- the sheet's own rules say this character is not legal.
  // 'warning' -- legal, but something the character is entitled to is unclaimed or unfinished.
  // 'info'    -- neither; a note the player may or may not care about.
  const VALIDATION_SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

  function validationFinding(id, severity, title, detail){
    return { id: id, severity: severity, title: title, detail: detail };
  }

  // Every School the character holds, resolved against ALL THREE School libraries.
  //
  // Deliberately broader than characterCasterLock(), which resolves through
  // findSchoolLibraryEntry() (major Clans only) rather than findAnySchoolLibraryEntry(). A
  // Minor Clan or Brotherhood School therefore resolves to null there and sets no lock at all.
  // Reporting the truth from the full library is the point of a validator, so this uses the
  // wider lookup -- which means these rules can flag a conflict the Add School guard itself
  // would have let through. That divergence is recorded in this phase's README rather than
  // "fixed" here: changing characterCasterLock() would be editing Part E's behaviour from
  // inside a Part J phase, which the folder convention does not allow.
  function validatorSchoolEntries(){
    const list = (typeof getSchoolsList === 'function') ? getSchoolsList() : [];
    return list.map(function(e){
      return { entry: e, name: e.name, lib: findAnySchoolLibraryEntry(e.name) };
    });
  }

  // The concrete (named, non-"any one X") School Skills a School teaches, for ANY School.
  //
  // schoolConcreteSkillNames() in 070-schools-paths-techniques.js does exactly this parse but
  // searches SCHOOL_LIBRARY alone, so it returns [] for a Minor Clan or Brotherhood School.
  // The parse itself is the part worth reusing and the lookup is the part that is too narrow,
  // so this takes the resolved library entry as its argument and applies the same four steps:
  // drop a trailing rank count ("Horsemanship 2"), drop a parenthetical Emphasis, drop "any
  // one X" choice slots, drop blanks.
  function validatorConcreteSkills(libEntry){
    if(!libEntry || typeof libEntry.skills !== 'string') return [];
    return libEntry.skills.split(',')
      .map(function(s){ return s.trim(); })
      .map(function(s){ return s.replace(/\s*\d+\s*$/, ''); })
      .map(function(s){ return s.replace(/\s*\([^)]*\)\s*$/, ''); })
      .filter(function(s){ return !/^any\b/i.test(s); })
      .filter(Boolean);
  }

  // The "any one X Skill" slots a School grants, which Apply School counts and then discards
  // (its `skippedChoices` local). Recovered here by the same test Apply School itself uses.
  function validatorChoiceSlots(libEntry){
    if(!libEntry || typeof libEntry.skills !== 'string') return [];
    return libEntry.skills.split(',')
      .map(function(s){ return s.trim(); })
      .filter(function(s){ return /^any\b/i.test(s); });
  }

  // Skill name -> Rank, read from the live Skills table the same way recalcAll() reads it.
  function validatorSkillRanks(){
    const out = {};
    document.querySelectorAll('#skillsBody tr').forEach(function(tr){
      const nameEl = tr.querySelector('.sk-name');
      const rankEl = tr.querySelector('.sk-rank');
      if(!nameEl || !rankEl) return;
      const name = (nameEl.value || '').trim().toLowerCase();
      if(!name) return;
      const rank = parseInt(rankEl.value || '0', 10) || 0;
      out[name] = Math.max(out[name] || 0, rank);
    });
    return out;
  }

  // ---------- The rules ----------
  // Each is a discrete function of the sheet's current state returning zero or more findings.
  // None reads another rule's output, so they can be run, tested and removed individually --
  // which is what lets the harness assert one rule at a time against a character built to
  // trip exactly that rule.

  // A character can never hold ranks in both a Bushi and a Shugenja School. The sheet already
  // enforces this on the Add School path; this catches a character that got here another way.
  function ruleCasterLockConflict(){
    const cats = {};
    validatorSchoolEntries().forEach(function(s){
      const cat = schoolCasterCategory(s.lib);
      if(cat){ (cats[cat] = cats[cat] || []).push(s.name); }
    });
    if(cats.bushi && cats.shugenja){
      return [validationFinding(
        'caster-lock-conflict', 'error',
        'Both a Bushi and a Shugenja School',
        'A character can never hold ranks in both. Bushi: ' + cats.bushi.join(', ') +
        '. Shugenja: ' + cats.shugenja.join(', ') + '.'
      )];
    }
    return [];
  }

  // A Bushi may not work an ordinary spell. Maho is the one exception the sheet already
  // models -- a Maho Spell Scroll is a self-contained corrupt ritual needing no Shugenja
  // training -- so a Maho entry is never flagged here, matching the spell picker's own filter.
  function ruleBushiSpellViolation(){
    const cats = {};
    validatorSchoolEntries().forEach(function(s){
      const cat = schoolCasterCategory(s.lib);
      if(cat) cats[cat] = true;
    });
    if(!cats.bushi || cats.shugenja) return [];
    const offenders = [];
    document.querySelectorAll('#techList .entry').forEach(function(div){
      if(div.dataset.spellMastery === undefined || div.dataset.spellMastery === '') return;
      if(div.dataset.spellIsMaho === 'true') return;
      const nameEl = div.querySelector('.en-name');
      offenders.push((nameEl && nameEl.value.trim()) || '(unnamed spell)');
    });
    if(!offenders.length) return [];
    return [validationFinding(
      'bushi-spell', 'error',
      offenders.length + ' spell' + (offenders.length === 1 ? '' : 's') + ' on a Bushi character',
      'Only Maho, which needs no Shugenja training, is exempt. Remove or re-check: ' +
      offenders.join(', ') + '.'
    )];
  }

  // Every concrete Skill a School teaches should sit at Rank 1 or better. This is also the
  // sheet's own technique-unlock gate for a second School (Rule 4A, hasSchoolSkillOverlap),
  // so a finding here is the reason those Techniques are locked -- previously visible only as
  // Techniques silently not appearing.
  function ruleMissingSchoolSkills(){
    const owned = validatorSkillRanks();
    const out = [];
    validatorSchoolEntries().forEach(function(s){
      if(!s.lib) return;
      const missing = validatorConcreteSkills(s.lib).filter(function(name){
        return (owned[name.toLowerCase()] || 0) < 1;
      });
      if(missing.length){
        out.push(validationFinding(
          'school-skills-missing', 'warning',
          s.name + ': ' + missing.length + ' School Skill' + (missing.length === 1 ? '' : 's') + ' at Rank 0',
          'This School teaches ' + missing.join(', ') + '. A second School’s Techniques ' +
          'stay locked until every one of its School Skills is at Rank 1 or better.'
        ));
      }
    });
    return out;
  }

  // "Any one X Skill" slots are a player choice Apply School cannot make for them, so it skips
  // them. Nothing afterwards says they are outstanding. This cannot tell a filled slot from an
  // unfilled one -- a free choice leaves no trace of which row it became -- so it reports the
  // entitlement rather than claiming a violation, which is why it is 'info' and not 'warning'.
  function ruleSchoolChoiceSlots(){
    const out = [];
    validatorSchoolEntries().forEach(function(s){
      if(!s.lib) return;
      const slots = validatorChoiceSlots(s.lib);
      if(slots.length){
        out.push(validationFinding(
          'school-choice-slots', 'info',
          s.name + ': ' + slots.length + ' free Skill choice' + (slots.length === 1 ? '' : 's'),
          'Applying this School could not pick these for you — ' + slots.join('; ') +
          '. Check each has been chosen and ticked as a School Skill.'
        ));
      }
    });
    return out;
  }

  // Spent against awarded, read from the fields recalcAll() has already written. The arithmetic
  // is entirely the sheet's -- this rule only compares two numbers it did not compute.
  function ruleXpOverspend(){
    const spent = parseFloat(document.getElementById('f_xpSpent').value || '0');
    const total = parseFloat(document.getElementById('f_xpTotal').value || '0');
    if(spent > total){
      return [validationFinding(
        'xp-overspend', 'error',
        'Overspent by ' + (Math.round((spent - total) * 100) / 100) + ' XP',
        'Spent ' + spent + ' of ' + total + ' awarded. Use the Manual Adjustment field for ' +
        'anything the calculator cannot model, or reduce a purchase.'
      )];
    }
    return [];
  }

  function ruleXpUnspent(){
    const spent = parseFloat(document.getElementById('f_xpSpent').value || '0');
    const total = parseFloat(document.getElementById('f_xpTotal').value || '0');
    const left = Math.round((total - spent) * 100) / 100;
    if(left > 0){
      return [validationFinding(
        'xp-unspent', 'info',
        left + ' XP unspent',
        'Not a problem — noted in case the character was meant to be finished.'
      )];
    }
    return [];
  }

  // The range each Trait input itself declares (min/max attributes), read off the element
  // rather than hardcoded here, so this rule cannot disagree with the control it describes.
  // Void is included: it is a free input, unlike the four elemental Rings, which recalcAll()
  // derives from their Traits on every pass and so can never be out of range independently.
  function ruleTraitRange(){
    const out = [];
    const checkOne = function(el, label){
      if(!el) return;
      const min = parseInt(el.min || '1', 10);
      const max = parseInt(el.max || '10', 10);
      const val = parseInt(el.value || '0', 10);
      if(isNaN(val) || val < min || val > max){
        out.push(validationFinding(
          'trait-range', 'error',
          label + ' is ' + (el.value || '(blank)') + ', outside ' + min + '–' + max,
          'The sheet cannot compute reliably from a value its own control does not allow.'
        ));
      }
    };
    RINGS.forEach(function(r){
      r.traits.forEach(function(t){
        checkOne(document.getElementById('trait_' + t.key), t.name);
      });
    });
    checkOne(document.getElementById('ring_void'), 'Void Ring');
    return out;
  }

  // data-free is the floor Apply Family / Apply School granted for nothing: the character is
  // entitled to at least that much and paid no XP for it. Sitting below it means the grant was
  // reverted or overwritten after it was applied -- most often by a JSON import of a save made
  // before the School was applied, or by an Apply School that was later undone by hand.
  function ruleTraitBelowFreeFloor(){
    const out = [];
    const checkOne = function(el, label){
      if(!el) return;
      const free = parseInt(el.dataset.free || '2', 10);
      const val = parseInt(el.value || '0', 10);
      if(!isNaN(val) && !isNaN(free) && val < free){
        out.push(validationFinding(
          'trait-below-free-floor', 'warning',
          label + ' is ' + val + ', below its free floor of ' + free,
          'Family or School granted ' + free + ' at no XP cost. Raising it back to ' + free +
          ' costs nothing.'
        ));
      }
    };
    RINGS.forEach(function(r){
      r.traits.forEach(function(t){
        checkOne(document.getElementById('trait_' + t.key), t.name);
      });
    });
    checkOne(document.getElementById('ring_void'), 'Void Ring');
    return out;
  }

  // Rule 3 of the Multiple Schools system: the combined School Rank across every School a
  // character holds can never exceed their Insight Rank. computeCappedActiveRank() already
  // clamps the active School to enforce it, so this is a TRIPWIRE -- it should never fire
  // against a sheet that has recalculated since its last edit. It exists because the clamp is
  // the only thing holding the invariant, and a silent clamp and a silent violation look
  // identical from outside.
  function ruleSchoolRankOverInsight(){
    const schools = validatorSchoolEntries();
    if(!schools.length) return [];
    const insightPts = parseInt(document.getElementById('f_insightPts').value || '0', 10) || 0;
    const insightRank = calculateSchoolRank(insightPts).rank;
    let total = 0;
    schools.forEach(function(s, i){
      if(s.entry.frozen) total += (s.entry.frozenRank || 0);
      else if(i === schools.length - 1) total += parseInt(document.getElementById('f_rank').value || '0', 10) || 0;
    });
    if(total > insightRank){
      return [validationFinding(
        'school-rank-over-insight', 'error',
        'Combined School Rank ' + total + ' exceeds Insight Rank ' + insightRank,
        'The sheet normally clamps the active School to prevent this. Seeing it means the ' +
        'clamp has been bypassed — worth reporting.'
      )];
    }
    return [];
  }

  // The registry. Order here is the order findings appear within a severity band, so the
  // cheapest things to act on sit near the top.
  const CHARACTER_VALIDATOR_RULES = [
    { id: 'caster-lock-conflict',    fn: ruleCasterLockConflict },
    { id: 'bushi-spell',             fn: ruleBushiSpellViolation },
    { id: 'trait-range',             fn: ruleTraitRange },
    { id: 'school-rank-over-insight',fn: ruleSchoolRankOverInsight },
    { id: 'xp-overspend',            fn: ruleXpOverspend },
    { id: 'school-skills-missing',   fn: ruleMissingSchoolSkills },
    { id: 'trait-below-free-floor',  fn: ruleTraitBelowFreeFloor },
    { id: 'school-choice-slots',     fn: ruleSchoolChoiceSlots },
    { id: 'xp-unspent',              fn: ruleXpUnspent },
  ];

  // Runs every rule and returns one report. A rule that throws is contained rather than
  // allowed to take the report down with it: this runs inside recalcAll(), and a validator
  // that can break the sheet it validates is a worse bug than anything it could find.
  function validateCharacter(){
    if(!CHARACTER_VALIDATOR_ENABLED) return { findings: [], counts: { error: 0, warning: 0, info: 0 } };
    const findings = [];
    CHARACTER_VALIDATOR_RULES.forEach(function(rule){
      try {
        const got = rule.fn();
        if(Array.isArray(got)) got.forEach(function(f){ findings.push(f); });
      } catch(err){
        findings.push(validationFinding(
          'rule-threw', 'info',
          'Check "' + rule.id + '" could not run',
          String((err && err.message) || err)
        ));
      }
    });
    findings.sort(function(a, b){
      return VALIDATION_SEVERITY_ORDER[a.severity] - VALIDATION_SEVERITY_ORDER[b.severity];
    });
    const counts = { error: 0, warning: 0, info: 0 };
    findings.forEach(function(f){ if(counts[f.severity] !== undefined) counts[f.severity]++; });
    return { findings: findings, counts: counts };
  }

  // ---------- ValidationReport UI ----------
  // Renders into #validationReport, which sits under the XP breakdown on the Identity tab --
  // next to the numbers most findings are about. Escaped through the sheet's own escHtml(),
  // because a finding carries player-entered text (a Skill name, a spell name).
  const VALIDATION_BADGES = {
    error:   { icon: '✖', label: 'Error' },
    warning: { icon: '⚠', label: 'Check' },
    info:    { icon: 'ℹ', label: 'Note' },
  };

  function renderValidationReport(){
    const host = document.getElementById('validationReport');
    if(!host) return;
    if(!CHARACTER_VALIDATOR_ENABLED){ host.innerHTML = ''; host.style.display = 'none'; return; }
    const report = validateCharacter();
    host.style.display = '';
    if(!report.findings.length){
      host.innerHTML = '<div class="vr-head vr-clean">' +
        '<span class="vr-badge vr-badge-clean">✓</span>' +
        '<span>No issues found against the rules this sheet models.</span></div>';
      return;
    }
    const bits = [];
    const summary = [];
    if(report.counts.error)   summary.push(report.counts.error + ' error' + (report.counts.error === 1 ? '' : 's'));
    if(report.counts.warning) summary.push(report.counts.warning + ' to check');
    if(report.counts.info)    summary.push(report.counts.info + ' note' + (report.counts.info === 1 ? '' : 's'));
    bits.push('<div class="vr-head"><span>Character check — ' + escHtml(summary.join(', ')) + '</span></div>');
    report.findings.forEach(function(f){
      const badge = VALIDATION_BADGES[f.severity] || VALIDATION_BADGES.info;
      bits.push(
        '<div class="vr-row vr-' + f.severity + '" data-rule="' + escAttr(f.id) + '">' +
          '<span class="vr-badge vr-badge-' + f.severity + '" title="' + escAttr(badge.label) + '">' + badge.icon + '</span>' +
          '<span class="vr-text"><strong>' + escHtml(f.title) + '</strong>' +
          (f.detail ? '<span class="vr-detail">' + escHtml(f.detail) + '</span>' : '') +
          '</span>' +
        '</div>'
      );
    });
    host.innerHTML = bits.join('');
  }
