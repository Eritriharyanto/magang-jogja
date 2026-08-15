from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Intent, KnowledgeEntry, ChatVisitor, ChatMessage
from .serializers import (
    IntentSerializer,
    KnowledgeEntrySerializer,
    ChatVisitorSerializer,
    ChatVisitorWithHistorySerializer,
)
from .services.nlu import match_intent_nlu
from .services.kb_summary import build_system_prompt
from .services.ollama_client import ask_ollama
from .services.guard import is_off_topic, OFF_TOPIC_MESSAGE
from .services.actions import build_chat_action

# Berapa banyak pesan terakhir yang disertakan sebagai konteks percakapan
# saat manggil Ollama (biar chatbot "inget" obrolan sebelumnya, tapi tidak
# mengirim keseluruhan riwayat yang bisa sangat panjang & mahal).
RIWAYAT_KONTEKS_MAX = 10


class VisitorRegisterView(APIView):
    """
    POST /api/chatbot/visitor/
    Body: {"nama": "...", "no_telepon": "..."}

    Setara gerbang identitas di versi Flask: wajib diisi sebelum bisa chat.
    Kalau no_telepon sudah pernah dipakai sebelumnya, visitor yang sama
    dikembalikan (bukan bikin baru) -- riwayat chat-nya otomatis nyambung.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        nama = (request.data.get("nama") or "").strip()
        no_telepon = (request.data.get("no_telepon") or "").strip()

        if not nama or not no_telepon:
            return Response(
                {"detail": "Nama dan nomor telepon wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visitor, created = ChatVisitor.objects.update_or_create(
            no_telepon=no_telepon,
            defaults={"nama": nama},
        )
        return Response(
            ChatVisitorSerializer(visitor).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ChatView(APIView):
    """
    POST /api/chatbot/chat/
    Body: {"visitor_id": "...", "pesan": "..."}

    Alur (persis pola guard di versi Flask):
    1. Simpan pesan user ke riwayat.
    2. Cek dulu apakah pesan di luar topik / gibberish (services/guard.py)
       -- kalau iya, langsung dibalas pesan pengarahan TANPA panggil Ollama
       sama sekali (hemat biaya & waktu, dan menghindari Ollama mengarang
       jawaban untuk topik yang bukan urusannya).
    3. Kalau bukan off-topic, cek intent statis lewat kemiripan teks ke
       `contoh_pertanyaan` (services/nlu.py) -- kalau skor kemiripan di atas
       threshold, jawab dari situ.
    4. Kalau tidak ada yang cukup mirip, lempar ke Ollama dengan knowledge
       base sebagai system prompt + beberapa pesan terakhir sebagai konteks.
    5. Kalau intent yang match butuh tombol tambahan (WA/Maps), tempelkan
       lewat services/actions.py.
    6. Simpan jawaban bot ke riwayat, lalu kembalikan ke frontend.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        visitor_id = request.data.get("visitor_id")
        pesan_user = (request.data.get("pesan") or "").strip()

        if not visitor_id or not pesan_user:
            return Response(
                {"detail": "visitor_id dan pesan wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            visitor = ChatVisitor.objects.get(pk=visitor_id)
        except (ChatVisitor.DoesNotExist, ValueError, TypeError):
            # Ini yang bikin endpoint chat "menolak" request kalau identitas
            # belum diisi -- sama seperti gerbang 401 di versi Flask.
            return Response(
                {"detail": "Identitas belum terdaftar. Isi nama & no. telepon dulu."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        ChatMessage.objects.create(visitor=visitor, pengirim="user", pesan=pesan_user)

        intent = None
        aksi = None

        if is_off_topic(pesan_user):
            jawaban = OFF_TOPIC_MESSAGE
            sumber = "guard"
        else:
            intent = match_intent_nlu(pesan_user)
            if intent is not None:
                jawaban = intent.jawaban
                sumber = "static"
                aksi = build_chat_action(intent)
            else:
                riwayat_qs = (
                    ChatMessage.objects.filter(visitor=visitor)
                    .exclude(pengirim="user", pesan=pesan_user)  # jangan dobel sama pesan barusan
                    .order_by("-dibuat_pada")[:RIWAYAT_KONTEKS_MAX]
                )
                riwayat = [
                    {"role": "user" if m.pengirim == "user" else "assistant", "content": m.pesan}
                    for m in reversed(list(riwayat_qs))
                ]
                jawaban = ask_ollama(build_system_prompt(), pesan_user, riwayat)
                sumber = "ollama"

        ChatMessage.objects.create(visitor=visitor, pengirim="bot", pesan=jawaban, sumber=sumber)

        return Response({"pesan": jawaban, "sumber": sumber, "aksi": aksi})


class IntentViewSet(viewsets.ModelViewSet):
    """Kelola daftar intent statis. Dipakai admin dashboard nanti -- butuh login."""

    queryset = Intent.objects.all()
    serializer_class = IntentSerializer
    permission_classes = [permissions.IsAuthenticated]


class KnowledgeEntryViewSet(viewsets.ModelViewSet):
    """Kelola knowledge base. Dipakai admin dashboard nanti -- butuh login."""

    queryset = KnowledgeEntry.objects.all()
    serializer_class = KnowledgeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]


class ChatHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/chatbot/riwayat/          -> list semua visitor + jumlah pesan
    GET /api/chatbot/riwayat/<uuid>/   -> 1 visitor + transkrip lengkap

    Setara menu 'Riwayat Chat' di panel admin versi Flask. Butuh login.
    """

    queryset = ChatVisitor.objects.all().prefetch_related("messages")
    serializer_class = ChatVisitorWithHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
