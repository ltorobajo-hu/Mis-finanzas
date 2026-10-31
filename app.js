/* ============================ CONFIGURACIÓN ============================
   Lo que quieras ajustar sin tocar la lógica está en este bloque. Las cuentas, categorías y
   pagos recurrentes se siembran la primera vez que conectas una hoja vacía; después se editan
   desde la app (Ajustes). */
const CONFIG = {
  hormigaMax: 15000,          // gasto hormiga: monto máximo (COP)
  avisoDiasDefault: 5,
  cuentas: [
    {slug:'bancolombia', nombre:'Bancolombia', tipo:'banco'},
    {slug:'davivienda',  nombre:'Davivienda',  tipo:'banco'},
    {slug:'nequi',       nombre:'Nequi',       tipo:'billetera'},
    {slug:'nu',          nombre:'Nu',          tipo:'banco'},
    {slug:'rappi',       nombre:'Rappi',       tipo:'billetera'},
    {slug:'deriv',       nombre:'Deriv',       tipo:'inversion'}
  ],
  categorias: [
    {slug:'mercado', tipo:'gasto', nombre:'Mercado', color:'#16A34A', items:true, subs:['Supermercado','Plaza de mercado','Tienda de barrio'], campos:[]},
    {slug:'transporte', tipo:'gasto', nombre:'Transporte', color:'#2563EB', hormiga:true, subs:['Público','Moto','Carro','Avión','Caballo','Buseta','Otro'],
      campos:[{k:'concepto',l:'Concepto del viaje',t:'text'},{k:'ruta',l:'Origen → destino',t:'text'}]},
    {slug:'comida', tipo:'gasto', nombre:'Comida', color:'#EA580C', hormiga:true, subs:['Cafetería','Almuerzo','Snack','Comida basura','Panadería'],
      campos:[{k:'detalle',l:'Qué comiste',t:'text'},{k:'proteina',l:'Con proteína extra',t:'check',sub:'Almuerzo'}]},
    {slug:'ropa', tipo:'gasto', nombre:'Ropa', color:'#DB2777', subs:['Camisa o camiseta','Pantalón','Zapatos','Chaqueta','Accesorios','Otro'],
      campos:[{k:'prenda',l:'Prenda',t:'text'},{k:'estilo',l:'Estilo',t:'text'},{k:'motivo',l:'Por qué la compraste',t:'text'}]},
    {slug:'tecnologia', tipo:'gasto', nombre:'Tecnología', color:'#0891B2', subs:['Equipo físico','Suscripción o plataforma','Accesorio','Otro'],
      campos:[{k:'elemento',l:'Elemento',t:'text'},{k:'proposito',l:'Propósito',t:'text'},{k:'justif',l:'Justificación',t:'text'},{k:'period',l:'Periodicidad (si es suscripción)',t:'text',sub:'Suscripción o plataforma'}]},
    {slug:'entretenimiento', tipo:'gasto', nombre:'Entretenimiento', color:'#9333EA', hormiga:true, subs:['Concierto','Cine','Evento','Videojuegos','Otro'],
      campos:[{k:'evento',l:'Evento al que asististe',t:'text'},{k:'justif',l:'Justificación',t:'text'}]},
    {slug:'educacion', tipo:'gasto', nombre:'Educación', color:'#CA8A04', subs:['Universidad','Plataformas de estudio','Libros y materiales','Otro'],
      campos:[{k:'concepto',l:'Concepto',t:'text'},{k:'justif',l:'Justificación',t:'text'}]},
    {slug:'salud', tipo:'gasto', nombre:'Salud', color:'#E11D48', subs:['Cita médica','Medicamentos','Examen','Otro'], campos:[{k:'concepto',l:'Concepto',t:'text'}]},
    {slug:'arriendo', tipo:'gasto', nombre:'Arriendo', color:'#475569', subs:['Fijo'], campos:[]},
    {slug:'servicios', tipo:'gasto', nombre:'Servicios y facturas', color:'#0D9488', subs:['Internet','Celular','Energía','Agua','Gas','Otro'], campos:[]},
    {slug:'suscripciones', tipo:'gasto', nombre:'Suscripciones', color:'#7C3AED', subs:['Streaming','Música','Apps','Otro'], campos:[{k:'servicio',l:'Servicio',t:'text'}]},
    {slug:'cuidado', tipo:'gasto', nombre:'Cuidado personal', color:'#F472B6', hormiga:true, subs:['Peluquería','Aseo','Cosméticos','Otro'], campos:[]},
    {slug:'regalos', tipo:'gasto', nombre:'Regalos y detalles', color:'#F59E0B', subs:['Cumpleaños','Obsequio','Otro'], campos:[{k:'para',l:'Para quién',t:'text'}]},
    {slug:'social', tipo:'gasto', nombre:'Social y salidas', color:'#4F46E5', hormiga:true, subs:['Salida con amigos','Invitación','Otro'], campos:[]},
    {slug:'comisiones', tipo:'gasto', nombre:'Comisiones y costos financieros', color:'#64748B', subs:['Cuota de manejo','Retiros','Intereses','Otro'], campos:[]},
    {slug:'imprevistos', tipo:'gasto', nombre:'Imprevistos', color:'#B91C1C', subs:['Reparaciones','Pérdidas','Multas','Otro'], campos:[{k:'concepto',l:'Qué pasó',t:'text'}]},
    {slug:'otros', tipo:'gasto', nombre:'Otros', color:'#78716C', hormiga:true, subs:[], campos:[]},
    {slug:'emprendimiento', tipo:'ingreso', nombre:'Emprendimiento', color:'#059669', subs:[], campos:[{k:'concepto',l:'De qué fue el ingreso',t:'text'}]},
    {slug:'mesada', tipo:'ingreso', nombre:'Mesada', color:'#2563EB', subs:[], campos:[{k:'quien',l:'Quién la aporta',t:'text'}]},
    {slug:'dividendos', tipo:'ingreso', nombre:'Dividendos por inversiones', color:'#7C3AED', subs:[], campos:[{k:'origen',l:'Origen',t:'text'}]},
    /* Categorías de sistema (sistema:true): mueven saldos de cuentas pero NO cuentan como ingreso, gasto ni presupuesto.
       Las usa el módulo de deudas para préstamos y abonos. */
    {slug:'deudas_g', tipo:'gasto',   nombre:'Préstamos y deudas', color:'#64748B', subs:[], campos:[], sistema:true},
    {slug:'deudas_i', tipo:'ingreso', nombre:'Préstamos y deudas', color:'#64748B', subs:[], campos:[], sistema:true}
  ],
  recurrentes: [
    {slug:'arriendo', nombre:'Arriendo', tipo:'gasto', cat:'arriendo', sub:'Fijo', monto:0, dia:26, aviso:5}
  ],
  franjas: [
    {k:'madrugada', l:'Madrugada', r:'0–5 h',   a:0,  b:5},
    {k:'manana',    l:'Mañana',    r:'6–11 h',  a:6,  b:11},
    {k:'mediodia',  l:'Mediodía',  r:'12–14 h', a:12, b:14},
    {k:'tarde',     l:'Tarde',     r:'15–18 h', a:15, b:18},
    {k:'noche',     l:'Noche',     r:'19–23 h', a:19, b:23}
  ]
};

