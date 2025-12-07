/******************************************************************
 * jadwal.js — v16 (Shadows, Logo Tinting & Gold Presets)
 * - Added Drop Shadow to Text, Lines, and Logos
 * - Added Logo Tinting (Logo color follows text color)
 * - Added Preset Buttons for Gold Colors
 * - Line separators follow global color
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

// ===== Controls
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

// Controls Warna Global
const elAllTextColor = document.getElementById('allTextColor');
const elAllTextHex   = document.getElementById('allTextHex');

// Date dropdown controls
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

// Default slider
if (!elSizeDate.value)  elSizeDate.value  = 40;
if (!elSizeRow.value)   elSizeRow.value   = 30;
if (!elSizeHours.value) elSizeHours.value = 35;
['sizeDate','sizeRow','sizeHours'].forEach(id=>{
  const el=document.getElementById(id), out=document.getElementById(id+'Val');
  if (el && out) { out.textContent = el.value; el.addEventListener('input', ()=>{ out.textContent=el.value; render(); }); }
});
elHoursCol?.addEventListener('input', render);
elShowInd?.addEventListener('change', ()=>{ showGuides = elShowInd.checked; render(); });

// ===== INJECT PRESET BUTTONS (Warna Emas) =====
function injectColorPresets() {
    if(!elAllTextHex) return;
    const container = document.createElement('div');
    container.style.marginTop = '8px';
    container.style.display = 'flex';
    container.style.gap = '6px';
    container.style.flexWrap = 'wrap';

    const colors = ['#FFFFFF', '#FCEA94', '#ECD881', '#EAB476'];
    
    colors.forEach(col => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.width = '24px';
        btn.style.height = '24px';
        btn.style.borderRadius = '50%';
        btn.style.border = '2px solid #334155';
        btn.style.backgroundColor = col;
        btn.style.cursor = 'pointer';
        btn.title = col;
        
        btn.onclick = () => {
            if(elAllTextColor) elAllTextColor.value = col;
            if(elAllTextHex) elAllTextHex.value = col;
            applyGlobalTextColor(col);
        };
        container.appendChild(btn);
    });
    
    // Insert after the hex input
    elAllTextHex.parentNode.parentNode.insertBefore(container, elAllTextHex.parentNode.nextSibling);
}
// Jalankan injeksi UI
setTimeout(injectColorPresets, 100);


// ===== Assets
const ASSETS = {
  bg:  'bahan_flyer_bwx.png',
  bg2: 'bahan_flyer_bwx2.png',
  bg3: 'bahan_flyer_bwx3.png',
  tema1: 'bahan_flyer_bwx_tema1.png',
  tema2: 'bahan_flyer_bwx_tema2.png',

  super: 'super_air_jet_logo.png',
  wings: 'wings_logo.png',
  batik: 'batik_logo.png',
  citilink: 'citilink_logo.png'
};

// ===== Data
const state = {
  bgURL: ASSETS.bg,
  globalColor: '#ffffff', // Default putih
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
  date       : { x:531, y:509,  align:'center', color:'#ffffff', h:48 },

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

  hours         : { x:702, y:1384, align:'center', color:'#ffffff', h:44 }
};

const LS_POS   = 'fs_positions_v12';
const LS_LOGO  = 'fs_logo_scales_v4';

let items = [];
let posOverrides   = loadJSON(LS_POS,  {});
let logoScaleMap   = loadJSON(LS_LOGO, {});
let showGuides = true;

function loadJSON(key, def){ try{ return JSON.parse(localStorage.getItem(key)||JSON.stringify(def)); }catch{ return def; } }
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

// ===== LOGIC GANTI WARNA GLOBAL =====
function applyGlobalTextColor(color){
  state.globalColor = color; // Simpan state warna garis
  Object.keys(POS_DEFAULT).forEach(id=>{
    if(id !== 'hours'){ // Kecuali hours yang punya kontrol sendiri
      POS_DEFAULT[id].color = color;
    }
  });
  render();
}

elAllTextColor?.addEventListener('input', e => {
  if(elAllTextHex) elAllTextHex.value = e.target.value;
  applyGlobalTextColor(e.target.value);
});
elAllTextHex?.addEventListener('input', e => {
  let v = e.target.value;
  if(/^#([0-9A-F]{3}){1,2}$/i.test(v)){
    if(elAllTextColor) elAllTextColor.value = v;
    applyGlobalTextColor(v);
  }
});

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
  const szRow   = +elSizeRow?.value   || 30;
  const szHours = +elSizeHours?.value || 35;
  const hoursCol = elHoursCol?.value || '#ffffff';
  return {
    dateFont : `900 ${szDate}px Montserrat, system-ui, sans-serif`,
    rowFont  : `800 ${szRow}px Montserrat, system-ui, sans-serif`,
    hoursFont: `900 ${szHours}px Montserrat, system-ui, sans-serif`,
    hoursColor: hoursCol,
    rowH     : Math.round(szRow * 1.2),
    dateH : Math.round(szDate * 1.12),
    hoursH: Math.round(szHours * 1.12),
    logoBaseH : 34
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
  let font=S.rowFont, h=S.rowH, color=base.color; 
  if(id==='date'){ font=S.dateFont; h=S.dateH; }
  if(id==='hours'){ font=S.hoursFont; h=S.hoursH; color=S.hoursColor; }
  return { x: ov?.x ?? base.x, y: ov?.y ?? base.y, align: base.align, color, font, h, _airline: base?.kind==='airline' };
}

// image cache
const IMG={};
function loadImage(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
async function getImg(src){ if(!src) return null; if(!IMG[src]) IMG[src]=await loadImage(src); return IMG[src]; }

// UI Rows Editors
const arrivalsWrap    = document.getElementById('arrivals');
const departuresWrap  = document.getElementById('departures');

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
      const cityPlaceholder = isArr ? 'Origin' : 'Destination';

      const box=document.createElement('div');
      box.className='airline-row';
      box.innerHTML=`
        <input placeholder="Airlines" value="${row.airline||''}" data-k="airline">
        <input placeholder="Flight No" value="${row.flight||''}" data-k="flight">
        <input placeholder="${cityPlaceholder}" maxlength="10" value="${row.city||''}" data-k="city">
        <input placeholder="Time" value="${row.time||''}" data-k="time">
        <button type="button" title="Hapus">✕</button>
        ${miniLogoControls(airlineId)}
      `;

      box.querySelectorAll('[data-k]').forEach(inp=>{
        const k=inp.dataset.k;
        inp.oninput=()=>{ state[listName][idx][k]=inp.value; render(); };
      });
      box.querySelector('button[title="Hapus"]').onclick=()=>{ 
        state[listName].splice(idx,1); buildItems(); renderRowEditors(); render(); 
      };
      box.querySelectorAll('[data-id="'+airlineId+'"]').forEach(ctrl=>{
        ctrl.addEventListener('click', ()=>{
          const act = ctrl.getAttribute('data-act');
          const cur = getLogoScale(airlineId);
          const next = act==='minus' ? Math.max(0.4, cur-0.05) : Math.min(2.5, cur+0.05);
          setLogoScale(airlineId, next);
          const read = box.querySelector('[data-act="read"][data-id="'+airlineId+'"]');
          if(read) read.textContent = next.toFixed(2);
          render();
        });
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

// Date dropdown helper
const ID_DAYS  = ['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];
const ID_MONTHS = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];

function daysInMonth(y, mIdx){ return new Date(y, mIdx+1, 0).getDate(); }
function rotateMonthsFromNow(){
  const now = new Date();
  const start = now.getMonth(); 
  const arr = [];
  for(let i=0;i<12;i++){
    const mi = (start + i) % 12;
    arr.push({ idx: mi, label: ID_MONTHS[mi] });
  }
  return arr;
}
function populateDateDropdowns(){
  if(!(selDay && selMonth && selYear && btnDateGo)) return;
  selMonth.innerHTML = rotateMonthsFromNow().map(m=>`<option value="${m.idx}">${m.label}</option>`).join('');
  const now = new Date();
  const ys = [now.getFullYear(), now.getFullYear()+1];
  selYear.innerHTML = ys.map(y=>`<option value="${y}">${y}</option>`).join('');
  selMonth.selectedIndex = 0; 
  selYear.value = String(now.getFullYear());
  refreshDays();
  selDay.value = String(now.getDate());

  selMonth.addEventListener('change', refreshDays);
  selYear.addEventListener('change', refreshDays);
  btnDateGo.addEventListener('click', applyDateFromDropdown);
}
function refreshDays(){
  const mIdx = +selMonth.value; 
  const y    = +selYear.value;
  const maxD = daysInMonth(y, mIdx);
  const prev = +selDay.value || 1;
  selDay.innerHTML = Array.from({length:maxD}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  selDay.value = String(Math.min(prev, maxD));
}
function applyDateFromDropdown(){
  const d = +selDay.value;
  const mIdx = +selMonth.value; 
  const y = +selYear.value;
  const jsDate = new Date(y, mIdx, d);
  const dayName = ID_DAYS[jsDate.getDay()];
  const monthName = ID_MONTHS[mIdx];
  const text = `${dayName}, ${String(d).padStart(2,'0')} ${monthName} ${y}`;
  if(elDate){ elDate.value = text; }
  render();
}
populateDateDropdowns();

async function getRectForItem(it){
  const p = getPos(it.id);
  if(it.kind==='airline'){
    const file = airlineLogo(it.getText());
    const S = sizes();
    const scale = getLogoScale(it.id);
    const H = Math.max(10, S.logoBaseH * scale);
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

function tableBounds(section){
  let left = Infinity, right = -Infinity;
  for(let i=0;i<3;i++){
    const a = POS_DEFAULT[`${section}_${i}_airline`] ? getPos(`${section}_${i}_airline`).x : null;
    const t = POS_DEFAULT[`${section}_${i}_time`]    ? getPos(`${section}_${i}_time`).x    : null;
    if(a!=null) left  = Math.min(left,  a);
    if(t!=null) right = Math.max(right, t); 
  }
  if(!isFinite(left))  left  = 60;
  if(!isFinite(right)) right = 1020;
  left  = Math.max(40,  left  - 0);
  right = Math.min(1040, right - 0);
  return { left, right };
}

function drawRowSeparators(section, count){
  const bounds = tableBounds(section);
  ctx.save();
  // Gunakan state.globalColor, atau default putih
  ctx.strokeStyle = state.globalColor || 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 3;
  // Tambahkan shadow pada garis
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  for(let i=0;i<count;i++){
    const pos = getPos(`${section}_${i}_time`);
    const y = pos.y + 22; 
    ctx.beginPath(); ctx.moveTo(bounds.left, y); ctx.lineTo(bounds.right, y); ctx.stroke();
  }
  ctx.restore();
}

// Helper untuk mewarnai Logo (Tinting)
function tintImage(img, color) {
  // Jika warna putih, kembalikan gambar asli
  if(color.toLowerCase() === '#ffffff') return img;
  
  const buffer = document.createElement('canvas');
  buffer.width = img.width;
  buffer.height = img.height;
  const bx = buffer.getContext('2d');
  
  // Gambar siluet
  bx.drawImage(img, 0, 0);
  bx.globalCompositeOperation = 'source-in';
  bx.fillStyle = color;
  bx.fillRect(0, 0, buffer.width, buffer.height);
  return buffer;
}

async function render(){
  if(elBgSelect){ state.bgURL = elBgSelect.value; }
  
  const bg = await getImg(state.bgURL);
  ctx.clearRect(0,0,BASE_W,BASE_H);
  if(bg) ctx.drawImage(bg,0,0,BASE_W,BASE_H);

  drawRowSeparators('arr', Math.min(3, state.arrivals.length));
  drawRowSeparators('dep', Math.min(3, state.departures.length));

  // Set Shadow Global untuk teks & logo
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

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
        
        // Cek apakah perlu di-tint
        let drawObj = img;
        if(state.globalColor && state.globalColor.toLowerCase() !== '#ffffff'){
             drawObj = tintImage(img, state.globalColor);
        }

        ctx.drawImage(drawObj,x,y,W,H);

        if(showGuides){
          ctx.save();
          ctx.shadowColor='transparent'; // Matikan shadow untuk guide
          ctx.strokeStyle='#00ffff88'; ctx.lineWidth=2; ctx.strokeRect(x,y,W,H);
          ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
          ctx.fillText(`${it.id}`, x, Math.max(16,y-6));
          ctx.restore();
        }
        continue;
      }
    }

    // Teks
    ctx.save();
    ctx.font=p.font; ctx.fillStyle=p.color; ctx.textAlign=p.align; ctx.textBaseline='alphabetic';
    ctx.fillText(txt, p.x, p.y);
    
    if(showGuides){
      ctx.shadowColor='transparent';
      const r = await getRectForItem(it);
      ctx.lineWidth=2; ctx.strokeStyle='#00ffff88'; ctx.strokeRect(r.x,r.y,r.w,r.h);
      ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
      ctx.fillText(`${it.id}`, r.x, Math.max(16,r.y-6));
    }
    ctx.restore();
  }
}

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

let dragging=null;
let resizingLogo=null; 

async function onDown(e){
  const p = pointer(e);
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];
    const r=await getRectForItem(it);
    if(p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h){
      const pos=getPos(it.id);
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

window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='g'){ showGuides=!showGuides; if(elShowInd) elShowInd.checked=showGuides; render(); }
  if(e.key.toLowerCase()==='r'){ localStorage.removeItem(LS_POS); localStorage.removeItem(LS_LOGO); posOverrides={}; logoScaleMap={}; renderRowEditors(); render(); }
});

elBgSelect?.addEventListener('change', render);
elBgInput?.addEventListener('change', (e)=>{
  const f=e.target.files?.[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{ state.bgURL=ev.target.result; render(); };
  r.readAsDataURL(f);
});

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

render().catch(err=>{
  console.warn('Render gagal:', err);
  ctx.fillStyle='#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
});
