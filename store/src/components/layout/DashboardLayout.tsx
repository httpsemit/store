import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const isSalesPage = location.pathname === '/sales';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64 flex flex-col min-h-screen">
                <Header title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>

            {/* Floating Action Button for Quick Billing on Mobile */}
            {!isSalesPage && (
                <Link
                    to="/sales"
                    className="fixed bottom-6 right-6 z-40 lg:hidden flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full shadow-[0_8px_30px_rgb(79,70,229,0.4)] border border-white/20 hover:scale-110 active:scale-95 transition-all duration-300 group"
                    title="Quick Billing"
                >
                    <span className="absolute inset-0 rounded-full bg-indigo-600/30 animate-ping group-hover:bg-indigo-600/40" />
                    <ShoppingCart size={24} />
                </Link>
            )}
        </div>
    );
};

export default DashboardLayout;
