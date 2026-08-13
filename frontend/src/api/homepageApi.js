import { apiFetch } from "./client";

export function getHero() {
  return apiFetch("/api/homepage/hero/");
}

export function getKontak() {
  return apiFetch("/api/homepage/kontak/");
}

export function getSyarat() {
  return apiFetch("/api/homepage/syarat/");
}

export function getFasilitas() {
  return apiFetch("/api/homepage/fasilitas/");
}
