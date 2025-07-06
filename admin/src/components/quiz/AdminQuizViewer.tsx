import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, RotateCcw, HelpCircle } from 'lucide-react';
import { QuizQuestion, AdminQuizDisplayData } from './types';

interface AdminQuizViewerProps {
  quiz: AdminQuizDisplayData;
  onClose?: () => void;
}

export const AdminQuizViewer: React.FC<AdminQuizViewerProps> = ({
  quiz,
  onClose
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<'preview' | 'test'>('preview');
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswerSelect = (answerId: string) => {
    if (viewMode === 'test') {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answerId
      }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion && viewMode === 'test') {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const calculateScore = () => {
    const correctAnswers = quiz.questions.filter(question => {
      const selectedAnswerId = selectedAnswers[question.id];
      const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
      return selectedAnswer?.is_correct;
    });
    return (correctAnswers.length / quiz.questions.length) * 100;
  };

  const resetTest = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setViewMode('preview');
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 70;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={onClose}>
              Retour
            </Button>
            <Badge variant={passed ? "default" : "destructive"}>
              {passed ? 'Réussi' : 'Échoué'}
            </Badge>
          </div>
          <CardTitle className="text-2xl">Résultats du Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {Math.round(score)}%
            </div>
            <div className="text-gray-600">
              {quiz.questions.filter(q => {
                const selectedAnswerId = selectedAnswers[q.id];
                const selectedAnswer = q.answers.find(a => a.id === selectedAnswerId);
                return selectedAnswer?.is_correct;
              }).length} / {quiz.questions.length} bonnes réponses
            </div>
          </div>

          <Progress value={score} className="w-full" />

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const selectedAnswerId = selectedAnswers[question.id];
              const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
              const correctAnswer = question.answers.find(a => a.is_correct);
              const isCorrect = selectedAnswer?.is_correct;

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
                        Question {index + 1}: {question.question_text}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Réponse choisie: {selectedAnswer?.answer_text || 'Aucune'}
                      </div>
                      {!isCorrect && (
                        <div className="text-sm text-green-600 mt-1">
                          Bonne réponse: {correctAnswer?.answer_text}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="text-sm text-blue-600 mt-2 italic">
                          Explication: {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={resetTest}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Module: {quiz.moduleTitle}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button
              variant={viewMode === 'test' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('test')}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Tester
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Fermer
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} sur {quiz.questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">
          {currentQuestion.question_text}
        </div>

        <div className="space-y-3">
          {currentQuestion.answers.map((answer) => (
            <div key={answer.id} className="flex items-center space-x-2">
              {viewMode === 'test' ? (
                <>
                  <RadioGroup
                    value={selectedAnswers[currentQuestion.id] || ''}
                    onValueChange={handleAnswerSelect}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label 
                        htmlFor={answer.id} 
                        className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                          selectedAnswers[currentQuestion.id] === answer.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {answer.answer_text}
                      </Label>
                    </div>
                  </RadioGroup>
                </>
              ) : (
                <div className={`flex-1 p-3 rounded-lg border ${
                  answer.is_correct 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{answer.answer_text}</span>
                    {answer.is_correct && (
                      <Badge variant="default" className="ml-2">
                        Correcte
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {viewMode === 'preview' && currentQuestion.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Explication:</h4>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Précédent
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={viewMode === 'test' && !selectedAnswers[currentQuestion.id]}
          >
            {isLastQuestion 
              ? viewMode === 'test' ? 'Voir les résultats' : 'Terminer'
              : 'Suivant'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};