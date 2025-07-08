// admin/src/types/formation.ts

export interface LessonStructure {
  id: string; // e.g., "lesson_123" or "new_1"
  title: string;
  description: string | null;
  content: string | null;
}

export interface ModuleStructure {
  id: string; // e.g., "module_456" or "new_2"
  title: string;
  lessons: LessonStructure[];
}

export interface FormationStructure {
  title: string;
  modules: ModuleStructure[];
} 