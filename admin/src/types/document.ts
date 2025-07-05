export interface Metadata {
  filename: string;
  type: string;
  uploadedAt: string;
  summary?: string;
  chunk_number?: number;
}

export interface DocumentChunk {
  id: string;
  page_content: string;
  metadata: Partial<Metadata>;
}

export interface SimbaDoc {
  id: string;
  documents: DocumentChunk[];
  metadata: Metadata;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}