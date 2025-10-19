/******************************************************************
 * jadwal.js — v6
 * - Koordinat default sesuai rekomendasi terbaru
 * - Maks 3 baris ARR/DEP
 * - Responsif + Hi-DPI (tajam di retina/HP)
 * - Indikator ID + Koordinat (toggle)
 * - Drag & drop presisi, posisi tersimpan (localStorage)
 * - Logo maskapai otomatis (Super Air Jet / Wings Air)
 ******************************************************************/

// ===== Basis koordinat (jangan diubah)
const BASE_W = 1080;
const BASE_H = 1920;

// ===== Canvas & controls
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

// Terapkan DPR agar tajam di retina/HP
function applyDPR() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  c.width  = BASE_W * dpr;
  c.height = BASE_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // semua gambar pakai unit basis
}
applyDPR();
window.addEventListener('resize', () => { applyDPR(); render(); });

const elDate       = document.getElementById('dateText');
const elHours      = document.getElementById('hoursText');
const elSizeDate   = document.getElementById('sizeDate');
const elSizeRow    = document.getElementById('sizeRow');
const elSizeHours  = document.getElementById('sizeHours');
const elHoursCol   = document.getElementById('hoursColor');
const elBgSelect   = document.getElementById('bgSelect');
const elBgInput    = document.getElementById('bgInput');
const elShowInd    = document.getElementById('showIndicators');
const btnToggle    = document.getElementById('togglePanel');

// toggle panel (desktop & HP)
btnToggle?.addEventListener('click', () => {
  document.body.classList.toggle('panel-collapsed');
  const span = btnToggle.querySelector('span');
  if (document.body.classList.contains('panel-collapsed')) {
    span.textContent = 'Tampilkan Panel';
  } else {
    span.textContent = 'Sembunyikan Panel';
  }
});

// ====== Defaults slider
elSizeDate.value  = elSizeDate.value  || 40;
elSizeRow.value   = elSizeRow.value   || 30;
elSizeHours.value = elSizeHours.value || 35;
const label = id => document.getElementById(id+'Val');
if (label('sizeDate'))  label('sizeDate').textContent  = elSizeDate.value;
if (label('sizeRow'))   label('sizeRow').textContent   = elSizeRow.value;
if (label('sizeHours')) label('sizeHours').textContent = elSizeHours.value;

// ===== Assets
const ASSETS = {
  bg:  'bahan_flyer_bwx.png',
  bg2: 'bahan_flyer_bwx2.png',
  bg3: 'bahan_flyer_bwx3.png',
  super: 'super_air_jet_logo.png',
  wings: 'wings_logo.png'
};

// ===== Data (3 baris maksimum)
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

