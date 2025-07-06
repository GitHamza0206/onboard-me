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
 * Fetches the detailed structure of a specific formation from the backend.
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
 * Injects quiz lessons at the end of each module
 */
function injectQuizLessons(formation: FormationData): FormationData {
  const modulesWithQuiz = formation.modules.map(module => {
    // Create a quiz lesson for each module
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
  });

  return {
    ...formation,
    modules: modulesWithQuiz
  };
}