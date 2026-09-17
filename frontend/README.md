# Frontend — Website Publik

Halaman yang dilihat calon peserta magang: hero, syarat & ketentuan, daftar
posisi magang, fasilitas, dan widget chatbot di pojok kanan bawah.

Semua isinya **diambil dari backend saat runtime** — tidak ada teks konten yang
di-hardcode. Admin mengubah data lewat dashboard, website langsung ikut berubah
begitu di-refresh, tanpa perlu build atau deploy ulang.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · React Router 7

---

## Daftar Isi

- [Cara menjalankan](#cara-menjalankan)
- [Struktur folder](#struktur-folder)
- [Struktur halaman](#struktur-halaman)
- [Alur pengambilan data](#alur-pengambilan-data)
- [Alur chatbot](#alur-chatbot)
- [Konfigurasi](#konfigurasi)
- [Catatan teknis](#catatan-teknis)

---

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

⚠️ **Backend harus jalan duluan** di `http://127.0.0.1:8000`, kalau tidak semua
section akan menampilkan pesan error. Lihat [`../backend/README.md`](../backend/README.md).

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server + hot reload |
| `npm run build` | Build production ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Cek ESLint |

---

## Struktur folder

```
frontend/
├── index.html
├── vite.config.js              alias "@" → ./src
├── .env.example                contoh setting URL backend
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── robots.txt
│
└── src/
    ├── main.jsx                ← entry: router + ChatbotWidget global
    ├── App.jsx                 ← halaman utama (susunan section)
    ├── index.css               ← Tailwind + token warna & font brand
    │
    ├── api/
    │   ├── client.js               wrapper fetch + base URL
    │   ├── divisiApi.js            getDivisiList, getDivisiDetail
    │   ├── homepageApi.js          getHero, getKontak, getSyarat, getFasilitas
    │   └── chatbotApi.js           registerVisitor, sendChatMessage
    │
    ├── components/
    │   ├── Header.jsx              navbar
    │   ├── Hero.jsx                section paling atas
    │   ├── Syarat.jsx              section syarat (+ foto)
    │   ├── Posisi.jsx              grid kartu posisi magang
    │   ├── Fasilitas.jsx           section fasilitas
    │   ├── Footer.jsx              kontak & alamat
    │   ├── ChatbotWidget.jsx       bubble chat (muncul di semua halaman)
    │   ├── Bar.jsx / Stripes.jsx   elemen dekoratif garis warna
    │   ├── Reveal.jsx              animasi muncul saat di-scroll
    │   ├── Skeleton.jsx            placeholder saat loading
    │   └── ScrollToHash.jsx        auto-scroll ke #section dari URL
    │
    ├── pages/
    │   └── PosisiDetail.jsx        halaman /posisi/<slug>
    │
    ├── hooks/
    │   ├── useApi.js               kelola state loading/error/data
    │   └── useInView.js            deteksi elemen masuk viewport
    │
    ├── data/
    │   ├── content.js              menu navigasi (statis, bukan dari DB)
    │   └── iconFallback.js         icon cadangan kalau divisi belum punya icon
    │
    └── assets/
        ├── hero.png, logo.png, free-badge.png, ...
        └── posisi/                 18 icon SVG posisi magang
```

---

## Struktur halaman

Routing didefinisikan di `src/main.jsx`:

| Route | Komponen | Isi |
|---|---|---|
| `/` | `App.jsx` | Halaman utama, semua section |
| `/posisi/:slug` | `pages/PosisiDetail.jsx` | Detail satu posisi magang |

`ChatbotWidget` dipasang **di luar** `<Routes>`, jadi bubble chat ikut muncul di
kedua halaman dan state-nya tidak ter-reset saat pindah halaman.

Susunan section di halaman utama (`App.jsx`, urut dari atas):

```
Header
Hero                    ← GET /api/homepage/hero/
Bar (garis dekoratif)
Syarat                  ← GET /api/homepage/syarat/
Stripes
Posisi                  ← GET /api/divisi/
Stripes
Fasilitas               ← GET /api/homepage/fasilitas/
Footer                  ← GET /api/homepage/kontak/
Badge "FREE" (floating)
```

---

## Alur pengambilan data

Tiap section memanggil API-nya sendiri lewat hook `useApi`, jadi satu section
yang gagal tidak membuat seluruh halaman blank.

```
Komponen (mis. Syarat.jsx)
   │
   ├─ useApi(() => getSyarat(), [])
   │       │
   │       ├─ loading → tampilkan <Skeleton />
   │       ├─ error   → tampilkan pesan error di section itu saja
   │       └─ data    → render isi
   │
   ▼
api/homepageApi.js → apiFetch("/api/homepage/syarat/")
   │
   ▼
api/client.js
   ├─ tempel VITE_API_BASE_URL di depan path
   ├─ set Content-Type: application/json
   ├─ response tidak OK → lempar Error berisi pesan dari backend
   └─ status 204 → return null
   │
   ▼
Backend Django (port 8000)
```

Karena backend hanya mengirim data `aktif = true` untuk pengunjung publik,
frontend tidak perlu memfilter apa pun — apa yang diterima, itu yang ditampilkan.

### Alur halaman detail posisi

```
Klik kartu di Posisi.jsx
   → <Link to={`/posisi/${slug}`}>
   → PosisiDetail.jsx baca slug via useParams()
   → GET /api/divisi/<slug>/
   → render deskripsi + daftar jobdesk + tombol "Daftar Sekarang"
     (tombol mengarah ke gform_link dari database)
```

---

## Alur chatbot

`ChatbotWidget.jsx` punya dua mode: **form identitas** dan **ruang chat**.

```
┌─ Pertama kali dibuka ──────────────────────────────────┐
│                                                        │
│  1. Cek localStorage "magangjogja_chat_visitor"        │
│       ada    → langsung masuk ruang chat               │
│       kosong → tampilkan form nama + no. telepon       │
│                                                        │
│  2. Submit form → POST /api/chatbot/visitor/           │
│       backend cek no_telepon:                          │
│         sudah pernah ada → kembalikan visitor lama     │
│                            (riwayat chat nyambung)     │
│         belum ada        → buat visitor baru           │
│       → simpan { id, nama, no_telepon } ke localStorage│
└────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ Ruang chat ───────────────────────────────────────────┐
│                                                        │
│  3. Ketik pesan → POST /api/chatbot/chat/              │
│       body: { visitor_id, pesan }                      │
│                                                        │
│  4. Balasan: { pesan, sumber, aksi }                   │
│       - pesan  → dirender jadi bubble bot              │
│       - sumber → "static" / "ollama" / "guard"         │
│       - aksi   → kalau ada, dirender jadi tombol       │
│                  (Chat Admin via WA / Buka Google Maps)│
│                                                        │
│  5. Kalau backend balas 401 (visitor sudah dihapus     │
│     admin), localStorage dibersihkan dan user diminta  │
│     isi identitas lagi.                                │
└────────────────────────────────────────────────────────┘
```

Komponen `FormattedMessage` mengubah teks balasan bot menjadi HTML sederhana
(daftar bernomor, baris baru, penebalan), supaya jawaban panjang tetap enak
dibaca di bubble chat.

---

## Konfigurasi

Buat file `.env` di folder ini (contoh ada di `.env.example`):

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Kalau tidak diisi, otomatis pakai `http://127.0.0.1:8000`. Ganti ke domain
production saat deploy, mis. `https://api.magangjogja.com`.

> Setiap kali `.env` diubah, **restart `npm run dev`** — Vite hanya membaca
> environment variable saat start.

Alias import: `@/` menunjuk ke `src/`, jadi
`import Hero from "@/components/Hero"` bekerja dari file mana pun.

---

## Catatan teknis

- **Tailwind CSS 4** dipakai lewat plugin Vite (`@tailwindcss/vite`), bukan
  file `tailwind.config.js`. Token warna brand (`mj-green`, `mj-yellow`,
  `mj-red`, `mj-blue`, `mj-purple`, `mj-ink`) didefinisikan langsung di
  `src/index.css`.
- **Menu navigasi statis.** `src/data/content.js` isinya cuma tautan ke section
  di halaman yang sama (`#syarat`, `#posisi`, ...), bukan konten yang perlu
  diedit admin — jadi sengaja tidak disimpan di database.
- **Icon fallback.** Kalau sebuah divisi belum punya icon yang di-upload,
  `data/iconFallback.js` memasangkan icon SVG lokal berdasarkan slug-nya.
- **`useApi` aman dari race condition.** Ada flag `cancelled` di cleanup effect
  supaya tidak terjadi update state setelah komponen di-unmount (misalnya user
  cepat pindah halaman sebelum request selesai).
- **Animasi scroll.** `Reveal.jsx` + `useInView.js` memakai `IntersectionObserver`
  untuk memunculkan elemen saat masuk layar.
- **Deploy:** hasil `npm run build` ada di `dist/`, berupa file statis — bisa
  ditaruh di Netlify, Vercel, atau Nginx. Pastikan server mengarahkan semua
  route ke `index.html` (SPA fallback), supaya `/posisi/<slug>` tidak 404 saat
  di-refresh.