#!/usr/bin/env python3
"""Build content/scenes/campaign.js from content/story/campaign.json.

The interactive book (interactive-book/index.html) reads scene groups from
window.VP.scenes. This script turns the authored campaign (main chapters,
side missions, romances) into those groups, adds choice effects, picks an
illustration for every scene from images/, and writes one JS module.

Run from the repo root:  python3 tools/build_campaign.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'content', 'story', 'campaign.json')
OUT = os.path.join(ROOT, 'content', 'scenes', 'campaign.js')
IMG_DIR = os.path.join(ROOT, 'images')
IMG = '../images/'

camp = json.load(open(SRC, encoding='utf8'))
IMAGES = set(os.listdir(IMG_DIR))

# ---------------------------------------------------------------- text
FIXES = [
    # pronoun slips about Rei, who is male
    ('with ink on the side of her hand', 'with ink on the side of his hand'),
    ("a frightened amateur who didn't know what she did", "a frightened amateur who didn't know what he did"),
]

def clean(s):
    if not s:
        return s
    for a, b in FIXES:
        s = s.replace(a, b)
    # house style of the interactive book: no long dashes, an ellipsis instead
    s = re.sub(r'\s*[—–]\s*', '... ', s)
    s = s.replace('... ...', '...').replace('..... ', '... ')
    s = re.sub(r'\.\.\. ([,.;:!?])', r'...\1', s)
    s = re.sub(r'\.\.\.\s+$', '...', s)
    return s.strip()

def title_clean(s):
    # "Chapter Two — The Archive" -> "Chapter Two. The Archive"
    return re.sub(r'\s*[—–]\s*', '. ', s).strip()

# ---------------------------------------------------------------- images
# Ordered: first match wins. Scene caption is searched before prose.
IMAGE_RULES = [
    (r'\bAxis\b', 'char_the-axis.png'),
    (r'Kurosawa', 'char_kurosawa-shou.png'),
    (r'Tanizaki', 'char_tanizaki-seiichi.png'),
    (r'Okada', 'char_okada-shizuka.png'),
    (r'Itsuki', 'char_kuroda-itsuki.png'),
    (r'\bSei\b', 'char_kuroda-sei.png'),
    (r'Kanna|Kishin|Fukai', 'char_fukai-rinka-kishin.png'),
    (r'\bSora\b', 'ch19_possessed_leader.png'),
    (r'Watanabe', 'thirteen_VI_watanabe_jun.png'),
    (r'Mori Takao|Rage seat', 'thirteen_II_mori_takao.png'),
    (r'Nakashima', 'thirteen_IV_nakashima_yuna.png'),
    (r'Inoue Satoru|Hunger', 'thirteen_IX_inoue_satoru.png'),
    (r'Park Junho|Shin-Ōkubo|Shin-Okubo', 'thirteen_XI_park_junho.png'),
    (r'Chen Lian', 'thirteen_V_chen_lian.png'),
    (r'Asakura', 'thirteen_I_asakura_mio.png'),
    (r'Hagiwara|Mizuki|the Director\b', 'char_hagiwara-mizuki.png'),
    (r'Adachi', 'char_director-adachi-kenshin.png'),
    (r'Moriya', 'char_moriya-tatsuki.png'),
    (r'\bSena\b|Fujiwara-Kage', 'char_fujiwara-kage-sena.png'),
    (r'\bNoa\b|Katagiri', 'char_katagiri-noa.png'),
    (r'Shimizu', 'char_shimizu-ren.png'),
    (r'Usami', 'char_usami-hinata-ren.png'),
    (r'Tendo', 'char_tendo-akira.png'),
    (r'Kato|Ryusei', 'char_kato-ryusei.png'),
    (r'\bAoi\b', 'char_nakamura-aoi.png'),
    (r'Haruki|Tsukishiro', 'char_tsukishiro-haruki.png'),
    (r'\bHana\b|Choi', 'char_choi-hana.png'),
    (r'Iwata', 'char_iwata-kenji.png'),
    (r'Komatsu', 'char_komatsu-shigeru.png'),
    (r'Kaneda', 'char_kaneda-t-ru.png'),
    (r'Kuroki', 'npc_kuroki.png'),
    (r'\bYua\b', 'npc_yua.png'),
    (r'Mori Haruto|\bMori\b', 'char_mori-haruto.png'),
    (r'Miyamoto|fox-shrine|Inari', 'place_shinto.png'),
    (r'bookseller|Bookseller', 'char_the-bookseller.png'),
    (r'Switch', 'char_switch.png'),
    (r'Hara Setsu|sentō|bathhouse|bath-house', 'place_sento.png'),
    (r'Kondō|baker', 'place_akebono.png'),
    (r'Hayashi|clinic|blue curtain', 'res_pharmacist.png'),
    (r'Matsuda|café|cafe', 'place_mikazuki.png'),
    (r'Healer|wrong shadow', 'ext_sojo.png'),
    (r'\bGin\b.*(window|lucid)|lucid', 'char_uedera-gin.png'),
    (r'\btexts?\b|phone|number', 'res_apartmentreiroom.png'),
    (r'ledger|Ledger|handwriting|Archive|archive|index card|journal', 'res_archive.png'),
    (r'registry|Registry|lanyard|badge|intake|Directorate|CVD', 'cvdroom_assessment_registry.png'),
    (r'Far-Shore|circle|Circle|mourner|tea\b', 'ch19_funnel.png'),
    (r'vessel', 'higankai_vesselfarm.png'),
    (r'chair|seat|Seat|throne|wound', 'finale_two_thirteens.png'),
    (r'wall|membrane|seam|thin', 'ch3_thinspot.png'),
    (r'river|embankment|water|Obon|lantern', 'place_riverside.png'),
    (r'overpass|underpass|tunnel', 'place_underpass.png'),
    (r'door|lock|key', 'tools_trap.png'),
    (r'train|platform|station', 'map_trains.png'),
    (r'apartment|kitchen|tatami|genkan|flat', 'res_apartmentempty.png'),
]

# Per-chapter fixed openers where Betty has a picture made for exactly that idea.
CHAPTER_IMAGE = {
    'm_archive': 'res_archive.png',
    'm_lastweek': 'res_apartmentginroom.png',
    'm_door': 'tools_trap.png',
    'm_briefing': 'cvdroom_the_dispatch_center.png',
    'm_form': 'cvdroom_assessment_registry.png',
    'm_lucid': 'char_uedera-gin.png',
    'm_after14': 'res_archive.png',
    'm_texts': 'res_apartmentreiroom.png',
    'm_kurosawa': 'char_kurosawa-shou.png',
    'm_word': 'ext_sojo.png',
    'm_ledger': 'currency_prices.png',
    'm_inverted': 'ch19_possessed_leader.png',
    'm_trap': 'ch7_preconflict.png',
    'm_farshore': 'ch19_funnel.png',
    'm_battery': 'higankai_vesselfarm.png',
    'm_counter': 'ch19_cults.png',
    'm_thinning': 'ch3_thinspot.png',
    'm_axis': 'char_the-axis.png',
    'm_offer': 'finale_two_thirteens.png',
    'm_beyond': 'ch21_entitysight.png',
    'm_registry': 'cvdroom_the_records_archive.png',
    'm_twelve': 'ch6_sixpaths.png',
    'm_trapcloses': 'place_riverside.png',
    'm_clocks': 'res_apartment.png',
}

SIDE_IMAGE = {
    's_yua': 'npc_yua.png',
    's_dorm': 'char_mori-haruto.png',
    's_drowned': 'place_riverside.png',
    's_broker': 'res_animals.png',
    's_shrine': 'place_shinto.png',
    's_kaneda': 'place_gaybar.png',
    's_bookseller': 'res_bookshop.png',
    's_courier': 'map_trains.png',
    's_weakening': 'thirteen_VI_watanabe_jun.png',
    's_rage': 'thirteen_II_mori_takao.png',
    's_fear': 'thirteen_IV_nakashima_yuna.png',
    's_hunger': 'thirteen_IX_inoue_satoru.png',
    's_longing': 'thirteen_XI_park_junho.png',
    's_auditor': 'ch15_assessment.png',
    's_kuroki': 'npc_kuroki.png',
}

def pick_image(caption, prose, used):
    for text in (caption, ' '.join(prose)):
        for rx, img in IMAGE_RULES:
            if img in IMAGES and re.search(rx, text) and img not in used:
                return img
    for text in (caption, ' '.join(prose)):
        for rx, img in IMAGE_RULES:
            if img in IMAGES and re.search(rx, text):
                return img
    return None

# ---------------------------------------------------------------- ids
MAIN_SLUGS = [
    'm_archive', 'm_lastweek', 'm_door', 'm_briefing', 'm_form',
    'm_lucid', 'm_after14', 'm_texts', 'm_bleeds', 'm_kurosawa', 'm_word',
    'm_ledger', 'm_inverted', 'm_trap', 'm_ledgergrows', 'm_knot', 'm_35th',
    'm_farshore', 'm_tea', 'm_battery', 'm_counter', 'm_hunt',
    'm_thinning', 'm_axis', 'm_offer', 'm_beyond', 'm_shove', 'm_carried',
    'm_registry', 'm_twelve', 'm_leans', 'm_trapcloses', 'm_overstretched',
    'm_lastminute', 'm_clocks', 'm_fastest', 'm_foreclosure',
]
SIDE_SLUGS = ['s_yua', 's_dorm', 's_drowned', 's_broker', 's_shrine', 's_kaneda',
              's_bookseller', 's_courier', 's_weakening', 's_rage', 's_fear',
              's_hunger', 's_longing', 's_auditor', 's_kuroki']
ROM_IDS = {
    'Itsuki': 'itsuki', 'Aoi': 'aoi', 'Hagiwara Mizuki': 'mizuki', 'Katagiri Noa': 'noa',
    'Tendo Akira': 'tendo', 'Okada Shizuka': 'okada', 'Shimizu Ren': 'shimizu',
    'Kato Ryusei': 'kato', 'Moriya Tatsuki': 'moriya', 'Usami & Ren (the Pair)': 'usami',
    'Tsukishiro Haruki': 'haruki', 'Choi Hana': 'hana', 'Kurosawa Shou': 'kurosawa',
}
SIDE_GIVER = {
    's_yua': 'yua', 's_dorm': 'mori', 's_drowned': 'tanizaki', 's_kaneda': 'kaneda',
    's_courier': 'switch', 's_auditor': 'okada', 's_shrine': None,
}

# Which character a name in a choice refers to (choosing to lean on someone raises the bond).
NAME_TO_ID = [
    (r'Itsuki', 'itsuki'), (r'Okada', 'okada'), (r'Tanizaki', 'tanizaki'),
    (r'Kurosawa', 'kurosawa'), (r'\bAoi\b', 'aoi'), (r'\bNoa\b', 'noa'),
    (r'Shimizu', 'shimizu'), (r'Tendo', 'tendo'), (r'Kato\b|Ryusei', 'kato'),
    (r'Moriya', 'moriya'), (r'Haruki', 'haruki'), (r'\bHana\b', 'hana'),
    (r'Usami|\bRen\b', 'usami'), (r'Mizuki|the Director\b', 'mizuki'),
    (r'Kaneda', 'kaneda'), (r'Switch', 'switch'), (r'\bSei\b', 'sei'),
    (r'Daiki', 'daiki'), (r'Iwata', 'iwata'), (r'Komatsu', 'komatsu'),
    (r'Hara\b', 'hara'), (r'Majima', 'majima'), (r'\bYua\b', 'yua'), (r'\bMori\b', 'mori'),
]

# (chapter number 1-based, beat, choice) -> extra effects. Chapter numbers follow MAIN_SLUGS.
GIN_REACH = {(6,0,1),(8,2,2),(9,0,0),(11,1,2),(14,0,2),(14,1,1),(15,2,0),(16,1,0),
             (24,2,1),(25,1,1),(28,0,2),(31,0,2),(32,0,1),(32,1,1),(37,0,1)}
EXTRA_FX = {
    # the hinge in Chapter Ten
    (25,2,0): {'flag': 'lean_continuation'},
    (25,2,1): {'flag': 'lean_refusal', 'mad': 8},
    (25,2,2): {'flag': 'lean_cost'},
    # the Choice That Forecloses the Others
    (34,0,0): {'flag': 'final_chair'},
    (34,0,1): {'flag': 'final_gin'},
    (34,0,2): {'flag': 'final_refuse'},
    # reaching too far through the wall
    (27,1,2): {'mad': 10, 'stab': -8},
    (28,0,2): {'mad': 8, 'stab': -6},
    # documenting the Far-Shore and naming Kishin
    (18,2,1): {'flag': 'named_kishin'},
}

REACH_WORDS = re.compile(r'\b(reach|read the|read it|open|sight|forbidden|both registers|Madness)\b', re.I)
CALM_WORDS = re.compile(r'\b(sleep|rest|slow way|tea|careful|safe|wait)\b', re.I)

def choice_fx(ch_no, b, i, choice):
    fx = {}
    key = (ch_no, b, i)
    text = choice['x'] + ' ' + choice.get('hint', '')
    if key in GIN_REACH:
        fx['gin'] = 1
    rel = {}
    for rx, pid in NAME_TO_ID:
        if re.search(rx, choice['x']):
            rel[pid] = 3
    if rel:
        fx['rel'] = rel
    if REACH_WORDS.search(text):
        fx['mad'] = fx.get('mad', 0) + 2
    elif CALM_WORDS.search(text):
        fx['stab'] = fx.get('stab', 0) + 2
    for k, v in EXTRA_FX.get(key, {}).items():
        fx[k] = fx.get(k, 0) + v if isinstance(v, int) and k in fx else v
    return fx

# ---------------------------------------------------------------- build
scenes = {}
main_order = []

def beats_to_scenes(gid, beats, first_img, title, end_choice_fx, book_title=None, side_img=None):
    out = []
    used = set()
    for b, beat in enumerate(beats):
        cap = clean(beat['scene'])
        prose = [clean(p) for p in beat['prose']]
        img = None
        if b == 0 and first_img and first_img in IMAGES:
            img = first_img
        else:
            img = pick_image(cap, prose, used)
        if img:
            used.add(img)
        sc = {'img': cap, 't': prose}
        if img:
            sc['imgSrc'] = IMG + img
        if b == 0:
            sc['title'] = title
            if book_title:
                sc['book'] = book_title
        choices = []
        last = b == len(beats) - 1
        for i, c in enumerate(beat['choices']):
            fx = end_choice_fx(b, i, c) if callable(end_choice_fx) else {}
            ch = {'x': clean(c['x'])}
            if c.get('hint'):
                ch['hint'] = clean(c['hint'])
            ch['flag'] = '%s_%d_%d' % (gid, b, i)
            if fx:
                ch['fx'] = fx
            if last:
                ch['scene'] = 'city'
                ch['n'] = 0
                ch['fx'] = dict(ch.get('fx', {}))
                ch['fx']['done'] = gid
            else:
                ch['n'] = b + 1
            choices.append(ch)
        sc['c'] = choices
        out.append(sc)
    return out

ch_no = 0
for book in camp['main']:
    first_in_book = True
    for chap in book['chapters']:
        if not chap.get('beats'):
            continue
        ch_no += 1
        gid = MAIN_SLUGS[ch_no - 1]
        title = title_clean(chap['title'])
        book_title = '%s. %s' % (book['book'], book['title']) if first_in_book else None
        first_in_book = False
        n = ch_no
        def fxfn(b, i, c, n=n):
            fx = choice_fx(n, b, i, c)
            return fx
        sc = beats_to_scenes(gid, chap['beats'], CHAPTER_IMAGE.get(gid), title, fxfn, book_title)
        # main chapters advance the chapter clock
        for c in sc[-1]['c']:
            c['fx']['ch'] = 1
        # the final chapter hands over to the ending resolver
        if gid == 'm_foreclosure':
            for c in sc[-1]['c']:
                c.pop('scene', None); c.pop('n', None)
                c['fx']['go'] = 'ending'
        scenes[gid] = sc
        main_order.append({'id': gid, 'title': title, 'book': book['book'] + '. ' + book['title'],
                           'summary': clean(chap.get('summary', ''))})

assert ch_no == len(MAIN_SLUGS), ch_no

side_meta = []
for k, sm in enumerate(camp['sideMissions']):
    gid = SIDE_SLUGS[k]
    title = clean(sm['title'])
    giver = SIDE_GIVER.get(gid)
    def fxfn(b, i, c, gid=gid, giver=giver):
        fx = choice_fx(0, b, i, c)
        return fx
    sc = beats_to_scenes(gid, sm['beats'], SIDE_IMAGE.get(gid), 'Side story. ' + title, fxfn)
    for c in sc[-1]['c']:
        c['fx']['xp'] = 8
        if giver:
            c['fx'].setdefault('rel', {})
            c['fx']['rel'][giver] = c['fx']['rel'].get(giver, 0) + 10
        if gid == 's_weakening':
            c['fx']['flag'] = 'eased_watanabe'
    scenes[gid] = sc
    side_meta.append({'id': gid, 'title': title, 'giver': clean(sm['giver']), 'hook': clean(sm['hook'])})

ROM_IMG = {
    'itsuki': 'char_kuroda-itsuki.png', 'aoi': 'char_nakamura-aoi.png', 'mizuki': 'char_hagiwara-mizuki.png',
    'noa': 'char_katagiri-noa.png', 'tendo': 'char_tendo-akira.png', 'okada': 'char_okada-shizuka.png',
    'shimizu': 'char_shimizu-ren.png', 'kato': 'char_kato-ryusei.png', 'moriya': 'char_moriya-tatsuki.png',
    'usami': 'char_usami-hinata-ren.png', 'haruki': 'char_tsukishiro-haruki.png', 'hana': 'char_choi-hana.png',
    'kurosawa': 'char_kurosawa-shou.png',
}
rom_meta = {}
for r in camp['romances']:
    rid = ROM_IDS[r['who']]
    gid = 'r_' + rid
    out = []
    for k, st in enumerate(r['stages']):
        prose = [clean(p) for p in st['scenes']]
        sc = {'img': clean(st['caption']), 't': prose, 'romance': rid, 'stage': k}
        pic = ROM_IMG[rid] if k == 0 else (pick_image('', prose, {ROM_IMG[rid]}) or ROM_IMG[rid])
        sc['imgSrc'] = IMG + pic
        if k == 0:
            sc['title'] = 'Between you and ' + r['who'].replace(' (the Pair)', '')
        if k < 2:
            c = [
                {'x': 'Let it be what it is.', 'hint': 'You do not push. You do not run.',
                 'scene': 'city', 'n': 0, 'fx': {'rom': [rid, k + 1], 'rel': {rid: 6}}},
                {'x': 'Keep it light. Step back for now.', 'hint': 'A step back is not a door closing. It can still cool things.',
                 'scene': 'city', 'n': 0, 'fx': {'rel': {rid: -2}}},
            ]
        elif k == 2:
            gate = clean(st.get('gate', ''))
            c = [
                {'x': 'Do the thing no one asked you to do.',
                 'hint': gate or 'An act, not a speech. It will cost you something.',
                 'scene': 'city', 'n': 0, 'fx': {'rom': [rid, k + 1], 'rel': {rid: 10}, 'stab': -6, 'flag': 'gate_' + rid}},
                {'x': 'Not like this. Not yet.', 'hint': 'Some doors only open once.',
                 'scene': 'city', 'n': 0, 'fx': {'rel': {rid: -3}}},
            ]
        else:
            c = [
                {'x': 'Stay.', 'hint': 'The night closes over you both. You become each other\'s.',
                 'scene': 'city', 'n': 0, 'fx': {'rom': [rid, k + 1], 'rel': {rid: 10}, 'partner': rid}},
                {'x': 'Let it stay unspoken.', 'hint': 'Something true, left without a name.',
                 'scene': 'city', 'n': 0, 'fx': {'rom': [rid, k + 1], 'rel': {rid: 4}}},
            ]
        sc['c'] = c
        out.append(sc)
    scenes[gid] = out
    rom_meta[rid] = {'who': r['who'], 'stages': [s['stage'] for s in r['stages']],
                     'captions': [clean(s['caption']) for s in r['stages']]}

js = ['/* Veil Protocol content :: the long campaign.',
      '   GENERATED by tools/build_campaign.py from content/story/campaign.json.',
      '   Do not edit by hand. Edit campaign.json or the script, then rebuild. */',
      'window.VP.mainOrder = %s;' % json.dumps(main_order, ensure_ascii=False),
      'window.VP.sideMissions = %s;' % json.dumps(side_meta, ensure_ascii=False),
      'window.VP.romances = %s;' % json.dumps(rom_meta, ensure_ascii=False),
      'Object.assign(window.VP.scenes, %s);' % json.dumps(scenes, ensure_ascii=False, indent=0)]
open(OUT, 'w', encoding='utf8').write('\n'.join(js) + '\n')

n_scenes = sum(len(v) for v in scenes.values())
n_img = sum(1 for v in scenes.values() for s in v if s.get('imgSrc'))
print('groups', len(scenes), 'scenes', n_scenes, 'illustrated', n_img, '->', os.path.relpath(OUT, ROOT))
