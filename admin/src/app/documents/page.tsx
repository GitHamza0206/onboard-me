import { useState } from 'react';
import { useDocumentManagement } from '@/hooks/useDocumentManagement';
import { DocumentList } from '@/components/document-management/DocumentList';
import { FileUploadModal } from '@/components/document-management/FileUploadModal';
import { PreviewModal } from '@/components/document-management/PreviewModal';
import { SimbaDoc } from '@/types/document';
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DocumentManagementPage() {
    const {
        documents,
        isLoading,
        fetchDocuments,
        handleDelete,
        handleUpload,
        handleDocumentUpdate,
    } = useDocumentManagement();

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<SimbaDoc | null>(null);

    const handlePreview = (doc: SimbaDoc) => {
        setSelectedDocument(doc);
        setIsPreviewModalOpen(true);
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="h-screen w-full flex flex-col bg-muted/40">
                    <div className="p-6 pb-2">
                        <h1 className="text-2xl font-bold">Gestion des Documents</h1>
                        <p className="text-muted-foreground">Gérez votre base de connaissances.</p>
                    </div>

                    <DocumentList
                        documents={documents}
                        isLoading={isLoading}
                        fetchDocuments={fetchDocuments}
                        onDelete={handleDelete}
                        onUploadClick={() => setIsUploadModalOpen(true)}
                        onPreview={handlePreview}
                        onDocumentUpdate={handleDocumentUpdate}
                    />

                    <FileUploadModal
                        isOpen={isUploadModalOpen}
                        onClose={() => setIsUploadModalOpen(false)}
                        onUpload={handleUpload}
                    />

                    <PreviewModal
                        isOpen={isPreviewModalOpen}
                        onClose={() => setIsPreviewModalOpen(false)}
                        document={selectedDocument}
                    />

                </div>
            </SidebarInset>
        </SidebarProvider >
    );
}