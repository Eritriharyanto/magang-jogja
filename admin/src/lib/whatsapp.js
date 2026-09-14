/**
 * '0895 2900 2944' -> 'https://wa.me/6289529002944'
 * Logika normalisasi nomor sama seperti backend/chatbot_app/services/actions.py
 * (_clean_phone_for_wa), supaya konsisten dengan tombol WA di chatbot publik.
 */
export function buildWaLink(nomorTelepon) {
  const digits = String(nomorTelepon || "").replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}
