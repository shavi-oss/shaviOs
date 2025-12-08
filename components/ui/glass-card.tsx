import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    intensity?: "none" | "light" | "medium" | "heavy";
    hover?: boolean;
    onClick?: () => void;
}

/**
 * GlassCard Component
 * 
 * A modern glass-morphism card with customizable blur intensity.
 * Optimized for both light and dark themes, with reduced blur on mobile devices.
 * 
 * @param intensity - Blur intensity level: none | light | medium | heavy
 * @param hover - Enable hover effects (scale + shadow)
 * @param onClick - Optional click handler
 */
export function GlassCard({
    children,
    className,
    intensity = "medium",
    hover = false,
    onClick
}: GlassCardProps) {
    const intensityClasses = {
        none: "bg-surface-elevated border",
        light: "glass-light border",
        medium: "glass-medium border",
        heavy: "glass-heavy border",
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-lg transition-all duration-300",
                intensityClasses[intensity],
                hover && "hover:scale-[1.02] hover:shadow-xl cursor-pointer",
                onClick && "cursor-pointer",
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * GlassCardHeader - Header section for GlassCard
 */
interface GlassCardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
    return (
        <div className={cn("p-6 pb-4", className)}>
            {children}
        </div>
    );
}

/**
 * GlassCardContent - Content section for GlassCard
 */
interface GlassCardContentProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
    return (
        <div className={cn("p-6 pt-0", className)}>
            {children}
        </div>
    );
}

/**
 * GlassCardFooter - Footer section for GlassCard
 */
interface GlassCardFooterProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
    return (
        <div className={cn("p-6 pt-4 border-t", className)}>
            {children}
        </div>
    );
}
