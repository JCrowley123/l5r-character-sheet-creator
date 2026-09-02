import io, os, hashlib

BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 Feature 1 Range & Range Penalties",
                   "l5r-character-sheet part C feature 1 range.html")
OUTDIR = os.path.join(BASE, "BUGFIX \u2014 School Skill Free Rank on Reload")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 1 + schoolfree fix.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

src = read(SRC); edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. New reconstruction helpers, immediately before makeSkillRow ----
ANCHOR = "  function makeSkillRow(data){\n"
NEW = """  // ---- BUGFIX: reconstruct a School skill's FREE RANK for legacy saves -------------------
  // THE BUG. collectData() records `freeFloor` -- how much of a skill's Rank the School gave for
  // free -- but that field did not always exist. A save written before it was added records only
  // {rank, school:true}, and makeSkillRow's old fallback assumed the ENTIRE current Rank was
  // School-granted:
  //
  //     data.school ? Math.max(1, data.rank || 1) : 0
  //
  // So a School that granted Defense at Rank 2, bought up to Rank 3 with XP, reloaded as "all
  // three Ranks free": its cost silently became 0 xp and the character's XP total dropped.
  //
  // THE FIX. Do not guess from the current Rank. Reconstruct the free Rank from the School that
  // actually granted the skill, parsing the School's own skills string with the SAME rule Apply
  // School uses ("Defense 2" -> 2, "Kenjutsu (Katana)" -> 1, a bare name -> 1), and take the
  // highest grant across every School the character has. Falls back to 1 -- the standard "first
  // Rank free" School rule -- when the skill is not a named School skill (it filled an "any one
  // Skill" slot) or no School can be resolved. Never exceeds the skill's current Rank.
  //
  // This runs ONLY when `freeFloor` is absent. A save written by any build that records it keeps
  // its explicit value untouched, so nothing about current saves changes.
  function schoolGrantedRankForSkill(schoolName, skillName){
    if(!schoolName || !skillName) return 0;
    const entry = findAnySchoolLibraryEntry(String(schoolName).trim());
    if(!entry || !entry.skills) return 0;
    const target = String(skillName).trim().toLowerCase();
    let best = 0;
    entry.skills.split(',').forEach(raw=>{
      let token = raw.trim();
      if(!token || /^any /i.test(token)) return;          // "any one Skill" is a player choice
      let rank = 1;
      const rankMatch = token.match(/(\\d+)\\s*$/);
      if(rankMatch){ rank = parseInt(rankMatch[1],10); token = token.replace(/\\s*\\d+\\s*$/,'').trim(); }
      const emphMatch = token.match(/^(.*?)\\s*\\(([^)]+)\\)$/);
      const name = emphMatch ? emphMatch[1].trim() : token;
      if(name.toLowerCase() === target && rank > best) best = rank;
    });
    return best;
  }
  function inferSchoolFreeFloor(skillName, currentRank){
    const rank = Math.max(0, parseInt(currentRank,10) || 0);
    let best = 0;
    const seen = {};
    const consider = n => {
      const name = String(n||'').trim();
      if(!name || seen[name.toLowerCase()]) return;
      seen[name.toLowerCase()] = true;
      const granted = schoolGrantedRankForSkill(name, skillName);
      if(granted > best) best = granted;
    };
    // Every School the character has taken (Multiple Schools included), then the active one.
    try { (getSchoolsList()||[]).forEach(e=>consider(e && e.name)); } catch(e){ /* no list yet */ }
    const cur = document.getElementById('f_school');
    if(cur) consider(cur.value);
    const applied = document.getElementById('f_schoolApplied');
    if(applied) consider(applied.value);   // garbage resolves to null in findAnySchoolLibraryEntry
    if(best <= 0) best = 1;                // standard "first Rank free"
    return Math.min(best, rank);
  }
"""
src = once(src, ANCHOR, NEW + ANCHOR, "helpers")

# ---- 2. makeSkillRow: replace the guess-the-whole-rank fallback ----
OLD_ATTR = 'data-free="${data.freeFloor !== undefined ? data.freeFloor : (data.school ? Math.max(1, data.rank||1) : 0)}"'
NEW_ATTR = 'data-free="${data.freeFloor !== undefined ? data.freeFloor : (data.school ? inferSchoolFreeFloor(data.name, data.rank) : 0)}"'
src = once(src, OLD_ATTR, NEW_ATTR, "makeSkillRow-fallback")

# ---- 3. seam exports for the harness ----
SEAM = "    // ---- PART C FEATURE 1: range & range penalties ----"
src = once(src, SEAM,
           "    // ---- BUGFIX: school free-rank reconstruction ----\n"
           "    schoolGrantedRankForSkill, inferSchoolFreeFloor, skillCost, skillCumulative,\n"
           + SEAM, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
print(os.path.basename(OUT))
