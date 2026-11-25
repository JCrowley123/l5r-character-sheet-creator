"""B18 re-check: compares the 21 November inventory table with the re-check's table, row by row.
   python -X utf8 -I compare.py <old table.json> <new table.json> [out.json]
A row is matched on where it sits, its class, its id, its kind and how it was read. Prints the rows only in one table and
the rows whose visible words, spoken name or title changed; with out.json, writes the same as JSON."""
import json, sys
old = json.load(open(sys.argv[1], encoding='utf-8'))['rows']
new = json.load(open(sys.argv[2], encoding='utf-8'))['rows']
key = lambda r: (r['where'], r['cls'], r['idAttr'], r['kind'], r['reach'])
O, N = {}, {}
for r in old: O.setdefault(key(r), []).append(r)
for r in new: N.setdefault(key(r), []).append(r)
brief = lambda r: {'id': r['id'], 'group': r['group'], 'label': r['label'], 'spoken': r['spoken'], 'title': r['title'], 'where': r['where'], 'reach': r['reach']}
res = {'old_rows': len(old), 'new_rows': len(new), 'only_old': [], 'only_new': [], 'changed': []}
for k in O:
    if k not in N: res['only_old'] += [brief(r) for r in O[k]]
for k in N:
    if k not in O: res['only_new'] += [brief(r) for r in N[k]]
for k in O:
    if k in N:
        a = sorted((r['label'], r['spoken'], r['title']) for r in O[k]); b = sorted((r['label'], r['spoken'], r['title']) for r in N[k])
        if a != b:
            res['changed'].append({'old_id': O[k][0]['id'], 'new_id': N[k][0]['id'], 'group': O[k][0]['group'], 'where': k[0], 'cls': k[1],
                                   'was': [list(x) for x in a if x not in b], 'now': [list(x) for x in b if x not in a]})
print('rows', res['old_rows'], '->', res['new_rows'])
for t in ('only_old', 'only_new'):
    print('--', t)
    for r in res[t]: print('  ', r['id'], r['group'], '|', r['label'][:50], '|', r['spoken'][:70], '|', r['where'][:40])
print('-- changed')
for c in res['changed']:
    print('  ', c['old_id'], '->', c['new_id'], c['group'], '|', c['where'][:40], '|', c['cls'])
    for x in c['was']: print('      was:', x[0][:50], '|', x[1][:80])
    for x in c['now']: print('      now:', x[0][:50], '|', x[1][:80])
if len(sys.argv) > 3:
    open(sys.argv[3], 'w', encoding='utf-8', newline='\n').write(json.dumps(res, ensure_ascii=False, indent=1) + '\n')
