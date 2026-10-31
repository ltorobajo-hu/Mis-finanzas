/* ============================ ACCIONES ============================ */
function captureLocation(){
  const f=S.form; f.locTried=true; f.locMsg='';
  const upd=()=>{const el=$('#locstat');if(el)el.innerHTML=locHTML()};
  if(!navigator.geolocation){f.locMsg='Este dispositivo no permite ubicación.';upd();return}
  navigator.geolocation.getCurrentPosition(p=>{
    if(S.form!==f) return;
    f.lat=+p.coords.latitude.toFixed(5); f.lng=+p.coords.longitude.toFixed(5); f.acc=p.coords.accuracy; upd();
  },e=>{
    if(S.form!==f) return;
    f.locMsg=e&&e.code===1?'Permiso de ubicación denegado. Puedes activarlo en los ajustes del navegador.':'No se pudo obtener la ubicación.'; upd();
  },{enableHighAccuracy:false,timeout:9000,maximumAge:60000});
}
function saveForm(){
  const f=S.form, cat=catOf(f.cat), mer=cat&&cat.items&&f.tipo==='gasto';
  const items=mer?f.items.filter(i=>i.n.trim()||money(i.p)).map(i=>({n:i.n.trim(),q:i.q.trim(),u:i.u.trim(),p:money(i.p)})):[];
  const monto=mer?sum(items,i=>i.p):money(f.monto);
  if(!(monto>0)) return toast(mer?'Agrega al menos un ítem con precio':'Escribe un monto mayor a cero');
  if(!f.cuenta) return toast('Elige una cuenta');
  if(f.tipo==='transfer'){ if(!f.cuentaDestino||f.cuentaDestino===f.cuenta) return toast('Elige una cuenta de destino distinta'); }
  else if(!f.cat) return toast('Elige una categoría');
  if(!f.fecha) return toast('Elige la fecha');
  let hz=false;
  if(f.tipo==='gasto') hz=f.hormiga==='si'?true:f.hormiga==='no'?false:!!(cat&&cat.hormiga&&monto<=S.cfg.hormigaMax);
  const old=f.editId?S.docs[f.editId]:null, id=f.editId||'mov_'+rid();
  const hora=f.horaTouched?f.hora:(f.fecha===today()?nowHM():'');
  const extra={}; Object.entries(f.extra).forEach(([k,v])=>{if(v!==''&&v!==false)extra[k]=v});
  const conLoc=f.tipo==='gasto'&&f.lat!=null;
  const mov={kind:'mov',tipo:f.tipo,fecha:f.fecha,hora,monto,cuenta:f.cuenta,cuentaDestino:f.tipo==='transfer'?f.cuentaDestino:'',cat:f.tipo==='transfer'?'':f.cat,sub:f.tipo==='transfer'?'':f.sub,comercio:f.comercio.trim(),lugar:f.lugar.trim(),lat:conLoc?f.lat:'',lng:conLoc?f.lng:'',nota:f.nota.trim(),extra,items,hormiga:hz,creado:old?old.creado:Date.now()};
  if(old&&old.recId) mov.recId=old.recId; if(old&&old.deudaId) mov.deudaId=old.deudaId;
  S.lastCuenta=f.cuenta; const tipo=f.tipo, fecha=f.fecha;
  S.form=newForm(); S.form.tipo=tipo; S.form.fecha=fecha; S.form.cuenta=S.lastCuenta;
  put(id,mov); toast(old?'Cambios guardados':'Movimiento guardado');
  if(old) go('movimientos');
}
function editMov(id){
  const m=S.docs[id]; if(!m) return;
  S.form={tipo:m.tipo,monto:String(m.monto),fecha:m.fecha,hora:m.hora||'',horaTouched:true,cuenta:m.cuenta,cuentaDestino:m.cuentaDestino||'',cat:m.cat||'',sub:m.sub||'',comercio:m.comercio||'',lugar:m.lugar||'',nota:m.nota||'',extra:Object.assign({},m.extra),items:(m.items&&m.items.length?m.items:[{n:'',q:'',u:'',p:''}]).map(i=>({n:i.n,q:i.q,u:i.u,p:String(i.p||'')})),hormiga:m.tipo==='gasto'?(m.hormiga?'si':'no'):'auto',editId:id,lat:typeof m.lat==='number'?m.lat:null,lng:typeof m.lng==='number'?m.lng:null,acc:null,locTried:true,locMsg:''};
  dlg(''); go('registrar');
}
function showMov(id){
  const m=S.docs[id]; if(!m) return;
  const c=catOf(m.cat), cta=ctaOf(m.cuenta), ctd=ctaOf(m.cuentaDestino);
  const labels={}; (c&&c.campos||[]).forEach(x=>labels[x.k]=x.l);
  const rows=[['Tipo',m.tipo==='transfer'?'Transferencia':m.tipo==='gasto'?'Gasto':'Ingreso'],['Monto',fmt(m.monto)],['Fecha',dateLabel(m.fecha)+' de '+m.fecha.slice(0,4)],['Hora',m.hora],['Cuenta',cta?cta.nombre:''],['Destino',ctd?ctd.nombre:''],['Categoría',c?c.nombre:''],['Subcategoría',m.sub],['Comercio',m.comercio],['Lugar',m.lugar],['Ubicación',typeof m.lat==='number'?'Guardada':''],['Gasto hormiga',m.hormiga?'Sí':''],...Object.entries(m.extra||{}).map(([k,v])=>[labels[k]||k,v===true?'Sí':v]),['Nota',m.nota]].filter(r=>r[1]);
  dlg(`<h3>${esc(titleOf(m))}</h3><dl class="kv">${rows.map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>${(m.items||[]).length?`<h3 style="margin-top:14px">Ítems</h3><table>${m.items.map(i=>`<tr><td>${esc(i.n)}</td><td class="r">${esc(i.q)} ${esc(i.u)}</td><td class="r num">${fmt(i.p)}</td></tr>`).join('')}</table>`:''}<div class="act"><button class="btn danger" data-act="delmov" data-id="${esc(id)}">Eliminar</button><button class="btn ghost" data-act="editmov" data-id="${esc(id)}">Editar</button><button class="btn" data-act="dclose">Cerrar</button></div>`);
}
async function payRec(id){
  const r=S.docs[id]; if(!r) return;
  if(!(r.monto>0)){ toast('Define primero el monto de '+r.nombre); return go('ajustes'); }
  const cta=r.cuenta&&ctaOf(r.cuenta)?r.cuenta:(S.ctas.find(c=>c.tipo==='banco'&&c.activa!==false)||S.ctas[0]||{}).id;
  if(!cta) return toast('Primero crea una cuenta');
  if(!await ask(`¿Registrar ${r.nombre} por ${fmt(r.monto)} desde ${ctaOf(cta).nombre}?`,'Registrar')) return;
  dlg('');
  const m=today().slice(0,7);
  putMany([['mov_'+rid(),{kind:'mov',tipo:r.tipo,fecha:today(),hora:nowHM(),monto:r.monto,cuenta:cta,cuentaDestino:'',cat:r.cat,sub:r.sub||'',comercio:r.nombre,lugar:'',nota:'Pago recurrente',extra:{},items:[],hormiga:false,creado:Date.now(),recId:id}],[id,Object.assign({},r,{ultimoPagado:m})]]);
  toast(r.nombre+' registrado');
}
function dlgAbono(id){
  const d=S.docs[id]; if(!d) return;
  const sd=saldoDeuda(d), def=d.cuota>0?Math.min(d.cuota,sd):sd, ctas=S.ctas.filter(c=>c.activa!==false);
  dlg(`<h3>${d.dir==='debo'?'Registrar abono':'Registrar cobro'} · ${esc(d.parte)}</h3><p style="margin:0 0 10px;color:var(--muted)">Saldo pendiente: ${fmt(sd)}</p>
  <div class="fields" style="grid-template-columns:1fr;margin-top:0"><label class="f">Monto (COP)<input id="ab-m" type="text" inputmode="numeric" value="${def}"></label><label class="f">Fecha<input id="ab-f" type="date" value="${today()}"></label><label class="f">Cuenta<select id="ab-c">${opts(ctas.map(c=>[c.id,c.nombre]),S.lastCuenta||(ctas[0]||{}).id)}</select></label></div>
  <label class="f" style="flex-direction:row;align-items:center;gap:8px;margin-top:12px"><input id="ab-r" type="checkbox" checked>Reflejar en mis cuentas</label>
  <div class="act"><button class="btn ghost" data-act="dclose">Cancelar</button><button class="btn" data-act="abono-ok" data-id="${esc(id)}">Guardar</button></div>`);
}
function abonoOk(id){
  const d=S.docs[id]; if(!d) return;
  let m=money($('#ab-m').value); const f=$('#ab-f').value||today(), cta=$('#ab-c').value, sd=saldoDeuda(d);
  if(!(m>0)) return toast('Escribe un monto mayor a cero');
  if(m>sd){ m=sd; toast('El monto se ajustó al saldo pendiente'); }
  const entries=[]; let movId='';
  if($('#ab-r').checked&&cta){
    movId='mov_'+rid();
    entries.push([movId,{kind:'mov',tipo:d.dir==='debo'?'gasto':'ingreso',fecha:f,hora:f===today()?nowHM():'',monto:m,cuenta:cta,cuentaDestino:'',cat:d.dir==='debo'?'cat_deudas_g':'cat_deudas_i',sub:'',comercio:d.parte,lugar:'',nota:(d.dir==='debo'?'Abono a deuda: ':'Cobro de préstamo: ')+(d.concepto||''),extra:{},items:[],hormiga:false,creado:Date.now(),deudaId:d.id}]);
  }
  const nd=Object.assign({},d,{pagos:[...(d.pagos||[]),{f,m,cuenta:cta,movId}]});
  if(saldoDeuda(nd)<=0) nd.estado='pagada';
  else if(d.frec==='mensual'&&d.vence) nd.vence=dueDate(addMonth(d.vence.slice(0,7),1),d.dia||+d.vence.slice(8,10));
  entries.push([d.id,nd]); dlg(''); putMany(entries); toast('Registrado');
}
async function undoAbono(id){
  const d=S.docs[id]; if(!d||!(d.pagos||[]).length) return;
  const last=d.pagos[d.pagos.length-1];
  if(!await ask(`¿Deshacer el último ${d.dir==='debo'?'abono':'cobro'} de ${fmt(last.m)}?`,'Deshacer')) return;
  dlg('');
  const nd=Object.assign({},d,{pagos:d.pagos.slice(0,-1)});
  if(d.estado==='pagada') nd.estado='activa';
  else if(d.frec==='mensual'&&d.vence) nd.vence=dueDate(addMonth(d.vence.slice(0,7),-1),d.dia||+d.vence.slice(8,10));
  if(last.movId&&S.docs[last.movId]) del(last.movId);
  put(id,nd); toast('Deshecho');
}
function addDeu(){
  const parte=$('#dn-parte').value.trim(), monto=money($('#dn-monto').value);
  if(!parte) return toast('Escribe la persona o entidad');
  if(!(monto>0)) return toast('Escribe el monto total');
  const dir=$('#dn-dir').value, vence=$('#dn-vence').value, id='deu_'+rid(), cta=$('#dn-cta').value;
  const d={kind:'deu',dir,parte,concepto:$('#dn-con').value.trim(),monto,cuota:money($('#dn-cuota').value),vence,frec:$('#dn-frec').value,dia:vence?+vence.slice(8,10):0,aviso:Math.max(0,+$('#dn-aviso').value||0),estado:'activa',nota:'',creado:Date.now(),pagos:[]};
  const e=[[id,d]];
  if($('#dn-ref').checked&&cta) e.push(['mov_'+rid(),{kind:'mov',tipo:dir==='debo'?'ingreso':'gasto',fecha:today(),hora:nowHM(),monto,cuenta:cta,cuentaDestino:'',cat:dir==='debo'?'cat_deudas_i':'cat_deudas_g',sub:'',comercio:parte,lugar:'',nota:(dir==='debo'?'Préstamo recibido: ':'Préstamo entregado: ')+d.concepto,extra:{},items:[],hormiga:false,creado:Date.now(),deudaId:id}]);
  putMany(e); toast('Deuda agregada');
}

