import { apiFetch } from "./client";

/**
 * Daftar/login identitas pengunjung (gerbang wajib sebelum bisa chat).
 * Kalau no_telepon yang sama pernah dipakai, backend otomatis
 * mengembalikan visitor yang sama (riwayat chat-nya nyambung).
 * Return: { id, nama, no_telepon }
 */
export function registerVisitor(nama, noTelepon) {
  return apiFetch("/api/chatbot/visitor/", {
    method: "POST",
    body: JSON.stringify({ nama, no_telepon: noTelepon }),
  });
}

/**
 * Kirim 1 pesan chat. Return: { pesan, sumber } -- sumber "static" (dari
 * Intent) atau "ollama" (dijawab AI).
 */
export function sendChatMessage(visitorId, pesan) {
  return apiFetch("/api/chatbot/chat/", {
    method: "POST",
    body: JSON.stringify({ visitor_id: visitorId, pesan }),
  });
}
