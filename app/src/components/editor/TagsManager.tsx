// src/components/editor/TagsManager.tsx

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';

// Simule la structure de votre objet TagRequest
interface TagRequest {
  tag: string;
  color?: string; // Optionnel
}

interface TagsManagerProps {
  tags: TagRequest[];
  setTags: React.Dispatch<React.SetStateAction<TagRequest[]>>;
}

export const TagsManager: React.FC<TagsManagerProps> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleOk = () => {
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
    setIsModalOpen(false);
    setInputValue("");
  };

  const removeTag = (labelToRemove: string) => {
    setTags(tags.filter(tag => tag.tag !== labelToRemove));
  };

  const addTag = (label: string) => {
    if (!tags.some(tag => tag.tag === label)) {
        setTags([...tags, { tag: label, color: "GREEN" }]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 w-full max-w-4xl">
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="group text-sm font-normal pr-1.5">
          {tag.tag}
          <button onClick={() => removeTag(tag.tag)} className="ml-1.5 rounded-full opacity-50 group-hover:opacity-100 transition-opacity">
            <X size={12} />
          </button>
        </Badge>
      ))}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <Plus size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau tag</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nom du tag..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleOk()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleOk}>Ajouter le tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};