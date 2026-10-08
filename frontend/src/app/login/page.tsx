'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Shield, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Demo accounts for instant test switching
  const demoAccounts = [
    { label: 'Alex Morgan (Product Manager)', email: 'pm@nodewave.id', role: 'PM' },
    { label: 'Sarah Chen (UI/UX Designer)', email: 'uiux@nodewave.id', role: 'UI/UX' },
    { label: 'Devin Cole (Frontend Engineer)', email: 'frontend@nodewave.id', role: 'Frontend' },
    { label: 'Marcus Vance (Backend Engineer)', email: 'backend@nodewave.id', role: 'Backend' },
    { label: 'Victoria Sterling (Client Stakeholder)', email: 'client@clientcorp.com', role: 'Client Guest' },
  ];

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const loginEmail = customEmail || email;

    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail,
        password: password || 'password123',
      });

      setAuth(res.data.user, res.data.token);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (accEmail: string) => {
    setEmail(accEmail);
    handleLogin(undefined, accEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#50B1D2] to-[#094C86] shadow-xl shadow-[#50B1D2]/20 mb-4">
            <span className="font-extrabold text-black text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NodeWave Operational Backbone</h1>
          <p className="text-sm text-[#A3A0AF] mt-1">Enterprise Deliverables & State-Aware Workflow</p>
        </div>

        {/* Login Form Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(18,22,28,0.7)] border border-[rgba(80,177,210,0.15)] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@nodewave.id"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#50B1D2] focus:ring-1 focus:ring-[#50B1D2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A0AF] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#50B1D2] focus:ring-1 focus:ring-[#50B1D2] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#50B1D2] to-[#094C86] hover:opacity-90 text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#50B1D2]/20 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/register"
              className="text-xs text-[#A3A0AF] hover:text-[#50B1D2] transition-colors"
            >
              Don't have an account? <span className="text-[#50B1D2] font-semibold underline">Register here</span>
            </a>
          </div>

          {/* Seed Account Quick Switcher */}
          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#50B1D2] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Login (Assessment Seed Accounts):</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc.email)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(80,177,210,0.1)] border border-[rgba(255,255,255,0.05)] hover:border-[#50B1D2]/40 text-left transition-all group"
                >
                  <div className="text-xs">
                    <p className="font-semibold text-white group-hover:text-[#50B1D2] transition-colors">
                      {acc.label}
                    </p>
                    <p className="text-[11px] text-[#A3A0AF]">{acc.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] group-hover:bg-[#50B1D2]/20 text-[#A3A0AF] group-hover:text-[#50B1D2] font-mono">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

