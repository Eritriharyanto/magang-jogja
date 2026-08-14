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

## Yang masih menyusul

- Setting `CORS_ALLOWED_ORIGINS` di `core/settings.py` baru mengizinkan
  `localhost:5173`/`4173` (dev server Vite). Nanti pas frontend sudah
  di-deploy, tambahkan juga domain productionnya di situ.
- Widget chat di sisi React (frontend) -- backend & API chatbot sudah siap,
  tinggal dibikinkan tampilannya.
- Dashboard admin React custom (untuk sekarang Django Admin sudah cukup
  buat kelola semua konten, termasuk chatbot).

## Chatbot (Static + Ollama)

App `chatbot/` menerapkan pola yang sama dengan referensi
[Chat-Bot-penyewaan-jas-sepatu-celana-versi-ollama-dan-statick](https://github.com/Eritriharyanto/Chat-Bot-penyewaan-jas-sepatu-celana-versi-ollama-dan-statick)
(awalnya Flask), diadaptasi ke Django:

**Alur jawab pesan** (lihat `chatbot/views.py` -> `ChatView`):
1. Cek dulu guard statis (`chatbot/services/intent_matching.py`) -- sapaan
   atau kata kunci `Intent` yang cocok. Kalau ketemu, langsung balas dari
   database, cepat & gratis (tidak panggil AI sama sekali).
2. Kalau tidak ada yang cocok, pesan diteruskan ke Ollama
   (`chatbot/services/ollama_client.py`), dengan konteks berupa ringkasan
   seluruh data magangjogja (`chatbot/services/knowledge_summary.py` --
   ambil dari model `Divisi`, `SyaratItem`, `FasilitasItem`, `HeroContent`,
   `KontakContent`, dan `KnowledgeEntry`). Balasannya di-stream token demi
   token.

**Gerbang identitas & riwayat chat** -- sama seperti referensi: pengunjung
wajib isi nama & no. telepon dulu (`POST /api/chatbot/visitor/`) sebelum
bisa chat. `visitor_id` yang didapat harus disimpan frontend (misal
`localStorage`) dan dikirim di header `X-Visitor-Id` pada setiap request
`POST /api/chatbot/chat/`. Semua pesan (user maupun bot) otomatis tercatat
ke model `ChatMessage`, dan riwayatnya bisa dilihat di Django Admin pada
halaman detail tiap `Visitor`.

### Endpoint chatbot

| Method | URL | Body / Header | Fungsi |
|---|---|---|---|
| POST | `/api/chatbot/visitor/` | `{"nama": "...", "no_telepon": "..."}` | Daftar/login identitas pengunjung, balik `visitor_id` |
| POST | `/api/chatbot/chat/` | Header `X-Visitor-Id: <id>`, body `{"message": "..."}` | Kirim pesan chat |

Contoh:
```bash
# 1. Daftar identitas
curl -X POST http://127.0.0.1:8000/api/chatbot/visitor/ \
  -d '{"nama": "Budi", "no_telepon": "081234567890"}'
# -> {"visitor_id": 1, "nama": "Budi"}

# 2. Kirim pesan (pakai visitor_id dari langkah 1)
curl -X POST http://127.0.0.1:8000/api/chatbot/chat/ \
  -H "X-Visitor-Id: 1" \
  -d '{"message": "syarat daftar magang apa aja?"}'
```

### Isi data chatbot lewat Django Admin

Semua konten chatbot bisa diedit tanpa sentuh kode:
- **Intent / FAQ Chatbot** -- tambah/edit pertanyaan + kata kunci pemicu + jawaban statis
- **Info Tambahan Chatbot** -- fakta tambahan yang jadi konteks Ollama (misal jam operasional, durasi magang)
- **Pengunjung Chat** -- lihat semua orang yang pernah chat + transkrip lengkapnya

### Setup Ollama (opsional, buat chat di luar Intent)

```bash
# 1. Install Ollama dari https://ollama.com/download

# 2. Pull model (pilih salah satu, sesuai kemampuan laptop)
ollama pull llama3.2:3b      # lebih pintar, lebih berat
ollama pull qwen2.5:1.5b     # lebih ringan

# 3. (Opsional) kalau pakai model selain llama3.2:3b, set environment variable:
export OLLAMA_MODEL=qwen2.5:1.5b
```

Ollama otomatis jalan di `http://localhost:11434` setelah diinstall. Kalau
tidak bisa dihubungi, chatbot tetap jalan normal untuk pertanyaan yang
match Intent statis -- cuma pertanyaan di luar itu akan dapat pesan "AI
sedang tidak bisa dihubungi" (lihat `chatbot/services/ollama_client.py`).
