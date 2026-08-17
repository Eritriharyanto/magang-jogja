import { apiFetch } from "./client";

export function getHero() {
  return apiFetch("/api/homepage/hero/");
}
export function updateHero(payload) {
  return apiFetch("/api/homepage/hero/", { method: "PUT", body: JSON.stringify(payload) });
}

export function getKontak() {
  return apiFetch("/api/homepage/kontak/");
}
export function updateKontak(payload) {
  return apiFetch("/api/homepage/kontak/", { method: "PUT", body: JSON.stringify(payload) });
}

export function getSyaratList() {
  return apiFetch("/api/homepage/syarat/");
}
export function createSyarat(payload) {
  return apiFetch("/api/homepage/syarat/", { method: "POST", body: JSON.stringify(payload) });
}
export function updateSyarat(id, payload) {
  return apiFetch(`/api/homepage/syarat/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteSyarat(id) {
  return apiFetch(`/api/homepage/syarat/${id}/`, { method: "DELETE" });
}

export function getFasilitasList() {
  return apiFetch("/api/homepage/fasilitas/");
}
export function createFasilitas(payload) {
  return apiFetch("/api/homepage/fasilitas/", { method: "POST", body: JSON.stringify(payload) });
}
export function updateFasilitas(id, payload) {
  return apiFetch(`/api/homepage/fasilitas/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteFasilitas(id) {
  return apiFetch(`/api/homepage/fasilitas/${id}/`, { method: "DELETE" });
}
