import React, { useState } from 'react';

export default function AuthView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('murayanathan@gmail.com');
  const [password, setPassword] = useState('Johnsmith8!');
  const [error, setError] = useState('');

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication failed');
      }
      
      onLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getFriendlyError = (msg: string) => {
    if (!msg) return "";
    if (msg.includes("Authentication failed against the database server") || msg.includes("credentials") || msg.includes("postgres")) {
      return "⚠️ Database Connection Error:\nThe provided database credentials in DATABASE_URL are incorrect. Please ensure the username, password, host, and port in your environment variables are valid Supabase PostgreSQL credentials.";
    }
    if (msg.includes("Can't reach database server") || msg.includes("ETIMEDOUT") || msg.includes("ECONNREFUSED") || msg.includes("reach")) {
      return "⚠️ Database Reachability Error:\nCannot reach the database server. Please make sure your Supabase/PostgreSQL instance is active, and your DATABASE_URL environment variable is correct.";
    }
    if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("table")) {
      return "⚠️ Database Migration Error:\nThe database is connected, but the required tables do not exist. Please run 'npx prisma db push' inside your terminal to push the database schema.";
    }
    return msg;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Welcome Back</h2>
        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl mb-4 text-xs font-semibold border border-red-200 whitespace-pre-line">
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
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
