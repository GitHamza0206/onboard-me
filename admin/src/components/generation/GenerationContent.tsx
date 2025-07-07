// src/components/generation/GenerationContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, Map, Pencil, Eye, X, Plus, GripVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteModule, deleteSubmodule, updateModule, updateSubmodule } from "@/lib/api";

// --- Types and Initial Data ---
type Lesson = { id: number | string; title: string; description: string };
type Module = { id: number | string; title: string; lessons: Lesson[] };


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

export function GenerationContent({
  courseId,
  onTitle,
}: {
  courseId: string;
  onTitle: (t: string) => void;
}) {
  const { token } = useAuth();
  const [course, setCourse] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Course Title");
  const [editingModuleId, setEditingModuleId] = useState<Module['id'] | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<Module['id'] | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | number | null>(null); // State to track the active dragged item
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!token) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/formations/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch formation");
        const data = await res.json();

        // mappe la réponse vers Module[]
        const mapped: Module[] = data.modules.map((m: any) => ({
          id: m.id,
          title: m.title,
          lessons: m.lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            description: l.description,
          })),
        }));
        setCourse(mapped);
        setTitle(data.title);
        onTitle(data.title);        // maj header
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, token, onTitle]); // Ajouter onTitle dans les dépendances

  if (loading) return <div className="p-8">Loading…</div>;

  // --- Handlers ---
  const handleDeleteModule = async (moduleId: Module['id']) => {
    const originalCourse = course;
    setCourse(c => c.filter(m => m.id !== moduleId));
    try {
      await deleteModule(token!, moduleId);
    } catch (err) {
      console.error("DB delete failed", err);
      setCourse(originalCourse); // Revert on failure
    }
  };
  const handleDeleteLesson = async (moduleId: Module['id'], lessonId: Lesson['id']) => {
    const originalCourse = course;
    setCourse(c => c.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
    try {
      await deleteSubmodule(token!, lessonId);
    } catch (err) {
      console.error("DB delete failed", err);
      setCourse(originalCourse); // Revert on failure
    }
  };
  const handleUpdateModuleTitle = async (moduleId: Module["id"], newTitle: string) => {
    setCourse(c => c.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
    setEditingModuleId(null);
    try {
      await updateModule(token!, moduleId, { titre: newTitle });
    } catch (err) {
      console.error("DB update failed", err);
    }
  };

  const handleOpenNewLessonModal = (moduleId: Module['id']) => {
    setCurrentModuleId(moduleId);
    setEditingLesson({ id: Date.now().toString(), title: "", description: "" });
  };
  const handleOpenEditLessonModal = (moduleId: Module['id'], lesson: Lesson) => {
    setCurrentModuleId(moduleId);
    setEditingLesson(lesson);
  };
  const handleSaveLesson = async () => {
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
    try {
      await updateSubmodule(token!, editingLesson.id, {
        titre: editingLesson.title,
        description: editingLesson.description,
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddNewModule = () => {
    const newModule: Module = { id: Date.now(), title: "New Module (click to edit)", lessons: [] };
    setCourse(currentCourse => [...currentCourse, newModule]);
  };

  function reorderModules(newOrder: Module[]) {
    setCourse(newOrder);                                 // rendu immédiat
    newOrder.forEach((m, idx) =>
      updateModule(token!, m.id, { index: idx })         // PATCH /modules/:id
    );
  }


  function reorderLessons(targetModule: Module) {
    setCourse(c => c.map(m => (m.id === targetModule.id ? targetModule : m)));
    targetModule.lessons.forEach((l, idx) =>
      updateSubmodule(token!, l.id, { index: idx })      // PATCH /submodules/:id
    );
  }

  // --- Drag and Drop Handlers ---
  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isModuleDrag = course.some(c => c.id === active.id);

    if (isModuleDrag) {
      // réordonner les modules
      const reordered = arrayMove(course,                       // tableau d’origine
        course.findIndex(i => i.id === active.id),
        course.findIndex(i => i.id === over.id));
      reorderModules(reordered);                                // 👈 persistence
    } else {
      // réordonner les leçons dans le module concerné
      const moduleIdx = course.findIndex(m =>
        m.lessons.some(l => l.id === active.id),
      );
      if (moduleIdx === -1) return;

      const mod = course[moduleIdx];
      const reorderedLessons = arrayMove(
        mod.lessons,
        mod.lessons.findIndex(l => l.id === active.id),
        mod.lessons.findIndex(l => l.id === over.id),
      );

      const updatedModule = { ...mod, lessons: reorderedLessons };
      reorderLessons(updatedModule);                            // 👈 persistence
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
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="flex items-center gap-2"><Button variant="outline"><List className="mr-2 h-4 w-4" />Outline</Button><Button variant="ghost" className="text-muted-foreground"><Map className="mr-2 h-4 w-4" />Map</Button></div>
              </div>
              <div className="space-y-10">
                <SortableContext items={course.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {course.map((section) => (
                    <SortableModule key={section.id} module={section} isAnyModuleDragging={isDraggingModule}>
                      {/* Child 0: Title */}
                      {editingModuleId === section.id ? (
                        <Input autoFocus defaultValue={section.title} onBlur={(e) => handleUpdateModuleTitle(section.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateModuleTitle(section.id, e.currentTarget.value) }} className="text-xl font-semibold" />
                      ) : (<h3 className="text-xl font-semibold flex-grow">{section.title}</h3>)}

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
            <div><label htmlFor="lessonTitle" className="text-sm font-medium text-muted-foreground">Title</label><Input id="lessonTitle" value={editingLesson.title} onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })} className="mt-1" /></div>
            <div><label htmlFor="lessonDescription" className="text-sm font-medium text-muted-foreground">Description</label><Textarea id="lessonDescription" value={editingLesson.description} onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })} className="mt-1" rows={5} /></div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditingLesson(null)}>Cancel</Button><Button onClick={handleSaveLesson}>Save</Button></div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}