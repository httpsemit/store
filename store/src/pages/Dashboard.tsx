import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp,
    IndianRupee,
    ShoppingCart,
    Scan,
    PlusCircle,
    FileText,
    AlertTriangle,
    ArrowRight,
    Zap,
    CheckCircle2,
    CreditCard,
    History as LucideHistory,
    ArrowUpRight,
    Wallet
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

const Dashboard = () => {
    const navigate = useNavigate();
    const { getTodayStats, getLowStockAlerts, sales, currentUser, addExpense, showToast } = useStore();
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());

    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        category: 'Utility',
        description: ''
    });
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const stats = getTodayStats();
    const lowStockAlerts = getLowStockAlerts();
    const recentSales = sales.slice(0, 5);
    const isOwner = currentUser?.role === 'Owner';

    const handleAddExpense = async (e: FormEvent) => {
        e.preventDefault();
        if (!expenseForm.amount) return;
        
        setIsAddingExpense(true);
        try {
            await addExpense({
                amount: Number(expenseForm.amount),
                category: expenseForm.category,
                description: expenseForm.description,
                date: new Date().toISOString().split('T')[0]
            });
            setExpenseForm({ amount: '', category: 'Utility', description: '' });
        } catch (error) {
            showToast('error', 'Failed to add expense');
        } finally {
            setIsAddingExpense(false);
        }
    };

    const statCards = [
        { 
            title: t('gross_revenue'), 
            value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
            icon: IndianRupee, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            trend: '+Live',
            show: true
        },
        { 
            title: t('net_profit'), 
            value: `₹${stats.totalProfit.toLocaleString('en-IN')}`, 
            icon: TrendingUp, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50',
            trend: 'Direct',
            show: isOwner 
        },
        { 
            title: t('transactions'), 
            value: stats.transactionsCount, 
            icon: ShoppingCart, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            trend: 'Checkouts',
            show: true
        },
        { 
            title: "Credit Sales", 
            value: `₹${stats.totalCredit.toLocaleString('en-IN')}`, 
            icon: CreditCard, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50',
            trend: 'Pending',
            show: true
        },
    ].filter(card => card.show);

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 animate-fade-in">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                <div>
                     <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter leading-none uppercase">Store Pulse</h1>
                     <p className="text-gray-400 text-xs font-bold mt-3 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Live Performance Updates
                     </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white rounded-xl sm:rounded-2xl border border-indigo-100 text-xs font-black text-indigo-600 uppercase tracking-widest shadow-lg shadow-indigo-50/50 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        {format(currentTime, 'hh:mm:ss a')}
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="group bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110`}>
                                <stat.icon size={22} />
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 uppercase tracking-widest">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                        <stat.icon size={60} className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all text-gray-900" />
                    </div>
                ))}
            </div>

            {/* Quick Actions & Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {[
                    { label: t('inventory'), action: 'Quick Refill', icon: Scan, path: '/scanner', color: 'indigo' },
                    { label: t('pos'), action: 'Generate Bill', icon: PlusCircle, path: '/sales', color: 'emerald' },
                    { label: t('reports'), action: t('analytics'), icon: FileText, path: '/reports', color: 'blue' },
                ].map((item, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(item.path)}
                        className={`group relative flex flex-col items-start p-4 sm:p-6 bg-white text-gray-900 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-${item.color}-100 transition-all overflow-hidden`}
                    >
                        <div className="flex items-start justify-between w-full mb-4">
                            <div className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-xl group-hover:bg-${item.color}-600 group-hover:text-white transition-colors`}>
                                <item.icon size={22} />
                            </div>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight uppercase leading-none">{item.action}</h3>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                {/* Critical Alerts Dashboard */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-sm relative overflow-hidden group min-h-[300px] sm:min-h-[400px]">
                         <div className="absolute top-0 right-0 p-8">
                            <AlertTriangle className="text-red-50 text-opacity-30 group-hover:text-red-50 transition-colors" size={140} />
                         </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-10 relative gap-4">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Stock Radar</h3>
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2">Critical inventory shortages</p>
                            </div>
                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-black text-[10px] shadow-lg animate-pulse uppercase tracking-widest">
                                {lowStockAlerts.length} ISSUES
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 relative">
                            {lowStockAlerts.length > 0 ? (
                                lowStockAlerts.map(alert => (
                                    <div key={alert.productId} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-red-50/50 rounded-[24px] sm:rounded-[32px] border border-red-100 hover:bg-white transition-all group/item shadow-sm">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-red-600 shadow-md font-black text-xs sm:text-sm">
                                            {alert.currentStock}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-xs sm:text-sm truncate uppercase tracking-tight">{alert.productName}</p>
                                            <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-0.5">{alert.categoryName}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/scanner')}
                                            className="p-3 bg-red-500 text-white rounded-xl font-black transition-all opacity-0 group-hover/item:opacity-100"
                                        >
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 sm:py-20 flex flex-col items-center justify-center">
                                    <CheckCircle2 size={48} className="text-emerald-500 mb-4 opacity-20" />
                                    <p className="text-gray-300 font-black uppercase tracking-widest text-xs">All inventory levels optimized</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Daily Expense Engine */}
                <div className="xl:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-sm group hover:shadow-2xl transition-all h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 sm:mb-10">
                            <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Daily Expenses</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Deducted from profit</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-6">
                            <div className="space-y-3">
                                <div className="relative">
                                    <IndianRupee size={14} className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input 
                                        type="number"
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[20px] sm:rounded-[28px] pl-12 sm:pl-16 pr-6 sm:pr-8 py-3 sm:py-5 text-lg sm:text-xl font-black outline-none focus:ring-4 focus:ring-gray-200 transition-all text-gray-900"
                                        placeholder="0.00"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <select 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[20px] sm:rounded-[28px] px-4 sm:px-8 py-3 sm:py-5 font-black uppercase text-[10px] tracking-widest outline-none focus:ring-4 focus:ring-gray-200 transition-all appearance-none"
                                    value={expenseForm.category}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    <option value="Utility">Utility Bills</option>
                                    <option value="Salary">Staff Salary</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Inventory">Direct Cash Purchase</option>
                                    <option value="Other">Other Misc</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[20px] sm:rounded-[28px] px-4 sm:px-8 py-3 sm:py-5 text-xs font-bold outline-none focus:ring-4 focus:ring-gray-200 transition-all text-gray-600 min-h-[80px] sm:min-h-[100px] resize-none"
                                    placeholder="Brief note (e.g. Milk delivery)"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <button 
                                disabled={isAddingExpense}
                                type="submit"
                                className="w-full py-3 sm:py-5 bg-gray-900 text-white rounded-[20px] sm:rounded-[28px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-[0.98] mt-2"
                            >
                                {isAddingExpense ? 'RECORDING...' : 'SAVE EXPENSE'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Live Stream Section */}
            <div className="bg-white border border-gray-100 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <LucideHistory size={20} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Live Feed</h3>
                    </div>
                    <button onClick={() => navigate('/reports')} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-[0.2em] border-b-2 border-indigo-100 pb-1">Full Report</button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {recentSales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-4 sm:p-6 bg-gray-50/50 border border-gray-100 rounded-[24px] sm:rounded-[32px] hover:bg-white hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm font-black text-sm sm:text-base">
                                    ₹
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tighter leading-none mb-1">₹{sale.total.toLocaleString('en-IN')}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{format(new Date(sale.createdAt), 'hh:mm a')}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                                    {sale.paymentMethod}
                                </span>
                                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-600" />
                            </div>
                        </div>
                    ))}
                    {recentSales.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-[10px]">
                            Awaiting first transaction...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
