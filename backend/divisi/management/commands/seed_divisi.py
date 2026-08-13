from django.core.management.base import BaseCommand
from divisi.models import Divisi, JobdeskItem


DATA = [
    {
        "slug": "administrasi", "label": "Administrasi", "sub_label": "",
        "deskripsi": "Membantu operasional administratif harian perusahaan, mulai dari pengelolaan data hingga surat-menyurat.",
        "jobdesk": [
            "Input dan mengelola data administrasi perusahaan",
            "Mengarsipkan dokumen dan surat masuk/keluar",
            "Membantu proses rekapitulasi laporan harian",
            "Mendukung kebutuhan operasional tim lain",
        ],
    },
    {
        "slug": "uiux-designer", "label": "UI/UX Designer", "sub_label": "",
        "deskripsi": "Merancang tampilan dan pengalaman pengguna untuk produk digital perusahaan, mulai dari riset hingga prototipe.",
        "jobdesk": [
            "Membuat wireframe dan prototype desain aplikasi/website",
            "Melakukan riset kebutuhan dan pengalaman pengguna",
            "Berkolaborasi dengan tim programmer untuk implementasi desain",
            "Menjaga konsistensi visual (design system)",
        ],
    },
    {
        "slug": "programmer", "label": "Programmer", "sub_label": "Frontend/Backend",
        "deskripsi": "Mengembangkan dan memelihara aplikasi web/mobile, baik dari sisi tampilan (frontend) maupun sistem (backend).",
        "jobdesk": [
            "Menulis dan menguji kode program sesuai kebutuhan project",
            "Memperbaiki bug dan melakukan optimasi performa",
            "Berkolaborasi dengan tim desain dan project manager",
            "Mendokumentasikan kode dan alur sistem",
        ],
    },
    {
        "slug": "human-resource", "label": "Human Resource", "sub_label": "",
        "deskripsi": "Mendukung proses pengelolaan sumber daya manusia, mulai dari rekrutmen hingga administrasi karyawan.",
        "jobdesk": [
            "Membantu proses rekrutmen dan seleksi kandidat",
            "Mengelola data dan administrasi karyawan/peserta magang",
            "Membantu penyelenggaraan pelatihan internal",
            "Menjaga komunikasi dan hubungan antar tim",
        ],
    },
    {
        "slug": "social-media-specialist", "label": "Social Media", "sub_label": "Specialist",
        "deskripsi": "Mengelola akun media sosial perusahaan agar tetap aktif, menarik, dan sesuai dengan strategi branding.",
        "jobdesk": [
            "Merencanakan dan menjadwalkan konten media sosial",
            "Memantau interaksi, komentar, dan pesan followers",
            "Menganalisis performa konten dan insight akun",
            "Berkoordinasi dengan tim desain dan content writer",
        ],
    },
    {
        "slug": "photographer-videographer", "label": "Photographer/", "sub_label": "Videographer",
        "deskripsi": "Menghasilkan konten foto dan video untuk kebutuhan promosi, dokumentasi, dan media sosial perusahaan.",
        "jobdesk": [
            "Melakukan sesi foto dan pengambilan video (shooting)",
            "Mengedit foto dan video sesuai kebutuhan konten",
            "Mengelola dan merawat peralatan dokumentasi",
            "Berkoordinasi dengan tim kreatif untuk konsep konten",
        ],
    },
    {
        "slug": "content-writer", "label": "Content Writer", "sub_label": "",
        "deskripsi": "Menulis berbagai jenis konten untuk kebutuhan promosi, blog, dan media sosial perusahaan.",
        "jobdesk": [
            "Menulis artikel, caption, dan copywriting promosi",
            "Melakukan riset topik dan kata kunci (SEO dasar)",
            "Menyunting dan memastikan kualitas tulisan",
            "Berkoordinasi dengan tim desain dan social media",
        ],
    },
    {
        "slug": "marketing-sales", "label": "Marketing & Sales", "sub_label": "",
        "deskripsi": "Mendukung kegiatan pemasaran dan penjualan produk/jasa perusahaan ke calon pelanggan.",
        "jobdesk": [
            "Membantu strategi pemasaran produk/jasa",
            "Melakukan follow up dan komunikasi dengan calon klien",
            "Membuat laporan penjualan dan progres target",
            "Membantu riset pasar dan kompetitor",
        ],
    },
    {
        "slug": "desain-grafis", "label": "Desain Grafis", "sub_label": "",
        "deskripsi": "Membuat berbagai materi visual untuk kebutuhan promosi, media sosial, dan branding perusahaan.",
        "jobdesk": [
            "Mendesain materi promosi (poster, feed, banner, dll)",
            "Menjaga konsistensi identitas visual perusahaan",
            "Berkolaborasi dengan tim content & social media",
            "Menyiapkan aset desain untuk berbagai kebutuhan tim",
        ],
    },
    {
        "slug": "digital-market", "label": "Digital Market", "sub_label": "",
        "deskripsi": "Menjalankan strategi pemasaran digital untuk meningkatkan awareness dan penjualan secara online.",
        "jobdesk": [
            "Membantu strategi iklan digital (ads) dan campaign",
            "Menganalisis data performa pemasaran digital",
            "Riset tren dan peluang pasar digital",
            "Berkoordinasi dengan tim kreatif dan sales",
        ],
    },
    {
        "slug": "marcomm-public-relation", "label": "Marcomm/", "sub_label": "Public Relation",
        "deskripsi": "Mengelola komunikasi dan citra perusahaan, baik ke publik, media, maupun mitra kerja.",
        "jobdesk": [
            "Menyusun materi komunikasi dan publikasi perusahaan",
            "Menjaga hubungan dengan media dan mitra",
            "Membantu penyelenggaraan event/acara perusahaan",
            "Memantau citra dan reputasi perusahaan di publik",
        ],
    },
    {
        "slug": "host-presenter", "label": "Host / Presenter", "sub_label": "",
        "deskripsi": "Menjadi pembawa acara/host untuk kebutuhan konten live, event, maupun video promosi perusahaan.",
        "jobdesk": [
            "Membawakan acara atau konten live (livestream/event)",
            "Mempelajari dan menyampaikan materi/script dengan baik",
            "Berkoordinasi dengan tim produksi dan kreatif",
            "Menjaga citra dan profesionalisme saat tampil",
        ],
    },
    {
        "slug": "tiktok-creator", "label": "TikTok Creator", "sub_label": "",
        "deskripsi": "Membuat konten kreatif untuk platform TikTok guna meningkatkan engagement dan awareness brand.",
        "jobdesk": [
            "Membuat ide dan konsep konten TikTok",
            "Syuting dan mengedit video pendek",
            "Memantau tren dan algoritma TikTok terkini",
            "Menganalisis performa konten yang sudah tayang",
        ],
    },
    {
        "slug": "voice-over-talent", "label": "Voice Over Talent", "sub_label": "",
        "deskripsi": "Mengisi suara untuk kebutuhan konten video, iklan, maupun materi promosi perusahaan.",
        "jobdesk": [
            "Mengisi suara (voice over) untuk video/konten promosi",
            "Berlatih intonasi dan artikulasi sesuai kebutuhan naskah",
            "Berkoordinasi dengan tim produksi video",
            "Membantu proses rekaman dan revisi audio",
        ],
    },
    {
        "slug": "content-planner", "label": "Content Planner", "sub_label": "",
        "deskripsi": "Merencanakan strategi dan kalender konten untuk berbagai platform milik perusahaan.",
        "jobdesk": [
            "Menyusun kalender dan strategi konten bulanan",
            "Berkoordinasi dengan writer, desainer, dan videografer",
            "Memantau tren konten yang relevan dengan brand",
            "Mengevaluasi performa konten yang sudah tayang",
        ],
    },
    {
        "slug": "project-manager", "label": "Project Manager", "sub_label": "",
        "deskripsi": "Mengoordinasikan jalannya sebuah project agar selesai tepat waktu sesuai target yang ditentukan.",
        "jobdesk": [
            "Menyusun timeline dan pembagian tugas project",
            "Memantau progres kerja tiap anggota tim",
            "Menjadi penghubung komunikasi antar divisi",
            "Membuat laporan progres project secara berkala",
        ],
    },
    {
        "slug": "las", "label": "LAS", "sub_label": "",
        "deskripsi": "Divisi teknis yang mendukung kebutuhan operasional dan produksi sesuai bidang keahlian LAS.",
        "jobdesk": [
            "Membantu proses kerja teknis sesuai penugasan",
            "Menjaga kualitas dan keamanan hasil kerja",
            "Berkoordinasi dengan tim terkait kebutuhan project",
            "Mengikuti standar operasional yang berlaku",
        ],
    },
    {
        "slug": "animasi", "label": "Animasi", "sub_label": "",
        "deskripsi": "Membuat konten animasi untuk kebutuhan promosi, edukasi, maupun hiburan sesuai kebutuhan perusahaan.",
        "jobdesk": [
            "Membuat motion graphic/animasi untuk konten promosi",
            "Menyusun storyboard sebelum proses animasi",
            "Berkolaborasi dengan tim desain dan content writer",
            "Mengedit dan menyempurnakan hasil animasi",
        ],
    },
]

GFORM_DEFAULT = "https://forms.gle/GANTI-DENGAN-LINK-GFORM-KAMU"


class Command(BaseCommand):
    help = "Isi data awal 18 divisi magang (sama seperti yang sebelumnya hardcode di frontend)."

    def handle(self, *args, **options):
        created_count = 0
        for i, item in enumerate(DATA):
            divisi, created = Divisi.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "label": item["label"],
                    "sub_label": item["sub_label"],
                    "deskripsi": item["deskripsi"],
                    "gform_link": GFORM_DEFAULT,
                    "urutan": i,
                },
            )
            divisi.jobdesk_items.all().delete()
            for j, teks in enumerate(item["jobdesk"]):
                JobdeskItem.objects.create(divisi=divisi, teks=teks, urutan=j)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Selesai. {created_count} divisi baru dibuat, "
                f"total {len(DATA)} divisi diproses."
            )
        )
        self.stdout.write(
            self.style.WARNING(
                "Ingat: gform_link masih placeholder, ganti lewat Django Admin."
            )
        )
