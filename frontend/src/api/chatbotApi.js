import { API_BASE_URL } from "./client";

/**
 * Daftar/login identitas pengunjung (gerbang wajib sebelum bisa chat).
 * Balasannya berisi visitor_id yang harus disimpan (localStorage) dan
 * dikirim di setiap request sendChatMessage lewat header X-Visitor-Id.
 */
export async function registerVisitor(nama, noTelepon) {
  const res = await fetch(`${API_BASE_URL}/api/chatbot/visitor/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, no_telepon: noTelepon }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Gagal memulai chat. Coba lagi.");
  }
  return data; // { visitor_id, nama }
}

/**
 * Kirim 1 pesan chat. Backend bisa balas dengan 2 cara:
 * - JSON biasa (Content-Type: application/json) kalau match Intent statis
 * - Teks yang di-stream (Content-Type: text/plain) kalau dijawab Ollama
 *
 * onChunk dipanggil tiap kali ada potongan teks baru datang (buat efek
 * "AI sedang mengetik"). Fungsi ini selalu resolve ke teks balasan lengkap.
 */
export async function sendChatMessage(message, visitorId, { onChunk } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/chatbot/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Visitor-Id": String(visitorId),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    let detail = "Gagal mengirim pesan. Coba lagi.";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // respons error bukan JSON, pakai pesan default di atas
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get("Content-Type") || "";

  // Balasan statis (dari Intent) -- langsung ada, tidak perlu di-stream.
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return data.reply;
  }

  // Balasan dari Ollama -- baca stream-nya potongan demi potongan.
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const piece = decoder.decode(value, { stream: true });
    fullText += piece;
    onChunk?.(fullText);
  }

  return fullText;
}
