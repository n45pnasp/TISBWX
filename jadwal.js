// ====== Canvas & ctx
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

// ====== Asset (background layout baru)
const ASSETS = { bg: 'bahan_flyer_bwx.png' };

// ====== State data (maks 2 baris per seksi)
const state = {
  bgURL: ASSETS.bg,
  dateText: (document.getElementById('dateText')?.value) || 'MINGGU, 19 OKTOBER 2025',
  arrivals: [
    { airline: 'SUPER AIR JET', flight: 'IU 370', city: 'JAKARTA',  time: '10:15 WIB' },
    { airline: 'WINGS AIR',     flight: 'IW 1880', city: 'SURABAYA', time: '12.40 WIB' }
  ],
  departures: [
    { airline: 'SUPER AIR JET', flight: 'IU 371', city: 'JAKARTA',  time: '10:55 WIB' },
    { airline: 'WINGS AIR',     flight: 'IW 1881', city: 'SURABAYA', time: '13.00 WIB' }
  ],
  hoursText: (document.getElementById('hoursText')?.value) || 'Operating Hours 06.00 - 18.00 WIB'
};

// ====== Posisi default (disesuaikan ke layout background baru 1080×1920)
const POS = {
  dateY: 560,                           // Hari & Tanggal
  col: { airline:110, flight:420, city:690, time:990 }, // x kolom (time pakai align 'right')
  arrivalsY:   [ 650, 760 ],
  departuresY: [1030, 1140],
  hoursCenter: { x:540, y:1372 }        // tengah pill hijau
};

// ====== Items (teks yang bisa digeser)
let items = [];        // {id, getText, x, y, align, font, color, h}
let showGuides = true; // panduan
const LS_KEY = 'fs_positions_v1';

