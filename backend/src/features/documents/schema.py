# features/documents/schema.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# Schéma pour créer un document
class DocumentCreate(BaseModel):
    title: str
    contents: str

# Schéma pour la réponse d'un document
class Document(BaseModel):
    id: UUID
    title: str
    contents: str
    profile_id: UUID
    created_at: datetime

# Schéma pour la mise à jour d'un document
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    contents: Optional[str] = None