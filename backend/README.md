# Backend — Django REST API

API untuk website magangjogja.com. Menyimpan data posisi magang, konten
homepage, dan seluruh otak chatbot (intent statis + integrasi Ollama).

Ini satu-satunya bagian yang punya akses ke database. `frontend/` dan `admin/`
sepenuhnya bergantung ke sini.

**Stack:** Django 6.1 · Django REST Framework 3.18 · SQLite · scikit-learn (NLU) · Ollama (AI)

---

## Daftar Isi

- [Struktur folder](#struktur-folder)
- [Cara menjalankan](#cara-menjalankan)
- [Model data](#model-data)
- [Daftar endpoint API](#daftar-endpoint-api)
- [Autentikasi](#autentikasi)
- [Cara kerja chatbot](#cara-kerja-chatbot)
- [Setup Ollama](#setup-ollama)
- [Management command](#management-command)
- [Konfigurasi](#konfigurasi)
- [Troubleshooting](#troubleshooting)

---

## Struktur folder

```
backend/
├── manage.py
├── requirements.txt
├── db.sqlite3                      ← database (auto-generated, tidak masuk git)
├── media/                          ← file upload (auto-generated, tidak masuk git)
│   ├── divisi_icons/                   icon posisi magang
│   └── syarat_foto/                    foto poin syarat
│
├── core/                           ← konfigurasi project
│   ├── settings.py                     DB, CORS, DRF, setting Ollama
│   ├── urls.py                         routing utama (/admin/, /api/...)
│   ├── wsgi.py / asgi.py
│
├── divisi/                         ← APP: posisi magang
│   ├── models.py                       Divisi, JobdeskItem
│   ├── serializers.py                  List / Detail / Write serializer
│   ├── views.py                        DivisiViewSet
│   ├── urls.py
│   ├── admin.py                        tampilan di Django Admin
│   └── management/commands/
│       └── seed_divisi.py              isi 18 divisi awal
│
├── homepage/                       ← APP: konten homepage
│   ├── models.py                       HeroContent, KontakContent,
│   │                                   SyaratItem, FasilitasItem
│   ├── serializers.py
│   ├── views.py                        Hero/Kontak (singleton) + 2 ViewSet
│   ├── urls.py
│   ├── admin.py
│   ├── migrations/
│   │   ├── 0001_initial.py
│   │   └── 0002_syaratitem_foto.py     penambahan foto di syarat
│   └── management/commands/
│       └── seed_homepage.py            isi hero, kontak, syarat, fasilitas awal
│
├── chatbot_app/                    ← APP: chatbot
│   ├── models.py                       Intent, KnowledgeEntry,
│   │                                   ChatVisitor, ChatMessage
│   ├── serializers.py
│   ├── views.py                        VisitorRegister, Chat, 3 ViewSet
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py                         signal: rebuild NLU saat Intent berubah
│   ├── services/                   ← logika chatbot (bukan Django, Python murni)
│   │   ├── guard.py                    filter off-topic & gibberish
│   │   ├── nlu.py                      pencocokan intent (TF-IDF)
│   │   ├── kb_summary.py               rakit system prompt dari Knowledge Base
│   │   ├── ollama_client.py            panggil Ollama + fallback
│   │   └── actions.py                  tombol WA / Google Maps
│   └── management/commands/
│       ├── import_chatbot_data.py      JSON → database
│       ├── export_chatbot_data.py      database → JSON (backup)
│       └── seed_chatbot_sample.py      contoh minimal (bukan data asli)
│
└── chatbot_data/                   ← arsip JSON data awal
    ├── intents.json                    68 intent
    └── knowledge_base.json             56 knowledge entry
                                        (37 informasi_program + 19 posisi_magang)
```

---

## Cara menjalankan

```bash
# 1. Virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux / macOS

# 2. Dependency
pip install -r requirements.txt

# 3. Database
python manage.py migrate

# 4. Data awal
python manage.py seed_divisi
python manage.py seed_homepage
python manage.py import_chatbot_data --intents chatbot_data/intents.json --knowledge chatbot_data/knowledge_base.json

python manage.py import_chatbot_data --intents chatbot_data/intents.json --knowledge chatbot_data/knowledge_base.json --replace ("PENTING")

# 5. Akun admin
python manage.py createsuperuser

# 6. Jalankan
python manage.py runserver
```

Server jalan di `http://127.0.0.1:8000`.

| Alamat | Isi |
|---|---|
| `/api/` | Endpoint yang dipakai frontend & admin dashboard |
| `/admin/` | Django Admin — alternatif kelola data tanpa dashboard React |

> **Setiap kali ada perubahan model** (`models.py`), jalankan:
> `python manage.py makemigrations` lalu `python manage.py migrate`.
> Kalau melewatkan ini, akan muncul error 500 dengan pesan `no such column`.

---

## Model data

### `divisi/` — posisi magang

**`Divisi`** — satu kartu formasi magang di homepage, sekaligus sumber halaman detail.

| Field | Tipe | Keterangan |
|---|---|---|
| `label` | Char | Nama posisi, mis. "UI/UX Designer" |
| `sub_label` | Char | Baris kedua di kartu, boleh kosong |
| `slug` | Slug (unik) | Dipakai di URL `/posisi/<slug>`. Otomatis dari `label` kalau kosong |
| `icon` | Image | Icon kartu (upload ke `media/divisi_icons/`) |
| `deskripsi` | Text | Tampil di halaman detail |
| `gform_link` | URL | Link Google Form pendaftaran |
| `urutan` | Int | Angka kecil tampil duluan |
| `aktif` | Bool | `False` = disembunyikan dari publik tanpa dihapus |

**`JobdeskItem`** — satu baris tugas, relasi ke `Divisi` (`on_delete=CASCADE`).
Punya `teks` dan `urutan`.

### `homepage/` — konten halaman utama

**`HeroContent`** dan **`KontakContent`** adalah **singleton** — `save()`
dipaksa `pk = 1`, jadi selalu cuma ada 1 baris. Ambil datanya lewat
`.get_solo()` yang otomatis membuat baris kalau belum ada.

| Model | Field |
|---|---|
| `HeroContent` | `judul_baris1`, `judul_baris2`, `subjudul`, `deskripsi` |
| `KontakContent` | `nomor_telepon`, `alamat` |
| `SyaratItem` | `teks`, `foto` (opsional), `urutan`, `aktif` |
| `FasilitasItem` | `teks`, `urutan`, `aktif` |

> `KontakContent` dipakai di dua tempat sekaligus: footer website **dan** tombol
> "Chat Admin via WhatsApp" di chatbot. Ubah sekali, keduanya ikut berubah.

### `chatbot_app/` — chatbot

| Model | Fungsi |
|---|---|
| `Intent` | Jawaban baku. Field kuncinya `contoh_pertanyaan` (list JSON kalimat) dan `jawaban` |
| `KnowledgeEntry` | Potongan pengetahuan (`judul` + `konten`) yang jadi bahan jawaban AI |
| `ChatVisitor` | Identitas pengunjung. PK berupa UUID, `no_telepon` unik |
| `ChatMessage` | Satu pesan (dari user atau bot), relasi ke `ChatVisitor` (CASCADE) |

`ChatMessage.sumber` menandai asal jawaban bot: `static` (Intent), `ollama`
(AI), `guard` (ditolak karena di luar topik), atau `system`.

---

## Daftar endpoint API

Aturan umum: **GET publik, sisanya butuh login.** Endpoint chatbot punya aturan
sendiri (lihat kolom Auth).

### Divisi

| Method | URL | Fungsi | Auth |
|---|---|---|---|
| GET | `/api/divisi/` | List divisi (publik hanya lihat yang aktif) | — |
| GET | `/api/divisi/<slug>/` | Detail + jobdesk + link Google Form | — |
| POST | `/api/divisi/` | Tambah divisi | 🔒 |
| PUT/PATCH | `/api/divisi/<slug>/` | Edit divisi | 🔒 |
| DELETE | `/api/divisi/<slug>/` | Hapus divisi | 🔒 |

Menerima `multipart/form-data` untuk upload icon. Field `jobdesk` dikirim
sebagai **list string biasa** (bukan list object) — tiap simpan, jobdesk lama
dihapus dan diganti sesuai urutan list yang dikirim.

### Homepage

| Method | URL | Fungsi | Auth |
|---|---|---|---|
| GET | `/api/homepage/hero/` | Ambil konten Hero | — |
| PUT | `/api/homepage/hero/` | Edit konten Hero | 🔒 |
| GET | `/api/homepage/kontak/` | Ambil nomor & alamat | — |
| PUT | `/api/homepage/kontak/` | Edit nomor & alamat | 🔒 |
| GET | `/api/homepage/syarat/` | List syarat | — |
| POST | `/api/homepage/syarat/` | Tambah syarat (bisa + foto) | 🔒 |
| PATCH | `/api/homepage/syarat/<id>/` | Edit syarat | 🔒 |
| DELETE | `/api/homepage/syarat/<id>/` | Hapus syarat | 🔒 |
| GET | `/api/homepage/fasilitas/` | List fasilitas | — |
| POST/PATCH/DELETE | `/api/homepage/fasilitas/<id>/` | Kelola fasilitas | 🔒 |

Endpoint `syarat` menerima `multipart/form-data` (untuk foto) **maupun** JSON
biasa. Kalau tidak ada foto baru, kirim JSON saja.

### Chatbot

| Method | URL | Fungsi | Auth |
|---|---|---|---|
| POST | `/api/chatbot/visitor/` | Daftar/kenali visitor (`nama`, `no_telepon`) | — |
| POST | `/api/chatbot/chat/` | Kirim pesan (`visitor_id`, `pesan`) | Butuh `visitor_id` valid |
| GET/POST/PUT/DELETE | `/api/chatbot/intents/` | Kelola intent | 🔒 |
| GET/POST/PUT/DELETE | `/api/chatbot/knowledge/` | Kelola knowledge base | 🔒 |
| GET | `/api/chatbot/riwayat/` | List visitor + jumlah pesan | 🔒 |
| GET | `/api/chatbot/riwayat/<uuid>/` | Detail + transkrip lengkap | 🔒 |
| DELETE | `/api/chatbot/riwayat/<uuid>/` | Hapus visitor + seluruh pesannya | 🔒 |

`/api/chatbot/riwayat/` sengaja **tidak** menyediakan POST/PUT — visitor hanya
boleh dibuat lewat proses chat asli, bukan dibuat manual dari dashboard.

### Auth

| Method | URL | Fungsi |
|---|---|---|
| POST | `/api/auth/token/` | Login, kirim `username` & `password`, dapat `token` |

---

## Autentikasi

Pakai **Token Authentication** bawaan DRF.

```bash
# 1. Minta token
curl -X POST http://127.0.0.1:8000/api/auth/token/ -d "username=admin&password=rahasia"
# → {"token": "8ad16be7e7e80c642cd25f78..."}

# 2. Pakai token di request berikutnya
curl http://127.0.0.1:8000/api/chatbot/riwayat/ -H "Authorization: Token 8ad16be7e7e80c642cd25f78..."
```

Token tidak punya masa berlaku — dicabut dengan menghapusnya lewat Django Admin
(model *Tokens*) atau mengganti password user.

---

## Cara kerja chatbot

Alurnya berlapis, dari yang paling murah ke yang paling mahal. Tujuannya:
jangan panggil AI kalau tidak perlu.

```
POST /api/chatbot/chat/ { visitor_id, pesan }
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ LANGKAH 0 — validasi visitor                                 │
│ visitor_id tidak ada / tidak dikenal → 401                   │
│ Ini "gerbang identitas": tidak bisa chat tanpa isi nama & no.│
└──────────────────────────────────────────────────────────────┘
       │
       ▼  simpan pesan user ke ChatMessage
┌──────────────────────────────────────────────────────────────┐
│ LANGKAH 1 — guard.py  (paling murah, tanpa AI)               │
│                                                              │
│ Cek OFF_TOPIC_PHRASES: "resep masakan", "jodoh", "cuaca"...  │
│ TAPI kalau pesan juga mengandung DOMAIN_KEYWORDS             │
│ ("magang", "pkl", "jobdesk", "skill"...) → JANGAN ditolak.   │
│                                                              │
│ Pengaman ini penting: "programmer belajar coding apa aja"    │
│ jangan sampai salah tolak hanya karena ada kata "coding".    │
│                                                              │
│ Off-topic → balas OFF_TOPIC_MESSAGE + tombol WA  → SELESAI   │
└──────────────────────────────────────────────────────────────┘
       │ lolos
       ▼
┌──────────────────────────────────────────────────────────────┐
│ LANGKAH 2 — nlu.py  (TF-IDF, cepat, tanpa AI)                │
│                                                              │
│ Semua contoh_pertanyaan dari Intent aktif dijadikan korpus,  │
│ SATU KALIMAT = SATU BARIS (bukan digabung per intent).       │
│ Pesan user dicocokkan ke kalimat termirip (nearest neighbor),│
│ lalu diambil Intent pemiliknya.                              │
│                                                              │
│ skor ≥ 0.40 → jawab pakai intent.jawaban   → sumber "static" │
│ skor < 0.40 → lanjut ke Ollama                               │
└──────────────────────────────────────────────────────────────┘
       │ tidak ada yang cukup mirip
       ▼
┌──────────────────────────────────────────────────────────────┐
│ LANGKAH 3 — ollama_client.py  (paling mahal)                 │
│                                                              │
│ system prompt  = seluruh KnowledgeEntry aktif (kb_summary.py)│
│ konteks        = 10 pesan terakhir visitor ini               │
│ pesan          = pertanyaan user                             │
│                                                              │
│ Ollama mati/timeout → FALLBACK_MESSAGE + tombol WA           │
│ (tidak pernah melempar exception ke user)                    │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ LANGKAH 4 — actions.py                                       │
│ Intent soal kontak/pendaftaran → tombol "Chat Admin via WA"  │
│ Intent soal lokasi             → tombol "Buka di Google Maps"│
│ Nomor & alamat diambil dari KontakContent (bukan hardcode)   │
└──────────────────────────────────────────────────────────────┘
       │
       ▼  simpan jawaban bot ke ChatMessage
   Response: { "pesan": "...", "sumber": "...", "aksi": {...} }
```

### Kenapa TF-IDF, bukan keyword matching?

Sempat dicoba pakai exact keyword match, tapi banyak intent punya keyword
generik seperti `"syarat"` dan `"skill"` yang muncul di banyak intent sekaligus
— jadi gampang salah tembak. TF-IDF atas kalimat lengkap jauh lebih akurat
untuk data seperti ini, karena `contoh_pertanyaan` memang berisi 70–90 variasi
parafrase per intent, bukan 1–2 kata pendek.

Field `keywords` di model **sengaja tidak** dimasukkan ke korpus TF-IDF:
dokumen 1–2 kata akan jadi "magnet" yang terlalu kuat untuk query pendek apa
pun, dan mengalahkan kecocokan kalimat yang sebenarnya lebih tepat.

### Cache NLU

Matriks TF-IDF di-cache di memori. `chatbot_app/apps.py` memasang signal
`post_save`/`post_delete` pada model `Intent` yang otomatis membersihkan cache
— jadi begitu kamu edit intent lewat dashboard, pencocokan langsung memakai
data terbaru **tanpa perlu restart server**.

---

## Setup Ollama

```bash
# 1. Install dari https://ollama.com/download
# 2. Pull model (pilih sesuai kemampuan komputer)
ollama pull llama3.2:3b        # default
ollama pull qwen2.5:1.5b       # lebih ringan
```

Ollama otomatis jalan sebagai service di `http://localhost:11434`.

Semua setting bisa diubah lewat environment variable sebelum `runserver`:

| Variable | Default | Fungsi |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Alamat server Ollama |
| `OLLAMA_MODEL` | `llama3.2:3b` | Model yang dipakai |
| `OLLAMA_TIMEOUT` | `30` (detik) | Batas tunggu sebelum fallback |
| `OLLAMA_NUM_PREDICT` | `400` (token) | Panjang maksimal jawaban (~1 token ≈ 3–4 karakter) |
| `OLLAMA_TEMPERATURE` | `0.3` | Kekreatifan jawaban: `0.0` konsisten ↔ `1.0+` variatif |

Contoh (Windows CMD):

```cmd
set OLLAMA_MODEL=qwen2.5:1.5b
set OLLAMA_NUM_PREDICT=250
python manage.py runserver
```

Kalau Ollama belum jalan, chatbot **tidak error** — otomatis balas pesan
fallback yang mengarahkan ke nomor admin.

---

## Management command

| Command | Fungsi |
|---|---|
| `python manage.py seed_divisi` | Isi 18 divisi magang awal |
| `python manage.py seed_homepage` | Isi Hero, Kontak, Syarat, Fasilitas awal |
| `python manage.py import_chatbot_data` | Import intent & knowledge dari JSON |
| `python manage.py export_chatbot_data` | Export database ke JSON (backup) |
| `python manage.py seed_chatbot_sample` | Contoh minimal chatbot (bukan data asli) |

### Import data chatbot

```bash
# Upsert — aman dijalankan berkali-kali, data dicocokkan by nama/judul
python manage.py import_chatbot_data --intents chatbot_data/intents.json --knowledge chatbot_data/knowledge_base.json

# Replace — hapus semua data lama dulu
python manage.py import_chatbot_data --intents chatbot_data/intents.json --replace
```

### Export data chatbot (backup)

Data yang diedit lewat dashboard hanya hidup di `db.sqlite3` — file JSON di
`chatbot_data/` **tidak** ikut ter-update otomatis (itu cuma arsip data awal).
Untuk backup:

```bash
python manage.py export_chatbot_data
```

Hasilnya ke `chatbot_data/intents_export.json` dan
`knowledge_base_export.json` (sengaja beda nama supaya arsip asli tidak
tertimpa). Ditulis dengan atomic write (`os.replace`), jadi aman dijalankan
kapan saja.

> `intents_export.json` formatnya identik dengan `intents.json` asli, jadi bisa
> langsung dipakai untuk import ulang. Tapi `knowledge_base_export.json`
> **berbeda struktur** dari aslinya (flat list, bukan nested
> `informasi_program`/`posisi_magang`) — struktur nested itu "diratakan" satu
> arah saat import pertama dan tidak bisa direkonstruksi balik.

---

## Konfigurasi

Semua di `core/settings.py`.

| Setting | Nilai sekarang | Catatan |
|---|---|---|
| `DEBUG` | `True` | **Wajib `False` di production** |
| `SECRET_KEY` | hardcode | **Wajib diganti & dipindah ke env var** |
| `ALLOWED_HOSTS` | `[]` | Isi domain saat deploy |
| `DATABASES` | SQLite | Cukup untuk skala kecil |
| `CORS_ALLOWED_ORIGINS` | localhost `5173`/`5174`/`4173`/`4174` | Tambahkan domain production |
| `LANGUAGE_CODE` | `id-id` | |
| `TIME_ZONE` | `Asia/Jakarta` | |
| `MEDIA_ROOT` | `backend/media/` | File upload |

DRF memakai `IsAuthenticatedOrReadOnly` sebagai default permission, dengan
Session + Token authentication aktif.

---

## Troubleshooting

| Gejala | Solusi |
|---|---|
| `no such column: ...` (error 500) | Migration belum dijalankan → `python manage.py migrate` |
| `ImportError: cannot import name 'X' from '...'` | File Python tidak sinkron (campuran versi). Pastikan semua file dari satu sumber yang sama |
| `ModuleNotFoundError: No module named 'django'` | Virtual environment belum diaktifkan |
| CORS error di browser | Tambahkan alamat frontend ke `CORS_ALLOWED_ORIGINS` |
| Chatbot selalu fallback | Ollama belum jalan / model belum di-pull → cek `ollama list` |
| Intent baru tidak kena match | Tambah lebih banyak variasi di `contoh_pertanyaan`; cache otomatis rebuild |
| Gambar 404 padahal sudah upload | `DEBUG = False` mematikan serving media Django — perlu Nginx/object storage |
| Lupa password admin | `python manage.py changepassword <username>` |