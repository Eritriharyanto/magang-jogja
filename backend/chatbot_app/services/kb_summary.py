"""Setara dengan chatbot/services/kb_summary.py di versi Flask."""
from ..models import KnowledgeEntry

BASE_PERSONA = (
    "Kamu adalah asisten chat resmi website magangjogja.com (Seven Inc), "
    "membantu calon peserta magang/PKL/prakerin yang bertanya seputar "
    "program magang. Jawab dengan ramah, singkat, dan jelas dalam Bahasa "
    "Indonesia yang santai tapi sopan (gaya admin online shop/CS, bukan "
    "formal kaku). Jangan mengarang informasi -- kalau pertanyaan di luar "
    "topik magangjogja atau kamu tidak tahu jawabannya dari data di bawah, "
    "arahkan user untuk menghubungi admin di 0895 2900 2944."
)


def build_system_prompt() -> str:
    """Gabungkan semua KnowledgeEntry yang aktif jadi satu blok teks,
    ditempel setelah persona dasar. Inilah yang bikin jawaban Ollama
    berdasarkan data magangjogja asli, bukan karangan model (pola RAG
    sederhana lewat prompt, tanpa perlu vector database)."""

    entries = KnowledgeEntry.objects.filter(aktif=True).order_by("urutan", "id")

    if not entries.exists():
        return BASE_PERSONA

    blocks = [f"## {e.judul}\n{e.konten}" for e in entries]
    knowledge_text = "\n\n".join(blocks)

    return (
        f"{BASE_PERSONA}\n\n"
        f"Berikut data resmi yang boleh kamu pakai untuk menjawab:\n\n"
        f"{knowledge_text}"
    )
