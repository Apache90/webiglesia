/* ===============================================================
 * LA PUERTA ABIERTA — lógica de render e interacción
 * Autor: Emir Segovia · 2025
 * =============================================================== */

/* ---------- Calendario litúrgico (calculado, sin fechas fijas) ----------
 * Domingo de Pascua vía algoritmo de Meeus/Jones/Butcher (calendario
 * gregoriano). A partir de ahí se derivan Ceniza, Semana Santa, Pascua,
 * Adviento, etc. El ciclo dominical (A/B/C) y ferial (I/II) del
 * Leccionario se calculan según el año litúrgico vigente.
 * ---------------------------------------------------------------- */
function easterDate(year){
  const a=year%19,b=Math.floor(year/100),c=year%100;
  const d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4;
  const l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
}
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r;}
function sameDate(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function nextSundayOnOrAfter(d){const day=d.getDay();return addDays(d,(7-day)%7);}
function nextSundayStrictlyAfter(d){const day=d.getDay();return addDays(d,day===0?7:7-day);}
function adventStart(year){return nextSundayOnOrAfter(new Date(year,10,27));}
function baptismOfLord(year){
  const jan6=new Date(year,0,6);
  if(jan6.getDay()===0)return addDays(jan6,1);
  return nextSundayStrictlyAfter(jan6);
}
function cicloDominical(refYear){return ['A','B','C'][(refYear-1)%3];}
function cicloFerial(refYear){return refYear%2===0?'II':'I';}

function getLiturgicalToday(baseDate){
  const now=baseDate?new Date(baseDate):new Date();
  const t=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const y=t.getFullYear();
  const eq=d=>sameDate(t,d);
  const between=(a,b)=>t>=a&&t<=b;

  const easterY=easterDate(y);
  const ashWedY=addDays(easterY,-46);
  const palmSundayY=addDays(easterY,-7);
  const holyThuY=addDays(easterY,-3);
  const goodFriY=addDays(easterY,-2);
  const holySatY=addDays(easterY,-1);
  const pentecostY=addDays(easterY,49);
  const laetareY=addDays(ashWedY,25);
  const adventY=adventStart(y);
  const gaudeteY=addDays(adventY,14);
  const christKingY=addDays(adventY,-7);
  const baptismY=baptismOfLord(y);
  const christmasY=new Date(y,11,25);

  let season='Tiempo Ordinario',color='#4a7a4a',colorNombre='Verde',detalle='';

  if(between(new Date(y,0,1),baptismY)){
    season='Navidad';color='#c9a84c';colorNombre='Blanco / Dorado';
    if(eq(new Date(y,0,1)))detalle='Santa María, Madre de Dios';
    if(eq(new Date(y,0,6)))detalle='Epifanía del Señor';
    if(eq(baptismY))detalle='Bautismo del Señor';
  }else if(t>baptismY&&t<ashWedY){
    season='Tiempo Ordinario';color='#4a7a4a';colorNombre='Verde';
  }else if(between(ashWedY,addDays(palmSundayY,-1))){
    season='Cuaresma';color='#6b3a6b';colorNombre='Morado';
    if(eq(ashWedY))detalle='Miércoles de Ceniza';
    if(eq(laetareY)){colorNombre='Rosa';detalle='4º Domingo de Cuaresma — Laetare';}
  }else if(between(palmSundayY,addDays(holyThuY,-1))){
    season='Semana Santa';color='#8b1a1a';colorNombre='Rojo';
    if(eq(palmSundayY))detalle='Domingo de Ramos';
  }else if(between(holyThuY,holySatY)){
    season='Triduo Pascual';color='#8b1a1a';colorNombre='Rojo / Blanco';
    if(eq(holyThuY))detalle='Jueves Santo — Cena del Señor';
    if(eq(goodFriY))detalle='Viernes Santo — Pasión del Señor';
    if(eq(holySatY))detalle='Sábado Santo — Vigilia Pascual';
  }else if(between(easterY,pentecostY)){
    season='Pascua';color='#c9a84c';colorNombre='Blanco / Dorado';
    if(eq(easterY))detalle='Domingo de Resurrección';
    if(eq(pentecostY))detalle='Pentecostés';
  }else if(t>pentecostY&&t<adventY){
    season='Tiempo Ordinario';color='#4a7a4a';colorNombre='Verde';
    if(eq(christKingY)){color='#c9a84c';colorNombre='Blanco';detalle='Nuestro Señor Jesucristo, Rey del Universo';}
  }else if(between(adventY,addDays(christmasY,-1))){
    season='Adviento';color='#4a5c8c';colorNombre='Morado';
    if(eq(gaudeteY)){colorNombre='Rosa';detalle='3º Domingo de Adviento — Gaudete';}
  }else if(t>=christmasY){
    season='Navidad';color='#c9a84c';colorNombre='Blanco / Dorado';
    if(eq(christmasY))detalle='Natividad del Señor';
  }

  const refYear=t>=adventY?y+1:y;

  return{fecha:t,season,color,colorNombre,detalle,cicloDom:cicloDominical(refYear),cicloFer:cicloFerial(refYear)};
}

function renderHoyLiturgico(){
  const el=document.getElementById('hoyLiturgico');
  if(!el)return;
  const info=getLiturgicalToday();
  const fechaTxt=info.fecha.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const fechaCap=fechaTxt.charAt(0).toUpperCase()+fechaTxt.slice(1);
  el.style.setProperty('--hoy-color',info.color);
  el.innerHTML=
    '<div class="hoy-fecha">'+fechaCap+'</div>'
    +'<div class="hoy-tiempo"><span class="hoy-dot" style="background:'+info.color+'"></span>'+info.season+'</div>'
    +'<div class="hoy-colorlit">Color litúrgico: '+info.colorNombre+(info.detalle?' · '+info.detalle:'')+'</div>'
    +'<div class="hoy-ciclos">Ciclo dominical <strong>'+info.cicloDom+'</strong> · Ciclo ferial <strong>'+info.cicloFer+'</strong></div>'
    +'<a class="hoy-cta" href="https://www.vaticannews.va/es/evangelio-de-hoy.html" target="_blank" rel="noopener">Leer las lecturas de hoy ↗</a>';
}

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
function ajustarAlturaCard(){
  const card=document.getElementById('card');
  if(!card)return;
  const front=card.querySelector('.front');
  const back=card.querySelector('.back');
  card.style.height='auto';
  const h=Math.max(front.scrollHeight,back.scrollHeight,200);
  card.style.height=h+'px';
}
function sc(){const c=lista[idx];document.getElementById('card').classList.remove('flipped');['flabel','blabel'].forEach(id=>{document.getElementById(id).textContent=c.l;document.getElementById(id).style.cssText='background:'+c.c+'22;color:'+c.c+';border:1px solid '+c.c+'44;';});document.getElementById('fq').innerHTML=c.q;document.getElementById('fa').innerHTML=c.a;document.getElementById('fhint').textContent=c.h||'';document.getElementById('prog').textContent=(idx+1)+' / '+lista.length;document.getElementById('prev').disabled=idx===0;document.getElementById('next').disabled=idx===lista.length-1;ajustarAlturaCard();}
function flip(){document.getElementById('card').classList.toggle('flipped');}
function nav(d){idx=Math.max(0,Math.min(lista.length-1,idx+d));sc();}
function shu(){for(let i=lista.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lista[i],lista[j]]=[lista[j],lista[i]];}idx=0;sc();}
function proximaOcurrencia(calcFn){
  const hoy=new Date();hoy.setHours(0,0,0,0);
  let d=calcFn(hoy.getFullYear());
  if(d<hoy)d=calcFn(hoy.getFullYear()+1);
  return d;
}
function formatoFechaLarga(d){
  const s=d.toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'});
  return s;
}
function fechasLiturgicasProximas(){
  return{
    '{{FECHA_ADVIENTO}}':formatoFechaLarga(proximaOcurrencia(adventStart)),
    '{{FECHA_CENIZA}}':formatoFechaLarga(proximaOcurrencia(y=>addDays(easterDate(y),-46))),
    '{{FECHA_PASCUA}}':formatoFechaLarga(proximaOcurrencia(easterDate)),
    '{{FECHA_PENTECOSTES}}':formatoFechaLarga(proximaOcurrencia(y=>addDays(easterDate(y),49))),
  };
}
function renderLiturgia(){
  const g=document.getElementById('lg');
  const reemplazos=fechasLiturgicasProximas();
  const sub=s=>s.replace(/\{\{\w+\}\}/g,m=>reemplazos[m]!==undefined?reemplazos[m]:m);
  LITURGIA.forEach(t=>{
    const c=document.createElement('div');
    c.className='tc';
    const fh=t.fechas.map(f=>'<div class="fi"><div class="fd">'+f.d+'</div><div class="fn">'+f.n+'</div><div class="fnota">'+sub(f.nota)+'</div></div>').join('');
    c.innerHTML='<div class="th" onclick="tog(this)"><span class="tdot" style="background:'+t.color+'"></span><span class="ttit">'+t.n+'</span><span class="tdesc">'+t.d+'</span><span class="tchev">▼</span></div><div class="tb"><div class="ti">'+t.i+'</div><div style="font-family:var(--font-title);font-size:11.5px;color:var(--gold);letter-spacing:2px;margin-bottom:10px;text-transform:uppercase">✦ Color litúrgico: '+t.cl+'</div><div class="fg">'+fh+'</div></div>';
    g.appendChild(c);
  });
}
function tog(h){const b=h.nextElementSibling;const ch=h.querySelector('.tchev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}
function renderOraciones(){const g=document.getElementById('og');ORACIONES.forEach(o=>{const c=document.createElement('div');c.className='oc';c.innerHTML='<div class="oh" onclick="togO(this)"><span style="color:var(--gold);font-size:16px">✝</span><div class="oinfo"><span class="otit">'+o.t+'</span><span class="otype">'+o.tp+'</span></div><span class="ochev">▼</span></div><div class="ob"><div class="otxt">'+o.tx+'</div><div class="oorig">— '+o.o+'</div></div>';g.appendChild(c);});}
function togO(h){const b=h.nextElementSibling;const ch=h.querySelector('.ochev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}

/* ---------- El Rosario ---------- */
const NUMEROS_ORDINALES=['1er','2°','3er','4°','5°'];

function claveMisterioHoy(){
  const dia=new Date().getDay();
  for(const k in MISTERIOS_ROSARIO){if(MISTERIOS_ROSARIO[k].dias.indexOf(dia)!==-1)return k;}
  return 'gozosos';
}
function textoOracion(titulo){const o=ORACIONES.find(x=>x.t===titulo);return o?o.tx:'';}

function generarPasosRosario(clave){
  const m=MISTERIOS_ROSARIO[clave];
  const pasos=[];
  pasos.push({tipo:'cruz',decada:0,bead:'cruz-inicial',titulo:'Señal de la Cruz',oracionT:'Señal de la Cruz'});
  pasos.push({tipo:'ofrecimiento',decada:0,bead:'cruz-inicial',titulo:'Ofrecimiento del Rosario',oracionT:'Ofrecimiento del Rosario'});
  pasos.push({tipo:'credo',decada:0,bead:'cruz-inicial',titulo:'Credo',oracionT:'Credo Apostólico'});
  pasos.push({tipo:'grande',decada:0,bead:'pn-inicial',titulo:'Padre Nuestro',oracionT:'Padre Nuestro'});
  const virtudes=['por la Fe','por la Esperanza','por la Caridad'];
  for(let n=1;n<=3;n++){pasos.push({tipo:'chica',decada:0,n:n,total:3,bead:'am-inicial-'+n,titulo:'Ave María '+n+' de 3 — '+virtudes[n-1],oracionT:'Ave María'});}
  pasos.push({tipo:'gloria',decada:0,grande:true,bead:'gloria-inicial',titulo:'Gloria',oracionT:'Gloria al Padre'});
  for(let d=0;d<5;d++){
    const dec=d+1;
    const beadDecada='grande-loop-'+dec;
    pasos.push({tipo:'misterio',decada:dec,numero:dec,grande:true,bead:beadDecada,titulo:NUMEROS_ORDINALES[d]+' Misterio '+m.nombre,misterio:m.lista[d]});
    pasos.push({tipo:'grande',decada:dec,bead:beadDecada,titulo:'Padre Nuestro',oracionT:'Padre Nuestro'});
    for(let n=1;n<=10;n++){pasos.push({tipo:'chica',decada:dec,n:n,total:10,bead:'am'+dec+'-'+n,titulo:'Ave María '+n+' de 10',oracionT:'Ave María'});}
    if(dec<5){
      pasos.push({tipo:'gloria',decada:dec,grande:true,bead:'grande-loop-'+(dec+1),titulo:'Gloria',oracionT:'Gloria al Padre'});
      pasos.push({tipo:'fatima',decada:dec,grande:true,bead:'grande-loop-'+(dec+1),titulo:'Oh Jesús mío',oracionT:'Oh Jesús mío'});
    }else{
      pasos.push({tipo:'gloria',decada:dec,sinCuenta:true,titulo:'Gloria',oracionT:'Gloria al Padre'});
      pasos.push({tipo:'fatima',decada:dec,sinCuenta:true,titulo:'Oh Jesús mío',oracionT:'Oh Jesús mío'});
    }
  }
  pasos.push({tipo:'grande',decada:6,bead:'papa-pn',titulo:'Por las intenciones del Papa — Padre Nuestro',oracionT:'Padre Nuestro'});
  pasos.push({tipo:'chica',decada:6,n:1,total:1,bead:'papa-am',titulo:'Por las intenciones del Papa — Ave María',oracionT:'Ave María'});
  pasos.push({tipo:'gloria',decada:6,bead:'papa-gloria',titulo:'Por las intenciones del Papa — Gloria',oracionT:'Gloria al Padre'});
  pasos.push({tipo:'final',decada:6,bead:'salve',titulo:'Salve',oracionT:'Salve Regina'});
  pasos.push({tipo:'oracionFinal',decada:6,bead:'oracion-final',titulo:'Oración final',oracionT:'Oración final'});
  pasos.push({tipo:'cruzFinal',decada:6,bead:'cruz-final',titulo:'Señal de la Cruz',oracionT:'Señal de la Cruz'});
  return pasos;
}

let rosarioClave=claveMisterioHoy();
let rosarioPasos=generarPasosRosario(rosarioClave);
let rosarioIdx=0;

function renderRosarioHoy(){
  const el=document.getElementById('rosarioHoy');
  if(!el)return;
  const hoy=claveMisterioHoy();
  const mHoy=MISTERIOS_ROSARIO[hoy];
  const mActivo=MISTERIOS_ROSARIO[rosarioClave];
  if(rosarioClave===hoy){
    el.innerHTML='<div class="hoy-fecha">Hoy corresponden</div>'
      +'<div class="hoy-tiempo"><span class="hoy-dot" style="background:var(--gold)"></span>Misterios '+mActivo.nombre+'</div>'
      +'<div class="hoy-colorlit">'+mActivo.diasTxt+'</div>';
  }else{
    el.innerHTML='<div class="hoy-fecha">Estás rezando</div>'
      +'<div class="hoy-tiempo"><span class="hoy-dot" style="background:var(--gold)"></span>Misterios '+mActivo.nombre+'</div>'
      +'<div class="hoy-colorlit">Hoy corresponden los '+mHoy.nombre+' ('+mHoy.diasTxt+')</div>';
  }
}

function renderRosarioChips(){
  const el=document.getElementById('rosarioChips');
  if(!el)return;
  el.innerHTML='';
  Object.keys(MISTERIOS_ROSARIO).forEach(k=>{
    const btn=document.createElement('button');
    btn.className='fbtn'+(k===rosarioClave?' on':'');
    btn.textContent=MISTERIOS_ROSARIO[k].nombre;
    btn.onclick=()=>iniciarRosario(k,btn);
    el.appendChild(btn);
  });
}

function iniciarRosario(clave,btn){
  rosarioClave=clave;
  rosarioPasos=generarPasosRosario(clave);
  rosarioIdx=0;
  if(btn){document.querySelectorAll('#rosarioChips .fbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');}
  renderRosarioHoy();
  renderRosarioCadena();
  renderPasoRosario();
  const paso=document.getElementById('rosarioPaso');
  if(paso)paso.scrollIntoView({behavior:'smooth',block:'center'});
}

function reiniciarRosario(){rosarioIdx=0;renderPasoRosario();}
function navRosario(delta){rosarioIdx=Math.max(0,Math.min(rosarioPasos.length-1,rosarioIdx+delta));renderPasoRosario();}
function irAPasoRosario(i){rosarioIdx=Math.max(0,Math.min(rosarioPasos.length-1,i));renderPasoRosario();}

const CADENA_CLASE={cruz:'cadena-cruz',grande:'cadena-grande',chica:'cadena-chica'};
function claseCuenta(p){return p.grande?'cadena-grande':CADENA_CLASE[p.tipo];}
function cuentaHTML(grupo,esEslabonCola){
  const ordenado=grupo.slice().sort((a,b)=>a.i-b.i);
  const min=ordenado[0].i,max=ordenado[ordenado.length-1].i;
  const rep=ordenado.find(p=>p.tipo==='cruz'||p.tipo==='cruzFinal')||ordenado[0];
  const titulos=ordenado.map(p=>p.titulo).join(' · ');
  const etiqueta=(min===max?'Paso '+(min+1):'Pasos '+(min+1)+'-'+(max+1))+': '+titulos;
  const refuerzo=(esEslabonCola&&rep.tipo!=='cruz')?' data-refuerzo="6"':'';
  return'<button type="button" class="cadena-cuenta '+claseCuenta(rep)+'" data-min="'+min+'" data-max="'+max+'"'+refuerzo+' onclick="irAPasoRosario('+min+')" title="'+etiqueta+'" aria-label="'+etiqueta+' — '+rosarioPasos.length+' pasos en total"></button>';
}
function agruparPorCuenta(pasos){
  const grupos=new Map();
  pasos.forEach(p=>{
    const clave=p.bead||('paso'+p.i);
    if(!grupos.has(clave))grupos.set(clave,[]);
    grupos.get(clave).push(p);
  });
  return Array.from(grupos.values());
}
const LAZO_RX=108,LAZO_RY=152,LAZO_MARGEN=9,LAZO_CX=LAZO_RX+LAZO_MARGEN,LAZO_CY=LAZO_RY+LAZO_MARGEN,LAZO_ANCHO=LAZO_CX*2,LAZO_ALTO=LAZO_CY*2;
const LAZO_ANGULO_INICIO=180,LAZO_ARCO=350;
function puntosEquidistantes(n,rx,ry,anguloInicioDeg,arcoDeg){
  const muestras=720;
  const pts=[],acumulado=[0];
  let prevX=null,prevY=null;
  for(let s=0;s<=muestras;s++){
    const t=(anguloInicioDeg-(s/muestras)*arcoDeg)*Math.PI/180;
    const x=rx*Math.sin(t),y=-ry*Math.cos(t);
    if(s>0){const dx=x-prevX,dy=y-prevY;acumulado.push(acumulado[s-1]+Math.sqrt(dx*dx+dy*dy));}
    pts.push({x:x,y:y});
    prevX=x;prevY=y;
  }
  const total=acumulado[acumulado.length-1];
  const resultado=[];
  for(let i=0;i<n;i++){
    const objetivo=n===1?0:(i/(n-1))*total;
    let idx=0;
    while(idx<acumulado.length-1&&acumulado[idx+1]<objetivo)idx++;
    resultado.push(pts[idx]);
  }
  return resultado;
}
function renderRosarioCadena(){
  const el=document.getElementById('rosarioCadena');
  if(!el)return;
  const conIndice=rosarioPasos.map((p,i)=>Object.assign({},p,{i:i}));
  const lazo=agruparPorCuenta(conIndice.filter(p=>p.decada>=1&&p.decada<=5&&!p.sinCuenta));
  const cola=conIndice.filter(p=>p.decada===0).reverse();

  let lazoHTML='';
  const puntos=puntosEquidistantes(lazo.length,LAZO_RX,LAZO_RY,LAZO_ANGULO_INICIO,LAZO_ARCO);
  lazo.forEach((grupo,j)=>{
    const x=LAZO_CX+puntos[j].x,y=LAZO_CY+puntos[j].y;
    lazoHTML+='<span class="cadena-punto" style="left:'+x.toFixed(1)+'px;top:'+y.toFixed(1)+'px">'+cuentaHTML(grupo)+'</span>';
  });

  let colaHTML='';
  agruparPorCuenta(cola).forEach(grupo=>{colaHTML+=cuentaHTML(grupo,true);});

  el.innerHTML=
    '<div class="rosario-forma">'
    +'<div class="rosario-lazo" style="width:'+LAZO_ANCHO+'px;height:'+LAZO_ALTO+'px">'
    +'<div class="rosario-centro" aria-hidden="true">✝</div>'
    +lazoHTML
    +'</div>'
    +'<div class="rosario-cola">'+colaHTML+'</div>'
    +'</div>';
  actualizarCadenaEstado();
}
function actualizarCadenaEstado(){
  const el=document.getElementById('rosarioCadena');
  if(!el)return;
  const decadaActual=rosarioPasos[rosarioIdx]&&rosarioPasos[rosarioIdx].decada;
  const cuentas=el.querySelectorAll('.cadena-cuenta');
  cuentas.forEach(c=>{
    const min=Number(c.dataset.min),max=Number(c.dataset.max);
    const enRefuerzo=!!(c.dataset.refuerzo&&Number(c.dataset.refuerzo)===decadaActual);
    c.classList.toggle('completa',rosarioIdx>max&&!enRefuerzo);
    c.classList.toggle('activa',!!((rosarioIdx>=min&&rosarioIdx<=max)||enRefuerzo));
  });
  const activo=el.querySelector('.activa');
  if(activo)activo.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}

function renderPasoRosario(){
  const paso=rosarioPasos[rosarioIdx];
  if(!paso)return;

  const decadas=document.getElementById('rosarioDecadas');
  if(decadas){
    let dots='';
    for(let i=1;i<=5;i++){
      const cls=paso.decada>i?'decada-dot completa':(paso.decada===i?'decada-dot activa':'decada-dot');
      dots+='<span class="'+cls+'">'+i+'</span>';
    }
    decadas.innerHTML=dots;
  }

  const cuentas=document.getElementById('rosarioCuentas');
  if(cuentas){
    const sinCuentas=paso.tipo==='cruz'||paso.tipo==='ofrecimiento'||paso.tipo==='credo'||paso.tipo==='misterio'||paso.tipo==='final'||paso.tipo==='fatima'||paso.tipo==='oracionFinal'||paso.tipo==='cruzFinal';
    if(sinCuentas){
      cuentas.innerHTML='';
      cuentas.classList.remove('sellado');
    }else{
      const total=paso.decada===0?3:(paso.decada===6?1:10);
      let lleno=0;
      if(paso.tipo==='chica')lleno=paso.n;
      else if(paso.tipo==='gloria')lleno=total;
      else lleno=0;
      let dots='';
      for(let i=1;i<=total;i++){dots+='<span class="cuenta-dot'+(i<=lleno?' llena':'')+'"></span>';}
      cuentas.innerHTML=dots;
      cuentas.classList.toggle('sellado',paso.tipo==='gloria');
    }
  }

  const el=document.getElementById('rosarioPaso');
  if(el){
    let eyebrow='';
    if(paso.decada>=1&&paso.decada<=5)eyebrow='Decena '+paso.decada+' de 5';
    else if(paso.decada===0)eyebrow='Comienzo';
    else eyebrow='Final';
    if(paso.tipo==='gloria')eyebrow+=' · ¡Cuentas completas!';
    let cuerpo;
    if(paso.tipo==='misterio'){
      cuerpo='<p class="rosario-paso-texto rosario-misterio">'+paso.misterio+'</p><p class="rosario-paso-hint">Meditá este misterio y rezá un Padre Nuestro.</p>';
    }else{
      cuerpo='<p class="rosario-paso-texto">'+textoOracion(paso.oracionT).replace(/\n/g,'<br>')+'</p>';
    }
    el.innerHTML='<div class="rosario-paso-eyebrow">'+eyebrow+' · Paso '+(rosarioIdx+1)+' de '+rosarioPasos.length+'</div>'
      +'<h4 class="rosario-paso-titulo">'+paso.titulo+'</h4>'
      +cuerpo;
  }

  const prev=document.getElementById('rosPrev'),next=document.getElementById('rosNext');
  if(prev)prev.disabled=rosarioIdx===0;
  if(next)next.disabled=rosarioIdx===rosarioPasos.length-1;

  actualizarCadenaEstado();
}
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
function renderSalmos(){const g=document.getElementById('slg');SALMOS.forEach(s=>{const c=document.createElement('div');c.className='slc';c.innerHTML='<div class="slh" onclick="togS(this)"><div class="slinfo"><span class="slnum">'+s.num+'</span><span class="sltit">'+s.t+'</span><span class="slsit">'+s.s+'</span></div><span class="slchev">▼</span></div><div class="slb"><div class="sltxt">'+s.tx+'</div></div>';g.appendChild(c);});}
function togS(h){const b=h.nextElementSibling;const ch=h.querySelector('.slchev');b.classList.toggle('open');ch.style.transform=b.classList.contains('open')?'rotate(180deg)':'';}
function togSec(h){const body=h.nextElementSibling;const isOpen=body.classList.toggle('open');h.classList.toggle('open',isOpen);}

function togglePuerta(h){
  const puerta=h.closest('.puerta');
  if(!puerta)return;
  const abierta=puerta.classList.toggle('abierta');
  const boton=puerta.querySelector('.puerta-hoja');
  if(boton)boton.setAttribute('aria-expanded',String(abierta));
}
function initPuertas(){
  document.querySelectorAll('.puerta-contenido[role="button"]').forEach(el=>{
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();togglePuerta(el);}
    });
  });
}

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
renderVersiculos();sc();renderHoyLiturgico();renderLiturgia();renderOraciones();renderRosarioHoy();renderRosarioChips();renderRosarioCadena();renderPasoRosario();renderSantosGaleria();renderSantos();renderSalmos();initScrollSpy();initPuertas();

let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(ajustarAlturaCard,150);
});

if(document.fonts&&document.fonts.ready){
  document.fonts.ready.then(ajustarAlturaCard);
}

// Reacciona a cualquier cambio real de tamaño del contenido (swap de
// fuente, zoom, reflow) sin depender de adivinar el momento exacto.
(function(){
  const cardEl=document.getElementById('card');
  if(!cardEl||!('ResizeObserver' in window))return;
  const front=cardEl.querySelector('.front');
  const back=cardEl.querySelector('.back');
  const ro=new ResizeObserver(()=>{ajustarAlturaCard();});
  ro.observe(front);
  ro.observe(back);
})();

// Expose to global scope
window.togSec=togSec;
window.togglePuerta=togglePuerta;
window.renderVersiculos=renderVersiculos;
window.renderHoyLiturgico=renderHoyLiturgico;
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
window.iniciarRosario=iniciarRosario;
window.reiniciarRosario=reiniciarRosario;
window.navRosario=navRosario;
window.irAPasoRosario=irAPasoRosario;
window.renderSantos=renderSantos;
window.togM=togM;
window.renderSalmos=renderSalmos;
window.togS=togS;
window.goTo=goTo;
