import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Moon, Sun, Lock, Bell, Shield, User, Smartphone, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';

const Settings = () => {
    const { currentUser, language, setLanguage } = useStore();
    const { t } = useTranslation();
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <div className="space-y-8 sm:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-none uppercase">{t('settings')}</h1>
                    <p className="text-gray-400 text-xs font-bold mt-2 sm:mt-3 uppercase tracking-widest flex items-center gap-2">
                        <SettingsIcon size={12} className="sm:size-14 text-indigo-500" />
                        Configure your store environment
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Language Card */}
                <div className="xl:col-span-1 space-y-8">
                     <div className="bg-white border border-gray-100 rounded-[24px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Globe size={12} className="sm:size-14 text-indigo-500" />
                             Language Settings
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { id: 'english', label: 'English', sub: 'Standard UI' },
                                { id: 'hindi', label: 'Hindi (हिंदी)', sub: 'शुद्ध हिंदी अनुवाद' },
                                { id: 'hinglish', label: 'Hinglish', sub: 'Hindi + English Mix' }
                            ].map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => setLanguage(lang.id as any)}
                                    className={clsx(
                                        "w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all group",
                                        language === lang.id 
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" 
                                            : "bg-white border-gray-100 text-gray-900 hover:border-indigo-100"
                                    )}
                                >
                                    <div className="text-left">
                                        <p className="text-xs sm:text-sm font-black uppercase tracking-tight">{lang.label}</p>
                                        <p className={clsx("text-[8px] sm:text-[9px] font-bold uppercase tracking-widest", language === lang.id ? "text-indigo-200" : "text-gray-400")}>
                                            {lang.sub}
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        language === lang.id ? "bg-white border-white" : "border-gray-200 group-hover:border-indigo-200"
                                    )}>
                                        {language === lang.id && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Appearance Card */}
                    <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Sun size={12} className="sm:size-14 text-amber-500" />
                             Appearance
                        </h3>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-[24px] sm:rounded-[32px] border border-gray-100">
                             <button 
                                onClick={() => setIsDarkMode(false)}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all",
                                    !isDarkMode ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600"
                                )}
                             >
                                <Sun size={14} className="sm:size-18" /> Light
                             </button>
                             <button 
                                onClick={() => setIsDarkMode(true)}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all",
                                    isDarkMode ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600"
                                )}
                             >
                                <Moon size={14} className="sm:size-18" /> Dark
                             </button>
                        </div>
                        <p className="text-center text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase mt-4 sm:mt-6 tracking-widest">Dark mode Coming Soon</p>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 shadow-sm relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 sm:p-8">
                            <Shield className="text-indigo-50 group-hover:text-indigo-100 transition-colors" size={100} />
                         </div>
                         
                         <div className="relative">
                            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-[24px] sm:rounded-[32px] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-2xl shadow-indigo-100">
                                    {currentUser?.name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">{currentUser?.name}</h3>
                                    <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">{currentUser?.role}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-600">
                                            <User size={14} className="sm:size-18 text-gray-400" />
                                            @{currentUser?.username}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-600">
                                            <Globe size={14} className="sm:size-18 text-gray-400" />
                                            Admin Account
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 border border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Security Hub</h4>
                                        <p className="text-xs text-gray-400 font-medium italic">Passwords are securely encrypted.</p>
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-900 text-white rounded-lg sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-black transition-all mt-4 sm:mt-6 shadow-xl shadow-gray-200">
                                        <Lock size={14} className="sm:size-16" /> Change Password
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                         <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm group hover:border-indigo-100 transition-all">
                            <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-lg sm:rounded-2xl w-fit mb-4 sm:mb-6">
                                <Smartphone size={18} className="sm:size-22" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Two-Factor Auth</h4>
                            <p className="text-xs text-gray-400 font-medium mb-6">Add an extra layer of security to your account.</p>
                            <span className="text-[8px] sm:text-[9px] font-black text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">Coming Soon</span>
                         </div>

                         <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm group hover:border-indigo-100 transition-all">
                            <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-lg sm:rounded-2xl w-fit mb-4 sm:mb-6">
                                <Bell size={18} className="sm:size-22" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Notification Feed</h4>
                            <p className="text-xs text-gray-400 font-medium mb-6">Manage alerts for stock levels and goal targets.</p>
                            <span className="text-[8px] sm:text-[9px] font-black text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">Coming Soon</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
