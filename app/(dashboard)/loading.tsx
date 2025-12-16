import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header Area Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-2" />
                    <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <CardSkeleton count={3} />

            {/* Main Content Area/Table Skeleton */}
            <div className="pt-4">
                <TableSkeleton rows={5} />
            </div>
        </div>
    );
}
