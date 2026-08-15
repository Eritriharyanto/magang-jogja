from django.core.management.base import BaseCommand
from chatbot_app.models import Intent, KnowledgeEntry

# Catatan: sejak intents.json & knowledge_base.json asli kamu berhasil
# di-import (lihat import_chatbot_data), command ini jadi kurang relevan.
# Tetap dipertahankan sebagai contoh/fallback minimal kalau database
# di-reset dari nol tanpa data asli.
INTENTS = [
    {
        "nama": "sapaan_contoh",
        "kategori": "Sapaan",
        "contoh_pertanyaan": ["halo", "hai min", "selamat pagi", "permisi ada admin gak"],
        "keywords": ["halo", "hai"],
        "jawaban": "Halo! Selamat datang di chatbot magangjogja.com 👋 Ada yang bisa dibantu seputar program magang kami?",
    },
    {
        "nama": "syarat_contoh",
        "kategori": "Syarat",
        "contoh_pertanyaan": [
            "syarat daftar magang apa aja",
            "persyaratan buat magang disini apa",
            "cara daftar gimana min",
        ],
        "keywords": ["syarat", "persyaratan"],
        "jawaban": (
            "Syarat utamanya: mengisi form pendaftaran, membawa surat pengantar dari "
            "sekolah/kampus, dan sudah diizinkan orangtua. Detail lengkapnya bisa dilihat "
            "di section 'Syarat dan Ketentuan' di halaman ini ya!"
        ),
    },
    {
        "nama": "kontak_contoh",
        "kategori": "Kontak",
        "contoh_pertanyaan": [
            "boleh minta nomor kontak admin gak",
            "ada whatsapp admin gak min",
            "gimana cara hubungi admin",
        ],
        "keywords": ["kontak", "whatsapp"],
        "jawaban": "Kamu bisa hubungi admin magangjogja di 0895 2900 2944 untuk info lebih lanjut.",
    },
    {
        "nama": "biaya_contoh",
        "kategori": "Biaya",
        "contoh_pertanyaan": [
            "magang disini bayar gak",
            "ada biaya pendaftaran gak min",
            "beneran gratis ya buat daftar",
        ],
        "keywords": ["biaya", "gratis"],
        "jawaban": "Program magang di magangjogja.com 100% gratis, tidak ada biaya pendaftaran sama sekali.",
    },
]

KNOWLEDGE = [
    {
        "judul": "Tentang magangjogja.com",
        "konten": (
            "magangjogja.com adalah program magang/PKL/prakerin yang diselenggarakan oleh "
            "Seven Inc, terbuka untuk siswa SMK dan mahasiswa yang ingin mendapatkan "
            "pengalaman kerja nyata."
        ),
    },
    {
        "judul": "Lokasi Kantor",
        "konten": "Jl. Janti Gg. Arjuna No. 59, Karangjambe, Banguntapan, Bantul, Yogyakarta 55198.",
    },
    {
        "judul": "Fasilitas Peserta Magang",
        "konten": (
            "Peserta magang mendapat bimbingan dari staff, pelatihan di luar jam kerja, "
            "sertifikat dan seragam magangjogja.com, koneksi internet gratis (untuk yang WFO), "
            "info kost murah untuk peserta luar kota, free coffee & tea, surat rekomendasi, "
            "kesempatan terlibat di project nyata, serta networking dan experience."
        ),
    },
]


class Command(BaseCommand):
    help = "Isi beberapa contoh intent & knowledge base chatbot (fallback minimal, bukan data asli)."

    def handle(self, *args, **options):
        Intent.objects.all().delete()
        for i, item in enumerate(INTENTS):
            Intent.objects.create(**item, urutan=i)

        KnowledgeEntry.objects.all().delete()
        for i, item in enumerate(KNOWLEDGE):
            KnowledgeEntry.objects.create(**item, urutan=i)

        self.stdout.write(
            self.style.SUCCESS(
                f"Selesai. {len(INTENTS)} intent contoh dan {len(KNOWLEDGE)} knowledge entry contoh dibuat."
            )
        )
        self.stdout.write(
            self.style.WARNING(
                "Ini cuma contoh minimal -- untuk data asli, pakai: "
                "python manage.py import_chatbot_data --intents ... --knowledge ... --replace"
            )
        )