// ====== Posisi default (SESUIAI koordinat yang kamu minta)
const POS_DEFAULT = {
  date      : { x:531, y:509,  align:'center', color:'#ffffff', h:48 },

  // ARR (y: 689, 763, 852)
  arr_0_airline:{ x:57,  y:689, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_0_flight :{ x:366, y:689, align:'left',  color:'#ffffff', h:40 },
  arr_0_city   :{ x:630, y:689, align:'left',  color:'#ffffff', h:40 },
  arr_0_time   :{ x:1020,y:689, align:'right', color:'#ffffff', h:40 },

  arr_1_airline:{ x:57,  y:763, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_1_flight :{ x:354, y:763, align:'left',  color:'#ffffff', h:40 },
  arr_1_city   :{ x:621, y:763, align:'left',  color:'#ffffff', h:40 },
  arr_1_time   :{ x:1017,y:763, align:'right', color:'#ffffff', h:40 },

  arr_2_airline:{ x:57,  y:852, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_2_flight :{ x:363, y:852, align:'left',  color:'#ffffff', h:40 },
  arr_2_city   :{ x:603, y:852, align:'left',  color:'#ffffff', h:40 },
  arr_2_time   :{ x:1020,y:852, align:'right', color:'#ffffff', h:40 },

  // DEP (y: 1084, 1173, 1250)
  dep_0_airline:{ x:57,  y:1084, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_0_flight :{ x:366, y:1084, align:'left',  color:'#ffffff', h:40 },
  dep_0_city   :{ x:630, y:1084, align:'left',  color:'#ffffff', h:40 },
  dep_0_time   :{ x:1020,y:1084, align:'right', color:'#ffffff', h:40 },

  dep_1_airline:{ x:57,  y:1173, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_1_flight :{ x:354, y:1173, align:'left',  color:'#ffffff', h:40 },
  dep_1_city   :{ x:621, y:1173, align:'left',  color:'#ffffff', h:40 },
  dep_1_time   :{ x:1017,y:1173, align:'right', color:'#ffffff', h:40 },

  dep_2_airline:{ x:57,  y:1250, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_2_flight :{ x:363, y:1250, align:'left',  color:'#ffffff', h:40 },
  dep_2_city   :{ x:603, y:1250, align:'left',  color:'#ffffff', h:40 },
  dep_2_time   :{ x:1020,y:1250, align:'right', color:'#ffffff', h:40 },

  hours     : { x:702, y:1384, align:'center', color:'#ffffff', h:44 }
};

// ====== Items & overrides
const LS_KEY = 'fs_positions_v8';
let items = [];
let posOverrides = loadOverrides();
let showGuides = true;

function airlineLogo(text){
  if(!text) return null;
  const s = text.toLowerCase();
  if (s.includes('super')) return ASSETS.super;
  if (s.includes('wings')) return ASSETS.wings;
  return null;
}
function sizes(){
  const szDate  = +elSizeDate?.value  || 40;
  const szRow   = +elSizeRow?.value   || 30;
  const szHours = +elSizeHours?.value || 35;
  const hoursCol = elHoursCol?.value || '#ffffff';
  return {
    dateFont : `900 ${szDate}px Montserrat, system-ui, sans-serif`,
    rowFont  : `800 ${szRow}px Montserrat, system-ui, sans-serif`,
    hoursFont: `900 ${szHours}px Montserrat, system-ui, sans-serif`,
    hoursColor: hoursCol,
    rowH   : Math.round(szRow * 1.2),
    dateH : Math.round(szDate * 1.12),
    hoursH: Math.round(szHours * 1.12),
    logoH : Math.round(szRow * 1.05)
  };
}
['sizeDate','sizeRow','sizeHours'].forEach(id=>{
  const el=document.getElementById(id), out=document.getElementById(id+'Val');
  if(el&&out) el.addEventListener('input',()=>{ out.textContent=el.value; render(); });
});
elHoursCol?.addEventListener('input', render);
elShowInd?.addEventListener('change', ()=>{ showGuides = elShowInd.checked; render(); });

function buildItems(){
  items=[];
  items.push({ id:'date', kind:'text', getText:()=> (elDate?.value||'').toUpperCase() });

  const keys=['airline','flight','city','time'];
  for(let i=0;i<3;i++){
    keys.forEach(k=>{
      items.push({ id:`arr_${i}_${k}`, kind:k==='airline'?'airline':'text', getText:()=> (state.arrivals[i]?.[k]||'').toUpperCase() });
    });
  }
  for(let i=0;i<3;i++){
    keys.forEach(k=>{
      items.push({ id:`dep_${i}_${k}`, kind:k==='airline'?'airline':'text', getText:()=> (state.departures[i]?.[k]||'').toUpperCase() });
    });
  }
  items.push({ id:'hours', kind:'text', getText:()=> (elHours?.value||'') });
}
buildItems();

function loadOverrides(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); }catch{ return {}; } }
function saveOverrides(){ localStorage.setItem(LS_KEY, JSON.stringify(posOverrides)); }

function getPos(id){
  const base = POS_DEFAULT[id];
  const ov = posOverrides[id];
  const S = sizes();
  let font=S.rowFont, h=S.rowH, color=base.color;
  if(id==='date'){ font=S.dateFont; h=S.dateH; }
  if(id==='hours'){ font=S.hoursFont; h=S.hoursH; color=S.hoursColor; }
  return { x: ov?.x ?? base.x, y: ov?.y ?? base.y, align: base.align, color, font, h, _airline: base.kind==='airline' };
}

// image cache
const IMG={};
function loadImage(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
async function getImg(src){ if(!src) return null; if(!IMG[src]) IMG[src]=await loadImage(src); return IMG[src]; }

// editor baris (maks 3)
function renderRowEditors(){
  const build = (wrap, listName) => {
    const data = state[listName];
    wrap.innerHTML='';
    data.forEach((row, idx)=>{
      const box=document.createElement('div');
      box.className='airline-row';
      box.innerHTML=`
        <input placeholder="Airlines (Super Air Jet / Wings Air)" value="${row.airline||''}" data-k="airline">
        <input placeholder="Flight No" value="${row.flight||''}" data-k="flight">
        <input placeholder="Origin/Dest" value="${row.city||''}"   data-k="city">
        <input placeholder="Time" value="${row.time||''}"         data-k="time">
        <button type="button" title="Hapus">✕</button>
      `;
      box.querySelectorAll('[data-k]').forEach(inp=>{
        const k=inp.dataset.k;
        inp.oninput=()=>{ state[listName][idx][k]=inp.value; render(); };
      });
      box.querySelector('button').onclick=()=>{ state[listName].splice(idx,1); renderRowEditors(); render(); buildItems(); };
      wrap.appendChild(box);
    });
  };
  renderRowEditors._skip = true;
  build(arrivalsWrap,'arrivals');
  build(departuresWrap,'departures');
}
const arrivalsWrap   = document.getElementById('arrivals');
const departuresWrap = document.getElementById('departures');
renderRowEditors();

document.getElementById('addArrival')?.addEventListener('click', ()=>{
  if(state.arrivals.length>=3) return;
  state.arrivals.push({airline:'',flight:'',city:'',time:''});
  buildItems(); renderRowEditors(); render();
});
document.getElementById('addDeparture')?.addEventListener('click', ()=>{
  if(state.departures.length>=3) return;
  state.departures.push({airline:'',flight:'',city:'',time:''});
  buildItems(); renderRowEditors(); render();
});

// hit-rect
async function getRectForItem(it){
  const p = getPos(it.id);
  if(it.kind==='airline'){
    const file = airlineLogo(it.getText());
    const H = sizes().logoH;
    if(file){
      const img=await getImg(file);
      const W = H * (img.width/img.height);
      let x0=p.x; if(p.align==='center') x0-=W/2; else if(p.align==='right') x0-=W;
      const y0=p.y - H/2;
      return { x:x0, y:y0, w:W, h:H };
    }
  }
  ctx.save(); ctx.font=p.font;
  const w=Math.max(10, ctx.measureText(it.getText()).width);
  ctx.restore();
  let x0=p.x; if(p.align==='center') x0-=w/2; else if(p.align==='right') x0-=w;
  const y0=p.y - p.h + 6;
  return { x:x0, y:y0, w, h:p.h+8 };
}

// render (dengan indikator)
async function render(){
  // background
  if(elBgSelect){
    const v=elBgSelect.value;
    state.bgURL = (v===ASSETS.bg2 ? ASSETS.bg2 : v===ASSETS.bg3 ? ASSETS.bg3 : ASSETS.bg);
  }
  const bg = await getImg(state.bgURL);
  ctx.clearRect(0,0,BASE_W,BASE_H);
  if(bg) ctx.drawImage(bg,0,0,BASE_W,BASE_H);

  for(let i=0;i<items.length;i++){
    const it = items[i];
    const p = getPos(it.id);
    const txt = it.getText();

    if(it.kind==='airline'){
      const file = airlineLogo(txt);
      const H = sizes().logoH;
      if(file){
        const img = await getImg(file);
        const W = H * (img.width/img.height);
        let x=p.x, y=p.y - H/2; if(p.align==='center') x-=W/2; else if(p.align==='right') x-=W;
        ctx.drawImage(img,x,y,W,H);

        if(showGuides){
          ctx.strokeStyle='#00ffff88'; ctx.lineWidth=2; ctx.strokeRect(x,y,W,H);
          ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
          ctx.fillText(`${it.id} (x=${Math.round(p.x)},y=${Math.round(p.y)})`, x, Math.max(16,y-6));
        }
        continue;
      }
    }

    ctx.save();
    ctx.font=p.font; ctx.fillStyle=p.color; ctx.textAlign=p.align; ctx.textBaseline='alphabetic';
    ctx.fillText(txt, p.x, p.y);
    if(showGuides){
      const r = await getRectForItem(it);
      ctx.lineWidth=2; ctx.strokeStyle='#00ffff88'; ctx.strokeRect(r.x,r.y,r.w,r.h);
      ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
      ctx.fillText(`${it.id} (x=${Math.round(p.x)},y=${Math.round(p.y)})`, r.x, Math.max(16,r.y-6));
    }
    ctx.restore();
  }
}

// pointer skala dari ukuran CSS -> basis 1080x1920
function pointer(e){
  const r = c.getBoundingClientRect();
  const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
  const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
  const x = clientX - r.left;
  const y = clientY - r.top;
  const sx = BASE_W / r.width;
  const sy = BASE_H / r.height;
  return { x: x * sx, y: y * sy };
}

// drag & drop
let dragging=null;
async function onDown(e){
  const p = pointer(e);
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];
    const r=await getRectForItem(it);
    if(p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h){
      const pos=getPos(it.id);
      dragging={ id:it.id, offX: pos.x-p.x, offY: pos.y-p.y };
      e.preventDefault(); return;
    }
  }
}
function onMove(e){
  if(!dragging) return;
  const p=pointer(e);
  posOverrides[dragging.id]={ x:Math.round(p.x+dragging.offX), y:Math.round(p.y+dragging.offY) };
  saveOverrides(); render();
}
function onUp(){ dragging=null; }

c.addEventListener('mousedown', onDown);
c.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
c.addEventListener('touchstart', onDown, {passive:false});
c.addEventListener('touchmove', onMove, {passive:false});
c.addEventListener('touchend', onUp);

// keyboard
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='g'){ showGuides=!showGuides; if(elShowInd) elShowInd.checked=showGuides; render(); }
  if(e.key.toLowerCase()==='r'){ localStorage.removeItem(LS_KEY); posOverrides={}; render(); }
});

// background switch & upload
elBgSelect?.addEventListener('change', render);
elBgInput?.addEventListener('change', (e)=>{
  const f=e.target.files?.[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{ state.bgURL=ev.target.result; render(); };
  r.readAsDataURL(f);
});

// actions
document.getElementById('renderBtn')?.addEventListener('click', render);
document.getElementById('savePng')?.addEventListener('click', ()=>{
  const a=document.createElement('a'); a.download=`flight-schedule-${Date.now()}.png`; a.href=c.toDataURL('image/png'); a.click();
});
document.getElementById('savePdf')?.addEventListener('click', async ()=>{
  if(!window.jspdf){
    await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s); });
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'p', unit:'px', format:[BASE_W, BASE_H]});
  pdf.addImage(c.toDataURL('image/jpeg',0.96),'JPEG',0,0,BASE_W,BASE_H);
  pdf.save(`flight-schedule-${Date.now()}.pdf`);
});

// pertama kali
render().catch(err=>{
  console.warn('Render gagal:', err);
  ctx.fillStyle='#10a7b5'; ctx.fillRect(0,0,BASE_W,BASE_H);
});
