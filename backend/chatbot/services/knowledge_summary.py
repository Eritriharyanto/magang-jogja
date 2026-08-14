"""Meringkas seluruh data magangjogja (hero, kontak, syarat, fasilitas,
divisi + jobdesk, info tambahan) jadi 1 teks konteks yang disuapkan ke
Ollama sebagai system prompt -- supaya jawaban AI akurat berdasarkan data
asli, bukan ngarang. Setara kb_summary.py di referensi."""

from divisi.models import Divisi
from homepage.models import HeroContent, KontakContent, SyaratItem, FasilitasItem
from chatbot.models import KnowledgeEntry


def build_knowledge_summary():
    parts = []

    hero = HeroContent.get_solo()
    parts.append(
        f"Tentang program: {hero.judul_baris1} {hero.judul_baris2}. {hero.deskripsi} "
        f"{hero.subjudul}"
    )

    kontak = KontakContent.get_solo()
    parts.append(f"Kontak resmi: telepon/WhatsApp {kontak.nomor_telepon}. Alamat: {kontak.alamat}")

    syarat = list(SyaratItem.objects.filter(aktif=True))
    if syarat:
        parts.append(
            "Syarat dan ketentuan untuk daftar magang:\n"
            + "\n".join(f"- {s.teks}" for s in syarat)
        )

    fasilitas = list(FasilitasItem.objects.filter(aktif=True))
    if fasilitas:
        parts.append(
            "Fasilitas yang didapat peserta magang:\n"
            + "\n".join(f"- {f.teks}" for f in fasilitas)
        )

    divisi_list = Divisi.objects.filter(aktif=True).prefetch_related("jobdesk_items")
    if divisi_list:
        baris_divisi = []
        for d in divisi_list:
            jobdesk = ", ".join(j.teks for j in d.jobdesk_items.all())
            label_lengkap = f"{d.label} {d.sub_label}".strip()
            baris_divisi.append(
                f"- {label_lengkap}: {d.deskripsi} "
                f"Jobdesk: {jobdesk or '(belum diisi)'}. "
                f"Link pendaftaran posisi ini: {d.gform_link}"
            )
        parts.append("Posisi/divisi magang yang tersedia saat ini:\n" + "\n".join(baris_divisi))

    info_tambahan = list(KnowledgeEntry.objects.filter(aktif=True))
    if info_tambahan:
        parts.append(
            "Info tambahan:\n" + "\n".join(f"- {i.judul}: {i.isi}" for i in info_tambahan)
        )

    return "\n\n".join(parts)


def build_system_prompt():
    summary = build_knowledge_summary()
    return (
        "Kamu adalah asisten chatbot resmi website magangjogja.com, layanan "
        "penyaluran magang/PKL untuk siswa SMK dan mahasiswa. Jawab "
        "pertanyaan pengunjung dengan ramah, singkat, dan jelas, dalam Bahasa "
        "Indonesia. HANYA gunakan data di bawah ini sebagai sumber informasi. "
        "Kalau ada pertanyaan yang jawabannya tidak ada di data ini, jujur "
        "katakan kamu belum punya informasinya dan arahkan pengunjung untuk "
        "menghubungi kontak resmi yang tersedia. Jangan pernah mengarang "
        "informasi (harga, syarat, atau data lain) yang tidak ada di bawah "
        "ini.\n\n"
        f"=== DATA MAGANGJOGJA ===\n{summary}\n=== AKHIR DATA ==="
    )
