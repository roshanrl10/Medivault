import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [mfaData, setMfaData] = useState(null);

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
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg('File uploaded and encrypted!');
            fetchDocs();
            setFile(null);
        } catch (err) {
            setMsg('Upload failed');
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
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 mb-8 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-800">Medivault <span className="text-sm text-gray-500">| {user?.role.toUpperCase()}</span></h1>
                <button onClick={() => { logout(); navigate('/login'); }} className="text-red-500 hover:text-red-700">Logout</button>
            </nav>

            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    {user?.role === 'patient' && (
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-lg font-bold mb-4">Upload Secure Document</h2>
                            <form onSubmit={handleUpload}>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <button type="submit" disabled={!file} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Encrypt & Upload
                                </button>
                            </form>
                            {msg && <p className="mt-2 text-green-600">{msg}</p>}
                        </div>
                    )}

                    {/* MFA Setup Section */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-bold mb-4">Security Settings</h2>
                        {!user?.mfa_enabled ? (
                            <div>
                                <p className="mb-4 text-red-600">MFA is NOT enabled. Enable it for security.</p>
                                {!mfaData ? (
                                    <button onClick={setupMFA} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Setup MFA</button>
                                ) : (
                                    <div className="text-center">
                                        <p className="mb-2">Scan with Google Authenticator:</p>
                                        <img src={mfaData.qr_code} alt="MFA QR" className="mx-auto mb-4" />
                                        <p className="font-mono bg-gray-100 p-2 text-sm">{mfaData.secret}</p>
                                        <p className="text-sm text-gray-500 mt-2">Log out and log back in to verify.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-green-600 font-bold">✓ MFA is Enabled</p>
                        )}
                    </div>
                </div>

                {/* Documents List */}
                <div className="mt-8 bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Encrypted Medical Records</h2>
                        {user?.role === 'patient' && (
                            <button onClick={() => alert('Redirecting to Stripe Checkout (Simulated)...')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                Book Appointment ($50)
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">Filename</th>
                                    <th className="p-3">Owner</th>
                                    <th className="p-3">Uploaded At</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map(doc => (
                                    <tr key={doc._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{doc.originalName}</td>
                                        <td className="p-3">{doc.user?.email || 'Me'}</td>
                                        <td className="p-3">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDownload(doc._id, doc.originalName)}
                                                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 text-sm"
                                            >
                                                Decrypt & View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {docs.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-3 text-center text-gray-500">No documents found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
