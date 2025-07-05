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
          <DialogTitle>{document.metadata.filename}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Résumé</h3>
            <p className="text-sm text-muted-foreground mb-4">{document.metadata.summary || "Aucun résumé disponible."}</p>
            <h3 className="font-semibold mb-2">Chunks ({document.documents.length})</h3>
            <div className="space-y-4">
                {document.documents.map((chunk, i) => (
                    <div key={i} className="p-2 border rounded bg-gray-50/50 text-xs">
                        {chunk.page_content}
                    </div>
                ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};