// src/app/generation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { GenerationPage as StructurePage } from "./structure";
import { OnboardingPage } from "./content";

// Définir une interface pour la structure de la formation
interface FormationData {
  title: string;
  has_content: boolean;
  modules: any[]; // Remplacez 'any' par des types plus stricts si vous le souhaitez
}

export default function GenerationEntryPage() {
  const { courseId } = useParams();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 👇 1. Stocker l'objet formation entier
  const [formation, setFormation] = useState<FormationData | null>(null);

  useEffect(() => {
    if (!courseId || !token) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    (async () => {
      try {
        const res = await fetch(`${apiUrl}/formations/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de récupérer la formation");

        const data = await res.json();
        // 👇 2. Mettre à jour l'état avec toutes les données
        setFormation(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, token]); // Retirer apiUrl des dépendances

  if (loading) return <p className="p-8">Chargement…</p>;
  if (error) return <p className="p-8 text-destructive">{error}</p>;

  // 👇 3. Passer la formation en prop si elle existe et a du contenu
  return formation && formation.has_content
    ? <OnboardingPage formation={formation} />
    : <StructurePage />;
}