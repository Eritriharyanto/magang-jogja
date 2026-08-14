from django.contrib import admin
from .models import KnowledgeEntry, Intent, Visitor, ChatMessage


@admin.register(KnowledgeEntry)
class KnowledgeEntryAdmin(admin.ModelAdmin):
    list_display = ["judul", "urutan", "aktif"]
    list_editable = ["urutan", "aktif"]
    search_fields = ["judul", "isi"]


@admin.register(Intent)
class IntentAdmin(admin.ModelAdmin):
    list_display = ["nama", "keywords", "prioritas", "aktif"]
    list_editable = ["prioritas", "aktif"]
    search_fields = ["nama", "keywords", "jawaban"]
    list_filter = ["aktif"]


class ChatMessageInline(admin.TabularInline):
    """Transkrip percakapan ditampilkan langsung di halaman detail
    Visitor -- jadi admin bisa lihat riwayat lengkap 1 orang tanpa pindah
    halaman. Read-only karena ini catatan riwayat, bukan data yang diedit."""

    model = ChatMessage
    extra = 0
    fields = ["pengirim", "sumber", "pesan", "dibuat_pada"]
    readonly_fields = ["pengirim", "sumber", "pesan", "dibuat_pada"]
    ordering = ["dibuat_pada"]
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ["nama", "no_telepon", "jumlah_pesan", "terakhir_aktif", "dibuat_pada"]
    search_fields = ["nama", "no_telepon"]
    readonly_fields = ["dibuat_pada", "terakhir_aktif"]
    inlines = [ChatMessageInline]
    ordering = ["-terakhir_aktif"]

    def jumlah_pesan(self, obj):
        return obj.messages.count()

    jumlah_pesan.short_description = "Jumlah Pesan"
