import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../utils/apiClient';
import { UserPlus, Mail, Lock, User, Check, Loader2, KeyRound, ArrowRight, Zap, Shield, Smartphone, MessageSquare } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerifiedToken, setEmailVerifiedToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setEmailVerifiedToken(data.emailVerifiedToken);
      setStep(3);
    } catch (e) {
      setError(e?.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const createAccount = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/signup', { name, username, password }, {
        headers: { Authorization: `Bearer ${emailVerifiedToken}` },
      });
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch (e) {
      setError(e?.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[120px] animate-float-delayed" />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-slideUp flex flex-col lg:flex-row">

        {/* Left Side - Project Info */}
        <div className="hidden lg:flex w-1/2 p-12 flex-col justify-between relative bg-slate-50/50 dark:bg-black/20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">ChatApp</span>
            </div>

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Connect with friends <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">in real-time.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
              Experience the next generation of messaging. Fast, secure, and beautifully designed for the modern web.
            </p>

            <div className="space-y-4">
              {[
                { icon: Zap, text: "Lightning fast delivery" },
                { icon: Shield, text: "End-to-end encryption" },
                { icon: Smartphone, text: "Cross-platform support" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-500 mt-12">
            © 2025 ChatApp Inc.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white/50 dark:bg-white/5">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 mb-4 shadow-lg shadow-emerald-500/20 lg:hidden">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Join our community today</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8 gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'w-2 bg-slate-200 dark:bg-white/10'
                }`} />
            ))}
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-black/30"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  onClick={requestOtp}
                  disabled={loading || !email}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shimmer" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                  </span>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center mb-2">
                  <p className="text-slate-300 text-sm">We sent a code to <span className="text-white font-medium">{email}</span></p>
                  <button onClick={() => { setStep(1); setOtp(''); }} className="text-xs text-emerald-400 hover:text-emerald-300 mt-1">Change email</button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider ml-1">Verification Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-black/30 tracking-[0.5em] font-mono text-center"
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  onClick={verifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                  </span>
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-black/30"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-black/30"
                      placeholder="Choose a unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-black/30"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-400 px-1">
                  By registering, you agree to our <a href="#" className="text-emerald-400 hover:text-emerald-300">Terms</a> & <a href="#" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</a>.
                </div>
                <button
                  onClick={createAccount}
                  disabled={loading || !name || !password || !username}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shimmer" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                  </span>
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                  {(error.toLowerCase().includes('fail') || error.toLowerCase().includes('expired')) && (
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs text-red-400/80 underline hover:text-red-300 mt-1"
                    >
                      Restart Session
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="text-center mt-8 pt-6 border-t border-slate-200 dark:border-white/5">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-500 dark:text-emerald-400 font-semibold hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
