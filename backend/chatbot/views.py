from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, Visitor
from .services.intent_matching import get_static_reply
from .services.knowledge_summary import build_system_prompt
from .services.ollama_client import stream_ollama_reply

# Berapa banyak pesan sebelumnya yang disertakan sebagai konteks ke Ollama.
RIWAYAT_KONTEKS = 10


class VisitorRegisterView(APIView):
    """
    POST /api/chatbot/visitor/
    Body: {"nama": "...", "no_telepon": "..."}

    Ini gerbang identitas -- wajib dipanggil dulu sebelum bisa chat.
    Kalau nomor telepon sudah pernah dipakai sebelumnya, otomatis
    nyambung ke identitas (dan riwayat chat) yang sama.

    Balasannya berisi `visitor_id` -- ini WAJIB disimpan oleh frontend
    (misal di localStorage) dan dikirim di setiap request /api/chatbot/chat/
    lewat header `X-Visitor-Id`.
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

        visitor, _created = Visitor.objects.update_or_create(
            no_telepon=no_telepon,
            defaults={"nama": nama, "terakhir_aktif": timezone.now()},
        )
        return Response({"visitor_id": visitor.id, "nama": visitor.nama})


class ChatView(APIView):
    """
    POST /api/chatbot/chat/
    Header wajib: X-Visitor-Id (didapat dari VisitorRegisterView)
    Body: {"message": "..."}

    Alur:
    1. Cek guard statis dulu (sapaan / Intent keyword) -- kalau cocok,
       langsung balas JSON biasa (cepat, tidak streaming).
    2. Kalau tidak ada yang cocok, baru diteruskan ke Ollama dan
       balasannya di-stream (Content-Type: text/plain, potongan demi
       potongan, mirip efek "AI sedang mengetik").

    Endpoint ini menolak (401) kalau X-Visitor-Id tidak dikirim atau
    tidak valid -- chatbot tidak akan pernah balas apa pun sebelum
    identitas pengunjung terisi.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        visitor_id = request.headers.get("X-Visitor-Id")
        message = (request.data.get("message") or "").strip()

        if not visitor_id:
            return Response(
                {"detail": "Identitas pengunjung belum terdaftar. Isi nama & nomor telepon dulu."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not message:
            return Response(
                {"detail": "Pesan tidak boleh kosong."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            visitor = Visitor.objects.get(id=visitor_id)
        except (Visitor.DoesNotExist, ValueError):
            return Response(
                {"detail": "Identitas pengunjung tidak valid. Isi ulang nama & nomor telepon."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        visitor.terakhir_aktif = timezone.now()
        visitor.save(update_fields=["terakhir_aktif"])

        ChatMessage.objects.create(visitor=visitor, pengirim="user", sumber="system", pesan=message)

        # --- 1. Coba guard statis dulu ---
        static_reply = get_static_reply(message)
        if static_reply:
            ChatMessage.objects.create(
                visitor=visitor, pengirim="bot", sumber="static", pesan=static_reply
            )
            return Response({"reply": static_reply, "sumber": "static", "streaming": False})

        # --- 2. Tidak ada guard yang cocok -> lanjut ke Ollama, di-stream ---
        riwayat_qs = visitor.messages.order_by("-dibuat_pada")[1 : RIWAYAT_KONTEKS + 1]
        history = [
            {"role": "user" if m.pengirim == "user" else "assistant", "content": m.pesan}
            for m in reversed(list(riwayat_qs))
        ]

        system_prompt = build_system_prompt()

        def generate():
            full_reply = ""
            for chunk in stream_ollama_reply(message, system_prompt, history):
                full_reply += chunk
                yield chunk
            ChatMessage.objects.create(
                visitor=visitor, pengirim="bot", sumber="ollama", pesan=full_reply
            )

        response = StreamingHttpResponse(generate(), content_type="text/plain; charset=utf-8")
        response["X-Sumber"] = "ollama"
        return response
