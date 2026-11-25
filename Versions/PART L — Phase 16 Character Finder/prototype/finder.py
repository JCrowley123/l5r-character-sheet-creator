"""Character Finder scoring, version 2 (25 November 2026), run against the app's real School list.

    python3 -I finder.py       reachability and a short summary
    python3 -I reliability.py  the full reliability tests, with pass marks

Changes from version 1, all approved by the owner on 25 November 2026:
  - Label points are evened out, so a School rated with many labels gains no more in total than one with few.
  - The four questions where a player states their style directly (approach, fight, court, magic type) count 1.5x.
  - "Keep it simple" pushes Involved Schools down twice as hard (-6, was -3); "A classic samurai" pushes Unusual
    Schools down harder (-6, was -4); "Never break the rules" pushes low-Honor Schools down harder (-3, was -2).
  - Ties go to the School whose MAIN labels match more answers, then to a per-player shuffle. Never alphabetical.
  - Magic "No" (and "a touch of the mystical") no longer removes Shugenja. They are pushed down (-3) and can never
    be a best match, but stay in "Also worth a look" and "See all matches" when the rest of the answers suit them.
  - Fewer than two answers that say something about the character gives a sample of Schools, not a "match".
"""
import json, math, random, re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ratings import R

DATA = json.load(open(os.path.join(HERE, 'schools.json')))

def role_of(s):
    n = s['name']
    if s['shugenja']: return {'Shugenja'}
    m = re.search(r'\[([^\]]+)\]', n)
    tag = m.group(1) if m else ''
    if s['brotherhood'] or tag == 'Monk': return {'Monk'}
    if tag == 'Ninja': return {'Ninja'}
    if tag == 'Artisan/Bushi': return {'Artisan', 'Bushi'}
    if tag == 'Artisan' or n.endswith('Artisan'): return {'Artisan'}
    if tag == 'Courtier' or n.endswith('Courtier'): return {'Courtier'}
    return {'Bushi'}

def honor_band(h):
    if h is None: return 'mid'
    return 'high' if h >= 6 else ('low' if h <= 3.5 else 'mid')

LABEL_WEIGHT_REFERENCE = 6.0   # a School with 2 main labels, 1 "also" label and 1 home keeps its points unchanged
DIRECT_QUESTIONS = ('approach', 'fight', 'court', 'magickind')
DIRECT_WEIGHT = 1.5
NOT_A_BEST_MATCH_PENALTY = -3     # small enough that a strong fit still shows under "Also worth a look"
EARLY_EXIT_AFTER = 8           # "See my results now" appears once 8 questions are answered
SAMPLER_BELOW = 2              # fewer answers than this that describe the character -> a sample, not a match

SCHOOLS = []
for i, s in enumerate(DATA['rows']):
    p, sec, homes, cx, niche, flags = R[s['name']]
    lw = 2 * len(p) + len(sec) + len(homes)
    SCHOOLS.append(dict(i=i, name=s['name'], clan=s['clan'], kind=s['kind'], roles=role_of(s), honor=s['honor'],
        band=honor_band(s['honor']), primary=list(p), secondary=list(sec), homes=list(homes), cx=cx, niche=niche,
        flags=set(flags), source=s['source'] or '', affinity=s['affinity'], deficiency=s['deficiency'],
        choose_affinity=(s['shugenja'] and not s['affinity'] and s['name'] == 'Isawa Shugenja'),
        factor=math.sqrt(LABEL_WEIGHT_REFERENCE / max(lw, 1))))
assert len(SCHOOLS) == 106 and len(R) == len({s['name'] for s in SCHOOLS}) == 105, (len(SCHOOLS), len(R))

