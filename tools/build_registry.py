#!/usr/bin/env python3
"""Single source of truth = the book. Parse every <div class="vsheet" data-id>
and emit content/registry/characters.gen.json (id-keyed, numbered relationships)
for the game engine + AI Warden. Sheets not yet migrated keep their old JSON entry."""
import re,json,sys,os
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK=os.path.join(HERE,'veil-protocol-book.html')
h=open(BOOK,encoding='utf-8').read()
tag=re.compile(r'<(/?)div\b')
def balanced(i):
    d=0;j=i
    while True:
        m=tag.search(h,j)
        if not m:return len(h)
        if m.group(1)=='':d+=1
        else:
            d-=1
            if d==0:return h.find('>',m.start())+1
        j=m.end()
def strip(t): return re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',t)).strip()
out=[]
for m in re.finditer(r'<div class="vsheet(?: entity)?"([^>]*)>',h):
    attrs=m.group(1)
    did=re.search(r'data-id="([^"]*)"',attrs)
    if not did: continue
    e=balanced(m.start()); block=h[m.start():e]
    name=re.search(r'class="vs-name">(.*?)</div>',block,re.S)
    sub=re.search(r'class="vs-sub">(.*?)</div>',block,re.S)
    rels=[]
    for rm in re.finditer(r'<div class="vs-rel" data-with="([^"]*)" data-rel="(-?\d+)"><span class="nm">(.*?)</span>',block,re.S):
        rels.append({"with":rm.group(1),"value":int(rm.group(2)),"who":strip(rm.group(3))})
    q=re.search(r'class="vs-qtitle">.*?(?:</span>)?([^<]*)</div>',block,re.S)
    rec={"id":did.group(1),"name":strip(name.group(1)) if name else "",
         "sub":strip(sub.group(1)) if sub else "",
         "entity":'data-entity="1"' in attrs,
         "romanceable":'data-romanceable="1"' in attrs,
         "relationships":rels}
    comp=re.search(r'class="vs-comp".*?class="sp">(.*?)<span class="tag">(.*?)</span>',block,re.S)
    if comp: rec["companion"]={"name":strip(comp.group(1)),"species":strip(comp.group(2))}
    out.append(rec)
dst=os.path.join(HERE,'content','registry','characters.gen.json')
json.dump(out,open(dst,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(f"extracted {len(out)} migrated sheets -> {dst}")
for r in out:
    print(f"  {r['id']:14} rels:{len(r['relationships']):2} romance:{int(r['romanceable'])} entity:{int(r['entity'])}")
