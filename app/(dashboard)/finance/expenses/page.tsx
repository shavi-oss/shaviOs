"use client";

import { useState } from 'react';
import {
    DollarSign,
    Plus,
    Download,
    TrendingUp,
    AlertTriangle,
    PieChart
} from 'lucide-react';
import Link from 'next/link';

export default function ExpensesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { name: 'Salaries', amount: 850000, budget: 900000, color: 'bg-blue-500' },
        { name: 'Rent', amount: 150000, budget: 150000, color: 'bg-purple-500' },
        { name: 'Tools', amount: 85000, budget: 100000, color: 'bg-green-500' },
        { name: 'Servers', amount: 180000, budget: 150000, color: 'bg-red-500' },
        { name: 'Marketing', amount: 220000, budget: 200000, color: 'bg-yellow-500' },
        { name: 'Subscriptions', amount: 95000, budget: 100000, color: 'bg-pink-500' },
        { name: 'Suppliers', amount: 120000, budget: 150000, color: 'bg-orange-500' },
        { name: 'Commissions', amount: 75000, budget: 80000, color: 'bg-teal-500' },
        { name: 'Miscellaneous', amount: 25000, budget: 50000, color: 'bg-gray-500' }
    ];

    const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const overBudgetCategories = categories.filter(cat => cat.amount > cat.budget);

    const recentExpenses = [
        { id: '1', date: '2024-12-10', category: 'Servers', vendor: 'AWS Cloud Services', amount: 15000, status: 'approved' },
        { id: '2', date: '2024-12-09', category: 'Marketing', vendor: 'Meta Ads', amount: 8500, status: 'approved' },
        { id: '3', date: '2024-12-08', category: 'Tools', vendor: 'Adobe', amount: 4200, status: 'pending' },
        { id: '4', date: '2024-12-07', category: 'Salaries', vendor: 'Payroll Dec', amount: 850000, status: 'approved' },
        { id: '5', date: '2024-12-06', category: 'Subscriptions', vendor: 'GitHub Enterprise', amount: 2400, status: 'approved' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        Expenses Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Track and analyze company expenses</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link href="/finance/expenses/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Expense
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">${(totalExpenses / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Total This Month</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">${(totalBudget / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Monthly Budget</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{((totalExpenses / totalBudget) * 100).toFixed(0)}%</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Budget Used</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{overBudgetCategories.length}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">🚨 Over Budget</div>
                </div>
            </div>

            {/* Alerts */}
            {overBudgetCategories.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-bold text-red-800 dark:text-red-400">Budget Alerts</h3>
                            <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                                {overBudgetCategories.map((cat, idx) => (
                                    <li key={idx}>
                                        • <strong>{cat.name}</strong> exceeded budget by ${((cat.amount - cat.budget) / 1000).toFixed(0)}K
                                        ({(((cat.amount - cat.budget) / cat.budget) * 100).toFixed(0)}% over)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense by Category */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Categories List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold mb-4">Expenses by Category</h2>
                    <div className="space-y-3">
                        {categories.map((cat, idx) => {
                            const percentage = (cat.amount / cat.budget) * 100;
                            const isOver = cat.amount > cat.budget;
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                                ${(cat.amount / 1000).toFixed(0)}K
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">
                                                / ${(cat.budget / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-full rounded-full ${isOver ? 'bg-red-500' : cat.color}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    {isOver && (
                                        <div className="text-xs text-red-600 mt-1">⚠️ {percentage.toFixed(0)}% of budget</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pie Chart Visualization */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-500" />
                        Category Distribution
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat, idx) => {
                            const percentage = (cat.amount / totalExpenses) * 100;
                            return (
                                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                                    <div className={`w-3 h-3 ${cat.color} rounded-full mx-auto mb-1`}></div>
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{cat.name}</div>
                                    <div className="text-sm font-black text-gray-900 dark:text-white">{percentage.toFixed(0)}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold">Recent Expenses</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Vendor</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentExpenses.map(expense => (
                            <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                                    {expense.vendor}
                                </td>
                                <td className="py-3 px-4 text-right text-lg font-black text-orange-600">
                                    ${expense.amount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${expense.status === 'approved'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {expense.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
