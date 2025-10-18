// ====== Canvas
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

// ====== Background layout baru
const ASSETS = { bg: 'bahan_flyer_bwx.png' };

// ====== Data (maks 2 baris/section)
const state = {
  bgURL: ASSETS.bg,
  arrivals: [
    { airline:'SUPER AIR JET', flight:'IU 370', city:'JAKARTA',  time:'10:15 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1880', city:'SURABAYA', time:'12.40 WIB' }
  ],
  departures: [
    { airline:'SUPER AIR JET', flight:'IU 371', city:'JAKARTA',  time:'10:55 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1881', city:'SURABAYA', time:'13.00 WIB' }
  ]
};

// ====== Posisi default (disesuaikan ke layout 1080×1920)
const POS_DEFAULT = {
  date      : { x:540, y:560,  align:'center', color:'#ffffff', h:54 },
  arr_0_airline:{ x:110, y:650, align:'left',  color:'#ffffff', h:48 },
  arr_0_flight :{ x:420, y:650, align:'left',  color:'#ffffff', h:48 },
  arr_0_city   :{ x:690, y:650, align:'left',  color:'#ffffff', h:48 },
  arr_0_time   :{ x:990, y:650, align:'right', color:'#ffffff', h:48 },

  arr_1_airline:{ x:110, y:760, align:'left',  color:'#ffffff', h:48 },
  arr_1_flight :{ x:420, y:760, align:'left',  color:'#ffffff', h:48 },
  arr_1_city   :{ x:690, y:760, align:'left',  color:'#ffffff', h:48 },
  arr_1_time   :{ x:990, y:760, align:'right', color:'#ffffff', h:48 },

  dep_0_airline:{ x:110, y:1030, align:'left',  color:'#ffffff', h:48 },
  dep_0_flight :{ x:420, y:1030, align:'left',  color:'#ffffff', h:48 },
  dep_0_city   :{ x:690, y:1030, align:'left',  color:'#ffffff', h:48 },
  dep_0_time   :{ x:990, y:1030, align:'right', color:'#ffffff', h:48 },

  dep_1_airline:{ x:110, y:1140, align:'left',  color:'#ffffff', h:48 },
  dep_1_flight :{ x:420, y:1140, align:'left',  color:'#ffffff', h:48 },
  dep_1_city   :{ x:690, y:1140, align:'left',  color:'#ffffff', h:48 },
  dep_1_time   :{ x:990, y:1140, align:'right', color:'#ffffff', h:48 },

  hours     : { x:540, y:1372, align:'center', color:'#ffffff', h:50 } // default putih
};

// ====== Items & posisi override
const LS_KEY = 'fs_positions_v4';
let items = [];
let posOverrides = loadOverrides();
let showGuides = true;

// ====== Ukuran & warna dinamis dari UI
function sizes() {
  const szDate  = +document.getElementById('sizeDate')?.value  || 48;
  const szRow   = +document.getElementById('sizeRow')?.value   || 42;
  const szHours = +document.getElementById('sizeHours')?.value || 44;
  const hoursCol = document.getElementById('hoursColor')?.value || '#ffffff';
  return {
    dateFont : `900 ${szDate}px Montserrat, system-ui, sans-serif`,
    rowFont  : `800 ${szRow}px Montserrat, system-ui, sans-serif`,
    hoursFont: `900 ${szHours}px Montserrat, system-ui, sans-serif`,
    hoursColor: hoursCol,
    rowH   : Math.round(szRow * 1.2),
    dateH : Math.round(szDate * 1.12),
    hoursH: Math.round(szHours * 1.12),
  };
}

// tampilkan nilai range di label kecil
['sizeDate','sizeRow','sizeHours'].forEach(id=>{
  const el = document.getElementById(id);
  const out = document.getElementById(id+'Val');
  if(el && out){ el.addEventListener('input', ()=>{ out.textContent = el.value; render(); }); }
});
document.getElementById('hoursColor')?.addEventListener('input', render);

// ====== build items sekali
function buildItems(){
  items = [];

  items.push({
    id:'date',
    getText: ()=> (document.getElementById('dateText')?.value || 'MINGGU, 19 OKTOBER 2025').toUpperCase(),
  });

  const keys = ['airline','flight','city','time'];
  for(let i=0;i<2;i++){
    keys.forEach(k=>{
      items.push({
        id:`arr_${i}_${k}`,
        getText: ()=> (state.arrivals[i]?.[k] || '').toUpperCase(),
      });
    });
  }
  for(let i=0;i<2;i++){
    keys.forEach(k=>{
      items.push({
        id:`dep_${i}_${k}`,
        getText: ()=> (state.departures[i]?.[k] || '').toUpperCase(),
      });
    });
  }

  items.push({
    id:'hours',
    getText: ()=> (document.getElementById('hoursText')?.value || 'Operating Hours 06.00 - 18.00 WIB')
  });
}
buildItems();

// ====== helpers load/simpan posisi
function loadOverrides(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); }catch{ return {}; } }
function saveOverrides(){ localStorage.setItem(LS_KEY, JSON.stringify(posOverrides)); }

function getPos(id){
  const base = POS_DEFAULT[id];
  const ov = posOverrides[id];
  const S = sizes();
  // pilih font/height per elemen
  let font = S.rowFont, h = S.rowH, color = base.color;
  if(id==='date'){ font = S.dateFont; h = S.dateH; }
  if(id==='hours'){ font = S.hoursFont; h = S.hoursH; color = S.hoursColor; }
  return {
    x: ov?.x ?? base.x,
    y: ov?.y ?? base.y,
    align: base.align,
    color,
    font,
    h
  };
}

