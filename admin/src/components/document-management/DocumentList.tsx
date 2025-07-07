// src/components/document-management/DocumentList.tsx

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimbaDoc } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, PlusIcon, Eye, Play, Trash2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentListProps {
    documents: SimbaDoc[];
    isLoading: boolean;
    onDelete: (id: number) => void;
    onUploadClick: () => void;
    onPreview: (document: SimbaDoc) => void;
    fetchDocuments: () => void;
    onDocumentUpdate: (document: SimbaDoc) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    isLoading,
    onDelete,
    onUploadClick,
    onPreview,
    fetchDocuments,
}) => {

    const renderEmptyState = () => (
        <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-lg font-semibold">No document found</h3>
            <p className="text-sm mt-1">Start by uploading your first document.</p>
            <Button size="sm" className="mt-4" onClick={onUploadClick}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload a document
            </Button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <Input placeholder="Rechercher des documents..." className="h-9 w-full max-w-xs" />
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={isLoading}>
                        <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />Refresh
                    </Button>
                    <Button size="sm" onClick={onUploadClick}>
                        <PlusIcon className="h-4 w-4 mr-2" />Upload
                    </Button>
                </div>
            </div>

            <Card className="border rounded-lg overflow-hidden">
                {documents.length === 0 && !isLoading ? renderEmptyState() : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-8"><Checkbox /></TableHead>
                                <TableHead>File Name</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    <TableCell colSpan={4} className="p-4"><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{doc.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => onPreview(doc)} title="Prévisualiser"><Eye className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" title="Parser"><Play className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)} title="Supprimer"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};