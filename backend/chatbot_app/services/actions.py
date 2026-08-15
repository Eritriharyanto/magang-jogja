"""Nentuin elemen interaktif tambahan (tombol WA / tombol Maps) yang perlu
ditempel di bawah jawaban bot, tergantung intent mana yang match.

Nomor telepon & alamat DIAMBIL dari homepage.models.KontakContent -- bukan
di-hardcode di sini -- supaya kalau admin update nomor/alamat lewat
Django Admin, tombol chat juga otomatis ikut berubah, konsisten dengan
info yang tampil di footer website.
"""
from urllib.parse import quote_plus

# nama intent -> jenis aksi. Intent lain otomatis tidak dapat tombol apa-apa.
ACTION_MAP = {
    "tanya_kontak_admin": "kontak",
    "tanya_cara_daftar": "kontak",
    "tanya_lokasi_magang": "lokasi",
}


def _clean_phone_for_wa(nomor: str) -> str:
    """'0895 2900 2944' -> '6289529002944' (format yang dipakai wa.me)."""
    digits = "".join(ch for ch in nomor if ch.isdigit())
    if digits.startswith("0"):
        digits = "62" + digits[1:]
    return digits


def build_chat_action(intent) -> dict | None:
    """Return dict {"type", "label", "url"} kalau intent yang match butuh
    tombol tambahan, atau None kalau tidak ada."""
    if intent is None:
        return None

    action_type = ACTION_MAP.get(intent.nama)
    if action_type is None:
        return None

    # Import di dalam fungsi (bukan di top-level) supaya chatbot_app tidak
    # hard-dependency ke homepage app saat modul ini di-import lebih awal.
    from homepage.models import KontakContent
    kontak = KontakContent.get_solo()

    if action_type == "kontak":
        wa_number = _clean_phone_for_wa(kontak.nomor_telepon)
        return {
            "type": "kontak",
            "label": "Chat Admin via WhatsApp",
            "url": f"https://wa.me/{wa_number}",
        }

    if action_type == "lokasi":
        return {
            "type": "lokasi",
            "label": "Buka di Google Maps",
            "url": f"https://www.google.com/maps/search/?api=1&query={quote_plus(kontak.alamat)}",
        }

    return None
