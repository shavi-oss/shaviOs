"use client";

import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, ReactNode } from "react";
import { GripVertical } from "lucide-react";

export interface DashboardWidget {
    id: string;
    component: ReactNode;
    title: string;
    category?: string;
    defaultVisible?: boolean;
}

interface SortableWidgetProps {
    id: string;
    children: ReactNode;
    isDragging?: boolean;
}

function SortableWidget({ id, children, isDragging }: SortableWidgetProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-2 bg-surface-elevated/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 shadow-md"
                title="اسحب لإعادة الترتيب"
            >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            {children}
        </div>
    );
}

interface DraggableGridProps {
    widgets: DashboardWidget[];
    storageKey?: string;
    className?: string;
}

export function DraggableGrid({
    widgets,
    storageKey = "dashboard-layout",
    className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
}: DraggableGridProps) {
    const [items, setItems] = useState<DashboardWidget[]>(widgets);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Configure sensors for better drag experience
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px of movement required before drag starts
            },
        })
    );

    // Wait for client-side mount to fix hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load saved order from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const savedOrder: string[] = JSON.parse(saved);

                // Reorder widgets based on saved order
                const orderedWidgets = savedOrder
                    .map((id) => widgets.find((w) => w.id === id))
                    .filter((w): w is DashboardWidget => w !== undefined);

                // Add any new widgets that aren't in saved order
                const newWidgets = widgets.filter(
                    (w) => !savedOrder.includes(w.id)
                );

                setItems([...orderedWidgets, ...newWidgets]);
            }
        } catch (error) {
            console.error("Failed to load dashboard layout:", error);
        }
    }, [widgets, storageKey]);

    function handleDragStart(event: any) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Save to localStorage
                try {
                    localStorage.setItem(
                        storageKey,
                        JSON.stringify(newOrder.map((i) => i.id))
                    );
                } catch (error) {
                    console.error("Failed to save dashboard layout:", error);
                }

                return newOrder;
            });
        }
    }

    // Render static grid during SSR, draggable grid after mount
    if (!isMounted) {
        return (
            <div className={className}>
                {items.map((widget) => (
                    <div key={widget.id}>
                        {widget.component}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className={className}>
                    {items.map((widget) => (
                        <SortableWidget
                            key={widget.id}
                            id={widget.id}
                            isDragging={activeId === widget.id}
                        >
                            {widget.component}
                        </SortableWidget>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
