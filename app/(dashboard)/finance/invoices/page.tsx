"use client";

import { useState } from 'react';
import {
    FileText,
    Plus,
    Download,
    Filter,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Eye,
    Send,
    Edit
} from 'lucide-react';
import Link from 'next/link';

interface Invoice {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_id: string;
    amount: number;
    status: 'draft' | 'issued' | 'paid' | 'pending' | 'overdue';
    issue_date: string;
    due_date: string;
    paid_amount: number;
}

export default function InvoicesPage() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const invoices: Invoice[] = [
        { id: '1', invoice_number: 'INV-2024-001', customer_name: 'TechCorp Ltd', customer_id: '1', amount: 45000, status: 'paid', issue_date: '2024-12-01', due_date: '2024-12-15', paid_amount: 45000 },
        { id: '2', invoice_number: 'INV-2024-002', customer_name: 'Digital Solutions', customer_id: '2', amount: 38000, status: 'pending', issue_date: '2024-12-05', due_date: '2024-12-20', paid_amount: 0 },
        { id: '3', invoice_number: 'INV-2024-003', customer_name: 'Innovation Hub', customer_id: '3', amount: 32000, status: 'overdue', issue_date: '2024-11-25', due_date: '2024-12-10', paid_amount: 0 },
        { id: '4', invoice_number: 'INV-2024-004', customer_name: 'Smart Systems', customer_id: '4', amount: 29000, status: 'issued', issue_date: '2024-12-08', due_date: '2024-12-22', paid_amount: 0 },
        { id: '5', invoice_number: 'INV-2024-005', customer_name: 'Cloud Ventures', customer_id: '5', amount: 25000, status: 'paid', issue_date: '2024-12-03', due_date: '2024-12-18', paid_amount: 25000 },
        { id: '6', invoice_number: 'INV-2024-006', customer_name: 'TechCorp Ltd', customer_id: '1', amount: 52000, status: 'pending', issue_date: '2024-12-10', due_date: '2024-12-25', paid_amount: 0 }
    ];

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: invoices.length,
        total_amount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        issued: invoices.filter(i => i.status === 'issued').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        paid_amount: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.paid_amount, 0),
        pending: invoices.filter(i => i.status === 'pending').length,
        overdue: invoices.filter(i => i.status === 'overdue').length
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Edit className="w-3 h-3" /> },
            issued: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FileText className="w-3 h-3" /> },
            paid: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
            pending: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock className="w-3 h-3" /> },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="w-3 h-3" /> }
        };
        const badge = badges[status as keyof typeof badges] || badges.draft;
        return (
            <span className={`px-2 py-0.5 ${badge.bg} ${badge.text} rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                {badge.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Invoices
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage customer invoices and payments</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link href="/finance/invoices/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Invoice
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Invoices</div>
                    <div className="text-xs text-gray-400 mt-1">${(stats.total_amount / 1000).toFixed(0)}K</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.issued}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Issued</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.paid}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Paid</div>
                    <div className="text-xs text-green-600 mt-1">${(stats.paid_amount / 1000).toFixed(0)}K</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-600">{stats.pending}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-1">Pending</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-black text-red-600">{stats.overdue}</div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">🚨 Overdue</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by customer or invoice number..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {['all', 'issued', 'paid', 'pending', 'overdue'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filterStatus === status
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Invoice #</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Issue Date</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Due Date</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => (
                            <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="py-3 px-4 font-mono text-sm font-bold text-blue-600">{invoice.invoice_number}</td>
                                <td className="py-3 px-4">
                                    <Link href={`/finance/customers/${invoice.customer_id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary">
                                        {invoice.customer_name}
                                    </Link>
                                </td>
                                <td className="py-3 px-4 text-right text-lg font-black text-gray-900 dark:text-white">
                                    ${invoice.amount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {new Date(invoice.issue_date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {new Date(invoice.due_date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    {getStatusBadge(invoice.status)}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1 hover:bg-gray-100 rounded" title="View">
                                            <Eye className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded" title="Download PDF">
                                            <Download className="w-4 h-4 text-gray-600" />
                                        </button>
                                        {invoice.status === 'pending' && (
                                            <button className="p-1 hover:bg-gray-100 rounded" title="Send">
                                                <Send className="w-4 h-4 text-blue-600" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
