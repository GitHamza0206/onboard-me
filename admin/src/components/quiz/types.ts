// Types pour les quiz dans l'interface admin
export interface QuizAnswer {
  id: string;
  answer_text: string;
  is_correct: boolean;
  order_index?: number;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  explanation?: string;
  answers: QuizAnswer[];
  points?: number;
  order_index?: number;
}

export interface QuizData {
  id: number;
  module_id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passing_score: number;
  max_attempts: number;
  time_limit?: number;
  is_active: boolean;
}

// Types adaptés pour l'affichage dans l'admin
export interface AdminQuizDisplayData {
  id: string;
  title: string;
  questions: QuizQuestion[];
  moduleTitle: string;
  moduleId: string;
}