#!/usr/bin/env python3
# Veil Protocol word-budget dashboard, restructured to the 8-component
# campaign-construction corpus (author components, never paths).
# Counts authored words in content/<bucket>/ (corpus JSON + scaffold JS),
# scores against the 500K blueprint, reports registry coverage, writes dashboard.html.
import re,json,os,glob,html
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def wc(s): return len(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',s or '')).split())
def json_words(path):
    try: data=json.load(open(path,encoding='utf-8'))
    except: return 0
    vals=[]
    def walk(x):
        if isinstance(x,str): vals.append(x)
        elif isinstance(x,dict):
            for k,v in x.items():
                if not k.startswith('_') and k not in('schema','ref','id','numeral','pack','faction_toolkit','framework'): walk(v)
        elif isinstance(x,list):
            for v in x: walk(v)
    walk(data)
    return wc(' '.join(vals))
def dir_words(d):
    tot=0; files=0
    for f in glob.glob(os.path.join(ROOT,d,'**','*.json'),recursive=True):
        tot+=json_words(f); files+=1
    for f in glob.glob(os.path.join(ROOT,d,'**','*.js'),recursive=True):
        tot+=wc(open(f,encoding='utf-8').read()); files+=1
    return tot,files

# 8-component blueprint (Betty's restructured allocation, 500,000 total)
BLUEPRINT=[
 ('Thirteen Domains', 'content/domains', 110000, '13 domain packs: Holder, Demon/seat, locations, destabilization track, hooks, intersections. Highest reuse.'),
 ('Faction Toolkits', 'content/factions', 80000, '5 sandboxes (CVD, Grid, Tower, Cult, 13/Axis): rosters, politics, leverage, mission seeds. Not linear routes.'),
 ('Place & Encounter Library', 'content/places', 70000, 'Kita + Tokyo named sites, thin spots, set-pieces, sightings. Modular, faction-neutral.'),
 ('NPC & Companion Packets', 'content/npcs', 60000, 'Modular characters: secrets, voice packs, relationship beat-packets keyed to thresholds.'),
 ('Campaign Frameworks', 'content/frameworks', 50000, '6-8 scenario engines a GM fills in: Possession Rescue, Domain Destabilization, Faction War...'),
 ('Rituals, Seals & Wards', 'content/rituals', 50000, 'Named instances on the books’ grammar: exorcism, binding, sigils, family marks, ward-sites.'),
 ('Virtual Warden Runtime', 'content/warden', 50000, 'AI-Warden prompts, scene-loop scripts, oracle tables, voice packs, phone+battle generators.'),
 ('Bestiary & Stat Blocks', 'content/bestiary', 30000, 'Entities beyond the 13: classes A-D, possession profiles, behavior scripts (data, not prose).'),
]

counts={}; filecount={}
for name,d,t,desc in BLUEPRINT:
    w,fc=dir_words(d); counts[name]=w; filecount[name]=fc

# reference: authored example campaign (Gin) scenes/actions, counted separately from the 500K corpus
ex_w,_=dir_words('content/scenes'); exa_w,_=dir_words('content/actions')
example_words=ex_w+exa_w

# registry coverage
reg=os.path.join(ROOT,'content','registry')
def load(n):
    p=os.path.join(reg,n)
    return json.load(open(p,encoding='utf-8')) if os.path.exists(p) else None
chars=load('characters.json') or []
places=load('places.json') or {'venues':{}}
domains=load('domains.json') or {'domains':[]}
domain_packs=len(glob.glob(os.path.join(ROOT,'content','domains','*.json')))

total_now=sum(counts.values()); total_target=sum(t for _,_,t,_ in BLUEPRINT)

def pct(c,t): return min(100,round(c/t*100)) if t else 0
rows=''
for name,d,t,desc in BLUEPRINT:
    c=counts[name]; p=pct(c,t)
    rows+=f'''<div class="row"><div class="rl"><b>{html.escape(name)}</b>
      <span class="dd">{html.escape(desc)}</span>
      <span class="files">{filecount[name]} file(s) · {d}</span></div>
      <div class="rr"><div class="track"><div class="fill" style="width:{p}%"></div></div>
      <div class="num">{c:,} <span class="t">/ {t:,}</span><span class="pc">{p}%</span></div></div></div>'''
op=pct(total_now,total_target)
cov=round(len([1 for c in chars if c.get('name')])) if chars else 0

dash=f'''<!doctype html><meta charset="utf-8"><title>Veil Protocol · Corpus Budget</title>
<style>
:root{{--blood:#8B0000;--bl:#c0392b;--dim:#8a7f73}}
body{{margin:0;background:#15110f;color:#e8e0d4;font-family:Georgia,serif;padding:30px}}
.wrap{{max-width:900px;margin:0 auto}}
h1{{font-family:Cinzel,Georgia,serif;letter-spacing:1px;margin:0 0 2px}} h1 .dot{{color:var(--bl)}}
.sub{{color:var(--dim);font-size:13px;margin:0 0 22px}}
.total{{background:#1f1916;border:1px solid #3a2e28;border-radius:10px;padding:16px 20px;margin-bottom:8px}}
.total .big{{font-size:28px;font-family:Cinzel,serif}} .total .t{{color:var(--dim);font-size:17px}}
.note0{{color:var(--dim);font-size:12px;margin:0 0 20px}}
.track{{height:12px;background:#2a211d;border-radius:6px;overflow:hidden;border:1px solid #3a2e28}}
.fill{{height:100%;background:linear-gradient(90deg,var(--blood),var(--bl))}}
.row{{display:flex;gap:18px;padding:13px 0;border-bottom:1px solid #281f1b;align-items:center}}
.rl{{flex:1.2}} .rr{{flex:.9}} .rl b{{font-size:14px}}
.dd{{display:block;color:var(--dim);font-size:11.5px;margin-top:3px;line-height:1.4}}
.files{{display:block;color:#5f564e;font-size:10.5px;margin-top:4px;font-style:italic}}
.num{{margin-top:7px;font-size:12.5px}} .num .t{{color:var(--dim)}} .num .pc{{float:right;color:var(--bl)}}
.grid{{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}}
.card{{flex:1;min-width:120px;background:#1f1916;border:1px solid #3a2e28;border-radius:9px;padding:13px}}
.card .n{{font-size:24px;font-family:Cinzel,serif}} .card .l{{color:var(--dim);font-size:11px;margin-top:3px}}
.note{{color:var(--dim);font-size:11.5px;margin-top:20px;line-height:1.6}}
</style>
<div class="wrap">
<h1>Veil Protocol<span class="dot">·</span>Corpus Budget</h1>
<p class="sub">500,000 words of modular, recombinable campaign-construction corpus — components, not paths. Regenerate with <code>tools/build_dashboard.py</code>.</p>
<div class="total"><div class="big">{total_now:,} <span class="t">/ {total_target:,} corpus words ({op}%)</span></div>
<div class="track" style="margin-top:11px"><div class="fill" style="width:{op}%"></div></div></div>
<p class="note0">Sits on top of the finished ~267K-word Player + Warden books (the rules layer, not re-counted). Authored example campaign (Gin scenes/actions): {example_words:,} words, separate from the corpus.</p>
{rows}
<div class="grid">
  <div class="card"><div class="n">{domain_packs}/13</div><div class="l">domain packs</div></div>
  <div class="card"><div class="n">{len(chars)}</div><div class="l">NPCs catalogued</div></div>
  <div class="card"><div class="n">{len(places.get("venues",{}))}</div><div class="l">named venues</div></div>
  <div class="card"><div class="n">{example_words:,}</div><div class="l">example-campaign words</div></div>
</div>
<p class="note">Write order (highest reuse first): Domains → Factions → Frameworks (ship a beta) → NPCs + Places + Rituals in parallel → Warden Runtime → Bestiary. The Warden runtime supplies the play-time branching, so the corpus never branches combinatorially against itself.</p>
</div>'''
open(os.path.join(ROOT,'dashboard.html'),'w',encoding='utf-8').write(dash)
print(f'dashboard.html rebuilt. Corpus: {total_now:,} / {total_target:,} ({op}%)')
for name,d,t,_ in BLUEPRINT: print(f'  {name}: {counts[name]:,} / {t:,}  ({filecount[name]} files)')
print(f'Domain packs: {domain_packs}/13 | NPCs: {len(chars)} | example campaign: {example_words:,} words')
