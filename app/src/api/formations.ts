// src/api/formations.ts
const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Defines the structure for a lesson's data.
 */
export interface LessonData {
  id: string;
  title: string;
  description: string;
  content: string;
  type?: 'lesson' | 'quiz';
  moduleId?: string;
}

/**
 * Defines the structure for a module, which contains multiple lessons.
 */
export interface ModuleData {
  id: string;
  title: string;
  lessons: LessonData[];
  is_accessible?: boolean;
}

/**
 * Defines the structure for progression summary.
 */
export interface ProgressionSummary {
  total_modules: number;
  accessible_modules_count: number;
  completed_modules: number;
  current_module_index: number;
  progress_percentage: number;
}

/**
 * Defines the overall structure for a formation (course).
 */
export interface FormationData {
  title: string;
  has_content: boolean;
  modules: ModuleData[];
}

/**
 * Defines the structure for a formation with progression data.
 */
export interface FormationWithProgression {
  title: string;
  has_content: boolean;
  modules: ModuleData[];
  progression: ProgressionSummary;
}

/**
 * Defines the structure for formation list item with progression.
 */
export interface FormationListItem {
  id: number;
  nom: string;
  progression: ProgressionSummary;
}

/**
 * Fetches the detailed structure of a specific formation from the backend.
 * This version does not include progression data - use getFormationWithProgression for users.
 *
 * @param token The JWT for authorization.
 * @param formationId The ID of the formation to fetch.
 * @returns A promise that resolves to the formation's data.
 */
export async function getFormationDetails(
  token: string,
  formationId: string
): Promise<FormationData> {
  const response = await fetch(`${apiUrl}/formations/${formationId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Formation not found.");
    }
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch formation details.");
  }

  const data = await response.json();
  
  // Inject quiz lessons at the end of each module
  return injectQuizLessons(data);
}

/**
 * Fetches the formation with progression data for the current user.
 * Only returns modules that are accessible based on quiz completion.
 *
 * @param token The JWT for authorization.
 * @param formationId The ID of the formation to fetch.
 * @returns A promise that resolves to the formation's data with progression.
 */
export async function getFormationWithProgression(
  token: string,
  formationId: string
): Promise<FormationWithProgression> {
  const response = await fetch(`${apiUrl}/formations/${formationId}/with-progression`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Formation non assignée ou modules non accessibles.");
    }
    if (response.status === 404) {
      throw new Error("Formation non trouvée.");
    }
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération de la formation.");
  }

  const data = await response.json();
  
  // Inject quiz lessons at the end of each module while preserving accessibility
  return {
    ...data,
    modules: data.modules.map((module: ModuleData) => ({
      ...injectQuizForModule(module),
      is_accessible: module.is_accessible // Preserve the original accessibility from backend
    }))
  };
}

/**
 * Fetches the list of formations assigned to the current user with progression data.
 *
 * @param token The JWT for authorization.
 * @returns A promise that resolves to the list of formations with progression.
 */
export async function getUserFormations(
  token: string
): Promise<FormationListItem[]> {
  const response = await fetch(`${apiUrl}/formations/users/me/formations`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des formations.");
  }

  return response.json();
}

/**
 * Injects quiz lessons at the end of each module
 */
function injectQuizLessons(formation: FormationData): FormationData {
  const modulesWithQuiz = formation.modules.map(module => injectQuizForModule(module));

  return {
    ...formation,
    modules: modulesWithQuiz
  };
}

/**
 * Injects a quiz lesson at the end of a single module
 */
function injectQuizForModule(module: ModuleData): ModuleData {
  // Create a quiz lesson for the module
  const quizLesson: LessonData = {
    id: `quiz_${module.id}`,
    title: `Quiz - ${module.title}`,
    description: `Testez vos connaissances sur ${module.title}`,
    content: '', // Will be handled by QuizComponent
    type: 'quiz',
    moduleId: module.id
  };

  return {
    ...module,
    lessons: [...module.lessons, quizLesson]
  };
}