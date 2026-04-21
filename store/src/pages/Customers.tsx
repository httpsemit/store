import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, User, Phone, Mail, CreditCard, History, Banknote, Edit2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import type { Customer } from '../types';

const Customers = () => {
    const { customers, addCustomer, updateCustomer, showToast, fetchCustomerHistory, addRepayment } = useStore();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showRepaymentModal, setShowRepaymentModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerHistory, setCustomerHistory] = useState<{ sales: any[], payments: any[] }>({ sales: [], payments: [] });
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', customerType: 'retail' as 'retail' | 'wholesale' });
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [repaymentMethod, setRepaymentMethod] = useState<'Cash' | 'UPI'>('Cash');

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            await updateCustomer(editingCustomer.id, formData);
            showToast('success', 'Customer updated');
        } else {
            await addCustomer(formData);
        }
        closeModal();
    };

    const openModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({ name: customer.name, phone: customer.phone, email: customer.email || '', customerType: customer.customerType });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', email: '', customerType: 'retail' });
        }
        setShowModal(true);
    };

    const openHistory = async (customer: Customer) => {
        setSelectedCustomer(customer);
        const history = await fetchCustomerHistory(customer.id);
        setCustomerHistory(history);
        setShowHistoryModal(true);
    };

    const openRepayment = (customer: Customer) => {
        setSelectedCustomer(customer);
        setRepaymentAmount('');
        setShowRepaymentModal(true);
    };

    const handleRepayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        await addRepayment({
            customerId: selectedCustomer.id,
            amount: Number(repaymentAmount),
            paymentMethod: repaymentMethod,
            date: new Date().toISOString().split('T')[0]
        });
        setShowRepaymentModal(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowHistoryModal(false);
        setShowRepaymentModal(false);
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', email: '', customerType: 'retail' });
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div className="flex flex-col justify-between items-start gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Customer Base</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Manage your relationships and credit lines</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="w-full sm:w-auto group flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 sm:py-3.5 rounded-[16px] sm:rounded-[20px] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                    <Plus size={16} className="sm:size-5 group-hover:rotate-90 transition-transform" /> {t('add_customer')}
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search by name or phone number..."
                    className="w-full bg-white border border-gray-100 rounded-[20px] sm:rounded-[32px] pl-10 sm:pl-16 pr-4 sm:pr-8 py-3 sm:py-6 text-base sm:text-lg font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="bg-white border border-gray-100 rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-start justify-between mb-4 sm:mb-8 relative">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 rounded-[16px] sm:rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-100 font-black text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={clsx(
                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                    customer.customerType === 'wholesale' 
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}>
                                    {customer.customerType}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openModal(customer)}
                                        className="p-2 sm:p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl sm:rounded-2xl transition-all"
                                    >
                                        <Edit2 size={14} className="sm:size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 sm:space-y-6 relative">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none mb-2">{customer.name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <Phone size={10} className="sm:size-3" /> {customer.phone || 'No phone'}
                                </div>
                            </div>

                            <div className="p-3 sm:p-5 bg-gray-50 rounded-[16px] sm:rounded-[24px] border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Credit Balance</span>
                                    <CreditCard size={10} className="sm:size-3 text-gray-300" />
                                </div>
                                <div className={clsx(
                                    "text-lg sm:text-xl font-black tracking-tighter",
                                    customer.creditBalance > 0 ? "text-red-500" : "text-emerald-500"
                                )}>
                                    ₹{customer.creditBalance.toLocaleString('en-IN')}
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-2 pt-1">
                                <button 
                                    onClick={() => openHistory(customer)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    <History size={12} className="sm:size-4" /> {t('history')}
                                </button>
                                <button 
                                    onClick={() => openRepayment(customer)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                                >
                                    <Banknote size={12} className="sm:size-4" /> Pay
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Repayment Modal */}
            {showRepaymentModal && selectedCustomer && (
                <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden p-6 sm:p-8 animate-pop">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight uppercase">Record Repayment</h3>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl border border-red-100">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Current Due</p>
                            <p className="text-lg sm:text-2xl font-black text-red-600 tracking-tighter">₹{selectedCustomer.creditBalance.toLocaleString('en-IN')}</p>
                        </div>
                        <form onSubmit={handleRepayment} className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paid Amount (₹)</label>
                                <input
                                    autoFocus
                                    required
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="Enter amount"
                                    value={repaymentAmount}
                                    onChange={(e) => setRepaymentAmount(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setRepaymentMethod('Cash')}
                                    className={clsx(
                                        "py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2",
                                        repaymentMethod === 'Cash' ? "bg-gray-900 text-white border-gray-900 shadow-xl" : "bg-white text-gray-400 border-gray-100"
                                    )}
                                >
                                    Cash
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setRepaymentMethod('UPI')}
                                    className={clsx(
                                        "py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2",
                                        repaymentMethod === 'UPI' ? "bg-indigo-600 text-white border-indigo-600 shadow-xl" : "bg-white text-gray-400 border-gray-100"
                                    )}
                                >
                                    UPI
                                </button>
                            </div>
                            <button 
                                type="submit"
                                className="w-full py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                            >
                                Confirm Repayment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && selectedCustomer && (
                <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden animate-pop max-h-[90vh] flex flex-col">
                        <div className="p-4 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight uppercase">{selectedCustomer.name}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction History & Ledger</p>
                            </div>
                            <button onClick={closeModal} className="p-3 text-gray-400 hover:bg-gray-100 rounded-2xl transition-colors">
                                <X size={18} className="sm:size-6" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 sm:p-6 bg-red-50 rounded-[20px] sm:rounded-[32px] border border-red-100">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Total Credit Given</p>
                                    <p className="text-lg sm:text-2xl font-black text-red-600 tracking-tighter">₹{customerHistory.sales.filter(s => s.paymentMethod === 'Credit').reduce((acc, s) => acc + s.total, 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-4 sm:p-6 bg-emerald-50 rounded-[20px] sm:rounded-[32px] border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Payments Received</p>
                                    <p className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tighter">₹{customerHistory.payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    Recent Bills
                                </h4>
                                <div className="space-y-3">
                                    {customerHistory.sales.map((sale) => (
                                        <div key={sale.id} className="p-5 bg-gray-50 rounded-3xl flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-black text-gray-900">Bill #{sale.billNo || sale.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{new Date(sale.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-gray-900">₹{sale.total.toLocaleString('en-IN')}</p>
                                                <p className={clsx("text-[9px] font-black uppercase tracking-widest", sale.paymentMethod === 'Credit' ? "text-red-500" : "text-emerald-500")}>
                                                    {sale.paymentMethod}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {customerHistory.sales.length === 0 && <p className="text-center text-[10px] text-gray-400 font-bold py-10 uppercase">No sale history found</p>}
                                </div>

                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 pt-4">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                    Payment Ledger
                                </h4>
                                <div className="space-y-3">
                                    {customerHistory.payments.map((payment) => (
                                        <div key={payment.id} className="p-5 bg-emerald-50 rounded-3xl flex items-center justify-between border border-emerald-100/50">
                                            <div>
                                                <p className="text-xs font-black text-emerald-700">Payment Received</p>
                                                <p className="text-[10px] text-emerald-500/70 font-bold">{new Date(payment.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-emerald-700">₹{payment.amount.toLocaleString('en-IN')}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{payment.paymentMethod}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {customerHistory.payments.length === 0 && <p className="text-center text-[10px] text-gray-400 font-bold py-10 uppercase">No repayment history found</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-10 transform scale-100">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fill in the required information</p>
                            </div>
                            <button onClick={closeModal} className="p-3 text-gray-400 hover:bg-gray-100 rounded-2xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Customer Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="tel"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                                        placeholder="Mobile Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                                        placeholder="Email (Optional)"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Customer Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, customerType: 'retail' }))}
                                        className={clsx(
                                            "py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2",
                                            formData.customerType === 'retail' ? "bg-emerald-600 text-white border-emerald-600 shadow-xl" : "bg-white text-gray-400 border-gray-100"
                                        )}
                                    >
                                        Retail
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, customerType: 'wholesale' }))}
                                        className={clsx(
                                            "py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2",
                                            formData.customerType === 'wholesale' ? "bg-indigo-600 text-white border-indigo-600 shadow-xl" : "bg-white text-gray-400 border-gray-100"
                                        )}
                                    >
                                        Wholesale
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                            >
                                {editingCustomer ? 'Update Profile' : 'Register Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
