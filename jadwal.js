// ====== Canvas
const c = document.getElementById('poster');
const ctx = c.getContext('2d');

// ====== Gunakan nama file tanpa spasi/kurung untuk aman di GitHub Pages
const ASSETS = {
  bg: 'bahan_flyer_bwx.png' // background layout baru (yang sudah ada header/garis/pill hijau)
};

// ====== State (maks 2 baris tiap seksi sesuai layout)
const state = {
  bgURL: ASSETS.bg,
  // tampil di baris tepat di atas "KEDATANGAN / ARRIVAL"
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

// ====== UI (sidebar) – rebuild baris yang bisa diedit
function makeRow(container, list, idx){
  const row = document.createElement('div');
  row.className = 'airline-row';
  row.innerHTML = `
    <input placeholder="Airlines" data-k="airline"/>
    <input placeholder="Flight No" data-k="flight"/>
    <input placeholder="Origin/Dest" data-k="city"/>
    <input placeholder="Time" data-k="time"/>
    <button type="button" title="Hapus">✕</button>
  `;
  row.querySelectorAll('[data-k]').forEach(el=>{
    const k = el.dataset.k; el.value = list[idx][k] || '';
    el.oninput = ()=> list[idx][k] = el.value;
  });
  row.querySelector('button').onclick = ()=>{ list.splice(idx,1); rebuild(); };
  container.appendChild(row);
}
function rebuild(){
  const A = document.getElementById('arrivals');
  const D = document.getElementById('departures');
  if(!A || !D) return;
  A.innerHTML = ''; D.innerHTML = '';
  state.arrivals.slice(0,2).forEach((_,i)=>makeRow(A, state.arrivals, i));
  state.departures.slice(0,2).forEach((_,i)=>makeRow(D, state.departures, i));
}
rebuild();

// ====== File picker untuk ganti background
document.getElementById('bgInput')?.addEventListener('change', async (e)=>{
  const f = e.target.files?.[0]; if(!f) return;
  const r = new FileReader();
  r.onload = (ev)=>{ state.bgURL = ev.target.result; render(); };
  r.readAsDataURL(f);
});

// ====== Tombol
document.getElementById('renderBtn')?.addEventListener('click', render);
document.getElementById('savePng')?.addEventListener('click', savePNG);
document.getElementById('savePdf')?.addEventListener('click', savePDF);

// ====== Posisi teks yang dipetakan ke layout background baru (1080×1920)
const POS = {
  // tanggal tepat di bawah judul & di atas label ARRIVAL
  dateY: 560,

  // koordinat kolom (diset agar pas dengan header putih di BG)
  col: {
    airline: 110,
    flight : 420,
    city   : 690,  // origin / destination
    time   : 940
  },

  // Y baris tengah garis putih (perkirakan dengan visual BG)
  arrivalsY: [ 650, 760 ],     // 2 baris kedatangan
  departuresY: [ 1030, 1140 ], // 2 baris keberangkatan

  // pusat kotak hijau (pill)
  hoursCenter: { x: 540, y: 1372 }
};

// ====== Render
async function loadImage(src){
  return new Promise((res, rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
}

async function render(){
  // ambil input terbaru dari sidebar
  state.dateText  = document.getElementById('dateText')?.value || state.dateText;
  state.hoursText = document.getElementById('hoursText')?.value || state.hoursText;

  // background
  const bg = await loadImage(state.bgURL);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(bg, 0, 0, c.width, c.height);

  // Tanggal
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 48px Inter, system-ui, sans-serif';
  ctx.fillText(state.dateText.toUpperCase(), c.width/2, POS.dateY);

  // Helper tulis baris
  function drawRow(y, row){
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = '800 42px Inter, system-ui, sans-serif';
    ctx.fillText((row.airline || '').toUpperCase(), POS.col.airline, y);
    ctx.fillText((row.flight  || '').toUpperCase(), POS.col.flight,  y);
    ctx.fillText((row.city    || '').toUpperCase(), POS.col.city,    y);
    ctx.textAlign = 'right';
    ctx.fillText((row.time    || '').toUpperCase(), POS.col.time+50, y); // +50 agar tidak mentok sisi kanan header
  }

  // Arrival rows (maks 2)
  POS.arrivalsY.forEach((y,i)=>{ if(state.arrivals[i]) drawRow(y, state.arrivals[i]); });

  // Departure rows (maks 2)
  POS.departuresY.forEach((y,i)=>{ if(state.departures[i]) drawRow(y, state.departures[i]); });

  // Operating hours di pill hijau
  ctx.fillStyle = '#0c2a1a';
  ctx.textAlign = 'center';
  ctx.font = '900 44px Inter, system-ui, sans-serif';
  ctx.fillText(state.hoursText, POS.hoursCenter.x, POS.hoursCenter.y);
}

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

// ====== Inisialisasi
document.getElementById('addArrival')?.addEventListener('click', ()=>{
  if(state.arrivals.length>=2) return;
  state.arrivals.push({airline:'', flight:'', city:'', time:''});
  rebuild();
});
document.getElementById('addDeparture')?.addEventListener('click', ()=>{
  if(state.departures.length>=2) return;
  state.departures.push({airline:'', flight:'', city:'', time:''});
  rebuild();
});

// render pertama
render().catch(err=>{
  console.warn('Render gagal, cek path background:', err);
  ctx.fillStyle = '#10a7b5'; ctx.fillRect(0,0,c.width,c.height);
});
