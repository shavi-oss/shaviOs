"use client";

import { useEffect, useState } from 'react';
import { getExpenses, getCategoryStats, type Expense } from '@/app/actions/finance';
import { Pagination } from '@/components/ui/pagination';
import {
    DollarSign,
    Plus,
    Download,
    TrendingUp,
    AlertTriangle,
    PieChart,
    Search,
    Loader2,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/ui/skeletons';
import { toast } from 'sonner';

interface CategoryConfig {
    budget: number;
    color: string;
    nameAr: string;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Stats state
    const [actuals, setActuals] = useState<Record<string, number>>({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Category budgets (Hardcoded for now - phase 1)
    const categoryBudgets: Record<string, CategoryConfig> = {
        'Salaries': { budget: 900000, color: 'bg-blue-500', nameAr: 'الرواتب' },
        'Rent': { budget: 150000, color: 'bg-purple-500', nameAr: 'الإيجار' },
        'Software': { budget: 100000, color: 'bg-green-500', nameAr: 'البرمجيات' },
        'Marketing': { budget: 200000, color: 'bg-yellow-500', nameAr: 'التسويق' },
        'Subscriptions': { budget: 100000, color: 'bg-pink-500', nameAr: 'الاشتراكات' },
        'Logistics': { budget: 150000, color: 'bg-orange-500', nameAr: 'لوجستيات' },
        'Commissions': { budget: 80000, color: 'bg-teal-500', nameAr: 'العمولات' },
        'Consulting': { budget: 50000, color: 'bg-indigo-500', nameAr: 'الاستشارات' },
        'Miscellaneous': { budget: 50000, color: 'bg-gray-500', nameAr: 'متنوع' }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, selectedCategory]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadExpensesOnly();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadData = async () => {
        setLoading(true);
        setStatsLoading(true);
        try {
            const [expensesData, statsData] = await Promise.all([
                getExpenses(currentPage, 10, selectedCategory, searchTerm),
                getCategoryStats()
            ]);

            setExpenses(expensesData.data);
            setTotalCount(expensesData.count);
            setTotalPages(expensesData.totalPages);
            setActuals(statsData);
        } catch (err) {
            console.error(err);
            toast.error('فشل في تحميل البيانات');
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    const loadExpensesOnly = async () => {
        setLoading(true);
        try {
            const result = await getExpenses(currentPage, 10, selectedCategory, searchTerm);
            setExpenses(result.data);
            setTotalCount(result.count);
            setTotalPages(result.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Derived Stats
    const totalExpenses = Object.values(actuals).reduce((a, b) => a + b, 0);
    const totalBudget = Object.values(categoryBudgets).reduce((sum, cat) => sum + cat.budget, 0);

    // Prepare category logic for display
    const categoriesForDisplay = Object.entries(categoryBudgets).map(([name, config]) => ({
        name,
        amount: actuals[name] || 0,
        budget: config.budget,
        color: config.color,
        nameAr: config.nameAr
    })).sort((a, b) => b.amount - a.amount);

    const overBudgetCategories = categoriesForDisplay.filter(cat => cat.amount > cat.budget);

    const exportToCSV = () => {
        const headers = ['التاريخ', 'الفئة', 'الموظف', 'الوصف', 'المبلغ', 'العملة', 'الحالة'];
        const csvData = expenses.map(expense => [
            new Date(expense.expense_date).toLocaleDateString('ar-EG'),
            categoryBudgets[expense.category]?.nameAr || expense.category,
            expense.submitted_by_name || '-',
            expense.description || '',
            expense.amount,
            expense.currency,
            expense.status
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-primary" />
                        إدارة المصروفات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">تتبع وتحليل مصروفات الشركة</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" /> تصدير
                    </button>
                    <Link
                        href="/finance/expenses/new"
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> إضافة مصروف
                    </Link>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-3xl font-bold text-orange-600">{(totalExpenses / 1000).toFixed(1)}K</div>
                    <div className="text-sm text-orange-700 dark:text-orange-400 font-medium mt-1">إجمالي المصروفات</div>
                    <div className="text-xs text-orange-600 mt-1">EGP</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{(totalBudget / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-500 font-medium mt-1">الميزانية التقديرية</div>
                    <div className="text-xs text-gray-400 mt-1">EGP</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-600">
                        {totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400 font-medium mt-1">نسبة الاستهلاك</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-3xl font-bold text-red-600">{overBudgetCategories.length}</div>
                    <div className="text-sm text-red-700 dark:text-red-400 font-medium mt-1">🚨 تجاوز الميزانية</div>
                </div>
            </div>

            {/* Budget Alerts */}
            {overBudgetCategories.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-bold text-red-800 dark:text-red-400">تنبيهات الميزانية</h3>
                            <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                                {overBudgetCategories.map((cat, idx) => (
                                    <li key={idx}>
                                        • <strong>{cat.nameAr}</strong> تجاوز الميزانية بمقدار {((cat.amount - cat.budget) / 1000).toFixed(0)}K جنيه
                                        ({(((cat.amount - cat.budget) / cat.budget) * 100).toFixed(0)}% زيادة)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="ابحث في المصروفات (الوصف)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">كل الفئات</option>
                    {Object.entries(categoryBudgets).map(([key, config]) => (
                        <option key={key} value={key}>{config.nameAr}</option>
                    ))}
                </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Visual Chart (Spending by Category) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 min-h-[300px]">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-500" />
                        توزيع الفئات
                    </h2>
                    {statsLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categoriesForDisplay.slice(0, 6).map((cat, idx) => {
                                const percentage = cat.budget > 0 ? (cat.amount / cat.budget) * 100 : 0;
                                const isOver = cat.amount > cat.budget;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {cat.nameAr}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {(cat.amount / 1000).toFixed(1)}K
                                                </span>
                                                <span className="text-xs text-gray-500 mr-2">
                                                    / {(cat.budget / 1000).toFixed(0)}K
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : cat.color}`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Expenses List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">السجل المالي</h2>
                            <p className="text-sm text-gray-500 mt-1">{totalCount} عملية</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-[300px]">
                        {loading ? (
                            <div className="p-6">
                                <TableSkeleton rows={5} columns={4} />
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">الفئة</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">الوصف</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>لا توجد مصروفات تطابق البحث</p>
                                                    <Link href="/finance/expenses/new" className="text-primary mt-2 text-sm hover:underline">
                                                        إضافة مصروف جديد
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map(expense => (
                                            <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                                                    {new Date(expense.expense_date).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded text-[10px] font-medium">
                                                        {categoryBudgets[expense.category]?.nameAr || expense.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                                    {expense.description}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white text-sm">
                                                    {Number(expense.amount).toLocaleString('ar-EG')}
                                                    <span className="text-xs text-gray-500 font-normal mr-1">{expense.currency}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Compact Pagination */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
