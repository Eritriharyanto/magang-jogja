from rest_framework import serializers
from .models import Divisi, JobdeskItem


class JobdeskItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobdeskItem
        fields = ["id", "teks", "urutan"]


class DivisiListSerializer(serializers.ModelSerializer):
    """Dipakai untuk list ringkas di section Posisi Magang (homepage)."""

    icon = serializers.SerializerMethodField()

    class Meta:
        model = Divisi
        fields = ["id", "slug", "label", "sub_label", "icon", "urutan"]

    def get_icon(self, obj):
        request = self.context.get("request")
        if obj.icon and hasattr(obj.icon, "url"):
            url = obj.icon.url
            return request.build_absolute_uri(url) if request else url
        return None


class DivisiDetailSerializer(serializers.ModelSerializer):
    """Dipakai untuk halaman detail 1 divisi -- termasuk jobdesk & gform link."""

    icon = serializers.SerializerMethodField()
    jobdesk = JobdeskItemSerializer(source="jobdesk_items", many=True, read_only=True)

    class Meta:
        model = Divisi
        fields = [
            "id",
            "slug",
            "label",
            "sub_label",
            "icon",
            "deskripsi",
            "jobdesk",
            "gform_link",
        ]

    def get_icon(self, obj):
        request = self.context.get("request")
        if obj.icon and hasattr(obj.icon, "url"):
            url = obj.icon.url
            return request.build_absolute_uri(url) if request else url
        return None
