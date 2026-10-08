'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Layers, BarChart3, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'PRODUCT_MANAGER':
        return <span className="bg-[#50B1D2]/20 text-[#50B1D2] border border-[#50B1D2]/40 text-xs px-2.5 py-0.5 rounded-full font-medium">PM</span>;
      case 'CLIENT_GUEST':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-medium">Client Guest</span>;
      default:
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded-full font-medium">{user.department}</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(80,177,210,0.15)] bg-[#070607]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#50B1D2] to-[#094C86] flex items-center justify-center shadow-lg shadow-[#50B1D2]/20 group-hover:scale-105 transition-transform">
            <span className="font-bold text-black text-lg tracking-wider">N</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#50B1D2] transition-colors">
              NODEWAVE
            </span>
            <span className="text-xs text-[#A3A0AF] block -mt-1 font-mono">BACKBONE</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[#A3A0AF] hover:text-[#50B1D2] transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Task Board</span>
          </Link>

          {user?.role !== 'CLIENT_GUEST' && (
            <Link
              href="/standup"
              className="text-sm font-medium text-[#A3A0AF] hover:text-[#50B1D2] transition-colors flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Standup Summary</span>
            </Link>
          )}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-full">
              <div className="w-7 h-7 rounded-full bg-[#50B1D2]/20 text-[#50B1D2] flex items-center justify-center text-xs font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-white leading-tight">{user.fullName}</p>
                <p className="text-[#A3A0AF] text-[10px]">{user.email}</p>
              </div>
              {getRoleBadge()}
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-[#A3A0AF] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

