"use client";

import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
}: StatCardProps) {
    return (
        <GlassCard
            intensity="light"
            hover
            className={cn("transition-all", className)}
        >
            <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">{title}</h3>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </GlassCardHeader>
            <GlassCardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center mt-2">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                            من الشهر الماضي
                        </span>
                    </div>
                )}
            </GlassCardContent>
        </GlassCard>
    );
}
