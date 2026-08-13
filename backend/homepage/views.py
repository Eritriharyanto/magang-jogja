from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import HeroContent, KontakContent, SyaratItem, FasilitasItem
from .serializers import (
    HeroContentSerializer,
    KontakContentSerializer,
    SyaratItemSerializer,
    FasilitasItemSerializer,
)


class HeroContentView(APIView):
    """
    GET  /api/homepage/hero/   -> ambil konten hero (public)
    PUT  /api/homepage/hero/   -> update konten hero (butuh login)
    """

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        obj = HeroContent.get_solo()
        return Response(HeroContentSerializer(obj).data)

    def put(self, request):
        obj = HeroContent.get_solo()
        serializer = HeroContentSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class KontakContentView(APIView):
    """
    GET  /api/homepage/kontak/   -> ambil info kontak (public)
    PUT  /api/homepage/kontak/   -> update info kontak (butuh login)
    """

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        obj = KontakContent.get_solo()
        return Response(KontakContentSerializer(obj).data)

    def put(self, request):
        obj = KontakContent.get_solo()
        serializer = KontakContentSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SyaratItemViewSet(viewsets.ModelViewSet):
    """/api/homepage/syarat/ -- list public, tambah/edit/hapus butuh login."""

    serializer_class = SyaratItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = SyaratItem.objects.all()
        if not self.request.user.is_authenticated:
            qs = qs.filter(aktif=True)
        return qs


class FasilitasItemViewSet(viewsets.ModelViewSet):
    """/api/homepage/fasilitas/ -- list public, tambah/edit/hapus butuh login."""

    serializer_class = FasilitasItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = FasilitasItem.objects.all()
        if not self.request.user.is_authenticated:
            qs = qs.filter(aktif=True)
        return qs
