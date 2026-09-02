import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 Feature 7 Dual-Wielding",
                   "l5r-character-sheet part C feature 7 dualwield.html")
# Output goes to whichever folder this script is sitting in, so a copied folder rebuilds itself
# rather than the one it was copied from.
OUTDIR = SCRATCH
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 8 mirumoto.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

# The Feature 8 code block. `f8_js.txt` is the build-time name; the deliverable folder ships the
# identical file as `feature8-code-block.js.txt`, so this script re-runs from either.
def find_block():
    for n in ('f8_js.txt', 'feature8-code-block.js.txt'):
        p = os.path.join(SCRATCH, n)
        if os.path.isfile(p): return p
    raise SystemExit('Feature 8 code block not found beside this script.')

src = read(SRC); js = read(find_block())
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. Feature 8 JS block, immediately before the Feature 7 block ----
JS_ANCHOR = "  // ============ PART C FEATURE 7: DUAL-WIELDING & OFF-HAND PENALTIES ============\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 2. Effect A: the off-hand penalty goes to zero -------------------------------------
# One guard clause at the top, ahead of the Technique and mastery checks, because RAW's "no
# penalties OF ANY KIND" is the broadest waiver on the sheet -- it outranks both. The returned
# shape is exactly what the other two branches return, so every consumer (modifier bar, row
# note, info panel) renders it without knowing Feature 8 exists.
OLD = """  function getOffHandPenalty(entry, skillName, skillRank, size){
    const tech = getDualWieldTechniqueExemption();"""
NEW = """  function getOffHandPenalty(entry, skillName, skillRank, size){
    // PART C FEATURE 8 - Mirumoto's Way of the Dragon waives every dual-wield penalty, so it is
    // checked before the narrower Technique and Skill-mastery waivers below.
    const mirumoto = (typeof getMirumotoPenaltyWaiver === 'function') ? getMirumotoPenaltyWaiver() : null;
    if(mirumoto){
      return { penalty:0, size:size||'', exempt:true, exemptSource:mirumoto.source,
               exemptKind:'school', why:mirumoto.why };
    }
    const tech = getDualWieldTechniqueExemption();"""
src = once(src, OLD, NEW, "offhand-waiver")

# ---- 3. Effect A: the main hand's -5 goes to zero too ------------------------------------
OLD = """  function getMainHandPenalty(){
    const tech = getDualWieldTechniqueExemption();"""
NEW = """  function getMainHandPenalty(){
    // PART C FEATURE 8 - "no penalties of any kind" reaches the main hand as well, which a Skill
    // mastery deliberately does not (RAW scopes those to off-hand penalties).
    const mirumoto = (typeof getMirumotoPenaltyWaiver === 'function') ? getMirumotoPenaltyWaiver() : null;
    if(mirumoto){
      return { penalty:0, exempt:true, exemptSource:mirumoto.source,
               exemptKind:'school', why:mirumoto.why };
    }
    const tech = getDualWieldTechniqueExemption();"""
src = once(src, OLD, NEW, "mainhand-waiver")

# ---- 4. Effect B: School Rank onto Armor TN ---------------------------------------------
# Additive with armour, stance, Void and Feature 7's Insight Rank term, in the one line where
# every Armor TN contributor already meets. The Technique's own parenthetical -- "cumulative with
# the normal bonus for wielding two weapons" -- is the RAW authority for adding rather than
# replacing dualTN.
OLD = """    const dualTN = (typeof getDualWieldArmorTNBonus === 'function') ? getDualWieldArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN + voidTN + dualTN;"""
NEW = """    const dualTN = (typeof getDualWieldArmorTNBonus === 'function') ? getDualWieldArmorTNBonus() : 0;
    // PART C FEATURE 8 - Way of the Dragon adds School Rank on top, explicitly "cumulative with
    // the normal bonus for wielding two weapons". 0 for anyone who is not a dual-wielding
    // Mirumoto, so this term is invisible to every other character.
    const mirumotoTN = (typeof getMirumotoArmorTNBonus === 'function') ? getMirumotoArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value =
      baseTN + armorTN + stanceTN + voidTN + dualTN + mirumotoTN;"""
src = once(src, OLD, NEW, "recalc-tn")

# ---- 5. Row notes -----------------------------------------------------------------------
# Appended to Feature 7's handedness bits rather than built separately, so the ordering and the
# markup classes stay consistent with everything else on the note line.
OLD = """    const tn = getDualWieldArmorTNBonus();
    if(tn) bits.push('<span class="wp-note-hand">Two weapons \u00b7 Armor TN +' + tn +
      ' (Insight Rank)</span>');
    return bits;"""
NEW = """    const tn = getDualWieldArmorTNBonus();
    if(tn) bits.push('<span class="wp-note-hand">Two weapons \u00b7 Armor TN +' + tn +
      ' (Insight Rank)</span>');
    // PART C FEATURE 8 - the Mirumoto waiver and its Armor TN bonus. Returns [] when dormant.
    if(typeof mirumotoNoteBits === 'function') bits.push.apply(bits, mirumotoNoteBits());
    return bits;"""
src = once(src, OLD, NEW, "row-notes")

# ---- 6. Weapon info panel ---------------------------------------------------------------
OLD = """      lines.push(`Wielding two weapons: Armor TN +${getDualWieldArmorTNBonus()} (Insight Rank)`);
    }"""
NEW = """      lines.push(`Wielding two weapons: Armor TN +${getDualWieldArmorTNBonus()} (Insight Rank)`);
    }
    // PART C FEATURE 8 - School Automation. Shown to any Mirumoto Bushi of Rank 1 or better,
    // whether or not the daisho pairing is currently set, so an inactive waiver explains itself.
    if(typeof mirumotoInfoLines === 'function'){
      const mLines = mirumotoInfoLines();
      if(mLines.length) lines.push.apply(lines, mLines);
    }"""
src = once(src, OLD, NEW, "info-modal")

# ---- 7. seam ----
SEAM = "    // ---- PART C FEATURE 7: dual-wielding & off-hand penalties ----"
SEAM_NEW = ("    // ---- PART C FEATURE 8: Mirumoto Bushi Rank 1 ----\n"
            "    MIRUMOTO_SCHOOL, MIRUMOTO_R1_TECHNIQUE,\n"
            "    MIRUMOTO_MAIN_WEAPON, MIRUMOTO_OFF_WEAPON,\n"
            "    isMirumotoSchoolName, getMirumotoRank, mirumotoRowWeapon, mirumotoRowIs,\n"
            "    getMirumotoPair, mirumotoTechniqueName,\n"
            "    getMirumotoPenaltyWaiver, getMirumotoArmorTNBonus,\n"
            "    mirumotoNoteBits, mirumotoInfoLines,\n"
            "    getSchoolsList, saveSchoolsList,\n"
            + SEAM)
src = once(src, SEAM, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
