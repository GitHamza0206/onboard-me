// src/app/generation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

// les deux écrans possibles
import { GenerationPage as StructurePage } from "./structure";   // éditeur de structure
import { OnboardingPage } from "./content";                      // lecteur de contenu

/**
 * Ce composant fait un 1er fetch sur /formations/:id
 * pour savoir si `has_content` est vrai.
 * Il délègue ensuite l'affichage au bon écran.
 */
export default function GenerationEntryPage() {
  const { courseId } = useParams();               // /generation/:courseId
  const { token }   = useAuth();
  const apiUrl      = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [loading, setLoading]       = useState(true);
  const [error,   setError]         = useState<string | null>(null);
  const [hasContent, setHasContent] = useState<boolean>(false);

  useEffect(() => {
    if (!courseId || !token) return;

    (async () => {
      try {
        const res = await fetch(`${apiUrl}/formations/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de récupérer la formation");

        const data = await res.json();           // { title, has_content, modules: [...] }
        setHasContent(Boolean(data.has_content));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, token]);

  /* ---------- UI ---------- */
  if (loading) return <p className="p-8">Chargement…</p>;
  if (error)   return <p className="p-8 text-destructive">{error}</p>;

  // —> on délègue !
  return hasContent
    ? <OnboardingPage   /* vous pouvez lui passer courseId si besoin */ />
    : <StructurePage />; // déjà implémenté dans structure.tsx
}
