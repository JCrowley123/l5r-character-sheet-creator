import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 Feature 2 Stance System",
                   "l5r-character-sheet part C feature 2 stances.html")
OUTDIR = os.path.join(BASE, "PART C \u2014 Feature 3 Wound Penalties")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 3 wounds.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

src = read(SRC); js = read(os.path.join(SCRATCH,'f3_js.txt'))
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. The Feature 3 JS block, immediately before the Feature 2 block ----
JS_ANCHOR = "  // ============ PART C FEATURE 2: STANCE SYSTEM ============\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 2. Route the remaining roll kinds through P2 so wounds can reach them --------------
# Feature 3 applies to attack / skill / spell / trait / ring / initiative / manual rolls. Attack,
# skill and initiative already went through rollWithModifiers; these five call sites did not, and
# a contributor cannot reach a roll that never enters the pipeline. Damage is deliberately NOT
# routed -- Part B's damage path stays exactly as it was.

# Ring roll
OLD = "      showRollResult(`${ringName} Ring Roll`, rollDicePool(rank, rank));"
NEW = ("      // PART C FEATURE 3 - routed through P2 so wound penalties reach Ring rolls.\n"
       "      rollWithModifiers(`${ringName} Ring Roll`,\n"
       "        makeRollContext(ROLL_KINDS.RING, { ringName }), rank, rank);")
src = once(src, OLD, NEW, "ring-roll")

# Trait roll
OLD = "      showRollResult(`${traitName} Trait Roll`, rollDicePool(rank, rank));"
NEW = ("      // PART C FEATURE 3 - routed through P2 so wound penalties reach Trait rolls.\n"
       "      rollWithModifiers(`${traitName} Trait Roll`,\n"
       "        makeRollContext(ROLL_KINDS.TRAIT, { traitName }), rank, rank);")
src = once(src, OLD, NEW, "trait-roll")

# Unskilled skill roll (explode:false must be preserved)
OLD = "    showRollResult(`${skillName} (Unskilled)`, rollDicePool(rank, rank, false));"
NEW = ("    // PART C FEATURE 3 - routed through P2. `explode:false` is passed straight through,\n"
       "    // so an Unskilled roll still does not explode on 10.\n"
       "    rollWithModifiers(`${skillName} (Unskilled)`,\n"
       "      makeRollContext(ROLL_KINDS.SKILL, { skillName, unskilled:true }),\n"
       "      rank, rank, { explode:false });")
src = once(src, OLD, NEW, "unskilled-roll")

# Manual dice tray / free-text weapon notation
OLD = """    const numDice = parseInt(m[1],10), keepDice = parseInt(m[2],10);
    showRollResult(label, rollDicePool(numDice, keepDice));"""
NEW = """    const numDice = parseInt(m[1],10), keepDice = parseInt(m[2],10);
    // PART C FEATURE 3 - routed through P2 so wound penalties reach manual rolls.
    rollWithModifiers(label, makeRollContext(ROLL_KINDS.MANUAL, { notation }), numDice, keepDice);"""
src = once(src, OLD, NEW, "manual-roll")

# Spell Casting Roll (keeps its TN config)
OLD = """    showRollResult(
      `${spellName} — Casting Roll (${elLabel})`,
      rollDicePool(ring + schoolRank, ring),
      { tn, successText:'Spell cast successfully.', failText:'Spell failed to cast.' }
    );"""
NEW = """    // PART C FEATURE 3 - routed through P2 so wound penalties reach Spell Casting Rolls. The
    // TN config is passed through untouched, so the pass/fail readout still works -- and now
    // correctly reflects a wounded caster's reduced total.
    rollWithModifiers(
      `${spellName} — Casting Roll (${elLabel})`,
      makeRollContext(ROLL_KINDS.SPELL, { spellName, element:elLabel, mastery }),
      ring + schoolRank, ring,
      { tnConfig:{ tn, successText:'Spell cast successfully.', failText:'Spell failed to cast.' } }
    );"""
src = once(src, OLD, NEW, "spell-roll")

