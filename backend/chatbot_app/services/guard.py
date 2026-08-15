"""Deteksi pesan di luar topik & gibberish, SEBELUM masuk ke NLU matcher
atau Ollama. Kalau pesan kedetect off-topic/gibberish, langsung dibalas
pesan pengarahan tanpa buang-buang panggilan ke Ollama.

Diadaptasi dari pola yang sama di versi Flask (rental jas), tapi daftar
frasa off-topic dan domain keyword-nya disesuaikan buat konteks
magangjogja. Kata-kata yang overlap dengan topik magang yang sah (mis.
"coding" -- karena ada posisi Programmer, atau "gaji" -- karena ada
pertanyaan seputar uang saku) SENGAJA tidak dimasukkan ke daftar
off-topic, supaya pertanyaan yang legit soal magang tidak salah tolak.
"""
import re

OFF_TOPIC_PHRASES = [
    "nyanyi", "lagu", "film", "nonton", "series", "netflix", "musik apa", "penyanyi",
    "catering", "kuliner", "resep masakan", "resep makanan", "masakin", "masak",
    "resep masak", "resepin", "resep dokter",
    "pinjem duit", "pinjam duit", "pinjemin duit", "pinjol", "hutang", "utang",
    "kenalan", "kenlan", "pacar", "jodoh", "kencan",
    "robot beneran", "kamu manusia", "orang asli", "chatbot beneran",
    "gaun pengantin", "jasa mua", "make up artist",
    "scam", "penipu", "penipuan",
    "cuaca", "berita hari ini", "politik", "presiden",
    "puisi", "pantun", "cerita dong", "dongeng",
    "sejarah indonesia", "sejarah dunia",
    "diet", "olahraga apa",
    "terjemahin", "translate",
    "zodiak", "ramalan", "ramal",
    "matematika", "hitungan matematika",
    "qwerty", "asdfgh", "sadfgh",
]

# Kalau salah satu frasa off-topic di atas nyangkut, tapi pesan yang sama
# JUGA ada kata domain magang, jangan dianggap off-topic -- serahkan ke
# NLU/Ollama, biar aman (mis. "programmer itu belajar coding apa aja" ada
# kata di luar daftar tapi jelas tetap soal magang).
DOMAIN_KEYWORDS = [
    "magang", "pkl", "prakerin", "posisi", "divisi", "jobdesk", "syarat",
    "daftar", "pendaftaran", "sertifikat", "kuota", "gelombang", "uang saku",
    "fasilitas", "magangjogja", "seven inc", "internship", "wfh", "wfo",
    "mitra", "onboarding", "skill", "jurusan", "kampus", "sekolah",
]

OFF_TOPIC_MESSAGE = (
    "Waduh, kayaknya itu di luar topik seputar magang di Magang Jogja nih 😅 "
    "Aku bisa bantu jawab soal posisi magang, syarat daftar, jobdesk, "
    "fasilitas, atau info lain seputar program magang di sini. Kalau ada "
    "pertanyaan lain di luar itu, langsung aja hubungi Admin Magang Jogja "
    "di 0895-2900-2944 ya."
)

_REPEATED_CHAR_RE = re.compile(r"(.)\1{5,}")   # mis. "aaaaaaaaaa"
_REPEATED_PAIR_RE = re.compile(r"(..)\1{3,}")  # mis. "wkwkwkwkwk", "hahahaha"


def _looks_like_gibberish(token: str) -> bool:
    """Kata >=6 huruf tanpa vokal sama sekali biasanya bukan kata Indonesia
    yang valid. Juga tangkep spam huruf berulang ('aaaaaa', 'wkwkwkwk')."""
    if not token.isalpha():
        return False
    if len(token) >= 6 and not re.search(r"[aeiou]", token):
        return True
    if len(token) >= 6 and (_REPEATED_CHAR_RE.search(token) or _REPEATED_PAIR_RE.search(token)):
        return True
    return False


def is_off_topic(message: str) -> bool:
    lower = message.lower()
    tokens = [t.strip(".,!?-") for t in lower.split()]
    tokens = [t for t in tokens if t]

    if not tokens:
        return True  # pesan cuma tanda baca/spam karakter

    if any(_looks_like_gibberish(t) for t in tokens):
        return True

    if any(phrase in lower for phrase in OFF_TOPIC_PHRASES):
        if any(kw in lower for kw in DOMAIN_KEYWORDS):
            return False  # ada kata domain juga -> jangan buru-buru tolak
        return True

    return False
