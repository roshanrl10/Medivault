import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Shield, Download, FileLock, Clock, HardDrive, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaData, setMfaData] = useState(null);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDocs();
        }
    }, [user]);

    const fetchDocs = async () => {
        try {
            const res = await api.get('/documents');
            setDocs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg('File uploaded and encrypted!');
            fetchDocs();
            setFile(null);
            setShowUpload(false);
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id, filename) => {
        try {
            const res = await api.get(`/documents/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert('Access Denied or Error');
        }
    };

    const setupMFA = async () => {
        const res = await api.get('/auth/setup-mfa');
        setMfaData(res.data);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Dashboard
                    </h1>
                    <p className="text-slate-400">Welcome back, {user?.role === 'doctor' ? 'Dr. ' : ''}{user?.email}</p>
                </div>
                {user?.role === 'patient' && (
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setShowUpload(!showUpload)}
                    >
                        Upload Document
                    </Button>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={FileLock}
                    label="Secured Documents"
                    value={docs.length}
                    color="bg-brand-500"
                />
                <StatCard
                    icon={Shield}
                    label="Security Status"
                    value={user?.mfa_enabled ? "Protected" : "Action Needed"}
                    color={user?.mfa_enabled ? "bg-green-500" : "bg-red-500"}
                />
                <StatCard
                    icon={HardDrive}
                    label="Vault Storage"
                    value="12%"
                    color="bg-purple-500"
                />
            </div>

            {/* Upload Area (Collapsible) */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="mb-6 border-brand-500/30 bg-brand-900/10">
                            <h3 className="text-lg font-semibold mb-4 text-brand-300">Upload New Record</h3>
                            <form onSubmit={handleUpload} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-500/20 file:text-brand-300 hover:file:bg-brand-500/30"
                                    />
                                </div>
                                <Button type="submit" disabled={!file} isLoading={loading} icon={Upload}>
                                    Encrypt & Upload
                                </Button>
                            </form>
                            {msg && <p className="mt-2 text-green-400 text-sm">{msg}</p>}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Documents List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FileText className="text-brand-400" />
                        Recent Files
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {docs.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No documents found in your vault.</p>
                            </div>
                        ) : (
                            docs.map((doc, idx) => (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card hover className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                                                <FileLock size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">{doc.originalName}</h3>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon={Download}
                                            onClick={() => handleDownload(doc._id, doc.originalName)}
                                        >
                                            Decrypt
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: Security */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Shield className="text-green-400" />
                        Security Center
                    </h2>

                    <Card className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Two-Factor Auth</span>
                            {user?.mfa_enabled ? (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">Enabled</span>
                            ) : (
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/20">Disabled</span>
                            )}
                        </div>

                        {!user?.mfa_enabled && (
                            <div className="pt-4 border-t border-white/5">
                                {!mfaData ? (
                                    <div className="text-center">
                                        <p className="text-sm text-slate-300 mb-4">Protect your account with an extra layer of security.</p>
                                        <Button variant="primary" className="w-full" onClick={setupMFA}>
                                            Setup MFA
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 animate-fade-in">
                                        <div className="bg-white p-2 rounded-xl inline-block">
                                            <img src={mfaData.qr_code} alt="MFA QR" className="w-32 h-32" />
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded-lg font-mono text-xs text-center border border-white/10 select-all">
                                            {mfaData.secret}
                                        </div>
                                        <p className="text-xs text-slate-500">Scan this QR code with your authenticator app.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {user?.mfa_enabled && (
                            <div className="text-xs text-slate-500 text-center pt-2">
                                Your account is secured with military-grade encryption and 2FA.
                            </div>
                        )}
                    </Card>

                    {user?.role === 'patient' && (
                        <Card className="bg-gradient-to-br from-brand-900/50 to-brand-800/20 border-brand-500/20">
                            <h3 className="font-semibold text-white mb-2">Need a Consultation?</h3>
                            <p className="text-sm text-slate-400 mb-4">Connect with verified specialists securely.</p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => alert('Redirecting to Stripe Checkout (Simulated)...')}
                            >
                                Book Appointment ($50)
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