NP = ('No preference', {})
Q = {
 'magic': ('Do you want your character to cast spells?', [
    ('Yes: magic is the heart of who they are', {'filter': 'Shugenja'}),
    ('A touch of the mystical, but no spells', {'tags': {'mystic': 2, 'spirits': 1, 'monster-hunter': 1}, 'roles': {'Monk': 2, 'Shugenja': NOT_A_BEST_MATCH_PENALTY}, 'not_best': 'Shugenja'}),
    ('No: they rely on their own skill', {'tags': {'mystic': -1}, 'roles': {'Shugenja': NOT_A_BEST_MATCH_PENALTY}, 'not_best': 'Shugenja'}),
    NP]),
 'complexity': ('How much rules detail do you want to keep track of?', [
    ('Keep it simple: I am still learning the game', {'cx': {1: 3, 2: 0, 3: -6}}),
    ('Some extra options are fine', {'cx': {1: 1, 2: 2, 3: 0}}),
    ('Lots of moving parts: I like mastering a system', {'cx': {1: -1, 2: 1, 3: 3}}),
    NP]),
 'niche': ('How do you feel about unusual characters?', [
    ('A classic samurai most players will recognise', {'niche': {1: 3, 2: 0, 3: -6}}),
    ('Open to something a bit different', {'niche': {1: 1, 2: 2, 3: 0}, 'wildcard': True}),
    ('The stranger the better', {'niche': {1: -1, 2: 1, 3: 3}, 'wildcard': True}),
    ('No preference', {'wildcard': True})]),
 'approach': ('When trouble starts, what does your character reach for first?', [
    ('A sword or another weapon', {'roles': {'Bushi': 4}}),
    ('Words: persuasion, wit or a well-placed secret', {'roles': {'Courtier': 4}}),
    ('Inner discipline and their own two hands', {'roles': {'Monk': 4}, 'tags': {'unarmed': 1}}),
    ('The shadows: they would rather not be seen', {'roles': {'Ninja': 4}, 'tags': {'stealth': 2}}),
    ('Their craft or their art', {'roles': {'Artisan': 4}, 'tags': {'artist': 1, 'craft': 1}}),
    NP]),
 'fight': ('In a fight, where do you want to be?', [
    ('In the front line, taking hits and hitting back harder', {'tags': {'frontline': 3}}),
    ('Facing one opponent: a single perfect strike', {'tags': {'duelist': 3}}),
    ('At a distance, with a bow', {'tags': {'archer': 3}}),
    ('On horseback', {'tags': {'cavalry': 3}}),
    ('Fists, feet and grappling', {'tags': {'unarmed': 3}}),
    ('Fast and mobile: strike and get away', {'tags': {'skirmisher': 3, 'stealth': 1}}),
    ('Guarding someone who matters', {'tags': {'bodyguard': 3}}),
    ('Directing the battle', {'tags': {'commander': 3}}),
    ('All-out attack: no holding back', {'tags': {'all-out': 3}}),
    NP]),
 'court': ('Away from a fight, how do they get their way?', [
    ('Charm, courtesy and making friends', {'tags': {'diplomat': 3}}),
    ('Secrets, leverage and a little fear', {'tags': {'schemer': 3}}),
    ('Evidence: they find out the truth', {'tags': {'investigator': 3}}),
    ('Stories, art and performance', {'tags': {'artist': 3}}),
    ('Knowledge: they have read everything', {'tags': {'scholar': 3}}),
    ('Trade: everyone has a price', {'tags': {'merchant': 3}}),
    ('Making things that last', {'tags': {'craft': 3}}),
    NP]),
 'magickind': ('What should their magic be best at?', [
    ('Destroying enemies', {'tags': {'battle-magic': 3}}),
    ('Healing and protecting', {'tags': {'healer': 3, 'protector-magic': 3}}),
    ('Speaking with spirits, ancestors and the dead', {'tags': {'spirits': 3}}),
    ('Nature, animals and the weather', {'tags': {'nature': 3, 'beast': 1}}),
    ('Strange or experimental magic', {'tags': {'strange-magic': 3}}),
    ('Hunting monsters and the Taint', {'tags': {'monster-hunter': 3}}),
    ('Subtle tricks no one notices', {'tags': {'stealth': 3, 'schemer': 1}}),
    ('Forbidden power, whatever the cost', {'tags': {'forbidden': 3}}),
    NP]),
 'element': ('Which Element calls to them?', [
    ('Air: subtle, quick and perceptive', {'element': 'Air'}),
    ('Earth: steady, protective and enduring', {'element': 'Earth'}),
    ('Fire: passionate, clever and destructive', {'element': 'Fire'}),
    ('Water: adaptable, healing and always moving', {'element': 'Water'}),
    ('Void: the rare, mystical space between', {'element': 'Void'}),
    NP]),
 'ambition': ('What would they most like to be remembered for?', [
    ('Standing between the Empire and the darkness', {'tags': {'monster-hunter': 2, 'bodyguard': 1}}),
    ('Perfect mastery of an art: the sword, the brush or the stage', {'tags': {'duelist': 2, 'artist': 2}}),
    ('Victory: battles won and enemies broken', {'tags': {'commander': 2, 'frontline': 2}}),
    ('Wisdom: understanding the secrets of the world', {'tags': {'scholar': 2, 'mystic': 2}}),
    ('Loyalty in the shadows: doing what others will not', {'tags': {'schemer': 2, 'stealth': 2}}),
    ('Freedom: going where no one else has been', {'tags': {'traveller': 2, 'cavalry': 1, 'sailor': 1}}),
    ('Wealth and influence', {'tags': {'merchant': 2, 'schemer': 1, 'diplomat': 1}}),
    ('The people they saved', {'tags': {'healer': 2, 'protector-magic': 1, 'bodyguard': 1, 'diplomat': 1}}),
    NP]),
 'home': ('Where do they feel most at home?', [
    ('On a great wall, facing a monster-haunted wasteland', {'homes': {'wall': 3}}),
    ('Elegant courts and castles', {'homes': {'court': 3}}),
    ('High mountains and quiet monasteries', {'homes': {'mountains': 3}}),
    ('Libraries and temples', {'homes': {'library': 3}}),
    ('The open plains, on horseback', {'homes': {'plains': 3}}),
    ('At sea, among islands and ports', {'homes': {'sea': 3}}),
    ('On the battlefield, among soldiers', {'homes': {'battlefield': 3}}),
    ('Forests and wild places', {'homes': {'wilds': 3}}),
    ('City streets and shady corners', {'homes': {'underworld': 3}}),
    ('On the road, never in one place for long', {'homes': {'road': 3}}),
    NP]),
 'rules': ('Would they break the rules to get the job done?', [
    ('Never: their word and their honour are everything', {'honor': {'high': 3, 'low': -3}}),
    ('Only if there is truly no other way', {'honor': {'mid': 2}}),
    ('Yes, if the result is worth it', {'honor': {'low': 3, 'high': -1}}),
    NP]),
 'bushido': ('Which virtue of Bushido matters most to them?', [
    ('Compassion', {'tags': {'healer': 2, 'bodyguard': 1, 'protector-magic': 1}}),
    ('Courage', {'tags': {'frontline': 2, 'monster-hunter': 2, 'all-out': 1}}),
    ('Courtesy', {'tags': {'diplomat': 2, 'artist': 1}}),
    ('Duty', {'tags': {'bodyguard': 2, 'commander': 1}}),
    ('Honesty', {'tags': {'investigator': 2}}),
    ('Honor', {'honor': {'high': 2}}),
    ('Sincerity', {'tags': {'diplomat': 1, 'mystic': 1}}),
    ('None of them: results matter more', {'honor': {'low': 3}}),
    NP]),
 'faith': ('How religious are they?', [
    ('Deeply: prayer and meditation shape their life', {'tags': {'mystic': 3, 'spirits': 2}, 'roles': {'Monk': 1}}),
    ('Respectful, like most samurai', {}),
    ('Not very: steel and results matter more', {'tags': {'mystic': -2, 'spirits': -1}}),
    NP]),
 'companion': ('Who or what would you like at their side?', [
    ('A loyal horse', {'tags': {'cavalry': 2}, 'homes': {'plains': 1}}),
    ('A hunting falcon or a war-cat', {'tags': {'beast': 3}}),
    ('A ship and its crew', {'tags': {'sailor': 3}}),
    ('A fine blade, their family\'s pride', {'tags': {'duelist': 2}}),
    ('A book or a brush', {'tags': {'scholar': 2, 'artist': 2}}),
    ('A network of informants', {'tags': {'schemer': 2, 'investigator': 1}}),
    ('No one: they walk alone', {'tags': {'traveller': 2, 'stealth': 1, 'mystic': 1}}),
    NP]),
 'death': ('Every samurai thinks about how they will die. How will yours?', [
    ('In a last stand, holding the line', {'tags': {'frontline': 2, 'bodyguard': 2}}),
    ('In a duel', {'tags': {'duelist': 3}}),
    ('Fighting the darkness, far from home', {'tags': {'monster-hunter': 3}}),
    ('Of old age, surrounded by students', {'tags': {'scholar': 2, 'mystic': 2, 'healer': 1}}),
    ('Quietly, with secrets no one ever learns', {'tags': {'stealth': 2, 'schemer': 2}}),
    ('At the head of an army', {'tags': {'commander': 3}}),
    ('Somewhere no one from home has ever been', {'tags': {'traveller': 2, 'sailor': 1, 'cavalry': 1}}),
    NP]),
}
ALL_QUESTIONS = ['magic', 'complexity', 'niche', 'approach', 'fight', 'court', 'magickind', 'element',
                 'ambition', 'home', 'rules', 'bushido', 'faith', 'companion', 'death']
