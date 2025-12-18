'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'

interface Lesson {
    id: string
    title: string
    content: string | null
    duration_minutes: number | null
    video_url: string | null
    is_free: boolean
    order_index: number
}

interface Section {
    id: string
    title: string
    description: string | null
    order_index: number
    lessons: Lesson[]
}

interface CurriculumEditorProps {
    courseId: string
    sections: Section[]
    onUpdate: () => void
}

export function CurriculumEditor({ courseId, sections, onUpdate }: CurriculumEditorProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)))
    const [editingSection, setEditingSection] = useState<string | null>(null)
    const [editingLesson, setEditingLesson] = useState<string | null>(null)
    const supabase = createClient()

    // Collapse/Expand All
    const collapseAll = () => setExpandedSections(new Set())
    const expandAll = () => setExpandedSections(new Set(sections.map(s => s.id)))

    const toggleSection = (id: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedSections(newExpanded)
    }

    // Section operations
    const addSection = async () => {
        const { error } = await supabase
            .from('course_sections')
            .insert({
                course_id: courseId,
                title: 'New Section',
                order_index: sections.length
            })

        if (!error) onUpdate()
    }

    const updateSection = async (id: string, updates: Partial<Section>) => {
        const { error } = await supabase
            .from('course_sections')
            .update(updates)
            .eq('id', id)

        if (!error) {
            onUpdate()
            setEditingSection(null)
        }
    }

    const deleteSection = async (id: string) => {
        const { error } = await supabase
            .from('course_sections')
            .delete()
            .eq('id', id)

        if (!error) onUpdate()
    }

    // Lesson operations
    const addLesson = async (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId)
        const { error } = await supabase
            .from('course_lessons')
            .insert({
                section_id: sectionId,
                title: 'New Lesson',
                order_index: section?.lessons.length || 0
            })

        if (!error) onUpdate()
    }

    const updateLesson = async (id: string, updates: Partial<Lesson>) => {
        const { error } = await supabase
            .from('course_lessons')
            .update(updates)
            .eq('id', id)

        if (!error) {
            onUpdate()
            setEditingLesson(null)
        }
    }

    const deleteLesson = async (id: string) => {
        const { error } = await supabase
            .from('course_lessons')
            .delete()
            .eq('id', id)

        if (!error) onUpdate()
    }

    return (
        <div className="space-y-4">
            {/* Top Controls */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Course Curriculum</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={expandAll}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors"
                    >
                        <Maximize2 className="h-3 w-3" />
                        Expand All
                    </button>
                    <button
                        type="button"
                        onClick={collapseAll}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors"
                    >
                        <Minimize2 className="h-3 w-3" />
                        Collapse All
                    </button>
                    <button
                        type="button"
                        onClick={addSection}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                        Add Section
                    </button>
                </div>
            </div>

            {/* Sections List */}
            <div className="space-y-3">
                {sections.map((section) => (
                    <div key={section.id} className="border border-border rounded-lg bg-card overflow-hidden">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 p-3 bg-secondary/30">
                            <button
                                type="button"
                                onClick={() => toggleSection(section.id)}
                                className="p-1 hover:bg-secondary rounded"
                            >
                                {expandedSections.has(section.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            {editingSection === section.id ? (
                                <input
                                    type="text"
                                    defaultValue={section.title}
                                    onBlur={(e) => updateSection(section.id, { title: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                    className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                                    autoFocus
                                />
                            ) : (
                                <h4
                                    className="flex-1 font-medium text-foreground cursor-pointer"
                                    onClick={() => setEditingSection(section.id)}
                                >
                                    {section.title}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({section.lessons.length} lessons)
                                    </span>
                                </h4>
                            )}
                            <button
                                type="button"
                                onClick={() => deleteSection(section.id)}
                                className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Lessons (when expanded) */}
                        {expandedSections.has(section.id) && (
                            <div className="p-3 space-y-2">
                                {section.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
                                        <GripVertical className="h-3 w-3 text-muted-foreground cursor-move" />
                                        {editingLesson === lesson.id ? (
                                            <input
                                                type="text"
                                                defaultValue={lesson.title}
                                                onBlur={(e) => updateLesson(lesson.id, { title: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className="flex-1 text-sm cursor-pointer"
                                                onClick={() => setEditingLesson(lesson.id)}
                                            >
                                                {lesson.title}
                                                {lesson.duration_minutes && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        ({lesson.duration_minutes} min)
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                        {lesson.is_free && (
                                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded">
                                                Free
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => deleteLesson(lesson.id)}
                                            className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addLesson(section.id)}
                                    className="w-full py-2 text-xs text-muted-foreground border border-dashed border-border rounded hover:bg-secondary/50 transition-colors"
                                >
                                    + Add Lesson
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {sections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                    <p className="mb-4">No curriculum sections yet</p>
                    <button
                        type="button"
                        onClick={addSection}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add First Section
                    </button>
                </div>
            )}
        </div>
    )
}
