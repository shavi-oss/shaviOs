"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Plus,
    Trash2,
    Printer,
    Save,
    ArrowLeft,
    Calculator,
    Building2,
    User
} from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    customer_name: string | null;
    customer_company?: string | null;
}

interface QuoteItem {
    id: number;
    description: string;
    qty: number;
    price: number;
    total: number;
}

export default function NewQuotePage() {
    const router = useRouter();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [selectedDealId, setSelectedDealId] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([
        { id: 1, description: 'Consultation Service', qty: 1, price: 0, total: 0 }
    ]);
    const [taxRate, setTaxRate] = useState(14);
    const [notes, setNotes] = useState('This quote is valid for 15 days.');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('deals').select('id, title, customer_name, customer_company');
        if (data) setDeals(data);
    };

    const updateItem = (id: number, field: keyof QuoteItem, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updates = { ...item, [field]: value };
                if (field === 'qty' || field === 'price') {
                    updates.total = Number(updates.qty) * Number(updates.price);
                }
                return updates;
            }
            return item;
        }));
    };

    const addItem = () => {
        const newId = Math.max(...items.map(i => i.id)) + 1;
        setItems([...items, { id: newId, description: '', qty: 1, price: 0, total: 0 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = (subtotal * taxRate) / 100;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const { subtotal, tax, total } = calculateTotals();

    const handleSave = async () => {
        if (!selectedDealId) return alert('Please select a deal');
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.from('quotes').insert({
                deal_id: selectedDealId,
                items: items as any,
                subtotal,
                tax_rate: taxRate,
                tax_amount: tax,
                total_amount: total,
                notes,
                status: 'draft',
                valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
            });

            if (error) throw error;
            router.push('/sales/deals');
            alert('Quote saved successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save quote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-none">
            {/* Header / Actions - Hidden on Print */}
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        إنشاء عرض سعر جديد
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">قم بتعبئة التفاصيل لإنشاء ملف PDF</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                        <Printer className="w-4 h-4" />
                        طباعة / PDF
                    </button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors">
                        <Save className="w-4 h-4" />
                        {loading ? 'جاري الحفظ...' : 'حفظ كمسودة'}
                    </button>
                </div>
            </div>

            {/* A4 Paper Preview */}
            <div className="bg-white p-8 md:p-12 shadow-lg border border-gray-200 min-h-[1000px] relative print:shadow-none print:border-none print:w-full">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">عرض سعر / QUOTE</h2>
                        <div className="space-y-1 text-sm text-gray-500">
                            <p># PREVIEW-{new Date().getFullYear()}-001</p>
                            <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-primary">Shavi Academy</h3>
                        <div className="space-y-1 text-sm text-gray-500">
                            <p>123 Education St, Cairo</p>
                            <p>Tax ID: 555-999-111</p>
                            <p>contact@shavi.edu.eg</p>
                        </div>
                    </div>
                </div>

                {/* Client & Deal Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block print:hidden">Select Deal</label>
                        <select
                            value={selectedDealId}
                            onChange={(e) => setSelectedDealId(e.target.value)}
                            className="w-full p-2 border rounded bg-gray-50 text-sm print:hidden"
                        >
                            <option value="">-- اختر صفقة لربط العرض --</option>
                            {deals.map(deal => (
                                <option key={deal.id} value={deal.id}>{deal.title} ({deal.customer_name})</option>
                            ))}
                        </select>

                        {/* Print View of Client */}
                        {selectedDealId && (
                            <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-100 print:bg-white">
                                <p className="text-xs text-gray-400 font-bold mb-2">BILL TO:</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {deals.find(d => d.id === selectedDealId)?.customer_name}
                                </p>
                                <p className="text-gray-600">
                                    {deals.find(d => d.id === selectedDealId)?.customer_company}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-8">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="py-3 px-4 text-left">Description</th>
                            <th className="py-3 px-4 text-center w-24">Qty</th>
                            <th className="py-3 px-4 text-right w-32">Price</th>
                            <th className="py-3 px-4 text-right w-32">Total</th>
                            <th className="py-3 px-4 w-12 print:hidden"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr key={item.id} className="group">
                                <td className="py-3 px-4">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        className="w-full bg-transparent outline-none placeholder-gray-300"
                                        placeholder="Service or Product Name"
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                                        className="w-full text-center bg-transparent outline-none"
                                    />
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                        className="w-full text-right bg-transparent outline-none"
                                    />
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                    {item.total.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 print:hidden">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Add Item Button */}
                <button
                    onClick={addItem}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm mb-8 print:hidden"
                >
                    <Plus className="w-4 h-4" />
                    Add Line Item
                </button>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between text-gray-600 items-center">
                            <span className="flex items-center gap-2">
                                VAT (%)
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    className="w-12 border p-1 rounded text-center text-xs print:hidden"
                                />
                            </span>
                            <span>{tax.toLocaleString()} EGP</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                            <span>Total</span>
                            <span>{total.toLocaleString()} EGP</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="border-t border-gray-100 pt-8">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Notes & Terms</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-24 resize-none bg-gray-50 border-none rounded p-4 text-sm text-gray-600 print:bg-white print:p-0"
                    />
                </div>

                {/* Signature Block (Print Only) */}
                <div className="hidden print:flex justify-between mt-24 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <p className="w-48 border-b border-gray-300 pb-2 mb-2"></p>
                        <p className="text-xs text-gray-500 uppercase">Authorized Signature</p>
                    </div>
                    <div className="text-center">
                        <p className="w-48 border-b border-gray-300 pb-2 mb-2"></p>
                        <p className="text-xs text-gray-500 uppercase">Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
