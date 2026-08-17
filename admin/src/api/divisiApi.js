import { apiFetch } from "./client";

export function getDivisiList() {
  return apiFetch("/api/divisi/");
}

export function getDivisiDetail(slug) {
  return apiFetch(`/api/divisi/${slug}/`);
}

/**
 * payload: { label, sub_label, deskripsi, gform_link, urutan, aktif,
 *            jobdesk: string[], icon: File | null }
 * Selalu dikirim sebagai FormData supaya bisa sekalian upload icon.
 */
function toFormData(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "jobdesk") {
      value.forEach((teks) => fd.append("jobdesk", teks));
    } else if (key === "icon") {
      if (value instanceof File) fd.append("icon", value);
      // kalau value null/undefined (icon tidak diubah), jangan dikirim sama sekali
    } else if (value !== undefined && value !== null) {
      fd.append(key, value);
    }
  });
  return fd;
}

export function createDivisi(payload) {
  return apiFetch("/api/divisi/", { method: "POST", body: toFormData(payload) });
}

export function updateDivisi(slug, payload) {
  return apiFetch(`/api/divisi/${slug}/`, { method: "PATCH", body: toFormData(payload) });
}

export function deleteDivisi(slug) {
  return apiFetch(`/api/divisi/${slug}/`, { method: "DELETE" });
}
