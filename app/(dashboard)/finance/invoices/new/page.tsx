"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Trash2,

    Send
} from 'lucide-react';
import Link from 'next/link';

interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total: number;
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState(() => ({
        customer_id: '',
        customer_name: '',
        billing_address: '',
        payment_terms: '30',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    }));

    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unit_price: 0, tax_rate: 14, total: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, tax_rate: 14, total: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate total
        const item = newItems[index];
        const subtotal = item.quantity * item.unit_price;
        const tax = subtotal * (item.tax_rate / 100);
        newItems[index].total = subtotal + tax;

        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateTax = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate / 100), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSubmit = () => {
        console.log('Creating invoice:', { ...formData, items });
        router.push('/finance/invoices');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/finance/invoices" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Invoices
                </Link>
                <div className="text-sm text-gray-500">
                    Step {step} of 3
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-bold">Create New Invoice</h1>
                <p className="text-gray-500 text-sm mt-1">Fill in the details to generate an invoice</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {[
                    { num: 1, label: 'Customer' },
                    { num: 2, label: 'Line Items' },
                    { num: 3, label: 'Review & Issue' }
                ].map((s, idx) => (
                    <div key={s.num} className="flex items-center flex-1">
                        <div className={`flex items-center gap-2 ${idx < 2 ? 'flex-1' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {s.num}
                            </div>
                            <span className={`text-sm font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {idx < 2 && (
                            <div className={`h-0.5 flex-1 mx-2 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {/* Step 1: Customer Details */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Customer *</label>
                                <select
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value, customer_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select Customer</option>
                                    <option value="TechCorp Ltd">TechCorp Ltd</option>
                                    <option value="Digital Solutions">Digital Solutions</option>
                                    <option value="Innovation Hub">Innovation Hub</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Terms</label>
                                <select
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="15">Net 15</option>
                                    <option value="30">Net 30</option>
                                    <option value="60">Net 60</option>
                                    <option value="90">Net 90</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Billing Address</label>
                            <textarea
                                value={formData.billing_address}
                                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="123 Business St, Cairo, Egypt"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Issue Date</label>
                                <input
                                    type="date"
                                    value={formData.issue_date}
                                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Line Items */}
                {step === 2 && (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid md:grid-cols-5 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Product/Service"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Unit Price</label>
                                        <input
                                            type="number"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium mb-1">Tax %</label>
                                            <input
                                                type="number"
                                                value={item.tax_rate}
                                                onChange={(e) => updateItem(index, 'tax_rate', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        {items.length > 1 && (
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 text-right text-sm font-bold text-gray-700">
                                    Total: ${item.total.toFixed(2)}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addItem}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span className="font-bold">${calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-blue-300 text-lg">
                                    <span className="font-bold">Total:</span>
                                    <span className="font-black text-blue-600">${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <h3 className="font-bold mb-2">Invoice Summary</h3>
                            <div className="space-y-1 text-sm">
                                <p><strong>Invoice #:</strong> {formData.invoice_number}</p>
                                <p><strong>Customer:</strong> {formData.customer_name}</p>
                                <p><strong>Issue Date:</strong> {formData.issue_date}</p>
                                <p><strong>Due Date:</strong> {formData.due_date}</p>
                                <p><strong>Items:</strong> {items.length}</p>
                                <p className="text-xl font-black text-primary mt-2">Total: ${calculateTotal().toFixed(2)}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notes/Terms (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="Payment terms, delivery notes, etc."
                            />
                        </div>

                        <div className="flex gap-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm">Send invoice to customer via email</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={() => step > 1 && setStep(step - 1)}
                    disabled={step === 1}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/finance/invoices')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" /> Issue Invoice
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
