import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Eye, EyeOff, Store, LogIn, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, currentUser, isLoading, error } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    // If already logged in, redirect
    React.useEffect(() => {
        if (currentUser) navigate('/', { replace: true });
    }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        const success = await login(email, password);
        if (success) {
            navigate('/', { replace: true });
        } else {
            setLocalError(error || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl mb-4 sm:mb-5 shadow-2xl border border-white/10">
                        <Store className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Amit Store</h1>
                    <p className="text-indigo-300 text-xs sm:text-sm mt-2 font-medium">Inventory Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@amitstore.com"
                                className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium pr-10 sm:pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} className="sm:size-18" /> : <Eye size={16} className="sm:size-18" />}
                                </button>
                            </div>
                        </div>

                        {(localError || error) && (
                            <div className="px-3 sm:px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl text-red-300 text-xs sm:text-sm font-medium">
                                {localError || error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 sm:py-3.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="sm:size-18 animate-spin" />
                            ) : (
                                <LogIn size={16} className="sm:size-18" />
                            )}
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Credentials Hint */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/5">
                        <p className="text-[9px] sm:text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 sm:mb-3">Default Credentials</p>
                        <div className="space-y-1 sm:space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Admin</span>
                                <code className="text-[10px] sm:text-xs text-indigo-300 font-mono bg-white/5 px-2 py-0.5 rounded">admin@amitstore.com / amit@123</code>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-white/20 text-[10px] sm:text-xs mt-4 sm:mt-6 font-medium">
                    © {new Date().getFullYear()} Amit Store — Powered by Supabase
                </p>
            </div>
        </div>
    );
};

export default Login;
