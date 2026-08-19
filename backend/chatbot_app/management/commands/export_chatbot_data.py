"""
Kebalikan dari import_chatbot_data -- tarik data TERBARU dari database
(hasil edit lewat dashboard admin/Django Admin) balik jadi file JSON.

Berguna buat backup berkala, atau lihat isi data dalam bentuk file
sebelum deploy. Ini SENGAJA dijalankan manual (bukan otomatis tiap ada
perubahan), lihat penjelasan lengkapnya di percakapan sebelumnya --
intinya auto-sync tiap detik berisiko race condition & gak semua hosting
punya filesystem permanen, sedangkan command manual ini aman dijalankan
kapan saja tanpa risiko itu.

Cara pakai:
    python manage.py export_chatbot_data
    python manage.py export_chatbot_data --intents chatbot_data/intents_export.json --knowledge chatbot_data/knowledge_base_export.json

Kalau --intents / --knowledge tidak diisi, defaultnya nulis ke
chatbot_data/intents_export.json dan chatbot_data/knowledge_base_export.json
-- SENGAJA dikasih akhiran "_export" biar TIDAK menimpa file arsip asli
kamu (chatbot_data/intents.json & knowledge_base.json, hasil upload
pertama kali). Kalau kamu memang mau menimpa arsip asli itu, isi manual
lewat --intents/--knowledge dengan nama file yang sama.

PENTING soal format:
- intents.json hasil export ini formatnya SAMA PERSIS dengan file asli
  yang kamu upload dulu (bisa langsung dipakai lagi buat import ulang).
- knowledge_base.json TIDAK bisa direkonstruksi 100% sama seperti file
  asli (yang punya struktur bersarang informasi_program/posisi_magang),
  karena saat import dulu semua value diratakan jadi teks biasa -- proses
  itu tidak bisa dibalik. File hasil export ini formatnya flat list
  {"knowledge_base": [{"judul", "konten", "urutan", "aktif"}, ...]} --
  tetap lengkap datanya, cuma strukturnya beda dari file input aslinya.
"""
import json
import os
import tempfile

from django.core.management.base import BaseCommand
from chatbot_app.models import Intent, KnowledgeEntry

DEFAULT_INTENTS_PATH = "chatbot_data/intents_export.json"
DEFAULT_KNOWLEDGE_PATH = "chatbot_data/knowledge_base_export.json"


def _atomic_write_json(path: str, data: dict):
    """Tulis JSON dengan aman: tulis dulu ke file sementara di folder yang
    sama, baru di-'rename' menimpa file asli. Kalau proses keganggu
    (crash/mati listrik) di tengah jalan, file asli TETAP UTUH (belum
    ketiban tulisan yang setengah jadi) -- beda dengan tulis langsung ke
    file asli yang berisiko ninggalin file korup/kepotong."""
    folder = os.path.dirname(path) or "."
    os.makedirs(folder, exist_ok=True)

    fd, tmp_path = tempfile.mkstemp(dir=folder, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(tmp_path, path)  # atomic di hampir semua OS (Linux/Mac/Windows modern)
    except Exception:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise


class Command(BaseCommand):
    help = "Export data Intent & KnowledgeEntry dari database ke file JSON (kebalikan import_chatbot_data)."

    def add_arguments(self, parser):
        parser.add_argument("--intents", type=str, default=DEFAULT_INTENTS_PATH)
        parser.add_argument("--knowledge", type=str, default=DEFAULT_KNOWLEDGE_PATH)
        parser.add_argument(
            "--only",
            choices=["intents", "knowledge"],
            help="Export salah satu saja. Kosongkan untuk export keduanya.",
        )

    def handle(self, *args, **options):
        if options["only"] in (None, "intents"):
            self.export_intents(options["intents"])
        if options["only"] in (None, "knowledge"):
            self.export_knowledge(options["knowledge"])

    def export_intents(self, path):
        intents = Intent.objects.all().order_by("urutan", "id")
        payload = {
            "intents": [
                {
                    "intent": i.nama,
                    "contoh_pertanyaan": i.contoh_pertanyaan,
                    "context_set": i.kategori,
                    "jawaban_default": i.jawaban,
                    "keywords": i.keywords,
                }
                for i in intents
            ]
        }
        _atomic_write_json(path, payload)
        self.stdout.write(self.style.SUCCESS(f"Export {intents.count()} intent -> {path}"))

    def export_knowledge(self, path):
        entries = KnowledgeEntry.objects.all().order_by("urutan", "id")
        payload = {
            "knowledge_base": [
                {
                    "judul": e.judul,
                    "konten": e.konten,
                    "urutan": e.urutan,
                    "aktif": e.aktif,
                }
                for e in entries
            ]
        }
        _atomic_write_json(path, payload)
        self.stdout.write(self.style.SUCCESS(f"Export {entries.count()} knowledge entry -> {path}"))
        self.stdout.write(
            self.style.WARNING(
                "Catatan: struktur file ini flat list, BUKAN rekonstruksi persis "
                "format informasi_program/posisi_magang di file aslinya (lihat "
                "docstring command ini untuk penjelasan lengkap)."
            )
        )