# Maho Casting Roll. Replaced whole so the extra tnConfig nesting stays brace-balanced --
# patching only the head would leave the options object one `}` short.
OLD = """    showRollResult(
      `${spellName} — Maho Casting Roll (${elLabel})`,
      rollDicePool(ring + rankBonus, ring),
      {
        tn,
        successText: 'Spell cast successfully.',
        failText: 'Spell failed to cast.',
        // Taint is gained only if the roll ultimately reads as a success once the player is
        // done adjusting kept dice and closes the modal — see closeRollModal.
        onClose: (success)=>{
          if(success===true){
            const taintGain = Math.max(1, masteryLevel - 1);
            const taintInput = document.getElementById('f_taint');
            const currentTaint = parseInt(taintInput.value||'0',10) || 0;
            taintInput.value = currentTaint + taintGain;
            setStatus(`${spellName}: cast successfully — gained ${taintGain} Taint.`);
          }
        }
      }
    );"""
NEW = """    // PART C FEATURE 3 - routed through P2 so wound penalties reach Maho Casting Rolls. The
    // TN config and its onClose Taint hook ride along inside tnConfig, unchanged.
    rollWithModifiers(
      `${spellName} — Maho Casting Roll (${elLabel})`,
      makeRollContext(ROLL_KINDS.SPELL, { spellName, element:elLabel, maho:true }),
      ring + rankBonus, ring,
      { tnConfig: {
        tn,
        successText: 'Spell cast successfully.',
        failText: 'Spell failed to cast.',
        // Taint is gained only if the roll ultimately reads as a success once the player is
        // done adjusting kept dice and closes the modal — see closeRollModal.
        onClose: (success)=>{
          if(success===true){
            const taintGain = Math.max(1, masteryLevel - 1);
            const taintInput = document.getElementById('f_taint');
            const currentTaint = parseInt(taintInput.value||'0',10) || 0;
            taintInput.value = currentTaint + taintGain;
            setStatus(`${spellName}: cast successfully — gained ${taintGain} Taint.`);
          }
        }
      } }
    );"""
src = once(src, OLD, NEW, "maho-roll")

# Full Defense declaration IS a Defense / Reflexes Skill Roll, so it takes wound penalties too.
# Replaced whole for the same brace-balance reason as Maho above.
OLD = """    showRollResult('Full Defense — Defense / Reflexes', rollDicePool(numDice, keepDice), {
      onClose: ()=>{
        const el = document.getElementById('rollTotalDisplay');
        const total = el ? (parseInt(el.textContent, 10) || 0) : 0;
        const bonus = Math.ceil(total / 2);      // "half the total, rounding up"
        setFullDefenseBonus(bonus);
        recalcAll();
        renderStanceTiles();
        setStatus('Full Defense: +' + bonus + ' Armor TN until your next Turn.');
      },
    });"""
NEW = """    // PART C FEATURE 3 - the declaration is a Defense / Reflexes SKILL ROLL, so it takes wound
    // penalties like any other. The stored Armor TN bonus is therefore half the PENALISED total,
    // which is the correct reading: a wounded character defends less well.
    rollWithModifiers('Full Defense — Defense / Reflexes',
      makeRollContext(ROLL_KINDS.SKILL, { skillName:'Defense', fullDefenseDeclaration:true }),
      numDice, keepDice, { tnConfig: {
      onClose: ()=>{
        const el = document.getElementById('rollTotalDisplay');
        const total = el ? (parseInt(el.textContent, 10) || 0) : 0;
        const bonus = Math.ceil(total / 2);      // "half the total, rounding up"
        setFullDefenseBonus(bonus);
        recalcAll();
        renderStanceTiles();
        setStatus('Full Defense: +' + bonus + ' Armor TN until your next Turn.');
      },
    } });"""
src = once(src, OLD, NEW, "fulldefense-roll")

# ---- 3. seam ----
SEAM = "    // ---- PART C FEATURE 2: stance system ----"
SEAM_NEW = ("    // ---- PART C FEATURE 3: wound penalties ----\n"
            "    WOUND_PENALTIES, WOUND_LEVELS, getCurrentWoundLevelName, getWoundPenalty,\n"
            "    woundPreRollModifiers, computeWoundThresholds, renderWounds,\n"
            + SEAM)
src = once(src, SEAM, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
