// Données de test pour le quiz générique
export const sampleQuizData = {
  title: "Quiz de fin de module",
  questions: [
    {
      id: "q1",
      question: "Quelle est la principale différence entre let et var en JavaScript ?",
      answers: [
        { id: "a1", text: "let est plus rapide que var", isCorrect: false },
        { id: "a2", text: "let a une portée de bloc, var a une portée de fonction", isCorrect: true },
        { id: "a3", text: "var est plus récent que let", isCorrect: false },
        { id: "a4", text: "Il n'y a pas de différence", isCorrect: false }
      ],
      explanation: "let a une portée de bloc tandis que var a une portée de fonction."
    },
    {
      id: "q2",
      question: "Comment déclare-t-on une constante en JavaScript ?",
      answers: [
        { id: "b1", text: "var constant = 'valeur';", isCorrect: false },
        { id: "b2", text: "let constant = 'valeur';", isCorrect: false },
        { id: "b3", text: "const constant = 'valeur';", isCorrect: true },
        { id: "b4", text: "constant = 'valeur';", isCorrect: false }
      ],
      explanation: "const est le mot-clé utilisé pour déclarer des constantes."
    },
    {
      id: "q3",
      question: "Que retourne typeof null en JavaScript ?",
      answers: [
        { id: "c1", text: "'null'", isCorrect: false },
        { id: "c2", text: "'undefined'", isCorrect: false },
        { id: "c3", text: "'object'", isCorrect: true },
        { id: "c4", text: "'boolean'", isCorrect: false }
      ],
      explanation: "typeof null retourne 'object' - c'est un bug historique de JavaScript."
    },
    {
      id: "q4",
      question: "Quelle méthode permet d'ajouter un élément à la fin d'un tableau ?",
      answers: [
        { id: "d1", text: "array.add()", isCorrect: false },
        { id: "d2", text: "array.push()", isCorrect: true },
        { id: "d3", text: "array.append()", isCorrect: false },
        { id: "d4", text: "array.insert()", isCorrect: false }
      ],
      explanation: "La méthode push() ajoute un ou plusieurs éléments à la fin d'un tableau."
    },
    {
      id: "q5",
      question: "Comment créer une fonction fléchée en JavaScript ?",
      answers: [
        { id: "e1", text: "function() => {}", isCorrect: false },
        { id: "e2", text: "() => {}", isCorrect: true },
        { id: "e3", text: "=> () {}", isCorrect: false },
        { id: "e4", text: "function => () {}", isCorrect: false }
      ],
      explanation: "La syntaxe des fonctions fléchées est () => {}."
    }
  ]
};

// Fonction pour générer des quiz de test pour différents modules
export const generateSampleQuiz = (moduleTitle: string) => ({
  title: `Quiz - ${moduleTitle}`,
  questions: sampleQuizData.questions.map(q => ({
    ...q,
    id: `${moduleTitle.toLowerCase().replace(/\s+/g, '_')}_${q.id}`
  }))
});

// Quiz plus simple pour les tests
export const simpleQuiz = {
  title: "Quiz Simple",
  questions: [
    {
      id: "simple1",
      question: "Quelle est la couleur du ciel ?",
      answers: [
        { id: "s1", text: "Rouge", isCorrect: false },
        { id: "s2", text: "Bleu", isCorrect: true },
        { id: "s3", text: "Vert", isCorrect: false },
        { id: "s4", text: "Jaune", isCorrect: false }
      ]
    },
    {
      id: "simple2",
      question: "Combien font 2 + 2 ?",
      answers: [
        { id: "s5", text: "3", isCorrect: false },
        { id: "s6", text: "4", isCorrect: true },
        { id: "s7", text: "5", isCorrect: false },
        { id: "s8", text: "6", isCorrect: false }
      ]
    }
  ]
};