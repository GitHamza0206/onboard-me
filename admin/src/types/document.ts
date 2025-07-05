export interface Metadata {
  filename: string;
  type: string;
  uploadedAt: string;
  summary?: string;
  chunk_number?: number;
}

export interface DocumentChunk {
  id: number; 
  page_content: string;
  metadata: Partial<Metadata>;
}


export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}


export interface SimbaDoc {
    id: number;
    title: string;
    contents: string;
    profile_id: string;
    created_at: string; 
}