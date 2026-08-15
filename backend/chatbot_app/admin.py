from django.contrib import admin
from .models import Intent, KnowledgeEntry, ChatVisitor, ChatMessage


@admin.register(Intent)
class IntentAdmin(admin.ModelAdmin):
    list_display = ["nama", "kategori", "jumlah_contoh", "keywords_preview", "urutan", "aktif"]
    list_editable = ["urutan", "aktif"]
    list_filter = ["aktif"]
    search_fields = ["nama", "kategori", "jawaban"]

    def jumlah_contoh(self, obj):
        return len(obj.contoh_pertanyaan or [])
    jumlah_contoh.short_description = "Jumlah Contoh Kalimat"

    def keywords_preview(self, obj):
        return ", ".join(obj.keywords[:5]) if obj.keywords else "-"
    keywords_preview.short_description = "Keywords"


@admin.register(KnowledgeEntry)
class KnowledgeEntryAdmin(admin.ModelAdmin):
    list_display = ["judul", "urutan", "aktif", "diubah_pada"]
    list_editable = ["urutan", "aktif"]
    list_filter = ["aktif"]
    search_fields = ["judul", "konten"]


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ["pengirim", "pesan", "sumber", "dibuat_pada"]
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChatVisitor)
class ChatVisitorAdmin(admin.ModelAdmin):
    list_display = ["nama", "no_telepon", "jumlah_pesan", "dibuat_pada", "terakhir_aktif"]
    search_fields = ["nama", "no_telepon"]
    readonly_fields = ["id", "dibuat_pada", "terakhir_aktif"]
    inlines = [ChatMessageInline]

    def jumlah_pesan(self, obj):
        return obj.messages.count()
    jumlah_pesan.short_description = "Jumlah Pesan"
