import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => Promise<void>;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUploadClick = async () => {
    if (selectedFiles) {
      await onUpload(selectedFiles);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Téléverser des documents</DialogTitle>
          <DialogDescription>Sélectionnez les fichiers à ajouter à votre base de connaissances.</DialogDescription>
        </DialogHeader>
        <Input type="file" multiple onChange={handleFileChange} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleUploadClick} disabled={!selectedFiles}>Téléverser</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};