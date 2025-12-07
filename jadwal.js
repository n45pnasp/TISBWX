/******************************************************************
 * jadwal.js — v15 (Updated with Themes & Global Color)
 * - Dropdown tanggal (bulan start dari bulan sekarang)
 * - Logo resize controls
 * - Shift+Drag resize
 * - New Themes added
 * - Global Text Color Control
 ******************************************************************/

// ===== Basis koordinat
const BASE_W = 1080;
const BASE_H = 1920;

// ===== Canvas & DPR
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

function applyDPR() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  c.width  = BASE_W * dpr;
  c.height = BASE_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
applyDPR();
window.addEventListener('resize', () => { applyDPR(); render(); });

// ===== Controls Existing
const elDate       = document.getElementById('dateText');
const elHours      = document.getElementById('hoursText');
const elSizeDate   = document.getElementById('sizeDate');
const elSizeRow    = document.getElementById('sizeRow');    // fontsize teks baris
const elSizeHours  = document.getElementById('sizeHours');
const elHoursCol   = document.getElementById('hoursColor');
const elBgSelect   = document.getElementById('bgSelect');
const elBgInput    = document.getElementById('bgInput');
const elShowInd    = document.getElementById('showIndicators');
const btnToggle    = document.getElementById('togglePanel');

// ===== Controls Baru (Warna Global)
const elAllTextColor = document.getElementById('allTextColor');
const elAllTextHex   = document.getElementById('allTextHex');

// === Date dropdown controls
const selDay    = document.getElementById('selDay');
const selMonth  = document.getElementById('selMonth');
const selYear   = document.getElementById('selYear');
const btnDateGo = document.getElementById('applyDateSmall');

// Toggle panel
btnToggle?.addEventListener('click', () => {
  document.body.classList.toggle('panel-collapsed');
  const span = btnToggle.querySelector('span');
  span.textContent = document.body.classList.contains('panel-collapsed') ? 'Tampilkan Panel' : 'Sembunyikan Panel';
});

// Default slider (40/30/35)
if (!elSizeDate.value)  elSizeDate.value  = 40;
if (!elSizeRow.value)   elSizeRow.value   = 30;
if (!elSizeHours.value) elSizeHours.value = 35;
['sizeDate','sizeRow','sizeHours'].forEach(id=>{
  const el=document.getElementById(id), out=document.getElementById(id+'Val');
  if (el && out) { out.textContent = el.value; el.addEventListener('input', ()=>{ out.textContent=el.value; render(); }); }
});
elHoursCol?.addEventListener('input', render);
elShowInd?.addEventListener('change', ()=>{ showGuides = elShowInd.checked; render(); });

// ===== Assets (UPDATED)
const ASSETS = {
  bg:  'bahan_flyer_bwx.png',
  bg2: 'bahan_flyer_bwx2.png',
  bg3: 'bahan_flyer_bwx3.png',
  
  // === TAMBAHAN BARU ===
  tema1: 'bahan_flyer_bwx_tema1.png',
  tema2: 'bahan_flyer_bwx_tema2.png',

  super: 'super_air_jet_logo.png',
  wings: 'wings_logo.png',
  batik: 'batik_logo.png',
  citilink: 'citilink_logo.png'
};

// ===== Data (maks 3 baris)
const state = {
  bgURL: ASSETS.bg,
  arrivals: [
    { airline:'SUPER AIR JET', flight:'IU 370', city:'JAKARTA',  time:'10:15 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1880', city:'SURABAYA', time:'12:40 WIB' }
  ],
  departures: [
    { airline:'SUPER AIR JET', flight:'IU 371', city:'JAKARTA',  time:'10:55 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1881', city:'SURABAYA', time:'13:00 WIB' }
  ]
};

