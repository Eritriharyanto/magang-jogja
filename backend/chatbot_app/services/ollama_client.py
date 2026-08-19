"""Setara dengan chatbot/services/ollama_client.py di versi Flask.

Manggil Ollama lewat REST API-nya (bukan library ollama-python), supaya
dependency tetap minim -- cukup `requests` yang sudah pasti ada di semua
project Django/DRF.
"""
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

FALLBACK_MESSAGE = (
    "Maaf, sistem AI kami sedang tidak bisa dihubungi. "
    "Silakan coba lagi sebentar lagi, atau hubungi admin langsung di 0895 2900 2944."
)


def ask_ollama(system_prompt: str, pesan_user: str, riwayat: list[dict] | None = None) -> str:
    """Kirim pertanyaan ke Ollama, dengan system prompt (persona + knowledge
    base) dan riwayat chat sebelumnya (biar ada konteks percakapan).

    riwayat format: [{"role": "user"/"assistant", "content": "..."}, ...]

    Return teks jawaban. Kalau Ollama tidak bisa dihubungi / error / model
    belum di-pull, return FALLBACK_MESSAGE supaya user tetap dapat respons
    yang masuk akal, bukan error mentah atau chat yang macet.
    """
    messages = [{"role": "system", "content": system_prompt}]
    if riwayat:
        messages.extend(riwayat)
    messages.append({"role": "user", "content": pesan_user})

    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {
                    "num_predict": settings.OLLAMA_NUM_PREDICT,
                    "temperature": settings.OLLAMA_TEMPERATURE,
                },
            },
            timeout=settings.OLLAMA_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("message", {}).get("content", "").strip() or FALLBACK_MESSAGE
    except requests.exceptions.ConnectionError:
        logger.warning("Tidak bisa terhubung ke Ollama di %s", settings.OLLAMA_BASE_URL)
        return FALLBACK_MESSAGE
    except requests.exceptions.Timeout:
        logger.warning("Ollama timeout setelah %ss", settings.OLLAMA_TIMEOUT)
        return FALLBACK_MESSAGE
    except requests.exceptions.RequestException as exc:
        logger.exception("Error tak terduga saat memanggil Ollama: %s", exc)
        return FALLBACK_MESSAGE
