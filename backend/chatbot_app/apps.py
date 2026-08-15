from django.apps import AppConfig


class ChatbotAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "chatbot_app"
    verbose_name = "Chatbot"

    def ready(self):
        from django.db.models.signals import post_save, post_delete
        from .models import Intent
        from .services.nlu import invalidate_cache

        post_save.connect(lambda **kwargs: invalidate_cache(), sender=Intent)
        post_delete.connect(lambda **kwargs: invalidate_cache(), sender=Intent)
