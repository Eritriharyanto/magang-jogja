# magangjogja backend (Django)

Backend API buat website magangjogja.com. Nyimpen data divisi magang,
konten homepage (hero, syarat, fasilitas), dan chatbot (intent statis +
integrasi Ollama).

## Cara jalanin

```bash
# 1. Buat & aktifkan virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependency
pip install -r requirements.txt

# 3. Jalankan migration (bikin database db.sqlite3)
python manage.py migrate

# 4. (Opsional tapi disarankan) isi data awal 18 divisi + syarat + fasilitas + chatbot
python manage.py seed_divisi
python manage.py seed_homepage
python manage.py seed_chatbot

# 5. Buat akun admin
python manage.py createsuperuser

# 6. Jalankan server
python manage.py runserver
```

Server jalan di `http://127.0.0.1:8000`.

- **Admin panel**: `http://127.0.0.1:8000/admin/` -- di sinilah kamu
  tambah/edit/hapus divisi, syarat, fasilitas, dan konten hero, tanpa perlu
  sentuh kode sama sekali.
- **API (dipakai frontend React)**: lihat daftar endpoint di bawah.

## Login admin default (kalau kamu pakai data yang sudah saya buat)

> ⚠️ **Wajib diganti** sebelum production. Ini cuma buat testing lokal.

- Username: `admin`
- Password: `admin12345`

Ganti password lewat `python manage.py changepassword admin`, atau bikin
superuser baru sendiri dengan `python manage.py createsuperuser`.

## Daftar endpoint API

Semua GET di bawah ini **publik**, tidak butuh login. Untuk
POST/PUT/PATCH/DELETE, harus login (dipakai admin dashboard nanti) --
kirim header `Authorization: Token <token>` (dapat token dari endpoint
login di bawah).

| Method | URL | Fungsi |
|---|---|---|
| GET | `/api/divisi/` | List semua divisi (buat section Posisi Magang) |
| GET | `/api/divisi/<slug>/` | Detail 1 divisi (buat halaman `/posisi/<slug>`) |
| POST | `/api/divisi/` | Tambah divisi baru *(butuh login)* |
| PUT/PATCH | `/api/divisi/<slug>/` | Edit divisi *(butuh login)* |
| DELETE | `/api/divisi/<slug>/` | Hapus divisi *(butuh login)* |
| GET | `/api/homepage/hero/` | Ambil konten Hero |
| PUT | `/api/homepage/hero/` | Edit konten Hero *(butuh login)* |
| GET | `/api/homepage/kontak/` | Ambil info kontak (nomor telepon, alamat) |
| PUT | `/api/homepage/kontak/` | Edit info kontak *(butuh login)* |
| GET | `/api/homepage/syarat/` | List syarat & ketentuan |
| POST/PUT/DELETE | `/api/homepage/syarat/<id>/` | Kelola syarat *(butuh login)* |
| GET | `/api/homepage/fasilitas/` | List fasilitas |
| POST/PUT/DELETE | `/api/homepage/fasilitas/<id>/` | Kelola fasilitas *(butuh login)* |
| POST | `/api/auth/token/` | Login -- kirim `username` & `password`, dapat balik `token` |

### Contoh login buat dapat token

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -d "username=admin&password=admin12345"

