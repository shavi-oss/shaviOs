"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border">
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "p-2 rounded transition-all duration-200",
                    theme === "light"
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-accent text-muted-foreground"
                )}
                title="الوضع النهاري"
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-2 rounded transition-all duration-200",
                    theme === "dark"
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-accent text-muted-foreground"
                )}
                title="الوضع الليلي"
            >
                <Moon className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "p-2 rounded transition-all duration-200",
                    theme === "system"
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-accent text-muted-foreground"
                )}
                title="تلقائي"
            >
                <Monitor className="w-4 h-4" />
            </button>
        </div>
    );
}
