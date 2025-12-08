"use client";

export default function TrainersPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">المدربون</h1>
                <p className="text-muted-foreground mt-2">إدارة المدربين والدورات والجداول</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <a href="/trainers/list" className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block">
                    <h3 className="text-lg font-semibold mb-2">قائمة المدربين</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عرض جميع المدربين</p>
                </a>
                <a href="/trainers/courses" className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block">
                    <h3 className="text-lg font-semibold mb-2">الدورات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إدارة الدورات التدريبية</p>
                </a>
                <a href="/trainers/schedule" className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block">
                    <h3 className="text-lg font-semibold mb-2">الجدول الزمني</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">جدولة الحصص</p>
                </a>
            </div>
        </div>
    );
}
