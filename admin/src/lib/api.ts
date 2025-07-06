// src/lib/api.ts
function toNumeric(id: number | string) {
  if (typeof id === "number") return id;

  // match “module_10”, “lesson_27”, “42”, etc.
  const m = /_(\d+)$/.exec(id);
  return m ? Number(m[1]) : Number(id);
}

export async function updateModule(
  token: string,
  id: number | string,
  body: Partial<{ titre: string; index: number }>
) {
  const numericId = toNumeric(id);      // 👈 utilise le helper
  await fetch(`${import.meta.env.VITE_API_URL}/modules/${numericId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function updateSubmodule(
  token: string,
  id: number | string,
  body: Partial<{ titre: string; description: string; index: number }>
) {
  const numericId = toNumeric(id);      // 👈 idem
  await fetch(`${import.meta.env.VITE_API_URL}/submodules/${numericId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
