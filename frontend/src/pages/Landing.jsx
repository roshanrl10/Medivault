import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle, Database } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-900">Medivault</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
                            <a href="#security" className="hover:text-brand-600 transition-colors">Security</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Log In</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-6 border border-brand-100">
                            Top-Tier Medical Security
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                            Your Health Data, <span className="text-brand-600">Encrypted.</span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Medivault is the secure digital safe for your most sensitive medical records.
                            Protected by AES-256 encryption and accessible only by you and your trusted doctors.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link to="/register">
                                <Button size="lg" className="shadow-xl shadow-brand-500/20">Create Secure Vault</Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg">Access Account</Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Security Badges */}
            <section className="py-16 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">AES-256 Encryption</h3>
                            <p className="text-slate-500">Military-grade encryption for every document before it even touches our database.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Two-Factor Auth</h3>
                            <p className="text-slate-500">Verified access using Time-based One-Time Passwords (TOTP) for maximum security.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">GDPR Compliant</h3>
                            <p className="text-slate-500">Full control over your data. Grant and revoke doctor access instantly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
