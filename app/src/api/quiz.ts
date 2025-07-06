// API calls pour récupérer les quiz depuis la base de données
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

export interface QuizSubmissionAnswer {
  question_id: number;
  selected_answer_ids: number[];
}

export interface QuizSubmissionData {
  quiz_id: number;
  answers: QuizSubmissionAnswer[];
}

export interface QuizResult {
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  passing_score: number;
  attempt_number: number;
  max_attempts: number;
  message: string;
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
 * Récupère tous les quiz d'une formation
 */
export async function getFormationQuizzes(
  token: string,
  formationId: string
): Promise<Quiz[]> {
  try {
    const response = await fetch(`${apiUrl}/quiz/formation/${formationId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      // Aucun quiz trouvé pour cette formation
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch formation quizzes: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching formation quizzes:', error);
    return [];
  }
}

/**
 * Soumet les réponses d'un quiz
 */
export async function submitQuiz(
  token: string,
  submissionData: QuizSubmissionData
): Promise<QuizResult> {
  try {
    const response = await fetch(`${apiUrl}/quiz/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to submit quiz: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
}

/**
 * Convertit un quiz de l'API vers le format attendu par QuizComponent
 */
export function convertQuizToComponentFormat(quiz: Quiz) {
  return {
    title: quiz.title,
    questions: quiz.questions
      .sort((a, b) => a.order_index - b.order_index)
      .map(question => ({
        id: question.id.toString(),
        question: question.question_text,
        answers: question.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map(answer => ({
            id: answer.id.toString(),
            text: answer.answer_text,
            isCorrect: answer.is_correct
          })),
        explanation: question.explanation
      }))
  };
}

/**
 * Convertit les réponses du QuizComponent vers le format API
 */
export function convertQuizAnswersToSubmission(
  quizId: number,
  userAnswers: { [questionId: string]: string[] }
): QuizSubmissionData {
  const answers: QuizSubmissionAnswer[] = Object.entries(userAnswers).map(
    ([questionId, selectedAnswerIds]) => ({
      question_id: parseInt(questionId),
      selected_answer_ids: selectedAnswerIds.map(id => parseInt(id))
    })
  );

  return {
    quiz_id: quizId,
    answers
  };
}