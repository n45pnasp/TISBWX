/******************************************************************
 * jadwal.js — FINAL (v3)
 * Fitur:
 * ✅ Render background dinamis (bwx1, bwx2, bwx3)
 * ✅ Logo maskapai otomatis (Super Air Jet / Wings Air)
 * ✅ Text bisa digeser (drag & drop di canvas)
 * ✅ Atur ukuran & warna font
 * ✅ Font Montserrat
 * ✅ Download PNG & PDF
 ******************************************************************/

// ===== Canvas & Context =====
const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");

// ===== Elemen UI =====
const dateInput = document.getElementById("dateText");
const hoursInput = document.getElementById("hoursText");
const bgSelect = document.getElementById("bgSelect");

const sizeDate = document.getElementById("sizeDate");
const sizeRow = document.getElementById("sizeRow");
const sizeHours = document.getElementById("sizeHours");
const colorHours = document.getElementById("hoursColor");

const sizeDateVal = document.getElementById("sizeDateVal");
const sizeRowVal = document.getElementById("sizeRowVal");
const sizeHoursVal = document.getElementById("sizeHoursVal");

const arrivalsDiv = document.getElementById("arrivals");
const departuresDiv = document.getElementById("departures");
const addArrivalBtn = document.getElementById("addArrival");
const addDepartureBtn = document.getElementById("addDeparture");

const renderBtn = document.getElementById("renderBtn");
const savePngBtn = document.getElementById("savePng");
const savePdfBtn = document.getElementById("savePdf");

// ===== Assets =====
const airlineLogos = {
  "super air jet": "super_air_jet_logo.png",
  "wings air": "wings_logo.png"
};

// ===== Data =====
let arrivalRows = [];
let departureRows = [];

// ===== Utility: Tambah baris input maskapai =====
function createRow(container, list) {
  const row = document.createElement("div");
  row.className = "row-item";
  row.innerHTML = `
    <input type="text" placeholder="Airline (Super Air Jet / Wings Air)" class="airline" />
    <input type="text" placeholder="Flight No." class="flight" />
    <input type="text" placeholder="From/To" class="route" />
    <input type="text" placeholder="Time" class="time" />
    <button class="del">✕</button>
  `;
  row.querySelector(".del").onclick = () => {
    container.removeChild(row);
    list.splice(list.indexOf(row), 1);
  };
  container.appendChild(row);
  list.push(row);
}

// ===== Event Tambah Baris =====
addArrivalBtn.onclick = () => createRow(arrivalsDiv, arrivalRows);
addDepartureBtn.onclick = () => createRow(departuresDiv, departureRows);

// ===== Ukuran Font Real-time =====
[sizeDate, sizeRow, sizeHours].forEach(slider => {
  slider.addEventListener("input", () => {
    sizeDateVal.textContent = sizeDate.value;
    sizeRowVal.textContent = sizeRow.value;
    sizeHoursVal.textContent = sizeHours.value;
    renderPoster();
  });
});

// ===== Background Loader =====
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

// ===== Drag Handling =====
let dragging = null;
let dragOffset = { x: 0, y: 0 };

const textObjects = {
  date: { x: 540, y: 640, text: () => dateInput.value, size: () => +sizeDate.value, color: "#fff" },
  hours: { x: 540, y: 1700, text: () => hoursInput.value, size: () => +sizeHours.value, color: () => colorHours.value }
};

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (const key in textObjects) {
    const obj = textObjects[key];
    ctx.font = `${obj.size()}px Montserrat`;
    const width = ctx.measureText(obj.text()).width;
    if (x > obj.x - width/2 && x < obj.x + width/2 && y > obj.y - obj.size() && y < obj.y) {
      dragging = key;
      dragOffset.x = x - obj.x;
      dragOffset.y = y - obj.y;
      break;
    }
  }
});

canvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  textObjects[dragging].x = e.clientX - rect.left - dragOffset.x;
  textObjects[dragging].y = e.clientY - rect.top - dragOffset.y;
  renderPoster();
});

canvas.addEventListener("mouseup", () => dragging = null);
canvas.addEventListener("mouseleave", () => dragging = null);

// ===== Render Poster =====
async function renderPoster() {
  const bg = await loadImage(bgSelect.value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // --- Hari & Tanggal ---
  const date = textObjects.date;
  ctx.font = `${date.size()}px Montserrat`;
  ctx.fillStyle = date.color;
  ctx.textAlign = "center";
  ctx.fillText(date.text(), date.x, date.y);

  // --- Jadwal Kedatangan & Keberangkatan ---
  const baseYArrival = 840;
  const baseYDeparture = 1220;
  const rowGap = 90;

  const drawFlightRow = async (row, index, type) => {
    const yBase = type === "arrival" ? baseYArrival : baseYDeparture;
    const airline = row.querySelector(".airline").value.trim();
    const flight = row.querySelector(".flight").value.trim();
    const route = row.querySelector(".route").value.trim();
    const time = row.querySelector(".time").value.trim();
    const y = yBase + index * rowGap;

    // Logo jika ada
    let logoPath = null;
    for (const key in airlineLogos) {
      if (airline.toLowerCase().includes(key)) logoPath = airlineLogos[key];
    }

    if (logoPath) {
      const logo = await loadImage(logoPath);
      const logoW = 160, logoH = 60;
      ctx.drawImage(logo, 180 - logoW/2, y - logoH/2, logoW, logoH);
    } else {
      ctx.font = `${sizeRow.value}px Montserrat`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(airline, 100, y);
    }

    ctx.font = `${sizeRow.value}px Montserrat`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(flight, 440, y);
    ctx.fillText(route, 720, y);
    ctx.fillText(time, 940, y);
  };

  for (let i = 0; i < arrivalRows.length; i++) await drawFlightRow(arrivalRows[i], i, "arrival");
  for (let i = 0; i < departureRows.length; i++) await drawFlightRow(departureRows[i], i, "departure");

  // --- Operating Hours ---
  const hours = textObjects.hours;
  ctx.font = `${hours.size()}px Montserrat`;
  ctx.fillStyle = typeof hours.color === "function" ? hours.color() : hours.color;
  ctx.textAlign = "center";
  ctx.fillText(hours.text(), hours.x, hours.y);
}

// ===== Render awal =====
renderBtn.onclick = renderPoster;
bgSelect.onchange = renderPoster;

// ===== Download PNG =====
savePngBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "flight-schedule.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
};

// ===== Download PDF =====
savePdfBtn.onclick = async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [1080, 1920]
  });
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, 1080, 1920);
  pdf.save("flight-schedule.pdf");
};

// ===== Shortcut: G (Guides) / R (Reset) =====
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r") {
    textObjects.date.x = 540; textObjects.date.y = 640;
    textObjects.hours.x = 540; textObjects.hours.y = 1700;
    renderPoster();
  }
});
