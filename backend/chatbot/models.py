from django.db import models


class KnowledgeEntry(models.Model):
    """Fakta tambahan seputar magangjogja yang belum tercakup di model lain
    (Divisi, SyaratItem, FasilitasItem, dst) -- misal jam operasional, durasi
    magang, kebijakan pembatalan, dll. Ini yang disuapkan ke Ollama sebagai
    konteks tambahan (setara knowledge_base.json di referensi)."""

    judul = models.CharField(
        max_length=150,
        help_text="Misal 'Jam Operasional', 'Durasi Magang', 'Cara Daftar'.",
    )
    isi = models.TextField(
        help_text="Isi informasi, tulis dengan natural -- ini akan dibaca AI sebagai konteks jawaban.",
    )
    urutan = models.PositiveIntegerField(default=0)
    aktif = models.BooleanField(default=True)

    class Meta:
        ordering = ["urutan", "id"]
        verbose_name = "Info Tambahan Chatbot"
        verbose_name_plural = "Info Tambahan Chatbot"

    def __str__(self):
        return self.judul


class Intent(models.Model):
    """Satu entri FAQ statis: kalau pesan user mengandung salah satu keyword
    di sini, chatbot LANGSUNG jawab pakai `jawaban` -- tanpa panggil Ollama
    sama sekali. Lebih cepat, konsisten, dan gratis (setara intents.json +
    guard di intent_matching.py pada referensi)."""

    nama = models.CharField(
        max_length=100,
        help_text="Nama internal buat memudahkan cari di admin, misal 'syarat_magang'.",
    )
    keywords = models.TextField(
        help_text="Kata kunci pemicu, pisahkan dengan koma. Contoh: syarat, ketentuan, persyaratan daftar",
    )
    jawaban = models.TextField(help_text="Jawaban yang langsung dikirim kalau salah satu keyword cocok.")
    prioritas = models.PositiveIntegerField(
        default=0,
        help_text="Kalau pesan user cocok beberapa intent sekaligus, yang angkanya lebih besar dipakai duluan.",
    )
    aktif = models.BooleanField(default=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    diubah_pada = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-prioritas", "nama"]
        verbose_name = "Intent / FAQ Chatbot"
        verbose_name_plural = "Intent / FAQ Chatbot"

    def __str__(self):
        return self.nama

    def keyword_list(self):
        return [k.strip().lower() for k in self.keywords.split(",") if k.strip()]


class Visitor(models.Model):
    """Identitas pengunjung yang mulai chat. Sama seperti referensi: wajib
    isi nama & nomor telepon dulu sebelum bisa kirim pesan. Nomor telepon
    dibuat unique supaya kalau orang yang sama chat lagi lain waktu,
    riwayatnya otomatis nyambung ke identitas yang sama, bukan bikin baru."""

    nama = models.CharField(max_length=100)
    no_telepon = models.CharField(max_length=30, unique=True, db_index=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    terakhir_aktif = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-terakhir_aktif"]
        verbose_name = "Pengunjung Chat"
        verbose_name_plural = "Pengunjung Chat"

    def __str__(self):
        return f"{self.nama} ({self.no_telepon})"


class ChatMessage(models.Model):
    PENGIRIM_CHOICES = [("user", "User"), ("bot", "Bot")]
    SUMBER_CHOICES = [
        ("static", "Static / Intent"),
        ("ollama", "Ollama"),
        ("system", "System"),
    ]

    visitor = models.ForeignKey(Visitor, related_name="messages", on_delete=models.CASCADE)
    pengirim = models.CharField(max_length=10, choices=PENGIRIM_CHOICES)
    sumber = models.CharField(max_length=10, choices=SUMBER_CHOICES, default="system")
    pesan = models.TextField()
    dibuat_pada = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["dibuat_pada"]
        verbose_name = "Pesan Chat"
        verbose_name_plural = "Riwayat Chat"

    def __str__(self):
        return f"[{self.pengirim}] {self.pesan[:40]}"
