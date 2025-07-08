export async function invokeAgent(
  formation_id: number,
  prompt: string,
  thread_id: string | null
) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/cursor/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formation_id, prompt, thread_id }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to invoke agent");
  }

  return response.json();
}

export async function applyChanges(
  formation_id: number,
  proposed_structure: any
) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/cursor/apply-changes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formation_id, proposed_structure }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to apply changes");
  }

  return response.json();
} 