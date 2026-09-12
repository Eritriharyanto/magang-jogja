import { apiFetch } from "./client";

export function getHero() {
  return apiFetch("/api/homepage/hero/");
}
export function updateHero(payload) {
  return apiFetch("/api/homepage/hero/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getKontak() {
  return apiFetch("/api/homepage/kontak/");
}
export function updateKontak(payload) {
  return apiFetch("/api/homepage/kontak/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Syarat & Ketentuan boleh sekalian dilampiri foto. Kalau `payload.foto`
 * berupa File (foto baru dipilih), body dikirim sebagai FormData supaya
 * bisa upload; kalau tidak ada foto baru (mis. cuma ubah teks/toggle aktif),
 * tetap dikirim sebagai JSON biasa seperti sebelumnya.
 */
function toSyaratBody(payload) {
  if (!(payload.foto instanceof File)) {
    return JSON.stringify(payload);
  }
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, value);
  });
  return fd;
}

export function getSyaratList() {
  return apiFetch("/api/homepage/syarat/");
}
export function createSyarat(payload) {
  return apiFetch("/api/homepage/syarat/", {
    method: "POST",
    body: toSyaratBody(payload),
  });
}
export function updateSyarat(id, payload) {
  return apiFetch(`/api/homepage/syarat/${id}/`, {
    method: "PATCH",
    body: toSyaratBody(payload),
  });
}
export function deleteSyarat(id) {
  return apiFetch(`/api/homepage/syarat/${id}/`, { method: "DELETE" });
}

export function getFasilitasList() {
  return apiFetch("/api/homepage/fasilitas/");
}
export function createFasilitas(payload) {
  return apiFetch("/api/homepage/fasilitas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function updateFasilitas(id, payload) {
  return apiFetch(`/api/homepage/fasilitas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
export function deleteFasilitas(id) {
  return apiFetch(`/api/homepage/fasilitas/${id}/`, { method: "DELETE" });
}
