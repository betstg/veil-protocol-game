#!/usr/bin/env python3
# Bundles the engine template + all content modules into one self-contained
# veil-protocol-play-v2.html (instant web-play, single file, works over file:// and http).
# Author content in content/**/*.js as Object.assign(window.VP.*, {...}); run this to rebuild.
import os,glob,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
eng=open(os.path.join(ROOT,'engine','veil-engine.html'),encoding='utf-8').read()
# deterministic load order: scenes, lore, then actions (all are order-independent Object.assigns)
order=['content/scenes','content/lore','content/actions','content/romance','content/phone','content/combat']
mods=[]
for d in order:
    for f in sorted(glob.glob(os.path.join(ROOT,d,'*.js'))):
        mods.append(f)
# any other content/*.js not in the ordered dirs
for f in sorted(glob.glob(os.path.join(ROOT,'content','**','*.js'),recursive=True)):
    if f not in mods and 'registry' not in f: mods.append(f)
parts=['window.VP={scenes:{},actions:{},branchText:{},npc:{},romance:{},phone:{},combat:{}};']
for f in mods:
    rel=os.path.relpath(f,ROOT)
    parts.append(f'/* ===== {rel} ===== */')
    parts.append(open(f,encoding='utf-8').read())
bundle='<script>\n'+'\n'.join(parts)+'\n</script>'
out=eng.replace('<!--VP:CONTENT-->',bundle)
dest=os.path.join(ROOT,'veil-protocol-play-v2.html')
open(dest,'w',encoding='utf-8').write(out)
# also place a copy beside the workspace root for local opening
alt=os.path.join(os.path.dirname(ROOT),'veil-protocol-play-v2.html')
open(alt,'w',encoding='utf-8').write(out)
print(f'Bundled {len(mods)} content modules -> single-file game')
for f in mods: print('  +',os.path.relpath(f,ROOT))
print('size:',len(out),'chars')
print('wrote:',dest)
print('wrote:',alt)
