import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Stethoscope, CheckCircle, XCircle } from 'lucide-react';
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
            case 0: return 'bg-slate-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            default: return 'bg-slate-200';
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
        <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="bg-white p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                        <p className="text-slate-500 mt-2">Join Medivault securely today</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <XCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-slate-500">Security Strength</span>
                                        <span className={`text-xs font-bold ${score <= 1 ? 'text-red-500' :
                                                score === 2 ? 'text-orange-500' :
                                                    score === 3 ? 'text-yellow-600' : 'text-green-600'
                                            }`}>{getStrengthLabel()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${getStrengthColor()}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(score + 1) * 20}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                                    className={`
                                        p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200
                                        ${formData.role === 'patient'
                                            ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}
                                    `}
                                >
                                    <User size={24} />
                                    <span className="text-sm font-medium">Patient</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                    className={`
                                        p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200
                                        ${formData.role === 'doctor'
                                            ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}
                                    `}
                                >
                                    <Stethoscope size={24} />
                                    <span className="text-sm font-medium">Doctor</span>
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-6" size="lg" isLoading={loading}>
                            Create Account
                        </Button>
                    </form>
                </div>
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
