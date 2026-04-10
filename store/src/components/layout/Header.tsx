import { Bell, Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

const Header = ({ title, onMenuClick }: { title: string; onMenuClick: () => void }) => {
    const { getLowStockAlerts } = useStore();
    const lowStockCount = getLowStockAlerts().length;

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-500 lg:hidden"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="ml-4 lg:ml-0 flex items-center">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">{title}</h2>
                        {lowStockCount > 0 && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {lowStockCount} Low Stock
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Today</p>
                        <p className="text-sm font-medium text-gray-700">{format(new Date(), 'dd MMMM yyyy')}</p>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                    <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
                        <Bell size={20} />
                        {lowStockCount > 0 && (
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
