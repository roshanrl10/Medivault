import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, Lock, ShieldCheck, LogOut, Settings, Users, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const DoctorDashboard = () => {
    const [patients, setPatients] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await api.get('/documents');
            const grouped = {};
            res.data.forEach(doc => {
                const userId = doc.user._id || doc.user;
                const email = doc.user.email || 'Unknown';
                if (!grouped[userId]) {
                    grouped[userId] = { id: userId, email, docs: [] };
                }
                grouped[userId].docs.push(doc);
            });
            setPatients(grouped);
        } catch (err) { console.error(err); }
    };

    const patientList = Object.values(patients).filter(p =>
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-2rem)] p-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full flex overflow-hidden">

                {/* LEFT COLUMN: Patient Selection */}
                <div className="w-[45%] flex flex-col border-r border-slate-100 p-8 bg-white z-10">
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Clinic Dashboard</h1>
                        <p className="text-slate-500 mt-2 text-sm">Secure Patient Management Portal</p>
                    </header>

                    <div className="mb-6">
                        <Input
                            placeholder="Search for patients..."
                            icon={Search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border-slate-200 shadow-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Authorized Patients</h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {patientList.map(p => (
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    onClick={() => setSelectedPatient(p)}
                                    key={p.id}
                                    className={`
                                        p-4 rounded-xl border text-left transition-all flex flex-col gap-3 group relative
                                        ${selectedPatient?.id === p.id
                                            ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-200'
                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                            ${selectedPatient?.id === p.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {p.email[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-semibold text-sm truncate ${selectedPatient?.id === p.id ? 'text-blue-900' : 'text-slate-900'}`}>
                                                {p.email}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {p.id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    {selectedPatient?.id === p.id && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
                                            <ChevronRight size={16} />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                        {patientList.length === 0 && (
                            <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <Users size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No patients found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: details & timeline */}
                <div className="flex-1 bg-white p-8 flex flex-col h-full overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50" />

                    <AnimatePresence mode="wait">
                        {selectedPatient ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col h-full z-10"
                            >
                                {/* Detail Header */}
                                <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                                            {selectedPatient.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.email}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono border border-slate-200">
                                                    {selectedPatient.id}
                                                </span>
                                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Authorized
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm" className="bg-white border text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                                        Revoke Access
                                    </Button>
                                </div>

                                {/* Timeline */}
                                <div className="flex-1 overflow-y-auto pr-2 mb-4">
                                    <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                        Medical Timeline
                                        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Read-Only</span>
                                    </h4>

                                    <div className="space-y-3">
                                        {selectedPatient.docs.map(doc => (
                                            <div key={doc._id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{doc.originalName}</p>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">Uploaded: {new Date(doc.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    <Lock size={12} className="text-blue-500" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Encrypted</span>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedPatient.docs.length === 0 && (
                                            <div className="text-center py-8 text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                No records found for this patient.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes Input */}
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-800">Clinical Notes (Encrypted)</label>
                                        <ShieldCheck size={14} className="text-green-600" />
                                    </div>
                                    <div className="relative group">
                                        <textarea
                                            className="w-full h-24 p-4 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-slate-700 placeholder:text-slate-400 text-sm shadow-sm transition-all"
                                            placeholder="Type a secure note here..."
                                        ></textarea>
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" className="text-xs py-1.5 px-3 h-8 shadow-md">Save</Button>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                    <User size={48} className="text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-700">Select a Patient</h3>
                                    <p className="text-sm max-w-[250px] mx-auto mt-1">
                                        Click on a patient card from the list to view their secure medical history and notes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>

    );
};

export default DoctorDashboard;