/* ---------- CSV ---------- */
function csvCell(v){v=String(v??'');return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
const CSV_HEAD=['fecha','hora','tipo','monto','cuenta','cuenta_destino','categoria','subcategoria','comercio','lugar','lat','lng','nota'];
function download(name,text){
  const b=new Blob(['﻿'+text],{type:'text/csv;charset=utf-8'}), a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600);
}
function parseCSV(t){
  t=t.replace(/^﻿/,''); const first=t.split(/\r?\n/)[0]||''; const d=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  const rows=[];let r=[],c='',q=false;
  for(let i=0;i<t.length;i++){const ch=t[i];
    if(q){ if(ch==='"'){ if(t[i+1]==='"'){c+='"';i++} else q=false } else c+=ch }
    else if(ch==='"') q=true; else if(ch===d){r.push(c);c=''} else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&t[i+1]==='\n')i++; r.push(c);c='';if(r.some(x=>x.trim()))rows.push(r);r=[] } else c+=ch;
  }
  r.push(c); if(r.some(x=>x.trim())) rows.push(r); return rows;
}
async function importCSV(text){
  const rows=parseCSV(text); if(rows.length<2) return toast('El archivo no tiene filas');
  const h=rows[0].map(x=>x.trim().toLowerCase()), ix=k=>h.indexOf(k);
  if(['fecha','tipo','monto'].some(k=>ix(k)<0)) return toast('Faltan columnas: fecha, tipo y monto son obligatorias');
  const ok=[];let skip=0;
  for(const r of rows.slice(1)){
    const g=k=>ix(k)<0?'':(r[ix(k)]||'').trim();
    let f=g('fecha'); const mm=f.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); if(mm) f=`${mm[3]}-${pad(mm[2])}-${pad(mm[1])}`;
    const tipo=g('tipo').toLowerCase().replace('transferencia','transfer'), monto=money(g('monto'));
    const cta=S.ctas.find(c=>c.nombre.toLowerCase()===g('cuenta').toLowerCase());
    const ctd=S.ctas.find(c=>c.nombre.toLowerCase()===g('cuenta_destino').toLowerCase());
    const cat=S.cats.find(c=>c.nombre.toLowerCase()===g('categoria').toLowerCase()&&c.tipo===tipo&&!c.sistema);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f)||!['gasto','ingreso','transfer'].includes(tipo)||!(monto>0)||!cta||(tipo==='transfer'?(!ctd||ctd.id===cta.id):!cat)){skip++;continue}
    const hr=g('hora'), la=parseFloat(g('lat').replace(',','.')), ln=parseFloat(g('lng').replace(',','.'));
    ok.push({kind:'mov',tipo,fecha:f,hora:/^\d{1,2}:\d{2}/.test(hr)?hr.slice(0,5).padStart(5,'0'):'',monto,cuenta:cta.id,cuentaDestino:tipo==='transfer'?ctd.id:'',cat:cat?cat.id:'',sub:g('subcategoria'),comercio:g('comercio'),lugar:g('lugar'),lat:isFinite(la)?la:'',lng:isFinite(ln)?ln:'',nota:g('nota'),extra:{},items:[],hormiga:tipo==='gasto'&&!!(cat&&cat.hormiga&&monto<=S.cfg.hormigaMax),creado:Date.now()});
  }
  if(!ok.length) return toast(`Ninguna fila válida (${skip} omitidas). Revisa nombres de cuentas y categorías.`);
  if(!await ask(`Importar ${ok.length} movimientos${skip?` (se omiten ${skip} con datos no válidos)`:''}?`,'Importar')) return;
  dlg(''); putMany(ok.map((m,i)=>['mov_'+rid()+i,m])); toast(`${ok.length} movimientos importados`);
}

