import React from 'react';
import { QuizComponent } from './QuizComponent';
import { sampleQuizData, generateSampleQuiz } from './sampleQuizData';

interface ModuleQuizProps {
  moduleTitle: string;
  moduleId: string;
  onQuizComplete: () => void;
  onRetry?: () => void;
}

export const ModuleQuiz: React.FC<ModuleQuizProps> = ({
  moduleTitle,
  moduleId,
  onQuizComplete,
  onRetry
}) => {
  // Pour l'instant, on utilise des données de test
  // Plus tard, on pourra récupérer les vraies données du backend
  const quizData = generateSampleQuiz(moduleTitle);

  const handleComplete = () => {
    console.log(`Quiz completed for module: ${moduleId}`);
    onQuizComplete();
  };

  const handleRetry = () => {
    console.log(`Quiz retry for module: ${moduleId}`);
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Fin du Module: {moduleTitle}
          </h1>
          <p className="text-gray-600">
            Testez vos connaissances avec ce quiz avant de passer au module suivant
          </p>
        </div>
        
        <QuizComponent
          title={quizData.title}
          questions={quizData.questions}
          onComplete={() => onComplete()}
          onRetry={() => onRetry()}
        />
      </div>
    </div>
  );
};