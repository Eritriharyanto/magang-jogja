"""Kirim pesan ke Ollama dan stream balasannya token demi token.
Setara ollama_client.py di referensi, tapi pakai `requests` (bukan library
resmi ollama-python) supaya dependency tetap minim."""

import json
import requests
from django.conf import settings


def stream_ollama_reply(message, system_prompt, history=None):
    """Generator -- yield potongan teks balasan begitu diterima dari Ollama.

    history: list optional [{"role": "user"|"assistant", "content": "..."}]
    dari percakapan sebelumnya, dipakai supaya AI "ingat" konteks chat.
    """

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": message})

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": True,
    }

    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json=payload,
            stream=True,
            timeout=120,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException:
        yield (
            "Maaf, chatbot AI sedang tidak bisa dihubungi. Coba lagi sebentar "
            "lagi, atau hubungi kami langsung lewat kontak yang ada di halaman "
            "utama."
        )
        return

    for line in response.iter_lines():
        if not line:
            continue
        try:
            chunk = json.loads(line)
        except json.JSONDecodeError:
            continue

        content = chunk.get("message", {}).get("content", "")
        if content:
            yield content

        if chunk.get("done"):
            break
