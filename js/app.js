/* ===============================================================
 * LA PUERTA ABIERTA — lógica de render e interacción
 * Autor: Emir Segovia · 2025
 * =============================================================== */

function renderVersiculos(){
  const g=document.getElementById('vg');
  g.innerHTML='';
  const orden=[];
  VS.forEach(v=>{if(orden.indexOf(v.a)===-1)orden.push(v.a);});
  orden.forEach(cat=>{
    const items=VS.filter(v=>v.a===cat);
    const color=items[0].c;
    const cards=items.map(v=>'<div class="vc" style="--ac:'+v.c+'"><div class="vt">"'+v.t+'"</div><div class="vr">— '+v.r+'</div><div class="vx">'+v.x+'</div></div>').join('');
    const c=document.createElement('div');
    c.className='mc';
    c.innerHTML='<div class="mh" onclick="togM(this)"><span class="tdot" style="background:'+color+'"></span><span class="mn">'+cat+'</span><span style="font-size:12.5px;color:var(--text3)">'+items.length+'</span><span class="mchev">▼</span></div><div class="mb"><div class="vg" style="margin-top:2px">'+cards+'</div></div>';
    g.appendChild(c);
  });
}
let lista=[...CARDS],idx=0;
function st(t,btn){document.querySelectorAll('#md .fbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');lista=t==='todos'?[...CARDS]:CARDS.filter(c=>c.tema===t);idx=0;sc();}
function sc(){const c=lista[idx];document.getElementById('card').classList.remove('flipped');['flabel','blabel'].forEach(id=>{document.getElementById(id).textContent=c.l;document.getElementById(id).style.cssText='background:'+c.c+'22;color:'+c.c+';border:1px solid '+c.c+'44;';});document.getElementById('fq').innerHTML=c.q;document.getElementById('fa').innerHTML=c.a;document.getElementById('fhint').textContent=c.h||'';document.getElementById('prog').textContent=(idx+1)+' / '+lista.length;document.getElementById('prev').disabled=idx===0;document.getElementById('next').disabled=idx===lista.length-1;}
function flip(){document.getElementById('card').classList.toggle('flipped');}
function nav(d){idx=Math.max(0,Math.min(lista.length-1,idx+d));sc();}
function shu(){for(let i=lista.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lista[i],lista[j]]=[lista[j],lista[i]];}idx=0;sc();}
function renderLiturgia(){const g=document.getElementById('lg');LITURGIA.forEach(t=>{const c=document.createElement('div');c.className='tc';const fh=t.fechas.map(f=>'<div class="fi"><div class="fd">'+f.d+'</div><div class="fn">'+f.n+'</div><div class="fnota">'+f.nota+'</div></div>').join('');c.innerHTML='<div class="th" onclick="tog(this)"><span class="tdot" style="background:'+t.color+'"></span><span class="ttit">'+t.n+'</span><span class="tdesc">'+t.d+'</span><span class="tchev">▼</span></div><div class="tb"><div class="ti">'+t.i+'</div><div style="font-family:var(--font-title);font-size:11.5px;color:var(--gold);letter-spacing:2px;margin-bottom:10px;text-transform:uppercase">✦ Color litúrgico: '+t.cl+'</div><div class="fg">'+fh+'</div></div>';g.appendChild(c);});}
function tog(h){const b=h.nextElementSibling;const ch=h.querySelector('.tchev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}
function renderOraciones(){const g=document.getElementById('og');ORACIONES.forEach(o=>{const c=document.createElement('div');c.className='oc';c.innerHTML='<div class="oh" onclick="togO(this)"><span style="color:var(--gold);font-size:16px">✝</span><span class="otit">'+o.t+'</span><span class="otype">'+o.tp+'</span><span class="ochev">▼</span></div><div class="ob"><div class="otxt">'+o.tx+'</div><div class="oorig">— '+o.o+'</div></div>';g.appendChild(c);});}
function togO(h){const b=h.nextElementSibling;const ch=h.querySelector('.ochev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}
function renderSantosGaleria(){
  const g=document.getElementById('santosGaleria');
  if(!g)return;
  g.innerHTML='';
  SANTOS_DESTACADOS.forEach(s=>{
    const c=document.createElement('div');
    c.className='santo-flip';
    c.setAttribute('role','button');
    c.setAttribute('tabindex','0');
    c.setAttribute('aria-label','Tarjeta de '+s.nombre+'. Tocar para ver su historia.');
    c.innerHTML='<div class="santo-flip-inner">'
      +'<div class="santo-cara santo-frente" style="background-image:url(\''+s.img+'\')"><div class="santo-frente-overlay"><div class="santo-frente-nombre">'+s.nombre+'</div><div class="santo-frente-sub">'+s.sub+'</div></div></div>'
      +'<div class="santo-cara santo-dorso"><div class="santo-dorso-nombre">'+s.nombre+'</div><div class="santo-dorso-oracion">'+s.oracion+'</div><div class="santo-dorso-bio">'+s.bio+'</div></div>'
      +'</div>';
    c.addEventListener('click',()=>c.classList.toggle('flipped'));
    c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('flipped');}});
    g.appendChild(c);
  });
}
function renderSantos(){const g=document.getElementById('sag');SANTOS.forEach(m=>{const c=document.createElement('div');c.className='mc';const sh=m.s.map(s=>'<div class="si"><span class="sd">'+s.d+'</span><div><div class="sn">'+s.n+'</div><div class="snota">'+s.nota+'</div></div></div>').join('');c.innerHTML='<div class="mh" onclick="togM(this)"><span style="color:var(--gold);font-size:14px">✦</span><span class="mn">'+m.m+'</span><span style="font-size:12.5px;color:var(--text3)">'+m.s.length+' santos</span><span class="mchev">▼</span></div><div class="mb">'+sh+'</div>';g.appendChild(c);});}
function togM(h){const b=h.nextElementSibling;const ch=h.querySelector('.mchev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}
function renderSalmos(){const g=document.getElementById('slg');SALMOS.forEach(s=>{const c=document.createElement('div');c.className='slc';c.innerHTML='<div class="slh" onclick="togS(this)"><span class="slnum">'+s.num+'</span><span class="sltit">'+s.t+'</span><span class="slsit">'+s.s+'</span><span class="slchev">▼</span></div><div class="slb"><div class="sltxt">'+s.tx+'</div></div>';g.appendChild(c);});}
function togS(h){const b=h.nextElementSibling;const ch=h.querySelector('.slchev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}
function togSec(h){const body=h.nextElementSibling;const isOpen=body.classList.toggle('open');h.classList.toggle('open',isOpen);}

function goTo(id){
  const sec=document.getElementById(id);
  const head=sec.querySelector('.sec-head');
  const body=sec.querySelector('.sec-body');
  if(head&&body&&!body.classList.contains('open')){
    body.classList.add('open');
    head.classList.add('open');
  }
  sec.scrollIntoView({behavior:'smooth',block:'start'});
  document.querySelectorAll('.tabbtn').forEach(b=>b.classList.toggle('on',b.dataset.screen===id));
}

function initScrollSpy(){
  const main=document.getElementById('mainScroll');
  const secs=Array.prototype.slice.call(document.querySelectorAll('.sec'));
  if(!('IntersectionObserver' in window)||!main||!secs.length)return;
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        document.querySelectorAll('.tabbtn').forEach(b=>b.classList.toggle('on',b.dataset.screen===e.target.id));
      }
    });
  },{root:main,rootMargin:'-35% 0px -55% 0px',threshold:0});
  secs.forEach(s=>obs.observe(s));
}
renderVersiculos();sc();renderLiturgia();renderOraciones();renderSantosGaleria();renderSantos();renderSalmos();initScrollSpy();

// Expose to global scope
window.togSec=togSec;
window.renderVersiculos=renderVersiculos;
window.renderSantosGaleria=renderSantosGaleria;
window.st=st;
window.sc=sc;
window.flip=flip;
window.nav=nav;
window.shu=shu;
window.renderLiturgia=renderLiturgia;
window.tog=tog;
window.renderOraciones=renderOraciones;
window.togO=togO;
window.renderSantos=renderSantos;
window.togM=togM;
window.renderSalmos=renderSalmos;
window.togS=togS;
window.goTo=goTo;
