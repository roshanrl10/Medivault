import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { FileText, Upload, Shield, Clock, Download, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const PatientDashboard = () => {
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await api.get('/documents');
            setDocs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            setShowUploadModal(false);
            fetchDocs();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (docId, filename) => {
        try {
            const response = await api.get(`/documents/download/${docId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Integrity Check Failed: File may be tampered.');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Records</p>
                        <p className="text-2xl font-bold text-slate-900">{docs.length}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Security Status</p>
                        <p className="text-sm font-bold text-green-600">Encrypted (AES-256)</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 bg-gradient-to-br from-green-50 to-white border-green-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Last Login</p>
                        <p className="text-sm font-bold text-slate-900">Just now</p>
                    </div>
                </Card>
            </div>

            {/* Records List */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">My Medical Vault</h2>
                <Button onClick={() => setShowUploadModal(true)} icon={Plus}>
                    Upload New Record
                </Button>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4">Record Name</th>
                                <th className="p-4">Date Added</th>
                                <th className="p-4">Size</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {docs.map((doc) => (
                                <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center">
                                            <FileText size={16} />
                                        </div>
                                        {doc.originalName}
                                    </td>
                                    <td className="p-4 text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-500">Encrypted</td>
                                    <td className="p-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleDownload(doc._id, doc.originalName)}
                                            icon={Download}
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {docs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No records in your vault. Securely upload one now.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Secure File Upload</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Files are encrypted client-side (simulated) or server-side before storage.
                            Only authorized personnel can decrypt them.
                        </p>

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-white hover:border-brand-400 transition-colors cursor-pointer relative group">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-brand-500">
                                <Upload size={32} />
                                <span className="text-sm font-medium">{file ? file.name : 'Click to select file'}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => { setShowUploadModal(false); setFile(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpload} isLoading={uploading} disabled={!file}>
                                Encrypt & Upload
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
