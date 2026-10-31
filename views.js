/* ============================ VISTAS ============================ */
function movRow(m){
  const c=catOf(m.cat), color=m.tipo==='transfer'?'#7C3AED':(c?c.color:'#78716C');
  const letter=m.tipo==='transfer'?'⇄':(c?c.nombre[0]:'?');
  const sign=m.tipo==='ingreso'?'+':m.tipo==='gasto'?'−':'';
  const cl=m.tipo==='ingreso'?'in':m.tipo==='transfer'?'tr':'';
  const cta=ctaOf(m.cuenta);
  const meta=[m.comercio,m.lugar,cta?cta.nombre:'',dateLabel(m.fecha)+(m.hora?' · '+m.hora:'')].filter(Boolean).join(' · ');
  return `<button class="row-m" data-act="mov" data-id="${esc(m.id)}"><span class="badge" style="background:${color}">${esc(letter)}</span><span class="mid"><b>${esc(titleOf(m))}${m.hormiga?'<span class="hz">hormiga</span>':''}</b><small>${esc(meta)}</small></span><span class="amt num ${cl}">${sign}${fmt(m.monto)}</span></button>`;
}
function vSetup(){
  return `<section class="card setup"><h2>Conecta tu hoja de Google</h2>
  <p style="margin-top:0;color:var(--muted)">Tus datos viven en una hoja de Google Sheets tuya. La app la lee y escribe a través de un script que tú publicas una sola vez.</p>
  <ol><li>Crea una hoja de Google vacía y abre Extensiones &gt; Apps Script.</li><li>Pega el archivo Code.gs, cambia la clave y ejecuta <b>configurar</b>.</li><li>Implementa como aplicación web (acceso: Cualquier persona) y copia la URL que termina en /exec.</li></ol>
  <div class="fields" style="grid-template-columns:1fr"><label class="f" for="cn-url">URL del script (termina en /exec)<input id="cn-url" type="text" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec"></label>
  <label class="f" for="cn-key">Clave<input id="cn-key" type="password" autocomplete="off" placeholder="La misma que pusiste en el script"></label></div>
  <div class="inline" style="margin-top:14px"><button class="btn" data-act="connect">Conectar</button><button class="btn ghost" data-act="localmode">Probar sin conectar</button></div>
  <p class="hint">Sin conectar, los datos se guardan solo en este dispositivo y no se sincronizan.</p></section>`;
}
function vInicio(){
  const m=S.month, t=totals(m), al=getAlerts();
  const tm=today().slice(0,7);
  const prox=S.recs.filter(r=>r.activo!==false).map(r=>{let d=dueDate(tm,r.dia);if(r.ultimoPagado===tm||d<today())d=dueDate(addMonth(tm,1),r.dia);return {r,d,days:diffDays(today(),d)}}).sort((a,b)=>a.days-b.days);
  const meses=lastMonths(m,6);
  const catsMes=S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema).map(c=>({c,g:gastoCat(m,c.id)})).filter(x=>x.g>0).sort((a,b)=>b.g-a.g).slice(0,5);
  const bud=S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema&&c.presupuesto>0&&c.activa!==false);
  const h=hormiga(m);
  const act=S.deus.filter(d=>d.estado!=='pagada');
  const debo=sum(act.filter(d=>d.dir==='debo'),saldoDeuda), medeben=sum(act.filter(d=>d.dir==='medeben'),saldoDeuda);
  return `
  <div style="margin-bottom:14px"><div class="mswitch"><button data-act="mprev" aria-label="Mes anterior">‹</button><span>${esc(cap(monthLabel(m)))}</span><button data-act="mnext" aria-label="Mes siguiente">›</button></div></div>
  <section class="hero">
    <div class="lbl">Saldo disponible</div>
    <div class="big">${fmt(disponible())}</div>
    <div class="row"><div class="mini"><b>${fmt(t.ing)}</b><span>Ingresos del mes</span></div><div class="mini"><b>${fmt(t.gas)}</b><span>Gastos del mes</span></div><div class="mini"><b>${fmt(t.ing-t.gas)}</b><span>Balance del mes</span></div></div>
    <p class="src">Origen: saldo inicial + ingresos − gastos ± transferencias de las cuentas que no son de inversión. El balance del mes es ingresos − gastos; los préstamos y abonos de deudas no cuentan como ingreso ni gasto.</p>
  </section>
  ${al.length?`<div class="grid" style="margin-top:16px">${al.map(a=>`<div class="alert ${a.lvl}"><div><b>${esc(a.t)}</b><small>${esc(a.s)}</small></div>${a.rec?`<button class="btn sm" data-act="pay" data-id="${esc(a.rec)}">Registrar pago</button>`:a.deu?`<button class="btn sm" data-act="abono" data-id="${esc(a.deu)}">Registrar</button>`:''}</div>`).join('')}</div>`:''}
  <div class="grid g2" style="margin-top:16px">
    <section class="card"><h2>Ingresos y gastos, 6 meses</h2>${chartBars(meses.map(x=>monthLabel(x,true)),[{name:'Ingresos',cls:0,vals:meses.map(x=>totals(x).ing)},{name:'Gastos',cls:1,vals:meses.map(x=>totals(x).gas)}])}<p class="src">Origen: suma de movimientos por mes (Movimientos).</p></section>
    <section class="card"><h2>En qué se va el mes</h2>${catsMes.length?catsMes.map(x=>progress(esc(x.c.nombre),x.g,t.gas,x.c.color,`${fmt(x.g)} · ${Math.round(x.g/t.gas*100)}%`)).join(''):'<div class="empty">Aún no hay gastos este mes.</div>'}<p class="src">Porcentaje = gasto de la categoría ÷ gasto total del mes.</p></section>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <section class="card"><h2>Gasto hormiga</h2><div class="kpi"><b>${fmt(h.total)}</b><span>${h.n} movimientos · ${Math.round(h.share*100)}% del gasto</span></div><p class="src">Monto ≤ ${fmt(S.cfg.hormigaMax)} en categorías elegibles.</p><button class="btn ghost sm" style="margin-top:10px" data-act="go" data-v="reportes" data-rep="hormiga">Ver detalle</button></section>
    <section class="card"><h2>Deudas</h2><div class="kpi"><b>${fmt(debo)}</b><span>Debes</span></div><div class="kpi" style="margin-top:8px"><b>${fmt(medeben)}</b><span>Te deben</span></div><button class="btn ghost sm" style="margin-top:10px" data-act="go" data-v="plan" data-plan="deudas">Ver deudas</button></section>
    <section class="card"><h2>Próximos pagos fijos</h2>${prox.length?prox.map(p=>`<div class="prow"><span>${esc(p.r.nombre)}</span><b class="num">${p.r.monto>0?fmt(p.r.monto):'sin monto'}</b><small style="grid-column:1/-1;color:var(--muted)">${esc(dateLabel(p.d))} · ${p.days===0?'hoy':'en '+p.days+' días'}</small></div>`).join(''):'<div class="empty">Sin pagos recurrentes. Agrégalos en Ajustes.</div>'}</section>
  </div>
  ${(bud.length||S.cfg.presupuestoTotal>0)?`<section class="card" style="margin-top:16px"><h2>Presupuestos del mes</h2>${S.cfg.presupuestoTotal>0?progress('<b>Total del mes</b>',t.gas,S.cfg.presupuestoTotal,t.gas>=S.cfg.presupuestoTotal?'var(--bad)':t.gas>=S.cfg.presupuestoTotal*.8?'var(--warn)':'var(--accent)',`${fmt(t.gas)} / ${fmt(S.cfg.presupuestoTotal)}`):''}${bud.map(c=>{const g=gastoCat(m,c.id);return progress(esc(c.nombre),g,c.presupuesto,g>=c.presupuesto?'var(--bad)':g>=c.presupuesto*.8?'var(--warn)':c.color,`${fmt(g)} / ${fmt(c.presupuesto)}`)}).join('')}</section>`:''}
  <section class="card" style="margin-top:16px"><h2>Últimos movimientos</h2><div class="list">${S.movs.slice(0,6).map(movRow).join('')||'<div class="empty">Todavía no hay movimientos. Registra el primero.</div>'}</div><button class="btn ghost sm" style="margin-top:10px" data-act="go" data-v="movimientos">Ver todos</button></section>`;
}
function locHTML(){
  const f=S.form; if(f.tipo!=='gasto') return '';
  if(f.lat!=null) return `<span class="tag">Ubicación guardada${f.acc?` (±${Math.round(f.acc)} m)`:''}</span><button type="button" class="btn ghost sm" data-act="locnew">Actualizar</button><button type="button" class="btn ghost sm" data-act="locclear">Quitar</button>`;
  if(f.locMsg) return `<span>${esc(f.locMsg)}</span><button type="button" class="btn ghost sm" data-act="locnew">Reintentar</button>`;
  if(S.cfg.ubicacion===false) return `<span>Ubicación automática desactivada en Ajustes.</span><button type="button" class="btn ghost sm" data-act="locnew">Guardar ubicación ahora</button>`;
  return '<span>Buscando ubicación…</span>';
}
function vRegistrar(){
  const f=S.form, ctas=S.ctas.filter(c=>c.activa!==false);
  if(!f.cuenta&&ctas.length) f.cuenta=S.lastCuenta&&ctaOf(S.lastCuenta)?S.lastCuenta:ctas[0].id;
  const cats=S.cats.filter(c=>c.activa!==false&&!c.sistema&&c.tipo===f.tipo), cat=catOf(f.cat);
  const mer=cat&&cat.items&&f.tipo==='gasto';
  const itemsTotal=sum(f.items,i=>money(i.p));
  const campos=(cat?cat.campos||[]:[]).filter(c=>!c.sub||c.sub===f.sub);
  const lugares=[...new Set(S.movs.map(m=>m.lugar).filter(Boolean))].slice(0,80);
  const nombres=[...new Set(S.movs.flatMap(m=>(m.items||[]).map(i=>i.n)).filter(Boolean))].slice(0,200);
  const horaVal=f.horaTouched?f.hora:(f.fecha===today()?nowHM():'');
  return `<section class="card">
    <h2>${f.editId?'Editar movimiento':'Registrar movimiento'}</h2>
    <div class="seg" role="group" aria-label="Tipo de movimiento">${[['gasto','Gasto'],['ingreso','Ingreso'],['transfer','Transferencia']].map(([v,l])=>`<button type="button" data-act="tipo" data-v="${v}" aria-pressed="${f.tipo===v}">${l}</button>`).join('')}</div>
    ${mer?`<div class="kpi"><span>Total de la compra (suma de ítems)</span><b id="itemsTotal">${fmt(itemsTotal)}</b></div>`:`<label class="f" for="f-monto">Monto (COP)<input id="f-monto" class="bigin num" type="text" inputmode="numeric" placeholder="0" value="${esc(f.monto)}" data-f="monto" autocomplete="off"></label>`}
    <div class="fields">
      <label class="f" for="f-fecha">Fecha<input id="f-fecha" type="date" value="${esc(f.fecha)}" data-f="fecha"></label>
      <label class="f" for="f-hora">Hora<input id="f-hora" type="time" value="${esc(horaVal)}" data-f="hora" data-touch="1"></label>
      <label class="f" for="f-cuenta">${f.tipo==='transfer'?'Cuenta de origen':f.tipo==='ingreso'?'Cuenta que recibe':'Cuenta que paga'}<select id="f-cuenta" data-f="cuenta">${opts(ctas.map(c=>[c.id,c.nombre]),f.cuenta)}</select></label>
      ${f.tipo==='transfer'?`<label class="f" for="f-dest">Cuenta de destino<select id="f-dest" data-f="cuentaDestino">${opts(ctas.map(c=>[c.id,c.nombre]),f.cuentaDestino,'Elegir')}</select></label>`:''}
    </div>
    <p class="hint">La hora se toma al guardar si no la cambias. Si registras un movimiento de otra fecha, queda sin hora.</p>
    ${f.tipo==='transfer'?`<p class="hint">Una transferencia no es gasto ni ingreso. Para un aporte a Deriv, elige Deriv como destino.</p>`:`
    <div class="sect">Categoría</div>
    <div class="chips" role="group" aria-label="Categoría">${cats.map(c=>`<button type="button" class="chip" data-act="cat" data-id="${esc(c.id)}" aria-pressed="${f.cat===c.id}"><i style="background:${c.color}"></i>${esc(c.nombre)}</button>`).join('')}</div>
    ${cat&&cat.subs&&cat.subs.length?`<div class="sect">Subcategoría</div><div class="chips" role="group" aria-label="Subcategoría">${cat.subs.map(s=>`<button type="button" class="chip" data-act="sub" data-v="${esc(s)}" aria-pressed="${f.sub===s}">${esc(s)}</button>`).join('')}</div>`:''}
    ${campos.length?`<div class="fields">${campos.map(c=>c.t==='check'?`<label class="f" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" data-x="${esc(c.k)}"${f.extra[c.k]?' checked':''}>${esc(c.l)}</label>`:`<label class="f">${esc(c.l)}<input type="text" data-x="${esc(c.k)}" value="${esc(f.extra[c.k]||'')}"></label>`).join('')}</div>`:''}
    ${mer?`<div class="sect">Ítems de la compra</div>
      <datalist id="dl-items">${nombres.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
      ${f.items.map((it,i)=>`<div class="irow"><input type="text" list="dl-items" placeholder="Ítem (ej. arroz)" aria-label="Ítem" data-i="${i}" data-k="n" value="${esc(it.n)}"><input type="text" inputmode="decimal" placeholder="Cant." aria-label="Cantidad" data-i="${i}" data-k="q" value="${esc(it.q)}"><input class="u" type="text" placeholder="Unidad" aria-label="Unidad" data-i="${i}" data-k="u" value="${esc(it.u)}"><input type="text" inputmode="numeric" placeholder="Precio" aria-label="Precio del ítem" data-i="${i}" data-k="p" value="${esc(it.p)}"><button class="x" type="button" data-act="delitem" data-i="${i}" aria-label="Quitar ítem">×</button></div>`).join('')}
      <button type="button" class="btn ghost sm" style="margin-top:10px" data-act="additem">Agregar ítem</button>
      <p class="hint">Escribe el nombre siempre igual (arroz, no "Arroz 500g") para comparar precios entre compras.</p>`:''}
    <div class="fields">
      <label class="f">Comercio o tienda<input type="text" data-f="comercio" value="${esc(f.comercio)}" placeholder="Ej. Éxito, panadería del barrio"></label>
      <label class="f">Lugar (barrio o sitio)<input type="text" list="dl-lug" data-f="lugar" value="${esc(f.lugar)}" placeholder="Ej. Centro, Universidad"><datalist id="dl-lug">${lugares.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></label>
      ${f.tipo==='gasto'?`<label class="f">Gasto hormiga<select data-f="hormiga">${opts([['auto',`Automático (≤ ${fmt(S.cfg.hormigaMax)} en categorías elegibles)`],['si','Sí, marcar'],['no','No']],f.hormiga)}</select></label>`:''}
    </div>
    <div class="loc" id="locstat">${locHTML()}</div>`}
    <div class="fields"><label class="f" style="grid-column:1/-1">Nota (opcional)<input type="text" data-f="nota" value="${esc(f.nota)}"></label></div>
    <div class="inline" style="margin-top:16px"><button class="btn" data-act="save">${f.editId?'Guardar cambios':'Guardar movimiento'}</button>${f.editId?'<button class="btn ghost" data-act="cancel">Cancelar edición</button>':''}</div>
  </section>`;
}
function movFiltered(){
  const f=S.mf,q=f.q.trim().toLowerCase();
  return S.movs.filter(m=>(!f.tipo||m.tipo===f.tipo)&&(!f.cat||m.cat===f.cat)&&(!f.cta||m.cuenta===f.cta||m.cuentaDestino===f.cta)&&(!f.mes||m.fecha.startsWith(f.mes))&&(!q||[titleOf(m),m.comercio,m.lugar,m.nota,...Object.values(m.extra||{}),...(m.items||[]).map(i=>i.n)].join(' ').toLowerCase().includes(q)));
}
function movListHTML(){
  const a=movFiltered(); if(!a.length) return '<div class="empty">No hay movimientos con estos filtros.</div>';
  const ing=sum(a.filter(x=>x.tipo==='ingreso'&&!neutral(x)),x=>x.monto), gas=sum(a.filter(x=>x.tipo==='gasto'&&!neutral(x)),x=>x.monto);
  return `<p class="src" style="margin:0 0 8px">${a.length} movimientos · ingresos ${fmt(ing)} · gastos ${fmt(gas)}</p><div class="list">${a.slice(0,300).map(movRow).join('')}</div>${a.length>300?'<p class="hint">Se muestran los 300 más recientes. Afina los filtros para ver el resto.</p>':''}`;
}
function vMovs(){
  const f=S.mf;
  return `<section class="card"><h2>Movimientos</h2>
    <div class="fields" style="margin-top:0">
      <label class="f">Buscar<input type="search" data-mf="q" value="${esc(f.q)}" placeholder="Comercio, lugar, nota, ítem"></label>
      <label class="f">Mes<input type="text" data-mf="mes" value="${esc(f.mes)}" placeholder="AAAA-MM (vacío = todos)"></label>
      <label class="f">Tipo<select data-mf="tipo">${opts([['gasto','Gastos'],['ingreso','Ingresos'],['transfer','Transferencias']],f.tipo,'Todos')}</select></label>
      <label class="f">Categoría<select data-mf="cat">${opts(S.cats.map(c=>[c.id,c.nombre+(c.sistema?(c.tipo==='gasto'?' (salida)':' (entrada)'):'')]),f.cat,'Todas')}</select></label>
      <label class="f">Cuenta<select data-mf="cta">${opts(S.ctas.map(c=>[c.id,c.nombre]),f.cta,'Todas')}</select></label>
    </div>
    <div id="movlist" style="margin-top:12px">${movListHTML()}</div></section>`;
}
function vCuentas(){
  const act=S.ctas.filter(c=>c.activa!==false);
  const norm=act.filter(c=>c.tipo!=='inversion'), inv=act.filter(c=>c.tipo==='inversion');
  const card=c=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(c.nombre)}</b><span class="pill">${esc(c.tipo)}</span></div><div class="num" style="font-size:24px;font-weight:700;margin:8px 0">${fmt(saldo(c))}</div><label class="f">Saldo inicial<input type="text" inputmode="numeric" data-cta="${esc(c.id)}" data-cf="saldoInicial" value="${c.saldoInicial||0}"></label><div style="margin-top:8px"><button class="btn danger sm" data-act="archcta" data-id="${esc(c.id)}">Archivar</button></div></div>`;
  const invCard=c=>{
    const aportes=sum(S.movs.filter(m=>m.tipo==='transfer'&&m.cuentaDestino===c.id),m=>m.monto), retiros=sum(S.movs.filter(m=>m.tipo==='transfer'&&m.cuenta===c.id),m=>m.monto);
    const divs=sum(S.ingresos.filter(m=>m.cuenta===c.id&&catOf(m.cat)&&/dividend/i.test(catOf(m.cat).nombre)),m=>m.monto);
    const neto=aportes-retiros, rend=neto>0?divs/neto:null;
    return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(c.nombre)}</b><span class="pill">inversión · fuera del disponible</span></div>
      <div class="num" style="font-size:24px;font-weight:700;margin:8px 0">${fmt(saldo(c))}</div>
      <table><tr><td>Aportes (transferencias recibidas)</td><td class="r num">${fmt(aportes)}</td></tr><tr><td>Retiros (transferencias enviadas)</td><td class="r num">${fmt(retiros)}</td></tr><tr><td>Dividendos registrados</td><td class="r num">${fmt(divs)}</td></tr><tr><td>Rendimiento sobre aportes netos</td><td class="r num">${rend==null?'—':(rend*100).toFixed(1).replace('.',',')+'%'}</td></tr></table>
      <p class="src">Rendimiento = dividendos ÷ (aportes − retiros). Sirve para ver cuánto ha pagado la inversión sobre lo que has puesto; no incluye ganancias o pérdidas no realizadas.</p>
      <label class="f" style="margin-top:8px">Saldo inicial<input type="text" inputmode="numeric" data-cta="${esc(c.id)}" data-cf="saldoInicial" value="${c.saldoInicial||0}"></label></div>`;
  };
  return `<div class="grid g3">${norm.map(card).join('')||'<div class="empty">No hay cuentas.</div>'}</div>
  ${inv.length?`<h3 class="sect" style="margin-top:20px">Inversiones</h3><div class="grid g2">${inv.map(invCard).join('')}</div>`:''}
  <section class="card" style="margin-top:16px"><h2>Agregar cuenta</h2><div class="inline"><label class="f">Nombre<input id="nc-n" type="text" placeholder="Ej. Bancolombia ahorros"></label><label class="f">Tipo<select id="nc-t">${opts([['banco','Banco'],['billetera','Billetera'],['efectivo','Efectivo'],['inversion','Inversión']],'banco')}</select></label><label class="f">Saldo inicial<input id="nc-s" type="text" inputmode="numeric" value="0"></label><button class="btn" data-act="addcta">Agregar</button></div></section>`;
}

