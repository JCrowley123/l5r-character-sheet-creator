import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 P1 P2 PREREQUISITES",
                   "l5r-character-sheet part C P1-P2 prerequisites.html")
OUTDIR = os.path.join(BASE, "PART C \u2014 Feature 1 Range & Range Penalties")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 1 range.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

src = read(SRC); js = read(os.path.join(SCRATCH,'f1_js.txt'))
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. CSS ----
CSS_ANCHOR = "  /* ---------- PART C P1/P2: round tracker + roll modifier breakdown ---------- */\n"
CSS_NEW = """  /* ---------- PART C FEATURE 1: range prompt ---------- */
  #rangePickBody{display:flex;flex-direction:column;gap:8px;}
  .range-opt{
    display:flex;flex-direction:column;gap:2px;text-align:left;
    padding:10px 12px;border:1px solid var(--line);border-radius:6px;
    background:#fffdf8;cursor:pointer;font-family:'EB Garamond',serif;
  }
  .range-opt:hover{border-color:var(--gold);background:rgba(169,132,63,.08);}
  .range-opt-title{font-size:.95rem;color:var(--ink);}
  .range-opt-note{
    font-family:'Noto Sans JP',sans-serif;font-size:.66rem;color:var(--ink-soft);
    letter-spacing:.02em;
  }
  .range-stage2{display:flex;flex-direction:column;gap:8px;}
  .range-stage2 label{
    font-family:'Noto Sans JP',sans-serif;font-size:.66rem;letter-spacing:.05em;
    text-transform:uppercase;color:var(--ink-soft);
  }
  .range-stage2 input{
    padding:7px 8px;font-size:1rem;font-family:'EB Garamond',serif;
    border:1px solid var(--line);border-radius:5px;background:#fffdf8;color:var(--ink);
  }
  .range-stage2-note{
    font-family:'Noto Sans JP',sans-serif;font-size:.68rem;line-height:1.4;
    color:var(--shu-dark);min-height:1.2em;
  }
  .range-stage2-btns{display:flex;gap:8px;justify-content:flex-end;}

"""
src = once(src, CSS_ANCHOR, CSS_NEW + CSS_ANCHOR, "css")

# ---- 2. Modal markup, placed beside the roll modal ----
HTML_ANCHOR = '  <div class="roll-modal-overlay" id="rollModalOverlay" style="display:none;">'
HTML_NEW = ('  <!-- PART C FEATURE 1: attack-time range prompt (ranged weapons only). -->\n'
            '  <div class="roll-modal-overlay" id="rangePickModalOverlay" style="display:none;">\n'
            '    <div class="roll-modal">\n'
            '      <div class="roll-modal-head">\n'
            '        <div>\n'
            '          <h3>Range to target</h3>\n'
            '          <div class="notation" id="rangePickSubtitle"></div>\n'
            '        </div>\n'
            '        <button type="button" class="rm-btn" id="rangePickClose" title="Cancel">\u2715</button>\n'
            '      </div>\n'
            '      <div id="rangePickBody"></div>\n'
            '    </div>\n'
            '  </div>\n\n' + HTML_ANCHOR)
src = once(src, HTML_ANCHOR, HTML_NEW, "modal-markup")

# ---- 3. JS block, before Feature 0 ----
JS_ANCHOR = "  // ================= PART C FEATURE 0: EMPHASIS RE-ROLL =================\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 4. rollWeaponAttack: async + range gate ----
OLD = """  function rollWeaponAttack(weaponRowOrKey){
    const ctx = resolveWeaponContext(weaponRowOrKey);
    // Unlinked or manually-overridden rows keep the original free-text XkY behaviour verbatim.
    if(!ctx.entry || ctx.manualAttack){
      const notation = ctx.row ? ctx.row.querySelector('.wp-roll').value : '';
      rollNotation(ctx.label+' \u2014 Attack', notation);
      return;
    }
    if(!ctx.skillName){ setStatus('This weapon has no linked Weapon Skill to roll.'); return; }
    const atk = getWeaponAttackDice(ctx.skillName);
    if(atk.numDice <= 0){ setStatus(`Set your ${atk.traitName||'Trait'} before rolling ${ctx.label}.`); return; }
    const title = `${ctx.label} \u2014 Attack (${ctx.skillName}${atk.unskilled ? ', Unskilled' : ` ${atk.skillRank}`})`;
    // PART C P2 \u2014 routed through the pre-roll modifier pipeline (no-op while empty).
    const rolled = rollWithModifiers(title,
      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled }),
      atk.numDice, atk.keepDice);"""
NEW = """  // PART C FEATURE 1 made this async so a ranged attack can await the range prompt. Everything
  // before the first `await` still runs synchronously, and a MELEE weapon never reaches an await
  // at all \u2014 so melee attacks open the roll modal in the same tick as the click, exactly as
  // before, and every pre-Feature-1 test that clicks a melee attack button is unaffected.
  async function rollWeaponAttack(weaponRowOrKey){
    const ctx = resolveWeaponContext(weaponRowOrKey);
    // Unlinked or manually-overridden rows keep the original free-text XkY behaviour verbatim.
    if(!ctx.entry || ctx.manualAttack){
      const notation = ctx.row ? ctx.row.querySelector('.wp-roll').value : '';
      rollNotation(ctx.label+' \u2014 Attack', notation);
      return;
    }
    if(!ctx.skillName){ setStatus('This weapon has no linked Weapon Skill to roll.'); return; }
    const atk = getWeaponAttackDice(ctx.skillName);
    if(atk.numDice <= 0){ setStatus(`Set your ${atk.traitName||'Trait'} before rolling ${ctx.label}.`); return; }
    const title = `${ctx.label} \u2014 Attack (${ctx.skillName}${atk.unskilled ? ', Unskilled' : ` ${atk.skillRank}`})`;
    // PART C FEATURE 1 \u2014 ranged weapons ask for the range first. Backing out of the prompt, or
    // an impossible shot, cancels the attack outright: no roll, no modal, no modifier, no state.
    let rangeDecision = null;
    if(isRangedWeapon(ctx.entry)){
      rangeDecision = await promptWeaponRange(ctx.entry);
      if(!rangeDecision){ setStatus('Attack cancelled.'); return; }
      const check = validateRangeAttack(atk.numDice, atk.keepDice, rangeDecision);
      if(!check.legal){
        await appAlert(check.message);
        setStatus('Attack cancelled \u2014 target out of range.');
        return;
      }
    }
    // PART C P2 \u2014 routed through the pre-roll modifier pipeline. The range decision travels in
    // the context, so the registered contributor stays pure and nothing leaks between rolls.
    const rolled = rollWithModifiers(title,
      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision }),
      atk.numDice, atk.keepDice);"""
src = once(src, OLD, NEW, "rollWeaponAttack")

# ---- 5. seam ----
SEAM_OLD = "    // ---- PART C P1: combat round context ----"
SEAM_NEW = ("    // ---- PART C FEATURE 1: range & range penalties ----\n"
            "    RANGED_WEAPON_SKILLS, RANGE_RULES, isRangedWeapon, weaponListedRange,\n"
            "    calculateRangePenalty, validateRangeAttack, getRangeModifiers, promptWeaponRange,\n"
            "    // ---- PART C P1: combat round context ----")
src = once(src, SEAM_OLD, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
