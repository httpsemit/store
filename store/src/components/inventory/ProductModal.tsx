import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Package, Barcode, IndianRupee, Layers, Camera, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { clsx } from 'clsx';
import type { Product, Category } from '../../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: any) => void;
    product?: Product | null;
    categories: Category[];
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        categoryId: '',
        price: 0,
        wholesalePrice: 0,
        costPrice: 0,
        quantity: 0,
        unit: 'pcs',
        lowStockThreshold: 10,
        description: '',
    });

    const modalRef = useRef<HTMLDivElement>(null);

    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner(
                'modal-reader',
                { fps: 15, qrbox: { width: 250, height: 150 } },
                false
            );

            scanner.render(
                (decodedText) => {
                    setFormData(prev => ({ ...prev, barcode: decodedText }));
                    setIsScanning(false);
                },
                () => { }
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
    }, [isScanning]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                barcode: product.barcode,
                categoryId: product.categoryId,
                price: product.price,
                wholesalePrice: product.wholesalePrice || 0,
                costPrice: product.costPrice,
                quantity: product.quantity,
                unit: product.unit,
                lowStockThreshold: product.lowStockThreshold || 10,
                description: product.description || '',
            });
        } else {
            setFormData({
                name: '',
                barcode: '',
                categoryId: categories[0]?.id || '',
                price: 0,
                wholesalePrice: 0,
                costPrice: 0,
                quantity: 0,
                unit: 'pcs',
                lowStockThreshold: 10,
                description: '',
            });
        }
    }, [product, categories, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div
                ref={modalRef}
                className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Package size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">
                                {product ? 'Edit Product Specification' : 'Register New Product'}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Inventory Management System</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-8 overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
                    {isScanning && (
                        <div className="relative h-64 bg-black rounded-[32px] overflow-hidden border-4 border-amber-100 animate-fade-in no-print">
                            <div id="modal-reader" className="w-full h-full" />
                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                Live Scan Active
                            </div>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-5">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Primary Details</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Full Product Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Amul Butter 500g"
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold shadow-inner"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Category</label>
                                <div className="relative">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold appearance-none shadow-inner"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identifiers & Units */}
                    <div className="space-y-5">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Stock & Format</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Barcode / SKU (Optional)</label>
                                <div className="relative">
                                    <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Scan or Enter"
                                        className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-mono font-bold shadow-inner"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsScanning(!isScanning)}
                                        className={clsx(
                                            "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                                            isScanning ? "bg-amber-100 text-amber-600" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                        )}
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Current Stock</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold shadow-inner"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Low Stock Warning At</label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold shadow-inner"
                                        value={formData.lowStockThreshold}
                                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Unit Type</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold appearance-none shadow-inner"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="pcs">pcs</option>
                                    <option value="pkt">pkt</option>
                                    <option value="kg">kg</option>
                                    <option value="gm">gm</option>
                                    <option value="ml">ml</option>
                                    <option value="ltr">ltr</option>
                                    <option value="bottle">bottle</option>
                                    <option value="box">box</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-5">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Financials</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Retail Price (₹)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={16} />
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-lg font-black text-gray-900 shadow-inner"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Wholesale Price (₹)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
                                    <input
                                        type="number"
                                        placeholder="Fallback: Retail"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-lg font-black text-indigo-900 shadow-inner"
                                        value={formData.wholesalePrice || ''}
                                        onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Purchase Cost (₹)</label>
                                <div className="relative opacity-80">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-lg font-bold text-gray-500 shadow-inner"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                        {formData.price > 0 && formData.costPrice > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="px-5 py-3 bg-green-50 rounded-2xl flex items-center justify-between">
                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Retail Margin</span>
                                    <span className="text-sm font-black text-green-700 uppercase">
                                        ₹{(formData.price - formData.costPrice).toFixed(2)}
                                    </span>
                                </div>
                                {(formData.wholesalePrice || 0) > 0 && (
                                    <div className="px-5 py-3 bg-indigo-50 rounded-2xl flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Wholesale Margin</span>
                                        <span className="text-sm font-black text-indigo-700 uppercase">
                                            ₹{((formData.wholesalePrice || 0) - formData.costPrice).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-5">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Additional Notes</label>
                        <textarea
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-medium text-gray-600 min-h-[100px] resize-none shadow-inner"
                            placeholder="Add product origin, storage instructions or supplier details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-50 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 px-6 rounded-2xl bg-indigo-600 text-sm font-black text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            {product ? 'Synchronize Updates' : 'Confirm Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
