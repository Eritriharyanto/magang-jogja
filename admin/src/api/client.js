const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "magangjogja_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Wrapper fetch() yang otomatis:
 * - Tempel API_BASE_URL di depan path
 * - Tempel header Authorization: Token <token> kalau sudah login
 * - Kirim JSON biasa, ATAU FormData (untuk upload file icon) -- deteksi
 *   otomatis dari tipe `body`, jangan set Content-Type manual untuk
 *   FormData karena browser perlu isi boundary-nya sendiri.
 * - Lempar Error dengan detail pesan dari backend kalau gagal
 * - Kalau dapat 401 (token basi/invalid), otomatis hapus token tersimpan
 *   supaya AuthContext bisa redirect balik ke halaman login.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    let detail = `Gagal memproses permintaan ke ${path} (status ${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.detail) {
        detail = errBody.detail;
      } else if (typeof errBody === "object") {
        // DRF validation error format: {"field": ["pesan error"]}
        const firstKey = Object.keys(errBody)[0];
        if (firstKey) {
          const val = errBody[firstKey];
          detail = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
        }
      }
    } catch {
      // body bukan JSON, pakai pesan default
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export { API_BASE_URL };
