import { apiFetch } from "./client";

/** Ambil semua divisi (buat grid di section Posisi Magang). */
export function getDivisiList() {
  return apiFetch("/api/divisi/");
}

/** Ambil detail 1 divisi berdasarkan slug (buat halaman /posisi/:slug). */
export function getDivisiDetail(slug) {
  return apiFetch(`/api/divisi/${slug}/`);
}
