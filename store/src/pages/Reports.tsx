import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FileText,
    Printer,
    Download,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Calendar as CalendarIcon,
    Loader2,
    Trophy
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import type { Sale, Expense } from '../types';

const Reports = () => {
    const { products, fetchSalesForDate, fetchSalesForPeriod, fetchExpensesForDate, fetchExpensesForPeriod } = useStore();
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [reportSales, setReportSales] = useState<Sale[]>([]);
    const [reportExpenses, setReportExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [saleTypeFilter, setSaleTypeFilter] = useState<'All' | 'retail' | 'wholesale'>('All');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            let salesData, expensesData;
            if (period === 'daily') {
                [salesData, expensesData] = await Promise.all([
                    fetchSalesForDate(selectedDate),
                    fetchExpensesForDate(selectedDate)
                ]);
            } else {
                [salesData, expensesData] = await Promise.all([
                    fetchSalesForPeriod(period),
                    fetchExpensesForPeriod(period)
                ]);
            }
            setReportSales(salesData);
            setReportExpenses(expensesData);
            setIsLoading(false);
        };
        loadData();
    }, [selectedDate, period, fetchSalesForDate, fetchSalesForPeriod, fetchExpensesForPeriod]);

    // Filter sales based on type
    const filteredSales = reportSales.filter(s => saleTypeFilter === 'All' || s.saleType === saleTypeFilter);

    // Calculate Stats
    const revenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const retailRevenue = filteredSales.filter(s => s.saleType === 'retail').reduce((acc, s) => acc + s.total, 0);
    const wholesaleRevenue = filteredSales.filter(s => s.saleType === 'wholesale').reduce((acc, s) => acc + s.total, 0);

    // Real Profit Calculation
    let profit = 0;
    filteredSales.forEach(sale => {
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const costPrice = product?.costPrice ?? 0;
            profit += item.quantity * (item.unitPrice - costPrice);
        });
    });

    const totalExpenses = reportExpenses.reduce((acc, e) => acc + e.amount, 0);

    const stats = [
        { title: t('gross_revenue'), value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: t('net_profit'), value: `₹${(profit - totalExpenses).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Total Expenses', value: `₹${totalExpenses.toLocaleString('en-IN')}`, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
        { title: t('transactions'), value: filteredSales.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    const paymentMethods = [
        { name: 'Cash', amount: filteredSales.filter(s => s.paymentMethod === 'Cash').reduce((acc, s) => acc + s.total, 0) },
        { name: 'UPI', amount: filteredSales.filter(s => s.paymentMethod === 'UPI').reduce((acc, s) => acc + s.total, 0) },
        { name: 'Credit', amount: filteredSales.filter(s => s.paymentMethod === 'Credit').reduce((acc, s) => acc + s.total, 0) },
    ];

    // Calculate Top Sellers
    const topSellersMap = new Map<string, { name: string; qty: number; revenue: number }>();
    filteredSales.forEach(sale => {
        sale.items.forEach(item => {
            const existing = topSellersMap.get(item.productId);
            if (existing) {
                existing.qty += item.quantity;
                existing.revenue += item.total;
            } else {
                topSellersMap.set(item.productId, { name: item.productName, qty: item.quantity, revenue: item.total });
            }
        });
    });

    const topSellers = Array.from(topSellersMap.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

    return (
        <div className="space-y-6 sm:space-y-8 print:p-0 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:gap-6 print:hidden">
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-widest leading-none">{t('reports')}</h2>

                    <div className="flex bg-gray-100 p-1 rounded-lg sm:rounded-xl">
                        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={clsx(
                                    "px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    period === p ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg sm:rounded-xl">
                        {(['All', 'retail', 'wholesale'] as const).map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setSaleTypeFilter(filterType)}
                                className={clsx(
                                    "px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    saleTypeFilter === filterType ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {filterType === 'All' ? t('all_sales') : filterType}
                            </button>
                        ))}
                    </div>

                    {period === 'daily' && (
                        <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm focus-within:border-indigo-500 transition-all">
                            <CalendarIcon className="text-gray-400" size={14} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-xs sm:text-sm font-bold text-gray-700 bg-transparent focus:outline-none"
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border border-gray-100 rounded-xl sm:rounded-2xl text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm no-print">
                        <Download size={14} className="sm:size-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 no-print"
                    >
                        <Printer size={14} className="sm:size-4" /> Print Summary
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 bg-gray-50/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                        <Loader2 className="text-indigo-600 animate-spin" size={32} />
                    </div>
                )}
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={16} className="sm:size-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</p>
                        <h3 className="text-lg sm:text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Side Content */}
                <div className="space-y-8">
                    {/* Payment Summary */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <CreditCard size={12} className="sm:size-4" />
                            Payment Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-emerald-600">
                                <span className="text-[10px] font-black uppercase">Retail Revenue</span>
                                <span className="font-black">₹{retailRevenue.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between text-indigo-600 pb-4 border-b border-gray-50">
                                <span className="text-[10px] font-black uppercase">Wholesale Revenue</span>
                                <span className="font-black">₹{wholesaleRevenue.toLocaleString('en-IN')}</span>
                            </div>
                            {paymentMethods.map((method) => (
                                <div key={method.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-gray-600">{method.name}</span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">₹{method.amount.toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-50 flex justify-between items-center text-indigo-600">
                            <span className="text-xs sm:text-sm font-bold">Closing Total</span>
                            <span className="text-lg sm:text-xl font-black">₹{revenue.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Expense Summary */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 overflow-hidden relative group">
                        <div className="absolute -top-6 -right-6 p-4 text-rose-50/50 group-hover:text-rose-50 transition-colors">
                            <TrendingDown size={100} />
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 relative">
                            <TrendingDown size={12} className="sm:size-4 text-rose-500" />
                            Expense Breakdown
                        </h3>
                        <div className="space-y-3 sm:space-y-4 relative">
                            {reportExpenses.length > 0 ? reportExpenses.map((exp) => (
                                <div key={exp.id} className="flex flex-col gap-1 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{exp.category}</span>
                                        <span className="text-[10px] font-black text-rose-600">₹{exp.amount}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium italic">{exp.description || 'No notes added'}</p>
                                </div>
                            )) : (
                                <p className="text-[10px] text-gray-300 font-bold uppercase py-4 text-center italic tracking-widest">No expenses recorded</p>
                            )}
                        </div>
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-50 flex justify-between items-center text-rose-600 relative">
                            <span className="text-xs sm:text-sm font-bold">Total Cost</span>
                            <span className="text-lg sm:text-xl font-black">₹{totalExpenses.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Top Sellers */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Trophy size={12} className="sm:size-4 text-amber-500" />
                            Top Selling Products
                        </h3>
                        {topSellers.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {topSellers.map((item, idx) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] sm:text-[10px] font-black text-gray-300 w-4">#{idx + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">{item.name}</span>
                                                <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">{item.qty} sold</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-gray-700">₹{item.revenue.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-center text-gray-400 py-4">No data for this date.</p>
                        )}
                    </div>
                </div>

                {/* Sales Log */}
                <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px] sm:min-h-[500px]">
                    <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Daily Transaction Log</h3>
                        <span className="text-[9px] sm:text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase tracking-wider">
                            {filteredSales.length} Invoices
                        </span>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-gray-50/50 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">Invoice ID</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left hidden sm:table-cell">Type</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">Customer</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left hidden md:table-cell">Payment</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className="font-mono text-[9px] sm:text-[10px] text-indigo-400 font-black group-hover:text-indigo-600">
                                                #{sale.id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider",
                                                sale.saleType === 'wholesale' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                            )}>
                                                {sale.saleType}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-black text-gray-900">
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[120px] sm:max-w-none">{sale.customerName || 'Walk-in Customer'}</span>
                                                <span className="text-[9px] text-gray-400 font-normal sm:hidden">{format(parseISO(sale.createdAt), 'hh:mm a')}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                            <span className={clsx(
                                                "inline-flex items-center px-2 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider",
                                                sale.paymentMethod === 'Cash' ? "bg-emerald-50 text-emerald-700" :
                                                    sale.paymentMethod === 'UPI' ? "bg-blue-50 text-blue-700" :
                                                        "bg-rose-50 text-rose-700"
                                            )}>
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm font-black text-gray-900">
                                            ₹{sale.total.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 sm:py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                                    <FileText size={40} />
                                                </div>
                                                <p className="text-gray-400 text-sm font-medium italic">No sales found for this date.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
