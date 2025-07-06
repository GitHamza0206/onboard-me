// Données de test pour les quiz dans l'interface admin
import { AdminQuizDisplayData } from './types';

export const generateAdminSampleQuiz = (moduleTitle: string, moduleId: string): AdminQuizDisplayData => ({
  id: `quiz_${moduleId}`,
  title: `Quiz - ${moduleTitle}`,
  moduleTitle,
  moduleId,
  questions: [
    {
      id: `q1_${moduleId}`,
      question_text: "Quelle est la principale différence entre let et var en JavaScript ?",
      question_type: "multiple_choice",
      explanation: "let a une portée de bloc tandis que var a une portée de fonction.",
      answers: [
        { id: "a1", answer_text: "let est plus rapide que var", is_correct: false },
        { id: "a2", answer_text: "let a une portée de bloc, var a une portée de fonction", is_correct: true },
        { id: "a3", answer_text: "var est plus récent que let", is_correct: false },
        { id: "a4", answer_text: "Il n'y a pas de différence", is_correct: false }
      ]
    },
    {
      id: `q2_${moduleId}`,
      question_text: "Comment déclare-t-on une constante en JavaScript ?",
      question_type: "multiple_choice",
      explanation: "const est le mot-clé utilisé pour déclarer des constantes.",
      answers: [
        { id: "b1", answer_text: "var constant = 'valeur';", is_correct: false },
        { id: "b2", answer_text: "let constant = 'valeur';", is_correct: false },
        { id: "b3", answer_text: "const constant = 'valeur';", is_correct: true },
        { id: "b4", answer_text: "constant = 'valeur';", is_correct: false }
      ]
    },
    {
      id: `q3_${moduleId}`,
      question_text: "Que retourne typeof null en JavaScript ?",
      question_type: "multiple_choice",
      explanation: "typeof null retourne 'object' - c'est un bug historique de JavaScript.",
      answers: [
        { id: "c1", answer_text: "'null'", is_correct: false },
        { id: "c2", answer_text: "'undefined'", is_correct: false },
        { id: "c3", answer_text: "'object'", is_correct: true },
        { id: "c4", answer_text: "'boolean'", is_correct: false }
      ]
    },
    {
      id: `q4_${moduleId}`,
      question_text: "Quelle méthode permet d'ajouter un élément à la fin d'un tableau ?",
      question_type: "multiple_choice",
      explanation: "La méthode push() ajoute un ou plusieurs éléments à la fin d'un tableau.",
      answers: [
        { id: "d1", answer_text: "array.add()", is_correct: false },
        { id: "d2", answer_text: "array.push()", is_correct: true },
        { id: "d3", answer_text: "array.append()", is_correct: false },
        { id: "d4", answer_text: "array.insert()", is_correct: false }
      ]
    },
    {
      id: `q5_${moduleId}`,
      question_text: "Comment créer une fonction fléchée en JavaScript ?",
      question_type: "multiple_choice",
      explanation: "La syntaxe des fonctions fléchées est () => {}.",
      answers: [
        { id: "e1", answer_text: "function() => {}", is_correct: false },
        { id: "e2", answer_text: "() => {}", is_correct: true },
        { id: "e3", answer_text: "=> () {}", is_correct: false },
        { id: "e4", answer_text: "function => () {}", is_correct: false }
      ]
    }
  ]
});

// Quiz simple pour les tests
export const getSimpleAdminQuiz = (moduleTitle: string, moduleId: string): AdminQuizDisplayData => ({
  id: `simple_quiz_${moduleId}`,
  title: `Quiz Simple - ${moduleTitle}`,
  moduleTitle,
  moduleId,
  questions: [
    {
      id: `simple1_${moduleId}`,
      question_text: "Quelle est la couleur du ciel ?",
      question_type: "multiple_choice",
      explanation: "Le ciel est généralement bleu pendant la journée.",
      answers: [
        { id: "s1", answer_text: "Rouge", is_correct: false },
        { id: "s2", answer_text: "Bleu", is_correct: true },
        { id: "s3", answer_text: "Vert", is_correct: false },
        { id: "s4", answer_text: "Jaune", is_correct: false }
      ]
    },
    {
      id: `simple2_${moduleId}`,
      question_text: "Combien font 2 + 2 ?",
      question_type: "multiple_choice",
      explanation: "2 + 2 = 4, c'est une addition basique.",
      answers: [
        { id: "s5", answer_text: "3", is_correct: false },
        { id: "s6", answer_text: "4", is_correct: true },
        { id: "s7", answer_text: "5", is_correct: false },
        { id: "s8", answer_text: "6", is_correct: false }
      ]
    }
  ]
});