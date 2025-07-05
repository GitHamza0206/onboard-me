import { useState, useCallback } from 'react';
import { SimbaDoc } from '@/types/document';
import { useToast } from "@/hooks/use-toast";

// --- Données de démonstration ---
const initialDocs: SimbaDoc[] = [
  {
    id: 'doc_1',
    metadata: {
      filename: 'Rapport Annuel 2023.pdf', type: 'application/pdf', uploadedAt: '2025-06-15T10:00:00Z',
      enabled: true, parsing_status: 'SUCCESS', parser: 'docling',
      summary: 'Ce rapport détaille les performances financières...', file_path: '/path/to/doc1.pdf'
    },
    documents: [{ id: 'chunk_1', page_content: 'Contenu du chunk 1...', metadata: {} }]
  },
  {
    id: 'doc_2',
    metadata: {
      filename: 'Présentation Marketing.pptx', type: 'application/vnd.ms-powerpoint', uploadedAt: '2025-07-01T15:00:00Z',
      enabled: false, parsing_status: 'PENDING', parser: 'docling', file_path: '/path/to/doc2.pptx'
    },
    documents: []
  },
  {
    id: 'doc_3',
    metadata: {
      filename: 'Notes de réunion.docx', type: 'application/msword', uploadedAt: '2025-05-30T09:00:00Z',
      enabled: true, parsing_status: '', parser: 'docling', file_path: '/path/to/doc3.docx'
    },
    documents: []
  },
];

export const useDocumentManagement = () => {
  const [documents, setDocuments] = useState<SimbaDoc[]>(initialDocs);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    console.log("Fetching documents...");
    await new Promise(res => setTimeout(res, 500)); // Simule un appel réseau
    setDocuments(initialDocs);
    setIsLoading(false);
    toast({ title: "Documents rafraîchis" });
  }, [toast]);

  const handleDocumentUpdate = useCallback((updatedDoc: SimbaDoc) => {
    setDocuments(prevDocs => prevDocs.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ce document ?`)) return;
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({ title: "Succès", description: "Document supprimé." });
  }, [toast]);

  const handleUpload = useCallback(async (files: FileList) => {
    setIsLoading(true);
    toast({ title: "Téléversement...", description: `${files.length} fichier(s) en cours de traitement.` });
    
    await new Promise(res => setTimeout(res, 1500));

    const newDocs: SimbaDoc[] = Array.from(files).map((file, index) => ({
      id: `new_doc_${Date.now() + index}`,
      metadata: {
        filename: file.name, type: file.type, uploadedAt: new Date().toISOString(),
        enabled: false, parsing_status: '', file_path: `/${file.name}`,
      },
      documents: []
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    setIsLoading(false);
    toast({ title: "Succès", description: "Fichiers téléversés." });
  }, [toast]);

  return {
    documents,
    isLoading,
    fetchDocuments,
    handleDelete,
    handleUpload,
    handleDocumentUpdate,
  };
};