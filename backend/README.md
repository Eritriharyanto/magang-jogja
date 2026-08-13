# magangjogja backend (Django)

Backend API buat website magangjogja.com. Nyimpen data divisi magang,
konten homepage (hero, syarat, fasilitas), dan nanti chatbot (intent +
knowledge base + integrasi Ollama -- menyusul).

## Cara jalanin

```bash
# 1. Buat & aktifkan virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependency
pip install -r requirements.txt

# 3. Jalankan migration (bikin database db.sqlite3)
python manage.py migrate

# 4. (Opsional tapi disarankan) isi data awal 18 divisi + syarat + fasilitas
python manage.py seed_divisi
python manage.py seed_homepage

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

- App `chatbot/` -- model Intent & KnowledgeBase, integrasi Ollama
- Setting `CORS_ALLOWED_ORIGINS` di `core/settings.py` baru mengizinkan
  `localhost:5173` (dev server Vite). Nanti pas frontend sudah di-deploy,
  tambahkan juga domain productionnya di situ.
- Frontend React (`frontend/`) masih ambil data dari `content.js` statis --
  ini perlu diubah supaya fetch dari API di atas.
