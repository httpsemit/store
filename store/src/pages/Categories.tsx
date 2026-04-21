import React, { useState } from 'react';
import { Tags, Plus, Edit2, Trash2, AlertCircle, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import type { Category } from '../types';

const PRESET_COLORS = [
    '#4f46e5', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6',
    '#ef4444', '#f97316', '#0ea5e9', '#6366f1', '#d946ef', '#14b8a6'
];

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
}

const CategoryModal: React.FC<ModalProps> = ({ isOpen, onClose, category }) => {
    const { addCategory, updateCategory } = useStore();
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const [color, setColor] = useState(category?.color || PRESET_COLORS[0]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (category) {
            await updateCategory(category.id, {
                name,
                description,
                color
            });
        } else {
            await addCategory({
                name,
                description,
                color
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                        {category ? 'Edit Category' : 'New Category'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 rounded-lg sm:rounded-xl transition-colors">
                        <X size={16} className="sm:size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 sm:px-4 py-3 bg-gray-50 dark:bg-[#121212] border border-transparent rounded-lg sm:rounded-xl focus:bg-white dark:bg-[#0a0a0a] focus:border-indigo-500 transition-all font-bold text-gray-900 dark:text-white"
                            placeholder="e.g., Beverages"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 sm:px-4 py-3 bg-gray-50 dark:bg-[#121212] border border-transparent rounded-lg sm:rounded-xl focus:bg-white dark:bg-[#0a0a0a] focus:border-indigo-500 transition-all font-medium text-gray-700 dark:text-gray-200 h-20 resize-none"
                            placeholder="Optional notes..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Label Color</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.slice(0, 12).map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={clsx(
                                        "w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110",
                                        color === c ? "border-gray-900 ring-2 ring-gray-100" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={16} className="sm:size-4" />
                        {category ? 'Save Changes' : 'Create Category'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Categories = () => {
    const { categories, products, deleteCategory, getLowStockAlerts } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    
    const lowStockAlerts = getLowStockAlerts();

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            deleteCategory(id);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-12">
            {/* Alerts Header */}
            {lowStockAlerts.length > 0 && (
                <div className="bg-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-amber-100 flex items-center gap-3 sm:gap-4 animate-fade-in">
                    <div className="p-2 sm:p-3 bg-white dark:bg-[#0a0a0a]/20 rounded-xl sm:rounded-2xl">
                        <AlertCircle size={18} className="sm:size-6" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">Attention Needed</h3>
                        <p className="text-amber-100 text-xs sm:text-sm">There are {lowStockAlerts.length} products currently below their threshold.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">Inventory Categories</h2>
                    <p className="text-gray-400 text-xs font-medium mt-2">Manage groups and visual identifiers</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-3.5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Plus size={16} className="sm:size-5 mr-2" />
                    New Category
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((cat) => {
                    const catProducts = products.filter(p => p.categoryId === cat.id);
                    const lowStockCount = catProducts.filter(p => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length;
                    const outOfStockCount = catProducts.filter(p => p.quantity === 0).length;

                    return (
                        <div key={cat.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/10 dark:border-white/5 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-indigo-100 transition-all">
                            <div className="h-1.5 w-full transition-all group-hover:h-2" style={{ backgroundColor: cat.color }}></div>
                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-[#121212] text-gray-400 group-hover:bg-indigo-50 dark:bg-indigo-950/30 group-hover:text-indigo-600 transition-colors">
                                            <Tags size={16} className="sm:size-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">{cat.name}</h4>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(cat)}
                                            className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/30 rounded-lg transition-all"
                                        >
                                            <Edit2 size={14} className="sm:size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} className="sm:size-4" />
                                        </button>
                                    </div>
                                </div>

                                {cat.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic line-clamp-2">"{cat.description}"</p>
                                )}

                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                    <div className="bg-gray-50 dark:bg-[#121212] p-2 sm:p-3 rounded-lg sm:rounded-2xl text-center">
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{catProducts.length}</p>
                                        <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Total Items</p>
                                    </div>
                                    <div className={clsx("p-2 sm:p-3 rounded-lg sm:rounded-2xl text-center transition-colors", lowStockCount > 0 ? "bg-amber-50 text-amber-900 shadow-inner" : "bg-gray-50 dark:bg-[#121212]")}>
                                        <p className={clsx("text-xs font-black", lowStockCount > 0 ? "text-amber-600" : "text-gray-900 dark:text-white")}>{lowStockCount}</p>
                                        <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Low Stock</p>
                                    </div>
                                    <div className={clsx("p-2 sm:p-3 rounded-lg sm:rounded-2xl text-center transition-colors", outOfStockCount > 0 ? "bg-red-50 text-red-900 shadow-inner" : "bg-gray-50 dark:bg-[#121212]")}>
                                        <p className={clsx("text-xs font-black", outOfStockCount > 0 ? "text-red-600" : "text-gray-900 dark:text-white")}>{outOfStockCount}</p>
                                        <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Out of Stock</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <CategoryModal
                key={editingCategory?.id || 'new'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
            />
        </div>
    );
};

export default Categories;
