import React, { useState } from 'react';

export default function AuthView({ onLogin }: { onLogin: () => void }) {
  const API_URL = import.meta.env.VITE_API_URL || "";

  // FIXED: Removed the hardcoded login info!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Saving the token to the local storage
      localStorage.setItem("stratis_token", data.token);
      
      onLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getFriendlyError = (msg: string) => {
    if (!msg) return "";
    return msg;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Welcome Back</h2>
        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl mb-4 text-xs font-semibold border border-red-200">
            {getFriendlyError(error)}
          </div>
        )}
        <form onSubmit={handleSubmitLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-600">Email</label>
            <input 
              type="email" 
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-600">Password</label>
            <input 
              type="password" 
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}