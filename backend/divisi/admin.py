from django.contrib import admin
from .models import Divisi, JobdeskItem


class JobdeskItemInline(admin.TabularInline):
    model = JobdeskItem
    extra = 1
    fields = ["teks", "urutan"]


@admin.register(Divisi)
class DivisiAdmin(admin.ModelAdmin):
    list_display = ["label", "sub_label", "slug", "aktif", "urutan"]
    list_editable = ["aktif", "urutan"]
    list_filter = ["aktif"]
    search_fields = ["label", "deskripsi"]
    prepopulated_fields = {"slug": ("label",)}
    inlines = [JobdeskItemInline]
    fieldsets = (
        ("Info Utama", {
            "fields": ("label", "sub_label", "slug", "icon", "aktif", "urutan"),
        }),
        ("Detail Halaman", {
            "fields": ("deskripsi", "gform_link"),
        }),
    )
