'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { DailyStandupReport } from '@/types';
import Navbar from '@/components/Navbar';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/FeedbackStates';
import {
  BarChart3,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export default function StandupSummaryPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['daily-standup'],
    queryFn: async () => {
      const res = await api.get('/api/reports/daily-standup');
      return res.data as DailyStandupReport;
    },
    enabled: !!token,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Aggregating audit logs for daily standup..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto py-12 px-4">
          <ErrorState
            title="Failed to load daily standup summary"
            message={(error as any)?.response?.data?.error || 'Server error'}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const deptList = ['MANAGEMENT', 'UIUX', 'FRONTEND', 'BACKEND'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[rgba(18,22,28,0.9)] to-[rgba(9,76,134,0.3)] border border-[rgba(80,177,210,0.2)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#50B1D2]/20 text-[#50B1D2] font-semibold border border-[#50B1D2]/40 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Automated Standup Summary</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cross-Department Standup Report
            </h1>
            <p className="text-xs text-[#A3A0AF] mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Report Generated: {new Date(data?.reportDate || '').toLocaleString()}</span>
            </p>
          </div>

          {/* Quick Metrics */}
          {data?.rawMetrics && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-center">
                <p className="text-xs text-[#A3A0AF]">Completed Yesterday</p>
                <p className="text-xl font-bold text-emerald-400">
                  {data.rawMetrics.totalCompletedYesterday}
                </p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-black/40 border border-rose-500/20 text-center">
                <p className="text-xs text-[#A3A0AF]">Blocked Today</p>
                <p className="text-xl font-bold text-rose-400">
                  {data.rawMetrics.totalBlockedToday}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Department Breakdowns */}
        <div className="space-y-6">
          {deptList.map((dept) => {
            const deptData = data?.summaryByDepartment?.[dept];
            const completedList = deptData?.completedYesterday || [];
            const blockedList = deptData?.blockedToday || [];
            const hasCompleted = completedList.length > 0;
            const hasBlocked = blockedList.length > 0;

            return (
              <div
                key={dept}
                className="p-6 rounded-2xl bg-[rgba(12,15,20,0.7)] border border-[rgba(80,177,210,0.12)] space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#50B1D2]" />
                    <span>Department: {dept}</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Completed Yesterday Column */}
                  <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] space-y-3">
                    <h3 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>What was completed yesterday</span>
                    </h3>

                    {hasCompleted ? (
                      <div className="space-y-2">
                        {completedList.map((item) => (
                          <div
                            key={item.taskId}
                            className="p-3 rounded-lg bg-black/40 border border-emerald-500/10 text-xs space-y-1"
                          >
                            <p className="font-semibold text-white">{item.taskTitle}</p>
                            <div className="flex items-center justify-between text-[11px] text-[#A3A0AF]">
                              <span>Project: {item.projectName}</span>
                              <span>By: {item.completedBy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#A3A0AF] italic py-2">
                        No tasks marked as Done in yesterday's audit logs.
                      </p>
                    )}
                  </div>

                  {/* Blocked Today Column */}
                  <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] space-y-3">
                    <h3 className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>What is blocked today</span>
                    </h3>

                    {hasBlocked ? (
                      <div className="space-y-2">
                        {blockedList.map((item) => (
                          <div
                            key={item.taskId}
                            className="p-3 rounded-lg bg-black/40 border border-rose-500/10 text-xs space-y-2"
                          >
                            <div>
                              <p className="font-semibold text-white">{item.taskTitle}</p>
                              <p className="text-[11px] text-[#A3A0AF]">
                                Assignee: {item.assignee}
                              </p>
                            </div>

                            {item.blockingPrerequisites?.length > 0 && (
                              <div className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-[10px] text-rose-300 space-y-0.5">
                                <p className="font-semibold">Prerequisite blockers:</p>
                                {item.blockingPrerequisites.map((p, idx) => (
                                  <p key={idx}>
                                    • {p.prerequisiteTitle} ({p.prerequisiteDept} - {p.currentStatus})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#A3A0AF] italic py-2">
                        No tasks currently blocked in this department.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
