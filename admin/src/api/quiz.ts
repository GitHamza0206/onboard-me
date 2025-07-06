// API calls pour récupérer les quiz depuis la base de données (Admin)
const apiUrl = import.meta.env.VITE_API_URL;

export interface QuizAnswer {
  id: number;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: string;
  explanation: string;
  order_index: number;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: number;
  module_id: number;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  time_limit?: number;
  is_active: boolean;
  questions: QuizQuestion[];
}

/**
 * Récupère le quiz d'un module spécifique
 */
export async function getModuleQuiz(
  token: string,
  moduleId: string
): Promise<Quiz | null> {
  try {
    const numericModuleId = parseInt(moduleId.replace('module_', ''));
    
    const response = await fetch(`${apiUrl}/quiz/module/${numericModuleId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      // Aucun quiz trouvé pour ce module
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching module quiz:', error);
    return null;
  }
}

/**
 * Convertit un quiz de l'API vers le format attendu par AdminQuizViewer
 */
export function convertQuizToAdminFormat(quiz: Quiz, moduleTitle: string) {
  return {
    id: `quiz_${quiz.module_id}`,
    title: quiz.title,
    moduleTitle,
    moduleId: `module_${quiz.module_id}`,
    questions: quiz.questions
      .sort((a, b) => a.order_index - b.order_index)
      .map(question => ({
        id: question.id.toString(),
        question_text: question.question_text,
        question_type: question.question_type,
        explanation: question.explanation || '',
        answers: question.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map(answer => ({
            id: answer.id.toString(),
            answer_text: answer.answer_text,
            is_correct: answer.is_correct
          }))
      }))
  };
}