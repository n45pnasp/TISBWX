/******************************************************************
 * jadwal.js — v19 (Restored Grid/Labels & Desktop Layout)
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

// ===== FITUR SAVE / LOAD CONFIG =====
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

btnLock?.addEventListener('click', () => {
  const config = {
    sizeDate: elSizeDate?.value || 40,
    sizeRow: elSizeRow?.value || 30,
    sizeHours: elSizeHours?.value || 35,
    hoursColor: elHoursCol?.value || '#ffffff',
    globalColor: state.globalColor || '#ffffff'
  };
  localStorage.setItem(LS_CONFIG, JSON.stringify(config));
  
  const oriText = btnLock.innerHTML;
  btnLock.innerHTML = "✅ Tersimpan!";
  setTimeout(() => btnLock.innerHTML = oriText, 1500);
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
  arrivals: [
    { airline:'SUPER AIR JET', flight:'IU 370', city:'JAKARTA',  time:'10:15 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1880', city:'SURABAYA', time:'12:40 WIB' }
  ],
  departures: [
    { airline:'SUPER AIR JET', flight:'IU 371', city:'JAKARTA',  time:'10:55 WIB' },
    { airline:'WINGS AIR',     flight:'IW 1881', city:'SURABAYA', time:'13:00 WIB' }
  ]
};

// ===== Posisi Default
const POS_DEFAULT = {
  date: { x:531, y:509, align:'center', color:'#ffffff', h:48 },
  hours: { x:702, y:1384, align:'center', color:'#ffffff', h:44 },
  // Arrivals
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
  // Departures
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
  dep_2_time   :{ x:1020,y:1234, align:'right', color:'#ffffff', h:40 }
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
    rowH     : Math.round(szRow * 1.2),
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
      
      // Structure: Inputs First -> Button -> Logo Controls
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

// Date Helper
const ID_DAYS = ['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];
const ID_MONTHS = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];

function populateDateDropdowns(){
  const now = new Date();
  if(!selDay) return;
  
  selMonth.innerHTML = ID_MONTHS.map((m,i)=>`<option value="${m.idx}">${m.label}</option>`).join('');
  selYear.innerHTML = [now.getFullYear(), now.getFullYear()+1].map(y=>`<option value="${y}">${y}</option>`).join('');
  
  const refreshDays = () => {
     const y = +selYear.value, m = +selMonth.value;
     const max = new Date(y, m+1, 0).getDate();
     selDay.innerHTML = Array.from({length:max},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  };
  
  selMonth.onchange = refreshDays; selYear.onchange = refreshDays;
  selMonth.value = now.getMonth(); selYear.value = now.getFullYear(); refreshDays(); selDay.value = now.getDate();

  btnDateGo.onclick = () => {
     const d = new Date(+selYear.value, +selMonth.value, +selDay.value);
     elDate.value = `${ID_DAYS[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
     render();
  };
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
        
        // Restore Grid Box + ID Label
        if(showGuides){
           ctx.save(); 
           ctx.shadowColor='transparent'; 
           ctx.strokeStyle='#00ffff88'; ctx.lineWidth=2; 
           ctx.strokeRect(x,y,W,H); 
           // Kembalikan teks ID
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
    
    // Restore Grid Box + ID Label untuk Teks
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

let dragging=null;
const getRect = async (it) => { 
  const p = getPos(it.id);
  ctx.save(); ctx.font=p.font; 
  const w = ctx.measureText(it.getText()).width; ctx.restore();
  let x=p.x; if(p.align==='center') x-=w/2; else if(p.align==='right') x-=w;
  return {x, y:p.y-p.h, w, h:p.h};
};

function pointer(e){
  const r = c.getBoundingClientRect();
  const cx = (e.touches?e.touches[0].clientX:e.clientX), cy = (e.touches?e.touches[0].clientY:e.clientY);
  return { x: (cx-r.left)*(BASE_W/r.width), y: (cy-r.top)*(BASE_H/r.height) };
}

c.addEventListener('mousedown', async e => {
  const p = pointer(e);
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];
    const r=await getRectForItem(it);
    if(p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h){
      const pos=getPos(it.id);
      dragging={ id:it.id, offX: pos.x-p.x, offY: pos.y-p.y };
      return;
    }
  }
});

c.addEventListener('mousemove', e => {
  if(!dragging) return;
  const p = pointer(e);
  posOverrides[dragging.id]={ x:Math.round(p.x+dragging.offX), y:Math.round(p.y+dragging.offY) };
  render();
});

window.addEventListener('mouseup', ()=>{
  if(dragging) saveJSON(LS_POS, posOverrides);
  dragging=null;
});

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
renderRowEditors();
render();
