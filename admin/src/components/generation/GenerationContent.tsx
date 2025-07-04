// src/components/generation/GenerationContent.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, Map, Pencil, Eye, X, Plus, GripVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Types and Initial Data ---
type Lesson = { id: number | string; title: string; description: string };
type Module = { id: number | string; title: string; lessons: Lesson[] };

const initialCourseData: Module[] = [
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

// --- Draggable Components ---

function SortableLessonItem({ lesson, index, moduleId, onEdit, onDelete }: { lesson: Lesson, index: number, moduleId: Module['id'], onEdit: (moduleId: Module['id'], lesson: Lesson) => void, onDelete: (moduleId: Module['id'], lessonId: Lesson['id']) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 bg-background">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-1"><GripVertical className="h-5 w-5 text-muted-foreground/50" /></div>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">{index + 1}</span>
        <span className="font-medium">{lesson.title}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button variant="ghost" size="icon" onClick={() => onEdit(moduleId, lesson)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="cursor-default"><Eye className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent><p className="max-w-sm">{lesson.description}</p></TooltipContent></Tooltip>
        <Button variant="ghost" size="icon" onClick={() => onDelete(moduleId, lesson.id)}><X className="h-4 w-4 text-muted-foreground" /></Button>
      </div>
    </li>
  );
}

function SortableModule({ module, children, isAnyModuleDragging }: { module: Module, children: React.ReactNode[], isAnyModuleDragging: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });
    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition,
        opacity: isDragging ? 0.8 : 1, // Optional: make the dragged item slightly transparent
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="group flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 flex-grow">
                    <div {...attributes} {...listeners} className="cursor-grab touch-none p-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                    {children[0]} {/* Title or Input */}
                </div>
                 {children[1]} {/* Edit/Delete Icons */}
            </div>
            {!isAnyModuleDragging && children.slice(2)} {/* Hide content if ANY module is being dragged */}
        </div>
    )
}

