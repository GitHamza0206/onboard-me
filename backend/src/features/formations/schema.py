# features/formations/schema.py

from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

# --- SCHÉMAS POUR LA STRUCTURE ---

class SubmoduleStructure(BaseModel):
    id: str
    title: str
    description: str
    content: Optional[str] = ""

class ModuleStructure(BaseModel):
    id: str
    title: str
    lessons: List[SubmoduleStructure] = Field(..., alias="lessons")

class ModuleWithProgression(BaseModel):
    id: str
    title: str
    lessons: List[SubmoduleStructure] = Field(..., alias="lessons")
    is_accessible: bool = True

class FormationStructureCreate(BaseModel):
    title: str
    has_content: bool = Field(default=False, alias="has_content")
    modules: List[ModuleStructure]

class ProgressionSummary(BaseModel):
    total_modules: int
    accessible_modules_count: int
    completed_modules: int
    current_module_index: int
    progress_percentage: int

class FormationWithProgression(BaseModel):
    title: str
    has_content: bool = Field(default=False, alias="has_content")
    modules: List[ModuleWithProgression]
    progression: ProgressionSummary

class FormationWithProgressionSummary(BaseModel):
    id: int
    nom: str
    progression: ProgressionSummary

# --- SCHÉMAS EXISTANTS ---

class Formation(BaseModel):
    id: int
    nom: str

class UserFormationAssign(BaseModel):
    user_id: UUID
    formation_id: int
    
class ModuleUpdate(BaseModel):
    titre: str | None = None
    index: int | None = None   
    
class SubmoduleUpdate(BaseModel):
    titre: str | None = None
    description: str | None = None
    index: int | None = None
    content: Optional[str] = None