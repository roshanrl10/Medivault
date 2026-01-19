import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Search, User, FileText, Lock, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const DoctorDashboard = () => {
    // For now, we fetch ALL documents that the doctor has access to (which currently is ALL in the backend for 'doctor' role, or we filter)
    // The requirement is "Search Bar to find a patient by ID or Name". 
    // Since backend returns a flat list of docs, I'll group them by User on the frontend for this view.

    const [docs, setDocs] = useState([]);
    const [patients, setPatients] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await api.get('/documents');
            // Group by User
            const grouped = {};
            res.data.forEach(doc => {
                // doc.user is populated with { _id, email } from backend
                const userId = doc.user._id || doc.user;
                const email = doc.user.email || 'Unknown';

                if (!grouped[userId]) {
                    grouped[userId] = { id: userId, email, docs: [] };
                }
                grouped[userId].docs.push(doc);
            });
            setPatients(grouped);
        } catch (err) {
            console.error(err);
        }
    };

    const patientList = Object.values(patients).filter(p =>
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 h-[calc(100vh-4rem)] flex gap-8 overflow-hidden">

            {/* LEFT COLUMN: Search & Patient List */}
            <div className="w-1/3 flex flex-col gap-6 border-r border-slate-100 pr-6">

                {/* Header */}
                <div className="mt-2">
                    <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Clinic Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-sm">Secure Patient Management Portal</p>
                </div>

                {/* Search Bar */}
                <div>
                    <Input
                        placeholder="Search for patients..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white"
                    />
                </div>

                {/* Patient List (Grid or List) */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Authorized Patients</h3>
                    <div className="space-y-3">
                        {patientList.map(patient => (
                            <button
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className={`
                                    w-full text-left p-4 rounded-2xl transition-all duration-200 border group
                                    ${selectedPatient?.id === patient.id
                                        ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-200'
                                        : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-sm'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm
                                        ${selectedPatient?.id === patient.id
                                            ? 'bg-white text-brand-600 border border-brand-100'
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                                    `}>
                                        {patient.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-semibold text-sm truncate ${selectedPatient?.id === patient.id ? 'text-brand-900' : 'text-slate-700'}`}>
                                            {patient.email}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate font-mono mt-1">ID: {patient.id.substring(0, 12)}...</p>
                                    </div>
                                    {selectedPatient?.id === patient.id && (
                                        <ChevronRight size={16} className="text-brand-500" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    {patientList.length === 0 && (
                        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            No patients found.
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Detail View */}
            <div className="w-2/3 flex flex-col h-full overflow-hidden pl-2">
                {selectedPatient ? (
                    <>
                        {/* Selected Patient Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20">
                                    {selectedPatient.email.charAt(0).toUpperCase()}
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
                            <Button variant="danger" size="sm" className="bg-white border hover:bg-red-50">
                                Revoke Access
                            </Button>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                Medical Timeline
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Read-Only</span>
                            </h4>

                            <div className="space-y-4">
                                {selectedPatient.docs.map((doc) => (
                                    <div key={doc._id} className="group relative pl-8 border-l-2 border-slate-100 last:border-0 pb-6">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-100 border-2 border-brand-500" />

                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all group-hover:bg-white">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-sm">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{doc.originalName}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(doc.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                                                    <Lock size={12} className="text-brand-500" />
                                                    <span className="text-xs font-semibold text-slate-600">AES-256</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">Clinical Notes</label>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><Lock size={10} /> End-to-End Encrypted</span>
                            </div>
                            <div className="relative group">
                                <textarea
                                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none text-slate-700 placeholder:text-slate-400 text-sm transition-all"
                                    placeholder="Type a secure, encrypted note for this patient..."
                                ></textarea>
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" className="text-xs py-1.5 px-3 h-8 shadow-lg">Save Note</Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 m-4">
                        <User size={64} className="mb-4 text-slate-300 opacity-50" />
                        <p className="text-lg font-medium text-slate-500">Select a patient to view details</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default DoctorDashboard;
