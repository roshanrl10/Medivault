import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Share2, Shield, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

const SharedDocuments = () => {
    const [doctors, setDoctors] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, doctorsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/auth/doctors')
                ]);
                setDocuments(docsRes.data);
                setDoctors(doctorsRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleShare = async (doc, isShared) => {
        if (!selectedDoctor) return;

        // Optimistic UI Update
        const updatedDocs = documents.map(d => {
            if (d._id === doc._id) {
                const currentShared = d.sharedWith || [];
                const newSharedWith = isShared
                    ? currentShared.filter(id => id !== selectedDoctor._id)
                    : [...currentShared, selectedDoctor._id];
                return { ...d, sharedWith: newSharedWith };
            }
            return d;
        });
        setDocuments(updatedDocs);

        try {
            if (isShared) {
                await api.post(`/documents/${doc._id}/revoke`, { doctorId: selectedDoctor._id });
            } else {
                await api.post(`/documents/${doc._id}/share`, { doctorId: selectedDoctor._id });
            }
        } catch (err) {
            console.error("Share toggle failed", err);
            // Revert on failure (could add toast notification here)
            // For now, just re-fetch to ensure sync
            const res = await api.get('/documents');
            setDocuments(res.data);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] p-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full flex overflow-hidden">

                {/* LEFT COLUMN: Doctor List */}
                <div className="w-[35%] flex flex-col border-r border-slate-100 bg-slate-50/50">
                    <div className="p-8 border-b border-slate-100 bg-white">
                        <header>
                            <h1 className="text-2xl font-bold text-slate-900 font-serif tracking-tight">Shared Access</h1>
                            <p className="text-slate-500 mt-2 text-sm">Manage who can see your medical records.</p>
                        </header>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wide mb-4 px-2">Available Doctors</h3>
                        {doctors.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No doctors found.</div>
                        ) : (
                            <div className="space-y-3">
                                {doctors.map(doc => (
                                    <button
                                        key={doc._id}
                                        onClick={() => setSelectedDoctor(doc)}
                                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 relative group
                                            ${selectedDoctor?._id === doc._id
                                                ? 'bg-white shadow-md ring-1 ring-blue-500 z-10'
                                                : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'}
                                        `}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                                            ${selectedDoctor?._id === doc._id ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}
                                        `}>
                                            {doc.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${selectedDoctor?._id === doc._id ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {doc.email}
                                            </p>
                                            <p className="text-xs text-slate-400">Medivault Specialist</p>
                                        </div>
                                        {selectedDoctor?._id === doc._id && (
                                            <ChevronRight size={18} className="text-blue-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Document Sharing */}
                <div className="flex-1 bg-white p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-bl-full -z-0 opacity-50" />

                    <AnimatePresence mode="wait">
                        {selectedDoctor ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col h-full z-10"
                            >
                                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Sharing with {selectedDoctor.email}</h2>
                                            <p className="text-sm text-slate-500">Toggle the switch to grant or revoke access to specific files.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2">
                                    <div className="grid gap-4">
                                        {documents.map(doc => {
                                            const isShared = doc.sharedWith && doc.sharedWith.includes(selectedDoctor._id);
                                            return (
                                                <div
                                                    key={doc._id}
                                                    className={`
                                                        flex items-center justify-between p-5 rounded-xl border transition-all
                                                        ${isShared
                                                            ? 'bg-blue-50/30 border-blue-200 shadow-sm'
                                                            : 'bg-white border-slate-100 hover:border-slate-200'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-lg border ${isShared ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className={`font-semibold text-sm ${isShared ? 'text-blue-900' : 'text-slate-700'}`}>
                                                                {doc.originalName}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                                {isShared && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                        <CheckCircle2 size={10} /> SHARED
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={isShared || false}
                                                            onChange={() => toggleShare(doc, isShared)}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                        {documents.length === 0 && (
                                            <div className="text-center py-12 text-slate-400 italic">You have no documents uploaded.</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 z-10">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                    <User size={32} className="opacity-50" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-600">Select a Doctor</h3>
                                <p className="text-sm max-w-[250px] mx-auto mt-2">
                                    Choose a doctor from the list on the left to manage their access permissions.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default SharedDocuments;
