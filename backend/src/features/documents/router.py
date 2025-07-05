# features/documents/router.py
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_user
from . import schema
import logging

# Import the partition function from unstructured
from unstructured.partition.auto import partition

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

@router.post("/", response_model=schema.Document)
def create_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Crée un nouveau document en uploadant un fichier.
    Le contenu est automatiquement extrait par le parser.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        elements = partition(file=file.file, content_type=file.content_type)
        
        extracted_content = "\n\n".join([str(el) for el in elements])

        response = supabase.table('documents').insert({
            'title': title,
            'contents': extracted_content,
            'profile_id': user_id
        }).execute()
        
        return response.data[0]

    except Exception as e:
        logging.error(f"An error occurred in create_document: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create document: {str(e)}")
    
@router.get("/", response_model=List[schema.Document])
def get_user_documents(
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère tous les documents de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        response = supabase.table('documents').select('*').eq('profile_id', user_id).execute()
        return response.data

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{document_id}", response_model=schema.Document)
def get_document(
    document_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère un document spécifique de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        response = supabase.table('documents').select('*').eq('id', document_id).eq('profile_id', user_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Document not found")
            
        return response.data

    except Exception as e:
        if "jsonb_path_query_first" in str(e) or "List" in str(e) : # More robust error check for PostgREST single()
             raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/{document_id}", response_model=schema.Document)
def update_document(
    document_id: int,
    document_update: schema.DocumentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Met à jour un document de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        # Vérifier que le document appartient à l'utilisateur
        existing_doc = supabase.table('documents').select('id').eq('id', document_id).eq('profile_id', user_id).single().execute()
        if not existing_doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        update_data = document_update.dict(exclude_unset=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = supabase.table('documents').update(update_data).eq('id', document_id).eq('profile_id', user_id).execute()
        
        return response.data[0]

    except Exception as e:
        if "jsonb_path_query_first" in str(e):
             raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Supprime un document de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        # Vérifier que le document appartient à l'utilisateur
        existing_doc = supabase.table('documents').select('id').eq('id', document_id).eq('profile_id', user_id).single().execute()
        if not existing_doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        supabase.table('documents').delete().eq('id', document_id).eq('profile_id', user_id).execute()
        
        return {"message": "Document deleted successfully"}

    except Exception as e:
        if "jsonb_path_query_first" in str(e):
             raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))