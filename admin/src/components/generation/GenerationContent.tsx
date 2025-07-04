// src/components/generation/GenerationContent.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, Map, Pencil, Eye, X, Plus } from "lucide-react"; // Ajout de l'icône Plus
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Types et Données Initiales (inchangés) ---
type Lesson = { id: number; title: string; description: string };
type Module = { id: number; title: string; lessons: Lesson[] };

const initialCourseData: Module[] = [
  // ... (données identiques à la version précédente)
  {
    id: 1,
    title: "Module 1: Advanced State-Space Modeling for MPC",
    lessons: [
      { id: 101, title: "Linear Time-Varying (LTV) System Representation", description: "In-depth analysis of LTV systems and their state-space representation." },
      { id: 102, title: "Discrete-Time System Identification Techniques", description: "Methods for identifying system models from discrete-time data." },
      { id: 103, title: "State Estimation with Kalman Filtering for MPC", description: "Using Kalman filters to estimate system states for predictive control." },
      { id: 104, title: "Handling Constraints in State-Space Models", description: "Techniques for incorporating input, output, and state constraints." },
      { id: 105, title: "Case Study: Modeling a Chemical Reactor for MPC", description: "A practical application of modeling techniques on a chemical reactor." },
    ],
  },
  {
    id: 2,
    title: "Module 2: MPC Formulation and Optimization",
    lessons: [
       { id: 201, title: "Quadratic Programming (QP) for MPC", description: "Formulating the MPC problem as a QP optimization." },
       { id: 202, title: "Constraint Handling Techniques in MPC Optimization", description: "Exploring hard and soft constraint handling in the optimization problem." },
       { id: 203, title: "Weighting Matrices Selection and Tuning", description: "Strategies for selecting and tuning the Q and R weighting matrices." },
       { id: 204, title: "Multi-Objective MPC Formulation", description: "Balancing multiple control objectives within the MPC framework." },
       { id: 205, title: "Practical Exercise: Implementing a QP Solver for MPC", description: "A hands-on exercise to code a simple QP solver for an MPC problem." },
    ],
  },
  {
    id: 3,
    title: "Module 3: Robust MPC Design",
    lessons: [],
  },
];


export function GenerationContent() {
  const [course, setCourse] = useState<Module[]>(initialCourseData);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);

  // --- Fonctions de Manipulation ---
  const handleDeleteModule = (moduleId: number) => setCourse(c => c.filter(m => m.id !== moduleId));
  const handleDeleteLesson = (moduleId: number, lessonId: number) => {
    setCourse(c => c.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
  };
  const handleUpdateModuleTitle = (moduleId: number, newTitle: string) => {
    setCourse(c => c.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
    setEditingModuleId(null);
  };

  const handleOpenNewLessonModal = (moduleId: number) => {
    setCurrentModuleId(moduleId);
    // Ouvre la modale avec une leçon vide, en utilisant Date.now() pour un ID temporaire unique
    setEditingLesson({ id: Date.now(), title: "", description: "" });
  };

  const handleOpenEditLessonModal = (moduleId: number, lesson: Lesson) => {
      setCurrentModuleId(moduleId);
      setEditingLesson(lesson);
  };
  
  // Gère à la fois la création et la mise à jour
  const handleSaveLesson = () => {
    if (!editingLesson || currentModuleId === null) return;

    setCourse(currentCourse => currentCourse.map(module => {
        if (module.id === currentModuleId) {
            const lessonExists = module.lessons.some(l => l.id === editingLesson.id);
            let newLessons;

            if (lessonExists) {
                // Mise à jour d'une leçon existante
                newLessons = module.lessons.map(l => l.id === editingLesson.id ? editingLesson : l);
            } else {
                // Ajout d'une nouvelle leçon
                newLessons = [...module.lessons, editingLesson];
            }
            return { ...module, lessons: newLessons };
        }
        return module;
    }));
    
    setEditingLesson(null);
    setCurrentModuleId(null);
  };
  
  const handleAddNewModule = () => {
    const newModule: Module = {
        id: Date.now(),
        title: "Nouveau Module (cliquez pour modifier)",
        lessons: []
    };
    setCourse(currentCourse => [...currentCourse, newModule]);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-4xl mx-auto">
            {/* En-tête (inchangé) */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Mastering Model Predictive Control (MPC)</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><List className="mr-2 h-4 w-4" />Outline</Button>
                    <Button variant="ghost" className="text-muted-foreground"><Map className="mr-2 h-4 w-4" />Map</Button>
                </div>
            </div>
            
            <div className="space-y-10">
              {course.map((section) => (
                <div key={section.id}>
                  {/* ... (Titre de module éditable - inchangé) ... */}
                  <div className="group flex items-center justify-between gap-2 mb-4">
                    {editingModuleId === section.id ? (
                      <Input autoFocus defaultValue={section.title} onBlur={(e) => handleUpdateModuleTitle(section.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateModuleTitle(section.id, e.currentTarget.value) }} className="text-xl font-semibold"/>
                    ) : ( <h3 className="text-xl font-semibold">{section.title}</h3> )}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="ghost" size="icon" onClick={() => setEditingModuleId(section.id)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(section.id)}><X className="h-4 w-4 text-muted-foreground" /></Button>
                    </div>
                  </div>
                  
                  {/* ... (Liste des leçons - inchangée) ... */}
                   {section.lessons.length > 0 && (
                    <ul className="space-y-1">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <li key={lesson.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50">
                          <div className="flex items-center gap-4">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">{lessonIndex + 1}</span>
                              <span className="font-medium">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <Button variant="ghost" size="icon" onClick={() => handleOpenEditLessonModal(section.id, lesson)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                             <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="cursor-default"><Eye className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent><p className="max-w-sm">{lesson.description}</p></TooltipContent></Tooltip>
                             <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(section.id, lesson.id)}><X className="h-4 w-4 text-muted-foreground" /></Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                   )}
                  
                  {/* --- Bouton pour ajouter une nouvelle leçon --- */}
                  <div 
                    onClick={() => handleOpenNewLessonModal(section.id)}
                    className="mt-2 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une leçon</span>
                  </div>

                </div>
              ))}

               {/* --- Bouton pour ajouter un nouveau module --- */}
              <div 
                onClick={handleAddNewModule}
                className="mt-10 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Ajouter un module</span>
              </div>

            </div>
          </div>
        </ScrollArea>

        {/* --- Modale pour l'édition et la création --- */}
        {editingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold">Détails de la Leçon</h2>
                <div>
                    <label htmlFor="lessonTitle" className="text-sm font-medium text-muted-foreground">Titre</label>
                    <Input id="lessonTitle" value={editingLesson.title} onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})} className="mt-1"/>
                </div>
                 <div>
                    <label htmlFor="lessonDescription" className="text-sm font-medium text-muted-foreground">Description</label>
                    <Textarea id="lessonDescription" value={editingLesson.description} onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})} className="mt-1" rows={5}/>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setEditingLesson(null)}>Annuler</Button>
                    <Button onClick={handleSaveLesson}>Enregistrer</Button>
                </div>
            </div>
          </div>
        )}
      </main>
    </TooltipProvider>
  );
}