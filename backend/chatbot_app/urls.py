from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import VisitorRegisterView, ChatView, IntentViewSet, KnowledgeEntryViewSet, ChatHistoryViewSet

router = DefaultRouter()
router.register("intents", IntentViewSet, basename="intent")
router.register("knowledge", KnowledgeEntryViewSet, basename="knowledge")
router.register("riwayat", ChatHistoryViewSet, basename="chat-history")

urlpatterns = [
    path("visitor/", VisitorRegisterView.as_view(), name="chat-visitor"),
    path("chat/", ChatView.as_view(), name="chat-send"),
] + router.urls
