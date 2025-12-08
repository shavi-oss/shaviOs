"use client";

import { useState, useEffect } from "react";
import { Settings, RotateCcw, Eye, EyeOff, Layout, Save } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

interface WidgetConfig {
    id: string;
    title: string;
    visible: boolean;
    category?: string;
}

interface DashboardCustomizerProps {
    widgets: WidgetConfig[];
    onVisibilityChange?: (widgetId: string, visible: boolean) => void;
    onReset?: () => void;
    storageKey?: string;
}

export function DashboardCustomizer({
    widgets: initialWidgets,
    onVisibilityChange,
    onReset,
    storageKey = "dashboard-widgets-config",
}: DashboardCustomizerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [widgets, setWidgets] = useState<WidgetConfig[]>(initialWidgets);
    const [hasChanges, setHasChanges] = useState(false);

    // Load saved configuration
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const savedConfig: Record<string, boolean> = JSON.parse(saved);
                setWidgets((prev) =>
                    prev.map((w) => ({
                        ...w,
                        visible: savedConfig[w.id] ?? w.visible,
                    }))
                );
            }
        } catch (error) {
            console.error("Failed to load widget configuration:", error);
        }
    }, [storageKey]);

    const toggleVisibility = (id: string) => {
        setWidgets((prev) =>
            prev.map((w) => {
                if (w.id === id) {
                    const newVisible = !w.visible;
                    onVisibilityChange?.(id, newVisible);
                    return { ...w, visible: newVisible };
                }
                return w;
            })
        );
        setHasChanges(true);
    };

    const saveChanges = () => {
        try {
            const config = widgets.reduce(
                (acc, w) => ({ ...acc, [w.id]: w.visible }),
                {} as Record<string, boolean>
            );
            localStorage.setItem(storageKey, JSON.stringify(config));
            setHasChanges(false);

            // Show success feedback
            const btn = document.activeElement as HTMLButtonElement;
            if (btn) {
                btn.textContent = "تم الحفظ ✓";
                setTimeout(() => {
                    btn.textContent = "حفظ التغييرات";
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to save widget configuration:", error);
        }
    };

    const resetToDefault = () => {
        if (confirm("هل أنت متأكد من إعادة التعيين إلى الإعدادات الافتراضية؟")) {
            try {
                localStorage.removeItem(storageKey);
                localStorage.removeItem("dashboard-layout");
                setWidgets(initialWidgets);
                setHasChanges(false);
                onReset?.();

                // Reload page to apply changes
                window.location.reload();
            } catch (error) {
                console.error("Failed to reset configuration:", error);
            }
        }
    };

    // Group widgets by category
    const groupedWidgets = widgets.reduce((acc, widget) => {
        const category = widget.category || "عام";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(widget);
        return acc;
    }, {} as Record<string, WidgetConfig[]>);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300",
                    "bg-primary text-white hover:bg-primary-hover",
                    "flex items-center gap-2",
                    isOpen && "scale-95"
                )}
                title="تخصيص لوحة التحكم"
            >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">تخصيص</span>
            </button>

            {/* Customization Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <GlassCard
                        intensity="heavy"
                        className="fixed bottom-24 left-6 z-50 w-96 max-h-[600px] overflow-hidden flex flex-col shadow-2xl"
                    >
                        <GlassCardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold">تخصيص لوحة التحكم</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </GlassCardHeader>

                        <GlassCardContent className="flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Instructions */}
                                <div className="p-3 bg-accent/50 rounded-lg text-sm">
                                    <p className="font-medium mb-1">💡 نصيحة:</p>
                                    <p className="text-muted-foreground">
                                        مرر فوق أي كرت واسحب الأيقونة لإعادة الترتيب
                                    </p>
                                </div>

                                {/* Widget List */}
                                {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                                            {category}
                                        </h4>
                                        <div className="space-y-2">
                                            {categoryWidgets.map((widget) => (
                                                <div
                                                    key={widget.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                                >
                                                    <span className="text-sm font-medium">{widget.title}</span>
                                                    <button
                                                        onClick={() => toggleVisibility(widget.id)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            widget.visible
                                                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                        )}
                                                        title={widget.visible ? "إخفاء" : "إظهار"}
                                                    >
                                                        {widget.visible ? (
                                                            <Eye className="w-4 h-4" />
                                                        ) : (
                                                            <EyeOff className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCardContent>

                        {/* Actions Footer */}
                        <div className="border-t p-4 space-y-2">
                            <GlassButton
                                variant="primary"
                                className="w-full"
                                onClick={saveChanges}
                                disabled={!hasChanges}
                            >
                                <Save className="w-4 h-4 ml-2" />
                                حفظ التغييرات
                            </GlassButton>
                            <GlassButton
                                variant="outline"
                                className="w-full"
                                onClick={resetToDefault}
                            >
                                <RotateCcw className="w-4 h-4 ml-2" />
                                إعادة تعيين
                            </GlassButton>
                        </div>
                    </GlassCard>
                </>
            )}
        </>
    );
}
