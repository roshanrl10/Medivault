import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Stethoscope } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import zxcvbn from 'zxcvbn';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', role: 'patient' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    const handlePasswordChange = (e) => {
        const pass = e.target.value;
        setFormData({ ...formData, password: pass });
        const result = zxcvbn(pass);
        setScore(result.score);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (score < 3) {
            setError('Please choose a stronger password.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        switch (score) {
            case 0: return 'bg-slate-700';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            default: return 'bg-slate-700';
        }
    };

    const getStrengthLabel = () => {
        switch (score) {
            case 0: return 'Too Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-900/30 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-600/20 rounded-full blur-[150px]" />

            <div className="w-full max-w-md mx-auto flex items-center justify-center p-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card p-8 md:p-10 rounded-3xl w-full"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Join Medivault
                        </h2>
                        <p className="text-slate-400 mt-2">Secure your medical future today.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

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

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a strong password"
                                icon={Lock}
                                value={formData.password}
                                onChange={handlePasswordChange}
                                required
                            />
                            {formData.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: `${(score + 1) * 20}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 min-w-[60px] text-right">{getStrengthLabel()}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-brand-300 ml-1">Account Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                                    className={`
                                        p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300
                                        ${formData.role === 'patient'
                                            ? 'bg-brand-500/20 border-brand-500 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}
                                    `}
                                >
                                    <User size={24} />
                                    <span className="text-sm font-medium">Patient</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                    className={`
                                        p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300
                                        ${formData.role === 'doctor'
                                            ? 'bg-brand-500/20 border-brand-500 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}
                                    `}
                                >
                                    <Stethoscope size={24} />
                                    <span className="text-sm font-medium">Doctor</span>
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={loading}>
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
