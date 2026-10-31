"""Render every exported PDF page and make inspection indexes of screenshots."""
from pathlib import Path
import json
import pypdfium2 as pdfium
from pypdf import PdfReader
from PIL import Image, ImageDraw

A = Path(__file__).resolve().parent.parent
summary = {}
for source in (A / 'print').glob('*.pdf'):
    doc = pdfium.PdfDocument(source)
    reader = PdfReader(source)
    pages = []
    for i, page in enumerate(doc):
        name = f'{source.stem}-{i+1:02}.png'
        page.render(scale=1.35).to_pil().save(A / 'screenshots' / name)
        pages.append({'page':i+1, 'image':name, 'text':reader.pages[i].extract_text()})
    summary[source.name] = pages
(A/'qa/pdf-observations.json').write_bytes((json.dumps(summary,ensure_ascii=False,indent=2)+'\n').encode())

out = A / 'qa' / 'contact-sheets'
out.mkdir(exist_ok=True)
groups = {'phone': sorted((A/'screenshots').glob('phone-*.png')),
          'desktop': sorted((A/'screenshots').glob('desktop-*.png')),
          'print': sorted((A/'screenshots').glob('*-dense-??.png'))}
for group, files in groups.items():
    w,h,cols,rows = (260,563,4,3) if group=='phone' else (480,640 if group=='print' else 334,2,3)
    for start in range(0,len(files),cols*rows):
        canvas=Image.new('RGB',(cols*w,rows*(h+38)), '#eeeeee')
        draw=ImageDraw.Draw(canvas)
        for j, file in enumerate(files[start:start+cols*rows]):
            im=Image.open(file).convert('RGB');im.thumbnail((w,h))
            x,y=(j%cols)*w,(j//cols)*(h+38)
            draw.text((x+3,y+3),file.stem[:42],fill='#000000')
            draw.text((x+3,y+17),file.stem[42:],fill='#000000')
            canvas.paste(im,(x,y+38))
        canvas.save(out/f'{group}-{start//(cols*rows)+1:02}.jpg')
print({k:len(v) for k,v in summary.items()})
print({k:len(v) for k,v in groups.items()})
