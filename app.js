"use strict";

const STORAGE_KEY = "task-manager:v1";

// ---------- State ----------
let tasks = muatTugas();
let filterAktif = "semua";
let kataKunci = "";
let idSedangDiedit = null;

// ---------- Elemen DOM ----------
const form = document.getElementById("form-tugas");
const inputJudul = document.getElementById("input-judul");
const inputPrioritas = document.getElementById("input-prioritas");
const inputTenggat = document.getElementById("input-tenggat");
const btnSimpan = document.getElementById("btn-simpan");
const btnBatal = document.getElementById("btn-batal");
const pesanError = document.getElementById("pesan-error");
const daftar = document.getElementById("daftar-tugas");
const pesanKosong = document.getElementById("kosong");
const ringkasan = document.getElementById("ringkasan");
const inputCari = document.getElementById("input-cari");

// ---------- Penyimpanan ----------
function muatTugas() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function simpanTugas() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    tampilkanError("Data tidak bisa disimpan di browser ini.");
  }
}

// ---------- Operasi tugas ----------
function buatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function tambahTugas(judul, prioritas, tenggat) {
  tasks.unshift({ id: buatId(), judul, prioritas, tenggat, selesai: false });
}

function ubahTugas(id, judul, prioritas, tenggat) {
  const t = tasks.find((x) => x.id === id);
  if (t) Object.assign(t, { judul, prioritas, tenggat });
}

function hapusTugas(id) {
  tasks = tasks.filter((x) => x.id !== id);
  if (idSedangDiedit === id) keluarModeEdit();
}

function toggleSelesai(id) {
  const t = tasks.find((x) => x.id === id);
  if (t) t.selesai = !t.selesai;
}

// ---------- Validasi ----------
function tampilkanError(teks) {
  pesanError.textContent = teks;
  pesanError.hidden = !teks;
}

function validasi(judul) {
  if (!judul) return "Judul tugas tidak boleh kosong.";
  const kembar = tasks.some(
    (t) => t.id !== idSedangDiedit && t.judul.toLowerCase() === judul.toLowerCase()
  );
  if (kembar) return "Tugas dengan judul yang sama sudah ada.";
  return "";
}

// ---------- Render ----------
function tugasTerfilter() {
  return tasks.filter((t) => {
    const cocokStatus =
      filterAktif === "semua" ||
      (filterAktif === "aktif" && !t.selesai) ||
      (filterAktif === "selesai" && t.selesai);
    const cocokCari = t.judul.toLowerCase().includes(kataKunci);
    return cocokStatus && cocokCari;
  });
}

function formatTanggal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function terlambat(t) {
  if (!t.tenggat || t.selesai) return false;
  const hariIni = new Date().toISOString().slice(0, 10);
  return t.tenggat < hariIni;
}

function buatTombol(teks, aksi, kelas = "btn") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = kelas;
  b.textContent = teks;
  b.addEventListener("click", aksi);
  return b;
}

function buatItem(t) {
  const li = document.createElement("li");
  li.className = "tugas" + (t.selesai ? " selesai" : "");
  li.dataset.prioritas = t.prioritas;

  const cek = document.createElement("input");
  cek.type = "checkbox";
  cek.checked = t.selesai;
  cek.setAttribute("aria-label", `Tandai selesai: ${t.judul}`);
  cek.addEventListener("change", () => { toggleSelesai(t.id); perbarui(); });

  const isi = document.createElement("div");
  const judul = document.createElement("p");
  judul.className = "tugas__judul";
  judul.textContent = t.judul; // textContent mencegah XSS

  const meta = document.createElement("p");
  meta.className = "tugas__meta";
  meta.append(`Prioritas ${t.prioritas}`);
  if (t.tenggat) {
    meta.append(` · Tenggat ${formatTanggal(t.tenggat)}`);
    if (terlambat(t)) {
      const telat = document.createElement("span");
      telat.className = "telat";
      telat.textContent = " · Terlambat";
      meta.append(telat);
    }
  }
  isi.append(judul, meta);

  const aksi = document.createElement("div");
  aksi.className = "tugas__aksi";
  aksi.append(
    buatTombol("Ubah", () => masukModeEdit(t.id)),
    buatTombol("Hapus", () => { hapusTugas(t.id); perbarui(); }, "btn btn--bahaya")
  );

  li.append(cek, isi, aksi);
  return li;
}

function render() {
  const hasil = tugasTerfilter();
  daftar.replaceChildren(...hasil.map(buatItem));

  pesanKosong.hidden = hasil.length > 0;
  if (!hasil.length) {
    pesanKosong.textContent = tasks.length
      ? "Tidak ada tugas yang cocok dengan filter atau pencarian."
      : "Belum ada tugas. Tambahkan tugas pertama di atas.";
  }

  const selesai = tasks.filter((t) => t.selesai).length;
  ringkasan.textContent = tasks.length
    ? `${selesai} dari ${tasks.length} tugas selesai`
    : "Belum ada tugas";
}

function perbarui() {
  simpanTugas();
  render();
}

// ---------- Mode edit ----------
function masukModeEdit(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  idSedangDiedit = id;
  inputJudul.value = t.judul;
  inputPrioritas.value = t.prioritas;
  inputTenggat.value = t.tenggat || "";
  btnSimpan.textContent = "Simpan perubahan";
  btnBatal.hidden = false;
  tampilkanError("");
  inputJudul.focus();
}

function keluarModeEdit() {
  idSedangDiedit = null;
  form.reset();
  btnSimpan.textContent = "Tambah tugas";
  btnBatal.hidden = true;
  tampilkanError("");
}

// ---------- Event ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = inputJudul.value.trim();
  const error = validasi(judul);
  if (error) return tampilkanError(error);

  if (idSedangDiedit) {
    ubahTugas(idSedangDiedit, judul, inputPrioritas.value, inputTenggat.value);
  } else {
    tambahTugas(judul, inputPrioritas.value, inputTenggat.value);
  }
  keluarModeEdit();
  perbarui();
});

btnBatal.addEventListener("click", keluarModeEdit);

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    filterAktif = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) =>
      c.classList.toggle("is-aktif", c === chip)
    );
    render();
  });
});

inputCari.addEventListener("input", () => {
  kataKunci = inputCari.value.trim().toLowerCase();
  render();
});

document.getElementById("btn-hapus-selesai").addEventListener("click", () => {
  if (!tasks.some((t) => t.selesai)) return;
  if (confirm("Hapus semua tugas yang sudah selesai?")) {
    tasks = tasks.filter((t) => !t.selesai);
    perbarui();
  }
});

render();