/* ---------- Planificar: presupuestos y deudas ---------- */
function vPlan(){
  const tabs=[['presupuestos','Presupuestos'],['deudas','Deudas']];
  return `<div class="tabs" role="group" aria-label="Planificar">${tabs.map(([k,l])=>`<button data-act="plan" data-v="${k}" aria-pressed="${S.plan===k}">${l}</button>`).join('')}</div>${S.plan==='deudas'?pDeudas():pPresupuestos()}`;
}
function pPresupuestos(){
  const m=S.month, t=totals(m);
  const rows=S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema&&c.activa!==false).map(c=>{const g=gastoCat(m,c.id),p=c.presupuesto||0;return {c,g,p,s:sugerido(c.id),proy:proyeccion(g)}});
  const pt=S.cfg.presupuestoTotal||0, sumCats=sum(rows,r=>r.p), sugTotal=sum(rows.filter(r=>r.s),r=>r.s.v);
  const pill=(g,p)=>p<=0?'<span class="tag">sin límite</span>':g>=p?'<span class="pill bad">superado</span>':g>=p*.8?'<span class="pill warn">cerca</span>':'<span class="pill good">en rango</span>';
  const nBase=Math.max(0,...rows.filter(r=>r.s&&!r.s.fijo).map(r=>r.s.n));
  return `<div style="margin-bottom:12px"><div class="mswitch"><button data-act="mprev" aria-label="Mes anterior">‹</button><span>${esc(cap(monthLabel(m)))}</span><button data-act="mnext" aria-label="Mes siguiente">›</button></div></div>
  <section class="card"><h2>Presupuesto total del mes</h2>
    <div class="inline"><label class="f">Tope total (COP)<input type="text" inputmode="numeric" data-cfg="presupuestoTotal" value="${pt}" style="max-width:200px"></label>${sugTotal>0?`<button class="btn ghost" data-act="usesugtotal" data-v="${sugTotal}">Usar sugerido (${fmt(sugTotal)})</button>`:''}</div>
    ${pt>0?progress('Gastado este mes',t.gas,pt,t.gas>=pt?'var(--bad)':t.gas>=pt*.8?'var(--warn)':'var(--accent)',`${fmt(t.gas)} de ${fmt(pt)} · ${Math.round(t.gas/pt*100)}%`):'<p class="hint">Define un tope para ver el avance y recibir alertas al 80% y al 100%.</p>'}
    ${pt>0&&sumCats>0?`<p class="src">La suma de los límites por categoría es ${fmt(sumCats)} (${sumCats>pt?'supera':'queda por debajo de'} el tope total por ${fmt(Math.abs(sumCats-pt))}).</p>`:''}
  </section>
  <section class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><h2 style="margin:0">Por categoría</h2>${sugTotal>0?'<button class="btn ghost sm" data-act="applyall">Aplicar todas las sugerencias</button>':''}</div>
  <div class="scroll"><table><tr><th>Categoría</th><th>Presupuesto</th><th class="r">Gastado</th><th class="r">Disponible</th><th>Estado</th><th class="r">Proyección</th><th class="r">Sugerido</th></tr>
  ${rows.map(r=>`<tr><td><i class="chip" style="padding:0;border:0;gap:0"><i style="background:${r.c.color};margin-right:8px"></i></i>${esc(r.c.nombre)}</td><td><input type="text" inputmode="numeric" style="max-width:120px" data-cat="${esc(r.c.id)}" data-cf="presupuesto" value="${r.p}" aria-label="Presupuesto de ${esc(r.c.nombre)}"></td><td class="r num">${fmt(r.g)}</td><td class="r num" style="color:${r.p>0&&r.g>r.p?'var(--bad)':'inherit'}">${r.p>0?fmt(r.p-r.g):'—'}</td><td>${pill(r.g,r.p)}</td><td class="r num">${r.g>0?fmt(r.proy):'—'}</td><td class="r num">${r.s?`${fmt(r.s.v)} <button class="btn ghost sm" data-act="applysug" data-id="${esc(r.c.id)}" data-v="${r.s.v}" aria-label="Aplicar sugerido a ${esc(r.c.nombre)}">Aplicar</button>`:'—'}</td></tr>`).join('')}</table></div>
  <p class="src">Origen de cada columna: Gastado = suma de gastos de la categoría en el mes. Disponible = presupuesto − gastado. Sugerido = promedio mensual de esa categoría en los ${nBase||'hasta 3'} mes(es) anteriores con movimientos, redondeado a miles; si la categoría tiene un pago recurrente con monto, se sugiere ese monto. Proyección = gastado ÷ día actual × días del mes (solo mes en curso); sirve como ritmo, pero sobreestima o subestima gastos fijos que se pagan un solo día. Con pocos meses de historial, el promedio es poco estable.</p></section>`;
}
function pDeudas(){
  const act=S.deus.filter(d=>d.estado!=='pagada'), pag=S.deus.filter(d=>d.estado==='pagada');
  const debo=act.filter(d=>d.dir==='debo'), md=act.filter(d=>d.dir==='medeben');
  const card=d=>{
    const sd=saldoDeuda(d), p=pagado(d), pct=d.monto>0?p/d.monto*100:0;
    const days=d.vence?diffDays(today(),d.vence):null;
    const venc=d.vence?`${days<0?'<span class="pill bad">vencida</span>':days<=(d.aviso??5)?'<span class="pill warn">pronto</span>':'<span class="tag">al día</span>'} ${esc(dateLabel(d.vence))}${d.frec==='mensual'?' · cada mes':''}`:'<span class="tag">sin fecha</span>';
    return `<div class="card dcard"><div class="head"><b>${esc(d.parte)}</b><span class="num" style="font-weight:700">${fmt(sd)}</span></div><small style="color:var(--muted)">${esc(d.concepto||'')}${d.cuota>0?` · cuota ${fmt(d.cuota)}`:''}</small>
      <div class="bar"><div style="width:${Math.min(100,pct).toFixed(1)}%;background:var(--accent)"></div></div>
      <small style="color:var(--muted)">${d.dir==='debo'?'Pagado':'Cobrado'} ${fmt(p)} de ${fmt(d.monto)} (${Math.round(pct)}%)</small>
      <div>${venc}</div>
      ${(d.pagos||[]).length?`<details><summary>${d.dir==='debo'?'Abonos':'Cobros'} (${d.pagos.length})</summary><table>${[...d.pagos].reverse().map(x=>`<tr><td>${esc(dateLabel(x.f))}</td><td class="r num">${fmt(x.m)}</td></tr>`).join('')}</table></details>`:''}
      <div class="inline"><button class="btn sm" data-act="abono" data-id="${esc(d.id)}">${d.dir==='debo'?'Registrar abono':'Registrar cobro'}</button>${(d.pagos||[]).length?`<button class="btn ghost sm" data-act="undoabono" data-id="${esc(d.id)}">Deshacer último</button>`:''}<button class="btn danger sm" data-act="deldeu" data-id="${esc(d.id)}">Eliminar</button></div></div>`;
  };
  const ctas=S.ctas.filter(c=>c.activa!==false);
  return `<div class="grid g2"><section class="card kpi"><b>${fmt(sum(debo,saldoDeuda))}</b><span>Lo que debes (${debo.length})</span></section><section class="card kpi"><b>${fmt(sum(md,saldoDeuda))}</b><span>Lo que te deben (${md.length})</span></section></div>
  <h3 class="sect" style="margin-top:16px">Lo que debo</h3><div class="grid g2">${debo.map(card).join('')||'<div class="empty">Sin deudas pendientes.</div>'}</div>
  <h3 class="sect" style="margin-top:16px">Lo que me deben</h3><div class="grid g2">${md.map(card).join('')||'<div class="empty">Nadie te debe por ahora.</div>'}</div>
  ${pag.length?`<h3 class="sect" style="margin-top:16px">Saldadas</h3><div class="grid g2">${pag.map(card).join('')}</div>`:''}
  <section class="card" style="margin-top:16px"><h2>Agregar deuda o préstamo</h2>
    <div class="fields" style="margin-top:0">
      <label class="f">Tipo<select id="dn-dir">${opts([['debo','Yo debo'],['medeben','Me deben']],'debo')}</select></label>
      <label class="f">Persona o entidad<input id="dn-parte" type="text" placeholder="Ej. Nu, Carlos"></label>
      <label class="f">Concepto<input id="dn-con" type="text" placeholder="Ej. Tarjeta, préstamo para moto"></label>
      <label class="f">Monto total (COP)<input id="dn-monto" type="text" inputmode="numeric" value="0"></label>
      <label class="f">Cuota (opcional)<input id="dn-cuota" type="text" inputmode="numeric" value="0"></label>
      <label class="f">Próxima fecha de pago o cobro<input id="dn-vence" type="date"></label>
      <label class="f">Frecuencia<select id="dn-frec">${opts([['unica','Pago único'],['mensual','Se repite cada mes']],'unica')}</select></label>
      <label class="f">Avisar (días antes)<input id="dn-aviso" type="number" min="0" max="30" value="${S.cfg.avisoDias||5}"></label>
      <label class="f">Cuenta (si reflejas el dinero)<select id="dn-cta">${opts(ctas.map(c=>[c.id,c.nombre]),S.lastCuenta||(ctas[0]||{}).id)}</select></label>
    </div>
    <label class="f" style="flex-direction:row;align-items:center;gap:8px;margin-top:12px"><input id="dn-ref" type="checkbox">Reflejar hoy el dinero en mis cuentas (lo recibí o lo presté)</label>
    <p class="hint">Si lo marcas, el saldo de la cuenta sube (si debes) o baja (si te deben) por el monto total. Los préstamos y abonos no cuentan como ingreso ni gasto en tus reportes, solo mueven saldos. Los intereses sí son un gasto: regístralos en Comisiones y costos financieros.</p>
    <div style="margin-top:12px"><button class="btn" data-act="adddeu">Agregar</button></div></section>`;
}

