"""Which older removers would refuse while a given unit is present: each remove-phase.py whose SURFACE_RE finds
a name in the files given. Run from Versions/: python -B <this> <file> [<file> ...]. Read-only."""
import os,re,ast,sys
P='Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/'
targets=sys.argv[1:]
texts={t:open(t,encoding='utf-8').read() for t in targets}
out=[]
for d,_,fs in os.walk('.'):
    for f in fs:
        if f not in('remove-phase.py','remove_phase.py'): continue
        p=os.path.join(d,f); src=open(p,encoding='utf-8',errors='replace').read()
        try: tree=ast.parse(src)
        except Exception as e: out.append((p,'PARSE '+str(e))); continue
        env={'re':re}
        # evaluate simple constant assignments first (some SURFACE_RE are built from tuples of names)
        for node in tree.body:
            if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name):
                try: env[node.targets[0].id]=eval(compile(ast.Expression(node.value),p,'eval'),env)
                except Exception: pass
        rx=env.get('SURFACE_RE')
        if rx is None: continue
        for t,txt in texts.items():
            hits=sorted(set(m.group(0) for m in rx.finditer(txt)))
            if hits: out.append((p,os.path.basename(t),hits[:12]))
for o in out: print(o)
