"""Pinned negative proofs; every browser run is sequential and must execute all 30 checks."""
from pathlib import Path
import json,os,re,subprocess,tempfile,datetime
Q=Path(__file__).resolve().parent
V=Q.parent.parent
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE=os.environ.get('L5R_NODE',r'C:\Program Files\nodejs\node.exe')
original=(P/'l5r-character-sheet.html').read_text(encoding='utf-8')
common=['REF-SWITCH','REF-KATA-LIST-PAGES','REF-KATA-DETAIL-PAGES','REF-KATA-LOOKUP',
 'REF-KIHO-LIST-PAGES','REF-KIHO-DETAIL-PAGES','REF-KIHO-LOOKUP','REF-NORMALISED-LOOKUP',
 'REF-BOOK-SEARCH','REF-PAGE-SEARCH','REF-COPY-ISOLATION','REF-UI-KATA-LIST','REF-UI-KATA-DETAIL',
 'REF-FILTERED-SOURCES','REF-UI-KIHO-DETAIL']
cases=[
 ('disabled','const SEARCH_REFERENCES_ENABLED = true;','const SEARCH_REFERENCES_ENABLED = false;',common),
 ('pdf-page-instead-of-printed','"Striking as Air": "Core Rulebook p.259"','"Striking as Air": "Core Rulebook p.262"',
  ['REF-KATA-LIST-PAGES','REF-KATA-DETAIL-PAGES','REF-KATA-LOOKUP','REF-NORMALISED-LOOKUP','REF-COPY-ISOLATION','REF-UI-KATA-LIST','REF-UI-KATA-DETAIL']),
 ('missing-kiho','"Air Fist": "Core Rulebook p.262"','"Air Fist": ""',
  ['REF-KIHO-LIST-PAGES','REF-KIHO-DETAIL-PAGES','REF-KIHO-LOOKUP']),
 ('wrong-book','"Dharma Technique": "Book of Water p.189"','"Dharma Technique": "Book of Fire p.189"',
  ['REF-KIHO-LIST-PAGES','REF-KIHO-DETAIL-PAGES','REF-KIHO-LOOKUP','REF-FILTERED-SOURCES','REF-UI-KIHO-DETAIL']),
 ('missing-kata-hook',"source: typeof SEARCHREF142 !== 'undefined' ? SEARCHREF142.source('kata', k.name) : '',","source: '',",
  ['REF-KATA-LIST-PAGES','REF-KATA-DETAIL-PAGES','REF-PAGE-SEARCH','REF-COPY-ISOLATION','REF-UI-KATA-LIST','REF-UI-KATA-DETAIL']),
]
report={'checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cases':[]}
out=Q/'negative';out.mkdir(exist_ok=True)
def run(label,body,want):
 with tempfile.TemporaryDirectory(prefix='l5r-ref142-negative-') as folder:
  p=Path(folder)/'index.html';p.write_bytes(body.encode('utf-8'))
  r=subprocess.run([NODE,str(Q/'references-harness.js'),str(p)],capture_output=True,text=True,encoding='utf-8',timeout=240)
  text=r.stdout+r.stderr;(out/(label+'.log')).write_bytes(text.encode('utf-8'))
  failed=re.findall(r'^FAIL (\S+)',text,re.M);counts=re.findall(r'(\d+)/(\d+) checks passed',text)
  got=list(map(int,counts[-1])) if counts else []
  case={'id':label,'expected_failures':want,'actual_failures':failed,'counts':got,'exit':r.returncode}
  report['cases'].append(case)
  (out/'summary.json').write_bytes((json.dumps(report,indent=2)+'\n').encode())
  assert r.returncode==1 and got==[30-len(want),30] and sorted(failed)==sorted(want),case
  print(label+': failed exactly '+str(len(want))+' pinned checks',flush=True)
baseline=subprocess.check_output(['git','show','540c90b:'+P.relative_to(V.parent).as_posix()+'/l5r-character-sheet.html'],cwd=V.parent).decode('utf-8')
# Without the interface, the unknown-lookup check also proves the missing layer.
run('baseline',baseline,common+['REF-NO-GUESSED-PAGES'])
for label,old,new,want in cases:
 assert original.count(old)==1,(label,'mutation is not unique')
 run(label,original.replace(old,new),want)
report['passed']=True
(out/'summary.json').write_bytes((json.dumps(report,indent=2)+'\n').encode())
print('All 6 negative variants matched their pinned failures.')
