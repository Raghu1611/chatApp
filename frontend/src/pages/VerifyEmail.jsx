import { useState } from 'react';
import api from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const requestOtp = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-email-verification', { email });
      setStep(2);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
      navigate('/signup', { state: { emailVerifiedToken: data.emailVerifiedToken, email } });
    } catch (e) {
      setError(e?.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Verify Email</h1>
        {step === 1 && (
          <div className="space-y-3">
            <input className="border w-full p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="bg-blue-600 text-white px-4 py-2 w-full" onClick={requestOtp} disabled={loading}>Send OTP</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <input className="border w-full p-2" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button className="bg-green-600 text-white px-4 py-2 w-full" onClick={verifyOtp} disabled={loading}>Verify</button>
          </div>
        )}
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}
