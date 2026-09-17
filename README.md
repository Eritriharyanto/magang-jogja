# magangjogja.com — Monorepo

Website pendaftaran magang **magangjogja.com** (Seven Inc, Yogyakarta), lengkap
dengan chatbot AI dan dashboard admin untuk mengelola seluruh isinya tanpa
menyentuh kode.

Satu repository ini berisi **3 project terpisah** yang saling terhubung:

| Folder | Isi | Teknologi | Port dev |
|---|---|---|---|
| [`backend/`](./backend) | API + database + chatbot | Django 6.1 + DRF + SQLite | `8000` |
| [`frontend/`](./frontend) | Website publik (dilihat calon peserta) | React 19 + Vite + Tailwind 4 | `5173` |
| [`admin/`](./admin) | Dashboard admin (kelola konten) | React 19 + Vite + Tailwind 4 | `5174` |

Masing-masing punya README sendiri dengan detail lebih dalam:
- [`backend/README.md`](./backend/README.md) — model data, endpoint API, cara kerja chatbot, Ollama
- [`frontend/README.md`](./frontend/README.md) — struktur komponen, alur render website publik
- [`admin/README.md`](./admin/README.md) — cara pakai dashboard, alur autentikasi

---

## Daftar Isi

- [Arsitektur singkat](#arsitektur-singkat)
- [Struktur folder](#struktur-folder)
- [Setup awal](#setup-awal-sekali-saja)
- [Menjalankan project](#menjalankan-project)
- [Alur data utama](#alur-data-utama)
- [Alur kerja sehari-hari](#alur-kerja-sehari-hari-admin)
- [Troubleshooting](#troubleshooting)

---

## Arsitektur singkat

Ketiga project berkomunikasi lewat **HTTP JSON API**. Tidak ada kode yang
di-share antar project — mereka benar-benar terpisah dan bisa di-deploy
sendiri-sendiri.

```
┌─────────────────────┐         ┌─────────────────────┐
│  frontend/ (5173)   │         │   admin/ (5174)     │
│  Website publik     │         │   Dashboard admin   │
│  - Hero, Syarat     │         │   - Login (token)   │
│  - Posisi Magang    │         │   - CRUD semua data │
│  - Fasilitas        │         │                     │
│  - Widget chatbot   │         │                     │
└──────────┬──────────┘         └──────────┬──────────┘
           │                                │
           │  GET (publik, tanpa login)     │  GET + POST/PATCH/DELETE
           │                                │  (Authorization: Token ...)
           └────────────┬───────────────────┘
                        ▼
           ┌────────────────────────────┐
           │    backend/ (8000)         │
           │    Django REST Framework   │
           │  ┌──────────────────────┐  │
           │  │ divisi/              │  │  posisi magang + jobdesk
           │  │ homepage/            │  │  hero, kontak, syarat, fasilitas
           │  │ chatbot_app/         │  │  intent, knowledge, riwayat chat
           │  └──────────────────────┘  │
           │         db.sqlite3         │
           └────────────┬───────────────┘
                        │ HTTP (hanya saat chatbot butuh AI)
                        ▼
              ┌───────────────────┐
              │ Ollama (11434)    │  ← jalan lokal di komputer/server
              │ llama3.2:3b dll   │
              └───────────────────┘
```

**Kenapa admin dipisah dari frontend?** Supaya kode dashboard (yang butuh login
dan berisi tools manajemen) tidak ikut ter-bundle ke halaman publik yang dibuka
calon peserta magang. Bundle publik jadi lebih kecil, dan permukaan serangan
lebih sempit.

---

## Struktur folder

```
magangjogja/
├── README.md                  ← file ini
├── package.json               ← script buat jalanin 3 project sekaligus
│
├── backend/                   ← API Django (lihat backend/README.md)
│   ├── core/                      settings, urls utama
│   ├── divisi/                    app: posisi magang + jobdesk
│   ├── homepage/                  app: hero, kontak, syarat, fasilitas
│   ├── chatbot_app/               app: intent, knowledge base, riwayat chat
│   │   └── services/                  NLU, guard, Ollama client, actions
│   ├── chatbot_data/              arsip JSON data awal chatbot
│   ├── media/                     file upload (auto, tidak masuk git)
│   ├── db.sqlite3                 database (auto, tidak masuk git)
│   └── requirements.txt
│
├── frontend/                  ← website publik (lihat frontend/README.md)
│   ├── src/
│   │   ├── api/                   pemanggil endpoint backend
│   │   ├── components/            Hero, Syarat, Posisi, Fasilitas, ChatbotWidget
│   │   ├── pages/                 PosisiDetail
│   │   ├── hooks/                 useApi, useInView
│   │   └── assets/                gambar & icon posisi
│   └── .env.example
│
└── admin/                     ← dashboard admin (lihat admin/README.md)
    └── src/
        ├── api/                   pemanggil endpoint + token handling
        ├── components/            Layout, Button, Toggle, Pagination, dll
        ├── context/               AuthContext, ToastContext
        ├── hooks/                 useApi, usePaginatedSearch
        ├── lib/                   helper (buildWaLink)
        └── pages/                 Dashboard, divisi/, homepage/, chatbot/
```

---

## Setup awal (sekali saja)

**Prasyarat:** Python 3.11+, Node.js 18+, dan (opsional, untuk chatbot AI) Ollama.

### 1. Backend

```bash
cd backend

# Buat virtual environment
python -m venv venv

# Aktifkan
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux / macOS

# Install dependency Python
pip install -r requirements.txt

# Bikin database
python manage.py migrate

# Isi data awal (18 divisi, hero, kontak, syarat, fasilitas)
python manage.py seed_divisi
python manage.py seed_homepage

# Isi data chatbot dari file JSON arsip
python manage.py import_chatbot_data --intents chatbot_data/intents.json --knowledge chatbot_data/knowledge_base.json

# Buat akun admin (dipakai login ke dashboard)
python manage.py createsuperuser

cd ..
```

> ⚠️ **Penting kalau kamu clone dari Git:** `db.sqlite3` dan folder `media/`
> sengaja **tidak ikut** di-commit (ada di `.gitignore`). Jadi setelah clone,
> database kamu kosong sampai perintah `migrate` + `seed_*` + `import_chatbot_data`
> di atas dijalankan. Ini normal, bukan error.

### 2. Frontend & Admin

```bash
npm install --prefix frontend
npm install --prefix admin
npm install                     # untuk script gabungan di root
```

### 3. Ollama (opsional, untuk chatbot AI)

```bash
# Install dari https://ollama.com/download, lalu:
ollama pull llama3.2:3b
```

Tanpa Ollama, chatbot tetap jalan — cuma jawaban di luar intent statis akan
diganti pesan fallback yang mengarahkan ke nomor admin.

---

## Menjalankan project

### Sekaligus (3 project dalam 1 terminal)

```bash
npm run dev
```

Output berwarna & berlabel per project:

```
[BACKEND]   Starting development server at http://127.0.0.1:8000/
[FRONTEND]  Local: http://localhost:5173/
[ADMIN]     Local: http://localhost:5174/
```

`Ctrl+C` sekali akan mematikan ketiganya.

> **Catatan Windows:** script `dev:backend` di `package.json` root pakai path
> Linux (`venv/bin/python`). Kalau kamu di Windows, ubah jadi
> `venv\\Scripts\\python`, atau jalankan satu-satu seperti di bawah.

### Satu-satu

```bash
npm run dev:backend    # atau: cd backend && venv\Scripts\activate && python manage.py runserver
npm run dev:frontend   # atau: cd frontend && npm run dev
npm run dev:admin      # atau: cd admin && npm run dev
```

**Backend harus jalan duluan** — frontend dan admin cuma "kulit", semua datanya
diambil dari backend.

### Alamat setelah jalan

| Alamat | Keterangan |
|---|---|
| http://localhost:5173 | Website publik |
| http://localhost:5174 | Dashboard admin |
| http://127.0.0.1:8000/api/ | API (dipakai kedua frontend) |
| http://127.0.0.1:8000/admin/ | Django Admin (alternatif kelola data) |

---

## Alur data utama

### A. Pengunjung membuka website

```
Browser → frontend (React)
   │
   ├─ GET /api/homepage/hero/        → judul & deskripsi Hero
   ├─ GET /api/homepage/syarat/      → poin syarat (+ foto kalau ada)
   ├─ GET /api/divisi/               → kartu posisi magang
   ├─ GET /api/homepage/fasilitas/   → poin fasilitas
   └─ GET /api/homepage/kontak/      → nomor & alamat di footer
```

Semua endpoint di atas **publik** (tanpa login), dan backend otomatis hanya
mengirim data yang `aktif = true`. Jadi admin bisa menyembunyikan satu item dari
website tanpa menghapusnya.

Klik salah satu kartu posisi → `/posisi/<slug>` → `GET /api/divisi/<slug>/` →
tampil deskripsi, jobdesk, dan tombol daftar (link Google Form).

### B. Pengunjung memakai chatbot

```
1. Klik bubble chat
       ↓
2. Isi nama + no. telepon   →  POST /api/chatbot/visitor/
       ↓                          (visitor_id disimpan di localStorage,
       ↓                           no. telepon sama = riwayat nyambung)
3. Kirim pesan              →  POST /api/chatbot/chat/
       ↓
   ┌───────────────────────────────────────────────────┐
   │ Di dalam backend:                                 │
   │                                                   │
   │  a. Simpan pesan user ke riwayat                  │
   │                                                   │
   │  b. guard.py — di luar topik / gibberish?         │
   │       YA  → balas pesan pengarahan + tombol WA    │
   │             (hemat: Ollama tidak dipanggil)       │
   │       TIDAK ↓                                     │
   │                                                   │
   │  c. nlu.py — cocokkan ke contoh_pertanyaan        │
   │              (TF-IDF + cosine similarity)         │
   │       skor ≥ 0.40 → jawab dari Intent (statis)    │
   │       skor < 0.40  ↓                              │
   │                                                   │
   │  d. ollama_client.py — tanya AI, dengan seluruh   │
   │     Knowledge Base aktif sebagai system prompt    │
   │     + 10 pesan terakhir sebagai konteks           │
   │       Ollama mati → pesan fallback + tombol WA    │
   │                                                   │
   │  e. actions.py — tempel tombol WA / Maps kalau    │
   │     intent-nya soal kontak atau lokasi            │
   │                                                   │
   │  f. Simpan jawaban bot ke riwayat                 │
   └───────────────────────────────────────────────────┘
       ↓
4. Frontend render balasan + tombol aksinya
```

### C. Admin mengelola konten

```
1. Buka localhost:5174 → form login
       ↓
2. POST /api/auth/token/ (username + password)
       ↓  dapat token → disimpan di localStorage
       ↓
3. Semua request berikutnya otomatis bawa header:
   Authorization: Token <token>
       ↓
4. CRUD data → langsung berubah di database
       ↓
5. Pengunjung refresh website → konten baru langsung tampil
   (tidak perlu build ulang / deploy ulang frontend)
```

---

## Alur kerja sehari-hari (admin)

| Mau apa | Ke mana |
|---|---|
| Tambah/edit posisi magang & jobdesk-nya | Dashboard → **Divisi** |
| Ganti judul besar di homepage | Dashboard → **Hero** |
| Ganti nomor WA & alamat kantor | Dashboard → **Kontak** (ikut berubah di footer **dan** tombol WA chatbot) |
| Tambah syarat pendaftaran (bisa + foto) | Dashboard → **Syarat & Ketentuan** |
| Tambah fasilitas | Dashboard → **Fasilitas** |
| Ajari chatbot jawaban baku baru | Dashboard → **Intent** |
| Kasih chatbot bahan untuk jawaban AI | Dashboard → **Knowledge Base** |
| Lihat siapa saja yang chat + follow-up WA | Dashboard → **Riwayat Chat** |

Sembunyikan item tanpa menghapus: pakai **toggle Aktif** yang ada di tiap daftar.

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `Failed to fetch` / `ERR_CONNECTION_REFUSED` di console | Backend belum jalan. Jalankan `python manage.py runserver` di folder `backend/`. |
| Connection refused padahal backend jalan di port lain | Buat file `.env` di `frontend/` dan/atau `admin/`, isi `VITE_API_BASE_URL=http://127.0.0.1:<port>`. |
| Error 500 saat buka halaman tertentu | Biasanya migration belum dijalankan. Jalankan `python manage.py migrate`. |
| `ImportError: cannot import name ...` saat `runserver` | Ada file Python yang versinya tidak sinkron (mis. hasil campur antara clone Git dan salinan manual). Pastikan pakai **satu** sumber kode saja. |
| Halaman admin muncul, tapi semua data kosong | Database baru/kosong. Jalankan `seed_divisi`, `seed_homepage`, dan `import_chatbot_data`. |
| Chatbot selalu balas pesan fallback | Ollama belum jalan atau model belum di-pull. Cek dengan `ollama list`. |
| Gambar/icon tidak muncul | Folder `media/` kosong (tidak ikut di-commit). Upload ulang lewat dashboard admin. |
| CORS error di console | Alamat frontend belum terdaftar di `CORS_ALLOWED_ORIGINS` (`backend/core/settings.py`). |

---

## Catatan sebelum production

Beberapa hal di repo ini masih setelan development dan **wajib** diubah sebelum
dipakai publik:

- `backend/core/settings.py` → `DEBUG = True`, ganti jadi `False`
- `backend/core/settings.py` → `SECRET_KEY` masih bawaan, ganti & simpan di environment variable
- `backend/core/settings.py` → `ALLOWED_HOSTS` masih kosong, isi domain kamu
- `backend/core/settings.py` → `CORS_ALLOWED_ORIGINS` masih localhost saja, tambahkan domain production
- Ganti password akun admin (`python manage.py changepassword <username>`)
- SQLite cukup untuk skala kecil; kalau trafik naik, pertimbangkan PostgreSQL
- File media (`media/`) perlu di-serve web server (Nginx) atau object storage,
  karena `django.conf.urls.static` hanya aktif saat `DEBUG = True`