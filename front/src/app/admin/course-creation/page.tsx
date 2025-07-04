// src/app/admin/course-creation/page.tsx
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

export function AdminCourseUploadPage() {
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }, []);

    const removeFile = (fileName: string) => {
        setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'video/mp4': ['.mp4'],
        }
    });

    return (
        // Espacement responsive pour le conteneur principal
        <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 bg-white min-h-screen">
            <header>
                {/* Taille de texte responsive pour le titre */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upload Content</h1>
            </header>
            
            <main className="flex flex-col items-center justify-center w-full space-y-6">
                {/* Zone de Glisser-Déposer avec espacement responsive */}
                <div
                    {...getRootProps()}
                    className={`w-full max-w-4xl p-8 sm:p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/80'}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4 text-gray-600">
                        {/* Taille d'icône responsive */}
                        <UploadCloud className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                        {/* Taille de texte responsive pour la zone de dépôt */}
                        <p className="text-lg md:text-xl font-medium">
                            Drop files here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Supported file types: PDF, DOC, MP4, etc.
                        </p>
                        <Button variant="outline" className="mt-4 pointer-events-none">Browse Files</Button>
                    </div>
                </div>

                {/* Liste des fichiers uploadés (responsive) */}
                {files.length > 0 && (
                     <Card className="w-full max-w-4xl shadow-sm">
                        <CardHeader>
                            <CardTitle>File Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {files.map((file, index) => (
                                    // Sur mobile, le bouton passe en dessous. Sur écrans plus larges, il est à droite.
                                    <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/60 rounded-lg gap-3">
                                        <div className="flex items-center gap-3 min-w-0"> {/* min-w-0 permet la troncature du texte */}
                                            <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm font-medium truncate" title={file.name}>
                                                {file.name}
                                            </span>
                                            {/* La taille du fichier est masquée sur les très petits écrans */}
                                            <span className="text-xs text-muted-foreground hidden sm:inline-block flex-shrink-0 whitespace-nowrap">
                                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full self-end sm:self-center flex-shrink-0" 
                                            onClick={() => removeFile(file.name)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <div className="w-full max-w-4xl flex justify-end mt-4">
                    <Button size="lg" disabled={files.length === 0}>
                        Process Content
                    </Button>
                </div>
            </main>
        </div>
    );
}