# features/documents/router.py
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from src.features.auth.dependencies import get_current_user
from . import schema
from .service import DocumentService, DocumentNotFound, NoFieldsToUpdate, DocumentServiceError

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

# You can use a dependency injection system for the service in a real app
def get_document_service():
    return DocumentService()

@router.post("/", response_model=schema.Document, status_code=status.HTTP_201_CREATED)
def create_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
):
    """
    Crée un nouveau document en uploadant un fichier.
    Le contenu est automatiquement extrait par le parser.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        document = service.create_document(user_id=user_id, title=title, file=file)
        return document
    except DocumentServiceError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")

@router.get("/", response_model=List[schema.Document])
def get_user_documents(
    current_user: dict = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
):
    """
    Récupère tous les documents de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return service.get_user_documents(user_id=user_id)
    except DocumentServiceError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")


@router.get("/{document_id}", response_model=schema.Document)
def get_document(
    document_id: int,
    current_user: dict = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
):
    """
    Récupère un document spécifique de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        document = service.get_document(user_id=user_id, document_id=document_id)
        return document
    except DocumentNotFound as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DocumentServiceError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")


@router.put("/{document_id}", response_model=schema.Document)
def update_document(
    document_id: int,
    document_update: schema.DocumentUpdate,
    current_user: dict = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
):
    """
    Met à jour un document de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        updated_document = service.update_document(user_id=user_id, document_id=document_id, document_update=document_update)
        return updated_document
    except DocumentNotFound as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NoFieldsToUpdate as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DocumentServiceError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: dict = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
):
    """
    Supprime un document de l'utilisateur connecté.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        service.delete_document(user_id=user_id, document_id=document_id)
        return
    except DocumentNotFound as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DocumentServiceError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")