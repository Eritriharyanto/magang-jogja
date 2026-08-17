import { apiFetch } from "./client";

export function getIntentList() {
  return apiFetch("/api/chatbot/intents/");
}
export function getIntentDetail(id) {
  return apiFetch(`/api/chatbot/intents/${id}/`);
}
export function createIntent(payload) {
  return apiFetch("/api/chatbot/intents/", { method: "POST", body: JSON.stringify(payload) });
}
export function updateIntent(id, payload) {
  return apiFetch(`/api/chatbot/intents/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteIntent(id) {
  return apiFetch(`/api/chatbot/intents/${id}/`, { method: "DELETE" });
}

export function getKnowledgeList() {
  return apiFetch("/api/chatbot/knowledge/");
}
export function getKnowledgeDetail(id) {
  return apiFetch(`/api/chatbot/knowledge/${id}/`);
}
export function createKnowledge(payload) {
  return apiFetch("/api/chatbot/knowledge/", { method: "POST", body: JSON.stringify(payload) });
}
export function updateKnowledge(id, payload) {
  return apiFetch(`/api/chatbot/knowledge/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteKnowledge(id) {
  return apiFetch(`/api/chatbot/knowledge/${id}/`, { method: "DELETE" });
}

export function getChatHistoryList() {
  return apiFetch("/api/chatbot/riwayat/");
}
export function getChatHistoryDetail(visitorId) {
  return apiFetch(`/api/chatbot/riwayat/${visitorId}/`);
}
