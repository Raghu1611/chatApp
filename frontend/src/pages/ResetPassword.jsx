import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../utils/apiClient';

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = state?.resetToken;
  const email = state?.email;
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    try {
      await api.post('/auth/forgot-password/reset', { newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/login');
    } catch (e) {
      setError(e?.response?.data?.message || 'Reset failed');
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4">Missing reset token. Go to Forgot Password.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Reset Password</h1>
        <p className="mb-2 text-sm text-gray-600">Email: {email}</p>
        <input className="border w-full p-2 mb-2" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2 w-full" onClick={submit}>Update Password</button>
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}
