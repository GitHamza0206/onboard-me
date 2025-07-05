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