/* ---------- Conexión ---------- */
async function connect(){
  const url=$('#cn-url').value.trim(), key=$('#cn-key').value.trim();
  if(!/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)) return toast('La URL debe empezar con https://script.google.com/ y terminar en /exec');
  if(!key) return toast('Escribe la clave');
  toast('Conectando…');
  let r; try{ r=await api({action:'all'},{url,key}); }catch(e){ return toast('No se pudo conectar. Revisa tu internet y la URL.'); }
  if(!r||!r.ok) return toast(r&&r.error==='clave'?'La clave no coincide con la del script':r&&r.error==='respuesta'?'La URL no responde como el script: revisa que el acceso sea "Cualquier persona" y que copiaste la URL de la implementación':'Error del script: '+((r&&r.error)||'desconocido'));
  const local=Object.keys(S.docs).length;
  if(r.docs.length>0&&local>0&&!await ask('La hoja ya tiene datos. Se usarán los de la hoja y se descartarán los de este dispositivo. ¿Continuar?','Continuar')) return;
  dlg(''); S.conf={url,key}; LS.set('mf.conf',S.conf); S.queue=[]; LS.set('mf.queue',[]);
  if(r.docs.length===0){ if(local) Object.values(S.docs).forEach(d=>enqueue({op:'put',doc:d})); else seedAll(); }
  else { S.docs={}; r.docs.forEach(d=>{S.docs[d.id]=d}); derive(); }
  S.sync='ok'; S.loaded=true; LS.set('mf.docs',S.docs); ensureSystem(); render(); flushSoon(); toast('Conectado a tu hoja');
}

