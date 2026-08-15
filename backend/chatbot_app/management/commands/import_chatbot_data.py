"""
Import intents.json & knowledge_base.json (format asli punya magangjogja)
ke database.

Format intents.json yang didukung -- persis struktur file kamu:
{
  "intents": [
    {
      "intent": "tanya_syarat_pendaftaran",
      "contoh_pertanyaan": ["...", "...", ...],
      "context_set": "informasi_program.syarat_pendaftaran",
      "jawaban_default": "...",
      "keywords": []
    },
    ...
  ]
}

Format knowledge_base.json yang didukung -- persis struktur file kamu:
{
  "informasi_program": {
     "nama_program": "...", "durasi_magang": {...}, "fasilitas": [...], ...
     -- semua value (str/list/dict/bool) diratakan otomatis jadi teks yang
     enak dibaca Ollama.
  },
  "posisi_magang": [
     {"nama_posisi": "...", "deskripsi": "...", "jobdesk": [...], "skill_dibutuhkan": [...]},
     ...
  ]
}

Cara pakai:
    python manage.py import_chatbot_data --intents intents.json --knowledge knowledge_base.json --replace
"""
import json

from django.core.management.base import BaseCommand, CommandError
from chatbot_app.models import Intent, KnowledgeEntry


def _humanize_key(key: str) -> str:
    return key.replace("_", " ").strip().capitalize()


def _flatten_value(value, level=0) -> str:
    """Ubah value JSON apapun (str/bool/list/dict) jadi teks Bahasa
    Indonesia yang enak dibaca, buat disuapkan ke Ollama sebagai konteks."""
    if isinstance(value, bool):
        return "Ya" if value else "Tidak"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(f"- {_flatten_value(v, level + 1)}" for v in value)
    if isinstance(value, dict):
        lines = []
        for k, v in value.items():
            label = _humanize_key(k)
            flat = _flatten_value(v, level + 1)
            if "\n" in flat:
                lines.append(f"{label}:\n{flat}")
            else:
                lines.append(f"{label}: {flat}")
        return "\n".join(lines)
    return str(value)


class Command(BaseCommand):
    help = "Import intents.json dan/atau knowledge_base.json (format magangjogja) ke database."

    def add_arguments(self, parser):
        parser.add_argument("--intents", type=str, help="Path ke file intents.json")
        parser.add_argument("--knowledge", type=str, help="Path ke file knowledge_base.json")
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Hapus semua data lama sebelum import.",
        )

    def handle(self, *args, **options):
        if not options["intents"] and not options["knowledge"]:
            raise CommandError("Isi minimal salah satu dari --intents atau --knowledge.")

        if options["intents"]:
            self.import_intents(options["intents"], options["replace"])

        if options["knowledge"]:
            self.import_knowledge(options["knowledge"], options["replace"])

    def import_intents(self, path, replace):
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)

        items = raw.get("intents") if isinstance(raw, dict) else raw
        if not isinstance(items, list):
            raise CommandError(
                "Format intents.json tidak dikenali -- harus punya key 'intents' berisi list."
            )

        if replace:
            Intent.objects.all().delete()

        count = 0
        for i, item in enumerate(items):
            nama = item.get("intent", "")
            jawaban = item.get("jawaban_default", "")
            contoh = item.get("contoh_pertanyaan", [])
            keywords = item.get("keywords", [])
            kategori = item.get("context_set", "")

            if not nama or not jawaban:
                self.stdout.write(self.style.WARNING(f"Lewati item #{i}: 'intent'/'jawaban_default' kosong."))
                continue

            Intent.objects.update_or_create(
                nama=nama,
                defaults={
                    "kategori": kategori,
                    "contoh_pertanyaan": contoh,
                    "keywords": keywords,
                    "jawaban": jawaban,
                    "urutan": i,
                },
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Berhasil import {count} intent dari {path}"))

    def import_knowledge(self, path, replace):
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)

        if not isinstance(raw, dict):
            raise CommandError("Format knowledge_base.json tidak dikenali -- harus berupa object JSON.")

        if replace:
            KnowledgeEntry.objects.all().delete()

        count = 0
        urutan = 0

        # 1) informasi_program -- tiap key top-level jadi 1 KnowledgeEntry.
        informasi = raw.get("informasi_program", {})
        for key, value in informasi.items():
            judul = _humanize_key(key)
            konten = _flatten_value(value)
            if not konten:
                continue
            KnowledgeEntry.objects.update_or_create(
                judul=judul,
                defaults={"konten": konten, "urutan": urutan},
            )
            urutan += 1
            count += 1

        # 2) posisi_magang -- tiap posisi jadi 1 KnowledgeEntry (deskripsi +
        #    jobdesk + skill digabung), supaya Ollama bisa jawab pertanyaan
        #    seputar posisi tertentu dengan konteks lengkap.
        for posisi in raw.get("posisi_magang", []):
            nama_posisi = posisi.get("nama_posisi", "")
            if not nama_posisi:
                continue
            deskripsi = posisi.get("deskripsi", "")
            jobdesk = posisi.get("jobdesk", [])
            skill = posisi.get("skill_dibutuhkan", [])

            bagian = [deskripsi] if deskripsi else []
            if jobdesk:
                bagian.append("Jobdesk:\n" + _flatten_value(jobdesk))
            if skill:
                bagian.append("Skill yang dibutuhkan:\n" + _flatten_value(skill))

            KnowledgeEntry.objects.update_or_create(
                judul=f"Posisi Magang: {nama_posisi}",
                defaults={"konten": "\n\n".join(bagian), "urutan": urutan},
            )
            urutan += 1
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Berhasil import {count} knowledge entry dari {path}"))
