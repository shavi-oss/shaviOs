"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Upload,
    User,
    Mail,
    Phone,
    Building2,
    Calendar,
    DollarSign,
    Briefcase,
    FileText,
    Save
} from 'lucide-react';
import Link from 'next/link';

export default function AddEmployeePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Info
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_number: '',
        birth_date: '',
        address: '',

        // Employment Details
        department: '',
        position: '',
        employment_type: 'full_time',
        start_date: '',
        manager_id: '',

        // Salary Info
        base_salary: '',
        commission_rate: '',
        benefits: '',

        // Emergency Contact
        emergency_name: '',
        emergency_phone: '',
        emergency_relation: '',

        // Bank Details
        bank_name: '',
        account_number: '',
        iban: ''
    });

    const handleSubmit = async () => {
        // In production, save to Supabase
        console.log('Saving employee:', formData);
        router.push('/hr/employees');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/hr/employees" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Directory
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    Step {step} of 4
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <User className="w-6 h-6 text-primary" />
                    Add New Employee
                </h1>
                <p className="text-gray-500 text-sm mt-1">Complete all steps to add employee to the system</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {[
                    { num: 1, label: 'Personal Info' },
                    { num: 2, label: 'Employment' },
                    { num: 3, label: 'Salary & Bank' },
                    { num: 4, label: 'Documents' }
                ].map((s, idx) => (
                    <div key={s.num} className="flex items-center flex-1">
                        <div className={`flex items-center gap-2 ${idx < 3 ? 'flex-1' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {s.num}
                            </div>
                            <span className={`text-sm font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {idx < 3 && (
                            <div className={`h-0.5 flex-1 mx-2 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name *</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ahmed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="Hassan"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="ahmed@shavi.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="+20 123 456 789"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">ID Number</label>
                                <input
                                    type="text"
                                    value={formData.id_number}
                                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Birth Date</label>
                                <input
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Employment Details */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Department *</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Finance">Finance</option>
                                    <option value="HR">HR</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Customer Success">Customer Success</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Position *</label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="Sales Manager"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Employment Type *</label>
                                <select
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="full_time">Full-time</option>
                                    <option value="commission">Commission Only</option>
                                    <option value="mixed">Salary + Commission</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Date *</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-sm mb-3">Emergency Contact</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.emergency_phone}
                                        onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-2">Relation</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_relation}
                                        onChange={(e) => setFormData({ ...formData, emergency_relation: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="Spouse, Parent, etc."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Salary & Bank */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Base Salary (EGP) *</label>
                                <input
                                    type="number"
                                    value={formData.base_salary}
                                    onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="25000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                                <input
                                    type="number"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Benefits</label>
                            <textarea
                                value={formData.benefits}
                                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                rows={2}
                                placeholder="Medical insurance, transportation allowance, etc."
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-bold text-sm mb-3">Bank Details (for Payroll)</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-2">Bank Name</label>
                                    <input
                                        type="text"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-2">Account Number</label>
                                    <input
                                        type="text"
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-xs font-medium mb-2">IBAN</label>
                                <input
                                    type="text"
                                    value={formData.iban}
                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Documents */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">Upload Employee Documents</p>
                            <p className="text-xs text-gray-400 mb-4">CV, ID Copy, Certificates, Contracts</p>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
                                Choose Files
                            </button>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700">📝 Tip: You can upload documents later from the employee profile page</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => step > 1 && setStep(step - 1)}
                    disabled={step === 1}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/hr/employees')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    {step < 4 ? (
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
                            <Save className="w-4 h-4" /> Save Employee
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
