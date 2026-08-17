# magangjogja admin dashboard

Dashboard React buat kelola konten website magangjogja.com & chatbot-nya,
tanpa perlu edit kode atau pakai Django Admin.

## Cara jalanin

```bash
npm install
npm run dev
```

Buka `http://localhost:5174`. Pastikan **backend Django sudah jalan**
lebih dulu di `http://127.0.0.1:8000` (lihat README di folder `backend/`).

## Login

Pakai akun superuser Django yang sama dengan yang dipakai buat `/admin/`
di backend:

- Username: `admin`
- Password: `admin12345` (⚠️ ganti ini sebelum production, sama seperti
  yang dicatat di README backend)

## Apa yang bisa dikelola di sini

| Menu | Fungsi |
|---|---|
| **Dashboard** | Ringkasan jumlah divisi, syarat, fasilitas, intent, knowledge, dan pengunjung chat |
| **Divisi** | Tambah/edit/hapus posisi magang, termasuk icon, deskripsi, jobdesk, link Google Form, dan urutan tampil |
| **Hero** | Edit judul & teks di bagian paling atas homepage |
| **Kontak** | Edit nomor telepon & alamat kantor -- otomatis dipakai juga oleh tombol WhatsApp/Maps di chatbot |
| **Syarat & Ketentuan** | Kelola poin-poin syarat pendaftaran |
| **Fasilitas** | Kelola poin-poin fasilitas yang didapat peserta |
| **Intent Chatbot** | Kelola jawaban statis chatbot -- nama intent, contoh kalimat (buat matching), keywords, dan jawabannya |
| **Knowledge Base** | Kelola data yang disuapkan ke Ollama sebagai konteks jawaban AI |
| **Riwayat Chat** | Lihat daftar pengunjung yang pernah chat + transkrip lengkapnya |

## Setting URL backend

Kalau backend jalan di alamat lain (bukan `127.0.0.1:8000`), buat file
`.env` di folder ini:

```
VITE_API_BASE_URL=https://api.magangjogja.com
```

## Catatan teknis

- Auth pakai Token Authentication bawaan Django REST Framework -- token
  disimpan di `localStorage`, ditempel otomatis ke tiap request lewat
  header `Authorization: Token <token>`.
- Upload icon divisi dikirim sebagai `multipart/form-data`.
- Ini app terpisah dari `frontend/` (website publik) SENGAJA -- supaya
  kode admin (yang butuh login & tools manajemen) tidak ikut ke-bundle
  ke halaman publik yang dilihat calon peserta magang.
- Belum ada halaman "lupa password" -- reset password lewat
  `python manage.py changepassword <username>` di backend, atau lewat
  `/admin/` Django biasa.
