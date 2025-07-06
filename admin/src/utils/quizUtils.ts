// Utilitaires pour la gestion des quiz dans l'interface admin

interface LessonData {
  id: string;
  title: string;
  description: string;
  content: string;
  type?: 'lesson' | 'quiz';
  moduleId?: string;
}

interface ModuleData {
  id: string;
  title: string;
  lessons: LessonData[];
}

interface FormationData {
  title: string;
  modules: ModuleData[];
}

/**
 * Injecte des quiz à la fin de chaque module pour l'interface admin
 */
export function injectQuizLessonsForAdmin(formation: FormationData): FormationData {
  const modulesWithQuiz = formation.modules.map(module => {
    // Créer un quiz leçon pour chaque module
    const quizLesson: LessonData = {
      id: `quiz_${module.id}`,
      title: `Quiz - ${module.title}`,
      description: `Quiz de validation pour le module ${module.title}`,
      content: '', // Sera géré par le composant quiz
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

/**
 * Filtre les quiz d'une formation pour ne garder que les vraies leçons
 */
export function filterQuizFromFormation(formation: FormationData): FormationData {
  const modulesWithoutQuiz = formation.modules.map(module => ({
    ...module,
    lessons: module.lessons.filter(lesson => lesson.type !== 'quiz')
  }));

  return {
    ...formation,
    modules: modulesWithoutQuiz
  };
}

/**
 * Vérifie si une leçon est un quiz
 */
export function isQuizLesson(lesson: LessonData): boolean {
  return lesson.type === 'quiz' || lesson.id.startsWith('quiz_');
}