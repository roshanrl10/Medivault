import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
    const { login, setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [mfaCode, setMfaCode] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(formData.email, formData.password);
            if (res.msg === 'MFA Required') {
                setMfaRequired(true);
                setTempUserId(res.user.id);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-mfa', { token: mfaCode, userId: tempUserId });
            if (res.data.mfa_verified) {
                const sessionRes = await api.get('/auth/session');
                setUser(sessionRes.data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid MFA Code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="bg-white p-8 md:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/30">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Sign in to Medivault</h2>
                        <p className="text-slate-500 mt-2 text-center">Secure access to your medical records</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <ShieldCheck size={16} />
                            {error}
                        </div>
                    )}

                    {!mfaRequired ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                icon={Mail}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <div className="flex justify-end">
                                    <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700">Forgot password?</a>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4" size="lg" isLoading={loading}>
                                Sign In
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleMfaSubmit} className="space-y-6">
                            <div className="text-center bg-brand-50 rounded-xl p-6 border border-brand-100 mb-6">
                                <KeyRound size={32} className="mx-auto text-brand-600 mb-2" />
                                <h3 className="font-semibold text-brand-900">Two-Factor Authentication</h3>
                                <p className="text-sm text-brand-700 mt-1">Enter the 6-digit code from your authenticator app.</p>
                            </div>
                            <Input
                                label="Verification Code"
                                type="text"
                                placeholder="000 000"
                                className="text-center text-2xl tracking-widest font-mono py-4"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                required
                                autoFocus
                            />
                            <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                                Verify Identity
                            </Button>
                        </form>
                    )}
                </div>
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                            Create Vault
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
