export interface Metadata {
  filename: string;
  type: string;
  parsing_status?: 'SUCCESS' | 'FAILED' | 'PENDING' | '';
  loader?: string;
  parser?: string;
  file_path: string;
  is_folder?: boolean;
  enabled: boolean;
  uploadedAt: string;
  folder_id?: string | null;
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