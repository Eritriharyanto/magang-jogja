from rest_framework import serializers
from .models import HeroContent, KontakContent, SyaratItem, FasilitasItem


class HeroContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroContent
        fields = ["judul_baris1", "judul_baris2", "subjudul", "deskripsi"]


class KontakContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KontakContent
        fields = ["nomor_telepon", "alamat"]


class SyaratItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyaratItem
        fields = ["id", "teks", "urutan"]


class FasilitasItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FasilitasItem
        fields = ["id", "teks", "urutan"]
