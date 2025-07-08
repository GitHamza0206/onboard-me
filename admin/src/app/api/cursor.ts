const API_URL = import.meta.env.VITE_API_URL;
import { FormationStructure } from "@/types/formation";

export async function invokeAgent(
  formationId: number, 
  prompt: string, 
  threadId: string | null,
  formation: FormationStructure
) {
  const response = await fetch(`${API_URL}/cursor/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      formation_id: formationId, 
      prompt: prompt,
      thread_id: threadId,
      formation_structure: formation // Pass the whole structure
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to invoke agent: ${response.status} ${errorBody}`);
  }
  return response.json();
}

export async function applyChanges(formationId: number, proposedStructure: any) {
  const response = await fetch(`${API_URL}/cursor/apply-changes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formation_id: formationId, proposed_structure: proposedStructure }),
  });
  if (!response.ok) {
    throw new Error('Failed to apply changes');
  }
  return response.json();
} 