export function GenerationContent() {
  const [course, setCourse] = useState<Module[]>(initialCourseData);
  const [editingModuleId, setEditingModuleId] = useState<Module['id'] | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<Module['id'] | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | number | null>(null); // State to track the active dragged item
  const sensors = useSensors(useSensor(PointerSensor));

  // --- Handlers ---
  const handleDeleteModule = (moduleId: Module['id']) => setCourse(c => c.filter(m => m.id !== moduleId));
  const handleDeleteLesson = (moduleId: Module['id'], lessonId: Lesson['id']) => {
    setCourse(c => c.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
  };
  const handleUpdateModuleTitle = (moduleId: Module['id'], newTitle: string) => {
    setCourse(c => c.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
    setEditingModuleId(null);
  };
  const handleOpenNewLessonModal = (moduleId: Module['id']) => {
    setCurrentModuleId(moduleId);
    setEditingLesson({ id: Date.now().toString(), title: "", description: "" });
  };
  const handleOpenEditLessonModal = (moduleId: Module['id'], lesson: Lesson) => {
      setCurrentModuleId(moduleId);
      setEditingLesson(lesson);
  };
  const handleSaveLesson = () => {
    if (!editingLesson || currentModuleId === null) return;
    setCourse(currentCourse => currentCourse.map(module => {
        if (module.id === currentModuleId) {
            const lessonExists = module.lessons.some(l => l.id === editingLesson.id);
            const newLessons = lessonExists 
                ? module.lessons.map(l => l.id === editingLesson.id ? editingLesson : l) 
                : [...module.lessons, editingLesson];
            return { ...module, lessons: newLessons };
        }
        return module;
    }));
    setEditingLesson(null);
    setCurrentModuleId(null);
  };
  const handleAddNewModule = () => {
    const newModule: Module = { id: Date.now(), title: "New Module (click to edit)", lessons: [] };
    setCourse(currentCourse => [...currentCourse, newModule]);
  };
  
  // --- Drag and Drop Handlers ---
  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null); // Reset active drag id
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isModuleDrag = course.some(c => c.id === active.id);

    if (isModuleDrag) {
        setCourse(items => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    } else {
        setCourse(currentCourse => {
            const moduleContainingLesson = currentCourse.find(m => m.lessons.some(l => l.id === active.id));
            if (!moduleContainingLesson) return currentCourse;
            const oldIndex = moduleContainingLesson.lessons.findIndex(l => l.id === active.id);
            const newIndex = moduleContainingLesson.lessons.findIndex(l => l.id === over.id);
            const reorderedLessons = arrayMove(moduleContainingLesson.lessons, oldIndex, newIndex);
            return currentCourse.map(m => m.id === moduleContainingLesson.id ? { ...m, lessons: reorderedLessons } : m);
        });
    }
  }

  // Determine if the currently dragged item is a module
  const isDraggingModule = activeDragId ? course.some(m => m.id === activeDragId) : false;

  return (
    <TooltipProvider delayDuration={200}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragId(null)}>
            <main className="flex-1 overflow-y-auto">
                <ScrollArea className="h-full">
                <div className="p-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Mastering Model Predictive Control (MPC)</h2>
                        <div className="flex items-center gap-2"><Button variant="outline"><List className="mr-2 h-4 w-4" />Outline</Button><Button variant="ghost" className="text-muted-foreground"><Map className="mr-2 h-4 w-4" />Map</Button></div>
                    </div>
                    <div className="space-y-10">
                        <SortableContext items={course.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            {course.map((section) => (
                                <SortableModule key={section.id} module={section} isAnyModuleDragging={isDraggingModule}>
                                    {/* Child 0: Title */}
                                    {editingModuleId === section.id ? (
                                        <Input autoFocus defaultValue={section.title} onBlur={(e) => handleUpdateModuleTitle(section.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateModuleTitle(section.id, e.currentTarget.value) }} className="text-xl font-semibold"/>
                                    ) : ( <h3 className="text-xl font-semibold flex-grow">{section.title}</h3> )}

                                    {/* Child 1: Edit/Delete Icons */}
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"><Button variant="ghost" size="icon" onClick={() => setEditingModuleId(section.id)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteModule(section.id)}><X className="h-4 w-4 text-muted-foreground" /></Button></div>
                                    
                                    {/* Child 2: Lesson List */}
                                    <SortableContext items={section.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                        <ul className="space-y-1 mt-4">
                                            {section.lessons.map((lesson, lessonIndex) => (
                                                <SortableLessonItem key={lesson.id} lesson={lesson} index={lessonIndex} moduleId={section.id} onEdit={handleOpenEditLessonModal} onDelete={handleDeleteLesson} />
                                            ))}
                                        </ul>
                                    </SortableContext>
                                
                                    {/* Child 3: Add Lesson Button */}
                                    <div onClick={() => handleOpenNewLessonModal(section.id)} className="mt-2 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                                        <Plus className="h-4 w-4" />
                                        <span>Add a lesson</span>
                                    </div>
                                </SortableModule>
                            ))}
                        </SortableContext>
                        <div onClick={handleAddNewModule} className="mt-10 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            <Plus className="h-4 w-4" />
                            <span className="font-semibold">Add a module</span>
                        </div>
                    </div>
                </div>
                </ScrollArea>
            </main>
        </DndContext>
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold">Lesson Details</h2>
              <div><label htmlFor="lessonTitle" className="text-sm font-medium text-muted-foreground">Title</label><Input id="lessonTitle" value={editingLesson.title} onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})} className="mt-1"/></div>
              <div><label htmlFor="lessonDescription" className="text-sm font-medium text-muted-foreground">Description</label><Textarea id="lessonDescription" value={editingLesson.description} onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})} className="mt-1" rows={5}/></div>
              <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditingLesson(null)}>Cancel</Button><Button onClick={handleSaveLesson}>Save</Button></div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}