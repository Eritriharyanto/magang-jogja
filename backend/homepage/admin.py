from django.contrib import admin
from django.utils.html import format_html
from .models import HeroContent, KontakContent, SyaratItem, FasilitasItem


class SingletonAdmin(admin.ModelAdmin):
    """Base admin buat model singleton -- sembunyikan tombol 'Tambah' dan 'Hapus',
    supaya admin cuma bisa edit satu-satunya baris data yang ada."""

    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HeroContent)
class HeroContentAdmin(SingletonAdmin):
    list_display = ["judul_baris1", "judul_baris2", "diubah_pada"]


@admin.register(KontakContent)
class KontakContentAdmin(SingletonAdmin):
    list_display = ["nomor_telepon", "diubah_pada"]


@admin.register(SyaratItem)
class SyaratItemAdmin(admin.ModelAdmin):
    list_display = ["teks_singkat", "urutan", "aktif"]
    list_editable = ["urutan", "aktif"]
    list_filter = ["aktif"]

    def teks_singkat(self, obj):
        return format_html(obj.teks[:80] + ("..." if len(obj.teks) > 80 else ""))
    teks_singkat.short_description = "Teks"


@admin.register(FasilitasItem)
class FasilitasItemAdmin(admin.ModelAdmin):
    list_display = ["teks_singkat", "urutan", "aktif"]
    list_editable = ["urutan", "aktif"]
    list_filter = ["aktif"]

    def teks_singkat(self, obj):
        return format_html(obj.teks[:80] + ("..." if len(obj.teks) > 80 else ""))
    teks_singkat.short_description = "Teks"
