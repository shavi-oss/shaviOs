"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    Search,
    Filter
} from "lucide-react";

interface Deal {
    id: string;
    title: string;
    company: string;
    value: number;
    probability: number;
    stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closing";
    expectedCloseDate: string;
}

const mockDeals: Deal[] = [
    {
        id: "1",
        title: "دورة البرمجة المتقدمة",
        company: "شركة التقنية",
        value: 50000,
        probability: 75,
        stage: "negotiation",
        expectedCloseDate: "2024-12-20"
    },
    {
        id: "2",
        title: "برنامج التدريب المؤسسي",
        company: "مؤسسة التعليم",
        value: 120000,
        probability: 60,
        stage: "proposal",
        expectedCloseDate: "2024-12-25"
    },
    {
        id: "3",
        title: "دورة تحليل البيانات",
        company: "شركة المعلومات",
        value: 35000,
        probability: 90,
        stage: "closing",
        expectedCloseDate: "2024-12-15"
    }
];

const stageLabels = {
    prospecting: "البحث",
    qualification: "التأهيل",
    proposal: "العرض",
    negotiation: "التفاوض",
    closing: "الإغلاق"
};

export default function PipelinePage() {
    const [deals] = useState<Deal[]>(mockDeals);
    const [filterStage, setFilterStage] = useState<string>("all");

    const filteredDeals = filterStage === "all"
        ? deals
        : deals.filter(d => d.stage === filterStage);

    const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedValue = filteredDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">خط الأنابيب</h1>
                    <p className="text-muted-foreground mt-2">
                        تتبع وإدارة الصفقات في مراحل البيع المختلفة
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">القيمة الإجمالية</p>
                            <p className="text-2xl font-bold mt-1">{totalValue.toLocaleString()} جنيه</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">القيمة المرجحة</p>
                            <p className="text-2xl font-bold mt-1">{weightedValue.toLocaleString()} جنيه</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">عدد الصفقات</p>
                            <p className="text-2xl font-bold mt-1">{filteredDeals.length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="ابحث عن صفقة..."
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">جميع المراحل</option>
                        {Object.entries(stageLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Deals List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الصفقة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الشركة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">القيمة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المرحلة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الاحتمالية</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ الإغلاق</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredDeals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{deal.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{deal.company}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {deal.value.toLocaleString()} جنيه
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {stageLabels[deal.stage]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${deal.probability}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 w-10">{deal.probability}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(deal.expectedCloseDate).toLocaleDateString('ar-EG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
