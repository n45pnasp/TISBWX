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

// ====== Posisi default (sesuaikan jika perlu)
const POS_DEFAULT = {
  date:      { x:540, y:560, align:'center', font:'900 48px Inter, system-ui, sans-serif', color:'#fff', h:54 },
  arr_0_airline:{ x:110, y:650, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_0_flight: { x:420, y:650, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_0_city:   { x:690, y:650, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_0_time:   { x:990, y:650, align:'right', font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_1_airline:{ x:110, y:760, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_1_flight: { x:420, y:760, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_1_city:   { x:690, y:760, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  arr_1_time:   { x:990, y:760, align:'right', font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_0_airline:{ x:110, y:1030, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_0_flight: { x:420, y:1030, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_0_city:   { x:690, y:1030, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_0_time:   { x:990, y:1030, align:'right', font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_1_airline:{ x:110, y:1140, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_1_flight: { x:420, y:1140, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_1_city:   { x:690, y:1140, align:'left',  font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  dep_1_time:   { x:990, y:1140, align:'right', font:'800 42px Inter, system-ui, sans-serif', color:'#fff', h:48 },
  hours:     { x:540, y:1372, align:'center', font:'900 44px Inter, system-ui, sans-serif', color:'#0c2a1a', h:50 }
};

// ====== Items & posisi override
const LS_KEY = 'fs_positions_v2';
let items = [];                 // array element teks yang digambar
let posOverrides = loadOverrides(); // { id: {x,y} }
let showGuides = true;

function loadOverrides(){
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
  catch { return {}; }
}
function saveOverrides(){
  localStorage.setItem(LS_KEY, JSON.stringify(posOverrides));
}

// buat daftar items SEkali (tidak di-reset saat render)
function buildItems(){
  items = [];

  // date
  items.push({
    id:'date',
    getText: ()=> (document.getElementById('dateText')?.value || 'MINGGU, 19 OKTOBER 2025').toUpperCase(),
  });

  // arrivals (maks 2)
  const AX = ['airline','flight','city','time'];
  for(let i=0;i<2;i++){
    AX.forEach(k=>{
      items.push({
        id:`arr_${i}_${k}`,
        getText:()=> (state.arrivals[i]?.[k] || '').toUpperCase()
      });
    });
  }
  // departures (maks 2)
  for(let i=0;i<2;i++){
    AX.forEach(k=>{
      items.push({
        id:`dep_${i}_${k}`,
        getText:()=> (state.departures[i]?.[k] || '').toUpperCase()
      });
    });
  }

  // hours text
  items.push({
    id:'hours',
    getText:()=> (document.getElementById('hoursText')?.value || 'Operating Hours 06.00 - 18.00 WIB')
  });
}
buildItems();

// helper: posisi efektif (default + override)
function getPos(id){
  const base = POS_DEFAULT[id];
  const ov = posOverrides[id];
  return {
    x: ov?.x ?? base.x,
    y: ov?.y ?? base.y,
    align: base.align,
    font: base.font,
    color: base.color,
    h: base.h
  };
}

// hit-test rectangle
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

// ====== Render
async function loadImage(src){
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
    ctx.font = p.font; ctx.fillStyle = p.color; ctx.textAlign = p.align; ctx.textBaseline='alphabetic';
    ctx.fillText(text, p.x, p.y);
    if(showGuides){
      const r = getRectForItem(it, text);
      ctx.lineWidth = 2; ctx.strokeStyle = '#00ffff88'; ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle='#00ffff'; ctx.font='700 18px Inter'; ctx.textAlign='left';
      ctx.fillText(`#${idx+1}`, r.x+4, r.y+18);
    }
    ctx.restore();
  });
}

// ====== Drag & drop
let dragging = null; // { id, offX, offY }

function getPointer(e){
  const rect = c.getBoundingClientRect();
  const cx = (e.touches? e.touches[0].clientX : e.clientX) - rect.left;
  const cy = (e.touches? e.touches[0].clientY : e.clientY) - rect.top;
  const sx = c.width / rect.width;
  const sy = c.height / rect.height;
  return { x: cx*sx, y: cy*sy };
}

function onDown(e){
  const p = getPointer(e);
  // cari item teratas
  for(let i=items.length-1;i>=0;i--){
    const it = items[i];
    const r = getRectForItem(it, it.getText());
    if(p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h){
      const pos = getPos(it.id);
      dragging = { id: it.id, offX: pos.x-p.x, offY: pos.y-p.y };
      e.preventDefault(); return;
    }
  }
}
function onMove(e){
  if(!dragging) return;
  const p = getPointer(e);
  // update override POSISI terlebih dahulu, baru render
  posOverrides[dragging.id] = { x: Math.round(p.x + dragging.offX), y: Math.round(p.y + dragging.offY) };
  saveOverrides();
  render();
}
function onUp(){ dragging=null; }

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
  const r = new FileReader();
  r.onload = ev => { state.bgURL = ev.target.result; render(); };
  r.readAsDataURL(f);
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

// ====== First render
render().catch(err=>{
  console.warn('Render gagal:', err);
  ctx.fillStyle='#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
});
