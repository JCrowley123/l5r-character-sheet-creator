"""One-shot record update for the audit; preserves CLAUDE bytes and app sources."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import re
Q=Path(__file__).resolve().parent
V=Q.parents[2]
rel='Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit'
link='['+'Phase 15 audit'+'](<'+rel+'/AUDIT.md>)'
html_link='<a href="'+quote(rel+'/AUDIT.html')+'">Phase 15 audit</a>'
status="31 October 2026 (Codex): Phase 15 audit delivered for owner review, no application build. 36 findings and complete parked-item mapping; Q1–Q8 pending. Proposed 15a 20 (15–27), 15b 12 (9–16), in historical Claude planning points; FT-24/FT-28 are explicit functional layers. 8b/8c remain next in order, each with scope approval."
quality="First-pass QA goal not achieved: preflight 345/345 at 4× CPU and discovery 6,673/6,673 passed. Full run 1 passed 6,673 candidate / 6,579 retained, exact restoration. Full run 2 stopped at 6,657 completed checks: Spell Names page-load timeout omitted 16 checks; retained run 2 did not start. No full retry. Scoped font-CDN isolation in that logic harness passed 16/16 and all seven exact negative cases at 4× CPU. No application source changed; final edited harness has targeted evidence, not two full qualifications."
cost="Codex usage: start and pre-full readings unavailable, so whole-step cost is not measurable. Late account readings: 31 October 17:56 UTC, five-hour 77% used / weekly 29%; 23:24 UTC, five-hour 8% / weekly 34%. The 5-weekly-point increase between late readings is not the total audit cost and is not added to Claude's totals. GPT-6 family; exact model/effort setting unavailable; no reset credit used. Remote Control remains unverified after computer-use approval timed out."
next_text="Audit delivered; owner reviews Q1–Q8, then approves step 3a (8b) scope in a fresh session. 8c follows its book reading, then separately approved 15a/15b. Proposed remaining work before FT-16 is 60 planning points (45–82), including the explicit FT-24/FT-28 scope; prior calendar forecasts are not recalculated from unmeasured Codex usage. No next build or merge is authorized by the audit."
marker='<!-- phase15-audit-2026-10-31 -->'
def once(s,a,b):
 assert s.count(a)==1,(a,s.count(a))
 return s.replace(a,b,1)
mdp=V/'BUILD-LEDGER.md'
md=mdp.read_bytes().decode()
assert marker not in md
md=once(md,'## 1. Where things stand\n','## 1. Where things stand\n\n'+marker+'\n**'+status+'** '+link+'.\n\n'+quality+'\n')
md=once(md,'## 2. What is left, the estimate and the build order\n','## 2. What is left, the estimate and the build order\n\n**Audit proposal, 31 October:** '+next_text+' '+link+'.\n')
md=once(md,'| 3 | Phase 15\'s audit, no build | 4 (3–5) |',"| 3 | Phase 15 audit delivered 31 Oct (Codex), no app build; Q1–Q8 pending; full-run failure preserved | Historical estimate 4 (3–5); Codex cost unmeasured |")
md=once(md,'| 5 | Release 15a: layout and controls (R6, FT-41, FT-42, FT-47 to FT-52, the moon row\'s alignment and the rest) | 15 (11–20) |','| 5 | Proposed Release 15a: audit A01–A12, A15–A20, including FT-24/FT-28 as separate functional layers; scope approval pending | 20 (15–27) |')
md=once(md,'| 6 | Release 15b: text, Search and print (the Scorpion Instigator\'s Search text included) | 12 (9–16) |','| 6 | Proposed Release 15b: audit A14 and B01–B14/B16; text, Search and browser print; scope approval pending | 12 (9–16) |')
lines=md.splitlines(keepends=True)
matches=[i for i,l in enumerate(lines) if l.startswith('- **Next:** the Phase 15 audit (step 3)')]
assert len(matches)==1
lines[matches[0]]='- **Next:** '+next_text+'\n'
md=''.join(lines).replace('- **QA:** the latest full suite (30 October, 8a.1)','- **Latest release qualification (historical):** 30 October, 8a.1,')
md=once(md,'### Codex, on its own allowance\n','### Codex, on its own allowance\n\n**Phase 15 audit, 31 October:** '+cost+'\n')
md=once(md,'#### For Phase 15, the UI consistency pass\n','#### For Phase 15, the UI consistency pass\n\n**Audited 31 October:** every item in this list, the FT backlog, R6, later device notes and unnumbered items has a destination in '+link+'. 36 findings; 15a/15b proposals and explicit retain/decline decisions. Q1–Q8 are the single pending owner batch. This supersedes an undifferentiated E assignment; it does not authorize implementation.\n')
md=once(md,'## 6. The update log, newest first\n','## 6. The update log, newest first\n\n### 31 October 2026 (Codex): Phase 15 audit; full-run failure preserved, scoped QA correction\n\n'+status+' '+link+'.\n\n'+quality+'\n\n'+cost+'\n\n'+next_text+'\n')
mdp.write_bytes(md.encode())
hp=V/'BUILD-LEDGER.html';h=hp.read_bytes().decode()
assert marker not in h
def section(h,ident,body):
 pattern=r'(<section\b[^>]*\bid="'+ident+r'"[^>]*>)'
 assert len(re.findall(pattern,h))==1,ident
 return re.sub(pattern,lambda m:m[0]+'\n'+body,h,count=1)
pstatus='<p>'+escape(status)+' '+html_link+'.</p>'
pqa='<p>'+escape(quality)+'</p>'
pcost='<p>'+escape(cost)+'</p>'
pnext='<p>'+escape(next_text)+'</p>'
h=section(h,'now',marker+pstatus+pqa)
h=section(h,'left','<div class="lead"><b>31 October audit proposal</b>'+pnext+'</div>')
h=once(h,'<h3 class="sub">Codex, on its own allowance</h3>','<h3 class="sub">Codex, on its own allowance</h3>'+pcost)
h=section(h,'parked','<p><b>Audited 31 October:</b> every Phase 15 item is mapped in '+html_link+'. 36 findings; Q1–Q8 pending; explicit retain/decline decisions. No implementation approved.</p>')
h=section(h,'history','<details class="log s-sum" id="phase15-audit-2026-10-31"><summary><span class="log-date">31 October 2026 · Codex</span><span class="log-title">Phase 15 audit; full-run failure preserved; targeted QA correction</span></summary><div class="log-body">'+pstatus+pqa+pcost+pnext+'</div></details>')
pattern=r'<li><b>Next:</b> the Phase 15 audit \(step 3\).*?</li>'
assert len(re.findall(pattern,h))==1
h=re.sub(pattern,'<li><b>Next:</b> '+escape(next_text)+'</li>',h,count=1)
h=h.replace('the Phase 15 audit is next, built by ChatGPT (Codex) from its 31 October kickoff while Claude\'s week is spent.','the Phase 15 audit is delivered for owner review, with the failed second full run preserved.')
h=h.replace('the latest full suite (30 October, 8a.1)','the latest release qualification (30 October, 8a.1; historical)')
# The current work-order table and proposal note use the same estimates as Markdown.
h=h.replace("<td>Phase 15's audit, no build</td><td>4 (3–5)</td>","<td>Phase 15 audit delivered 31 Oct; Q1–Q8 pending; full-run failure preserved</td><td>Historical estimate 4 (3–5); Codex cost unmeasured</td>")
# Additional explicit summary prevents older history tables being mistaken for the revised proposal.
h=section(h,'left','<p><b>Proposed scopes:</b> 15a A01–A12/A15–A20, 20 (15–27); 15b A14/B01–B14/B16, 12 (9–16). '+html_link+'. Earlier figures below are the agreed work-order estimates before this audit; revised scopes await Q1–Q8.</p>')
hp.write_bytes(h.encode())
rp=V/'L5R Character Sheet Phased Roadmap reorder.md';r=rp.read_bytes().decode()
assert marker not in r
r=once(r,'## Recommended Build Order\n','## Recommended Build Order\n\n'+marker+'\n**31 October 2026 — Phase 15 audit delivered (Codex), no application build:** '+next_text+' '+link+'. '+quality+' Codex cost unmeasured (missing baseline); late meters recorded in the ledger, separately from Claude.\n')
r=once(r,'**handed to ChatGPT (Codex) on 31 October, from '+chr(96)+'Versions/GPT-SESSION-KICKOFF-PHASE-15-AUDIT-2026-10-31.md'+chr(96)+", while Claude's week is spent (about 99 of 100 used; resets 4 November)**",'**audit delivered by Codex on 31 October; Q1–Q8 pending; no application build; the authoritative proposal and failed-run status are immediately above**')
rp.write_bytes(r.encode())
cp=V/'CLAUDE.md';cb=cp.read_bytes()
assert cb.count(b'\r')==8
pointer="31 October: Codex delivered the Phase 15 audit (36 findings, every parked item mapped, Q1–Q8 pending): Versions/"+rel+"/AUDIT.html and HANDOVER.md. No application build. Proposed 15a 20 (15–27), 15b 12 (9–16). QA first-pass goal missed: run 1 6673/6579 passed, run 2 Spell Names load timeout (16 absent); no full retry. Scoped harness font isolation passes 16/16 and seven pinned negatives at 4x. Usage baseline unavailable; Remote Control unverified. Next: owner scope approval for 8b in a fresh session; no merge authorized.\n"
assert pointer.encode() not in cb
cp.write_bytes(cb+(b'' if cb.endswith(b'\n') else b'\n')+pointer.encode())
assert cp.read_bytes().count(b'\r')==8
print('Updated ledger parts 1–4/6, roadmap work order, one append-only CLAUDE pointer; CR=8.')
