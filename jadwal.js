// ====== Kanvas & konteks
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

// ====== Default aset (simak nama file)
const ASSETS = {
  bg: 'bahan_flyer_bwx.png',
  logoLeft: 'injourney_airports_putih.png',
  logoRight: 'bwx_banyuwangi.png',
  wings: 'wings_logo.png',
  saj: 'super_air_jet_logo.png'
};


// ====== State awal
const state = {
  bgURL: ASSETS.bg,
  logoLeftURL: ASSETS.logoLeft,
  logoRightURL: ASSETS.logoRight,
  arrivals: [
    { airline: 'Super Air Jet', flight: 'IU 370', city: 'JAKARTA',  time: '10:15 WIB' },
    { airline: 'Wings Air',    flight: 'IW 1880', city: 'SURABAYA', time: '12.40 WIB' }
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
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

// ====== Cache gambar
const cache = {};
async function ensureAssets(){
  if(!cache.bg)        cache.bg        = await loadImage(state.bgURL);
  if(!cache.logoLeft)  cache.logoLeft  = await loadImage(state.logoLeftURL);
  if(!cache.logoRight) cache.logoRight = await loadImage(state.logoRightURL);
  if(!cache.wings)     cache.wings     = await loadImage(ASSETS.wings);
  if(!cache.saj)       cache.saj       = await loadImage(ASSETS.saj);
}

// ====== Builder UI row di sidebar
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

// ====== Gambar tabel
function drawTable({ yStart, rows, isArrival }){
  const padX = 48;
  const rowH = 92;
  const headH= 86;
  const w = c.width - padX*2;
  const x = padX;

  // judul seksi
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(isArrival ? 'KEDATANGAN / ARRIVAL' : 'KEBERANGKATAN / DEPARTURE', x, yStart-24);

  // header tabel
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx,x,yStart,w,headH,18); ctx.fill();

  ctx.fillStyle = '#e9fbfd';
  ctx.font = '800 34px Inter, system-ui, sans-serif';
  const cols = ['AIRLINES','FLIGHT NO.', isArrival? 'ORIGIN':'DESTINATION','TIME'];
  const cx = [x+32, x+340, x+660, x+910];
  cols.forEach((t,i)=> ctx.fillText(t, cx[i], yStart+56) );

  // baris
  const y0 = yStart + headH + 10;
  rows.forEach((r,i)=>{
    const yy = y0 + i*rowH;

    // garis pemisah
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, yy+rowH-20); ctx.lineTo(x+w, yy+rowH-20); ctx.stroke();

    // logo maskapai
    const name = (r.airline||'').toLowerCase();
    let img = null;
    if(name.includes('wings')) img = cache.wings;
    else if(name.includes('super')) img = cache.saj;
    if(img){
      const h=40, iw=h*(img.width/img.height);
      ctx.drawImage(img, x+32, yy+18, iw, h);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px Inter, system-ui, sans-serif';
    ctx.textAlign='left';
    ctx.fillText(r.airline||'', x+ (img? 180:32), yy+50);
    ctx.fillText(r.flight||'',  x+340, yy+50);
    ctx.fillText((r.city||'').toUpperCase(), x+660, yy+50);
    ctx.fillText(r.time||'',    x+910, yy+50);
  });

  return yStart + headH + rows.length*rowH + 24;
}

// ====== Render utama
async function render(){
  await ensureAssets();

  // background
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(cache.bg, 0, 0, c.width, c.height);

  // lingkaran accent
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7ec242';
  ctx.beginPath(); ctx.arc(c.width-160, 280, 180, 0, Math.PI*2); ctx.fill();

  // logo atas
  // kiri
  const Lh=80, Lw=Lh*(cache.logoLeft.width/cache.logoLeft.height);
  ctx.drawImage(cache.logoLeft, 48, 80, Lw, Lh);
  // kanan
  const Rh=110, Rw=Rh*(cache.logoRight.width/cache.logoRight.height);
  ctx.drawImage(cache.logoRight, c.width-48-Rw, 70, Rw, Rh);

  // judul
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.font = '900 130px Inter, system-ui, sans-serif';
  ctx.fillText(document.getElementById('titleText').value.toUpperCase(), 48, 350);
  ctx.font = '800 58px Inter, system-ui, sans-serif';
  ctx.fillText(document.getElementById('airportName').value, 48, 430);

  // tanggal
  ctx.font = '800 46px Inter, system-ui, sans-serif';
  ctx.fillText(document.getElementById('dateText').value, 48, 520);

  // tabel
  let y = 580;
  y = drawTable({ yStart:y, rows:state.arrivals, isArrival:true });
  y += 24;
  y = drawTable({ yStart:y, rows:state.departures, isArrival:false });

  // banner operating hours
  const barY = 1500, barH=90, barW=740, barX=(c.width-barW)/2;
  ctx.fillStyle = '#76c442';
  roundRect(ctx, barX, barY, barW, barH, 50); ctx.fill();
  ctx.fillStyle = '#0c2a1a'; ctx.textAlign='center'; ctx.font='800 40px Inter, system-ui, sans-serif';
  ctx.fillText(document.getElementById('hoursText').value, barX+barW/2, barY+58);

  // footer
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign='left'; ctx.font='700 34px Inter, system-ui, sans-serif';
  ctx.fillText('www.banyuwangi-airport.com', 48, 1836);
  ctx.textAlign='right';
  ctx.fillText('banyuwangiairport', c.width-48, 1836);
}

// ====== Simpan
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

// ====== Sidebar: tambah/hapus & upload
function rebuild(){
  const A = document.getElementById('arrivals');
  const D = document.getElementById('departures');
  A.innerHTML=''; D.innerHTML='';
  state.arrivals.forEach((_,i)=>makeRow(A, state.arrivals, i));
  state.departures.forEach((_,i)=>makeRow(D, state.departures, i));
}
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

// ====== Tombol aksi
document.getElementById('renderBtn').onclick = render;
document.getElementById('resetBtn').onclick  = ()=>{
  Object.assign(state, { bgURL:ASSETS.bg, logoLeftURL:ASSETS.logoLeft, logoRightURL:ASSETS.logoRight });
  cache.bg = cache.logoLeft = cache.logoRight = null;
  render();
};
document.getElementById('savePng').onclick = savePNG;
document.getElementById('savePdf').onclick = savePDF;

// ====== Bangun UI awal & render pertama
(function init(){
  // build rows
  const A = document.getElementById('arrivals');
  const D = document.getElementById('departures');
  state.arrivals.forEach((_,i)=>makeRow(A, state.arrivals, i));
  state.departures.forEach((_,i)=>makeRow(D, state.departures, i));
  // render
  render().catch(err=>{
    console.warn('Gagal memuat aset default, render fallback.', err);
    ctx.fillStyle = '#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
  });
})();
