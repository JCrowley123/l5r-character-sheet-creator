  // ============ PART G PHASE 4: "EXPLAIN THIS ROLL" ============
  // Answers the one question the roll modal never answered: WHERE DID THIS POOL COME FROM?
  //
  // Phase 3 (the Smart Roll Preview) made every MODIFIER visible -- range, stance, wounds, Void
  // and the rest -- because the pipeline already itemised them in adj.applied. What neither
  // moment could show was the BASE pool, because by the time rollWithModifiers() sees it, the
  // base is two bare integers: rollSkill() computed `traitVal + rank` and passed the answer, not
  // the working. A 7k3 spell casting roll was simply 7k3, with nothing anywhere in the sheet
  // saying it was Water Ring 3 plus a School Rank of 4 that a Water Affinity had raised from 3.
  //
  // HOW THIS PHASE GETS THE WORKING, AND WHY IT DOES NOT RECOMPUTE IT. Every caller already had
  // the parts in hand a line or two before it called rollWithModifiers(); they were simply
  // discarded after the addition. So each caller now DECLARES them on the roll context --
  // numbers only, no strings -- and this file shapes those numbers into rows. It never reads the
  // sheet and never recomputes a pool.
  //
  // That is the whole design, and it is deliberate: a second implementation of the base-pool
  // maths could silently disagree with the real one, and a breakdown that disagrees with the
  // roll it describes is worse than no breakdown at all. Phase 3 took the same line for
  // modifiers (it renders the pipeline's own numbers rather than computing its own) and this
  // phase extends it to the base. The rule is uniform: WHAT IS NOT DECLARED IS NOT CLAIMED. A
  // caller that declares nothing gets one honest "Base pool: XkY" row rather than a guess.
  //
  // WHAT THIS COSTS IF THE PHASE IS REMOVED. Nothing. The declared keys are inert data sitting
  // on a context object -- no contributor reads them, no arithmetic depends on them -- exactly
  // like the traitName Phase 3 added to the Unskilled Roll flow for its own one-line summary.
  // Deleting this fragment leaves them unread.
  const ROLL_BREAKDOWN_ENABLED = true;

  // A row is the same shape the modifier rows already use -- { label, txt } -- so both groups
  // render through one code path and cannot drift into two visual languages.
  function breakdownRow(label, txt, note){
    return { label: label, txt: txt + (note ? ' — ' + note : '') };
  }
  // "3k3" for a part that contributes rolled AND kept dice (a Trait, a Ring), "+2k0" for one
  // that contributes rolled dice only (a Skill Rank, a School Rank). Written the way the
  // modifier rows write their own deltas, for the same reason.
  function poolPart(rolled, kept, additive){
    const sign = additive && rolled >= 0 ? '+' : '';
    return sign + rolled + 'k' + kept;
  }
  function intOrNull(v){
    if(v === undefined || v === null || v === '') return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  }

  // The one function this phase exists to provide. PURE: context in, rows out, no DOM, no reads
  // of the sheet. Returns [] when the caller declared nothing this phase can state honestly --
  // callers are added to over time, and an undeclared kind must degrade to silence, never to a
  // plausible-looking guess.
  function buildRollBasePoolRows(context, baseRolled, baseKept){
    if(!ROLL_BREAKDOWN_ENABLED) return [];
    if(!context) return [];
    const rows = [];
    const trait = intOrNull(context.traitValue);
    const ring = intOrNull(context.ringValue);
    const skillRank = intOrNull(context.skillRank);
    const schoolRank = intOrNull(context.schoolRank);
    const insightRank = intOrNull(context.insightRank);

    switch(context.kind){
      // A Ring or Trait roll is XkX off a single number -- there is no second part to add, so
      // saying "rolled and kept" is the whole explanation.
      case ROLL_KINDS.RING:
        if(ring === null) break;
        rows.push(breakdownRow((context.ringName || 'Ring') + ' Ring ' + ring,
          poolPart(ring, ring), 'rolled and kept'));
        break;
      case ROLL_KINDS.TRAIT:
        if(trait === null) break;
        rows.push(breakdownRow((context.traitName || 'Trait') + ' ' + trait,
          poolPart(trait, trait), 'rolled and kept'));
        break;

      // Skill and Attack share a shape: (Trait + Skill Rank) k Trait. The Trait row carries the
      // kept dice because the Trait is what sets the keep -- which is the part players most
      // often have to be told.
      case ROLL_KINDS.SKILL:
      case ROLL_KINDS.ATTACK: {
        if(trait === null) break;
        rows.push(breakdownRow((context.traitName || 'Trait') + ' ' + trait,
          poolPart(trait, trait), 'the Trait sets the dice kept'));
        // Unskilled is not "Skill Rank 0" with nothing to say -- it is a distinct rule (roll and
        // keep the Trait alone, and 10s do not explode), so it gets its own row rather than
        // being silently omitted.
        if(context.unskilled === true || skillRank === 0){
          rows.push(breakdownRow('Unskilled', 'no Skill Rank to add',
            'the Trait rolls and keeps alone'));
        } else if(skillRank !== null && skillRank > 0){
          rows.push(breakdownRow((context.skillName || 'Skill') + ' Rank ' + skillRank,
            poolPart(skillRank, 0, true)));
        }
        break;
      }

      // A Casting Roll is Ring k Ring plus the School Rank in rolled dice only. The School Rank
      // row is where Affinity and Deficiency surface: they do not add a row of their own,
      // because they do not add dice of their own -- they moved the School Rank that the row
      // above already counts. Giving them a separate row would show the same die twice.
      case ROLL_KINDS.SPELL: {
        if(ring === null) break;
        rows.push(breakdownRow((context.element || 'Ring') + ' Ring ' + ring,
          poolPart(ring, ring), 'rolled and kept'));
        if(schoolRank !== null){
          const base = intOrNull(context.schoolRankBase);
          let note = context.schoolRankLabel || '';
          if(base !== null && base !== schoolRank){
            const delta = schoolRank - base;
            note = 'base ' + base + ', ' + (delta > 0 ? '+' : '') + delta + ' ' +
              (context.affinityLabel || (delta > 0 ? 'Affinity' : 'Deficiency')) +
              (note ? ' — ' + note : '');
          }
          rows.push(breakdownRow((context.schoolRankLabel || 'School Rank') + ' ' + schoolRank,
            poolPart(schoolRank, 0, true),
            (base !== null && base !== schoolRank) ? note : ''));
        }
        break;
      }

      case ROLL_KINDS.INITIATIVE: {
        if(trait === null) break;
        rows.push(breakdownRow('Reflexes ' + trait, poolPart(trait, trait),
          'Reflexes sets the dice kept'));
        if(insightRank !== null && insightRank > 0){
          rows.push(breakdownRow('Insight Rank ' + insightRank, poolPart(insightRank, 0, true)));
        }
        break;
      }

      // Typed straight in as XkY: there is no composition to explain, and inventing one would
      // be fiction. Stating where the number came from is the honest answer.
      case ROLL_KINDS.MANUAL:
        if(context.notation){
          rows.push(breakdownRow('Entered by hand', String(context.notation)));
        }
        break;

      default:
        break;
    }

    // A declared kind whose numbers did not add up to the pool the pipeline was actually given
    // means a caller and this file disagree. Say so rather than printing a breakdown that does
    // not reconcile -- a wrong explanation is the one outcome worse than none.
    if(rows.length && typeof baseRolled === 'number' && typeof baseKept === 'number'){
      let r = 0, k = 0;
      if(context.kind === ROLL_KINDS.RING || context.kind === ROLL_KINDS.TRAIT){
        r = k = (context.kind === ROLL_KINDS.RING ? ring : trait);
      } else if(context.kind === ROLL_KINDS.SPELL){
        r = ring + (schoolRank || 0); k = ring;
      } else if(context.kind === ROLL_KINDS.INITIATIVE){
        r = trait + (insightRank || 0); k = trait;
      } else if(context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK){
        const unskilled = (context.unskilled === true || skillRank === 0);
        r = trait + (unskilled ? 0 : (skillRank || 0)); k = trait;
      } else {
        return rows;   // MANUAL and anything else declare no arithmetic to reconcile
      }
      if(r !== baseRolled || k !== baseKept){
        return [breakdownRow('Base pool', baseRolled + 'k' + baseKept,
          'the parts on record do not reconcile, so they are not shown')];
      }
    }
    return rows;
  }
  // ============ END PART G PHASE 4 ============