COMFORT_QUESTIONS = ('magic', 'complexity', 'niche')

def questions_for(ans):
    """The adaptive order. ans maps question id -> answer index."""
    order = ['magic', 'complexity', 'niche']
    caster = ans.get('magic') == 0
    if caster:
        order += ['magickind', 'element']
    else:
        order += ['approach']
        a = ans.get('approach')
        order += ['court'] if a in (1, 4) else ['fight']
    order += ['ambition', 'home', 'rules', 'bushido']
    if not caster: order += ['faith']
    order += ['companion', 'death']
    return order

def contribution(s, qid, e):
    """What one answer adds to one School. The same arithmetic, in the same order, is in the review page."""
    label = 0.0
    for tag, w in e.get('tags', {}).items():
        label += w * (2 if tag in s['primary'] else 1 if tag in s['secondary'] else 0)
    for home, w in e.get('homes', {}).items():
        if home in s['homes']: label += w
    label *= s['factor']
    rest = 0.0
    for role, w in e.get('roles', {}).items():
        if role in s['roles']: rest += w
    rest += e.get('honor', {}).get(s['band'], 0)
    rest += e.get('cx', {}).get(s['cx'], 0)
    rest += e.get('niche', {}).get(s['niche'], 0)
    el = e.get('element')
    if el:
        if s['choose_affinity'] or s['affinity'] == el: rest += 3
        elif s['deficiency'] == el: rest -= 2
    c = label + rest
    if qid in DIRECT_QUESTIONS: c *= DIRECT_WEIGHT
    return c

