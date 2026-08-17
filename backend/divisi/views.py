from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Divisi
from .serializers import DivisiListSerializer, DivisiDetailSerializer, DivisiWriteSerializer


class DivisiViewSet(viewsets.ModelViewSet):
    """
    /api/divisi/            -> list semua divisi aktif (public GET)
    /api/divisi/<slug>/     -> detail 1 divisi (public GET)

    POST/PUT/PATCH/DELETE butuh login (dipakai admin dashboard). Menerima
    multipart/form-data supaya bisa sekalian upload file icon.
    """

    queryset = Divisi.objects.all()
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Divisi.objects.all()
        # Pengunjung publik (belum login) cuma boleh lihat yang aktif.
        if not self.request.user.is_authenticated:
            qs = qs.filter(aktif=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return DivisiListSerializer
        if self.action in ("create", "update", "partial_update"):
            return DivisiWriteSerializer
        return DivisiDetailSerializer

    def get_serializer_context(self):
        return {"request": self.request}
