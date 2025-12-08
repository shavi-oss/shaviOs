import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, ...props }, ref) => {
        const [imageError, setImageError] = React.useState(false);

        const initials = React.useMemo(() => {
            if (fallback) {
                return fallback
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
            }
            return alt
                ? alt
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?";
        }, [fallback, alt]);

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                    className
                )}
                {...props}
            >
                {src && !imageError ? (
                    <img
                        src={src}
                        alt={alt || "Avatar"}
                        className="aspect-square h-full w-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                        {initials}
                    </div>
                )}
            </div>
        );
    }
);
Avatar.displayName = "Avatar";

export { Avatar };
