from django.core.management.base import BaseCommand
from chatbot.models import Intent, KnowledgeEntry


INTENTS = [
    {
        "nama": "syarat_magang",
        "keywords": "syarat, ketentuan, persyaratan, cara daftar, gimana daftar, mau daftar",
        "jawaban": (
            "Untuk daftar magang di magangjogja.com, kamu perlu:\n"
            "1. Mengisi Form Pendaftaran Magang\n"
            "2. Membawa surat keterangan/pengantar dari sekolah atau kampus\n"
            "3. Sudah direstui/diizinkan orang tua\n"
            "4. Punya niat positif untuk belajar & dapat pengalaman selama magang\n\n"
            "Mau tau posisi apa aja yang tersedia, atau langsung mau minta link form pendaftaran?"
        ),
        "prioritas": 10,
    },
    {
        "nama": "posisi_magang",
        "keywords": "posisi, divisi, formasi, lowongan, jurusan apa, bidang apa",
        "jawaban": (
            "Ada banyak posisi magang tersedia, di antaranya: Administrasi, UI/UX Designer, "
            "Programmer, Human Resource, Social Media Specialist, Content Writer, Marketing & Sales, "
            "Desain Grafis, Digital Market, dan masih banyak lagi. Cek daftar lengkap dan detail "
            "jobdesk-nya di section 'Formasi Magang Untuk Kamu' pada halaman utama, ya!"
        ),
        "prioritas": 10,
    },
    {
        "nama": "fasilitas_magang",
        "keywords": "fasilitas, dapat apa, benefit, keuntungan magang",
        "jawaban": (
            "Fasilitas yang kamu dapat selama magang di sini antara lain: bimbingan dari staff, "
            "pelatihan di luar jam kerja, sertifikat + seragam, koneksi internet gratis (untuk WFO), "
            "info kost murah buat yang dari luar kota, free coffee & tea, surat rekomendasi, sampai "
            "kesempatan gabung di project-project tim kami. Networking dan pengalaman juga dapet banget!"
        ),
        "prioritas": 10,
    },
    {
        "nama": "kontak",
        "keywords": "kontak, nomor telepon, whatsapp, wa, hubungi, alamat, lokasi",
        "jawaban": (
            "Kamu bisa hubungi kami langsung di 0895 2900 2944 (telepon/WhatsApp). "
            "Kantor pusat kami ada di Jl. Janti Gg. Arjuna No. 59, Karangjambe, Banguntapan, "
            "Bantul, Yogyakarta 55198."
        ),
        "prioritas": 10,
    },
    {
        "nama": "biaya_magang",
        "keywords": "biaya, bayar, gratis, harga, berbayar",
        "jawaban": (
            "Program magang di magangjogja.com 100% GRATIS, tidak ada biaya pendaftaran sama sekali. "
            "Kamu justru dapat berbagai fasilitas selama magang berjalan."
        ),
        "prioritas": 15,
    },
    {
        "nama": "terima_kasih",
        "keywords": "makasih, terima kasih, thanks, thank you",
        "jawaban": "Sama-sama! Kalau ada pertanyaan lain seputar magang, tanya aja lagi ya \U0001F60A",
        "prioritas": 5,
    },
]

KNOWLEDGE_ENTRIES = [
    {
        "judul": "Durasi Magang",
        "isi": "Durasi magang menyesuaikan kebutuhan peserta, umumnya mengikuti ketentuan dari sekolah/kampus masing-masing (biasanya 1-6 bulan).",
        "urutan": 1,
    },
    {
        "judul": "Jenis Program yang Diterima",
        "isi": "Kami menerima peserta untuk PKL (Praktik Kerja Lapangan), Magang, Prakerin, OJT (On the Job Training), maupun Praktik Kerja lainnya, baik dari SMK maupun Mahasiswa.",
        "urutan": 2,
    },
    {
        "judul": "Cara Menghubungi Admin",
        "isi": "Peserta yang butuh form pendaftaran magang bisa menghubungi Admin Magangjogja langsung di 0895 2900 2944.",
        "urutan": 3,
    },
]


class Command(BaseCommand):
    help = "Isi data awal Intent (FAQ statis) dan Info Tambahan untuk chatbot."

    def handle(self, *args, **options):
        for item in INTENTS:
            Intent.objects.update_or_create(
                nama=item["nama"],
                defaults={
                    "keywords": item["keywords"],
                    "jawaban": item["jawaban"],
                    "prioritas": item["prioritas"],
                },
            )

        for item in KNOWLEDGE_ENTRIES:
            KnowledgeEntry.objects.update_or_create(
                judul=item["judul"],
                defaults={"isi": item["isi"], "urutan": item["urutan"]},
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Selesai. {len(INTENTS)} intent dan {len(KNOWLEDGE_ENTRIES)} info tambahan diproses."
            )
        )
