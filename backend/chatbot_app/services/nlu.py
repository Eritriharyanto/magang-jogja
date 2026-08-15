"""
Pencocokan intent berbasis kemiripan teks (TF-IDF + cosine similarity),
dipakai karena data `contoh_pertanyaan` kamu isinya banyak variasi kalimat
per intent (bukan cuma 1-2 keyword pendek).

Strategi: tiap contoh kalimat (bukan digabung per intent) jadi 1 baris
training tersendiri -- pesan user dicocokkan ke CONTOH KALIMAT TERDEKAT
(nearest neighbor), lalu diambil intent-nya. Ini terbukti lebih akurat
lewat pengujian dibanding menggabungkan semua contoh jadi 1 dokumen per
intent, karena kalimat aslinya memang berupa variasi paraphrase pendek,
bukan 1 dokumen panjang.

Stopword list di bawah membuang kata "bumbu" chat yang muncul di HAMPIR
SEMUA intent (min, kak, sih, dong, gak, dst) -- ini penting supaya
kemiripan dihitung dari kata yang benar-benar membedakan topik, bukan
gaya bahasa chat yang seragam. Kata sapaan (hai/halo/selamat pagi) SENGAJA
tidak dibuang karena itu justru penanda intent 'sapaan' itu sendiri.

Sudah diuji dengan berbagai kalimat on-topic & off-topic (lihat riwayat
percakapan) untuk menentukan threshold 0.40 sebagai titik aman: cukup
tinggi untuk menolak pertanyaan di luar topik magangjogja (dilempar ke
Ollama), cukup rendah untuk tetap menangkap variasi bahasa santai/typo.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ..models import Intent

DEFAULT_THRESHOLD = 0.40

STOPWORDS = [
    "min", "kak", "gan", "ya", "yah", "dong", "donk", "sih", "nih", "gak", "ga", "kah",
    "eh", "btw", "cek", "misi", "permisi", "boleh", "tanya", "nanya", "mau", "aku",
    "gimana", "apa", "aja", "dan", "yg", "yang", "banget", "nya", "deh", "dl", "dulu",
    "tuh", "kok", "kalo", "kalau", "itu", "ini", "ke", "di", "dari", "untuk", "buat",
    "dengan", "atau", "bisa", "wih", "yh", "izin", "punten", "test", "saya", "kamu",
    "dibales", "dibalas", "balas",
]

_cache = {"vectorizer": None, "matrix": None, "row_intent_ids": None}


def invalidate_cache():
    """Dipanggil otomatis (lewat signal di apps.py) tiap kali data Intent
    berubah, supaya matcher rebuild dari data terbaru di request berikutnya."""
    _cache["vectorizer"] = None
    _cache["matrix"] = None
    _cache["row_intent_ids"] = None


def _build_matcher():
    intents = list(Intent.objects.filter(aktif=True).order_by("urutan", "id"))

    documents = []
    row_intent_ids = []
    for intent in intents:
        for contoh in (intent.contoh_pertanyaan or []):
            teks = str(contoh).strip()
            if not teks:
                continue
            documents.append(teks)
            row_intent_ids.append(intent.pk)
        # Catatan: `keywords` SENGAJA tidak diikutkan ke corpus ini. Kalau
        # ikut ditambahkan sebagai dokumen tersendiri, dokumen 1-2 kata
        # ("syarat", "skill") jadi "magnet" yang terlalu kuat untuk query
        # pendek apapun yang kebetulan memuat kata itu, dan malah
        # mengalahkan kecocokan kalimat yang sebenarnya lebih tepat.
        # Exact match keyword sudah ditangani terpisah & lebih dulu oleh
        # chatbot_app/services/intent_matching.py.

    if not documents:
        _cache["vectorizer"] = None
        _cache["matrix"] = None
        _cache["row_intent_ids"] = []
        return

    vectorizer = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
        stop_words=STOPWORDS,
    )
    matrix = vectorizer.fit_transform(documents)

    _cache["vectorizer"] = vectorizer
    _cache["matrix"] = matrix
    _cache["row_intent_ids"] = row_intent_ids


def match_intent_nlu(pesan_user: str, threshold: float = DEFAULT_THRESHOLD) -> Intent | None:
    """Cari contoh kalimat training paling mirip dengan pesan user, lalu
    kembalikan Intent-nya. Return None kalau skor tertinggi di bawah
    threshold -- caller lalu forward ke Ollama."""

    if not pesan_user.strip():
        return None

    if _cache["vectorizer"] is None:
        _build_matcher()

    vectorizer = _cache["vectorizer"]
    if vectorizer is None:
        return None  # belum ada data intent sama sekali

    query_vec = vectorizer.transform([pesan_user])
    scores = cosine_similarity(query_vec, _cache["matrix"])[0]

    best_idx = scores.argmax()
    best_score = scores[best_idx]

    if best_score < threshold:
        return None

    intent_id = _cache["row_intent_ids"][best_idx]
    try:
        return Intent.objects.get(pk=intent_id)
    except Intent.DoesNotExist:
        return None
