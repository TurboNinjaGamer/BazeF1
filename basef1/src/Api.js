export const tokenStore = {
  get: () => localStorage.getItem("token"),
  set: (t) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};

export async function apiFetch(path, options = {}) {
  const token = tokenStore.get();

  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}