# balasannya: {"token": "xxxxxxxxxxxxxxxxxxxxx"}
```

Token itu dipakai admin dashboard React nanti buat request yang butuh
login, dengan header:

```
Authorization: Token xxxxxxxxxxxxxxxxxxxxx
```

## Struktur project

```
backend/
├── core/              # Settings & url utama Django
├── divisi/            # App: data divisi magang + jobdesk
│   ├── models.py          Divisi, JobdeskItem
│   ├── serializers.py     Bentuk JSON buat API
│   ├── views.py            Logic endpoint
│   ├── admin.py            Tampilan di Django Admin
│   └── management/commands/seed_divisi.py   Seed data awal
├── homepage/           # App: konten Hero, Syarat, Fasilitas, Kontak
│   └── ... (struktur sama seperti divisi/)
├── media/              # Icon divisi yang diupload lewat admin (auto-generated)
├── db.sqlite3          # Database (auto-generated setelah migrate)
└── requirements.txt
```

## Chatbot (statik + Ollama)

Setara dengan versi Flask yang jadi referensi, cuma di-adaptasi ke Django.
Sudah diisi data asli kamu: **67 intent** (dari `chatbot_data/intents.json`)
dan **56 knowledge entry** (dari `chatbot_data/knowledge_base.json`,
gabungan `informasi_program` + `posisi_magang`). File JSON sumbernya saya
simpan di folder `chatbot_data/` sebagai arsip/riwayat -- yang benar-benar
dipakai saat chatbot jalan adalah data yang sudah masuk ke `db.sqlite3`.

- **Gerbang identitas**: endpoint `/api/chatbot/visitor/` wajib dipanggil dulu
  (kirim `nama` & `no_telepon`) sebelum bisa chat. `/api/chatbot/chat/` akan
  menolak (401) request dari visitor yang belum terdaftar.

- **Intent statis, dicocokkan pakai kemiripan teks (bukan cuma keyword)**:
  data `intents.json` kamu isinya 70-90 contoh kalimat per intent, bukan
  cuma 1-2 keyword pendek -- jadi dicocokkan pakai TF-IDF + cosine
  similarity (`chatbot_app/services/nlu.py`), bukan exact substring match.
  Pesan user dicocokkan ke *contoh kalimat individual* paling mirip
  (nearest neighbor), lalu diambil intent-nya. Kalau skor kemiripan di
  bawah 0.40, dianggap "tidak cukup yakin" dan dilempar ke Ollama.

  **Kenapa bukan keyword matching biasa**: sempat dicoba, tapi banyak
  intent kamu (`tanya_skill_*`) punya keyword generik seperti `"syarat"`
  dan `"skill"` yang muncul di banyak intent sekaligus -- exact match jadi
  gampang salah tembak. TF-IDF atas kalimat lengkap jauh lebih akurat untuk
  data seperti ini (sudah diuji dengan puluhan kalimat on-topic & off-topic
  sebelum threshold 0.40 ditentukan).

- **Ollama (AI, buat pertanyaan di luar 67 intent itu)**: pesan dilempar ke
  Ollama dengan seluruh `KnowledgeEntry` yang aktif sebagai system prompt
  (persona + data resmi magangjogja) + beberapa pesan terakhir sebagai
  konteks percakapan.

- **Guard di luar topik & gibberish** (`chatbot_app/services/guard.py`):
  sebelum masuk ke NLU/Ollama, pesan dicek dulu -- kalau jelas di luar
  topik magang (nanya resep masakan, cuaca, jodoh, dll) atau cuma
  teks acak/spam ("wkwkwkwkwk", huruf tanpa vokal), langsung dibalas
  pesan pengarahan tanpa buang panggilan ke Ollama sama sekali. Ada
  daftar `DOMAIN_KEYWORDS` sebagai pengaman supaya pesan campuran yang
  tetap menyinggung topik magang tidak salah tolak.

- **Tombol aksi otomatis** (`chatbot_app/services/actions.py`): kalau
  intent yang match adalah soal kontak admin atau lokasi kantor, respons
  chat ikut kirim field `aksi` (`{"type", "label", "url"}`) yang di
  frontend dirender sebagai tombol "Chat Admin via WhatsApp" atau "Buka
  di Google Maps". Nomor & alamat diambil otomatis dari
  `homepage.models.KontakContent` (data yang sama dengan yang tampil di
  footer website) -- bukan di-hardcode, jadi kalau admin update nomor/
  alamat lewat Django Admin, tombol chat ikut berubah otomatis.

- **Riwayat chat**: semua pesan (user maupun bot) otomatis tersimpan di
  `ChatMessage`, bisa dilihat lewat Django Admin (klik salah satu
  "Pengunjung Chat") atau endpoint `/api/chatbot/riwayat/`.

### Setup Ollama

```bash
# 1. Install Ollama dari https://ollama.com/download
# 2. Pull model (pilih salah satu, sesuaikan kemampuan komputer)
ollama pull llama3.2:3b
# atau yang lebih ringan:
ollama pull qwen2.5:0.5b
```

Ollama otomatis jalan sebagai service di `http://localhost:11434`. Kalau mau
ganti model atau alamatnya, set environment variable sebelum `runserver`:

