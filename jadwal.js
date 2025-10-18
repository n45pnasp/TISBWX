// ====== Canvas
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

// ====== Default assets (pakai nama aman/tanpa spasi jika bisa)
const ASSETS = {
  bg: 'bahan_flyer_bwx.png',                 // ganti jika nama filemu berbeda
  logoLeft: 'injourney_airports_putih.png',
  logoRight: 'bwx_banyuwangi.png',
  wings: 'wings_logo.png',
  saj: 'super_air_jet_logo.png'
};

// ====== State sample
const state = {
  bgURL: ASSETS.bg,
  logoLeftURL: ASSETS.logoLeft,
  logoRightURL: ASSETS.logoRight,
  arrivals: [
    { airline: 'Super Air Jet', flight: 'IU 370', city: 'JAKARTA',  time: '10:15 WIB' },
    { airline: 'Wings Air',     flight: 'IW 1880', city: 'SURABAYA', time: '12.40 WIB' }
  ],
  departures: [
    { airline: 'Super Air Jet', flight: 'IU 371', city: 'JAKARTA',  time: '10:55 WIB' },
    { airline: 'Wings Air',     flight: 'IW 1881', city: 'SURABAYA', time: '13.00 WIB' }
  ]
};

// ====== Utils
function loadImage(src){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>res(img);
    img.onerror = rej;
    img.src = src;
  });
}
function fileToDataURL(file){
  return new Promise((res)=>{
    const r = new FileReader();
    r.onload = e=>res(e.target.result);
    r.readAsDataURL(file);
  });
}
function rr(x,y,w,h,r=18){ // rounded rect path
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

// ====== Cache
const cache = {};
async function ensureAssets(){
  if(!cache.bg)        cache.bg        = await loadImage(state.bgURL);
  if(!cache.logoLeft)  cache.logoLeft  = await loadImage(state.logoLeftURL);
  if(!cache.logoRight) cache.logoRight = await loadImage(state.logoRightURL);
  if(!cache.wings)     cache.wings     = await loadImage(ASSETS.wings);
  if(!cache.saj)       cache.saj       = await loadImage(ASSETS.saj);
}

// ====== Table drawing tuned to sample
function drawTable({ yTop, rows, isArrival }){
  const padX = 48;
  const x = padX;
  const w = c.width - padX*2;

  // Section title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.font = '900 56px Inter, system-ui, sans-serif';
  ctx.fillText(isArrival ? 'KEDATANGAN / ARRIVAL' : 'KEBERANGKATAN / DEPARTURE', x, yTop);

  // Header bar (white rounded)
  const headY = yTop + 18;
  const headH = 86;
  ctx.fillStyle = '#ffffff';
  rr(x, headY, w, headH, 20); ctx.fill();

  // Header labels (teal)
  ctx.fillStyle = '#0c7f8a';
  ctx.font = '800 36px Inter, system-ui, sans-serif';
  const c1 = x + 160;   // airline col start (after logo box)
  const c2 = x + 410;   // flight
  const c3 = x + 680;   // origin/destination
  const c4 = x + 930;   // time
  ctx.fillText('AIRLINES', c1, headY + 58);
  ctx.fillText('FLIGHT NO.', c2, headY + 58);
  ctx.fillText(isArrival ? 'ORIGIN' : 'DESTINATION', c3, headY + 58);
  ctx.fillText('TIME', c4, headY + 58);

  // Data rows
  const rowH = 96;
  let y = headY + headH + 6;
  rows.forEach((r, i)=>{
    // divider line
    if(i>0){
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y-12);
      ctx.lineTo(x+w, y-12);
      ctx.stroke();
    }

    // logo airline
    const nm = (r.airline||'').toLowerCase();
    let img = null;
    if(nm.includes('wings')) img = cache.wings;
    else if(nm.includes('super')) img = cache.saj;
    if(img){
      const h = 44, iw = h*(img.width/img.height);
      ctx.drawImage(img, x+24, y-4, iw, h);
    }

    // texts
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = '700 40px Inter, system-ui, sans-serif';
    ctx.fillText(r.airline||'', c1, y+32);
    ctx.fillText(r.flight||'',  c2, y+32);
    ctx.fillText((r.city||'').toUpperCase(), c3, y+32);
    ctx.fillText(r.time||'',    c4, y+32);

    y += rowH;
  });

  return y; // bottom Y
}