CONTRIB = {(qid, i): [contribution(s, qid, e) for s in SCHOOLS] for qid, (text, answers) in Q.items() for i, (label, e) in enumerate(answers)}

def asked_answers(ans):
    return [(q, ans[q]) for q in questions_for(ans) if ans.get(q) is not None]

def effects(ans):
    for q, i in asked_answers(ans):
        yield Q[q][1][i][1]

def score(s, ans):
    t = 0.0
    for q, i in asked_answers(ans):
        t += CONTRIB[(q, i)][s['i']]
    return t

def main_label_fit(s, ans):
    m = 0
    for e in effects(ans):
        m += sum(1 for t, w in e.get('tags', {}).items() if w > 0 and t in s['primary'])
    return m

def fnv1a(text, h=0x811c9dc5):
    for ch in text:
        h ^= ord(ch)
        h = (h * 16777619) & 0xffffffff
    return h

def signature(ans):
    return '|'.join('%s:%d' % (q, i) for q, i in asked_answers(ans))

def allowed(s, ans):
    """Only "Yes" to magic removes anything: it leaves only Shugenja."""
    if ans.get('magic') == 0: return 'Shugenja' in s['roles']
    return True

def content_answers(ans):
    """Answers that say something about the character (not the comfort questions, not "No preference")."""
    return sum(1 for q, i in asked_answers(ans) if q not in COMFORT_QUESTIONS and Q[q][1][i][1])

def is_sampler(ans):
    return content_answers(ans) < SAMPLER_BELOW

def shuffle_key(s, ans, seed=None):
    """The last tie-break: a shuffle that differs from player to player, so no School wins ties by its name."""
    if seed is None: seed = fnv1a(signature(ans) + '#')
    return fnv1a(s['name'], seed)

def ranked(ans):
    seed = fnv1a(signature(ans) + '#')
    pool = [s for s in SCHOOLS if allowed(s, ans)]
    order = sorted(pool, key=lambda s: (-score(s, ans), -main_label_fit(s, ans), s['cx'], s['niche'], shuffle_key(s, ans, seed)))
    seen, uniq = set(), []
    for s in order:
        if s['name'] in seen: continue   # Toritaka Bushi is offered by both the Crab and the Falcon
        seen.add(s['name']); uniq.append(s)
    return uniq

