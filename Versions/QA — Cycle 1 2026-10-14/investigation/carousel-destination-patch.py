# Builds patched copies of a sheet build with the proposed carousel fix (scratch only).
# usage: python make_patched.py <in.html> <out.html>
import sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()

REPL = [
    # state
    ("""  var userMoved    = false; // has anyone actually navigated yet?
""",
     """  var userMoved    = false; // has anyone actually navigated yet?
  var navTarget    = null;  // real index a programmatic move is still travelling to
  var navRetried   = false; // one re-issue allowed if something else ends that move early
"""),
    # goToIndex: remember the destination until the track rests on it
    ("""    if(!ready()){ pendingIndex = i; return; }   // settle it when width arrives
""",
     """    if(!ready()){ navTarget = null; pendingIndex = i; return; }   // settle it when width arrives
"""),
    ("""    if(currentSlot() === i + offset){ setTimeout(resolveSettled, 0); return; }
    if(smooth) glideToSlot(i + offset); else jumpToSlot(i + offset);
""",
     """    if(currentSlot() === i + offset){ navTarget = null; setTimeout(resolveSettled, 0); return; }
    navTarget = i; navRetried = false;
    if(smooth) glideToSlot(i + offset); else jumpToSlot(i + offset);
"""),
    # step(): slot-based moves commit at settle, as before
    ("""    userMoved = true;
    verdict = null;                       // same reasoning as goToIndex
""",
     """    userMoved = true;
    verdict = null;                       // same reasoning as goToIndex
    navTarget = null;
"""),
    # onSettle: a settle that is not at the destination does not end the move
    ("""    if(!count || !ready()) return;
    var slot = currentSlot();
    if(loop && slot <= 0){
""",
     """    if(!count || !ready()) return;
    var slot = currentSlot();
    if(navTarget !== null && slot !== navTarget + offset && !navRetried){
      navRetried = true;
      glideToSlot(navTarget + offset);
      return;
    }
    navTarget = null;
    if(loop && slot <= 0){
"""),
    # onScroll: pages a programmatic glide passes over do not become current
    ("""      scrollRaf = null;
      if(!ready()) return;
      var live = slotToReal(currentSlot());
""",
     """      scrollRaf = null;
      if(!ready() || navTarget !== null) return;
      var live = slotToReal(currentSlot());
"""),
    # a finger on the track takes over from a programmatic move
    ("""  function onTouchStart(e){
    userMoved = true;
""",
     """  function onTouchStart(e){
    userMoved = true;
    navTarget = null;
"""),
]
for old, new in REPL:
    n = s.count(old)
    assert n == 1, (n, old)
    s = s.replace(old, new)
open(out, 'w', encoding='utf-8').write(s)
print('patched', out)
