import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Banknote,
    Smartphone,
    FileText,
    X,
    Barcode,
    CheckCircle2,
    Package,
    UserPlus,
    Printer,
    MessageCircle,
    User as UserIcon,
    ArrowLeft,
    Loader2,
    Camera
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useStore } from '../store/useStore';
import type { Product, SaleItem, Customer } from '../types';
import { clsx } from 'clsx';

const POS = () => {
    const { products, categories, customers, addSale, addCustomer, showToast } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = React.useState<SaleItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = React.useState('');
    const [showCustomerResults, setShowCustomerResults] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Credit'>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newCustomerBody, setNewCustomerBody] = useState({ name: '', phone: '', customerType: 'retail' as 'retail' | 'wholesale' });

    // Barcode scanner focus
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Keep focus on barcode input for faster scanning
        barcodeInputRef.current?.focus();
    }, []);

    // Product search logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
        const cat = categories.find(c => c.id === p.categoryId);
        const matchesCategory = selectedCategory === 'All' || cat?.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleSaleType = (type: 'retail' | 'wholesale') => {
        if (cart.length > 0) {
            if (window.confirm('Changing sale type will clear your current cart. Proceed?')) {
                setCart([]);
                setSaleType(type);
            }
        } else {
            setSaleType(type);
        }
    };

    const addToCart = (product: Product) => {
        if (product.quantity <= 0) {
            showToast('error', `Cannot add ${product.name}: Out of stock!`);
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.quantity) {
                    showToast('error', `Cannot add more: Max stock reached!`);
                    return prev;
                }
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
                        : item
                );
            }
            const unitPrice = saleType === 'wholesale' ? (product.wholesalePrice ?? product.price) : product.price;
            return [...prev, {
                productId: product.id,
                productName: product.name,
                barcode: product.barcode,
                quantity: 1,
                unitPrice: unitPrice,
                total: unitPrice
            }];
        });

        // Refocus barcode input after manual click
        barcodeInputRef.current?.focus();
    };

    const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const barcode = e.currentTarget.value;
            const product = products.find(p => p.barcode === barcode);

            if (product) {
                addToCart(product);
                e.currentTarget.value = ''; // Clear for next scan
            } else if (barcode.trim() !== '') {
                showToast('error', `Product with barcode ${barcode} not found!`);
                e.currentTarget.value = '';
            }
        }
    };

    const updateCartQty = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                const product = products.find(p => p.id === productId);

                if (product && newQty > product.quantity) {
                    showToast('error', 'Limit reached: Maximum available stock.');
                    return item;
                }

                return { ...item, quantity: newQty, total: newQty * item.unitPrice };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const total = subtotal - discount;

    const startCameraScanner = () => {
        setIsScanning(true);
        setTimeout(() => {
            const html5Qrcode = new Html5Qrcode('pos-scanner');
            scannerRef.current = html5Qrcode;
            html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    const product = products.find(p => p.barcode === decodedText);
                    if (product) {
                        addToCart(product);
                        stopCameraScanner();
                        showToast('success', `Scanned: ${product.name}`);
                    } else {
                        showToast('error', `Product not found: ${decodedText}`);
                    }
                },
                () => { }
            ).catch((err) => {
                console.error('Camera start error:', err);
                showToast('error', 'Could not access camera. Please allow camera permission.');
                setIsScanning(false);
            });
        }, 100);
    };

    const stopCameraScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop()
                .then(() => scannerRef.current?.clear())
                .catch(e => console.error(e));
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleQuickAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomerBody.name) return;
        const customer = await addCustomer(newCustomerBody);
        if (customer) {
            setSelectedCustomer(customer);
            setShowQuickAdd(false);
            setNewCustomerBody({ name: '', phone: '', customerType: 'retail' });
        }
    };

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            showToast('error', 'Cart is empty! Add items to complete sale.');
            return;
        }
        if (paymentMethod === 'Credit' && !selectedCustomer) {
            showToast('error', 'Customer selection is mandatory for Credit sales!');
            return;
        }

        setIsProcessing(true);
        try {
            const billNo = `BILL-${Date.now()}`;
            const dateStr = new Date().toLocaleDateString('en-GB');

            const saleData = {
                items: cart,
                subtotal,
                discount,
                total,
                paymentMethod,
                saleType,
                customerId: selectedCustomer?.id,
                customerName: selectedCustomer?.name || 'Walk-in Customer'
            };

            await addSale(saleData);

            // Set last sale for invoice view
            setLastSale({
                ...saleData,
                billNo,
                date: dateStr
            });

            // Cleanup
            setCart([]);
            setDiscount(0);
            setSelectedCustomer(null);
            setIsProcessing(false);
            setShowInvoice(true);
        } catch (error: unknown) {
            console.error('Sale completion error in POS:', error);
            setIsProcessing(false);
            const message = error instanceof Error ? error.message : 'Failed to complete sale. Please try again.';
            showToast('error', message);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-120px)] lg:h-[calc(100vh-140px)] gap-4 sm:gap-6 pb-2">
            {/* Hidden Input for Barcode Scanning */}
            <input
                ref={barcodeInputRef}
                type="text"
                className="absolute -top-10 opacity-0 pointer-events-none"
                onKeyDown={handleBarcodeScan}
                autoFocus
            />

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full lg:overflow-hidden">
                {/* Left: Product Selection */}
                <div className="flex-1 flex flex-col min-w-0 lg:order-1">
                    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 items-center">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/20 dark:border-white/10 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={startCameraScanner}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all sm:hidden"
                                title="Open Camera Scanner"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex bg-gray-100 dark:bg-gray-900 dark:bg-[#1a1a1a] p-1 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/20 dark:border-white/10 shadow-inner">
                                <button
                                    onClick={() => toggleSaleType('retail')}
                                    className={clsx(
                                        "px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        saleType === 'retail' ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                    )}
                                >
                                    Retail
                                </button>
                                <button
                                    onClick={() => toggleSaleType('wholesale')}
                                    className={clsx(
                                        "px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        saleType === 'wholesale' ? "bg-white dark:bg-[#0a0a0a] text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                    )}
                                >
                                    Wholesale
                                </button>
                            </div>
                            <button
                                onClick={startCameraScanner}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                            >
                                <Camera size={16} /> Scan Barcode
                            </button>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/20 dark:border-white/10 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm font-medium flex-1 sm:flex-none"
                            >
                                <option value="All">All Items</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pb-4 sm:pb-6 pr-1 custom-scrollbar">
                        {filteredProducts.map(p => {
                            const cat = categories.find(c => c.id === p.categoryId);
                            const inCart = cart.find(item => item.productId === p.id);
                            const isOutOfStock = p.quantity <= 0;

                            return (
                                <button
                                    key={p.id}
                                    disabled={isOutOfStock}
                                    onClick={() => addToCart(p)}
                                    className={clsx(
                                        "relative text-left bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 dark:border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all group flex flex-col items-start active:scale-95",
                                        inCart && "ring-2 ring-indigo-600 border-transparent",
                                        isOutOfStock && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg ring-4 ring-white"
                                            style={{ backgroundColor: cat?.color || '#cbd5e1' }}
                                        >
                                            {p.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-gray-900 dark:text-white text-xs sm:text-sm truncate leading-tight group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{cat?.name || 'Uncategorized'}</p>
                                        </div>
                                    </div>

                                    <div className="w-full mt-auto pt-3 sm:pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Price</p>
                                            <p className={clsx(
                                                "font-black text-base sm:text-lg leading-none",
                                                saleType === 'wholesale' ? "text-indigo-600" : "text-gray-900 dark:text-white"
                                            )}>
                                                ₹{saleType === 'wholesale' ? (p.wholesalePrice ?? p.price) : p.price}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Stock</p>
                                            <p className={clsx(
                                                "text-xs font-black",
                                                p.quantity <= 5 ? "text-amber-600" : "text-gray-500 dark:text-gray-400"
                                            )}>
                                                {p.quantity} {p.unit}
                                            </p>
                                        </div>
                                    </div>

                                    {inCart && (
                                        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-indigo-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg shadow-indigo-200 animate-pop">
                                            {inCart.quantity}
                                        </div>
                                    )}
                                </button>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center opacity-30">
                                <Package size={64} className="mb-4" />
                                <p className="font-black uppercase tracking-widest">No products found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Modern Checkout Panel */}
                <div className="w-full lg:w-[380px] flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 dark:border-white/5 rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden shrink-0 mt-0 lg:mt-2 lg:order-2 max-h-[45vh] lg:max-h-full">
                    <div className="p-4 sm:p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30/20">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-lg sm:rounded-xl text-white">
                                <ShoppingCart size={14} className="sm:size-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none text-xs sm:text-sm uppercase">Order Cart</h3>
                                <p className="text-[8px] sm:text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{cart.length} Items</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">ID</p>
                            <p className="text-[10px] sm:text-xs font-black text-indigo-600 mt-1">#DRAFT</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
                        {cart.map((item: SaleItem) => (
                            <div key={item.productId} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-[#121212]/50 rounded-2xl sm:rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white dark:bg-[#0a0a0a] transition-all group">
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900 dark:text-white text-xs sm:text-sm truncate">{item.productName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-md">
                                            ₹{item.unitPrice}
                                        </span>
                                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">
                                            x {item.quantity}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center bg-white dark:bg-[#0a0a0a] rounded-lg sm:rounded-xl border border-gray-100 dark:border-white/10 dark:border-white/5 shadow-sm p-1">
                                    <button
                                        onClick={() => updateCartQty(item.productId, -1)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/30 rounded-lg transition-all"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black text-gray-900 dark:text-white">{item.quantity}</span>
                                    <button
                                        onClick={() => updateCartQty(item.productId, 1)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/30 rounded-lg transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                            </div>
                        ))}

                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center py-16 sm:py-20">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-[#121212] rounded-full flex items-center justify-center text-gray-200 mb-6">
                                    <Barcode size={32} />
                                </div>
                                <h4 className="font-black text-gray-400 uppercase tracking-widest text-xs sm:text-sm">Cart is Empty</h4>
                                <p className="text-xs text-gray-300 font-medium mt-2 max-w-[180px] sm:max-w-[200px]">Scan a barcode or select an item from the left to begin.</p>
                            </div>
                        )}
                    </div>

                    {/* Summary & Checkout */}
                    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-[#121212] border-t border-gray-100 dark:border-white/10 dark:border-white/5 space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Discount</span>
                                <div className="flex items-center">
                                    <span className="mr-1 text-[10px] font-black text-green-600">-₹</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        className="w-16 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/20 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-black text-right outline-none focus:ring-1 focus:ring-green-500 transition-all text-green-600"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/20 dark:border-white/10">
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Payable</span>
                                <span className="text-lg sm:text-2xl font-black text-indigo-600 tracking-tighter">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex gap-2 relative flex-col sm:flex-row">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/20 dark:border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold shadow-inner"
                                                placeholder="Select Customer"
                                                value={customerSearch}
                                                onFocus={() => setShowCustomerResults(true)}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    setShowCustomerResults(true);
                                                }}
                                            />
                                            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <UserIcon size={12} className="sm:size-4" />
                                            </div>

                                            {showCustomerResults && customerSearch.length > 0 && (
                                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 dark:border-white/5 rounded-xl sm:rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-pop">
                                                    {customers.filter((c: Customer) =>
                                                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                        c.phone.includes(customerSearch)
                                                    ).map((c: Customer) => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => {
                                                                setSelectedCustomer(c);
                                                                setCustomerSearch(c.name);
                                                                setShowCustomerResults(false);
                                                            }}
                                                            className="w-full text-left px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-indigo-50 dark:bg-indigo-950/30 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
                                                        >
                                                            <p className="text-xs font-black text-gray-900 dark:text-white">{c.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold">{c.phone}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowQuickAdd(true)}
                                            className="p-2.5 sm:p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-lg sm:rounded-xl hover:bg-indigo-100 transition-colors"
                                            title="Add New Customer"
                                        >
                                            <UserPlus size={16} className="sm:size-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                        {[
                                            { id: 'Cash', icon: Banknote },
                                            { id: 'UPI', icon: Smartphone },
                                            { id: 'Credit', icon: FileText }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id as any)}
                                                className={clsx(
                                                    "flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border-2 text-[7px] sm:text-[8px] font-black uppercase tracking-tight transition-all",
                                                    paymentMethod === method.id
                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                                                        : "bg-white dark:bg-[#0a0a0a] border-transparent text-gray-400 hover:bg-gray-100 dark:bg-gray-900 dark:bg-[#1a1a1a]"
                                                )}
                                            >
                                                <method.icon size={12} className="sm:size-4" />
                                                {method.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={cart.length === 0 || isProcessing || (paymentMethod === 'Credit' && !selectedCustomer)}
                                onClick={handleCompleteSale}
                                className="w-full relative py-3 sm:py-4 px-4 sm:px-6 bg-indigo-600 text-white rounded-[16px] sm:rounded-[20px] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale overflow-hidden flex items-center justify-center gap-2 sm:gap-3 group text-xs sm:text-sm uppercase tracking-widest"
                            >
                                {isProcessing ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        <span>Invoice & Close</span>
                                        <CheckCircle2 size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Camera Scanner Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md">
                    <div className="w-full max-w-md aspect-square bg-white dark:bg-[#0a0a0a] rounded-[40px] overflow-hidden shadow-2xl relative border-8 border-indigo-600">
                        <div id="pos-scanner" className="w-full h-full"></div>
                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 rounded-[32px]"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan-line"></div>
                    </div>
                    <button
                        onClick={stopCameraScanner}
                        className="mt-12 px-10 py-4 bg-white dark:bg-[#0a0a0a]/10 hover:bg-white dark:bg-[#0a0a0a]/20 text-white rounded-full font-black uppercase tracking-widest flex items-center gap-3 border border-white/20 transition-all"
                    >
                        <X size={20} /> Close Scanner
                    </button>
                </div>
            )}

            {/* Quick Add Customer Modal */}
            {showQuickAdd && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Quick Add Customer</h3>
                            <button onClick={() => setShowQuickAdd(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:bg-gray-900 dark:bg-[#1a1a1a] rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleQuickAddCustomer} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name *</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-white/10 dark:border-white/5 rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Enter full name"
                                    value={newCustomerBody.name}
                                    onChange={(e) => setNewCustomerBody(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-white/10 dark:border-white/5 rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Enter mobile number"
                                    value={newCustomerBody.phone}
                                    onChange={(e) => setNewCustomerBody(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Type</label>
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-[#121212] p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setNewCustomerBody(prev => ({ ...prev, customerType: 'retail' }))}
                                        className={clsx(
                                            "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            newCustomerBody.customerType === 'retail'
                                                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 shadow-sm border border-emerald-100"
                                                : "text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                        )}
                                    >
                                        Retail
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCustomerBody(prev => ({ ...prev, customerType: 'wholesale' }))}
                                        className={clsx(
                                            "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            newCustomerBody.customerType === 'wholesale'
                                                ? "bg-white dark:bg-[#0a0a0a] text-indigo-600 shadow-sm border border-indigo-100"
                                                : "text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                        )}
                                    >
                                        Wholesale
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                            >
                                Add Customer
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Branded Invoice View Modal */}
            {showInvoice && lastSale && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden shadow-emerald-900/20">
                        <div className="p-1.5 bg-emerald-500"></div>
                        <div className="p-8 flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border-4 border-emerald-100 animate-pop">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 uppercase">Bill Generated!</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Amit Store</p>

                            {/* Invoice Receipt Body */}
                            <div className="w-full bg-gray-50 dark:bg-[#121212] rounded-[32px] p-6 mb-8 border border-dashed border-gray-200 dark:border-white/20 dark:border-white/10">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-white/20 dark:border-white/10">
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-black text-gray-400">Bill No</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{lastSale.billNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-black text-gray-400">Date</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{lastSale.date}</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Customer</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{lastSale.customerName}</p>
                                    <p className="text-[10px] font-black text-emerald-600 tracking-tight mt-0.5">Payment: {lastSale.paymentMethod}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {lastSale.items.map((item: SaleItem, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
                                            <span>{item.productName.toLowerCase()} {item.quantity} × {item.unitPrice}</span>
                                            <span className="font-black text-gray-900 dark:text-white">₹{item.total}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-200 dark:border-white/20 dark:border-white/10">
                                    <span className="text-lg font-black text-gray-900 dark:text-white uppercase">Total</span>
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">₹{lastSale.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <p className="text-[10px] font-bold text-gray-400 uppercase text-center mb-8">Thank you! Visit again.</p>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">
                                    <Printer size={16} /> Print
                                </button>
                                <button
                                    onClick={() => {
                                        const itemsText = lastSale.items.map((i: any) => `${i.productName} x ${i.quantity} : ₹${i.total}`).join('\n');
                                        const structuredText = `*AMIT STORE - INVOICE*\nBill: #${lastSale.billNo}\nDate: ${lastSale.date}\n-----------------------\n${itemsText}\n-----------------------\n*TOTAL: ₹${lastSale.total}*\nPayment: ${lastSale.paymentMethod}\n-----------------------\nThank you! Visit again.`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(structuredText)}`, '_blank');
                                    }}
                                    className="flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                                >
                                    <MessageCircle size={16} /> WhatsApp
                                </button>
                                <button
                                    onClick={() => setShowInvoice(false)}
                                    className="col-span-2 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all mt-2"
                                >
                                    New Bill <ArrowLeft size={16} />
                                </button>
                            </div>
                            <p className="text-[9px] font-bold text-gray-300 mt-6 uppercase tracking-tighter">
                                {window.location.hostname}
                            </p>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};


export default POS;
