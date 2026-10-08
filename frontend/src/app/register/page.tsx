'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPlus, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PRODUCT_MANAGER' | 'INTERNAL_TEAM' | 'CLIENT_GUEST'>('INTERNAL_TEAM');
  const [department, setDepartment] = useState<'MANAGEMENT' | 'UIUX' | 'FRONTEND' | 'BACKEND' | 'CLIENT'>('FRONTEND');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync department when role changes
  const handleRoleChange = (selectedRole: any) => {
    setRole(selectedRole);
    if (selectedRole === 'PRODUCT_MANAGER') {
      setDepartment('MANAGEMENT');
    } else if (selectedRole === 'CLIENT_GUEST') {
      setDepartment('CLIENT');
    } else {
      if (department === 'MANAGEMENT' || department === 'CLIENT') {
        setDepartment('FRONTEND');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.post('/api/auth/register', {
        fullName,
        email,
        password,
        role,
        department,
      });

      setAuth(res.data.user, res.data.token);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#50B1D2] to-[#094C86] shadow-xl shadow-[#50B1D2]/20 mb-4">
            <span className="font-extrabold text-black text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create NodeWave Account</h1>
          <p className="text-sm text-[#A3A0AF] mt-1">Join as a PM, Engineer, or Client Stakeholder</p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(18,22,28,0.7)] border border-[rgba(80,177,210,0.15)] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#50B1D2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@nodewave.id"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#50B1D2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Password (Min. 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#50B1D2] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Role (RBAC)</label>
                <select
                  value={role}
                  onChange={(e: any) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#50B1D2]"
                >
                  <option value="INTERNAL_TEAM">INTERNAL_TEAM</option>
                  <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                  <option value="CLIENT_GUEST">CLIENT_GUEST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Department (ABAC)</label>
                <select
                  value={department}
                  disabled={role === 'PRODUCT_MANAGER' || role === 'CLIENT_GUEST'}
                  onChange={(e: any) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#50B1D2] disabled:opacity-40"
                >
                  {role === 'PRODUCT_MANAGER' && <option value="MANAGEMENT">MANAGEMENT</option>}
                  {role === 'CLIENT_GUEST' && <option value="CLIENT">CLIENT</option>}
                  {role === 'INTERNAL_TEAM' && (
                    <>
                      <option value="FRONTEND">FRONTEND</option>
                      <option value="BACKEND">BACKEND</option>
                      <option value="UIUX">UIUX</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-[#50B1D2] to-[#094C86] hover:opacity-90 text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#50B1D2]/20 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] text-center">
            <Link
              href="/login"
              className="text-xs text-[#A3A0AF] hover:text-[#50B1D2] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Already have an account? Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

