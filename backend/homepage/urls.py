from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import HeroContentView, KontakContentView, SyaratItemViewSet, FasilitasItemViewSet

router = DefaultRouter()
router.register("syarat", SyaratItemViewSet, basename="syarat")
router.register("fasilitas", FasilitasItemViewSet, basename="fasilitas")

urlpatterns = [
    path("hero/", HeroContentView.as_view(), name="hero-content"),
    path("kontak/", KontakContentView.as_view(), name="kontak-content"),
] + router.urls
