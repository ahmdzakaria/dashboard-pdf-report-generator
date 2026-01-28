# PDF Report Generator (Dashboard & PDF Report)



Aplikasi dashboard untuk mengisi parameter laporan dan menghasilkan **PDF**. Terdapat form input (page size, judul, deskripsi, nominal), tombol generate dengan validasi + loading state, serta tabel history generate.

---

## ✨ Fitur Utama
### 1) Dashboard Layout
- Header (logo + judul)
- Card form input
- Card tabel history
- Responsive (min 320px – max 1920px)

### 2) Komponen Input
- Dropdown **Ukuran Halaman**: A4 / A5 / Letter (default A4)
- Input **Judul Laporan** (max 100, min 5)
- Textarea **Deskripsi / Isi Laporan** (min 10)
- Input **Nominal (Rp)** dengan format Rupiah (`Rp 1.000.000`)  
  > Value submit tetap dalam bentuk number (tanpa titik/prefix)

### 3) Generate PDF
- Validasi sebelum submit (error state & highlight field)
- Loading state (disable button + spinner)
- Feedback success/error (toast/alert)
- PDF hasil generate dapat di-*download* / dibuka (tergantung implementasi)

### 4) History Generate
- Muncul setelah generate PDF berhasil
- Urut terbaru (descending)
- Empty state “Belum ada data”
- (Bonus) Persist di LocalStorage jika diaktifkan

---

## 🧰 Tech Stack
- **Nuxt (Vue)** — Nuxt 4
- **Tailwind CSS**
- PDF generation: `pdf-lib` *(jika digunakan di server/api)*

---

## ✅ Requirement
- Node.js **>= 18**
- npm (boleh pnpm/yarn jika ingin)

---

## 🚀 Cara Menjalankan (Local)

### 1) Install dependency
```bash
npm install
