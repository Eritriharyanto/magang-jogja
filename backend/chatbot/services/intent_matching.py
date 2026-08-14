"""Guard berbasis keyword yang dicek SEBELUM pesan user dikirim ke Ollama.
Kalau ada yang cocok (sapaan atau intent/FAQ), langsung jawab dari sini --
lebih cepat, lebih konsisten, dan gratis (tidak perlu panggil LLM).
Setara intent_matching.py di referensi."""

import re

from chatbot.models import Intent

GREETING_KEYWORDS = [
    "halo", "hai", "hi", "hei", "assalamualaikum",
    "selamat pagi", "selamat siang", "selamat sore", "selamat malam",
]

GREETING_REPLY = (
    "Halo! \U0001F44B Selamat datang di magangjogja.com. Aku siap bantu jawab "
    "pertanyaan seputar magang, syarat pendaftaran, posisi yang tersedia, "
    "sampai fasilitas yang bisa kamu dapat. Mau tanya apa dulu nih?"
)


def _normalize(text):
    return re.sub(r"\s+", " ", text.strip().lower())


def match_greeting(message):
    normalized = _normalize(message)
    for g in GREETING_KEYWORDS:
        if normalized == g or normalized.startswith(g + " ") or normalized.startswith(g + ","):
            return GREETING_REPLY
    return None


def match_intent(message):
    """Cari Intent aktif yang salah satu keyword-nya muncul sebagai substring
    di pesan user. Queryset sudah terurut -prioritas (lihat Meta.ordering di
    model), jadi intent match pertama yang ditemukan otomatis yang paling
    prioritas."""

    normalized = _normalize(message)
    for intent in Intent.objects.filter(aktif=True):
        for keyword in intent.keyword_list():
            if keyword and keyword in normalized:
                return intent.jawaban
    return None


def get_static_reply(message):
    """Guard utama. Return None kalau tidak ada yang cocok sama sekali --
    berarti baru boleh lanjut ke Ollama."""

    greeting_reply = match_greeting(message)
    if greeting_reply:
        return greeting_reply

    return match_intent(message)