// ====== Render
function loadImage(src){
  return new Promise((res, rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
}
async function render(){
  const bg = await loadImage(state.bgURL);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(bg, 0, 0, c.width, c.height);

  items.forEach((it, idx)=>{
    const p = getPos(it.id);
    const text = it.getText();

    ctx.save();
    ctx.font = p.font;
    ctx.fillStyle = p.color;
    ctx.textAlign = p.align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, p.x, p.y);

    if(showGuides){
      const r = getRectForItem(it, text);
      ctx.lineWidth = 2; ctx.strokeStyle = '#00ffff88';
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle='#00ffff'; ctx.font='700 18px Montserrat, system-ui';
      ctx.textAlign='left'; ctx.fillText(`#${idx+1}`, r.x+4, r.y+18);
    }
    ctx.restore();
  });
}

function getRectForItem(it, text){
  const p = getPos(it.id);
  ctx.save(); ctx.font = p.font;
  const w = Math.max(10, ctx.measureText(text).width);
  ctx.restore();
  let x0 = p.x;
  if(p.align==='center') x0 -= w/2;
  else if(p.align==='right') x0 -= w;
  const y0 = p.y - p.h + 6;
  return { x:x0, y:y0, w, h:p.h+8 };
}

// ====== Drag & drop
let dragging = null;
function pointer(e){
  const r = c.getBoundingClientRect();
  const cx = (e.touches? e.touches[0].clientX : e.clientX) - r.left;
  const cy = (e.touches? e.touches[0].clientY : e.clientY) - r.top;
  const sx = c.width/r.width, sy = c.height/r.height;
  return { x: cx*sx, y: cy*sy };
}
function onDown(e){
  const p = pointer(e);
  for(let i=items.length-1;i>=0;i--){
    const it = items[i];
    const r = getRectForItem(it, it.getText());
    if(p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h){
      const pos = getPos(it.id);
      dragging = { id: it.id, offX: pos.x - p.x, offY: pos.y - p.y };
      e.preventDefault(); return;
    }
  }
}
function onMove(e){
  if(!dragging) return;
  const p = pointer(e);
  posOverrides[dragging.id] = { x: Math.round(p.x + dragging.offX), y: Math.round(p.y + dragging.offY) };
  saveOverrides(); render();
}
function onUp(){ dragging = null; }

c.addEventListener('mousedown', onDown);
c.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
c.addEventListener('touchstart', onDown, {passive:false});
c.addEventListener('touchmove', onMove, {passive:false});
c.addEventListener('touchend', onUp);

// ====== Keyboard tools
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='g'){ showGuides=!showGuides; render(); }
  if(e.key.toLowerCase()==='r'){ localStorage.removeItem(LS_KEY); posOverrides={}; render(); }
});

// ====== Sidebar hooks
document.getElementById('bgInput')?.addEventListener('change', (e)=>{
  const f = e.target.files?.[0]; if(!f) return;
  const r=new FileReader(); r.onload=ev=>{ state.bgURL=ev.target.result; render(); }; r.readAsDataURL(f);
});
document.getElementById('renderBtn')?.addEventListener('click', render);
document.getElementById('savePng')?.addEventListener('click', ()=>{
  const a=document.createElement('a'); a.download=`flight-schedule-${Date.now()}.png`; a.href=c.toDataURL('image/png'); a.click();
});
document.getElementById('savePdf')?.addEventListener('click', async ()=>{
  if(!window.jspdf){
    await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s); });
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'p', unit:'px', format:[1080,1920]});
  pdf.addImage(c.toDataURL('image/jpeg',0.96),'JPEG',0,0,1080,1920);
  pdf.save(`flight-schedule-${Date.now()}.pdf`);
});

// ====== Build rows editor
function rowUI(containerId, list){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML='';
  list.slice(0,2).forEach((row, i)=>{
    const wrap = document.createElement('div');
    wrap.className = 'airline-row';
    wrap.innerHTML = `
      <input placeholder="Airlines" value="${row.airline||''}" data-k="airline">
      <input placeholder="Flight No" value="${row.flight||''}" data-k="flight">
      <input placeholder="Origin/Dest" value="${row.city||''}" data-k="city">
      <input placeholder="Time" value="${row.time||''}" data-k="time">
      <button type="button" title="Hapus">✕</button>
    `;
    wrap.querySelectorAll('[data-k]').forEach(inp=>{
      const k = inp.dataset.k;
      inp.oninput = ()=>{ list[i][k] = inp.value; render(); };
    });
    wrap.querySelector('button').onclick = ()=>{ list.splice(i,1); rowUI(containerId, list); render(); };
    el.appendChild(wrap);
  });
}
rowUI('arrivals', state.arrivals);
rowUI('departures', state.departures);

document.getElementById('addArrival')?.addEventListener('click', ()=>{
  if(state.arrivals.length>=2) return;
  state.arrivals.push({airline:'',flight:'',city:'',time:''});
  rowUI('arrivals', state.arrivals); render();
});
document.getElementById('addDeparture')?.addEventListener('click', ()=>{
  if(state.departures.length>=2) return;
  state.departures.push({airline:'',flight:'',city:'',time:''});
  rowUI('departures', state.departures); render();
});

// ====== First render
render().catch(err=>{
  console.warn('Render gagal:', err);
  ctx.fillStyle='#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
});
