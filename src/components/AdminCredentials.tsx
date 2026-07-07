import React, { useState, useEffect } from "react";
import { Users, Lock, KeyRound, ShieldAlert, Trash2 } from "lucide-react";

export default function AdminCredentials() {
  // NEW: Grab the backend URL from Vercel's environment variables
  const API_URL = import.meta.env.VITE_API_URL || "";

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [revokeModalUserId, setRevokeModalUserId] = useState<string | null>(null);
  
  // NEW: Nuke Modal State
  const [deleteModalUserId, setDeleteModalUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // UPDATED FETCH CALL
      const res = await fetch(`${API_URL}/api/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      // UPDATED FETCH CALL
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, companyName: businessName })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }
      setSuccess("User created successfully.");
      setEmail("");
      setPassword("");
      setBusinessName("");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResetPassword = async () => {
    if (!resetModalUserId || !newPassword) return;
    setError("");
    setSuccess("");
    try {
      // UPDATED FETCH CALL
      const res = await fetch(`${API_URL}/api/admin/users/${resetModalUserId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }
      setSuccess("Password reset successfully.");
      setResetModalUserId(null);
      setNewPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitRevokeAccess = async () => {
    if (!revokeModalUserId) return;
    setError("");
    setSuccess("");
    try {
      // UPDATED FETCH CALL
      const res = await fetch(`${API_URL}/api/admin/users/${revokeModalUserId}/revoke`, {
        method: "POST"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke access");
      }
      setSuccess("Access revoked.");
      setRevokeModalUserId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // NEW: Submit Delete (Nuke) Request
  const submitDeleteUser = async () => {
    if (!deleteModalUserId) return;
    setError("");
    setSuccess("");
    try {
      // UPDATED FETCH CALL
      const res = await fetch(`${API_URL}/api/admin/users/${deleteModalUserId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      setSuccess("Account completely vaporized and email freed up.");
      setDeleteModalUserId(null);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Group users by business name
  const groupedUsers = users.reduce((acc: any, user: any) => {
    const bName = user.tenant?.companyName || "No Business Associated";
    if (!acc[bName]) acc[bName] = [];
    acc[bName].push(user);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in relative">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <KeyRound className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Credential Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Super-Admin controls to generate, reset, and revoke user credentials.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm">
          {success}
        </div>
      )}

      {/* Generate New Credential Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Generate New Credential
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="user@business.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Manual Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Secure password"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business/Company Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Acme Roofing"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Generating..." : "Generate Credential"}
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading credentials...</div>
        ) : (
          Object.entries(groupedUsers).map(([business, businessUsers]: any) => (
            <div key={business} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-200 text-lg">{business}</h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                  {businessUsers.length} user{businessUsers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {businessUsers.map((user: any) => (
                  <div key={user.id} className="p-6 flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-slate-200">{user.email}</div>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <span>Role: {user.role}</span>
                        <span>•</span>
                        <span className={user.isActive ? "text-emerald-400" : "text-amber-400"}>
                          {user.isActive ? "Active" : "Revoked"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                      <button
                        onClick={() => setResetModalUserId(user.id)}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Reset Password
                      </button>
                      <button
                        onClick={() => setRevokeModalUserId(user.id)}
                        disabled={!user.isActive}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                      
                      {/* NEW: Nuke Button */}
                      <button
                        onClick={() => setDeleteModalUserId(user.id)}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModalUserId && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Reset Password</h3>
            <input
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setResetModalUserId(null)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={submitResetPassword} className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">Confirm Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Access Modal */}
      {revokeModalUserId && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-amber-500 mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Revoke Access</h3>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to revoke access? The user will not be able to log in, but their data will remain.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRevokeModalUserId(null)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={submitRevokeAccess} className="px-4 py-2 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg">Revoke Access</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Delete (Nuke) Modal */}
      {deleteModalUserId && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-rose-900/50 shadow-xl shadow-rose-900/20 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-rose-500 mb-2 flex items-center gap-2"><Trash2 className="w-5 h-5"/> Delete User</h3>
            <p className="text-sm text-slate-400 mb-6">WARNING: This will permanently delete the user from the database and authentication provider. This frees up the email to be used again.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModalUserId(null)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={submitDeleteUser} className="px-4 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg">Permanently Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}