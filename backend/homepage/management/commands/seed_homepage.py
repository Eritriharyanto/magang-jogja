from django.core.management.base import BaseCommand
from homepage.models import SyaratItem, FasilitasItem, HeroContent, KontakContent

SYARAT = [
    "Mengisi Form Pendaftaran Magang (bs minta ke Admin Magangjogja di 0895 2900 2944)",
    "Membawa surat keterangan atau surat pengantar dari sekolah/kampus",
    "Direstui orangtua atau sudah ijin orangtua",
    "Memiliki niat positif untuk mencari skill & pengalaman selama magang berjalan",
    "Mau latihan hidup mandiri, dewasa dan latihan jauh dari orangtua.\nJadi lulus dari magang sudah siap hidup mandiri",
    "Mau berinteraksi dengan karyawan, menjaga nama baik perusahaan, kampus/sekolah, dan diri sendiri",
]

FASILITAS = [
    "Bimbingan dari staff / asisten kami",
    "Ada pelatihan diluar jam kerja",
    "Mendapatkan sertifikat + seragam magangjogja.com",
    "Koneksi Internet Free (bagi yang WFO)",
    "Bagi yang jauh dari luar kota diberikan info kost murah",
    "Free drink (Coffee & Tea)",
    "Mendapat surat rekomendasi",
    "Mendapatkan kesempatan untuk bergabung dan\nbekerjasama di project-project team kami",
    "Networking & Experience",
]


class Command(BaseCommand):
    help = "Isi data awal Hero, Kontak, Syarat, dan Fasilitas."

    def handle(self, *args, **options):
        HeroContent.get_solo()
        KontakContent.get_solo()

        SyaratItem.objects.all().delete()
        for i, teks in enumerate(SYARAT):
            SyaratItem.objects.create(teks=teks, urutan=i)

        FasilitasItem.objects.all().delete()
        for i, teks in enumerate(FASILITAS):
            FasilitasItem.objects.create(teks=teks, urutan=i)

        self.stdout.write(self.style.SUCCESS("Selesai isi data Hero, Kontak, Syarat, dan Fasilitas."))
