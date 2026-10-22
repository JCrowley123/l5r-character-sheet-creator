"""Writes the splash-design block (src/markup/10-swipe-tab-shell.html) from the owner's three pictures in this folder,
inlined as data: URLs so the splash works offline and from a saved copy. The browser shows one picture by screen shape:
portrait up to 2:3 (phones), wide from 4:3 (laptops, phones turned sideways), square between (foldables, tablets).
The 2:3 and 4:3 bands are where the next picture starts to fill more of the screen. Run it after replacing a picture,
then rebuild.
    python -B art/inline-art.py"""
from pathlib import Path
import base64, sys

ART = Path(__file__).resolve().parent
V = next(d for d in ART.parents if (d / 'BUILD-LEDGER.md').is_file())
MARKUP = V / ('Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/'
              'src/markup/10-swipe-tab-shell.html')
BEGIN = '<!-- PART F PHASE 0.6.2 BEGIN splash-design -->\n'
END = '<!-- END SPLASH062 splash-design -->\n'


def data_url(name):
    return 'data:image/webp;base64,' + base64.b64encode((ART / name).read_bytes()).decode('ascii')


block = (BEGIN +
         '<!-- The splash screen\'s look, replaceable as a whole with css/59.9999893-feat-splash-screen.css. Keep id="l5rSplash".\n'
         '     The owner\'s artwork by screen shape, written by art/inline-art.py in the splash layer\'s folder. -->\n'
         '<div id="l5rSplash" role="status" aria-label="Loading the character sheet">\n'
         '  <picture class="l5r-splash-art">\n'
         '    <source media="(max-aspect-ratio: 2/3)" srcset="' + data_url('splash-portrait.webp') + '">\n'
         '    <source media="(min-aspect-ratio: 4/3)" srcset="' + data_url('splash-wide.webp') + '">\n'
         '    <img src="' + data_url('splash-square.webp') + '" alt="" draggable="false">\n'
         '  </picture>\n'
         '  <p class="l5r-splash-name">L5R Character Creator</p>\n'
         '</div>\n' + END)
text = MARKUP.read_bytes().decode('utf-8')
assert text.count(BEGIN) == 1 and text.count(END) == 1, 'splash-design markers missing or repeated'
a, b = text.index(BEGIN), text.index(END) + len(END)
MARKUP.write_bytes((text[:a] + block + text[b:]).encode('utf-8'))
print(f'splash-design: {len(block.encode()):,} bytes written to {MARKUP.name}')
sys.exit(0)