function applySavedPositions() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    items.forEach(it => {
      if (saved[it.id]) { it.x = saved[it.id].x; it.y = saved[it.id].y; }
    });
  } catch {}
}
function savePositions() {
  const payload = {};
  items.forEach(it => payload[it.id] = { x: it.x, y: it.y });
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

function buildItems() {
  items = [];

  // 1) Hari & Tanggal (center)
  items.push({
    id: 'date',
    getText: () => (document.getElementById('dateText')?.value || state.dateText).toUpperCase(),
    x: c.width/2,
    y: POS.dateY,
    align: 'center',
    font: '900 48px Inter, system-ui, sans-serif',
    color: '#ffffff',
    h: 54
  });

  // helper kolom untuk baris
  const cols = [
    { key:'airline', x:POS.col.airline, align:'left'  },
    { key:'flight',  x:POS.col.flight,  align:'left'  },
    { key:'city',    x:POS.col.city,    align:'left'  },
    { key:'time',    x:POS.col.time,    align:'right' },
  ];
  const makeRowItems = (prefix, rows, yList) => {
    rows.slice(0,2).forEach((row, i) => {
      cols.forEach(col => {
        items.push({
          id: `${prefix}${i}_${col.key}`,
          getText: () => ( (rows[i]?.[col.key] || '').toUpperCase() ),
          x: col.x, y: yList[i],
          align: col.align,
          font: '800 42px Inter, system-ui, sans-serif',
          color: '#ffffff',
          h: 48
        });
      });
    });
  };
  makeRowItems('arr_', state.arrivals, POS.arrivalsY);
  makeRowItems('dep_', state.departures, POS.departuresY);

  // 3) Operating hours di pill hijau (center)
  items.push({
    id: 'hours',
    getText: () => (document.getElementById('hoursText')?.value || state.hoursText),
    x: POS.hoursCenter.x,
    y: POS.hoursCenter.y,
    align: 'center',
    font: '900 44px Inter, system-ui, sans-serif',
    color: '#0c2a1a',
    h: 50
  });

  applySavedPositions();
}

// ====== Load IMG
function loadImage(src){
  return new Promise((res, rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
}

// ====== Render
async function render(){
  // sinkronisasi input
  state.dateText  = document.getElementById('dateText')?.value || state.dateText;
  state.hoursText = document.getElementById('hoursText')?.value || state.hoursText;

  // bangun items setiap render (agar getText selalu update)
  buildItems();

  // background
  const bg = await loadImage(state.bgURL);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(bg, 0, 0, c.width, c.height);

  // gambar teks
  items.forEach((it, idx) => {
    ctx.save();
    ctx.fillStyle = it.color;
    ctx.font = it.font;
    ctx.textAlign = it.align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(it.getText(), it.x, it.y);

    if (showGuides) {
      // bounding box kasar
      const w = ctx.measureText(it.getText()).width;
      const box = getItemRect(it, w);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ffff88';
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      // index label
      ctx.fillStyle = '#00ffff';
      ctx.font = '700 20px Inter, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`#${idx+1}`, box.x+4, box.y+20);
    }
    ctx.restore();
  });
}

// hit-test rectangle untuk item (menggunakan width dari measureText)
function getItemRect(it, measuredWidth){
  const w = Math.max(10, measuredWidth);
  const h = it.h;
  let x0 = it.x;
  if (it.align === 'center') x0 = it.x - w/2;
  else if (it.align === 'right') x0 = it.x - w;
  const y0 = it.y - h + 6; // baseline -> approx box
  return { x:x0, y:y0, w:w, h:h+8 };
}

// ====== Drag & Drop
let active = null;      // {item, offX, offY}
function pointerXY(e){
  const rect = c.getBoundingClientRect();
  const cx = (e.touches? e.touches[0].clientX : e.clientX) - rect.left;
  const cy = (e.touches? e.touches[0].clientY : e.clientY) - rect.top;
  // skala karena canvas ditampilkan 360×640 di CSS
  const scaleX = c.width  / rect.width;
  const scaleY = c.height / rect.height;
  return { x: cx*scaleX, y: cy*scaleY };
}

function onDown(e){
  const p = pointerXY(e);
  // cari item teratas yang kena
  for (let i = items.length-1; i >= 0; i--){
    const it = items[i];
    ctx.save(); ctx.font = it.font;
    const w = ctx.measureText(it.getText()).width; ctx.restore();
    const r = getItemRect(it, w);
    if (p.x >= r.x && p.x <= r.x+r.w && p.y >= r.y && p.y <= r.y+r.h) {
      active = { item: it, offX: it.x - p.x, offY: it.y - p.y };
      e.preventDefault();
      return;
    }
  }
}

function onMove(e){
  if (!active) return;
  const p = pointerXY(e);
  active.item.x = Math.round(p.x + active.offX);
  active.item.y = Math.round(p.y + active.offY);
  render();
}

function onUp(){
  if (active){ savePositions(); active = null; }
}

c.addEventListener('mousedown', onDown);
c.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
c.addEventListener('touchstart', onDown, {passive:false});
c.addEventListener('touchmove', onMove, {passive:false});
c.addEventListener('touchend', onUp);

// ====== Keyboard (nudge & tools)
let lastSelectedIdx = null;
function selectNearest(px, py){
  // pilih item terdekat ke pointer untuk nudge pertama kali
  let best = 0, bestD = Infinity;
  items.forEach((it, i)=>{
    const dx = it.x - px, dy = it.y - py, d = dx*dx + dy*dy;
    if (d < bestD){ bestD = d; best = i; }
  });
  lastSelectedIdx = best;
}
c.addEventListener('click', (e)=>{
  const p = pointerXY(e);
  selectNearest(p.x, p.y);
});

window.addEventListener('keydown', (e)=>{
  // toggle guides
  if (e.key.toLowerCase() === 'g'){ showGuides = !showGuides; render(); return;}
  if (e.key.toLowerCase() === 'r'){ localStorage.removeItem(LS_KEY); render(); return;}
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
    if (lastSelectedIdx == null) { lastSelectedIdx = 0; }
    const it = items[lastSelectedIdx];
    if (!it) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key==='ArrowUp')    it.y -= step;
    if (e.key==='ArrowDown')  it.y += step;
    if (e.key==='ArrowLeft')  it.x -= step;
    if (e.key==='ArrowRight') it.x += step;
    savePositions(); render();
  }
});

// ====== Export
function savePNG(){
  const a = document.createElement('a');
  a.download = `flight-schedule-${Date.now()}.png`;
  a.href = c.toDataURL('image/png');
  a.click();
}
async function savePDF(){
  if(!window.jspdf){
    await new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      s.onload=res; s.onerror=rej; document.body.appendChild(s);
    });
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'p', unit:'px', format:[1080,1920]});
  pdf.addImage(c.toDataURL('image/jpeg',0.96), 'JPEG', 0, 0, 1080, 1920);
  pdf.save(`flight-schedule-${Date.now()}.pdf`);
}

// ====== Sidebar hooks
document.getElementById('bgInput')?.addEventListener('change', async (e)=>{
  const f = e.target.files?.[0]; if(!f) return;
  const r = new FileReader();
  r.onload = (ev)=>{ state.bgURL = ev.target.result; render(); };
  r.readAsDataURL(f);
});
document.getElementById('renderBtn')?.addEventListener('click', render);
document.getElementById('savePng')?.addEventListener('click', savePNG);
document.getElementById('savePdf')?.addEventListener('click', savePDF);

document.getElementById('addArrival')?.addEventListener('click', ()=>{
  if (state.arrivals.length>=2) return;
  state.arrivals.push({airline:'', flight:'', city:'', time:''});
  render();
});
document.getElementById('addDeparture')?.addEventListener('click', ()=>{
  if (state.departures.length>=2) return;
  state.departures.push({airline:'', flight:'', city:'', time:''});
  render();
});

// ====== First render
render().catch(err=>{
  console.warn('Render gagal:', err);
  ctx.fillStyle='#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
});
