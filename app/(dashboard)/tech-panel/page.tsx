"use client";

export default function TechPanelPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">لوحة التقنية</h1>
                <p className="text-muted-foreground mt-2">إدارة التكاملات والسجلات والأمان</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <a
                    href="/tech-panel/integrations"
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block"
                >
                    <h3 className="text-lg font-semibold mb-2">التكاملات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إدارة التكاملات الخارجية</p>
                </a>
                <a
                    href="/tech-panel/logs"
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block"
                >
                    <h3 className="text-lg font-semibold mb-2">السجلات</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عرض سجلات النظام</p>
                </a>
                <a
                    href="/tech-panel/webhooks"
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block"
                >
                    <h3 className="text-lg font-semibold mb-2">Webhooks</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إدارة Webhooks الواردة</p>
                </a>
                <a
                    href="/tech-panel/secrets"
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-right block"
                >
                    <h3 className="text-lg font-semibold mb-2">الأسرار</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إدارة مفاتيح API</p>
                </a>
            </div>
        </div>
    );
}