def sampler(ans):
    """A spread of Schools to explore: different Clans and types, the most common and simplest first."""
    seed = fnv1a(signature(ans) + '#')
    not_best = {e['not_best'] for e in effects(ans) if e.get('not_best')}
    stranger = ans.get('niche') == 2
    pool, seen = [], set()
    for s in sorted([s for s in SCHOOLS if allowed(s, ans)], key=lambda s: (s['niche'], s['cx'], shuffle_key(s, ans, seed))):
        if s['name'] in seen or (s['roles'] & not_best) or (s['niche'] == 3 and not stranger): continue
        seen.add(s['name']); pool.append(s)
    pick, clans = [], set()
    for role in ('Bushi', 'Courtier', 'Shugenja', 'Monk', 'Artisan', 'Ninja'):
        for s in pool:
            if role in s['roles'] and s['clan'] not in clans and s not in pick:
                pick.append(s); clans.add(s['clan']); break
        if len(pick) == 6: break
    for s in pool:
        if len(pick) == 6: break
        if s['clan'] not in clans and s not in pick:
            pick.append(s); clans.add(s['clan'])
    rest = [s for s in ranked(ans) if s not in pick]
    return pick, pick + rest

def recommend(ans):
    """Returns (best matches, also worth a look, something different, every School in order).
    In sampler mode there are no best matches: the second list is the sample."""
    if is_sampler(ans):
        sample, everything = sampler(ans)
        return [], sample, None, everything
    uniq = ranked(ans)
    not_best = {e['not_best'] for e in effects(ans) if e.get('not_best')}
    eligible = [s for s in uniq if not (s['roles'] & not_best)]
    top = score(eligible[0], ans)
    hard = [eligible[0]]
    if len(eligible) > 1 and (top <= 0 or score(eligible[1], ans) >= 0.8 * top): hard.append(eligible[1])
    soft, clans = [], {}
    for s in hard: clans[s['clan']] = clans.get(s['clan'], 0) + 1
    for s in uniq:
        if len(soft) == 4: break
        if s in hard or clans.get(s['clan'], 0) >= 2: continue
        soft.append(s); clans[s['clan']] = clans.get(s['clan'], 0) + 1
    wild = None
    if any(e.get('wildcard') for e in effects(ans)) or ans.get('niche') is None:
        shown = {s['name'] for s in hard + soft}
        wild = next((s for s in uniq if s['niche'] == 3 and s['name'] not in shown and score(s, ans) >= 0.5 * top), None)
    return hard, soft, wild, uniq

def random_answers(rng, p_np=0.15):
    ans = {}
    for qid in ALL_QUESTIONS:
        opts = Q[qid][1]
        ans[qid] = len(opts) - 1 if rng.random() < p_np else rng.randrange(len(opts) - 1)
    asked = questions_for(ans)
    return {k: v for k, v in ans.items() if k in asked}

def best_rank(target, ans):
    hard, soft, wild, uniq = recommend(ans)
    if target['name'] in {s['name'] for s in hard}: return 0 if hard[0]['name'] == target['name'] else 1
    names = [s['name'] for s in uniq]
    return 2 + names.index(target['name']) if target['name'] in names else 999

def best_path_for(target, rng, tries=40):
    """Hill-climb the answers to put target as high as possible. Returns (rank, answers); rank 0 = first best match."""
    best = (10**9, None)
    for t in range(tries):
        ans = random_answers(rng, 0.3)
        if 'Shugenja' in target['roles']: ans['magic'] = 0
        elif ans.get('magic') == 0: ans['magic'] = 3
        ans = {k: v for k, v in ans.items() if k in questions_for(ans)}
        for need in questions_for(ans): ans.setdefault(need, len(Q[need][1]) - 1)
        cur = best_rank(target, ans)
        improved = True
        while improved and cur > 0:
            improved = False
            for qid in list(questions_for(ans)):
                for i in range(len(Q[qid][1])):
                    if ans.get(qid) == i: continue
                    if qid == 'magic' and ((i == 0) != ('Shugenja' in target['roles'])): continue
                    trial = dict(ans); trial[qid] = i
                    trial = {k: v for k, v in trial.items() if k in questions_for(trial)}
                    for need in questions_for(trial): trial.setdefault(need, len(Q[need][1]) - 1)
                    r = best_rank(target, trial)
                    if r < cur: ans, cur, improved = trial, r, True
        if cur < best[0]: best = (cur, ans)
        if cur == 0: break
    return best

if __name__ == '__main__':
    rng = random.Random(7)
    worst = sorted(((best_path_for(s, rng)[0], s['name']) for s in {s['name']: s for s in SCHOOLS}.values()), reverse=True)
    print('Schools:', len(SCHOOLS), '| distinct names:', len({s["name"] for s in SCHOOLS}))
    print('not reachable as the first best match:', [n for r, n in worst if r > 0])
    print('not reachable as a best match at all:', [n for r, n in worst if r > 1])
    print('Run reliability.py for the full tests.')
