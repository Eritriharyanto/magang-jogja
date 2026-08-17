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
        fields = ["id", "slug", "label", "sub_label", "icon", "urutan", "aktif"]

    def get_icon(self, obj):
        request = self.context.get("request")
        if obj.icon and hasattr(obj.icon, "url"):
            url = obj.icon.url
            return request.build_absolute_uri(url) if request else url
        return None


class DivisiDetailSerializer(serializers.ModelSerializer):
    """Dipakai untuk halaman detail 1 divisi (publik) -- termasuk jobdesk & gform link."""

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


class DivisiWriteSerializer(serializers.ModelSerializer):
    """Dipakai admin dashboard buat create/update divisi (butuh login).

    `jobdesk` diterima sebagai list string biasa (bukan list object) --
    lebih gampang dipakai form React (cuma array teks). Tiap kali disimpan,
    seluruh JobdeskItem lama punya divisi ini dihapus & diganti baru sesuai
    urutan list yang dikirim -- lebih sederhana daripada diff per-item, dan
    cukup buat kebutuhan form (jumlah jobdesk per divisi kecil, <20 baris).
    """

    jobdesk = serializers.ListField(
        child=serializers.CharField(allow_blank=False),
        required=False,
        default=list,
        write_only=True,
    )
    icon = serializers.ImageField(required=False, allow_null=True)

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
            "urutan",
            "aktif",
        ]
        extra_kwargs = {"slug": {"required": False}}

    def create(self, validated_data):
        jobdesk_list = validated_data.pop("jobdesk", [])
        divisi = Divisi.objects.create(**validated_data)
        self._sync_jobdesk(divisi, jobdesk_list)
        return divisi

    def update(self, instance, validated_data):
        jobdesk_list = validated_data.pop("jobdesk", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if jobdesk_list is not None:
            self._sync_jobdesk(instance, jobdesk_list)
        return instance

    def _sync_jobdesk(self, divisi, jobdesk_list):
        divisi.jobdesk_items.all().delete()
        JobdeskItem.objects.bulk_create(
            [
                JobdeskItem(divisi=divisi, teks=teks, urutan=i)
                for i, teks in enumerate(jobdesk_list)
                if teks.strip()
            ]
        )

    def to_representation(self, instance):
        # Setelah save, balikin bentuk yang sama kayak DivisiDetailSerializer
        # (termasuk jobdesk & icon URL lengkap) supaya frontend admin
        # langsung dapat data terbaru tanpa perlu request ulang.
        return DivisiDetailSerializer(instance, context=self.context).data
