from rest_framework.routers import DefaultRouter
from .views import DivisiViewSet

router = DefaultRouter()
router.register("divisi", DivisiViewSet, basename="divisi")

urlpatterns = router.urls
