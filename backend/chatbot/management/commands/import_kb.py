"""
Import data chatbot dari file JSON custom (intents.json & knowledge_base.json)
ke model Intent & KnowledgeEntry.

Kenapa tidak semua 'intent' jadi Intent (guard keyword)?
----------------------------------------------------------
Intent.jawaban di-return LANGSUNG kalau salah satu keyword-nya nyangkut di
pesan user (lihat chatbot/services/intent_matching.py) -- tanpa lewat AI
sama sekali. Ini cuma aman dipakai kalau ada keyword yang jelas & spesifik.

Di intents.json kamu:
- 38 intent (jobdesk & skill per posisi) SUDAH punya field "keywords" yang
  jelas -> ini di-import jadi Intent (biar jawabannya instan, tanpa nunggu
  Ollama).
- Sisanya (syarat, cara daftar, durasi, dll) field "keywords"-nya kosong ->
  kalau dipaksa jadi Intent, dia tidak akan pernah ke-trigger. Makanya
  ini di-import jadi KnowledgeEntry -- jadi "bahan bacaan" yang disuapkan ke
  Ollama supaya AI-nya jawab akurat sesuai data kamu (bukan ngarang).
- "sapaan" dilewati karena sudah ada logic sendiri (match_greeting), dan
  "fallback_tidak_dikenali" dilewati karena isinya bukan fakta, cuma
  template "maaf tidak paham".

Untuk 19 intent "tanya_skill_<posisi>", keyword aslinya berupa 3 kata
terpisah (misal ['programmer', 'syarat', 'skill']) yang kalau di-OR-kan
mentah-mentah akan selalu tabrakan sama intent "tanya_jobdesk_<posisi>"
(sama-sama ke-trigger cuma dari kata "programmer" doang). Command ini
otomatis menggabungkannya jadi frasa ('syarat programmer', 'skill
programmer') supaya dua intent itu tidak rebutan.

knowledge_base.json (informasi_program + posisi_magang) di-flatten jadi
KnowledgeEntry juga -- ini pelengkap data yang sudah ada di model Divisi/
Homepage, JANGAN dianggap pengganti. Command ini tidak menyentuh model
Divisi sama sekali.

Cara pakai:
    python manage.py import_kb
    python manage.py import_kb --intents path/ke/intents.json --kb path/ke/knowledge_base.json
    python manage.py import_kb --dry-run   # cuma preview, tidak nulis ke DB
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from chatbot.models import Intent, KnowledgeEntry

APP_DIR = Path(__file__).resolve().parent.parent.parent  # .../chatbot/
DEFAULT_INTENTS = APP_DIR / "data" / "intents.json"
DEFAULT_KB = APP_DIR / "data" / "knowledge_base.json"

SKIP_INTENTS = {"sapaan", "fallback_tidak_dikenali"}


def humanize(key: str) -> str:
    return key.replace("_", " ").strip().title()


def flatten_value(value) -> str:
    """Ubah value informasi_program (str/bool/list/dict) jadi teks natural."""
    if isinstance(value, str):
        return value
    if isinstance(value, bool):
        return "Ya" if value else "Tidak"
    if isinstance(value, list):
        return "\n".join(f"- {v}" for v in value)
    if isinstance(value, dict):
        keterangan = value.get("keterangan")
        other_parts = []
        for k, v in value.items():
            if k == "keterangan":
                continue
            if isinstance(v, list):
                v = ", ".join(str(x) for x in v)
            elif isinstance(v, bool):
                v = "ya" if v else "tidak"
            other_parts.append(f"{humanize(k)}: {v}")
        prefix = (". ".join(other_parts) + ". ") if other_parts else ""
        isi = f"{prefix}{keterangan or ''}".strip()
        return isi or json.dumps(value, ensure_ascii=False)
    return str(value)


def build_intent_keywords(item: dict):
    """Return None kalau intent ini tidak boleh jadi Intent (guard keyword),
    atau string keywords (comma-separated) siap disimpan ke Intent.keywords."""

    keywords = item.get("keywords") or []
    if not keywords:
        return None

    intent_name = item["intent"]

    # Kasus khusus: tanya_skill_<posisi> -> gabungkan jadi frasa supaya
    # tidak selalu ke-trigger cuma dari nama posisinya doang (yang sudah
    # dipakai intent tanya_jobdesk_<posisi>).
    if intent_name.startswith("tanya_skill_") and len(keywords) >= 2:
        posisi = keywords[0]
        triggers = keywords[1:]
        phrases = [f"{trigger} {posisi}" for trigger in triggers]
        return ", ".join(phrases)

    return ", ".join(keywords)


class Command(BaseCommand):
    help = "Import intents.json & knowledge_base.json custom ke model Intent & KnowledgeEntry."

    def add_arguments(self, parser):
        parser.add_argument("--intents", default=str(DEFAULT_INTENTS), help="Path ke intents.json")
        parser.add_argument("--kb", default=str(DEFAULT_KB), help="Path ke knowledge_base.json")
        parser.add_argument(
            "--dry-run", action="store_true", help="Cuma tampilkan preview, tidak menyimpan ke DB."
        )

    def handle(self, *args, **options):
        intents_path = Path(options["intents"])
        kb_path = Path(options["kb"])
        dry_run = options["dry_run"]

        intent_created = 0
        ke_created = 0
        urutan = 100  # mulai dari 100 supaya tidak bentrok sama seed_chatbot manual (urutan 1-3)

        # --- 1. intents.json ---
        if intents_path.exists():
            data = json.loads(intents_path.read_text(encoding="utf-8"))
            for item in data.get("intents", []):
                nama = item["intent"]
                jawaban = item.get("jawaban_default", "").strip()
                if nama in SKIP_INTENTS or not jawaban:
                    continue

                keywords = build_intent_keywords(item)

                if keywords:
                    # Bisa jadi Intent (guard cepat, jawab tanpa Ollama)
                    prioritas = 12 if nama.startswith("tanya_skill_") else 10
                    self.stdout.write(f"[Intent] {nama}  <-  {keywords}")
                    if not dry_run:
                        Intent.objects.update_or_create(
                            nama=nama,
                            defaults={
                                "keywords": keywords,
                                "jawaban": jawaban,
                                "prioritas": prioritas,
                            },
                        )
                    intent_created += 1
                else:
                    # Tidak ada keyword jelas -> jadi bahan konteks Ollama
                    judul = humanize(nama.replace("tanya_", "", 1))
                    self.stdout.write(f"[KnowledgeEntry] {judul}")
                    if not dry_run:
                        KnowledgeEntry.objects.update_or_create(
                            judul=judul,
                            defaults={"isi": jawaban, "urutan": urutan},
                        )
                    urutan += 1
                    ke_created += 1
        else:
            self.stdout.write(self.style.WARNING(f"File tidak ditemukan, dilewati: {intents_path}"))

        # --- 2. knowledge_base.json ---
        if kb_path.exists():
            data = json.loads(kb_path.read_text(encoding="utf-8"))

            informasi = data.get("informasi_program", {})
            for key, value in informasi.items():
                judul = humanize(key)
                isi = flatten_value(value)
                self.stdout.write(f"[KnowledgeEntry] {judul}")
                if not dry_run:
                    KnowledgeEntry.objects.update_or_create(
                        judul=judul, defaults={"isi": isi, "urutan": urutan}
                    )
                urutan += 1
                ke_created += 1

            for posisi in data.get("posisi_magang", []):
                nama_posisi = posisi.get("nama_posisi", "").strip()
                if not nama_posisi:
                    continue
                judul = f"Posisi {nama_posisi}"
                bagian = [posisi.get("deskripsi", "").strip()]
                jobdesk = posisi.get("jobdesk") or []
                if jobdesk:
                    bagian.append("Jobdesk:\n" + "\n".join(f"- {j}" for j in jobdesk))
                skill = posisi.get("skill_dibutuhkan") or []
                if skill:
                    bagian.append("Skill yang dibutuhkan:\n" + "\n".join(f"- {s}" for s in skill))
                isi = "\n\n".join(b for b in bagian if b)

                self.stdout.write(f"[KnowledgeEntry] {judul}")
                if not dry_run:
                    KnowledgeEntry.objects.update_or_create(
                        judul=judul, defaults={"isi": isi, "urutan": urutan}
                    )
                urutan += 1
                ke_created += 1
        else:
            self.stdout.write(self.style.WARNING(f"File tidak ditemukan, dilewati: {kb_path}"))

        mode = "(DRY RUN, tidak disimpan)" if dry_run else ""
        self.stdout.write(
            self.style.SUCCESS(
                f"Selesai {mode}. {intent_created} Intent & {ke_created} KnowledgeEntry diproses."
            )
        )
