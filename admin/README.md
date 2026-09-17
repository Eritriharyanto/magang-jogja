# Admin — Dashboard Pengelolaan

Dashboard untuk mengelola seluruh isi website magangjogja.com dan chatbot-nya,
tanpa perlu menyentuh kode atau membuka Django Admin.

App ini **terpisah** dari `frontend/` dengan sengaja: supaya kode dashboard
(yang butuh login dan berisi tools manajemen) tidak ikut ter-bundle ke halaman
publik yang dibuka calon peserta magang.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · React Router 7

---

## Daftar Isi

- [Cara menjalankan](#cara-menjalankan)
- [Struktur folder](#struktur-folder)
- [Peta menu & halaman](#peta-menu--halaman)
- [Alur autentikasi](#alur-autentikasi)
- [Alur CRUD](#alur-crud)
- [Panduan tiap menu](#panduan-tiap-menu)
- [Komponen & hook yang dipakai bersama](#komponen--hook-yang-dipakai-bersama)
- [Konfigurasi](#konfigurasi)
- [Troubleshooting](#troubleshooting)

---

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5174`.

⚠️ **Backend harus jalan duluan** di `http://127.0.0.1:8000`. Kalau tidak, akan
muncul `Failed to fetch` di semua halaman.

**Login** memakai akun superuser Django yang sama dengan `/admin/` di backend.
Belum punya? Buat dengan `python manage.py createsuperuser` di folder `backend/`.

| Perintah          | Fungsi                          |
| ----------------- | ------------------------------- |
| `npm run dev`     | Dev server di port 5174         |
| `npm run build`   | Build production ke `dist/`     |
| `npm run preview` | Preview hasil build (port 4174) |
| `npm run lint`    | Cek ESLint                      |

---

## Struktur folder

```
admin/
├── index.html
├── vite.config.js                 alias "@" → ./src
├── package.json                   script dev memakai port 5174
│
└── src/
    ├── main.jsx                   ← entry: Router > Toast > Auth > App
    ├── App.jsx                    ← definisi semua route
    ├── index.css                  ← Tailwind + token warna brand
    │
    ├── api/
    │   ├── client.js                  fetch + token + error handling
    │   ├── authApi.js                 login, logout
    │   ├── divisiApi.js               CRUD divisi
    │   ├── homepageApi.js             hero, kontak, syarat, fasilitas
    │   └── chatbotApi.js              intent, knowledge, riwayat chat
    │
    ├── components/
    │   ├── Layout.jsx                 sidebar + area konten
    │   ├── ProtectedRoute.jsx         tendang ke /login kalau belum login
    │   ├── PageHeader.jsx             judul + deskripsi + tombol aksi
    │   ├── Button.jsx                 varian: primary, secondary, danger
    │   ├── Field.jsx                  Input, Textarea, label, pesan error
    │   ├── Toggle.jsx                 switch aktif/nonaktif
    │   ├── ConfirmDialog.jsx          dialog konfirmasi hapus
    │   ├── SearchInput.jsx            kotak pencarian
    │   ├── Pagination.jsx             navigasi halaman
    │   ├── SimpleListEditor.jsx       editor daftar (Syarat & Fasilitas)
    │   └── StateViews.jsx             LoadingState, ErrorState, EmptyState
    │
    ├── context/
    │   ├── AuthContext.jsx            status login, login(), logout()
    │   └── ToastContext.jsx           notifikasi pojok layar
    │
    ├── hooks/
    │   ├── useApi.js                  loading/error/data + refetch + setData
    │   └── usePaginatedSearch.js      filter pencarian + potong 20 per halaman
    │
    ├── lib/
    │   └── whatsapp.js                buildWaLink() — nomor → link wa.me
    │
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx              ringkasan + aktivitas + aksi cepat
        ├── divisi/
        │   ├── DivisiList.jsx
        │   └── DivisiForm.jsx         dipakai untuk tambah & edit
        ├── homepage/
        │   ├── HeroEditor.jsx
        │   ├── KontakEditor.jsx
        │   ├── SyaratPage.jsx         pakai SimpleListEditor (+ foto)
        │   └── FasilitasPage.jsx      pakai SimpleListEditor
        └── chatbot/
            ├── IntentList.jsx         + search + pagination
            ├── IntentForm.jsx
            ├── KnowledgeList.jsx      + search + pagination
            ├── KnowledgeForm.jsx
            ├── ChatHistoryList.jsx    + search + WA + hapus massal
            └── ChatHistoryDetail.jsx  transkrip lengkap
```

---

## Peta menu & halaman

| Route                              | Halaman            | Fungsi                                    |
| ---------------------------------- | ------------------ | ----------------------------------------- |
| `/login`                           | Login              | Satu-satunya halaman tanpa proteksi       |
| `/`                                | Dashboard          | Ringkasan angka, chat terbaru, aksi cepat |
| `/divisi`                          | Daftar Divisi      | Tabel posisi magang                       |
| `/divisi/baru`                     | Form Divisi        | Tambah posisi                             |
| `/divisi/:slug`                    | Form Divisi        | Edit posisi                               |
| `/homepage/hero`                   | Hero               | Judul & deskripsi paling atas homepage    |
| `/homepage/kontak`                 | Kontak             | Nomor telepon & alamat                    |
| `/homepage/syarat`                 | Syarat & Ketentuan | Daftar poin syarat (bisa + foto)          |
| `/homepage/fasilitas`              | Fasilitas          | Daftar poin fasilitas                     |
| `/chatbot/intents`                 | Daftar Intent      | Jawaban baku chatbot                      |
| `/chatbot/intents/baru` · `/:id`   | Form Intent        | Tambah / edit intent                      |
| `/chatbot/knowledge`               | Knowledge Base     | Bahan jawaban AI                          |
| `/chatbot/knowledge/baru` · `/:id` | Form Knowledge     | Tambah / edit entry                       |
| `/chatbot/riwayat`                 | Riwayat Chat       | Daftar pengunjung + follow-up WA          |
| `/chatbot/riwayat/:visitorId`      | Transkrip          | Percakapan lengkap satu orang             |

Semua route selain `/login` dibungkus `<ProtectedRoute>` + `<Layout>`.

---

## Alur autentikasi

Memakai **Token Authentication** DRF. Tidak ada session/cookie — token disimpan
di `localStorage` dan ditempel manual ke tiap request.

```
┌─ Saat app dibuka ──────────────────────────────────────────┐
│ AuthContext cek localStorage "magangjogja_admin_token"     │
│   ada    → isAuthenticated = true                          │
│   kosong → ProtectedRoute redirect ke /login               │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ Login ────────────────────────────────────────────────────┐
│ POST /api/auth/token/                                      │
│   body: username & password (form-urlencoded)              │
│   sukses → { token } → simpan ke localStorage              │
│   gagal  → "Username atau password salah."                 │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ Tiap request berikutnya (api/client.js) ──────────────────┐
│ headers: Authorization: Token <token>                      │
│                                                            │
│ Kalau response 401 (token dicabut / user dihapus):         │
│   → token otomatis dihapus dari localStorage               │
│   → render berikutnya kena ProtectedRoute → /login         │
└────────────────────────────────────────────────────────────┘
```

Tombol **Keluar** di bawah sidebar cukup menghapus token lokal — tidak ada
request ke server, karena token DRF memang tidak punya konsep "sesi berakhir".

---

## Alur CRUD

Pola yang sama dipakai hampir di semua halaman daftar:

```
Halaman dibuka
   │
   ├─ useApi(() => getXList(), [])
   │     loading → <LoadingState />
   │     error   → <ErrorState onRetry={refetch} />
   │     kosong  → <EmptyState />
   │     ada     → render tabel / kartu
   │
   ├─ Toggle Aktif  → optimistic update:
   │     UI langsung berubah  →  PATCH ke server
   │     gagal? → UI dikembalikan ke nilai semula + toast error
   │
   ├─ Edit   → navigate ke form, isi awal dari API
   │
   └─ Hapus  → ConfirmDialog → DELETE → refetch + toast
```

**Optimistic update** dipakai khusus untuk toggle aktif/nonaktif supaya terasa
instan. Untuk operasi lain (simpan, hapus) dipakai pola biasa: tunggu server,
baru perbarui tampilan — karena konsekuensinya lebih besar kalau ternyata gagal.

### Upload file

Dua endpoint menerima file: icon divisi dan foto syarat.
`api/client.js` mendeteksi otomatis — kalau `body` berupa `FormData`, header
`Content-Type` **tidak** di-set manual (browser perlu mengisi boundary-nya
sendiri). Kalau tidak ada file baru, body dikirim sebagai JSON biasa.

---

## Panduan tiap menu

### Dashboard

Enam kartu statistik (divisi, syarat, fasilitas, intent, knowledge, pengunjung
chat), masing-masing menunjukkan total dan berapa yang aktif. Di bawahnya: 5
percakapan chat terbaru dan tombol aksi cepat ke form yang paling sering
dipakai.

### Divisi

Tabel posisi magang. Form-nya mencakup label, sub-label, icon (upload),
deskripsi, daftar jobdesk (bisa tambah/hapus baris), link Google Form, urutan
tampil, dan status aktif.

> Form ini tidak punya isian `slug` — backend membuatnya otomatis dari nama
> divisi saat pertama kali disimpan. Slug itulah yang jadi URL publik
> `/posisi/<slug>`, dan tidak ikut berubah kalau nama divisi diedit belakangan
> (supaya link yang sudah tersebar tidak mati). Kalau slug benar-benar perlu
> diubah, lakukan lewat Django Admin di `/admin/`.

### Hero & Kontak

Form sederhana, sekali simpan langsung berlaku. **Kontak dipakai di dua tempat**:
footer website _dan_ tombol "Chat Admin via WhatsApp" di chatbot — ubah sekali,
keduanya ikut berubah.

### Syarat & Ketentuan

Daftar poin dengan editor inline (klik Edit, ubah di tempat). Tiap poin bisa
dilampiri **foto opsional** yang akan tampil di atas teksnya di website.

### Fasilitas

Sama seperti Syarat, tapi tanpa foto.

### Intent Chatbot

Jawaban baku yang dicocokkan ke pertanyaan pengunjung. Ada kolom pencarian
(nama, kategori, jawaban) dan pagination 20 baris per halaman.

> Kunci akurasi ada di field **contoh pertanyaan**: makin banyak dan makin
> variatif kalimatnya, makin akurat pencocokannya. Satu intent idealnya punya
> puluhan variasi kalimat, bukan 1–2. Field `keywords` sifatnya opsional.

### Knowledge Base

Bahan mentah untuk jawaban AI (Ollama) ketika pertanyaan tidak cocok dengan
intent mana pun. Isinya bebas teks (`judul` + `konten`). Ada pencarian dan
pagination 20 baris.

### Riwayat Chat

Daftar pengunjung yang pernah chat. Fitur:

- **Pencarian** berdasarkan nama atau nomor telepon
- **Tombol WA** per baris → buka `wa.me` untuk follow-up langsung
- **Checkbox + select all** → hapus beberapa sekaligus
- **Hapus Semua** → bersihkan seluruh riwayat
- **Lihat Transkrip** → percakapan lengkap, lengkap dengan label sumber tiap
  jawaban bot (Intent Statis / Ollama / Ditolak)

> Menghapus visitor ikut menghapus seluruh pesannya (cascade) dan tidak bisa
> dibatalkan.

---

## Komponen & hook yang dipakai bersama

| Nama                 | Fungsi                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `SimpleListEditor`   | Seluruh logika halaman Syarat & Fasilitas. Prop `enablePhoto` menyalakan fitur foto (hanya dipakai Syarat)    |
| `StateViews`         | `LoadingState`, `ErrorState` (dengan tombol coba lagi), `EmptyState`                                          |
| `ConfirmDialog`      | Dialog konfirmasi sebelum aksi destruktif                                                                     |
| `Toggle`             | Switch aktif/nonaktif                                                                                         |
| `SearchInput`        | Kotak pencarian dengan ikon                                                                                   |
| `Pagination`         | Navigasi halaman, meringkas nomor dengan "…" kalau banyak                                                     |
| `useApi`             | State `loading`/`error`/`data` + `refetch()` + `setData()` untuk optimistic update                            |
| `usePaginatedSearch` | Filter pencarian sisi klien + potong 20 item per halaman; otomatis balik ke halaman 1 saat kata kunci berubah |
| `buildWaLink`        | Normalisasi nomor (`0895…` → `62895…`) jadi link `wa.me`, memakai aturan yang sama dengan backend             |

Pencarian dan pagination dilakukan **di sisi klien** karena jumlah data masih
wajar (puluhan sampai ratusan baris) — seluruh data diambil sekali, lalu
difilter di browser. Kalau nanti datanya membengkak sampai ribuan baris, ini
perlu dipindah ke backend.

---

## Konfigurasi

Kalau backend jalan di alamat selain `http://127.0.0.1:8000`, buat file `.env`
di folder ini:

```
VITE_API_BASE_URL=https://api.magangjogja.com
```

> Setelah mengubah `.env`, **restart `npm run dev`** — Vite hanya membaca
> environment variable saat start.

Alamat dashboard juga harus terdaftar di `CORS_ALLOWED_ORIGINS`
(`backend/core/settings.py`). Port `5174` dan `4174` sudah terdaftar secara
default.

---

## Troubleshooting

| Gejala                                   | Solusi                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Failed to fetch` di semua halaman       | Backend belum jalan → `python manage.py runserver` di folder `backend/`                              |
| Login gagal terus                        | Cek akun ada: `python manage.py createsuperuser` atau `changepassword <username>`                    |
| Balik ke halaman login terus-menerus     | Token sudah tidak valid (user/token dihapus di backend). Login ulang                                 |
| Error 500 di satu halaman saja           | Migration backend belum dijalankan → `python manage.py migrate`                                      |
| Upload gambar gagal                      | Cek Pillow terinstal (`pip install -r requirements.txt`) dan folder `backend/media/` bisa ditulis    |
| Perubahan tidak muncul di website publik | Refresh halaman publik; kalau item baru tidak muncul, cek toggle **Aktif**-nya menyala               |
| CORS error di console                    | Tambahkan alamat dashboard ke `CORS_ALLOWED_ORIGINS` di `backend/core/settings.py`                   |
| Lupa password                            | Tidak ada fitur "lupa password". Reset lewat `python manage.py changepassword <username>` di backend |