/* ---------- Reportes ---------- */
function vReportes(){
  const tabs=[['resumen','Resumen'],['tendencias','Tendencias y lugares'],['hormiga','Gasto hormiga'],['horarios','Horarios'],['mapa','Mapa de calor'],['mercado','Mercado'],['emprendimiento','Emprendimiento']];
  const body={resumen:rResumen,tendencias:rTend,hormiga:rHormiga,horarios:rHorarios,mapa:rMapa,mercado:rMercado,emprendimiento:rEmpr}[S.rep]();
  const needsMonth=!['mapa'].includes(S.rep)&&!(S.rep==='horarios'&&S.hr!=='mes');
  return `${needsMonth?`<div style="margin-bottom:12px"><div class="mswitch"><button data-act="mprev" aria-label="Mes anterior">‹</button><span>${esc(cap(monthLabel(S.month)))}</span><button data-act="mnext" aria-label="Mes siguiente">›</button></div></div>`:''}
  <div class="tabs" role="group" aria-label="Reportes">${tabs.map(([k,l])=>`<button data-act="rep" data-v="${k}" aria-pressed="${S.rep===k}">${l}</button>`).join('')}</div>${body}`;
}
const delta=(a,b)=>b>0?`${a>=b?'+':''}${Math.round((a-b)/b*100)}% vs mes anterior`:(a>0?'nuevo este mes':'—');
function rResumen(){
  const m=S.month,p=addMonth(m,-1),ms=lastMonths(m,6),t=totals(m),tp=totals(p);
  const rows=S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema).map(c=>({c,g:gastoCat(m,c.id),gp:gastoCat(p,c.id)})).filter(x=>x.g>0||x.gp>0).sort((a,b)=>b.g-a.g);
  return `<div class="grid g2"><section class="card"><h2>Ingresos vs gastos</h2>${chartBars(ms.map(x=>monthLabel(x,true)),[{name:'Ingresos',cls:0,vals:ms.map(x=>totals(x).ing)},{name:'Gastos',cls:1,vals:ms.map(x=>totals(x).gas)}])}<p class="src">Origen: suma de movimientos tipo ingreso y gasto por mes. Las transferencias y los movimientos de deudas no cuentan.</p></section>
  <section class="card"><h2>Resumen del mes</h2><div class="grid g2"><div class="kpi"><b>${fmt(t.ing)}</b><span>Ingresos · ${delta(t.ing,tp.ing)}</span></div><div class="kpi"><b>${fmt(t.gas)}</b><span>Gastos · ${delta(t.gas,tp.gas)}</span></div><div class="kpi"><b>${fmt(t.ing-t.gas)}</b><span>Balance (ingresos − gastos)</span></div><div class="kpi"><b>${t.ing>0?Math.round((t.ing-t.gas)/t.ing*100)+'%':'—'}</b><span>Tasa de ahorro = balance ÷ ingresos</span></div></div><p class="src">Variación % = (mes actual − mes anterior) ÷ mes anterior. Mide el cambio relativo y por eso un mes anterior muy bajo puede dar porcentajes enormes.</p></section></div>
  <section class="card" style="margin-top:16px"><h2>Gasto por categoría</h2><div class="scroll"><table><tr><th>Categoría</th><th class="r">Este mes</th><th class="r">Mes anterior</th><th class="r">Cambio</th><th class="r">% del gasto</th></tr>${rows.map(x=>`<tr><td><i class="chip" style="padding:0;border:0;gap:0"><i style="background:${x.c.color};margin-right:8px"></i></i>${esc(x.c.nombre)}</td><td class="r num">${fmt(x.g)}</td><td class="r num">${fmt(x.gp)}</td><td class="r">${delta(x.g,x.gp).replace(' vs mes anterior','')}</td><td class="r">${t.gas?Math.round(x.g/t.gas*100)+'%':'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">Sin gastos en este periodo.</td></tr>'}</table></div></section>`;
}
function rTend(){
  const m=S.month,ms=lastMonths(m,6),gc=S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema);
  if(!S.trendCat||!catOf(S.trendCat)) S.trendCat=(gc.map(c=>({c,g:sum(ms,x=>gastoCat(x,c.id))})).sort((a,b)=>b.g-a.g)[0]||{c:gc[0]||{}}).c.id||'';
  const c=catOf(S.trendCat), vals=ms.map(x=>gastoCat(x,S.trendCat)), avg=sum(vals,v=>v)/ms.length;
  const subs={};S.gastos.filter(x=>x.cat===S.trendCat&&x.fecha.startsWith(m)).forEach(x=>{const k=x.sub||'(sin subcategoría)';(subs[k]=subs[k]||{k,n:0,t:0});subs[k].n++;subs[k].t+=x.monto});
  const subl=Object.values(subs).sort((a,b)=>b.t-a.t);
  const lug={};S.gastos.filter(x=>x.fecha.startsWith(m)).forEach(x=>{const k=x.lugar||'(sin lugar)';(lug[k]=lug[k]||{k,n:0,t:0});lug[k].n++;lug[k].t+=x.monto});
  const lugl=Object.values(lug).sort((a,b)=>b.t-a.t).slice(0,10);
  return `<div class="grid g2"><section class="card"><h2>Tendencia por categoría</h2><label class="f">Categoría<select data-trend>${opts(gc.map(x=>[x.id,x.nombre]),S.trendCat)}</select></label>
  ${chartBars(ms.map(x=>monthLabel(x,true)),[{name:c?c.nombre:'',cls:0,vals}])}<p class="src">Origen: gastos de la categoría por mes. Promedio de 6 meses = suma ÷ 6: ${fmt(avg)}. Este mes está ${avg>0?Math.round((vals[5]-avg)/avg*100)+'% '+(vals[5]>=avg?'por encima':'por debajo'):'sin referencia'} del promedio.</p></section>
  <section class="card"><h2>Subcategorías del mes</h2>${subl.length?`<table><tr><th>Subcategoría</th><th class="r">Veces</th><th class="r">Total</th><th class="r">Promedio</th></tr>${subl.map(x=>`<tr><td>${esc(x.k)}</td><td class="r">${x.n}</td><td class="r num">${fmt(x.t)}</td><td class="r num">${fmt(x.t/x.n)}</td></tr>`).join('')}</table>`:'<div class="empty">Sin gastos en esta categoría este mes.</div>'}<p class="src">Promedio = total ÷ número de movimientos (ticket medio).</p></section></div>
  <section class="card" style="margin-top:16px"><h2>Dónde gastas</h2>${lugl.length?`<table><tr><th>Lugar</th><th class="r">Veces</th><th class="r">Total</th></tr>${lugl.map(x=>`<tr><td>${esc(x.k)}</td><td class="r">${x.n}</td><td class="r num">${fmt(x.t)}</td></tr>`).join('')}</table>`:'<div class="empty">Registra el lugar en tus gastos para ver este cuadro.</div>'}<p class="src">Origen: campo Lugar de cada gasto del mes. Para verlo en un mapa, abre Mapa de calor.</p></section>`;
}
function rHormiga(){
  const m=S.month,h=hormiga(m),rep=h.porTipo.filter(x=>x.n>=3);
  return `<div class="grid g3"><section class="card kpi"><b>${fmt(h.total)}</b><span>Total hormiga del mes</span></section><section class="card kpi"><b>${h.n}</b><span>Movimientos hormiga</span></section><section class="card kpi"><b>${Math.round(h.share*100)}%</b><span>del gasto total (${fmt(h.gasTotal)})</span></section></div>
  <p class="src">Definición: gasto en categoría elegible con monto ≤ ${fmt(S.cfg.hormigaMax)} (o marcado a mano). Repetición: mismo tipo de gasto 3 veces o más en el mes. Porcentaje = total hormiga ÷ gasto total.</p>
  <div class="grid g2" style="margin-top:16px"><section class="card"><h2>Qué se repite</h2>${h.porTipo.length?h.porTipo.slice(0,10).map(x=>progress(`${esc(x.k)} <small style="color:var(--muted)">× ${x.n}</small>${x.n>=3?'<span class="hz">se repite</span>':''}`,x.t,h.total,'var(--accent)')).join(''):'<div class="empty">Sin gastos hormiga este mes.</div>'}${rep.length?`<p class="src">Si recortaras a la mitad lo que se repite, ahorrarías cerca de ${fmt(sum(rep,x=>x.t)/2)} al mes (estimación: 50% × suma de grupos repetidos).</p>`:''}</section>
  <section class="card"><h2>Dónde ocurre</h2>${h.porLugar.length?`<table><tr><th>Lugar o comercio</th><th class="r">Veces</th><th class="r">Total</th></tr>${h.porLugar.slice(0,10).map(x=>`<tr><td>${esc(x.k)}</td><td class="r">${x.n}</td><td class="r num">${fmt(x.t)}</td></tr>`).join('')}</table>`:'<div class="empty">Agrega lugar o comercio a tus gastos pequeños.</div>'}</section></div>
  <section class="card" style="margin-top:16px"><h2>Por semana del mes</h2>${h.semanas.length?chartBars(h.semanas.map(x=>'Sem '+x.w),[{name:'Hormiga',cls:0,vals:h.semanas.map(x=>x.t)}]):'<div class="empty">Sin datos.</div>'}<p class="src">Semana = días 1–7, 8–14, 15–21, 22–28 y 29 en adelante.</p></section>`;
}
const RANGOS=[['mes','Mes seleccionado'],['90','Últimos 90 días'],['todo','Todo el historial']];
function rHorarios(){
  const H=horarios(S.hr), mx=Math.max(1,...H.grid.flat());
  const topF=[...H.fr].sort((a,b)=>b.t-a.t)[0], topH=H.porHora.indexOf(Math.max(...H.porHora));
  const insight=H.n>0&&topF&&topF.t>0?`Gastas más en la franja de ${topF.l.toLowerCase()} (${topF.r}): ${Math.round(topF.t/H.total*100)}% del total${topF.topCat?`, sobre todo en ${topF.topCat[0]}`:''}. La hora con más gasto es ${topH}:00.`:'';
  return `<section class="card"><div class="inline"><label class="f">Periodo<select data-hr>${opts(RANGOS,S.hr)}</select></label></div>
  ${H.n?`<p style="margin:12px 0 0"><b>${esc(insight)}</b></p>`:'<div class="empty">Aún no hay gastos con hora en este periodo. La hora se guarda sola al registrar.</div>'}
  <p class="src">Base: ${H.n} gastos con hora${H.sin?` (${H.sin} sin hora, excluidos: registrados con otra fecha o anteriores a esta función)`:''}. % de la franja = total de la franja ÷ gasto total con hora. Es una descripción de tu hábito, no una causa: con pocos datos una sola compra grande cambia la conclusión.</p></section>
  ${H.n?`<div class="grid g2" style="margin-top:16px"><section class="card"><h2>Gasto por hora del día</h2>${chartBars(H.porHora.map((_,h)=>String(h)),[{name:'Gasto',cls:0,vals:H.porHora}])}<p class="src">Origen: suma de gastos según la hora registrada (0 a 23).</p></section>
  <section class="card"><h2>Por franja</h2><div class="scroll"><table><tr><th>Franja</th><th class="r">Total</th><th class="r">%</th><th class="r">Veces</th><th class="r">Ticket</th></tr>${H.fr.map(f=>`<tr><td>${esc(f.l)} <small style="color:var(--muted)">${f.r}</small></td><td class="r num">${fmt(f.t)}</td><td class="r">${H.total?Math.round(f.t/H.total*100)+'%':'—'}</td><td class="r">${f.n}</td><td class="r num">${f.n?fmt(f.t/f.n):'—'}</td></tr>`).join('')}</table></div><p class="src">Ticket = total de la franja ÷ número de gastos (gasto promedio por compra).</p></section></div>
  <section class="card" style="margin-top:16px"><h2>Qué consumes en cada franja</h2><div class="grid g3">${H.fr.filter(f=>f.n).map(f=>`<div><b>${esc(f.l)}</b> <small style="color:var(--muted)">${f.r}</small>${f.topTipos.map(([k,v])=>`<div class="prow" style="margin:6px 0 0"><span>${esc(k)}</span><b class="num">${fmt(v)}</b></div>`).join('')}</div>`).join('')}</div><p class="src">Origen: los 3 tipos de gasto (categoría · subcategoría) con mayor total dentro de cada franja.</p></section>
  <section class="card" style="margin-top:16px"><h2>Día de la semana y franja</h2><div class="scroll"><div class="hgrid" style="min-width:420px"><div></div>${FRANJAS.map(f=>`<div class="hh">${esc(f.l)}</div>`).join('')}${DIAS.map((d,i)=>`<div class="hh" style="text-align:left;padding-top:10px">${d}</div>${FRANJAS.map((f,j)=>{const v=H.grid[i][j];return `<div class="hc" style="background:rgba(124,58,237,${(v/mx*.85).toFixed(2)});color:${v/mx>.5?'#fff':'inherit'}" title="${d} ${f.l}: ${fmt(v)}">${v?abbr(v):''}</div>`}).join('')}`).join('')}</div></div><p class="src">Intensidad del color = gasto de la celda ÷ gasto de la celda más alta (${fmt(mx)}).</p></section>`:''}`;
}
function mapPoints(){const f=S.mapF;return rangeGastos(f.range).filter(m=>m.lat!=null&&m.lng!=null&&(!f.cat||m.cat===f.cat)&&(!f.hz||m.hormiga))}
function rMapa(){
  const f=S.mapF, pts=mapPoints(), all=rangeGastos(f.range).filter(m=>(!f.cat||m.cat===f.cat)&&(!f.hz||m.hormiga));
  const z=zonas(pts).slice(0,8), tot=sum(pts,m=>m.monto);
  return `<section class="card"><div class="fields" style="margin-top:0">
    <label class="f">Periodo<select data-mapf="range">${opts(RANGOS,f.range)}</select></label>
    <label class="f">Categoría<select data-mapf="cat">${opts(S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema).map(c=>[c.id,c.nombre]),f.cat,'Todas')}</select></label>
    <label class="f" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" data-mapf="hz"${f.hz?' checked':''}>Solo gasto hormiga</label>
    <label class="f" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" data-mapf="pts"${f.pts?' checked':''}>Mostrar cada gasto</label></div>
  <div id="map" class="map" style="margin-top:12px" role="img" aria-label="Mapa de calor de gastos"></div>
  <p class="src">Mapa: © OpenStreetMap. Cada gasto con ubicación suma intensidad según su monto (monto ÷ mayor monto del periodo). Base: ${pts.length} gastos con ubicación${all.length>pts.length?` de ${all.length} (${all.length-pts.length} sin ubicación, excluidos)`:''}. La precisión del punto depende del GPS del celular (típicamente decenas de metros) y de dónde estabas al registrar, no necesariamente dónde pagaste.</p></section>
  <section class="card" style="margin-top:16px"><h2>Zonas donde más gastas</h2>${z.length?`<table><tr><th>Zona</th><th class="r">Veces</th><th class="r">Total</th><th class="r">% del mapa</th><th></th></tr>${z.map(x=>`<tr><td>${esc(x.nombre)}</td><td class="r">${x.n}</td><td class="r num">${fmt(x.t)}</td><td class="r">${tot?Math.round(x.t/tot*100)+'%':'—'}</td><td class="r"><button class="btn ghost sm" data-act="flyto" data-lat="${x.lat}" data-lng="${x.lng}">Ver</button></td></tr>`).join('')}</table><p class="src">Zona = gastos dentro de una misma cuadrícula de unos 110 m; el nombre es el lugar o comercio más repetido en ella.</p>`:'<div class="empty">Aún no hay gastos con ubicación. Se guardan solos al registrar si das permiso de ubicación.</div>'}</section>`;
}
function rMercado(){
  const compras=S.gastos.filter(m=>catOf(m.cat)&&catOf(m.cat).items);
  if(!compras.length) return `<section class="card"><div class="empty">Aún no hay compras de mercado. Registra una en Registrar → Gasto → Mercado y agrega sus ítems.</div></section>`;
  const rec=compras.slice(0,8).reverse();
  const byL={};compras.forEach(m=>{const k=m.lugar||m.comercio||'(sin lugar)';(byL[k]=byL[k]||{k,n:0,t:0});byL[k].n++;byL[k].t+=m.monto});
  const names=[...new Set(compras.flatMap(m=>(m.items||[]).map(i=>i.n)).filter(Boolean))].sort();
  if(!S.mercadoItem||!names.includes(S.mercadoItem)) S.mercadoItem=names[0]||'';
  const hist=compras.flatMap(m=>(m.items||[]).filter(i=>i.n===S.mercadoItem).map(i=>({f:m.fecha,l:m.lugar||m.comercio||'',q:Number(String(i.q).replace(',','.'))||0,u:i.u,p:money(i.p)}))).sort((a,b)=>a.f.localeCompare(b.f));
  const unit=h=>h.q>0?h.p/h.q:h.p;
  return `<div class="grid g2"><section class="card"><h2>Costo de cada mercado</h2>${chartBars(rec.map(m=>dateLabel(m.fecha)),[{name:'Total',cls:0,vals:rec.map(m=>m.monto)}])}<p class="src">Origen: total de cada compra de Mercado (suma de sus ítems).</p></section>
  <section class="card"><h2>Mercado a mercado</h2><table><tr><th>Lugar</th><th class="r">Compras</th><th class="r">Promedio</th></tr>${Object.values(byL).sort((a,b)=>b.n-a.n).map(x=>`<tr><td>${esc(x.k)}</td><td class="r">${x.n}</td><td class="r num">${fmt(x.t/x.n)}</td></tr>`).join('')}</table><p class="src">Promedio = suma de totales ÷ número de compras en ese lugar.</p></section></div>
  <section class="card" style="margin-top:16px"><h2>Qué compone cada mercado</h2>${compras.slice(0,6).map(m=>`<details style="margin-bottom:8px"><summary><b>${esc(dateLabel(m.fecha))}</b> · ${esc(m.lugar||m.comercio||'sin lugar')} · <span class="num">${fmt(m.monto)}</span> · ${(m.items||[]).length} ítems</summary><table><tr><th>Ítem</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">% de la compra</th></tr>${(m.items||[]).map(i=>`<tr><td>${esc(i.n)}</td><td class="r">${esc(i.q)} ${esc(i.u)}</td><td class="r num">${fmt(money(i.p))}</td><td class="r">${m.monto?Math.round(money(i.p)/m.monto*100)+'%':'—'}</td></tr>`).join('')}</table></details>`).join('')}</section>
  <section class="card" style="margin-top:16px"><h2>Precio de un ítem en el tiempo</h2><label class="f">Ítem<select data-mer>${opts(names.map(n=>[n,n]),S.mercadoItem)}</select></label>${hist.length?`<table><tr><th>Fecha</th><th>Lugar</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Por unidad</th></tr>${hist.map(h=>`<tr><td>${esc(dateLabel(h.f))}</td><td>${esc(h.l)}</td><td class="r">${h.q||''} ${esc(h.u)}</td><td class="r num">${fmt(h.p)}</td><td class="r num">${fmt(unit(h))}</td></tr>`).join('')}</table><p class="src">Por unidad = precio ÷ cantidad. Sirve para comparar el mismo ítem entre compras aunque cambie la cantidad. Mínimo ${fmt(Math.min(...hist.map(unit)))} · máximo ${fmt(Math.max(...hist.map(unit)))}.</p>`:''}</section>`;
}
function rEmpr(){
  const ids=S.cats.filter(c=>/emprend/i.test(c.nombre)).map(c=>c.id), m=S.month,ms=lastMonths(m,6);
  const val=x=>sum(S.ingresos.filter(v=>ids.includes(v.cat)&&v.fecha.startsWith(x)),v=>v.monto);
  const vals=ms.map(val), now=val(m), prev=val(addMonth(m,-1));
  const det=S.ingresos.filter(v=>ids.includes(v.cat)&&v.fecha.startsWith(m));
  return `<div class="grid g2"><section class="card"><h2>Ingresos del emprendimiento</h2>${chartBars(ms.map(x=>monthLabel(x,true)),[{name:'Ingresos',cls:2,vals}])}<p class="src">Origen: movimientos de ingreso en la categoría Emprendimiento.</p></section>
  <section class="card"><h2>Comparación de periodos</h2><div class="grid g2"><div class="kpi"><b>${fmt(now)}</b><span>Este mes</span></div><div class="kpi"><b>${fmt(prev)}</b><span>Mes anterior</span></div></div><p style="margin:12px 0 0"><span class="pill ${now>=prev?'good':'bad'}">${delta(now,prev)}</span></p><p class="src">Variación % = (mes actual − mes anterior) ÷ mes anterior. Compara solo ingresos, no utilidad: no descuenta costos del emprendimiento.</p></section></div>
  <section class="card" style="margin-top:16px"><h2>De qué fue cada ingreso este mes</h2><div class="list">${det.map(movRow).join('')||'<div class="empty">Sin ingresos de emprendimiento este mes.</div>'}</div></section>`;
}

/* ---------- Ajustes ---------- */
function vAjustes(){
  const c=S.conf||{}, local=c.mode==='local';
  let host='';try{host=new URL(c.url).pathname.replace('/macros/s/','').slice(0,14)+'…'}catch(e){}
  return `<div class="grid g2">
  <section class="card"><h2>Conexión con tu hoja</h2>${local?'<p>Modo local: los datos solo están en este dispositivo.</p>':`<p style="margin-top:0">Conectada al script <span class="tag">${esc(host)}</span>. ${S.lastSync?'Última sincronización: '+new Date(S.lastSync).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+'.':''}</p>`}
  <div class="inline">${local?'':'<button class="btn" data-act="sync">Sincronizar ahora</button>'}<button class="btn ghost" data-act="reconnect">${local?'Conectar una hoja':'Cambiar conexión'}</button></div>
  <p class="hint">${S.queue.length?`Hay ${S.queue.length} cambios pendientes de enviar.`:'Todo lo que registras se envía solo; si no hay internet, queda en cola y se envía al volver.'}</p></section>
  <section class="card"><h2>Preferencias</h2><div class="fields" style="margin-top:0"><label class="f">Gasto hormiga: monto máximo (COP)<input type="text" inputmode="numeric" data-cfg="hormigaMax" value="${S.cfg.hormigaMax}"></label><label class="f">Aviso por defecto en deudas (días antes)<input type="number" min="0" max="30" data-cfg="avisoDias" value="${S.cfg.avisoDias}"></label></div>
  <label class="f" style="flex-direction:row;align-items:center;gap:8px;margin-top:12px"><input type="checkbox" data-cfgb="ubicacion"${S.cfg.ubicacion!==false?' checked':''}>Guardar la ubicación de cada gasto automáticamente</label>
  <p class="hint">La ubicación solo se pide al abrir Registrar y se guarda en tu hoja con cada gasto. Sirve para el mapa de calor. Puedes quitarla de un gasto antes de guardarlo.</p></section></div>
  <section class="card" style="margin-top:16px"><h2>Datos</h2><div class="inline"><button class="btn" data-act="exp">Exportar movimientos (CSV)</button><button class="btn ghost" data-act="tpl">Plantilla CSV</button><label class="btn ghost" style="cursor:pointer">Importar CSV<input id="imp" type="file" accept=".csv,text/csv" hidden></label></div><p class="hint">Columnas: fecha, hora, tipo (gasto, ingreso o transferencia), monto, cuenta, cuenta_destino, categoria, subcategoria, comercio, lugar, lat, lng, nota. Las cuentas y categorías deben existir con el mismo nombre. Para traer los datos de la versión de prueba, expórtalos allá e impórtalos aquí.</p></section>
  <section class="card" style="margin-top:16px"><h2>Instalar la app</h2><p style="margin-top:0;color:var(--muted)">Android (Chrome): menú ⋮ → Instalar app. iPhone (Safari): Compartir → Añadir a pantalla de inicio. Computador (Chrome o Edge): ícono de instalar en la barra de direcciones.</p>${S.installEvt?'<button class="btn" data-act="install">Instalar ahora</button>':''}</section>
  <section class="card" style="margin-top:16px"><h2>Pagos recurrentes</h2>${S.recs.map(r=>`<div class="fields" style="align-items:end;border-bottom:1px solid var(--line);padding-bottom:12px"><label class="f">Nombre<input type="text" data-rec="${esc(r.id)}" data-rf="nombre" value="${esc(r.nombre)}"></label><label class="f">Monto<input type="text" inputmode="numeric" data-rec="${esc(r.id)}" data-rf="monto" value="${r.monto||0}"></label><label class="f">Día del mes<input type="number" min="1" max="31" data-rec="${esc(r.id)}" data-rf="dia" value="${r.dia}"></label><label class="f">Avisar (días antes)<input type="number" min="0" max="30" data-rec="${esc(r.id)}" data-rf="aviso" value="${r.aviso}"></label><label class="f">Cuenta habitual<select data-rec="${esc(r.id)}" data-rf="cuenta">${opts(S.ctas.filter(c=>c.activa!==false).map(c=>[c.id,c.nombre]),r.cuenta,'Elegir al pagar')}</select></label><div><button class="btn danger sm" data-act="delrec" data-id="${esc(r.id)}">Eliminar</button></div></div>`).join('')||'<div class="empty">Sin pagos recurrentes.</div>'}
  <h3>Agregar pago recurrente</h3><div class="fields" style="align-items:end"><label class="f">Nombre<input id="nr-n" type="text" placeholder="Ej. Internet"></label><label class="f">Categoría<select id="nr-c">${opts(S.cats.filter(c=>c.tipo==='gasto'&&!c.sistema&&c.activa!==false).map(c=>[c.id,c.nombre]),'cat_servicios')}</select></label><label class="f">Monto<input id="nr-m" type="text" inputmode="numeric" value="0"></label><label class="f">Día del mes<input id="nr-d" type="number" min="1" max="31" value="1"></label><label class="f">Avisar (días antes)<input id="nr-a" type="number" min="0" max="30" value="${S.cfg.avisoDias||5}"></label><div><button class="btn" data-act="addrec">Agregar</button></div></div></section>
  <section class="card" style="margin-top:16px"><h2>Categorías</h2><div class="scroll"><table><tr><th>Categoría</th><th>Tipo</th><th>Presupuesto mensual</th><th>Agregar subcategoría</th><th></th></tr>${S.cats.filter(c=>!c.sistema).map(c=>`<tr style="${c.activa===false?'opacity:.5':''}"><td><i class="chip" style="padding:0;border:0;gap:0"><i style="background:${c.color};margin-right:8px"></i></i>${esc(c.nombre)}<br><small style="color:var(--muted)">${esc((c.subs||[]).join(', '))}</small></td><td>${c.tipo}</td><td>${c.tipo==='gasto'?`<input type="text" inputmode="numeric" style="max-width:140px" data-cat="${esc(c.id)}" data-cf="presupuesto" value="${c.presupuesto||0}" aria-label="Presupuesto de ${esc(c.nombre)}">`:'—'}</td><td><input type="text" style="max-width:170px" data-addsub="${esc(c.id)}" placeholder="Nombre y Enter" aria-label="Nueva subcategoría de ${esc(c.nombre)}"></td><td><button class="btn ghost sm" data-act="togcat" data-id="${esc(c.id)}">${c.activa===false?'Reactivar':'Archivar'}</button></td></tr>`).join('')}</table></div>
  <h3>Crear categoría nueva</h3><div class="fields"><label class="f">Nombre<input id="nk-n" type="text"></label><label class="f">Tipo<select id="nk-t">${opts([['gasto','Gasto'],['ingreso','Ingreso']],'gasto')}</select></label><label class="f">Color<input id="nk-c" type="color" value="#7C3AED"></label><label class="f">Subcategorías (separadas por coma)<input id="nk-s" type="text" placeholder="Ej. Perros, Gatos"></label><label class="f">Campos propios (separados por coma)<input id="nk-f" type="text" placeholder="Ej. Motivo, Proveedor"></label><label class="f">Presupuesto mensual<input id="nk-p" type="text" inputmode="numeric" value="0"></label></div><div class="inline" style="margin-top:12px"><label class="f" style="flex-direction:row;align-items:center;gap:8px"><input id="nk-h" type="checkbox">Puede contar como gasto hormiga</label><button class="btn" data-act="addcat">Crear categoría</button></div></section>`;
}
const VIEWS={inicio:vInicio,registrar:vRegistrar,movimientos:vMovs,reportes:vReportes,cuentas:vCuentas,plan:vPlan,ajustes:vAjustes};

/* ---------- Mapa ---------- */
let MAP=null;
function destroyMap(){if(MAP){try{MAP.remove()}catch(e){}MAP=null}}
function initMap(){
  destroyMap(); const el=$('#map'); if(!el||typeof L==='undefined') return;
  MAP=L.map(el,{preferCanvas:true}).setView([4.57,-74.3],6);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(MAP);
  const pts=mapPoints(); if(!pts.length) return;
  const mx=Math.max(...pts.map(m=>m.monto));
  L.heatLayer(pts.map(m=>[m.lat,m.lng,m.monto/mx]),{radius:28,blur:22,maxZoom:17,gradient:{0.25:'#c4b5fd',0.5:'#8b5cf6',0.75:'#6d28d9',1:'#f97316'}}).addTo(MAP);
  if(S.mapF.pts) pts.forEach(m=>L.circleMarker([m.lat,m.lng],{radius:5,color:'#fff',weight:1,fillColor:'#4C1D95',fillOpacity:.9}).bindTooltip(`${titleOf(m)} · ${fmt(m.monto)}<br>${dateLabel(m.fecha)}${m.hora?' '+m.hora:''}`).addTo(MAP));
  MAP.fitBounds(L.latLngBounds(pts.map(m=>[m.lat,m.lng])).pad(.3),{maxZoom:16});
  setTimeout(()=>MAP&&MAP.invalidateSize(),60);
}

/* ============================ RENDER ============================ */
function render(){
  $('#nav').innerHTML='<div class="brand">Mis finanzas</div>'+NAV.map(([k,l,i,cl])=>`<button class="${k==='registrar'?'primary':''} ${cl||''}" data-act="go" data-v="${k}"${S.view===k?' aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[i]}</svg>${l}</button>`).join('');
  renderStatus();
  $('#banner').innerHTML=S.conf&&S.conf.mode==='local'?'<div class="banner">Modo local: lo que registres solo existe en este dispositivo. Conecta tu hoja en Ajustes para sincronizar y respaldar.</div>':'';
  const act=document.activeElement;
  if(S.view==='registrar'&&act&&act.closest&&act.closest('#main')&&render.busy) return;
  const main=$('#main');
  if(!S.conf){ destroyMap(); main.innerHTML=vSetup(); return; }
  if(!S.loaded&&!Object.keys(S.docs).length){ main.innerHTML='<div class="empty">Cargando tus datos…</div>'; return; }
  main.innerHTML=VIEWS[S.view]();
  afterRender();
}
function afterRender(){
  if(S.view==='registrar'&&!S.form.locTried&&!S.form.editId&&S.cfg.ubicacion!==false&&S.form.tipo==='gasto') captureLocation();
  if(S.view==='reportes'&&S.rep==='mapa') initMap(); else destroyMap();
}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),3200)}
let askRes=null;
function dlg(html){$('#dlg').innerHTML=html?`<div class="ov" data-act="dclose"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`:''}
function ask(msg,ok){return new Promise(res=>{askRes=res;dlg(`<h3>${esc(msg)}</h3><div class="act"><button class="btn ghost" data-act="ask-no">Cancelar</button><button class="btn" data-act="ask-yes">${esc(ok||'Aceptar')}</button></div>`)})}
function go(v){S.view=v;try{location.hash=v}catch(e){}render();window.scrollTo(0,0)}
