import re,sys,base64,io,html,os
from PIL import Image
IMG='/home/claude/veil-protocol-game/images/'
V3='/home/claude/out/v3/'
LBL={'en':{'ch':'Chapter','lang':'English','listen':'Listen','pause':'Pause','stop':'Stop','speed':'Speed','voice':'Voice','tap':'Tap a sentence to start reading from there','title':'Veil Protocol'},
     'pt':{'ch':'Capítulo','lang':'Português','listen':'Ouvir','pause':'Pausar','stop':'Parar','speed':'Velocidade','voice':'Voz','tap':'Toque numa frase para ler a partir dali','title':'Veil Protocol'}}
imgcache={}
def img64(f):
    if f not in imgcache:
        im=Image.open(IMG+f).convert('RGB'); im.thumbnail((900,900)); b=io.BytesIO(); im.save(b,'JPEG',quality=70)
        imgcache[f]=base64.b64encode(b.getvalue()).decode()
    return imgcache[f]
SPLIT=re.compile(r'(?<=[.!?…])(["”\'*]*)\s+(?=\S)')
def sentences(p):
    out=[];last=0
    for m in SPLIT.finditer(p):
        end=m.start()+len(m.group(1)); out.append(p[last:end]); last=m.end()
    out.append(p[last:]); return [s for s in (x.strip() for x in out) if s]
def render_sentence(s,ital):
    spoken=[]; parts=[]; off=0
    for w in s.split(' '):
        if not w: continue
        clean=w.replace('*','')
        starts=w.startswith('*')
        if starts: ital=True
        cls='w i' if ital else 'w'
        if '*' in w[1:]: ital=False
        if clean:
            parts.append(f'<span class="{cls}" data-o="{off}">{html.escape(clean)}</span>')
            spoken.append(clean); off+=len(clean)+1
    text=' '.join(spoken)
    return f'<span class="s" data-t="{html.escape(text,quote=True)}">'+' '.join(parts)+'</span>',ital
def render_para(p,tag='p',cls=''):
    ital=False; segs=[]
    for s in sentences(p):
        h,ital=render_sentence(s,ital); segs.append(h)
    c=f' class="{cls}"' if cls else ''
    return f'<{tag}{c}>'+' '.join(segs)+f'</{tag}>'
def parse(path):
    t=open(path).read().split('\n'); title=t[0][7:].strip(); i=1
    if len(t)>1 and t[1].startswith('#part'): i=2
    body=[]; para=[]
    def flush():
        if para: body.append(render_para(' '.join(para).strip())); para.clear()
    while i<len(t):
        l=t[i]
        if l.startswith('[img'):
            flush(); f,cap=[x.strip() for x in l[4:-1].split('|')]
            if os.path.exists(IMG+f): img64(f); body.append(f'<figure><img data-img="{f}" alt="{html.escape(cap)}"><figcaption>{html.escape(cap)}</figcaption></figure>')
        elif l.startswith('[need'): flush()
        elif l.startswith('[break'):
            flush(); body.append(render_para(l[6:-1].strip(),'h3'))
        elif l.startswith('[doc'):
            flush(); h=l[4:-1].strip(); lines=[]; i+=1
            while not t[i].startswith('[/doc]'):
                if t[i].strip(): lines.append(t[i])
                i+=1
            inner=(render_para(h,'div','dt') if h else '')+''.join(render_para(x) for x in lines)
            body.append('<div class="doc">'+inner+'</div>')
        elif l.strip()=='': flush()
        else: para.append(l)
        i+=1
    flush(); return title,''.join(body)
ids=sys.argv[2:]; secs={'en':[],'pt':[]}
for n,cid in enumerate(ids,1):
    for lg,path in (('en',V3+cid+'.txt'),('pt',V3+'pt/'+cid+'.txt')):
        if not os.path.exists(path): path=V3+cid+'.txt'
        ti,b=parse(path)
        secs[lg].append(f'<section id="{lg}-c{n}"><div class="num">{LBL[lg]["ch"]} {n}</div>{render_para(ti,"h2")}{b}</section>')
