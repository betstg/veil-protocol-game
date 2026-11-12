#!/usr/bin/env python3
"""Build book/book.js, the linear read-through edition of Veil Protocol.

It follows one path through the interactive book: the opening, Itsuki's road,
the five books of the campaign with the side stories that feed the spine,
and the Anchor ending. Choices are dropped. Images come from the scenes.

Run from the repo root:  node tools/dump_scenes.js && python3 tools/build_book.py
(tools/dump_scenes.js writes content/scenes/_scenes.json from the scene modules.)
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(ROOT, 'content', 'scenes', '_scenes.json'), encoding='utf8'))

def txt(scene):
    out = []
    for x in scene.get('t', []):
        if isinstance(x, str):
            out.append(x)
    return out

def tidy(p):
    p = re.sub(r'\s*[—–]\s*', '... ', p)
    p = p.replace('... ...', '...')
    return p.strip()

def path(group, idxs):
    return [S[group][i] for i in idxs]

def chapter(title, scenes, kind='main', src=''):
    blocks = []
    for sc in scenes:
        if sc.get('imgSrc'):
            blocks.append({'img': sc['imgSrc'].replace('../images/', ''), 'cap': tidy(sc.get('img', ''))})
        elif sc.get('img'):
            blocks.append({'break': tidy(sc['img'])})
        for p in txt(sc):
            if p.strip():
                blocks.append({'p': tidy(p)})
    return {'title': title, 'kind': kind, 'src': src, 'blocks': blocks}

def group(g, title=None, kind='main'):
    sc = S[g]
    t = title or re.sub(r'^(Chapter [A-Za-z]+(, (continued|concluded))?|Interlude|Side story|Reading the Trajectory(, (continued|concluded))?)\.\s*', '', sc[0].get('title', g))
    return chapter(t, sc, 'side' if g.startswith('s_') else kind, g)

ENDING = [
    'You take the chair. Not as a throne. As a duty. Your own register, the one your family buried in you before you could read.',
    'And because you did everything else right, it does not cost you your brother. You say his tenant’s true name out loud, with love, the only way it can be said. Tachibana Yushiro. A physician who crossed forty years ago refusing to leave the dying untended. The name does not defeat it. It anchors it.',
    'The wall holds. The Axis, mostly light, stands with you. Kishin is exposed and the Director is buried under the proof on the President’s desk.',
    'You live an ordinary life in Tokyo after that. You channel something vast. Gin cooks for three again. Daiki eats like he has been starving.',
    'Tanizaki makes tea and does not say anything about it.']

parts = [
 {'title': 'Book One', 'sub': 'The Vanishing', 'chapters': [
    chapter('The Kitchen, 3:47am', path('opening', [0, 17, 18, 1, 2, 3, 4, 5, 13, 8, 9, 10]), src='opening'),
    chapter('The Friend', path('itsuki', [0, 1, 2, 3, 4, 5, 6, 7]), src='itsuki'),
    group('m_archive'), group('m_lastweek'), group('m_door'), group('m_briefing'), group('m_form')]},
 {'title': 'Book Two', 'sub': 'The Handwriting', 'chapters': [
    group('m_lucid'), group('m_after14'), group('m_texts'), group('m_bleeds'), group('s_auditor'),
    group('m_kurosawa'), group('m_word')]},
 {'title': 'Book Three', 'sub': 'The Recruited', 'chapters': [
    group('m_ledger'), group('s_shrine'), group('m_inverted'), group('m_trap'), group('m_ledgergrows'),
    group('m_knot'), group('m_35th'), group('s_drowned'), group('m_farshore'), group('m_tea'),
    group('m_battery'), group('m_counter'), group('m_hunt')]},
 {'title': 'Book Four', 'sub': 'The Vacant Seat', 'chapters': [
    group('m_thinning'), group('m_axis'), group('m_offer'), group('m_beyond'), group('m_shove'),
    group('m_carried'), group('s_bookseller'), group('m_registry'), group('m_twelve'),
    group('s_weakening'), group('s_rage'), group('s_fear'), group('s_hunger'), group('s_longing'),
    group('m_leans'), group('m_trapcloses'), group('m_overstretched'), group('m_lastminute')]},
 {'title': 'Book Five', 'sub': 'The Last Night', 'chapters': [
    group('m_clocks'), group('m_fastest'), group('m_foreclosure'),
    {'title': 'The Anchor', 'kind': 'ending', 'src': 'end', 'blocks': [{'img': 'char_the-axis.png', 'cap': 'The end. The Anchor'}] + [{'p': p} for p in ENDING]}]},
]

# Rewritten chapters (third person, with the Bible woven in) replace the
# assembled ones. Interludes named gin_NN_slug.json follow chapter NN.
OVR = os.path.join(ROOT, 'content', 'book', 'chapters')
if os.path.isdir(OVR):
    files = sorted(os.listdir(OVR))
    by_src = {}
    for f in files:
        if f.endswith('.json') and not f.startswith('gin_'):
            by_src[f[3:-5]] = json.load(open(os.path.join(OVR, f), encoding='utf8'))
    k = 0
    for part in parts:
        out = []
        for ch in part['chapters']:
            k += 1
            src = ch['src']
            if src in by_src:
                o = by_src[src]; o.setdefault('src', src); o.setdefault('kind', ch['kind'])
                out.append(o)
            else:
                out.append(ch)
            for f in files:
                if f.startswith('gin_%02d_' % k):
                    g = json.load(open(os.path.join(OVR, f), encoding='utf8')); g['kind'] = 'gin'; g.setdefault('src', f[:-5])
                    out.append(g)
        part['chapters'] = out

# Long chapters are split at their scene breaks into shorter chapters.
# The content files are not touched: only the chapter boundaries move.
# A break block where a split happens becomes the title of the new chapter.
SPLIT_OVER, MIN_W, MAX_W, AIM_W = 2800, 1200, 2800, 2000
MINOR = {'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'at', 'by',
         'in', 'of', 'on', 'to', 'up', 'as', 'via', 'per', 'from', 'into', 'onto', 'with'}

def title_case(s):
    words = s.split(' ')
    out = []
    for i, w in enumerate(words):
        core = w.lstrip('"\'‘“(')
        lead = w[:len(w) - len(core)]
        after_stop = i > 0 and re.search(r'[.:!?]$', words[i - 1])
        if core and core[0].islower() and (i == 0 or i == len(words) - 1 or after_stop or core.lower() not in MINOR):
            core = core[0].upper() + core[1:]
        out.append(lead + core)
    return ' '.join(out)

def block_words(b):
    if 'p' in b:
        return len(b['p'].split())
    if 'doc' in b:
        return len(' '.join(b['doc'].get('lines', [])).split())
    return 0

def piece_cost(w):
    # far outside the range costs most, then distance from the aim
    out = max(0, MIN_W - w) + max(0, w - MAX_W)
    return out * 1e6 + (w - AIM_W) ** 2

def split_chapter(ch):
    blocks = ch['blocks']
    total = sum(block_words(b) for b in blocks)
    cuts = [i for i, b in enumerate(blocks) if 'break' in b]
    if ch.get('kind') == 'gin' or total <= SPLIT_OVER or not cuts:
        return [ch]
    # prefix words before each candidate cut, so a piece's length is a subtraction
    pre = [0]
    for b in blocks:
        pre.append(pre[-1] + block_words(b))
    pts = [0] + cuts + [len(blocks)]
    # best[j] = (cost, previous point) for a piece ending at pts[j]
    best = {0: (0, None)}
    for j in range(1, len(pts)):
        cand = []
        for i in range(j):
            if i in best:
                w = pre[pts[j]] - pre[pts[i]]
                cand.append((best[i][0] + piece_cost(w), i))
        best[j] = min(cand)
    chain, j = [], len(pts) - 1
    while j:
        i = best[j][1]
        chain.append((pts[i], pts[j]))
        j = i
    chain.reverse()
    if len(chain) == 1:
        return [ch]
    out = []
    for k, (a, b) in enumerate(chain):
        piece = {key: v for key, v in ch.items() if key != 'blocks'}
        if k == 0:
            piece['blocks'] = blocks[a:b]
        else:
            piece['title'] = title_case(blocks[a]['break'])
            piece['blocks'] = blocks[a + 1:b]
            piece['src'] = '%s#%d' % (ch.get('src', ''), k + 1)
            if piece.get('kind') == 'ending':
                piece['kind'] = 'main'
        out.append(piece)
    return out

for part in parts:
    split = []
    for ch in part['chapters']:
        split.extend(split_chapter(ch))
    part['chapters'] = split

def img_src(name):
    stem = os.path.splitext(name)[0]
    for ext in ('.png', '.jpg', '.jpeg'):
        if os.path.exists(os.path.join(ROOT, 'images', stem + ext)):
            return os.path.join(ROOT, 'images', stem + ext)
    if os.path.exists(os.path.join(ROOT, 'book', 'img', stem + '.jpg')):
        return os.path.join(ROOT, 'book', 'img', stem + '.jpg')
    return None

n = 0
words = 0
missing = []
for part in parts:
    for ch in part['chapters']:
        if ch.get('kind') != 'gin':
            n += 1
            ch['n'] = n
        else:
            ch['n'] = n
        words += sum(len(b['p'].split()) for b in ch['blocks'] if 'p' in b)
        words += sum(len(' '.join(b['doc'].get('lines', [])).split()) for b in ch['blocks'] if 'doc' in b)
        for b in ch['blocks']:
            if 'img' in b and not img_src(b['img']):
                missing.append(b['img'])
        if not any('img' in b for b in ch['blocks']):
            missing.append('NO IMAGE in chapter ' + ch['title'])

os.makedirs(os.path.join(ROOT, 'book', 'img'), exist_ok=True)
# web-sized copies so the book loads on a phone
from PIL import Image
for part in parts:
    for ch in part['chapters']:
        for b in ch['blocks']:
            if 'img' in b:
                src = img_src(b['img'])
                name = os.path.splitext(b['img'])[0] + '.jpg'
                dst = os.path.join(ROOT, 'book', 'img', name)
                if src and src != dst and (not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src)):
                    im = Image.open(src).convert('RGB')
                    im.thumbnail((1200, 1600))
                    im.save(dst, 'JPEG', quality=80, optimize=True, progressive=True)
                b['img'] = name
with open(os.path.join(ROOT, 'book', 'book.js'), 'w', encoding='utf8') as f:
    f.write('// Built by tools/build_book.py. Do not edit by hand.\nwindow.BOOK = ')
    json.dump({'parts': parts, 'words': words, 'pages': round(words / 275)}, f, ensure_ascii=False)
    f.write(';\n')
print('chapters', n, 'interludes', sum(1 for p in parts for c in p['chapters'] if c.get('kind') == 'gin'),
      'words', words, 'pages', round(words / 275), 'missing', missing)
lens = [(sum(block_words(b) for b in c['blocks']), c['n'], c['title']) for p in parts for c in p['chapters'] if c.get('kind') != 'gin']
print('shortest chapter', min(lens), 'longest chapter', max(lens))
