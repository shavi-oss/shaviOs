import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isGlass?: boolean;
}

/**
 * GlassButton Component
 * 
 * Button with optional glass-morphism effect
 */
export function GlassButton({
    children,
    className,
    variant = "primary",
    size = "md",
    isGlass = false,
    ...props
}: GlassButtonProps) {
    const variantClasses = {
        primary: "bg-primary text-white hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-2 border-border hover:bg-accent",
        ghost: "hover:bg-accent",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={cn(
                "rounded-lg font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variantClasses[variant],
                sizeClasses[size],
                isGlass && variant !== "primary" && "glass-light",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
