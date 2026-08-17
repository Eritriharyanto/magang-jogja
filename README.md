# magangjogja.com — monorepo

Satu folder berisi 3 project:

```
magangjogja/
├── backend/   → API Django (data + chatbot Ollama)
├── frontend/  → Website publik (React + Vite)
└── admin/     → Dashboard admin (React + Vite)
```

## Setup awal (sekali saja)

```bash
# 1. Backend: bikin virtual environment & install dependency Python
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
deactivate
cd ..

# 2. Frontend & Admin: install dependency npm
npm install --prefix frontend
npm install --prefix admin

# 3. Package.json di root ini juga perlu di-install (buat perintah `npm run dev` gabungan)
npm install
```

> Kalau kamu mau, langkah 2 & sebagian 1 bisa disingkat pakai:
> `npm run install:all` (tetap perlu bikin venv Python manual dulu di langkah 1 karena `venv` tidak bisa dibuat otomatis lewat npm).

## Jalanin semuanya sekaligus

```bash
npm run dev
```

Ini otomatis nyalain **ketiganya bersamaan** dalam 1 terminal, dengan output berwarna & berlabel per project:

```
[BACKEND]   Starting development server at http://127.0.0.1:8000/
[FRONTEND]  Local: http://localhost:5173/
[ADMIN]     Local: http://localhost:5174/
```

Tekan `Ctrl+C` sekali buat matiin ketiganya bersamaan.

## Atau jalanin satu-satu (kalau cuma butuh salah satu)

```bash
npm run dev:backend    # cuma backend
npm run dev:frontend   # cuma frontend
npm run dev:admin      # cuma admin
```

## Alamat setelah jalan

| Project | Alamat | Keterangan |
|---|---|---|
| Backend API | http://127.0.0.1:8000/api/ | Dipakai frontend & admin |
| Backend Admin (Django) | http://127.0.0.1:8000/admin/ | Alternatif kelola data tanpa dashboard React |
| Frontend (publik) | http://localhost:5173/ | Yang dilihat calon peserta magang |
| Admin Dashboard | http://localhost:5174/ | Yang kamu pakai buat kelola konten |

## Catatan Windows

Script `dev:backend` di `package.json` pakai `venv/bin/python` (format Linux/Mac).
Kalau kamu pakai Windows, edit `package.json` di root, ganti baris ini:

```json
"dev:backend": "cd backend && venv/bin/python manage.py runserver",
```

jadi:

```json
"dev:backend": "cd backend && venv\\Scripts\\python manage.py runserver",
```

## Detail lebih lanjut

Tiap project punya `README.md` sendiri dengan detail lebih lengkap:
- [`backend/README.md`](./backend/README.md) — API, chatbot, Ollama, seed data
- [`admin/README.md`](./admin/README.md) — cara pakai dashboard admin
