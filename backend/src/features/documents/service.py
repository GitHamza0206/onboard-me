# backend/src/features/documents/service.py
import logging
from typing import List
from fastapi import UploadFile
from unstructured.partition.auto import partition
from postgrest import APIResponse
from src.supabase_client import supabase
from . import schema

class DocumentNotFound(Exception):
    pass

class NoFieldsToUpdate(Exception):
    pass

class DocumentServiceError(Exception):
    pass

class DocumentService:
    def __init__(self):
        # In a real app, supabase client might be injected
        self.supabase = supabase

    def create_document(self, user_id: str, title: str, file: UploadFile) -> schema.Document:
        try:
            elements = partition(file=file.file, content_type=file.content_type)
            extracted_content = "\n\n".join([str(el) for el in elements])

            response: APIResponse = self.supabase.table('documents').insert({
                'title': title,
                'contents': extracted_content,
                'profile_id': user_id
            }).execute()

            if not response.data:
                 raise DocumentServiceError("Failed to create document: no data returned from Supabase.")

            return schema.Document.model_validate(response.data[0])

        except Exception as e:
            logging.error(f"An error occurred in DocumentService.create_document: {e}", exc_info=True)
            raise DocumentServiceError(str(e)) from e

    def get_user_documents(self, user_id: str) -> List[schema.Document]:
        try:
            response: APIResponse = self.supabase.table('documents').select('*').eq('profile_id', user_id).execute()
            return [schema.Document.model_validate(doc) for doc in response.data]
        except Exception as e:
            logging.error(f"An error occurred in DocumentService.get_user_documents: {e}", exc_info=True)
            raise DocumentServiceError(str(e)) from e

    def get_document(self, user_id: str, document_id: int) -> schema.Document:
        try:
            response: APIResponse = self.supabase.table('documents').select('*').eq('id', document_id).eq('profile_id', user_id).single().execute()
            
            if not response.data:
                raise DocumentNotFound("Document not found")
                
            return schema.Document.model_validate(response.data)
        except Exception as e:
            if "jsonb_path_query_first" in str(e) or "List" in str(e): # More robust error check for PostgREST single()
                 raise DocumentNotFound("Document not found") from e
            logging.error(f"An error occurred in DocumentService.get_document: {e}", exc_info=True)
            raise DocumentServiceError(str(e)) from e

    def update_document(self, user_id: str, document_id: int, document_update: schema.DocumentUpdate) -> schema.Document:
        self.get_document(user_id, document_id)

        update_data = document_update.dict(exclude_unset=True)

        if not update_data:
            raise NoFieldsToUpdate("No fields to update")
            
        try:
            response: APIResponse = self.supabase.table('documents').update(update_data).eq('id', document_id).eq('profile_id', user_id).execute()
            
            if not response.data:
                raise DocumentServiceError("Failed to update document: no data returned from Supabase.")

            return schema.Document.model_validate(response.data[0])
        except Exception as e:
            logging.error(f"An error occurred in DocumentService.update_document: {e}", exc_info=True)
            raise DocumentServiceError(str(e)) from e

    def delete_document(self, user_id: str, document_id: int) -> None:
        self.get_document(user_id, document_id)

        try:
            self.supabase.table('documents').delete().eq('id', document_id).eq('profile_id', user_id).execute()
        except Exception as e:
            logging.error(f"An error occurred in DocumentService.delete_document: {e}", exc_info=True)
            raise DocumentServiceError(str(e)) from e 