from rest_framework import viewsets, permissions
from .models import Divisi
from .serializers import DivisiListSerializer, DivisiDetailSerializer


class DivisiViewSet(viewsets.ModelViewSet):
    """
    /api/divisi/            -> list semua divisi aktif (public)
    /api/divisi/<slug>/     -> detail 1 divisi (public)

    POST/PUT/PATCH/DELETE butuh login (dipakai admin dashboard nanti).
    """

    queryset = Divisi.objects.all()
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Divisi.objects.all()
        # Pengunjung publik (belum login) cuma boleh lihat yang aktif.
        if not self.request.user.is_authenticated:
            qs = qs.filter(aktif=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return DivisiListSerializer
        return DivisiDetailSerializer

    def get_serializer_context(self):
        return {"request": self.request}
