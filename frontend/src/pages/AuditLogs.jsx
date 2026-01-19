import { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, CheckCircle, FileText, Lock } from 'lucide-react';
import Card from '../components/ui/Card';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/auth/logs'); // Corrected endpoint to match authRoutes
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action) => {
        if (action.includes('FAILURE') || action.includes('TAMPERED') || action.includes('UNAUTHORIZED')) return <ShieldAlert className="text-red-500" size={18} />;
        if (action.includes('SUCCESS') || action.includes('VERIFIED')) return <CheckCircle className="text-green-500" size={18} />;
        if (action.includes('FILE')) return <FileText className="text-brand-500" size={18} />;
        return <Activity className="text-slate-400" size={18} />;
    };

    const getStatusColor = (action) => {
        if (action.includes('FAILURE') || action.includes('TAMPERED') || action.includes('UNAUTHORIZED')) return 'bg-red-50 text-red-700 border-red-200';
        if (action.includes('SUCCESS') || action.includes('VERIFIED')) return 'bg-green-50 text-green-700 border-green-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Security Audit Log</h1>
                <p className="text-slate-500">Forensic trail of all your account activities.</p>
            </div>

            <Card className="overflow-hidden p-0 border-0 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4 w-10"></th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">IP Address</th>
                                <th className="p-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">Loading audit trail...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">No activity recorded yet.</td>
                                </tr>
                            ) : (
                                logs.map((log, idx) => (
                                    <motion.tr
                                        key={log._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="p-4 pl-6">{getIcon(log.action)}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 font-mono text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">
                                            {log.ipAddress?.replace('::ffff:', '') || 'N/A'}
                                        </td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate" title={JSON.stringify(log.details)}>
                                            {log.details ? JSON.stringify(log.details).substring(0, 50) + (JSON.stringify(log.details).length > 50 ? '...' : '') : '-'}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogs;
