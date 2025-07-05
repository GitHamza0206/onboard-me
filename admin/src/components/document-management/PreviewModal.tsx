// components/document-management/PreviewModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimbaDoc } from "@/types/document";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: SimbaDoc | null;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, document }) => {
    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                    {/* ✅ FIX: Use document.title */}
                    <DialogTitle>{document.title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-full p-4 border rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                        {/* ✅ FIX: Show the document's main content */}
                        {document.contents || "No content available."}
                    </pre>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};