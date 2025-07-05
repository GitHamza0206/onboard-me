# domain/onboarding_models.py

from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Enum as SQLAlchemyEnum, 
    Text, Table, create_engine
)
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

# Table d'association pour la relation Many-to-Many entre Formation et Module
formation_modules_association = Table('formation_modules', Base.metadata,
    Column('formation_id', Integer, ForeignKey('formations.id')),
    Column('module_id', Integer, ForeignKey('modules.id'))
)

# Table d'association pour la relation Many-to-Many entre Module et Submodule
module_submodules_association = Table('module_submodules', Base.metadata,
    Column('module_id', Integer, ForeignKey('modules.id')),
    Column('submodule_id', Integer, ForeignKey('submodules.id'))
)

class Formation(Base):
    __tablename__ = 'formations'
    id = Column(Integer, primary_key=True)
    nom = Column(String, nullable=False)
    modules = relationship("Module", secondary=formation_modules_association, back_populates="formations")

class Module(Base):
    __tablename__ = 'modules'
    id = Column(Integer, primary_key=True)
    titre = Column(String, nullable=False)
    index = Column(Integer)
    formations = relationship("Formation", secondary=formation_modules_association, back_populates="modules")
    submodules = relationship("Submodule", secondary=module_submodules_association, back_populates="modules")

class Submodule(Base):
    __tablename__ = 'submodules'
    id = Column(Integer, primary_key=True)
    titre = Column(String, nullable=False)
    description = Column(Text)
    content = Column(Text)
    type = Column(String) # ex: 'video', 'text', 'quiz'
    index = Column(Integer)
    modules = relationship("Module", secondary=module_submodules_association, back_populates="submodules")

class UserFormationStatus(enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"

class UserFormation(Base):
    __tablename__ = 'user_formations'
    id = Column(Integer, primary_key=True)
    # Note: user_id sera une clé étrangère vers votre table utilisateur (gérée par Simba/Supabase ou locale)
    user_id = Column(String, nullable=False, index=True) 
    formation_id = Column(Integer, ForeignKey('formations.id'))
    status = Column(SQLAlchemyEnum(UserFormationStatus), default=UserFormationStatus.not_started)
    progression = Column(Integer, default=0) # Pourcentage de 0 à 100
    assigned_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    formation = relationship("Formation")

# Note: Vous aurez besoin de créer une table 'users' ou de lier `user_id` à votre système d'authentification.