from rest_framework import serializers
from .models import Intent, KnowledgeEntry, ChatVisitor, ChatMessage


class IntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intent
        fields = ["id", "nama", "kategori", "contoh_pertanyaan", "keywords", "jawaban", "urutan", "aktif"]


class KnowledgeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeEntry
        fields = ["id", "judul", "konten", "urutan", "aktif"]


class ChatVisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatVisitor
        fields = ["id", "nama", "no_telepon"]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "pengirim", "pesan", "sumber", "dibuat_pada"]


class ChatVisitorWithHistorySerializer(serializers.ModelSerializer):
    """Dipakai admin buat lihat rekap: 1 visitor + semua pesannya."""

    messages = ChatMessageSerializer(many=True, read_only=True)
    jumlah_pesan = serializers.SerializerMethodField()

    class Meta:
        model = ChatVisitor
        fields = ["id", "nama", "no_telepon", "dibuat_pada", "terakhir_aktif", "jumlah_pesan", "messages"]

    def get_jumlah_pesan(self, obj):
        return obj.messages.count()