// ===== Posisi default
const POS_DEFAULT = {
  date      : { x:531, y:509,  align:'center', color:'#ffffff', h:48 },

  // ARR
  arr_0_airline:{ x:57,  y:676, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_0_flight :{ x:366, y:689, align:'left',  color:'#ffffff', h:40 },
  arr_0_city   :{ x:630, y:689, align:'left',  color:'#ffffff', h:40 },
  arr_0_time   :{ x:1020,y:689, align:'right', color:'#ffffff', h:40 },

  arr_1_airline:{ x:57,  y:746, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_1_flight :{ x:354, y:759, align:'left',  color:'#ffffff', h:40 },
  arr_1_city   :{ x:621, y:759, align:'left',  color:'#ffffff', h:40 },
  arr_1_time   :{ x:1017,y:759, align:'right', color:'#ffffff', h:40 },

  arr_2_airline:{ x:57,  y:831, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_2_flight :{ x:363, y:844, align:'left',  color:'#ffffff', h:40 },
  arr_2_city   :{ x:603, y:844, align:'left',  color:'#ffffff', h:40 },
  arr_2_time   :{ x:1020,y:844, align:'right', color:'#ffffff', h:40 },

  // DEP
  dep_0_airline:{ x:57,  y:1071, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_0_flight :{ x:366, y:1084, align:'left',  color:'#ffffff', h:40 },
  dep_0_city   :{ x:630, y:1084, align:'left',  color:'#ffffff', h:40 },
  dep_0_time   :{ x:1020,y:1084, align:'right', color:'#ffffff', h:40 },

  dep_1_airline:{ x:57,  y:1146, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_1_flight :{ x:354, y:1159, align:'left',  color:'#ffffff', h:40 },
  dep_1_city   :{ x:621, y:1159, align:'left',  color:'#ffffff', h:40 },
  dep_1_time   :{ x:1017,y:1159, align:'right', color:'#ffffff', h:40 },

  dep_2_airline:{ x:57,  y:1221, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_2_flight :{ x:363, y:1234, align:'left',  color:'#ffffff', h:40 },
  dep_2_city   :{ x:603, y:1234, align:'left',  color:'#ffffff', h:40 },
  dep_2_time   :{ x:1020,y:1234, align:'right', color:'#ffffff', h:40 },

  hours       : { x:702, y:1384, align:'center', color:'#ffffff', h:44 }
};

// ===== Items & overrides
const LS_POS   = 'fs_positions_v12';   // posisi elemen
const LS_LOGO  = 'fs_logo_scales_v4';  // skala logo per item

let items = [];
let posOverrides   = loadJSON(LS_POS,  {});
let logoScaleMap   = loadJSON(LS_LOGO, {});
let showGuides = true;

function loadJSON(key, def){ try{ return JSON.parse(localStorage.getItem(key)||JSON.stringify(def)); }catch{ return def; } }
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

// ===== LOGIC GANTI WARNA GLOBAL (BARU) =====
function applyGlobalTextColor(color){
  Object.keys(POS_DEFAULT).forEach(id=>{
    // jangan ubah warna hours karena sudah punya kontrol sendiri
    if(id !== 'hours'){
      POS_DEFAULT[id].color = color;
    }
  });
  render();
}

// Picker -> Hex
elAllTextColor?.addEventListener('input', e => {
  if(elAllTextHex) elAllTextHex.value = e.target.value;
  applyGlobalTextColor(e.target.value);
});

// Hex -> Picker
elAllTextHex?.addEventListener('input', e => {
  let v = e.target.value;
  // Validasi format hex sederhana
  if(/^#([0-9A-F]{3}){1,2}$/i.test(v)){
    if(elAllTextColor) elAllTextColor.value = v;
    applyGlobalTextColor(v);
  }
});
// ===========================================

// deteksi file logo
function airlineLogo(text){
  if(!text) return null;
  const s = text.toLowerCase();
  if (s.includes('super'))    return ASSETS.super;
  if (s.includes('wings'))    return ASSETS.wings;
  if (s.includes('batik'))    return ASSETS.batik;
  if (s.includes('citilink')) return ASSETS.citilink;
  return null;
}

function sizes(){
  const szDate  = +elSizeDate?.value  || 40;
  const szRow   = +elSizeRow?.value   || 30;  // hanya untuk teks baris
  const szHours = +elSizeHours?.value || 35;
  const hoursCol = elHoursCol?.value || '#ffffff';
  return {
    dateFont : `900 ${szDate}px Montserrat, system-ui, sans-serif`,
    rowFont  : `800 ${szRow}px Montserrat, system-ui, sans-serif`,
    hoursFont: `900 ${szHours}px Montserrat, system-ui, sans-serif`,
    hoursColor: hoursCol,
    rowH    : Math.round(szRow * 1.2),
    dateH : Math.round(szDate * 1.12),
    hoursH: Math.round(szHours * 1.12),
    logoBaseH : 34 // tinggi dasar logo (px) – diskalakan per item
  };
}
function getLogoScale(id){ return Math.max(0.4, Math.min(2.5, +(logoScaleMap[id] ?? 1.0))); }
function setLogoScale(id, val){ logoScaleMap[id] = Math.max(0.4, Math.min(2.5, +val)); saveJSON(LS_LOGO, logoScaleMap); }

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

function getPos(id){
  const base = POS_DEFAULT[id];
  const ov = posOverrides[id];
  const S = sizes();
  let font=S.rowFont, h=S.rowH, color=base.color; // base.color kini bisa berubah via applyGlobalTextColor
  if(id==='date'){ font=S.dateFont; h=S.dateH; }
  if(id==='hours'){ font=S.hoursFont; h=S.hoursH; color=S.hoursColor; }
  return { x: ov?.x ?? base.x, y: ov?.y ?? base.y, align: base.align, color, font, h, _airline: base?.kind==='airline' };
}

// image cache
const IMG={};
function loadImage(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
async function getImg(src){ if(!src) return null; if(!IMG[src]) IMG[src]=await loadImage(src); return IMG[src]; }

// ===== UI rows (maks 3) – Origin/Dest maxlength=10 + kontrol ukuran logo (±)
const arrivalsWrap   = document.getElementById('arrivals');
const departuresWrap = document.getElementById('departures');

function miniLogoControls(id){
  const scale = getLogoScale(id).toFixed(2);
  return `
    <div class="logo-controls" style="grid-column:1/-1;display:flex;align-items:center;gap:8px;margin-top:4px;">
      <small style="opacity:.8;">Logo Size:</small>
      <button type="button" data-act="minus" data-id="${id}" style="padding:4px 10px;border-radius:6px;border:none;background:#334155;color:#fff;font-weight:800;">−</button>
      <button type="button" data-act="plus"  data-id="${id}" style="padding:4px 10px;border-radius:6px;border:none;background:#334155;color:#fff;font-weight:800;">+</button>
      <span data-act="read"  data-id="${id}" style="min-width:44px;text-align:right;font-variant-numeric:tabular-nums;">${scale}</span>
    </div>
  `;
}

function renderRowEditors(){
  const build = (wrap, listName) => {
    const data = state[listName];
    wrap.innerHTML='';
    data.forEach((row, idx)=>{
      const isArr = (listName==='arrivals');
      const airlineId = `${isArr ? 'arr':'dep'}_${idx}_airline`;
      // placeholder beda ARR/DEP
      const cityPlaceholder = isArr ? 'Origin' : 'Destination';

      const box=document.createElement('div');
      box.className='airline-row';
      box.innerHTML=`
        <input placeholder="Airlines (Super Air Jet / Wings Air)" value="${row.airline||''}" data-k="airline">
        <input placeholder="Flight No" value="${row.flight||''}" data-k="flight">
        <input placeholder="${cityPlaceholder}" maxlength="10" value="${row.city||''}" data-k="city">
        <input placeholder="Time" value="${row.time||''}" data-k="time">
        <button type="button" title="Hapus">✕</button>
        ${miniLogoControls(airlineId)}
      `;

      // input teks
      box.querySelectorAll('[data-k]').forEach(inp=>{
        const k=inp.dataset.k;
        inp.oninput=()=>{ state[listName][idx][k]=inp.value; render(); };
      });

      // hapus baris
      box.querySelector('button[title="Hapus"]').onclick=()=>{ 
        state[listName].splice(idx,1); buildItems(); renderRowEditors(); render(); 
      };

      // kontrol logo (+/-)
      box.querySelectorAll('[data-id="'+airlineId+'"]').forEach(ctrl=>{
        const act = ctrl.getAttribute('data-act');
        if(act==='minus'){
          ctrl.addEventListener('click', ()=>{
            const cur = getLogoScale(airlineId);
            const next = Math.max(0.4, +(cur - 0.05).toFixed(2));
            setLogoScale(airlineId, next);
            const read = box.querySelector('[data-act="read"][data-id="'+airlineId+'"]');
            if(read) read.textContent = next.toFixed(2);
            render();
          });
        }else if(act==='plus'){
          ctrl.addEventListener('click', ()=>{
            const cur = getLogoScale(airlineId);
            const next = Math.min(2.5, +(cur + 0.05).toFixed(2));
            setLogoScale(airlineId, next);
            const read = box.querySelector('[data-act="read"][data-id="'+airlineId+'"]');
            if(read) read.textContent = next.toFixed(2);
            render();
          });
        }
      });

      wrap.appendChild(box);
    });
  };
  build(arrivalsWrap,'arrivals');
  build(departuresWrap,'departures');
}
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

// ===== Date dropdown helper =====
const ID_DAYS  = ['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];
const ID_MONTHS = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];

function daysInMonth(y, mIdx){ // mIdx: 0-11
  return new Date(y, mIdx+1, 0).getDate();
}
function rotateMonthsFromNow(){
  const now = new Date();
  const start = now.getMonth(); // 0-11
  const arr = [];
  for(let i=0;i<12;i++){
    const mi = (start + i) % 12;
    arr.push({ idx: mi, label: ID_MONTHS[mi] });
  }
  return arr;
}
function populateDateDropdowns(){
  if(!(selDay && selMonth && selYear && btnDateGo)) return;

  // months: start from current month
  selMonth.innerHTML = rotateMonthsFromNow().map(m=>`<option value="${m.idx}">${m.label}</option>`).join('');

  // years: current & next year
  const now = new Date();
  const ys = [now.getFullYear(), now.getFullYear()+1];
  selYear.innerHTML = ys.map(y=>`<option value="${y}">${y}</option>`).join('');

  // default day/month/year: today
  selMonth.selectedIndex = 0; // current month at index 0 in rotated list
  selYear.value = String(now.getFullYear());
  refreshDays();

  selDay.value = String(now.getDate());

  // events
  selMonth.addEventListener('change', refreshDays);
  selYear.addEventListener('change', refreshDays);
  btnDateGo.addEventListener('click', applyDateFromDropdown);
}
function refreshDays(){
  const mIdx = +selMonth.value; // original month index 0-11
  const y    = +selYear.value;
  const maxD = daysInMonth(y, mIdx);
  const prev = +selDay.value || 1;
  selDay.innerHTML = Array.from({length:maxD}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  selDay.value = String(Math.min(prev, maxD));
}
function applyDateFromDropdown(){
  const d = +selDay.value;
  const mIdx = +selMonth.value; // 0-11
  const y = +selYear.value;

  const jsDate = new Date(y, mIdx, d);
  const dayName = ID_DAYS[jsDate.getDay()];
  const monthName = ID_MONTHS[mIdx];
  const text = `${dayName}, ${String(d).padStart(2,'0')} ${monthName} ${y}`;
  if(elDate){ elDate.value = text; }
  render();
}
populateDateDropdowns();

// ====== Helper: bounding box item (text/logo)
async function getRectForItem(it){
  const p = getPos(it.id);
  if(it.kind==='airline'){
    const file = airlineLogo(it.getText());
    const S = sizes();
    const scale = getLogoScale(it.id);
    const H = Math.max(10, S.logoBaseH * scale); // tinggi logo per item
    if(file){
      const img=await getImg(file);
      const W = H * (img.width/img.height); // jaga rasio
      let x0=p.x; if(p.align==='center') x0-=W/2; else if(p.align==='right') x0-=W;
      const y0=p.y - H/2;
      return { x:x0, y:y0, w:W, h:H };
    }
  }
  // teks
  ctx.save(); ctx.font=p.font;
  const w=Math.max(10, ctx.measureText(it.getText()).width);
  ctx.restore();
  let x0=p.x; if(p.align==='center') x0-=w/2; else if(p.align==='right') x0-=w;
  const y0=p.y - p.h + 6;
  return { x:x0, y:y0, w, h:p.h+8 };
}

// ====== Batas kiri/kanan tabel agar garis sama lebar kotak putih
function tableBounds(section){
  let left = Infinity, right = -Infinity;
  for(let i=0;i<3;i++){
    const a = POS_DEFAULT[`${section}_${i}_airline`] ? getPos(`${section}_${i}_airline`).x : null;
    const t = POS_DEFAULT[`${section}_${i}_time`]    ? getPos(`${section}_${i}_time`).x    : null;
    if(a!=null) left  = Math.min(left,  a);
    if(t!=null) right = Math.max(right, t); // kolom TIME right-aligned
  }
  if(!isFinite(left))  left  = 60;
  if(!isFinite(right)) right = 1020;

  // padding agar “masuk” kotak putih
  left  = Math.max(40,  left  - 0);
  right = Math.min(1040, right - 0);

  return { left, right };
}

// ====== Garis pemisah antar baris (mengikuti posisi & jumlah aktif)
function drawRowSeparators(section, count){
  const bounds = tableBounds(section);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 3;
  for(let i=0;i<count;i++){
    const pos = getPos(`${section}_${i}_time`);
    const y = pos.y + 22; // sedikit di bawah teks
    ctx.beginPath(); ctx.moveTo(bounds.left, y); ctx.lineTo(bounds.right, y); ctx.stroke();
  }
  ctx.restore();
}

// ====== Render
async function render(){
  // pilih bg (dropdown) - LOGIK DIPERBAIKI DISINI
  if(elBgSelect){
    // Langsung ambil value dari <option value="filename">
    const v = elBgSelect.value;
    state.bgURL = v;
  }
  
  const bg = await getImg(state.bgURL);
  ctx.clearRect(0,0,BASE_W,BASE_H);
  if(bg) ctx.drawImage(bg,0,0,BASE_W,BASE_H);

  // Garis pemisah dinamis
  drawRowSeparators('arr', Math.min(3, state.arrivals.length));
  drawRowSeparators('dep', Math.min(3, state.departures.length));

  // Gambar item teks/logo
  for(let i=0;i<items.length;i++){
    const it = items[i];
    const p = getPos(it.id);
    const txt = it.getText();

    if(it.kind==='airline'){
      const file = airlineLogo(txt);
      if(file){
        const img = await getImg(file);
        const S = sizes();
        const scale = getLogoScale(it.id);
        const H = Math.max(10, S.logoBaseH * scale);
        const W = H * (img.width/img.height);
        let x=p.x, y=p.y - H/2; if(p.align==='center') x-=W/2; else if(p.align==='right') x-=W;
        ctx.drawImage(img,x,y,W,H);

        if(showGuides){
          ctx.strokeStyle='#00ffff88'; ctx.lineWidth=2; ctx.strokeRect(x,y,W,H);
          ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
          ctx.fillText(`${it.id} (x=${Math.round(p.x)},y=${Math.round(p.y)}) scale=${scale.toFixed(2)}`, x, Math.max(16,y-6));
        }
        continue;
      }
    }

    // teks
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

// ====== Pointer: skala dari ukuran CSS → basis 1080x1920
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

// ====== Drag & drop + Shift+Drag (resize logo)
let dragging=null;
let resizingLogo=null; // { id, startY, startScale }

async function onDown(e){
  const p = pointer(e);
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];
    const r=await getRectForItem(it);
    if(p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h){
      const pos=getPos(it.id);
      // Jika klik di logo + tahan SHIFT → mode resize
      if (it.kind==='airline' && (e.shiftKey || (e.touches && e.touches.length===2))) {
        const cur = getLogoScale(it.id);
        resizingLogo = { id: it.id, startY: p.y, startScale: cur };
      } else {
        dragging={ id:it.id, offX: pos.x-p.x, offY: pos.y-p.y };
      }
      e.preventDefault(); return;
    }
  }
}
function onMove(e){
  const p=pointer(e);
  if(resizingLogo){
    const dy = (p.y - resizingLogo.startY);
    const newScale = Math.max(0.4, Math.min(2.5, resizingLogo.startScale * (1 + dy/240)));
    setLogoScale(resizingLogo.id, newScale);
    render();
    return;
  }
  if(!dragging) return;
  posOverrides[dragging.id]={ x:Math.round(p.x+dragging.offX), y:Math.round(p.y+dragging.offY) };
  saveJSON(LS_POS, posOverrides);
  render();
}
function onUp(){ dragging=null; resizingLogo=null; }

c.addEventListener('mousedown', onDown);
c.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
c.addEventListener('touchstart', onDown, {passive:false});
c.addEventListener('touchmove', onMove, {passive:false});
c.addEventListener('touchend', onUp);

// ====== Keyboard
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='g'){ showGuides=!showGuides; if(elShowInd) elShowInd.checked=showGuides; render(); }
  if(e.key.toLowerCase()==='r'){ localStorage.removeItem(LS_POS); localStorage.removeItem(LS_LOGO); posOverrides={}; logoScaleMap={}; renderRowEditors(); render(); }
});

// ====== Background switch & upload
elBgSelect?.addEventListener('change', render);
elBgInput?.addEventListener('change', (e)=>{
  const f=e.target.files?.[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{ state.bgURL=ev.target.result; render(); };
  r.readAsDataURL(f);
});

// ===== Nama file: scheduleflightbwx_tglBlnTahun.ext
function buildFilename(ext){
  const raw = (elDate?.value || '').replace(/,/g,' ').trim();
  const m = raw.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i);
  if(m){
    const tgl = m[1];
    const bln = m[2].toLowerCase().replace(/^\p{L}/u, ch => ch.toUpperCase());
    const th  = m[3];
    return `scheduleflightbwx_${tgl}${bln}${th}.${ext}`;
  }
  const safe = raw.replace(/\s+/g,'');
  return `scheduleflightbwx_${safe || 'poster'}.${ext}`;
}

// ===== Actions
document.getElementById('renderBtn')?.addEventListener('click', render);
document.getElementById('savePng')?.addEventListener('click', ()=>{
  const a=document.createElement('a'); a.download=buildFilename('png'); a.href=c.toDataURL('image/png'); a.click();
});
document.getElementById('savePdf')?.addEventListener('click', async ()=>{
  if(!window.jspdf){
    await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s); });
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'p', unit:'px', format:[BASE_W, BASE_H]});
  pdf.addImage(c.toDataURL('image/jpeg',0.96),'JPEG',0,0,BASE_W,BASE_H);
  pdf.save(buildFilename('pdf'));
});

// ===== Render awal
render().catch(err=>{
  console.warn('Render gagal:', err);
  ctx.fillStyle='#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
});
