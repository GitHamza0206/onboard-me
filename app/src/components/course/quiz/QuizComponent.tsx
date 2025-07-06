import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/auth/authContext';
import { submitQuiz, convertQuizAnswersToSubmission, QuizResult } from '@/api/quiz';

interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
  explanation?: string;
}

interface QuizComponentProps {
  title: string;
  questions: QuizQuestion[];
  quizId: number;
  onComplete: (passed: boolean) => void;
  onRetry?: () => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  title,
  questions,
  quizId,
  onComplete,
  onRetry
}) => {
  const { token } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: [answerId] // Convertir en array pour supporter les questions à choix multiples
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleShowResults = async () => {
    if (!token) {
      setSubmitError("Token d'authentification manquant");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convertir les réponses au format API
      const submissionData = convertQuizAnswersToSubmission(quizId, selectedAnswers);
      const response = await submitQuiz(quizId, submissionData);
      const result = await response.json();
      
      setQuizResult(result);
      setQuizCompleted(true);
      setShowResults(true);
      
      // Ne pas appeler automatiquement onComplete - laisser l'utilisateur cliquer sur "Continuer"
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission du quiz:', error);
      setSubmitError(error.message || "Erreur lors de la soumission du quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (quizResult) {
      return quizResult.percentage;
    }
    // Calcul local pour l'affichage avant soumission
    const correctAnswers = questions.filter(question => {
      const selectedAnswerIds = selectedAnswers[question.id];
      if (!selectedAnswerIds || selectedAnswerIds.length === 0) return false;
      const selectedAnswer = question.answers.find(a => a.id === selectedAnswerIds[0]);
      return selectedAnswer?.isCorrect;
    });
    return (correctAnswers.length / questions.length) * 100;
  };

  const isAnswerSelected = selectedAnswers[currentQuestion?.id] && selectedAnswers[currentQuestion?.id].length > 0;

  if (showResults) {
    const score = calculateScore();
    const passed = quizResult ? quizResult.passed : score >= 70;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <Trophy className="w-16 h-16 text-yellow-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Félicitations !' : 'Résultats du Quiz'}
          </CardTitle>
          {quizResult && (
            <p className="text-sm text-gray-600 mt-2">
              {quizResult.message}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {Math.round(score)}%
            </div>
            <div className="text-gray-600">
              {quizResult ? (
                `${quizResult.score} / ${quizResult.max_score} points`
              ) : (
                `${questions.filter(q => {
                  const selectedAnswerIds = selectedAnswers[q.id];
                  if (!selectedAnswerIds || selectedAnswerIds.length === 0) return false;
                  const selectedAnswer = q.answers.find(a => a.id === selectedAnswerIds[0]);
                  return selectedAnswer?.isCorrect;
                }).length} / ${questions.length} bonnes réponses`
              )}
            </div>
            {quizResult && (
              <div className="text-sm text-gray-500 mt-1">
                Tentative {quizResult.attempt_number} / {quizResult.max_attempts}
              </div>
            )}
          </div>

          <Progress value={score} className="w-full" />

          <div className="space-y-4">
            {questions.map((question, index) => {
              const selectedAnswerIds = selectedAnswers[question.id];
              const selectedAnswerId = selectedAnswerIds && selectedAnswerIds.length > 0 ? selectedAnswerIds[0] : null;
              const selectedAnswer = selectedAnswerId ? question.answers.find(a => a.id === selectedAnswerId) : null;
              const isCorrect = selectedAnswer?.isCorrect;

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Question {index + 1}: {question.question}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Votre réponse: {selectedAnswer?.text || "Aucune réponse"}
                      </div>
                      {!isCorrect && (
                        <div className="text-sm text-green-600 mt-1">
                          Bonne réponse: {question.answers.find(a => a.isCorrect)?.text}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="text-sm text-blue-600 mt-2 italic">
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            {passed ? (
              <Button onClick={() => onComplete(true)}>Continuer</Button>
            ) : (
              <div className="space-x-4">
                {onRetry && (
                  <Button variant="outline" onClick={onRetry}>
                    Recommencer
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">{title}</CardTitle>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">
          {currentQuestion.question}
        </div>

        <RadioGroup
          value={selectedAnswers[currentQuestion.id] && selectedAnswers[currentQuestion.id].length > 0 ? selectedAnswers[currentQuestion.id][0] : ''}
          onValueChange={handleAnswerSelect}
          className="space-y-3"
        >
          {currentQuestion.answers.map((answer) => (
            <div key={answer.id} className="flex items-center space-x-2">
              <RadioGroupItem value={answer.id} id={answer.id} />
              <Label 
                htmlFor={answer.id} 
                className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                  selectedAnswers[currentQuestion.id] && selectedAnswers[currentQuestion.id].includes(answer.id)
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                {answer.text}
                {/* Affichage "Bonne réponse" pour le mode test */}
                {answer.isCorrect && (
                  <span className="text-green-600 text-sm ml-2 font-medium">
                    (Bonne réponse)
                  </span>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Précédent
          </Button>
          
          <Button
            onClick={isLastQuestion ? handleShowResults : handleNext}
            disabled={!isAnswerSelected || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Soumission...
              </>
            ) : (
              isLastQuestion ? 'Voir les résultats' : 'Suivant'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};