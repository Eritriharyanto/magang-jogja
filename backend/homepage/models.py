from django.db import models


class HeroContent(models.Model):
    """Konten section Hero (judul, sub-judul, deskripsi). Didesain sebagai
    singleton -- cuma boleh ada 1 baris data, karena cuma ada 1 hero section."""

    judul_baris1 = models.CharField(max_length=100, default="Magang")
    judul_baris2 = models.CharField(max_length=100, default="Kuy!")
    subjudul = models.CharField(
        max_length=300,
        default="Kamu siswa SMK atau Mahasiswa? Cari tempat PKL, Magang, Prakerin, OJT atau praktik Kerja?",
    )
    deskripsi = models.TextField(
        default="Seven Inc membuka kesempatan buat Kamu yang ingin menjajal pengalaman kerja di bisnis yang dijalankan Seven Inc",
    )
    diubah_pada = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Konten Hero"
        verbose_name_plural = "Konten Hero"

    def __str__(self):
        return f"{self.judul_baris1} {self.judul_baris2}"

    def save(self, *args, **kwargs):
        # Paksa pk selalu 1 supaya cuma ada 1 baris (singleton pattern).
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _created = cls.objects.get_or_create(pk=1)
        return obj


class KontakContent(models.Model):
    """Konten footer/kontak. Juga singleton."""

    nomor_telepon = models.CharField(max_length=30, default="0895 2900 2944")
    alamat = models.TextField(
        default="Jl. Janti Gg. Arjuna No. 59, Karangjambe, Banguntapan, Bantul, Yogyakarta 55198",
    )
    diubah_pada = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Konten Kontak"
        verbose_name_plural = "Konten Kontak"

    def __str__(self):
        return "Info Kontak"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _created = cls.objects.get_or_create(pk=1)
        return obj


class SyaratItem(models.Model):
    """Satu poin di section 'Syarat dan Ketentuan'."""

    teks = models.TextField(help_text="Isi poin syarat. Boleh multi-baris.")
    urutan = models.PositiveIntegerField(default=0)
    aktif = models.BooleanField(default=True)

    class Meta:
        ordering = ["urutan", "id"]
        verbose_name = "Syarat & Ketentuan"
        verbose_name_plural = "Syarat & Ketentuan"

    def __str__(self):
        return self.teks[:60]


class FasilitasItem(models.Model):
    """Satu poin di section 'Fasilitas yang didapat'."""

    teks = models.TextField(help_text="Isi poin fasilitas. Boleh multi-baris.")
    urutan = models.PositiveIntegerField(default=0)
    aktif = models.BooleanField(default=True)

    class Meta:
        ordering = ["urutan", "id"]
        verbose_name = "Fasilitas"
        verbose_name_plural = "Fasilitas"

    def __str__(self):
        return self.teks[:60]
