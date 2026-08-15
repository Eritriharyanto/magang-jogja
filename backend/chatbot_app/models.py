import uuid
from django.db import models


class Intent(models.Model):
    """Jawaban statis. Dicocokkan ke pesan user lewat 2 lapis:
    1. `keywords` -- exact substring match cepat (kalau diisi).
    2. `contoh_pertanyaan` -- kumpulan contoh kalimat, dicocokkan pakai
       kemiripan teks (TF-IDF). Ini yang utama, karena kebanyakan intent
       aslinya dikenali dari variasi kalimat, bukan 1-2 keyword pendek."""

    nama = models.SlugField(
        max_length=100,
        blank=True,
        help_text="ID unik intent, misal 'tanya_syarat_pendaftaran'. Kosongkan untuk auto dari kategori.",
    )
    kategori = models.CharField(
        max_length=150,
        blank=True,
        help_text="Pengelompokan/context, misal 'informasi_program.syarat_pendaftaran'. Bebas, cuma buat rapi di admin.",
    )
    contoh_pertanyaan = models.JSONField(
        default=list,
        blank=True,
        help_text='List contoh kalimat yang mewakili intent ini, format list JSON. Makin banyak & variatif, makin akurat pencocokannya.',
    )
    keywords = models.JSONField(
        default=list,
        blank=True,
        help_text='(Opsional) Daftar kata kunci untuk pencocokan cepat/pasti, format list JSON. Boleh dikosongkan.',
    )
    jawaban = models.TextField(
        help_text="Jawaban yang dikirim kalau intent ini yang paling cocok dengan pesan user.",
    )
    urutan = models.PositiveIntegerField(
        default=0,
        help_text="Kalau ada beberapa intent dengan skor kemiripan setara, yang urutannya lebih kecil menang.",
    )
    aktif = models.BooleanField(default=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    diubah_pada = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["urutan", "id"]
        verbose_name = "Intent (Jawaban Statis)"
        verbose_name_plural = "Intent (Jawaban Statis)"

    def __str__(self):
        return self.nama or self.kategori or f"Intent #{self.pk}"


class KnowledgeEntry(models.Model):
    """Satu potong pengetahuan tentang magangjogja (mis. 'Jam operasional',
    'Cara daftar', 'Lokasi kantor'). Semua entry yang aktif digabung jadi
    system prompt yang disuapkan ke Ollama, supaya jawabannya berdasarkan
    data asli, bukan karangan model (setara knowledge_base.json)."""

    judul = models.CharField(max_length=150)
    konten = models.TextField(
        help_text="Isi pengetahuan dalam bahasa natural. Ini yang dibaca Ollama sebagai konteks.",
    )
    urutan = models.PositiveIntegerField(default=0)
    aktif = models.BooleanField(default=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    diubah_pada = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["urutan", "id"]
        verbose_name = "Knowledge Base"
        verbose_name_plural = "Knowledge Base"

    def __str__(self):
        return self.judul


class ChatVisitor(models.Model):
    """Identitas pengunjung chat (gerbang nama + no. telepon sebelum boleh
    chat, sama seperti versi Flask). Dikenali kembali lewat no_telepon,
    supaya visitor yang sama tidak dianggap orang baru tiap kunjungan."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama = models.CharField(max_length=100)
    no_telepon = models.CharField(max_length=30, unique=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    terakhir_aktif = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-terakhir_aktif"]
        verbose_name = "Pengunjung Chat"
        verbose_name_plural = "Pengunjung Chat"

    def __str__(self):
        return f"{self.nama} ({self.no_telepon})"


class ChatMessage(models.Model):
    """Satu baris pesan (dari user ATAU dari bot) di riwayat chat 1 visitor."""

    PENGIRIM_CHOICES = [("user", "User"), ("bot", "Bot")]
    SUMBER_CHOICES = [
        ("static", "Intent Statis"),
        ("ollama", "Ollama (AI)"),
        ("guard", "Ditolak (Di Luar Topik)"),
        ("system", "Pesan Sistem"),
    ]

    visitor = models.ForeignKey(ChatVisitor, related_name="messages", on_delete=models.CASCADE)
    pengirim = models.CharField(max_length=10, choices=PENGIRIM_CHOICES)
    pesan = models.TextField()
    sumber = models.CharField(
        max_length=10, choices=SUMBER_CHOICES, blank=True,
        help_text="Cuma relevan buat pesan dari bot: dijawab pakai intent statis atau Ollama.",
    )
    dibuat_pada = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["dibuat_pada"]
        verbose_name = "Pesan Chat"
        verbose_name_plural = "Riwayat Chat"

    def __str__(self):
        return f"[{self.pengirim}] {self.pesan[:50]}"
