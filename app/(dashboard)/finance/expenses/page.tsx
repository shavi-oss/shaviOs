"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    DollarSign,
    Receipt,
    Trash2,
    Briefcase
} from 'lucide-react';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    created_at: string;
}

const CATEGORIES = ['Rent', 'Salaries', 'Software', 'Marketing', 'Office Supplies', 'Utilities', 'Taxes', 'Other'];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({ description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('type', 'expense')
                .order('date', { ascending: false });

            if (data) setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const supabase = createClient();
            const { error } = await supabase.from('transactions').insert({
                type: 'expense',
                description: newItem.description,
                amount: parseFloat(newItem.amount),
                category: newItem.category,
                date: newItem.date,
                currency: 'EGP'
            });

            if (error) throw error;

            setShowModal(false);
            setNewItem({ description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0] });
            fetchExpenses();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const supabase = createClient();
            await supabase.from('transactions').delete().eq('id', id);
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">المصروفات</h1>
                    <p className="text-muted-foreground mt-2">تتبع النفقات التشغيلية والفواتير</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>تسجيل مصروف</span>
                </button>
            </div>

            {/* Expenses List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-sm">
                                <th className="py-4 px-6 font-medium text-gray-500">التاريخ</th>
                                <th className="py-4 px-6 font-medium text-gray-500">البند</th>
                                <th className="py-4 px-6 font-medium text-gray-500">التصنيف</th>
                                <th className="py-4 px-6 font-medium text-gray-500">المبلغ</th>
                                <th className="py-4 px-6 font-medium text-gray-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">جاري التحميل...</td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">لا توجد مصروفات مسجلة</td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(expense.date).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                                            {expense.description}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-red-600">
                                            -{expense.amount.toLocaleString()} EGP
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                تسجيل مصروف جديد
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">وصف المصروف</label>
                                <input
                                    required
                                    type="text"
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="مثال: إيجار المكتب"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">المبلغ (EGP)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newItem.amount}
                                        onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">التاريخ</label>
                                    <input
                                        required
                                        type="date"
                                        value={newItem.date}
                                        onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">التصنيف</label>
                                <select
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                                >
                                    حفظ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
