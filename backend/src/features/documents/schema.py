# features/documents/schema.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# Schéma pour créer un document - le contenu est extrait du fichier
class DocumentCreate(BaseModel):
    title: str
    # 'contents' is removed, it will be extracted from the file

# Schéma pour la réponse d'un document
class Document(BaseModel):
    id: int
    title: str
    contents: str
    profile_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Schéma pour la mise à jour d'un document
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    contents: Optional[str] = None