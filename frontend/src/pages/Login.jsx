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
        <div className="flex min-h-screen bg-[#0f172a] text-white overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-900/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-600/20 rounded-full blur-[150px]" />

            <div className="w-full max-w-6xl mx-auto flex items-center justify-center p-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

                    {/* Left Side: Branding */}
                    <div className="hidden lg:flex flex-col justify-center gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20"
                        >
                            <ShieldCheck size={32} className="text-white" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                                Secure Medical <br /> Records
                            </h1>
                            <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                                Experience state-of-the-art security for your sensitive medical data with Medivault's premium encrypted storage.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex gap-4 mt-4"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-700 flex items-center justify-center text-xs">U{i}</div>
                                ))}
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="font-bold">10k+</span>
                                <span className="text-xs text-slate-400">Trusted Doctors</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-card p-8 md:p-12 rounded-3xl w-full max-w-md mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-slate-400 mb-8">Enter your credentials to access your vault.</p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </motion.div>
                        )}

                        {!mfaRequired ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="doctor@medivault.com"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <Button type="submit" className="w-full" isLoading={loading}>
                                    Sign In
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleMfaSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-400">
                                        <KeyRound size={28} />
                                    </div>
                                    <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                                    <p className="text-sm text-slate-400">Please enter the code from your authenticator app.</p>
                                </div>
                                <Input
                                    label="Authentication Code"
                                    type="text"
                                    placeholder="123 456"
                                    className="text-center text-2xl tracking-widest font-mono"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                                    Verify Identity
                                </Button>
                            </form>
                        )}

                        <div className="mt-8 text-center text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                                Create Vault
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
