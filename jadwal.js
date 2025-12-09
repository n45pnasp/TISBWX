
/******************************************************************
 * jadwal.js — v23 (Updated Flight Schedule Data)
 * - Fixed: Dragging logic & Hit testing
 * - Update: Jadwal penerbangan baru (Lombok, Surabaya, Jakarta)
 ******************************************************************/

// ===== Basis koordinat
const BASE_W = 1080;
const BASE_H = 1920;

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
const elAllTextColor = document.getElementById('allTextColor');
const elAllTextHex   = document.getElementById('allTextHex');
const elBgSelect   = document.getElementById('bgSelect');
const elBgInput    = document.getElementById('bgInput');
const elShowInd    = document.getElementById('showIndicators');
const btnToggle    = document.getElementById('togglePanel');
const btnLock      = document.getElementById('lockSettings');

// State Pengunci
let isLocked = false; 

// Date Dropdowns
const selDay    = document.getElementById('selDay');
const selMonth  = document.getElementById('selMonth');
const selYear   = document.getElementById('selYear');
const btnDateGo = document.getElementById('applyDateSmall');

// Toggle panel
btnToggle?.addEventListener('click', () => {
  document.body.classList.toggle('panel-collapsed');
});

// ===== INJECT PRESET BUTTONS =====
function injectColorPresets() {
    if(!elAllTextHex) return;
    if(elAllTextHex.parentNode.querySelector('.preset-container')) return;

    const container = document.createElement('div');
    container.className = 'preset-container';
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
            state.globalColor = col;
            applyGlobalTextColor(col);
        };
        container.appendChild(btn);
    });
    elAllTextHex.parentNode.appendChild(container);
}
setTimeout(injectColorPresets, 100);

// ===== FITUR SAVE / LOAD & LOCK CONFIG =====
const LS_CONFIG = 'fs_config_v1';

function loadConfig() {
  const saved = localStorage.getItem(LS_CONFIG);
  if(saved){
    try {
      const cfg = JSON.parse(saved);
      if(cfg.sizeDate && elSizeDate) elSizeDate.value = cfg.sizeDate;
      if(cfg.sizeRow && elSizeRow) elSizeRow.value = cfg.sizeRow;
      if(cfg.sizeHours && elSizeHours) elSizeHours.value = cfg.sizeHours;
      if(cfg.hoursColor && elHoursCol) elHoursCol.value = cfg.hoursColor;
      
      if(cfg.globalColor) {
         if(elAllTextColor) elAllTextColor.value = cfg.globalColor;
         if(elAllTextHex) elAllTextHex.value = cfg.globalColor;
         state.globalColor = cfg.globalColor; 
      }
    } catch(e) { console.error('Gagal load config', e); }
  }
}

// Update Tampilan Tombol Kunci
function updateLockUI() {
  if (isLocked) {
    btnLock.innerHTML = "🔒 Posisi Terkunci (Klik Buka)";
    btnLock.style.background = "#ef4444"; 
    btnLock.style.color = "#ffffff";
    btnLock.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
  } else {
    btnLock.innerHTML = "🔓 Kunci & Simpan Pengaturan";
    btnLock.style.background = "#f59e0b"; 
    btnLock.style.color = "#0f172a";
    btnLock.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.4)";
  }
}

// Listener Tombol Kunci (Toggle)
btnLock?.addEventListener('click', () => {
  isLocked = !isLocked; 
  updateLockUI();

  if (isLocked) {
    const config = {
      sizeDate: elSizeDate?.value || 40,
      sizeRow: elSizeRow?.value || 30,
      sizeHours: elSizeHours?.value || 35,
      hoursColor: elHoursCol?.value || '#ffffff',
      globalColor: state.globalColor || '#ffffff'
    };
    localStorage.setItem(LS_CONFIG, JSON.stringify(config));
  }
});

[elSizeDate, elSizeRow, elSizeHours, elHoursCol].forEach(el => {
  if(el) el.addEventListener('input', render);
});
elShowInd?.addEventListener('change', ()=>{ showGuides = elShowInd.checked; render(); });

// Sync Hex & Color Input
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

// ===== Assets & Data
const ASSETS = {
  bg:  'bahan_flyer_bwx.png',
  super: 'super_air_jet_logo.png',
  wings: 'wings_logo.png',
  batik: 'batik_logo.png',
  citilink: 'citilink_logo.png'
};

