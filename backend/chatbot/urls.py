from django.urls import path
from .views import VisitorRegisterView, ChatView

urlpatterns = [
    path("visitor/", VisitorRegisterView.as_view(), name="chatbot-visitor"),
    path("chat/", ChatView.as_view(), name="chatbot-chat"),
]
