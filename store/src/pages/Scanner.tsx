import { useState, useEffect, useRef } from 'react';
import {
    Scan,
    Keyboard,
    Camera as CameraIcon,
    X,
    IndianRupee,
    Loader2,
    CheckCircle2,
    Search,
    Trash2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { Html5QrcodeScanner } from 'html5-qrcode';
import React from 'react';

const Scanner = () => {
    const { products, addStockIntake, showToast } = useStore();
    const [mode, setMode] = useState<'manual' | 'camera'>('manual');
    const [searchQuery, setSearchQuery] = useState('');
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);
    
    // Scanner Ref
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Initialize/Destroy Scanner
    useEffect(() => {
        if (mode === 'camera') {
            const scanner = new Html5QrcodeScanner(
                'reader',
                { fps: 15, qrbox: { width: 250, height: 150 } },
                false
            );

            scanner.render(
                (decodedText) => {
                    handleScan(decodedText);
                    // Don't clear immediately, let user see or tap to stop
                },
                () => {
                    // Silent on error
                }
            );

            scannerRef.current = scanner;
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
                scannerRef.current = null;
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
            }
        };
    }, [mode]);

    const handleScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode);
        if (!product) {
            showToast('error', `Unknown Product: Barcode ${barcode} is not in your inventory!`);
            return;
        }

        const existing = scannedItems.find(i => i.productId === product.id);
        if (existing) {
            setScannedItems(prev => prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            const item = {
                productId: product.id,
                name: product.name,
                barcode: product.barcode,
                quantity: 1,
                costPrice: product.costPrice,
                unit: product.unit
            };
            setScannedItems(prev => [item, ...prev]);
        }
        setSearchQuery('');
    };

    // Low stock priority sorting
    const suggestions = React.useMemo(() => {
        const sorted = [...products].sort((a, b) => a.quantity - b.quantity);
        if (!searchQuery) return sorted.slice(0, 16);
        
        return sorted.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.barcode.includes(searchQuery)
        ).slice(0, 16);
    }, [products, searchQuery]);

    const updateItem = (id: string, updates: any) => {
        setScannedItems(prev => prev.map(i => i.productId === id ? { ...i, ...updates } : i));
    };

    const removeItem = (id: string) => {
        setScannedItems(prev => prev.filter(i => i.productId !== id));
    };

    const handleConfirm = async () => {
        if (scannedItems.length === 0) return;
        
        setIsConfirming(true);
        try {
            for (const item of scannedItems) {
                await addStockIntake({
                    productId: item.productId,
                    productName: item.name,
                    barcode: item.barcode,
                    quantity: item.quantity,
                    costPrice: item.costPrice,
                    supplier: 'General Supplier'
                });
            }

            setScannedItems([]);
            setIsConfirming(false);
            showToast('success', 'Stock intake recorded and inventory updated!');
        } catch (error) {
            setIsConfirming(false);
            showToast('error', 'Error updating stock. Please check your connection.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4 sm:gap-6 pb-2">
            {/* Page Header */}
            {/* Unified Toolbar Line */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-[20px] sm:rounded-[32px] border border-gray-100 shadow-xl no-print">
                {/* Search / Manual Barcode Input */}
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleScan(searchQuery);
                            }
                        }}
                        placeholder="Search product name or scan barcode..."
                        className="w-full pl-10 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[16px] sm:rounded-[24px] font-bold text-gray-900 shadow-inner outline-none transition-all"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            <X size={14} className="sm:size-4" />
                        </button>
                    )}
                </div>

                <div className="flex bg-gray-50 p-1 sm:p-1.5 rounded-[16px] sm:rounded-[24px] border border-gray-200">
                    <button
                        onClick={() => setMode('manual')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            mode === 'manual' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Keyboard size={14} className="sm:size-5" /> Manual
                    </button>
                    <button
                        onClick={() => setMode('camera')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            mode === 'camera' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <CameraIcon size={14} className="sm:size-5" /> Camera
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full overflow-hidden">
                {/* Left: Interactive Input Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {mode === 'camera' && (
                        <div className="bg-white rounded-[24px] sm:rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden group min-h-[300px] sm:min-h-[400px]">
                            <div className="w-full flex-1 flex flex-col animate-fade-in relative z-10">
                                <div id="reader" className="w-full h-full rounded-[20px] sm:rounded-[32px] overflow-hidden border-2 sm:border-4 border-emerald-100" />
                                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between pointer-events-none">
                                     <div className="px-2 sm:px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-red-500 rounded-full animate-pulse" />
                                          Live Engine
                                     </div>
                                </div>
                            </div>
                            
                            {/* Background Decoration */}
                            <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-32 h-32 sm:w-64 sm:h-64 bg-emerald-100/30 rounded-full blur-[40px] sm:blur-[80px] pointer-events-none group-hover:bg-emerald-200/40 transition-colors" />
                        </div>
                    )}

                    {/* Quick Suggestions */}
                    <div className="bg-white rounded-[20px] sm:rounded-[32px] border border-gray-100 shadow-sm p-4 sm:p-6 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
                             <h3 className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Suggestions (Low Stock First)</h3>
                             {searchQuery && <span className="text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase">Filtering Results</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto pr-1 custom-scrollbar">
                            {suggestions.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleScan(p.barcode)}
                                    className="group relative text-left p-3 sm:p-4 bg-gray-50/50 rounded-lg sm:rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-md transition-all truncate"
                                >
                                    <p className="text-xs font-black text-gray-900 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tighter">{p.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{p.barcode.slice(-6)}</p>
                                        <div className={clsx(
                                            "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] sm:text-[8px] font-black uppercase",
                                            p.quantity === 0 ? "bg-red-50 text-red-600" :
                                            p.quantity < 10 ? "bg-amber-50 text-amber-600" :
                                            "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {p.quantity} {p.unit}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Intake Staging Area */}
                <div className="w-full lg:w-[360px] flex flex-col bg-white border border-gray-100 rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden shrink-0 mt-0 lg:mt-2">
                    <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between bg-emerald-50/20">
                        <div>
                            <h3 className="font-black text-gray-900 tracking-tight leading-none uppercase text-xs">Intake Staging</h3>
                            <p className="text-[8px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1 sm:mt-1.5">{scannedItems.length} SKUs Ready</p>
                        </div>
                        <button 
                            onClick={() => setScannedItems([])} 
                            className="p-2 sm:p-3 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-lg sm:rounded-xl border border-transparent hover:border-red-50 shadow-sm"
                        >
                            <Trash2 size={14} className="sm:size-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
                        {scannedItems.map((item) => (
                            <div key={item.productId} className="group bg-gray-50/50 hover:bg-white p-2 sm:p-3 rounded-lg sm:rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{item.name}</p>
                                        <p className="text-[8px] sm:text-xs font-black text-gray-400 uppercase tracking-widest leading-none">#{item.barcode.slice(-8)}</p>
                                    </div>
                                    <button onClick={() => removeItem(item.productId)} className="p-1 sm:p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={12} className="sm:size-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex-1">
                                         <label className="block text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Qty ({item.unit})</label>
                                         <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.productId, { quantity: Number(e.target.value) })}
                                            className="w-full bg-white border border-gray-100 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 text-xs font-black outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                                         />
                                    </div>
                                    <div className="flex-1">
                                         <label className="block text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Cost (₹)</label>
                                         <div className="relative">
                                             <IndianRupee className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 text-gray-300" size={8} />
                                             <input
                                                type="number"
                                                value={item.costPrice}
                                                onChange={(e) => updateItem(item.productId, { costPrice: Number(e.target.value) })}
                                                className="w-full bg-white border border-gray-100 rounded-lg sm:rounded-xl pl-4 sm:pl-5 pr-2 sm:pr-3 py-1.5 text-xs font-black outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                                             />
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {scannedItems.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center py-16 sm:py-20 opacity-40">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 sm:mb-6 border border-dashed border-gray-200">
                                    <Scan size={24} className="sm:size-12" />
                                </div>
                                <h4 className="font-black text-gray-500 uppercase tracking-widest text-xs">Waiting for Input</h4>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-2 max-w-[200px]">Your scans will appear here for verification.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 space-y-3 sm:space-y-4 no-print">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm">
                                <div>
                                    <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total</p>
                                    <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tighter">₹{scannedItems.reduce((a, b) => a + (b.costPrice * b.quantity), 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                     <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Items</p>
                                     <p className="text-lg sm:text-xl font-black text-emerald-600 tracking-tighter">{scannedItems.reduce((a, b) => a + b.quantity, 0)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={scannedItems.length === 0 || isConfirming}
                            onClick={handleConfirm}
                            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-emerald-600 text-white rounded-[16px] sm:rounded-[20px] font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 sm:gap-3 group text-xs sm:text-sm uppercase tracking-widest"
                        >
                            {isConfirming ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Synchronize Stock</span>
                                    <CheckCircle2 size={18} className="sm:size-24 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
