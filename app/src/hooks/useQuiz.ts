import { useState, useEffect } from 'react';
import { getModuleQuiz, convertQuizToComponentFormat, Quiz } from '@/api/quiz';
import { useAuth } from '@/app/auth/authContext';

interface UseQuizResult {
  quiz: any | null;
  quizId: number | null;
  loading: boolean;
  error: string | null;
  hasQuiz: boolean;
}

export function useQuiz(moduleId: string | undefined): UseQuizResult {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!moduleId || !token) {
      setQuiz(null);
      setQuizId(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const quizData = await getModuleQuiz(token, moduleId);
        
        if (quizData) {
          const formattedQuiz = convertQuizToComponentFormat(quizData);
          setQuiz(formattedQuiz);
          setQuizId(quizData.id);
        } else {
          setQuiz(null);
          setQuizId(null);
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        setQuiz(null);
        setQuizId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [moduleId, token]);

  return {
    quiz,
    quizId,
    loading,
    error,
    hasQuiz: quiz !== null
  };
}