import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Tags,
    LogOut,
    Store,
    X,
    Shield,
    Users,
    Settings as SettingsIcon,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { currentUser, logout, getLowStockAlerts } = useStore();
    const { t } = useTranslation();
    const lowStockCount = getLowStockAlerts().length;

    const navItems = [
        { to: '/', label: t('dashboard'), icon: LayoutDashboard, end: true },
        { to: '/inventory', label: t('inventory'), icon: Package },
        { to: '/sales', label: t('sales'), icon: ShoppingCart },
        { to: '/reports', label: t('reports'), icon: BarChart3 },
        { to: '/categories', label: t('categories'), icon: Tags },
        { to: '/customers', label: t('customers'), icon: Users },
        { to: '/settings', label: t('settings'), icon: SettingsIcon },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={clsx(
                "fixed top-0 left-0 h-screen w-64 bg-indigo-950 text-white flex flex-col z-50 transition-transform duration-300",
                "lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Store size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight">Amit Store</h1>
                            <p className="text-[9px] text-indigo-300 uppercase tracking-widest font-bold">Inventory Manager</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1 text-indigo-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1 mt-4">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onClose}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                isActive
                                    ? "bg-white/15 text-white shadow-lg shadow-black/20"
                                    : "text-indigo-300 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={18} />
                            <span className="flex-1">{item.label}</span>
                            {item.to === '/' && lowStockCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black min-w-[22px] text-center">
                                    {lowStockCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User footer */}
                {currentUser && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className="w-9 h-9 rounded-xl bg-indigo-700 flex items-center justify-center font-bold text-sm">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                                    <Shield size={10} />
                                    {currentUser.role}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/20 text-indigo-300 hover:text-red-300 rounded-xl text-xs font-bold transition-all"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
