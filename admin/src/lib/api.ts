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

export async function deleteModule(token: string, id: number | string) {
  const numericId = toNumeric(id);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/modules/${numericId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete module");
  }
}

export async function deleteSubmodule(token: string, id: number | string) {
  const numericId = toNumeric(id);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/submodules/${numericId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete lesson");
  }
}

export async function updateFormationContent(
  token: string,
  formationId: string | number,
  formationData: any // Idéalement, utilisez une interface plus stricte ici
) {
  const numericId = toNumeric(formationId);

  const response = await fetch(`${import.meta.env.VITE_API_URL}/formations/${numericId}/content`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "La mise à jour de la formation a échoué.");
  }

  return;
}