from django.db import models
from django.utils.text import slugify


class Divisi(models.Model):
    """Satu 'kartu' formasi magang di section Posisi Magang, sekaligus
    sumber data untuk halaman detailnya (/posisi/<slug>)."""

    label = models.CharField(
        max_length=100,
        help_text="Nama posisi, misal 'UI/UX Designer'.",
    )
    sub_label = models.CharField(
        max_length=100,
        blank=True,
        help_text="Teks baris kedua di kartu, misal 'Frontend/Backend'. Boleh kosong.",
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
        help_text="Dipakai di URL /posisi/<slug>. Kosongkan untuk dibuat otomatis dari label.",
    )
    icon = models.ImageField(
        upload_to="divisi_icons/",
        blank=True,
        null=True,
        help_text="Icon/ilustrasi untuk kartu posisi ini (svg/png).",
    )
    deskripsi = models.TextField(
        help_text="Deskripsi singkat divisi, ditampilkan di halaman detail.",
    )
    gform_link = models.URLField(
        max_length=500,
        help_text="Link Google Form pendaftaran untuk posisi ini.",
    )
    urutan = models.PositiveIntegerField(
        default=0,
        help_text="Urutan tampil di halaman utama (angka kecil tampil duluan).",
    )
    aktif = models.BooleanField(
        default=True,
        help_text="Matikan (uncheck) untuk sembunyikan posisi ini dari website tanpa menghapus datanya.",
    )
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    diubah_pada = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["urutan", "label"]
        verbose_name = "Divisi Magang"
        verbose_name_plural = "Divisi Magang"

    def __str__(self):
        return self.label

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.label)
        super().save(*args, **kwargs)


class JobdeskItem(models.Model):
    """Satu baris tugas/jobdesk yang ditampilkan sebagai list di halaman detail divisi."""

    divisi = models.ForeignKey(
        Divisi,
        related_name="jobdesk_items",
        on_delete=models.CASCADE,
    )
    teks = models.CharField(max_length=255)
    urutan = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["urutan", "id"]
        verbose_name = "Item Jobdesk"
        verbose_name_plural = "Item Jobdesk"

    def __str__(self):
        return f"{self.divisi.label} - {self.teks[:40]}"