```bash
export OLLAMA_MODEL=qwen2.5:1.5b
export OLLAMA_BASE_URL=http://localhost:11434
```

Kalau Ollama belum jalan / model belum di-pull, chatbot tidak akan error --
otomatis balas pesan fallback yang mengarahkan ke nomor admin.

### Import ulang / update data intent & knowledge base

Data yang kamu kasih sudah saya import ke `db.sqlite3` yang saya kirim.
Kalau nanti kamu update file JSON-nya dan mau re-import:

```bash
python manage.py import_chatbot_data --intents chatbot_data/intents.json --knowledge chatbot_data/knowledge_base.json --replace
```

`--replace` akan menghapus data lama dulu sebelum isi yang baru. Tanpa
`--replace`, data akan di-update berdasarkan `nama` intent / `judul`
knowledge entry yang sama (upsert), jadi aman dijalankan berkali-kali.

Setelah import lewat command, kalau server sedang jalan, matcher NLU akan
otomatis rebuild sendiri (dipicu Django signal tiap ada perubahan data
`Intent`) -- tidak perlu restart server.

### Nambah/edit intent & knowledge lewat Django Admin

Selain lewat command import, kamu juga bisa kelola satu-satu lewat
`/admin/`:
- **Intent (Jawaban Statis)**: field `contoh_pertanyaan` diisi list kalimat
  JSON, makin banyak & variatif makin akurat. Field `keywords` opsional,
  tidak wajib diisi.
- **Knowledge Base**: field `judul` + `konten` bebas teks, ini yang jadi
  konteks Ollama.

### Endpoint chatbot

| Method | URL | Fungsi | Auth |
|---|---|---|---|
| POST | `/api/chatbot/visitor/` | Daftar/kenali visitor (nama + no. telepon) | Publik |
| POST | `/api/chatbot/chat/` | Kirim pesan, dapat balasan | Publik (butuh visitor_id valid) |
| GET/POST/PUT/DELETE | `/api/chatbot/intents/` | Kelola intent statis | Login |
| GET/POST/PUT/DELETE | `/api/chatbot/knowledge/` | Kelola knowledge base | Login |
| GET | `/api/chatbot/riwayat/` | List semua visitor + jumlah pesan | Login |
| GET | `/api/chatbot/riwayat/<uuid>/` | Detail 1 visitor + transkrip lengkap | Login |

## Yang masih menyusul

- Setting `CORS_ALLOWED_ORIGINS` di `core/settings.py` baru mengizinkan
  `localhost:5173`/`4173` (dev server Vite). Nanti pas frontend sudah
  di-deploy, tambahkan juga domain productionnya di situ.
- Dashboard admin React custom (kelola divisi, homepage, intent & knowledge
  base chatbot) -- untuk sekarang semua bisa dikelola lewat Django Admin.
- Data `posisi_magang` di knowledge base kamu ada 19 posisi (termasuk
  "Machine Learning" yang belum ada di 18 divisi model `Divisi`, dan
  beberapa penamaan sedikit beda -- misal "Digital Marketing" vs "Digital
  Market" yang sudah ada). Kalau mau, saya bisa sinkronkan supaya divisi
  di homepage & chatbot pakai data yang sama persis.
