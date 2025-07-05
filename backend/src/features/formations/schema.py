# features/formations/schema.py
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

# Schéma pour la réponse d'une formation
class Formation(BaseModel):
    id: int
    nom: str

# Schéma pour la requête d'assignation d'une formation
class UserFormationAssign(BaseModel):
    user_id: UUID
    formation_id: int