const state = {
  bgURL: ASSETS.bg,
  globalColor: '#ffffff',
  // --- UPDATED ARRIVALS ---
  arrivals: [
    { airline:'SUPER AIR JET', flight:'IU 370', city:'JAKARTA',  time:'10:15 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1844', city:'LOMBOK',  time:'12:30 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1880', city:'SURABAYA', time:'16:25 WIB' }
  ],
  // --- UPDATED DEPARTURES ---
  departures: [
    { airline:'WINGS AIR',     flight:'IW 1881', city:'SURABAYA', time:'07:00 WIB' },
    { airline:'SUPER AIR JET', flight:'IU 371', city:'JAKARTA',  time:'10:55 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1845', city:'LOMBOK',  time:'12:55 WIB' }
  ]
};

// ===== Posisi Default (Terupdate untuk 3 Baris Rapi)
const POS_DEFAULT = {
  // Header Tanggal & Footer Jam
  date:  { x:531, y:509,  align:'center', color:'#ffffff', h:48 },
  hours: { x:702, y:1384, align:'center', color:'#ffffff', h:44 },

  // --- ARRIVALS (KEDATANGAN) ---
  // Baris 1 (Y Base: 689)
  arr_0_airline:{ x:57,   y:689, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_0_flight :{ x:366,  y:689, align:'left',  color:'#ffffff', h:40 },
  arr_0_city   :{ x:630,  y:689, align:'left',  color:'#ffffff', h:40 },
  arr_0_time   :{ x:1020, y:689, align:'right', color:'#ffffff', h:40 },

  // Baris 2 (Y Base: 759 -> Jarak +70px)
  arr_1_airline:{ x:57,   y:759, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_1_flight :{ x:366,  y:759, align:'left',  color:'#ffffff', h:40 },
  arr_1_city   :{ x:630,  y:759, align:'left',  color:'#ffffff', h:40 },
  arr_1_time   :{ x:1020, y:759, align:'right', color:'#ffffff', h:40 },

  // Baris 3 (Y Base: 829 -> Jarak +70px)
  arr_2_airline:{ x:57,   y:829, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  arr_2_flight :{ x:366,  y:829, align:'left',  color:'#ffffff', h:40 },
  arr_2_city   :{ x:630,  y:829, align:'left',  color:'#ffffff', h:40 },
  arr_2_time   :{ x:1020, y:829, align:'right', color:'#ffffff', h:40 },

  // --- DEPARTURES (KEBERANGKATAN) ---
  // Baris 1 (Y Base: 1084)
  dep_0_airline:{ x:57,   y:1084, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_0_flight :{ x:366,  y:1084, align:'left',  color:'#ffffff', h:40 },
  dep_0_city   :{ x:630,  y:1084, align:'left',  color:'#ffffff', h:40 },
  dep_0_time   :{ x:1020, y:1084, align:'right', color:'#ffffff', h:40 },

  // Baris 2 (Y Base: 1154 -> Jarak +70px)
  dep_1_airline:{ x:57,   y:1154, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_1_flight :{ x:366,  y:1154, align:'left',  color:'#ffffff', h:40 },
  dep_1_city   :{ x:630,  y:1154, align:'left',  color:'#ffffff', h:40 },
  dep_1_time   :{ x:1020, y:1154, align:'right', color:'#ffffff', h:40 },

  // Baris 3 (Y Base: 1224 -> Jarak +70px)
  dep_2_airline:{ x:57,   y:1224, align:'left',  color:'#ffffff', h:40, kind:'airline' },
  dep_2_flight :{ x:366,  y:1224, align:'left',  color:'#ffffff', h:40 },
  dep_2_city   :{ x:630,  y:1224, align:'left',  color:'#ffffff', h:40 },
  dep_2_time   :{ x:1020, y:1224, align:'right', color:'#ffffff', h:40 }
};

const LS_POS   = 'fs_positions_v12';
const LS_LOGO  = 'fs_logo_scales_v4';

let items = [];
let posOverrides = loadJSON(LS_POS, {});
let logoScaleMap = loadJSON(LS_LOGO, {});
let showGuides = true;

function loadJSON(key, def){ try{ return JSON.parse(localStorage.getItem(key)||JSON.stringify(def)); }catch{ return def; } }
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function applyGlobalTextColor(color){
  state.globalColor = color;
  Object.keys(POS_DEFAULT).forEach(id=>{
    if(id !== 'hours') POS_DEFAULT[id].color = color;
  });
  render();
}

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
    rowH      : Math.round(szRow * 1.2),
    dateH : Math.round(szDate * 1.12),
    hoursH: Math.round(szHours * 1.12),
    logoBaseH : 34
  };
}
function getLogoScale(id){ return Math.max(0.1, +(logoScaleMap[id] ?? 1.0)); } 
function setLogoScale(id, val){ logoScaleMap[id] = Math.max(0.1, +val); saveJSON(LS_LOGO, logoScaleMap); }

function buildItems(){
  items=[];
  items.push({ id:'date', kind:'text', getText:()=> (elDate?.value||'').toUpperCase() });
  const keys=['airline','flight','city','time'];
  ['arrivals','departures'].forEach((sec, sIdx)=>{
    const prefix = (sec==='arrivals')?'arr':'dep';
    state[sec].forEach((row, rIdx)=>{
      keys.forEach(k=>{
        items.push({ id:`${prefix}_${rIdx}_${k}`, kind:k==='airline'?'airline':'text', getText:()=> (row[k]||'').toUpperCase() });
      });
    });
  });
  items.push({ id:'hours', kind:'text', getText:()=> (elHours?.value||'') });
}
buildItems();

function getPos(id){
  const base = POS_DEFAULT[id];
  if(!base) return {x:0,y:0,align:'left',color:'#fff',font:'',h:20};
  const ov = posOverrides[id];
  const S = sizes();
  let font=S.rowFont, h=S.rowH, color=base.color; 
  if(id==='date'){ font=S.dateFont; h=S.dateH; }
  if(id==='hours'){ font=S.hoursFont; h=S.hoursH; color=S.hoursColor; }
  return { x: ov?.x ?? base.x, y: ov?.y ?? base.y, align: base.align, color, font, h, _airline: base?.kind==='airline' };
}

// ===== RENDER ROW EDITORS =====
const arrivalsWrap    = document.getElementById('arrivals');
const departuresWrap  = document.getElementById('departures');

function miniLogoControls(id){
  const scale = getLogoScale(id).toFixed(2);
  return `
    <div class="logo-wrapper">
       <small style="color:#64748b; font-size:10px;">Logo:</small>
       <div class="logo-controls">
         <input type="number" step="0.1" value="${scale}" class="logo-inp">
       </div>
    </div>
  `;
}

function renderRowEditors(){
  const build = (wrap, listName) => {
    wrap.innerHTML='';
    state[listName].forEach((row, idx)=>{
      const isArr = (listName==='arrivals');
      const airlineId = `${isArr ? 'arr':'dep'}_${idx}_airline`;
      const cityPlaceholder = isArr ? 'Origin' : 'Destination';

      const box=document.createElement('div');
      box.className='airline-row';
      
      box.innerHTML=`
        <input placeholder="Maskapai" value="${row.airline||''}" data-k="airline">
        <input placeholder="No Flight" value="${row.flight||''}" data-k="flight">
        <input placeholder="${cityPlaceholder}" maxlength="10" value="${row.city||''}" data-k="city">
        <input placeholder="Jam" value="${row.time||''}" data-k="time">
        
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
      
      const logoInp = box.querySelector('.logo-inp');
      if(logoInp){
        logoInp.addEventListener('input', (e)=>{
          setLogoScale(airlineId, e.target.value);
          render();
        });
      }
      
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

// Image Loader
const IMG={};
function loadImage(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
async function getImg(src){ if(!src) return null; if(!IMG[src]) IMG[src]=await loadImage(src); return IMG[src]; }

// ===== DATE HELPER =====
const ID_DAYS = ['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];
const ID_MONTHS = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];

function daysInMonth(y, mIdx){ return new Date(y, mIdx+1, 0).getDate(); }

function populateDateDropdowns(){
  const now = new Date();
  if(!selDay) return;
  
  selMonth.innerHTML = ID_MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join('');
  
  selYear.innerHTML = [now.getFullYear(), now.getFullYear()+1].map(y=>`<option value="${y}">${y}</option>`).join('');
  
  const refreshDays = () => {
     const y = +selYear.value, m = +selMonth.value;
     const max = new Date(y, m+1, 0).getDate();
     selDay.innerHTML = Array.from({length:max},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  };
  
  selMonth.onchange = refreshDays; selYear.onchange = refreshDays;
  
  selMonth.value = now.getMonth(); 
  selYear.value = now.getFullYear(); 
  refreshDays(); 
  selDay.value = now.getDate();

  btnDateGo.onclick = () => {
      applyDateFromDropdown();
  };

  applyDateFromDropdown();
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

// Tint Helper
function tintImage(img, color) {
  if(color.toLowerCase() === '#ffffff') return img;
  const buffer = document.createElement('canvas');
  buffer.width = img.width; buffer.height = img.height;
  const bx = buffer.getContext('2d');
  bx.drawImage(img, 0, 0);
  bx.globalCompositeOperation = 'source-in';
  bx.fillStyle = color;
  bx.fillRect(0, 0, buffer.width, buffer.height);
  return buffer;
}

// Render Loop
async function render(){
  if(elBgSelect) state.bgURL = elBgSelect.value;
  const bg = await getImg(state.bgURL);
  ctx.clearRect(0,0,BASE_W,BASE_H);
  if(bg) ctx.drawImage(bg,0,0,BASE_W,BASE_H);

  const drawSep = (sec, count) => {
     ctx.save();
     ctx.strokeStyle = state.globalColor || 'rgba(255,255,255,0.95)';
     ctx.lineWidth = 3; ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=4;
     for(let i=0;i<count;i++){
       const pos = getPos(`${sec}_${i}_time`);
       const y = pos.y + 22; 
       ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(1020, y); ctx.stroke();
     }
     ctx.restore();
  };
  drawSep('arr', Math.min(3, state.arrivals.length));
  drawSep('dep', Math.min(3, state.departures.length));

  ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 6; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;

  for(const it of items){
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
        let x=p.x, y=p.y - H/2; 
        if(p.align==='center') x-=W/2; else if(p.align==='right') x-=W;
        
        let drawObj = img;
        if(state.globalColor && state.globalColor.toLowerCase() !== '#ffffff') drawObj = tintImage(img, state.globalColor);
        
        ctx.drawImage(drawObj,x,y,W,H);
        
        if(showGuides){
           ctx.save(); 
           ctx.shadowColor='transparent'; 
           ctx.strokeStyle='#00ffff88'; ctx.lineWidth=2; 
           ctx.strokeRect(x,y,W,H); 
           ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
           ctx.fillText(`${it.id}`, x, Math.max(16,y-6));
           ctx.restore();
        }
        continue;
      }
    }

    ctx.save();
    ctx.font=p.font; ctx.fillStyle=p.color; ctx.textAlign=p.align; ctx.textBaseline='alphabetic';
    ctx.fillText(txt, p.x, p.y);
    
    if(showGuides){
       const w = ctx.measureText(txt).width;
       let x0=p.x; if(p.align==='center') x0-=w/2; else if(p.align==='right') x0-=w;
       ctx.shadowColor='transparent'; 
       ctx.strokeStyle='#00ffff88'; ctx.lineWidth=2; 
       ctx.strokeRect(x0, p.y-p.h+6, w, p.h+8);
       
       ctx.fillStyle='#00ffff'; ctx.font='700 16px Montserrat, system-ui'; ctx.textAlign='left';
       ctx.fillText(`${it.id}`, x0, Math.max(16, p.y-p.h));
    }
    ctx.restore();
  }
}

// ===== DRAG & DROP ENGINE (OPTIMIZED) =====
let dragging=null;
let resizingLogo=null; 

// Fungsi Hit Test (Sync jika teks, Async jika logo butuh loading)
async function getRectForItem(it){
  const p = getPos(it.id);
  
  // LOGO
  if(it.kind==='airline'){
    const file = airlineLogo(it.getText());
    const S = sizes();
    const scale = getLogoScale(it.id);
    const H = Math.max(10, S.logoBaseH * scale);
    if(file){
      // Kita panggil getImg yang sudah dicache
      // Jika belum dicache, mungkin butuh waktu sedikit (await)
      const img = await getImg(file);
      const W = H * (img.width/img.height);
      let x0=p.x; 
      if(p.align==='center') x0-=W/2; 
      else if(p.align==='right') x0-=W;
      const y0=p.y - H/2;
      return { x:x0, y:y0, w:W, h:H };
    }
  }
  
  // TEXT
  ctx.save(); 
  ctx.font=p.font;
  // Hitung lebar teks secara sinkron
  const w = ctx.measureText(it.getText()).width; 
  ctx.restore();
  
  let x0=p.x; 
  if(p.align==='center') x0-=w/2; 
  else if(p.align==='right') x0-=w;
  
  // Asumsi tinggi hit box berdasarkan ukuran font (p.h)
  const y0 = p.y - p.h + 6; 
  return { x:x0, y:y0, w:Math.max(20, w), h:p.h+8 };
}

function pointer(e){
  const r = c.getBoundingClientRect();
  const cx = (e.touches?e.touches[0].clientX:e.clientX);
  const cy = (e.touches?e.touches[0].clientY:e.clientY);
  return { x: (cx-r.left)*(BASE_W/r.width), y: (cy-r.top)*(BASE_H/r.height) };
}

// Event Handler: Mouse Down / Touch Start
async function onDown(e){
  if(isLocked) return; // Jika terkunci, abaikan

  // PENTING: Mencegah scroll/zoom default browser agar drag lancar
  if(e.type === 'touchstart') e.preventDefault(); 

  const p = pointer(e);
  
  // Loop cek item mana yang kena sentuh
  for(let i=items.length-1; i>=0; i--){
    const it = items[i];
    try {
      const r = await getRectForItem(it);
      if(p.x >= r.x && p.x <= r.x+r.w && p.y >= r.y && p.y <= r.y+r.h){
        const pos = getPos(it.id);
        
        // Fitur Resize Logo (Shift + Drag atau 2 jari)
        if (it.kind==='airline' && (e.shiftKey || (e.touches && e.touches.length===2))) {
          const cur = getLogoScale(it.id);
          resizingLogo = { id: it.id, startY: p.y, startScale: cur };
        } else {
          dragging = { id:it.id, offX: pos.x-p.x, offY: pos.y-p.y };
        }
        return; // Stop loop jika sudah dapat 1 item
      }
    } catch(err){}
  }
}

// Event Handler: Move
function onMove(e){
  if(isLocked) return;
  
  // Jika sedang drag, prevent default agar tidak select text lain
  if(dragging || resizingLogo) e.preventDefault();

  const p = pointer(e);
  
  if(resizingLogo){
    const dy = (p.y - resizingLogo.startY);
    const newScale = Math.max(0.1, Math.min(3.0, resizingLogo.startScale * (1 + dy/240)));
    setLogoScale(resizingLogo.id, newScale);
    render();
    return;
  }
  
  if(dragging){
    posOverrides[dragging.id] = { 
      x: Math.round(p.x + dragging.offX), 
      y: Math.round(p.y + dragging.offY) 
    };
    render();
  }
}

// Event Handler: Up / End
function onUp(){ 
  if(dragging || resizingLogo) {
      saveJSON(LS_POS, posOverrides); 
  }
  dragging = null; 
  resizingLogo = null; 
}

// Bind Events
c.addEventListener('mousedown', onDown);
window.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);

// Passive: false penting agar preventDefault() jalan di mobile
c.addEventListener('touchstart', onDown, {passive:false});
window.addEventListener('touchmove', onMove, {passive:false});
window.addEventListener('touchend', onUp);

elBgSelect?.addEventListener('change', render);
elBgInput?.addEventListener('change', e => {
   const f=e.target.files[0]; if(f) { const r=new FileReader(); r.onload=v=>{state.bgURL=v.target.result; render();}; r.readAsDataURL(f); }
});

function buildFilename(ext){
  const raw = (elDate?.value || '').replace(/,/g,' ').trim();
  const safe = raw.replace(/\s+/g,'') || 'poster';
  return `scheduleflight_${safe}.${ext}`;
}

document.getElementById('savePng')?.addEventListener('click', ()=>{
  const a=document.createElement('a'); a.download=buildFilename('png'); a.href=c.toDataURL(); a.click();
});
document.getElementById('savePdf')?.addEventListener('click', async ()=>{
  if(!window.jspdf){
    await new Promise((res)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'; s.onload=res; document.body.appendChild(s); });
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'p', unit:'px', format:[BASE_W, BASE_H]});
  pdf.addImage(c.toDataURL('image/jpeg',0.96),'JPEG',0,0,BASE_W,BASE_H);
  pdf.save(buildFilename('pdf'));
});

// INITIAL LOAD
loadConfig();
updateLockUI();
renderRowEditors();
render();
