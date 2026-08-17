import { API_BASE_URL, setToken, clearToken } from "./client";

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Username atau password salah.");
  }

  const data = await res.json();
  setToken(data.token);
  return data;
}

export function logout() {
  clearToken();
}
