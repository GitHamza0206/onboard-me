import { useState, useCallback, useEffect } from 'react';
import { SimbaDoc } from '@/types/document';
import { useToast } from "@/hooks/use-toast";

// --- Données de démonstration ---
const initialDocs: SimbaDoc[] = [
];
import { useAuth } from '@/app/auth/authContext'; // Import useAuth to get the token

export const useDocumentManagement = () => {
    const [documents, setDocuments] = useState<SimbaDoc[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { token } = useAuth(); // Get the auth token
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // --- 1. Connect fetchDocuments to the backend ---
    const fetchDocuments = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/documents/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch documents.");
            const data: SimbaDoc[] = await response.json();
            setDocuments(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, token, toast]);

    // Fetch documents on initial load
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // --- 2. Connect handleUpload to the backend ---
    const handleUpload = useCallback(async (files: FileList) => {
        if (!token) return;

        setIsLoading(true);
        toast({ title: "Uploading...", description: `Processing ${files.length} file(s).` });

        // We use Promise.all to handle all file uploads concurrently
        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData();
            formData.append('title', file.name); // The backend expects a title
            formData.append('file', file);      // And the file itself

            return fetch(`${apiUrl}/documents/`, {
                method: 'POST',
                headers: {
                    // Note: 'Content-Type' is set automatically by the browser for FormData
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
        });

        try {
            const responses = await Promise.all(uploadPromises);

            // Check if any of the uploads failed
            const failedUploads = responses.filter(res => !res.ok);
            if (failedUploads.length > 0) {
                throw new Error(`${failedUploads.length} file(s) failed to upload.`);
            }

            toast({ title: "✅ Success", description: "All files uploaded successfully." });
            fetchDocuments(); // Refresh the list with the new documents
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Upload Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, token, toast, fetchDocuments]);

    // --- 3. Connect handleDelete to the backend ---
    const handleDelete = useCallback(async (id: string | number) => { // Accept number or string
        if (!token) return;
        if (!window.confirm(`Are you sure you want to delete this document?`)) return;

        try {
            const response = await fetch(`${apiUrl}/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const errData = await response.json();
                throw new Error(errData.detail || "Failed to delete document.");
            }
            toast({ title: "Success", description: "Document deleted." });
            fetchDocuments(); // Refresh the list
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    }, [apiUrl, token, toast, fetchDocuments]);

    // --- 4. Connect handleDocumentUpdate to the backend (Bonus) ---
    const handleDocumentUpdate = useCallback(async (updatedDoc: SimbaDoc) => {
        if (!token) return;

        try {
            const response = await fetch(`${apiUrl}/documents/${updatedDoc.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: updatedDoc.metadata.filename,
                    // You can add other fields to update here
                })
            });
             if (!response.ok) {
                 const errData = await response.json();
                throw new Error(errData.detail || "Failed to update document.");
            }
            toast({ title: "Success", description: "Document updated." });
            fetchDocuments();
        } catch(error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    }, [apiUrl, token, toast, fetchDocuments]);

    return {
        documents,
        isLoading,
        fetchDocuments,
        handleDelete,
        handleUpload,
        handleDocumentUpdate,
    };
};