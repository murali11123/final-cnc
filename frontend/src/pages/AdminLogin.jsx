import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(username, password);
      toast.success('Successfully logged into Admin Dashboard!');
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Login error:', error.message);
      toast.error(error.message || 'Invalid admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <svg className="w-10 h-10 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
          <circle cx="12" cy="12" r="1.5" className="fill-brand-secondary stroke-none" />
        </svg>
        <span className="font-extrabold text-2xl tracking-tight text-white">
          3D<span className="text-brand-secondary ml-1">CNC</span>
        </span>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Card Title */}
        <div className="mb-8 text-center">
          <div className="flex justify-center text-brand-secondary mb-2 animate-bounce">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Admin CMS Portal
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Sign in with owner credentials to manage CNC design catalog.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-slate-500 w-4 h-4" />
              <input
                type="text"
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-secondary focus:bg-slate-950/70 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-secondary focus:bg-slate-950/70 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3.5 px-6 rounded-xl transition shadow hover:shadow-brand-secondary/20 disabled:bg-slate-800 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                <span>Authenticating owner...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>SIGN IN TO PORTAL</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-[10px] text-slate-600 font-mono tracking-widest select-none">
        3D CNC ADMINISTRATIVE PORTAL | YOU IMAGINE IT, WE MADE IT
      </div>
    </div>
  );
};

export default AdminLogin;
