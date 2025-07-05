# features/formations/schema.py

from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

# --- SCHÉMAS POUR LA STRUCTURE ---

class SubmoduleStructure(BaseModel):
    id: str
    title: str
    description: str

class ModuleStructure(BaseModel):
    id: str
    title: str
    lessons: List[SubmoduleStructure] = Field(..., alias="lessons")

class FormationStructureCreate(BaseModel):
    title: str
    modules: List[ModuleStructure]

# --- SCHÉMAS EXISTANTS ---

class Formation(BaseModel):
    id: int
    nom: str

class UserFormationAssign(BaseModel):
    user_id: UUID
    formation_id: int