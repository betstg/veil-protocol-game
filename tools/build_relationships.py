#!/usr/bin/env python3
"""Mine the canon relationship data from every sheet:
 - Ally/Enemy Track  -> Rei<->NPC ladder + Default start value
 - Relationships/Starting Relationships -> NPC<->NPC and NPC<->Gin ties
Map tiers +3..-3 to the -100..+100 bar; reconcile bidirectionally.
Source of truth = the book. Output: content/registry/relationships.json
Run from repo root.  (reads /tmp/sheets3.json + /tmp/idmap.json built by helpers, or rebuilds)"""
import json,re,os,sys,html
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sheets=json.load(open('/tmp/sheets3.json'))
idm=json.load(open('/tmp/idmap.json'))
BY_SHEET=idm['by_sheetname']; BY_DISP=idm['by_display']
TIER2BAR={3:100,2:67,1:33,0:0,-1:-33,-2:-67,-3:-100}
def clean(t): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',t))).strip()
def disp_base(name):
    n=re.split(r',|/|…|\.\.\.',name)[0]
    return n.replace('’',"'").strip().strip('‘’“”')
def name2id(name):
    n=clean(name)
    b=disp_base(n)
    if b in BY_DISP: return BY_DISP[b]
    # try contains
    for d,i in BY_DISP.items():
        if d and (d in n or n in d): return i
    return None
def parse_level(k):
    k=clean(k).replace('&minus;','-').replace('−','-').replace('–','-')
    m=re.match(r'([+-]?)(\d)',k)
    if not m: return None
    n=int(m.group(2));  return -n if m.group(1)=='-' else n

REL=re.compile(r'<div class="sheet-row"><span class="sheet-key">(.*?)</span><span class="sheet-val[^"]*">(.*?)</span></div>',re.S)
data={}
for s in sheets:
    sid=BY_SHEET[s['name']]
    rec=data.setdefault(sid,{"name":clean(s['name']),"rei_track":None,"ties":{}})
    for t,inner in s['blocks']:
        tl=t.lower()
        if 'ally' in tl and 'enemy' in tl:
            ladder={}; start_tier=0
            for k,v in REL.findall(inner):
                lv=parse_level(k)
                if lv is None: continue
                vt=clean(v); ladder[str(lv)]=vt
                if 'default' in vt.lower(): start_tier=lv
            rec["rei_track"]={"start":TIER2BAR.get(start_tier,0),"start_tier":start_tier,"ladder":ladder}
        elif tl in ('relationships','starting relationships'):
            for k,v in REL.findall(inner):
                oid=name2id(k)
                if not oid or oid==sid: continue
                vt=clean(v)
                m=re.match(r'([+-])?\s*(\d)',vt)
                if m:
                    n=int(m.group(2)); tier=-n if m.group(1)=='-' else n
                else:
                    low=vt.lower()
                    if ('brother' in low) or ('whole reason' in low) or ('everything' in low and 'for him' in low):
                        tier=3
                    elif 'in love' in low:
                        tier=3
                    elif 'best friend' in low:
                        tier=2
                    elif any(w in low for w in ('mentor','thirty year','forty year','shaped','decades','years')):
                        tier=2
                    elif any(w in low for w in ('hostile','enemy','distrust','despis','hunts','threat to')):
                        tier=-2
                    else:
                        tier=1
                rec["ties"][oid]={"value":TIER2BAR.get(tier,33),"tier":tier,"note":vt[:120],"source":"authored"}
# Build Rei ties from everyone's rei_track.start
rei=data.setdefault('rei',{"name":"Uedera Rei","rei_track":None,"ties":{}})
for sid,rec in data.items():
    if sid=='rei': continue
    rt=rec.get("rei_track")
    if rt:
        rei["ties"].setdefault(sid,{"value":rt["start"],"tier":rt["start_tier"],"note":"(Rei track start)","source":"rei_track"})
        rec["ties"].setdefault('rei',{"value":rt["start"],"tier":rt["start_tier"],"note":"(Rei track start)","source":"rei_track"})
# Reconcile bidirectional: mirror missing reverse ties
ids=list(data.keys())
for a in ids:
    for b,info in list(data[a]["ties"].items()):
        if b in data and a not in data[b]["ties"]:
            data[b]["ties"][a]={"value":info["value"],"tier":info["tier"],"note":"(mirrored) "+info["note"],"source":"mirrored"}
dst=os.path.join(HERE,'content','registry','relationships.json')
json.dump(data,open(dst,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
tot=sum(len(r["ties"]) for r in data.values())
withtrack=sum(1 for r in data.values() if r["rei_track"])
print(f"wrote {dst}")
print(f"characters: {len(data)} | with Rei-track: {withtrack} | total ties: {tot}")
# samples
for sid in ['gin','daiki','nakamura_aoi','katagiri_noa']:
    r=data.get(sid,{})
    print(f"\n{sid}: rei_start={r.get('rei_track',{}) and r['rei_track']['start'] if r.get('rei_track') else 'n/a'} ties={len(r.get('ties',{}))}")
    for o,i in list(r.get('ties',{}).items())[:6]:
        print(f"   {o:16} {i['value']:+4}  {i['source']:8} {i['note'][:50]}")
