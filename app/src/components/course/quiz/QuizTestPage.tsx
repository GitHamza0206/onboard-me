import React, { useState } from 'react';
import { ModuleQuiz } from './ModuleQuiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuizTestPage: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setQuizCompleted(false);
  };

  const handleQuizComplete = () => {
    // Logic to handle quiz completion, e.g., navigate to next module
  };

  const handleRetry = () => {
    setShowQuiz(true);
    setQuizCompleted(false);
  };

  if (showQuiz) {
    return (
      <ModuleQuiz
        moduleTitle="Introduction à JavaScript"
        moduleId="module_1"
        onQuizComplete={handleQuizComplete}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Test du Composant Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!quizCompleted ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Module: Introduction à JavaScript
                </h2>
                <p className="text-gray-600 mb-6">
                  Vous avez terminé toutes les leçons de ce module. 
                  Testez vos connaissances avec le quiz de fin de module.
                </p>
                <Button onClick={handleStartQuiz} size="lg">
                  Commencer le Quiz
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4 text-green-600">
                  ✅ Quiz Terminé !
                </h2>
                <p className="text-gray-600 mb-6">
                  Félicitations ! Vous pouvez maintenant passer au module suivant.
                </p>
                <div className="space-x-4">
                  <Button onClick={handleRetry} variant="outline">
                    Refaire le Quiz
                  </Button>
                  <Button>Passage au module suivant</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};