import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Settings, LogOut, ShieldCheck, User, Activity, Users, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = user?.role === 'doctor' ? [
        { icon: Users, label: 'Clinic Dashboard', path: '/dashboard' },
        { icon: Search, label: 'Search', path: '/search' }, // Placeholder route
        { icon: User, label: 'My Profile', path: '/profile' }, // Placeholder route
        { icon: Settings, label: 'Settings', path: '/settings' },
    ] : [
        { icon: LayoutDashboard, label: 'My Records', path: '/dashboard' },
        { icon: Users, label: 'Shared with Doctors', path: '/shared' },
        { icon: Activity, label: 'Activity Logs', path: '/logs' },
        { icon: Settings, label: 'Security Settings', path: '/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            {/* Sidebar - Fixed Left */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 flex flex-col p-6 transition-transform duration-300 ease-in-out transform translate-x-0">

                {/* Logo Area */}
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">Medivault</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout - Bottom Fixed */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                            <User size={16} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-slate-600 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 shadow-none hover:shadow-md transition-all"
                        onClick={logout}
                    >
                        <LogOut size={18} /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper - Offset for Sidebar */}
            <main className="flex-1 ml-64 p-4 md:p-8 min-h-screen overflow-hidden">
                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
