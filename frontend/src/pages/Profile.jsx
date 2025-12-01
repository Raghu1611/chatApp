import { useState, useEffect, useRef } from 'react';
import api from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Save, Loader2, User as UserIcon, Mail } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/me');
            setUser(data);
            setName(data.name);
        } catch (e) {
            console.error(e);
            if (e.response?.status === 401) navigate('/login');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const { data } = await api.put('/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUser(data.user);
            setMessage({ type: 'success', text: 'Avatar updated successfully' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to update avatar' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.put('/users/me', { name });
            setUser(data.user);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 p-6">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Chat
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-emerald-400 to-cyan-400 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-700">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                                            {user.name[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">{user.email}</p>

                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-2 opacity-60">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h3>
                            <ChangePasswordForm setMessage={setMessage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChangePasswordForm({ setMessage }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/password', { currentPassword, newPassword });
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Enter current password"
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Enter new password"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
        </form>
    );
}
