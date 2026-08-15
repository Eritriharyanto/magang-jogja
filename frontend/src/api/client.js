// URL dasar backend Django. Diambil dari environment variable (.env),
// dengan fallback ke localhost:8000 supaya tetap jalan di development
// walau .env belum di-setting.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Wrapper kecil di atas fetch() khusus buat manggil API backend.
 * - Otomatis tempel API_BASE_URL di depan path
 * - Otomatis parse JSON
 * - Lempar Error yang jelas kalau response gagal, biar gampang ditangkap
 *   komponen pemanggil (buat ditampilkan sebagai pesan error ke user)
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let detail = `Gagal mengambil data dari ${path} (status ${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.detail) detail = errBody.detail;
    } catch {
      // body error bukan JSON, pakai pesan default di atas
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  // Response 204 No Content (biasa dari DELETE) tidak punya body JSON.
  if (res.status === 204) return null;

  return res.json();
}

export { API_BASE_URL };