/* ============================ EVENTOS ============================ */
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]'); if(!b) return;
  const a=b.dataset.act, id=b.dataset.id, v=b.dataset.v;
  if(a==='dclose'&&e.target!==b) return;
  switch(a){
    case 'go': if(b.dataset.rep) S.rep=b.dataset.rep; if(b.dataset.plan) S.plan=b.dataset.plan; go(v); break;
    case 'mprev': S.month=addMonth(S.month,-1); render(); break;
    case 'mnext': S.month=addMonth(S.month,1); render(); break;
    case 'rep': S.rep=v; render(); break;
    case 'plan': S.plan=v; render(); break;
    case 'tipo': S.form.tipo=v; S.form.cat=''; S.form.sub=''; S.form.extra={}; render(); break;
    case 'cat': S.form.cat=id; S.form.sub=''; S.form.extra={}; render(); break;
    case 'sub': S.form.sub=S.form.sub===v?'':v; render(); break;
    case 'additem': S.form.items.push({n:'',q:'',u:'',p:''}); render(); break;
    case 'delitem': S.form.items.splice(+b.dataset.i,1); if(!S.form.items.length)S.form.items.push({n:'',q:'',u:'',p:''}); render(); break;
    case 'save': saveForm(); break;
    case 'cancel': S.form=newForm(); go('movimientos'); break;
    case 'locnew': captureLocation(); { const el=$('#locstat'); if(el) el.innerHTML='<span>Buscando ubicación…</span>'; } break;
    case 'locclear': S.form.lat=null; S.form.lng=null; S.form.acc=null; S.form.locMsg='Sin ubicación para este gasto.'; { const el=$('#locstat'); if(el) el.innerHTML=locHTML(); } break;
    case 'mov': showMov(id); break;
    case 'editmov': editMov(id); break;
    case 'delmov': if(await ask('¿Eliminar este movimiento?','Eliminar')){dlg('');del(id);toast('Movimiento eliminado')} break;
    case 'dclose': dlg(''); break;
    case 'ask-yes': if(askRes){askRes(true);askRes=null} break;
    case 'ask-no': if(askRes){askRes(false);askRes=null} dlg(''); break;
    case 'pay': payRec(id); break;
    case 'abono': dlgAbono(id); break;
    case 'abono-ok': abonoOk(id); break;
    case 'undoabono': undoAbono(id); break;
    case 'adddeu': addDeu(); break;
    case 'deldeu': { const d=S.docs[id]; if(d&&await ask(`¿Eliminar la deuda con ${d.parte}? Los movimientos ya registrados en tus cuentas se conservan.`,'Eliminar')){dlg('');del(id)} break; }
    case 'applysug': { const c=S.docs[id]; put(id,Object.assign({},c,{presupuesto:+v})); break; }
    case 'applyall': { const e2=[]; S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema&&c.activa!==false).forEach(c=>{const s=sugerido(c.id);if(s)e2.push([c.id,Object.assign({},c,{presupuesto:s.v})])}); if(e2.length){putMany(e2);toast('Sugerencias aplicadas')} break; }
    case 'usesugtotal': put('cfg',Object.assign({kind:'cfg'},S.docs.cfg||{},{presupuestoTotal:+v})); break;
    case 'flyto': if(MAP){ MAP.setView([+b.dataset.lat,+b.dataset.lng],17); $('#map').scrollIntoView({behavior:'smooth',block:'center'}); } break;
    case 'addcta': { const n=$('#nc-n').value.trim(); if(!n) return toast('Escribe el nombre de la cuenta');
      put('cta_'+slug(n)+'_'+rid().slice(-3),{kind:'cta',nombre:n,tipo:$('#nc-t').value,saldoInicial:money($('#nc-s').value),activa:true,orden:S.ctas.length}); toast('Cuenta agregada'); break; }
    case 'archcta': { const c=S.docs[id]; if(c&&await ask(`¿Archivar la cuenta ${c.nombre}? Sus movimientos se conservan.`,'Archivar')){dlg('');put(id,Object.assign({},c,{activa:false}))} break; }
    case 'addrec': { const n=$('#nr-n').value.trim(); if(!n) return toast('Escribe el nombre del pago');
      put('rec_'+slug(n)+'_'+rid().slice(-3),{kind:'rec',nombre:n,tipo:'gasto',cat:$('#nr-c').value,sub:'',monto:money($('#nr-m').value),dia:Math.min(31,Math.max(1,+$('#nr-d').value||1)),aviso:Math.max(0,+$('#nr-a').value||0),cuenta:'',activo:true,ultimoPagado:''}); toast('Pago recurrente agregado'); break; }
    case 'delrec': { const r=S.docs[id]; if(r&&await ask(`¿Eliminar el pago recurrente ${r.nombre}?`,'Eliminar')){dlg('');del(id)} break; }
    case 'togcat': { const c=S.docs[id]; put(id,Object.assign({},c,{activa:c.activa===false})); break; }
    case 'addcat': { const n=$('#nk-n').value.trim(); if(!n) return toast('Escribe el nombre de la categoría');
      const list=s=>s.split(',').map(x=>x.trim()).filter(Boolean);
      put('cat_'+slug(n)+'_'+rid().slice(-3),{kind:'cat',tipo:$('#nk-t').value,nombre:n,color:$('#nk-c').value,subs:list($('#nk-s').value),campos:list($('#nk-f').value).map(l=>({k:slug(l),l,t:'text'})),items:false,hormiga:$('#nk-h').checked,sistema:false,presupuesto:money($('#nk-p').value),activa:true,orden:S.cats.length}); toast('Categoría creada'); break; }
    case 'exp': { const rows=[CSV_HEAD].concat([...S.movs].reverse().map(m=>{const c=catOf(m.cat),x=ctaOf(m.cuenta),d=ctaOf(m.cuentaDestino);return [m.fecha,m.hora||'',m.tipo==='transfer'?'transferencia':m.tipo,m.monto,x?x.nombre:'',d?d.nombre:'',c?c.nombre:'',m.sub||'',m.comercio||'',m.lugar||'',m.lat??'',m.lng??'',m.nota||'']}));
      download(`movimientos-${today()}.csv`,rows.map(r=>r.map(csvCell).join(',')).join('\n')); break; }
    case 'tpl': download('plantilla-movimientos.csv',CSV_HEAD.join(',')+'\n2026-10-01,08:30,gasto,12000,Nequi,,Comida,Cafetería,Panadería,Centro,,,Ejemplo'); break;
    case 'sync': if(synced()) pull(true); else toast(S.conf?'Estás en modo local':'Conecta tu hoja primero'); break;
    case 'connect': connect(); break;
    case 'localmode': S.conf={mode:'local'}; LS.set('mf.conf',S.conf); seedAll(); S.loaded=true; render(); break;
    case 'reconnect': if(await ask(S.conf&&S.conf.mode==='local'?'¿Conectar una hoja de Google? Tus datos de este dispositivo se subirán si la hoja está vacía.':'¿Cambiar la conexión? Los datos de este dispositivo se conservan.','Continuar')){dlg('');S.conf=null;S.queue=[];LS.del('mf.conf');LS.set('mf.queue',[]);render()} break;
    case 'install': if(S.installEvt){S.installEvt.prompt();S.installEvt=null;render()} break;
  }
});
document.addEventListener('input',e=>{
  const t=e.target, d=t.dataset; render.busy=true;
  if(d.f){ S.form[d.f]=t.type==='checkbox'?t.checked:t.value; if(d.touch) S.form.horaTouched=true; }
  else if(d.x){ S.form.extra[d.x]=t.type==='checkbox'?t.checked:t.value; }
  else if(d.i!==undefined){ S.form.items[+d.i][d.k]=t.value; const el=$('#itemsTotal'); if(el) el.textContent=fmt(sum(S.form.items,i=>money(i.p))); }
  else if(d.mf){ S.mf[d.mf]=t.value; $('#movlist').innerHTML=movListHTML(); }
});
document.addEventListener('focusout',()=>{render.busy=false});
document.addEventListener('change',e=>{
  const t=e.target, d=t.dataset;
  if(d.trend!==undefined){ S.trendCat=t.value; render(); }
  else if(d.mer!==undefined){ S.mercadoItem=t.value; render(); }
  else if(d.hr!==undefined){ S.hr=t.value; render(); }
  else if(d.mapf){ S.mapF[d.mapf]=t.type==='checkbox'?t.checked:t.value; render(); }
  else if(d.cfg){ put('cfg',Object.assign({kind:'cfg'},S.docs.cfg||{},{[d.cfg]:money(t.value)})); }
  else if(d.cfgb){ put('cfg',Object.assign({kind:'cfg'},S.docs.cfg||{},{[d.cfgb]:t.checked})); }
  else if(d.cta){ const c=S.docs[d.cta]; put(d.cta,Object.assign({},c,{[d.cf]:money(t.value)})); }
  else if(d.cat){ const c=S.docs[d.cat]; put(d.cat,Object.assign({},c,{[d.cf]:money(t.value)})); }
  else if(d.rec){ const r=S.docs[d.rec], k=d.rf; put(d.rec,Object.assign({},r,{[k]:k==='nombre'||k==='cuenta'?t.value:(k==='monto'?money(t.value):Math.max(0,+t.value||0))})); }
  else if(t.id==='imp'&&t.files[0]){ const rd=new FileReader(); rd.onload=()=>importCSV(String(rd.result)); rd.readAsText(t.files[0]); t.value=''; }
  render.busy=false;
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Enter'&&t.dataset&&t.dataset.addsub){ const c=S.docs[t.dataset.addsub], n=t.value.trim(); if(c&&n&&!(c.subs||[]).includes(n)){ put(c.id,Object.assign({},c,{subs:[...(c.subs||[]),n]})); toast('Subcategoría agregada'); } }
  if(e.key==='Escape'&&$('#dlg').innerHTML){ if(askRes){askRes(false);askRes=null} dlg(''); }
});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(VIEWS[h]&&h!==S.view){S.view=h;render()}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.installEvt=e;if(S.view==='ajustes')render()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&synced())pull()});
window.addEventListener('online',()=>{if(synced())pull()});
window.addEventListener('offline',()=>{if(synced()){S.sync='offline';renderStatus()}});
setInterval(()=>{if(document.visibilityState==='visible'&&synced())pull()},120000);

/* ============================ ARRANQUE ============================ */
(function init(){
  { const h=(location.hash||'').slice(1); if(VIEWS[h]) S.view=h; }
  S.docs=LS.get('mf.docs',{}); derive(); if(Object.keys(S.docs).length) S.loaded=true;
  render();
  if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('sw.js').catch(()=>{});
  if(synced()) pull();
})();
