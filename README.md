# Task Manager Sederhana (JavaScript)

Aplikasi pengelola tugas berbasis web dengan HTML, CSS, dan JavaScript murni (tanpa framework dan tanpa dependensi). Dibuat untuk Tugas I 11S3133 Pengembangan Aplikasi Berbasis Web, dengan AI generatif sebagai asisten pemrograman.

## Fitur
- Tambah, ubah, dan hapus tugas
- Tandai tugas selesai
- Prioritas (rendah, sedang, tinggi) dan tenggat, dengan penanda "Terlambat"
- Filter status (semua, belum selesai, selesai) dan pencarian judul
- Hapus semua tugas yang selesai
- Data tersimpan di `localStorage`, jadi tidak hilang saat halaman dimuat ulang

## Struktur
```
task-manager/
├── index.html   # struktur halaman
├── style.css    # tampilan (mendukung mode gelap dan layar kecil)
├── app.js       # logika aplikasi
└── README.md
```

## Cara menjalankan
Tidak perlu instalasi atau konfigurasi.

1. Clone repo: `git clone <url-repo-anda>`
2. Buka `index.html` di browser, atau jalankan server lokal:
   - `npx serve .` (butuh Node.js), atau
   - ekstensi Live Server di VS Code.

## Catatan pengembangan
- Teks pengguna dirender dengan `textContent` (bukan `innerHTML`) untuk mencegah XSS.
- Judul tugas divalidasi: tidak boleh kosong dan tidak boleh kembar.
