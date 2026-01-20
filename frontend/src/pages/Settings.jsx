import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Shield, User, Lock, Smartphone, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Input from '../components/ui/Input';

const Settings = () => {
    const { user } = useAuth();
    const [showMfaModal, setShowMfaModal] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetupMFA = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/auth/setup-mfa');
            setQrCode(res.data.qr_code);
            setSecret(res.data.secret);
            setShowMfaModal(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to initiate MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMFA = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-mfa', { token: verificationCode });
            setSuccess('MFA Enabled Successfully!');
            setTimeout(() => {
                setShowMfaModal(false);
                window.location.reload(); // Reload to update user context
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 relative">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-2">Manage your profile and security preferences.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-8"
            >
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                            <p className="text-sm text-slate-500">Your personal account details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <input
                                type="text"
                                value={user?.role?.toUpperCase() || ''}
                                disabled
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Security</h2>
                            <p className="text-sm text-slate-500">Protect your account and data</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <Lock size={20} className="text-slate-400" />
                                <div>
                                    <p className="font-semibold text-slate-800">Change Password</p>
                                    <p className="text-xs text-slate-400">Last updated recently</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm">Update</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <Smartphone size={20} className="text-slate-400" />
                                <div>
                                    <p className="font-semibold text-slate-800">Two-Factor Authentication</p>
                                    <p className="text-xs text-slate-400">
                                        {user?.mfa_enabled ? 'Enabled and secure' : 'Add an extra layer of security'}
                                    </p>
                                </div>
                            </div>
                            {user?.mfa_enabled ? (
                                <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <CheckCircle size={14} /> Enabled
                                </span>
                            ) : (
                                <Button onClick={handleSetupMFA} disabled={loading}>
                                    {loading ? 'Processing...' : 'Enable'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* MFA Setup Modal */}
            <AnimatePresence>
                {showMfaModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowMfaModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                    <Smartphone size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Setup 2FA</h3>
                                <p className="text-slate-500 text-sm mt-2">Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                                    <CheckCircle size={16} /> {success}
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-6">
                                {qrCode && (
                                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                                    </div>
                                )}

                                <div className="w-full">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Enter Verification Code</label>
                                    <Input
                                        placeholder="000 000"
                                        className="text-center text-xl tracking-widest font-mono"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleVerifyMFA}
                                    disabled={loading || verificationCode.length < 6}
                                >
                                    {loading ? 'Verifying...' : 'Verify & Enable'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