JS=r'''
(function(){
var lang='pt';try{lang=localStorage.getItem('vp-lang')||'pt'}catch(e){}
var synth=window.speechSynthesis,queue=[],qi=0,playing=false,paused=false,rate=1,curU=null,timer=null,gotBoundary=false;
try{rate=parseFloat(localStorage.getItem('vp-rate'))||1}catch(e){}
function $(s){return document.querySelector(s)}
function setLang(l){lang=l;document.documentElement.lang=l==='pt'?'pt-BR':'en';
 document.querySelectorAll('.book').forEach(function(b){b.hidden=b.dataset.lang!==l});
 document.querySelectorAll('[data-l]').forEach(function(e){e.textContent=e.dataset[l]});
 document.querySelectorAll('.lg button').forEach(function(b){b.classList.toggle('on',b.dataset.v===l)});
 try{localStorage.setItem('vp-lang',l)}catch(e){} stop(); fillVoices();}
var FEM=/luciana|francisca|thalita|fernanda|maria|vit[oó]ria|raquel|helena|leila|camila|yara|brenda|elza|giovanna|manuela|leticia|samantha|karen|moira|tessa|fiona|serena|kate|susan|hazel|libby|sonia|ava|allison|zira|aria|jenny|emma|female|mulher|feminin|martha|catherine|victoria|joanna|nicky|zoe|amy|olivia/i;
var MAS=/felipe|antonio|ant[oô]nio|daniel|ricardo|diego|f[aá]bio|julio|donato|humberto|nicolau|valerio|alex|fred|tom\b|oliver|arthur|george|ryan|guy|eric|david|mark|thomas|rishi|male|homem|masculin|aaron|gordon|lee|reed|rocko|grandpa/i;
function norm(l){return (l||'').replace('_','-').toLowerCase()}
function langVoices(){var vs=synth?synth.getVoices():[];var want=lang==='pt'?'pt-br':'en-gb';var base=lang==='pt'?'pt':'en';
 var exact=vs.filter(function(v){return norm(v.lang)===want});
 if(lang==='en'){var us=vs.filter(function(v){return norm(v.lang)==='en-us'});exact=exact.concat(us)}
 if(exact.length)return exact;
 if(lang==='pt')return vs.filter(function(v){return norm(v.lang).indexOf('pt')===0&&norm(v.lang)!=='pt-pt'}).concat(vs.filter(function(v){return norm(v.lang)==='pt-pt'}));
 return vs.filter(function(v){return norm(v.lang).indexOf(base)===0})}
function quality(v){var n=v.name;var q=0;if(/natural|neural|online|premium|enhanced|siri/i.test(n))q+=4;if(/google/i.test(n))q+=2;if(v.localService===false)q+=1;if(/compact|eloquence|novelty/i.test(n))q-=4;return q}
function genderOf(v){var n=v.name;if(MAS.test(n))return 'm';if(FEM.test(n))return 'f';if(/google (português|portugues)/i.test(n))return 'f';return '?'}
var gender='f';try{gender=localStorage.getItem('vp-gender')||'f'}catch(e){}
function fillVoices(){document.querySelectorAll('.gd button[data-g]').forEach(function(b){b.classList.toggle('on',b.dataset.g===gender)});var w=$('#vwarn');if(!w)return;var vs=langVoices();w.hidden=!(synth&&synth.getVoices().length&&!vs.some(function(v){return lang!=='pt'||norm(v.lang)==='pt-br'}));}
function pool(){var vs=langVoices();var g=vs.filter(function(v){return genderOf(v)===gender});var p=g.length?g:vs.filter(function(v){return genderOf(v)==='?'}).concat(vs.filter(function(v){return genderOf(v)!=='?'}));p.sort(function(a,b){return quality(b)-quality(a)});return p}
function pickVoice(){var p=pool();if(!p.length)return null;var keep=null;try{keep=localStorage.getItem('vp-v-'+lang+'-'+gender)}catch(e){}var v=p.find(function(x){return x.name===keep})||p[0];var n=$('#vname');if(n)n.textContent=(lang==='pt'?'Voz: ':'Voice: ')+v.name+' ('+v.lang+')';return v}
function nextVoice(){var p=pool();if(!p.length)return;var cur=pickVoice();var i=p.indexOf(cur);var v=p[(i+1)%p.length];try{localStorage.setItem('vp-v-'+lang+'-'+gender,v.name)}catch(e){}pickVoice();if(playing&&!paused)startAt(queue[qi])}
function clearMarks(){document.querySelectorAll('.s.reading').forEach(function(e){e.classList.remove('reading')});document.querySelectorAll('.w.read').forEach(function(e){e.classList.remove('read')})}
function sents(){return Array.prototype.slice.call(document.querySelectorAll('.book[data-lang="'+lang+'"] .s'))}
function markUpTo(s,ci){s.querySelectorAll('.w').forEach(function(w){if(+w.dataset.o<=ci)w.classList.add('read')})}
function speakNext(){clearInterval(timer);if(qi>=queue.length){stop();return}
 var s=queue[qi];document.querySelectorAll('.s.reading').forEach(function(e){e.classList.remove('reading')});s.classList.add('reading');
 var r=s.getBoundingClientRect();if(r.top<90||r.bottom>innerHeight-90)s.scrollIntoView({block:'center',behavior:'smooth'});
 var u=new SpeechSynthesisUtterance(s.dataset.t);u.lang=lang==='pt'?'pt-BR':'en-GB';var v=pickVoice();if(v)u.voice=v;u.rate=rate;curU=u;gotBoundary=false;
 u.onboundary=function(e){if(e.name&&e.name!=='word')return;gotBoundary=true;markUpTo(s,e.charIndex)};
 u.onstart=function(){var t0=Date.now(),len=s.dataset.t.length;timer=setInterval(function(){if(gotBoundary){clearInterval(timer);return}var ci=(Date.now()-t0)/1000*14*rate;markUpTo(s,ci);if(ci>len)clearInterval(timer)},120)};
 u.onend=function(){if(curU!==u)return;clearInterval(timer);markUpTo(s,1e9);qi++;if(playing&&!paused)speakNext()};
 u.onerror=function(){if(curU!==u)return;clearInterval(timer);qi++;if(playing&&!paused)speakNext()};
 synth.speak(u)}
function startAt(el){if(!synth){alert('Este navegador não tem leitura em voz alta.');return}if(!synth.getVoices().length){synth.onvoiceschanged=function(){fillVoices();startAt(el)};synth.getVoices();return}synth.cancel();clearMarks();var all=sents();var i=el?all.indexOf(el):-1;
 if(i<0){i=all.findIndex(function(s){return s.getBoundingClientRect().bottom>80});if(i<0)i=0}
 queue=all;qi=i;playing=true;paused=false;document.body.classList.add('playing');updBtn();speakNext()}
function stop(){playing=false;paused=false;curU=null;clearInterval(timer);if(synth)synth.cancel();clearMarks();document.body.classList.remove('playing');updBtn()}
function toggle(){if(!playing){startAt(null);return}if(paused){paused=false;synth.resume();if(!synth.speaking)speakNext()}else{paused=true;synth.pause()}updBtn()}
function updBtn(){var b=$('#play');var l=LBL[lang];b.textContent=(!playing||paused)?'▶ '+l.listen:'❚❚ '+l.pause;b.classList.toggle('on',playing&&!paused)}
var LBL=__LBL__;
document.addEventListener('click',function(e){var s=e.target.closest('.s');if(s&&document.body.classList.contains('playing')){startAt(s)}});
document.querySelectorAll('.lg button').forEach(function(b){b.onclick=function(){setLang(b.dataset.v)}});
$('#play').onclick=toggle;$('#stopb').onclick=stop;
document.querySelectorAll('.rate button').forEach(function(b){b.classList.toggle('on',+b.dataset.r===rate);b.onclick=function(){rate=+b.dataset.r;try{localStorage.setItem('vp-rate',rate)}catch(e){}document.querySelectorAll('.rate button').forEach(function(x){x.classList.toggle('on',x===b)});if(playing&&!paused)startAt(queue[qi])}});
document.querySelectorAll('.gd button[data-g]').forEach(function(b){b.onclick=function(){gender=b.dataset.g;try{localStorage.setItem('vp-gender',gender)}catch(e){}fillVoices();if(playing&&!paused)startAt(queue[qi])}});
if(synth){synth.onvoiceschanged=fillVoices}$('#nextv').onclick=nextVoice;
setLang(lang);
})();
'''
import json
JS=JS.replace('__LBL__',json.dumps(LBL,ensure_ascii=False))
def lbl(k): return f'data-l="" data-en="{html.escape(LBL["en"][k])}" data-pt="{html.escape(LBL["pt"][k])}"'
page=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Veil Protocol</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
:root{{--bg:#fffdf8;--fg:#1d1a16;--mut:#6f6658;--acc:#8a5a12;--acc2:#b8860b;--line:#e8e0cf;--hl:#fff1b8;--hl2:#ffd84d}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:20px/1.62 "Crimson Pro",Georgia,serif}}
.bar{{position:sticky;top:0;z-index:10;background:rgba(255,253,248,.96);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);padding:8px 12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center}}
.bar button,.bar select{{font:600 15px/1 system-ui,sans-serif;border:1.5px solid var(--acc2);background:#fff;color:var(--acc);border-radius:20px;padding:9px 14px;cursor:pointer}}
.bar button.on{{background:var(--hl2);border-color:var(--acc2);color:#3a2a00}}
.lg,.rate,.gd{{display:flex;gap:4px}}#vwarn{{display:block;color:#a33}}#vwarn[hidden]{{display:none}}.rate button{{padding:9px 10px}}
.bar select{{max-width:150px;padding:8px 10px}}
#stopb{{display:none}}body.playing #stopb{{display:inline-block}}
.extra{{display:none;width:100%;justify-content:center;gap:8px;flex-wrap:wrap}}body.playing .extra{{display:flex}}
.hint{{width:100%;text-align:center;font:13px system-ui,sans-serif;color:var(--mut);display:none}}body.playing .hint{{display:block}}
main{{max-width:660px;margin:0 auto;padding:24px 18px 120px}}
section{{padding:36px 0 56px;border-bottom:1px solid var(--line)}}
.num{{text-align:center;color:var(--acc);font-style:italic;margin-top:10px}}
h2{{font:600 30px/1.2 Cinzel,serif;text-align:center;margin:6px 0 34px}}
h3{{font:600 15px/1.35 Cinzel,serif;letter-spacing:.08em;text-align:center;color:var(--acc);margin:40px 0 20px}}
p{{margin:0;text-indent:1.6em;text-align:justify;hyphens:auto}}
figure{{margin:1.6em auto;width:78%}}figure img{{width:100%;height:auto;display:block;border-radius:3px}}figcaption{{font-size:15px;color:var(--mut);text-align:center;font-style:italic;margin-top:6px}}
.doc{{border-left:3px solid var(--acc2);background:#fbf5e6;padding:12px 14px 12px 16px;margin:1.3em 0;font-style:italic;border-radius:0 6px 6px 0}}
.doc p{{text-indent:1.2em}}.dt{{font:600 12px/1.4 Cinzel,serif;font-style:normal;letter-spacing:.1em;color:var(--acc);margin-bottom:8px}}
.w.i{{font-style:italic}}.doc .w.i{{font-style:normal}}
.s{{border-radius:3px;transition:background .15s}}.s.reading{{background:var(--hl)}}.w.read{{background:var(--hl2);box-shadow:5px 0 0 var(--hl2)}}
body.playing .s{{cursor:pointer}}
@media(max-width:480px){{body{{font-size:19px}}main{{padding:16px 16px 120px}}h2{{font-size:25px}}figure{{width:92%}}p{{text-align:left}}}}
</style></head><body>
<div class="bar">
 <div class="lg"><button data-v="pt">PT-BR</button><button data-v="en">EN</button></div>
 <button id="play">▶ Ouvir</button><button id="stopb" {lbl('stop')}>Parar</button>
 <div class="extra"><div class="rate"><button data-r="0.85">0.85×</button><button data-r="1">1×</button><button data-r="1.2">1.2×</button><button data-r="1.4">1.4×</button></div><div class="gd"><button data-g="f" data-l="" data-en="Female voice" data-pt="Voz feminina">Voz feminina</button><button data-g="m" data-l="" data-en="Male voice" data-pt="Voz masculina">Voz masculina</button><button id="nextv" data-l="" data-en="Other voice" data-pt="Outra voz">Outra voz</button></div><div class="hint" id="vname"></div></div>
 <div class="hint" id="vwarn" hidden data-l="" data-en="This device has no British or American voice installed." data-pt="Este aparelho não tem voz em português do Brasil instalada. Instale uma nas configurações de fala do sistema.">Este aparelho não tem voz em português do Brasil instalada.</div><div class="hint" {lbl('tap')}>Toque numa frase para ler a partir dali</div>
</div>
<main><div class="book" data-lang="pt">{''.join(secs['pt'])}</div><div class="book" data-lang="en" hidden>{''.join(secs['en'])}</div></main>
<script>var IMGS={json.dumps(imgcache)};document.querySelectorAll('img[data-img]').forEach(function(i){{i.src='data:image/jpeg;base64,'+IMGS[i.dataset.img]}});</script><script>{JS}</script></body></html>'''
open(sys.argv[1],'w').write(page)
print('ok',len(page)//1024,'KB')
