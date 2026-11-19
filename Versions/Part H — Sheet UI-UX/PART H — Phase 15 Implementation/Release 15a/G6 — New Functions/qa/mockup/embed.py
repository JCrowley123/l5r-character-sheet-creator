"""Board builder: replace each {{name}} in the template with the picture <shots>/<name>.png as a data URI.
   python embed.py <template.html> <shots folder> <out.html> [--webp QUALITY] [--max-width PIXELS[:NAME-PART]]
With --webp the PNG is re-encoded as WebP at that quality (Pillow) to keep the board small; the PNGs stay the evidence.
With --max-width (and --webp) a wider picture is scaled down to that width first; with :NAME-PART only pictures whose
name contains it (G6: 640:phone, the phone's 780-pixel captures).
Every placeholder must have its picture, or nothing is written."""
import base64, io, pathlib, re, sys

args = sys.argv[1:]
quality = None
max_width = None
if '--max-width' in args:
    i = args.index('--max-width'); spec = args[i + 1].split(':', 1); del args[i:i + 2]
    max_width = int(spec[0]); width_only = spec[1] if len(spec) > 1 else ''
if '--webp' in args:
    i = args.index('--webp'); quality = int(args[i + 1]); del args[i:i + 2]
template, shots, out = (pathlib.Path(a) for a in args[:3])
text = template.read_text(encoding='utf-8')
names = sorted(set(re.findall(r'\{\{([a-z0-9-]+)\}\}', text)))
missing = [n for n in names if not (shots / (n + '.png')).is_file()]
if missing:
    sys.exit('missing pictures: ' + ', '.join(missing))
for n in names:
    raw = (shots / (n + '.png')).read_bytes()
    if quality is None:
        uri = 'data:image/png;base64,' + base64.b64encode(raw).decode('ascii')
    else:
        from PIL import Image
        buf = io.BytesIO()
        img = Image.open(io.BytesIO(raw)).convert('RGB')
        if max_width and width_only in n and img.width > max_width:
            img = img.resize((max_width, round(img.height * max_width / img.width)), Image.LANCZOS)
        img.save(buf, 'WEBP', quality=quality, method=6)
        uri = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    text = text.replace('{{' + n + '}}', uri)
out.write_text(text, encoding='utf-8', newline='\n')
print(f'{len(names)} pictures embedded; {out} {out.stat().st_size:,} bytes')