/* ============================ UTILIDADES ============================ */
const $ = (s,r=document)=>r.querySelector(s);
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COP = new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
const fmt = n=>COP.format(Math.round(n||0));
const abbr = n=>{const a=Math.abs(n);return a>=1e6?(n/1e6).toFixed(a>=1e7?0:1).replace('.',',')+' M':a>=1e3?Math.round(n/1e3)+' k':String(Math.round(n))};
const pad = n=>String(n).padStart(2,'0');
const ymd = d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today = ()=>ymd(new Date());
const nowHM = ()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const addMonth = (m,k)=>{const [y,mo]=m.split('-').map(Number);const d=new Date(y,mo-1+k,1);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`};
const monthLabel = (m,short)=>{const [y,mo]=m.split('-').map(Number);return new Date(y,mo-1,1).toLocaleDateString('es-CO',short?{month:'short'}:{month:'long',year:'numeric'}).replace('.','')};
const cap = s=>s.charAt(0).toUpperCase()+s.slice(1);
const daysIn = m=>{const [y,mo]=m.split('-').map(Number);return new Date(y,mo,0).getDate()};
const dueDate = (m,dia)=>`${m}-${pad(Math.min(dia,daysIn(m)))}`;
const diffDays = (a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);
const dateLabel = d=>new Date(d+'T00:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short'}).replace('.','');
const sum = (a,f)=>a.reduce((s,x)=>s+f(x),0);
const money = v=>Number(String(v??'').replace(/[^\d]/g,''))||0;
const slug = s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'x';
const rid = ()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const opts = (list,sel,blank)=>(blank?`<option value="">${esc(blank)}</option>`:'')+list.map(([v,l])=>`<option value="${esc(v)}"${v===sel?' selected':''}>${esc(l)}</option>`).join('');
const LS = {
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const ICON = {
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><path d="M16 14h.01"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'
};
const NAV = [['inicio','Inicio','home'],['registrar','Registrar','plus'],['movimientos','Movimientos','list'],['reportes','Reportes','chart'],['cuentas','Cuentas','wallet'],['plan','Planificar','target'],['ajustes','Ajustes','sliders','desk']];
const FRANJAS = CONFIG.franjas;
const franjaOf = h=>FRANJAS.find(f=>h>=f.a&&h<=f.b);
const hourOf = m=>m.hora&&/^\d{1,2}:\d{2}/.test(m.hora)?+String(m.hora).split(':')[0]:null;
const DIAS = ['lun','mar','mié','jue','vie','sáb','dom'];
const dowOf = f=>(new Date(f+'T00:00:00').getDay()+6)%7;   // lunes = 0

/* ============================ ESTADO ============================ */
const S = {
  docs:{}, movs:[], gastos:[], ingresos:[], ctas:[], cats:[], recs:[], deus:[], cfg:{},
  conf:LS.get('mf.conf',null), queue:LS.get('mf.queue',[]),
  sync:'idle', lastSync:0, loaded:false,
  view:'inicio', month:today().slice(0,7), rep:'resumen', plan:'presupuestos', trendCat:'', mercadoItem:'',
  hr:'mes', mapF:{range:'mes',cat:'',hz:false,pts:false},
  mf:{q:'',tipo:'',cat:'',cta:'',mes:today().slice(0,7)}, lastCuenta:'', form:null
};
const newForm = ()=>({tipo:'gasto',monto:'',fecha:today(),hora:'',horaTouched:false,cuenta:S.lastCuenta||'',cuentaDestino:'',cat:'',sub:'',comercio:'',lugar:'',nota:'',extra:{},items:[{n:'',q:'',u:'',p:''}],hormiga:'auto',editId:null,lat:null,lng:null,acc:null,locTried:false,locMsg:''});
S.form = newForm();
const synced = ()=>!!(S.conf&&S.conf.mode!=='local'&&S.conf.url);

function catDoc(c,i){return {kind:'cat',tipo:c.tipo,nombre:c.nombre,color:c.color,subs:c.subs,campos:c.campos,items:!!c.items,hormiga:!!c.hormiga,sistema:!!c.sistema,presupuesto:0,activa:true,orden:i}}
let saveT=null;
function saveDocs(){clearTimeout(saveT);saveT=setTimeout(()=>LS.set('mf.docs',S.docs),250)}
function derive(){
  const v=Object.values(S.docs);
  S.movs=v.filter(d=>d.kind==='mov').sort((a,b)=>b.fecha.localeCompare(a.fecha)||String(b.hora||'').localeCompare(String(a.hora||''))||(b.creado||0)-(a.creado||0));
  S.ctas=v.filter(d=>d.kind==='cta').sort((a,b)=>(a.orden||0)-(b.orden||0));
  S.cats=v.filter(d=>d.kind==='cat').sort((a,b)=>(a.orden||0)-(b.orden||0));
  S.recs=v.filter(d=>d.kind==='rec').sort((a,b)=>(a.dia||0)-(b.dia||0));
  S.deus=v.filter(d=>d.kind==='deu').sort((a,b)=>String(a.vence||'9999').localeCompare(String(b.vence||'9999')));
  S.cfg=Object.assign({hormigaMax:CONFIG.hormigaMax,avisoDias:CONFIG.avisoDiasDefault,presupuestoTotal:0,ubicacion:true},S.docs.cfg||{});
  S.gastos=S.movs.filter(m=>m.tipo==='gasto'&&!neutral(m));
  S.ingresos=S.movs.filter(m=>m.tipo==='ingreso'&&!neutral(m));
}
const catOf = id=>S.docs[id]&&S.docs[id].kind==='cat'?S.docs[id]:null;
const ctaOf = id=>S.docs[id]&&S.docs[id].kind==='cta'?S.docs[id]:null;
function neutral(m){const c=catOf(m.cat);return !!(c&&c.sistema)}

/* ============================ ESCRITURA Y COLA ============================ */
function enqueue(op){
  if(!synced()) return;
  const id=op.op==='put'?op.doc.id:op.id;
  S.queue=S.queue.filter(o=>(o.op==='put'?o.doc.id:o.id)!==id);
  S.queue.push(op); LS.set('mf.queue',S.queue); flushSoon();
}
function prep(id,data){
  data=Object.assign({},data,{id});
  if(data.kind==='mov'){const c=ctaOf(data.cuenta),k=catOf(data.cat);data.cuentaN=c?c.nombre:'';data.catN=k?k.nombre:''}
  return data;
}
function put(id,data){putMany([[id,data]])}
function putMany(entries,quiet){
  entries.forEach(([id,data])=>{const d=prep(id,data);S.docs[id]=d;enqueue({op:'put',doc:d})});
  derive(); saveDocs(); if(!quiet) render(); renderStatus();
}
function del(id){
  const d=S.docs[id]; if(!d) return;
  delete S.docs[id]; enqueue({op:'del',kind:d.kind,id}); derive(); saveDocs(); render(); renderStatus();
}
function seedAll(){
  const t=today(), m=t.slice(0,7), e=[];
  e.push(['cfg',{kind:'cfg',hormigaMax:CONFIG.hormigaMax,avisoDias:CONFIG.avisoDiasDefault,presupuestoTotal:0,ubicacion:true}]);
  CONFIG.cuentas.forEach((c,i)=>e.push(['cta_'+c.slug,{kind:'cta',nombre:c.nombre,tipo:c.tipo,saldoInicial:0,activa:true,orden:i}]));
  CONFIG.categorias.forEach((c,i)=>e.push(['cat_'+c.slug,catDoc(c,i)]));
  CONFIG.recurrentes.forEach(r=>{
    const pagado=t>dueDate(m,r.dia)?m:'';   // si hoy ya pasó el día de pago, se asume pagado este mes
    e.push(['rec_'+r.slug,{kind:'rec',nombre:r.nombre,tipo:r.tipo,cat:'cat_'+r.cat,sub:r.sub,monto:r.monto,dia:r.dia,aviso:r.aviso,cuenta:'',activo:true,ultimoPagado:pagado}]);
  });
  putMany(e,true);
}
function ensureSystem(){
  const e=[]; CONFIG.categorias.forEach((c,i)=>{ if(c.sistema&&!S.docs['cat_'+c.slug]) e.push(['cat_'+c.slug,catDoc(c,i)]) });
  if(e.length) putMany(e,true);
}

/* ============================ SINCRONIZACIÓN (Apps Script) ============================ */
async function api(payload,conf){
  conf=conf||S.conf; const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),25000);
  try{
    const r=await fetch(conf.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({key:conf.key},payload)),signal:ctl.signal});
    const txt=await r.text();
    try{return JSON.parse(txt)}catch(e){return {ok:false,error:'respuesta'}}
  } finally{clearTimeout(t)}
}
let flushing=false, flushT=null, pulling=false;
function flushSoon(){clearTimeout(flushT);flushT=setTimeout(flush,700)}
async function flush(){
  if(flushing||!S.queue.length||!synced()) return;
  flushing=true; const ops=S.queue.slice();
  try{
    const r=await api({action:'batch',ops});
    if(r&&r.ok){ S.queue=S.queue.filter(o=>!ops.includes(o)); LS.set('mf.queue',S.queue); S.sync='ok'; S.lastSync=Date.now(); }
    else S.sync=r&&r.error==='clave'?'clave':'error';
  }catch(e){ S.sync='offline'; }   // fallo de red: se reintenta solo
  finally{ flushing=false; }
  renderStatus();
  if(S.queue.length&&S.sync==='ok') flushSoon();
}
async function pull(manual){
  if(!synced()||pulling) return;
  pulling=true; S.sync='sync'; renderStatus();
  try{
    await flush();
    const r=await api({action:'all'});
    if(!r||!r.ok){ S.sync=r&&r.error==='clave'?'clave':'error'; if(manual) toast(r&&r.error==='clave'?'La clave no coincide con la del script':'No se pudo leer la hoja (revisa la URL y que el acceso sea "Cualquier persona")'); return; }
    const local=Object.keys(S.docs).length;
    if(r.docs.length===0&&local>0){            // hoja vacía y datos locales: se restauran desde este dispositivo
      Object.values(S.docs).forEach(d=>enqueue({op:'put',doc:d})); S.sync='ok'; flushSoon();
    } else {
      const map={}; r.docs.forEach(d=>{map[d.id]=d});
      S.queue.forEach(op=>{ if(op.op==='put') map[op.doc.id]=op.doc; else delete map[op.id] });
      S.docs=map; derive(); LS.set('mf.docs',S.docs);
      S.sync=S.queue.length?'pending':'ok'; S.lastSync=Date.now();
    }
    S.loaded=true; ensureSystem(); if(manual) toast('Datos al día');
  }catch(e){ S.sync='offline'; if(manual) toast('Sin conexión: se enviará cuando vuelva'); }
  finally{ pulling=false; render(); }
}
function renderStatus(){
  const st=$('#status'); if(!st) return;
  let t='',c='';
  if(!S.conf){t='Sin conectar';c='bad'}
  else if(S.conf.mode==='local'){t='Solo en este dispositivo';c='warn'}
  else if(S.sync==='sync'){t='Sincronizando…';c=''}
  else if(S.sync==='clave'){t='Clave incorrecta';c='bad'}
  else if(S.sync==='error'){t=`Error de sincronización${S.queue.length?' ('+S.queue.length+' pendientes)':''}`;c='bad'}
  else if(S.sync==='offline'||S.queue.length){t=S.queue.length?`Sin conexión · ${S.queue.length} por enviar`:'Sin conexión';c='warn'}
  else if(S.sync==='ok'){t='Sincronizado';c='good'}
  else {t='Cargando';c=''}
  st.textContent=t; st.className='pill '+c;
}

/* ============================ CÁLCULOS ============================ */
function saldo(c){
  let s=c.saldoInicial||0;
  for(const m of S.movs){
    if(m.tipo==='ingreso'&&m.cuenta===c.id) s+=m.monto;
    else if(m.tipo==='gasto'&&m.cuenta===c.id) s-=m.monto;
    else if(m.tipo==='transfer'){ if(m.cuenta===c.id) s-=m.monto; if(m.cuentaDestino===c.id) s+=m.monto; }
  }
  return s;
}
const disponible = ()=>sum(S.ctas.filter(c=>c.tipo!=='inversion'&&c.activa!==false),saldo);
const totals = m=>({ing:sum(S.ingresos.filter(x=>x.fecha.startsWith(m)),x=>x.monto),gas:sum(S.gastos.filter(x=>x.fecha.startsWith(m)),x=>x.monto)});
const lastMonths = (m,n)=>Array.from({length:n},(_,i)=>addMonth(m,i-n+1));
const gastoCat = (m,catId)=>sum(S.gastos.filter(x=>x.cat===catId&&x.fecha.startsWith(m)),x=>x.monto);
function titleOf(m){
  if(m.tipo==='transfer'){const a=ctaOf(m.cuenta),b=ctaOf(m.cuentaDestino);return `Transferencia ${a?a.nombre:'?'} → ${b?b.nombre:'?'}`}
  const c=catOf(m.cat); return (c?c.nombre:'Sin categoría')+(m.sub?' · '+m.sub:'');
}
const pagado = d=>sum(d.pagos||[],p=>p.m);
const saldoDeuda = d=>Math.max(0,(d.monto||0)-pagado(d));
function rangeGastos(range){
  const d=new Date(); d.setDate(d.getDate()-90); const lim=ymd(d);
  return S.gastos.filter(m=>range==='mes'?m.fecha.startsWith(S.month):range==='90'?m.fecha>=lim:true);
}
function sugerido(catId){
  const rec=S.recs.find(r=>r.cat===catId&&r.activo!==false&&r.monto>0);
  if(rec) return {v:rec.monto,n:0,fijo:true};
  const prev=[1,2,3].map(i=>addMonth(S.month,-i)).filter(x=>S.gastos.some(g=>g.fecha.startsWith(x)));
  if(!prev.length) return null;
  const avg=sum(prev,x=>gastoCat(x,catId))/prev.length;
  return avg>0?{v:Math.round(avg/1000)*1000,n:prev.length,avg}:null;
}
function proyeccion(g){
  if(S.month!==today().slice(0,7)) return g;
  const d=+today().slice(8,10); return g/d*daysIn(S.month);
}
function getAlerts(){
  const out=[], t=today(), m=t.slice(0,7);
  for(const r of S.recs.filter(r=>r.activo!==false)){
    if(r.ultimoPagado===m) continue;
    const days=diffDays(t,dueDate(m,r.dia)), base=r.monto>0?fmt(r.monto):'monto sin definir';
    if(days<0) out.push({lvl:'bad',t:`${r.nombre} venció hace ${-days} día${-days===1?'':'s'}`,s:`${base} · día ${r.dia} de cada mes`,rec:r.id});
    else if(days<=(r.aviso??5)) out.push({lvl:days===0?'bad':'warn',t:days===0?`${r.nombre} se paga hoy`:`${r.nombre} se paga en ${days} día${days===1?'':'s'}`,s:`${base} · día ${r.dia} de cada mes`,rec:r.id});
  }
  for(const d of S.deus.filter(d=>d.estado!=='pagada'&&d.vence)){
    const days=diffDays(t,d.vence), av=d.aviso??5, sd=fmt(d.cuota>0?Math.min(d.cuota,saldoDeuda(d)):saldoDeuda(d));
    const who=d.dir==='debo'?`Pagar a ${d.parte}`:`${d.parte} te debe`;
    if(days<0) out.push({lvl:'bad',t:`${who}: venció hace ${-days} día${-days===1?'':'s'}`,s:`${sd} · ${d.concepto||'deuda'}`,deu:d.id});
    else if(days<=av) out.push({lvl:days===0?'bad':'warn',t:days===0?`${who}: vence hoy`:`${who}: vence en ${days} día${days===1?'':'s'}`,s:`${sd} · ${d.concepto||'deuda'}`,deu:d.id});
  }
  if(S.cfg.presupuestoTotal>0){
    const g=totals(S.month).gas, p=g/S.cfg.presupuestoTotal;
    if(p>=1) out.push({lvl:'bad',t:'Presupuesto total del mes superado',s:`${fmt(g)} de ${fmt(S.cfg.presupuestoTotal)} (${Math.round(p*100)}%)`});
    else if(p>=0.8) out.push({lvl:'warn',t:'Presupuesto total: llevas el 80% o más',s:`${fmt(g)} de ${fmt(S.cfg.presupuestoTotal)} (${Math.round(p*100)}%)`});
  }
  for(const c of S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema&&c.presupuesto>0&&c.activa!==false)){
    const g=gastoCat(S.month,c.id), p=g/c.presupuesto;
    if(p>=1) out.push({lvl:'bad',t:`${c.nombre}: presupuesto superado`,s:`${fmt(g)} de ${fmt(c.presupuesto)} (${Math.round(p*100)}%)`});
    else if(p>=0.8) out.push({lvl:'warn',t:`${c.nombre}: cerca del límite`,s:`${fmt(g)} de ${fmt(c.presupuesto)} (${Math.round(p*100)}%)`});
  }
  const h=hormiga(S.month);
  if(h.gasTotal>0&&h.share>=0.2) out.push({lvl:'info',t:`Los gastos hormiga son el ${Math.round(h.share*100)}% de tus gastos del mes`,s:`${fmt(h.total)} en ${h.n} movimientos`});
  return out;
}
function hormiga(m){
  const g=S.gastos.filter(x=>x.fecha.startsWith(m)), h=g.filter(x=>x.hormiga);
  const gasTotal=sum(g,x=>x.monto), total=sum(h,x=>x.monto);
  const grp=f=>{const mp={};h.forEach(x=>{const k=f(x);if(!k)return;(mp[k]=mp[k]||{k,n:0,t:0});mp[k].n++;mp[k].t+=x.monto});return Object.values(mp).sort((a,b)=>b.t-a.t)};
  const wk=w=>h.filter(x=>Math.ceil(+x.fecha.slice(8,10)/7)===w);
  return {list:h,n:h.length,total,gasTotal,share:gasTotal?total/gasTotal:0,porTipo:grp(x=>titleOf(x)),porLugar:grp(x=>x.lugar||x.comercio),
    semanas:[1,2,3,4,5].map(w=>({w,t:sum(wk(w),y=>y.monto),n:wk(w).length})).filter(x=>x.n>0)};
}
/* Análisis por hora: solo cuentan los gastos que tienen hora registrada. */
function horarios(range){
  const all=rangeGastos(range), con=all.filter(m=>hourOf(m)!==null), sin=all.length-con.length;
  const total=sum(con,m=>m.monto);
  const porHora=Array.from({length:24},(_,h)=>sum(con.filter(m=>hourOf(m)===h),m=>m.monto));
  const fr=FRANJAS.map(f=>{
    const a=con.filter(m=>{const h=hourOf(m);return h>=f.a&&h<=f.b});
    const cats={},tipos={};
    a.forEach(m=>{const c=catOf(m.cat);const k=c?c.nombre:'Sin categoría';cats[k]=(cats[k]||0)+m.monto;const t=titleOf(m);tipos[t]=(tipos[t]||0)+m.monto});
    const top=o=>Object.entries(o).sort((x,y)=>y[1]-x[1]);
    return Object.assign({},f,{n:a.length,t:sum(a,m=>m.monto),topCat:top(cats)[0],topTipos:top(tipos).slice(0,3)});
  });
  const grid=DIAS.map((_,d)=>FRANJAS.map(f=>sum(con.filter(m=>dowOf(m.fecha)===d&&hourOf(m)>=f.a&&hourOf(m)<=f.b),m=>m.monto)));
  return {n:con.length,sin,total,porHora,fr,grid};
}
/* Zonas de gasto: agrupa puntos en cuadrículas de ~110 m (3 decimales de lat/lng). */
function zonas(pts){
  const mp={};
  pts.forEach(m=>{const k=m.lat.toFixed(3)+','+m.lng.toFixed(3);const z=mp[k]=mp[k]||{n:0,t:0,la:0,ln:0,lug:{}};z.n++;z.t+=m.monto;z.la+=m.lat;z.ln+=m.lng;const l=m.lugar||m.comercio;if(l)z.lug[l]=(z.lug[l]||0)+1});
  return Object.values(mp).map(z=>({n:z.n,t:z.t,lat:z.la/z.n,lng:z.ln/z.n,nombre:Object.entries(z.lug).sort((a,b)=>b[1]-a[1]).map(x=>x[0])[0]||'(sin nombre)'})).sort((a,b)=>b.t-a.t);
}

/* ============================ GRÁFICOS ============================ */
function niceMax(max){const p=Math.pow(10,Math.floor(Math.log10(max)));const n=max/p;return (n<=1?1:n<=2?2:n<=5?5:10)*p}
function chartBars(labels,series){
  const W=600,H=220,L=50,B=28,T=14,R=8,iw=W-L-R,ih=H-T-B;
  const max=niceMax(Math.max(1,...series.flatMap(s=>s.vals)));
  const gw=iw/labels.length, bw=Math.min(30,(gw*0.72)/series.length);
  let g='';
  [0,.5,1].forEach(f=>{const y=T+ih-ih*f;g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-6}" y="${y+4}" text-anchor="end">${abbr(max*f)}</text>`});
  labels.forEach((lb,i)=>{
    const x0=L+gw*i+(gw-bw*series.length)/2;
    series.forEach((s,j)=>{
      const v=s.vals[i]||0,h=ih*v/max,x=x0+bw*j,y=T+ih-h;
      g+=`<rect class="s${s.cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${Math.max(h,0).toFixed(1)}" rx="4"><title>${esc(lb)} · ${esc(s.name)}: ${fmt(v)}</title></rect>`;
      if(labels.length<=6&&v>0&&series.length<=2) g+=`<text x="${(x+bw/2-1).toFixed(1)}" y="${(y-4).toFixed(1)}" text-anchor="middle">${abbr(v)}</text>`;
    });
    const showLb=labels.length<=12||i%2===0;
    if(showLb) g+=`<text x="${L+gw*i+gw/2}" y="${H-8}" text-anchor="middle">${esc(lb)}</text>`;
  });
  const col=c=>c===0?'var(--accent)':c===1?'var(--ink)':'var(--good)';
  const leg=series.length>1?`<div class="legend">${series.map(s=>`<span><i style="background:${col(s.cls)}"></i>${esc(s.name)}</span>`).join('')}</div>`:'';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras">${g}</svg>${leg}`;
}
const progress = (label,val,total,color,right)=>{const p=total>0?Math.min(100,val/total*100):0;return `<div class="prow"><span>${label}</span><b class="num">${right??fmt(val)}</b><div class="bar"><div style="width:${p.toFixed(1)}%;background:${color}"></div></div></div>`};
