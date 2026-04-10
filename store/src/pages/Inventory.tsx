import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Package, AlertCircle, Archive, Barcode } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductModal from '../components/inventory/ProductModal';
import type { Product } from '../types';
import { clsx } from 'clsx';

const Inventory = () => {
    const { products, categories, addProduct, updateProduct, deleteProduct, currentUser, showToast } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const isOwner = currentUser?.role === 'Owner';

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
        const cat = categories.find(c => c.id === p.categoryId);
        const matchesCategory = selectedCategory === 'All' || cat?.name === selectedCategory;

        let matchesStock = true;
        const threshold = cat?.lowStockThreshold ?? 10;
        if (stockFilter === 'Low Stock') matchesStock = p.quantity > 0 && p.quantity <= threshold;
        if (stockFilter === 'Out of Stock') matchesStock = p.quantity === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!isOwner) {
            showToast('error', 'Strictly restricted: Only Owners can delete products.');
            return;
        }

        if (window.confirm(`PERMANENT ACTION: Are you sure you want to delete ${name}? This will remove all history associated with this product.`)) {
            await deleteProduct(id);
        }
    };

    const handleSave = async (formData: any) => {
        if (editingProduct) {
            await updateProduct(editingProduct.id, formData);
        } else {
            await addProduct(formData);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 sm:p-4 bg-indigo-600 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-indigo-100">
                        <Package size={20} className="sm:size-28" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Central Inventory</h2>
                        <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">{products.length} Products Tracked</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-wrap sm:flex-row items-center gap-3">
                    <div className="flex bg-white p-1 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto">
                        <div className="relative">
                            <select
                                className="bg-transparent pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs font-black text-gray-500 uppercase tracking-widest focus:outline-none appearance-none cursor-pointer border-r border-gray-50 hover:text-indigo-600 transition-colors"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <Filter size={12} />
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                className="bg-transparent pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs font-black text-gray-500 uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:text-indigo-600 transition-colors"
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                            >
                                <option value="All">Stock Levels</option>
                                <option value="Low Stock">Low Warnings</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <AlertCircle size={12} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Plus size={20} className="mr-2" />
                        New Item
                    </button>
                </div>
            </div>

            {/* Quick Search */}
            <div className="relative group">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Quick search by product name, brand or barcode number..."
                    className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-5 bg-white border border-gray-100 rounded-[20px] sm:rounded-[32px] focus:outline-none focus:ring-4 focus:ring-indigo-50/50 shadow-sm transition-all text-sm font-bold text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[20px] sm:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-fade-in mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-50">
                            <tr className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-4 sm:px-8 py-3 sm:py-6 text-left">Product</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-6 text-left hidden sm:table-cell">Category</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-6 text-left hidden md:table-cell">Pricing</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-6 text-left">Stock</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((p) => {
                                const cat = categories.find(c => c.id === p.categoryId);
                                const threshold = cat?.lowStockThreshold ?? 10;
                                const isOut = p.quantity === 0;
                                const isLow = !isOut && p.quantity <= threshold;

                                return (
                                    <tr
                                        key={p.id}
                                        className={clsx(
                                            "hover:bg-indigo-50/20 transition-all group",
                                            isOut ? "bg-red-50/20" : isLow ? "bg-amber-50/20" : ""
                                        )}
                                    >
                                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                <div 
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-inner flex-shrink-0"
                                                    style={{ backgroundColor: cat?.color || '#cbd5e1' }}
                                                >
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-2">{p.name}</span>
                                                    <span className="text-[9px] sm:text-[10px] font-black text-gray-300 mt-1 uppercase tracking-widest flex items-center gap-1">
                                                        <Barcode size={8} className="sm:size-10" /> {p.barcode}
                                                    </span>
                                                    <span 
                                                        className="inline-flex items-center px-2 py-1 rounded-lg text-[8px] sm:px-3 sm:py-1.5 sm:rounded-xl sm:text-[9px] font-black uppercase tracking-widest mt-2 sm:hidden"
                                                        style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}
                                                    >
                                                        {cat?.name || 'GENERIC'}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                                                        <span className="font-black text-gray-900 text-xs">₹{p.price.toLocaleString('en-IN')}</span>
                                                        <span className="text-[8px] text-gray-400">COST: ₹{p.costPrice.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-8 py-4 sm:py-6 hidden sm:table-cell">
                                            <span 
                                                className="inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                                style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}
                                            >
                                                {cat?.name || 'GENERIC'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-sm hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 leading-none">₹{p.price.toLocaleString('en-IN')}</span>
                                                <span className="text-[10px] text-gray-400 font-bold mt-1.5">COST: ₹{p.costPrice.toLocaleString('en-IN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                                            <div className="flex flex-col gap-1 sm:gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={clsx(
                                                        "w-2 h-2 rounded-full",
                                                        isOut ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                                                        isLow ? "bg-amber-500" : "bg-emerald-500"
                                                    )} />
                                                    <span className={clsx(
                                                        "text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                                                        isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"
                                                    )}>
                                                        {isOut ? 'Zero Stock' : isLow ? 'Low Priority' : 'In Stock'}
                                                    </span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-gray-900 ml-4">{p.quantity} {p.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-2 sm:p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-indigo-100"
                                                >
                                                    <Edit2 size={14} className="sm:size-16" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-2 sm:p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 size={14} className="sm:size-16" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-6">
                            <Archive size={40} />
                        </div>
                        <h4 className="text-gray-400 font-black uppercase tracking-widest text-sm">No Matching Items</h4>
                        <p className="text-xs text-gray-300 font-medium mt-2">Try clearing your filters or adding a new product registration.</p>
                    </div>
                )}
            </div>
            
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
                onSave={handleSave}
                product={editingProduct}
                categories={categories}
            />
        </div>
    );
};

export default Inventory;
