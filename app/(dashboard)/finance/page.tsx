"use client";

import { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    AlertCircle,
    BarChart3,
    PieChart,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

export default function FinancialDashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    // KPI Data
    const kpis = {
        monthly_revenue: 2500000,
        total_expenses: 1800000,
        net_profit: 700000,
        accounts_receivable: 450000,
        overdue_payments: 120000,
        cashflow: 550000,
        profit_margin: 28,
        ytd_revenue: 28000000
    };

    // Revenue vs Expenses Data (Last 12 months)
    const revenueExpensesData = [
        { month: 'Jan', revenue: 2200, expenses: 1650 },
        { month: 'Feb', revenue: 2350, expenses: 1700 },
        { month: 'Mar', revenue: 2450, expenses: 1750 },
        { month: 'Apr', revenue: 2300, expenses: 1680 },
        { month: 'May', revenue: 2600, expenses: 1820 },
        { month: 'Jun', revenue: 2550, expenses: 1800 },
        { month: 'Jul', revenue: 2400, expenses: 1750 },
        { month: 'Aug', revenue: 2650, expenses: 1850 },
        { month: 'Sep', revenue: 2500, expenses: 1800 },
        { month: 'Oct', revenue: 2700, expenses: 1900 },
        { month: 'Nov', revenue: 2550, expenses: 1780 },
        { month: 'Dec', revenue: 2500, expenses: 1800 }
    ];

    const maxRevenue = Math.max(...revenueExpensesData.map(d => d.revenue));

    // Department Revenue
    const deptRevenue = [
        { dept: 'Sales', revenue: 1200000, percentage: 48 },
        { dept: 'Marketing', revenue: 600000, percentage: 24 },
        { dept: 'Operations', revenue: 450000, percentage: 18 },
        { dept: 'Customer Success', revenue: 250000, percentage: 10 }
    ];

    // Top Customers
    const topCustomers = [
        { name: 'TechCorp Ltd', revenue: 450000, invoices: 12 },
        { name: 'Digital Solutions', revenue: 380000, invoices: 8 },
        { name: 'Innovation Hub', revenue: 320000, invoices: 10 },
        { name: 'Smart Systems', revenue: 290000, invoices: 7 },
        { name: 'Cloud Ventures', revenue: 250000, invoices: 9 }
    ];

    // Top Suppliers
    const topSuppliers = [
        { name: 'AWS Cloud Services', expenses: 180000 },
        { name: 'Office Lease Co.', expenses: 150000 },
        { name: 'Marketing Agency', expenses: 120000 },
        { name: 'Software Licenses', expenses: 95000 },
        { name: 'Equipment Supply', expenses: 75000 }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        Financial Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time financial metrics and analytics</p>
                </div>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            {/* KPI Cards (8 Metrics) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Monthly Revenue */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">Monthly Revenue</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-black text-green-600">${(kpis.monthly_revenue / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> +12% vs last month
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Total Expenses</span>
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-black text-orange-600">${(kpis.total_expenses / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> +5% vs last month
                    </div>
                </div>

                {/* Net Profit */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Net Profit</span>
                        <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-blue-600">${(kpis.net_profit / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> +18% vs last month
                    </div>
                </div>

                {/* Profit Margin */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Profit Margin</span>
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-black text-purple-600">{kpis.profit_margin}%</div>
                    <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> +2% vs last month
                    </div>
                </div>

                {/* Accounts Receivable */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500">Accounts Due</span>
                        <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">${(kpis.accounts_receivable / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500 mt-1">15 pending invoices</div>
                </div>

                {/* Overdue Payments */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">Overdue Payments</span>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-2xl font-black text-red-600">${(kpis.overdue_payments / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-red-600 mt-1">🚨 5 overdue invoices</div>
                </div>

                {/* Cashflow */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Cashflow</span>
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-2xl font-black text-teal-600">${(kpis.cashflow / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-teal-600 mt-1">Positive this month</div>
                </div>

                {/* YTD Revenue */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">YTD Revenue</span>
                        <BarChart3 className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-black text-yellow-600">${(kpis.ytd_revenue / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-yellow-600 mt-1">Target: $30M</div>
                </div>
            </div>

            {/* Revenue vs Expenses Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Revenue vs Expenses (Last 12 Months)
                </h2>
                <div className="flex items-end justify-between gap-1 h-64">
                    {revenueExpensesData.map((data, idx) => {
                        const revenueHeight = (data.revenue / maxRevenue) * 100;
                        const expensesHeight = (data.expenses / maxRevenue) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex gap-0.5">
                                    <div
                                        className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${revenueHeight * 2.5}px` }}
                                        title={`Revenue: $${data.revenue}K`}
                                    ></div>
                                    <div
                                        className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${expensesHeight * 2.5}px` }}
                                        title={`Expenses: $${data.expenses}K`}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium">{data.month}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-600">Expenses</span>
                    </div>
                </div>
            </div>

            {/* Revenue by Department & Top Customers/Suppliers */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue by Department */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold mb-4">Revenue by Department</h2>
                    <div className="space-y-3">
                        {deptRevenue.map((dept, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept.dept}</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">${(dept.revenue / 1000).toFixed(0)}K ({dept.percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        style={{ width: `${dept.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold mb-4">Top 5 Paying Customers</h2>
                    <div className="space-y-2">
                        {topCustomers.map((customer, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center font-black text-sm">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{customer.name}</p>
                                        <p className="text-xs text-gray-500">{customer.invoices} invoices</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-green-600">${(customer.revenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Suppliers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Top 5 Suppliers with Expenses</h2>
                <div className="grid md:grid-cols-5 gap-3">
                    {topSuppliers.map((supplier, idx) => (
                        <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{supplier.name}</p>
                            <p className="text-lg font-black text-orange-600">${(supplier.expenses / 1000).toFixed(0)}K</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
