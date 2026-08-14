import { useCallback, useEffect, useState } from "react";
import { registerVisitor, sendChatMessage } from "@/api/chatbotApi";

const VISITOR_KEY = "mj_chatbot_visitor";
const MESSAGES_KEY = "mj_chatbot_messages";

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Kelola semua state chatbot: identitas pengunjung, riwayat pesan, dan
 * proses kirim pesan (termasuk streaming balasan Ollama). Identitas &
 * riwayat disimpan di localStorage supaya tidak hilang kalau halaman
 * di-refresh.
 */
function useChatbot() {
  const [visitor, setVisitor] = useState(() => loadFromStorage(VISITOR_KEY, null));
  const [messages, setMessages] = useState(() => loadFromStorage(MESSAGES_KEY, []));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  const identify = useCallback(async (nama, noTelepon) => {
    const data = await registerVisitor(nama, noTelepon);
    const v = { id: data.visitor_id, nama: data.nama };
    localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
    setVisitor(v);

    setMessages((prev) =>
      prev.length > 0
        ? prev
        : [
            {
              id: "welcome",
              role: "bot",
              text: `Halo ${data.nama}! \u{1F44B} Aku siap bantu jawab pertanyaan seputar magang di magangjogja.com. Mau tanya apa?`,
            },
          ]
    );
    return v;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!visitor || !text.trim() || sending) return;
      setError(null);

      const userMsg = { id: `u-${Date.now()}`, role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setSending(true);

      const botMsgId = `b-${Date.now()}`;
      let placeholderAdded = false;

      try {
        const reply = await sendChatMessage(text, visitor.id, {
          onChunk: (fullText) => {
            if (!placeholderAdded) {
              placeholderAdded = true;
              setMessages((prev) => [...prev, { id: botMsgId, role: "bot", text: fullText }]);
            } else {
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, text: fullText } : m))
              );
            }
          },
        });

        // Kalau balasan statis (tidak lewat onChunk sama sekali), tambahkan sekarang.
        if (!placeholderAdded) {
          setMessages((prev) => [...prev, { id: botMsgId, role: "bot", text: reply }]);
        }
      } catch (err) {
        if (err.status === 401) {
          // Identitas di backend sudah tidak valid -- minta isi ulang.
          localStorage.removeItem(VISITOR_KEY);
          setVisitor(null);
        }
        setError(err.message || "Terjadi kesalahan. Coba lagi.");
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "bot",
            text: "Maaf, pesan kamu gagal terkirim. Coba lagi sebentar ya.",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [visitor, sending]
  );

  return { visitor, messages, sending, error, identify, sendMessage };
}

export default useChatbot;