async function render(){
  await ensureAssets();

  // Background
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(cache.bg, 0, 0, c.width, c.height);

  // Lime circles (overlap like sample)
  ctx.fillStyle = '#7ec242';
  ctx.beginPath(); ctx.arc(c.width-180, 270, 190, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(c.width-130, 540, 170, 0, Math.PI*2); ctx.fill();

  // Top logos (smaller, mengikuti sample)
  // Left (Injourney)
  {
    const h=62, w=h*(cache.logoLeft.width/cache.logoLeft.height);
    ctx.drawImage(cache.logoLeft, 48, 78, w, h);
  }
  // Right (Banyuwangi)
  {
    const h=84, w=h*(cache.logoRight.width/cache.logoRight.height);
    ctx.drawImage(cache.logoRight, c.width-48-w, 80, w, h);
  }

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.font = '900 150px Inter, system-ui, sans-serif';
  ctx.fillText((document.getElementById('titleText').value || 'FLIGHT SCHEDULE').toUpperCase(), 48, 370);

  // Sub: airport
  ctx.font = '900 70px Inter, system-ui, sans-serif';
  ctx.fillText(document.getElementById('airportName').value || 'Banyuwangi Airport', 48, 455);

  // Date + subtitle line
  ctx.font = '900 44px Inter, system-ui, sans-serif';
  const dateLine = (document.getElementById('dateText').value || '').toUpperCase() + '\n' +
                   ( 'KEDATANGAN / ARRIVAL' ); // hanya agar spacing mirip sample sebelum header
  // (kita tulis baris pertama saja—header tabel menimpa label ARRIVAL di bawah)
  ctx.fillText((document.getElementById('dateText').value || '').toUpperCase(), 48, 532);

  // Sections
  let y = 560;
  y = drawTable({ yTop: y, rows: state.arrivals, isArrival:true });
  y += 28;
  y = drawTable({ yTop: y, rows: state.departures, isArrival:false });

  // Green pill banner (Operating Hours)
  const text = document.getElementById('hoursText').value || 'Operating Hours 06.00 - 18.00 WIB';
  const pillW = 840, pillH = 96, pillX = (c.width-pillW)/2, pillY = 1510;
  ctx.fillStyle = '#76c442';
  rr(pillX, pillY, pillW, pillH, 60); ctx.fill();
  ctx.fillStyle = '#0c2a1a';
  ctx.textAlign = 'center';
  ctx.font = '900 44px Inter, system-ui, sans-serif';
  ctx.fillText(text, pillX + pillW/2, pillY + 62);

  // Footer texts
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.textAlign = 'left';
  ctx.font = '900 34px Inter, system-ui, sans-serif';
  ctx.fillText('www.banyuwangi-airport.com', 48, 1842);
  ctx.textAlign = 'right';
  ctx.fillText('banyuwangiairport', c.width-48, 1842);
}

// ====== PNG & PDF
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
  pdf.addImage(c.toDataURL('image/jpeg',0.95), 'JPEG', 0, 0, 1080, 1920);
  pdf.save(`flight-schedule-${Date.now()}.pdf`);
}

// ====== Sidebar dynamic rows
function makeRow(container, list, idx){
  const row = document.createElement('div');
  row.className = 'airline-row';
  row.innerHTML = `
    <select data-k="airline">
      <option>Super Air Jet</option>
      <option>Wings Air</option>
      <option>Lainnya</option>
    </select>
    <input placeholder="Flight No" data-k="flight"/>
    <input placeholder="Origin/Destination" data-k="city"/>
    <input placeholder="Time" data-k="time"/>
  `;
  const del = document.createElement('button');
  del.textContent = '✕'; del.title='Hapus';
  del.onclick = ()=>{ list.splice(idx,1); rebuild(); };
  row.appendChild(del);
  container.appendChild(row);

  row.querySelectorAll('[data-k]').forEach(el=>{
    const k = el.dataset.k;
    el.value = list[idx][k] || '';
    el.oninput = ()=>{ list[idx][k] = el.value; };
  });
}
function rebuild(){
  const A = document.getElementById('arrivals');
  const D = document.getElementById('departures');
  A.innerHTML = ''; D.innerHTML = '';
  state.arrivals.forEach((_,i)=>makeRow(A, state.arrivals, i));
  state.departures.forEach((_,i)=>makeRow(D, state.departures, i));
}

// ====== Wire UI
document.getElementById('addArrival').onclick   = ()=>{ state.arrivals.push({airline:'Wings Air', flight:'IW ', city:'', time:''}); rebuild(); };
document.getElementById('addDeparture').onclick = ()=>{ state.departures.push({airline:'Wings Air', flight:'IW ', city:'', time:''}); rebuild(); };

['logoLeft','logoRight','bgInput'].forEach(id=>{
  document.getElementById(id).addEventListener('change', async (e)=>{
    const f = e.target.files && e.target.files[0]; if(!f) return;
    const url = await fileToDataURL(f);
    if(id==='logoLeft'){ state.logoLeftURL=url; cache.logoLeft=null; }
    if(id==='logoRight'){ state.logoRightURL=url; cache.logoRight=null; }
    if(id==='bgInput'){ state.bgURL=url; cache.bg=null; }
    render();
  });
});
document.getElementById('renderBtn').onclick = render;
document.getElementById('resetBtn').onclick  = ()=>{
  Object.assign(state, { bgURL:ASSETS.bg, logoLeftURL:ASSETS.logoLeft, logoRightURL:ASSETS.logoRight });
  cache.bg = cache.logoLeft = cache.logoRight = null;
  render();
};
document.getElementById('savePng').onclick = savePNG;
document.getElementById('savePdf').onclick = savePDF;

// build rows & first render
(function init(){
  rebuild();
  render().catch(err=>{
    console.warn('Render fallback', err);
    ctx.fillStyle = '#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
  });
})();
