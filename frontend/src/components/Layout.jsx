import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Settings, LogOut, ShieldCheck, User, Activity, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    const navItems = user?.role === 'doctor' ? [
        { icon: Users, label: 'Authorized Patients', path: '/dashboard' },
        { icon: FileText, label: 'My Notes', path: '/notes' }, // Placeholder
        { icon: Settings, label: 'Settings', path: '/settings' },
    ] : [
        { icon: LayoutDashboard, label: 'My Records', path: '/dashboard' },
        { icon: Users, label: 'Shared with Doctors', path: '/shared' }, // Placeholder/Modal
        { icon: Activity, label: 'Activity Logs', path: '/logs' },
        { icon: Settings, label: 'Security Settings', path: '/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar - Fixed Left */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0">

                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-brand-600" size={28} />
                        <span className="text-xl font-bold tracking-tight text-slate-800">Medivault</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium text-sm
                ${isActive
                                    ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout - Bottom Fixed */}
                <div className="p-6 border-t border-slate-100 bg-white space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user?.email}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
                        </div>
                    </div>

                    <Button
                        variant="danger"
                        className="w-full justify-center shadow-lg shadow-red-500/20"
                        onClick={logout}
                    >
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper - Offset for Sidebar */}
            <main className="flex-1 ml-64 p-4 md:p-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
