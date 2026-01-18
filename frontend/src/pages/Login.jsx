import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const { login, setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [mfaCode, setMfaCode] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/verify-mfa', { token: mfaCode, userId: tempUserId });
            if (res.data.mfa_verified) {
                // Fetch full session or re-login flow. Check session to be sure.
                const sessionRes = await api.get('/auth/session');
                setUser(sessionRes.data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid MFA Code');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Medivault Login</h2>
                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

                {!mfaRequired ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
                    </form>
                ) : (
                    <form onSubmit={handleMfaSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">MFA Code (Google Authenticator)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Verify Code</button>
                    </form>
                )}
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
