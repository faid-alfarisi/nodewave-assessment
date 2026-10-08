'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Task, Project } from '@/types';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskDetailModal from '@/components/TaskDetailModal';
import ConcurrencyConflictModal from '@/components/ConcurrencyConflictModal';
import CreateTaskModal from '@/components/CreateTaskModal';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/FeedbackStates';
import {
  Plus,
  Filter,
  CheckCircle,
  Clock,
  Layers,
  Lock,
  Search,
  Sparkles,
  BarChart,
  RefreshCw,
} from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', icon: Clock, color: 'text-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: RefreshCw, color: 'text-[#50B1D2]' },
  { id: 'DONE', title: 'Done', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'BLOCKED', title: 'Blocked', icon: Lock, color: 'text-rose-400' },
];

export default function TaskBoardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, initialize } = useAuthStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [conflictData, setConflictData] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Fetch Projects to get aggregate progress
  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/api/projects');
      return res.data.data as Project[];
    },
    enabled: !!token,
  });

  const activeProject = projectsData?.[0];

  // Fetch Tasks with dynamic filters
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError,
    error,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['tasks', deptFilter],
    queryFn: async () => {
      const params: any = {};
      if (deptFilter !== 'ALL') {
        params.filters = JSON.stringify({ department: deptFilter });
      }
      const res = await api.get('/api/tasks', { params });
      return res.data.data as Task[];
    },
    enabled: !!token,
  });

  const isClient = user?.role === 'CLIENT_GUEST';
  const isPM = user?.role === 'PRODUCT_MANAGER';

  // Filter tasks locally by search input
  const filteredTasks = (tasksData || []).filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || (projectsLoading && !projectsData)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Connecting to NodeWave..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Project Header & Aggregate Metrics Card */}
        {activeProject && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[rgba(18,22,28,0.9)] to-[rgba(9,76,134,0.2)] border border-[rgba(80,177,210,0.2)] shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#50B1D2]/20 text-[#50B1D2] font-semibold border border-[#50B1D2]/40">
                    Active Deliverable
                  </span>
                  {isClient && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Client View (Isolated)
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{activeProject.name}</h1>
                <p className="text-xs text-[#A3A0AF] max-w-2xl">{activeProject.description}</p>
              </div>

              {/* Progress Bar & Percentage */}
              {activeProject.metrics && (
                <div className="min-w-[220px] p-4 rounded-xl bg-black/40 border border-[rgba(255,255,255,0.06)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#A3A0AF]">Project Progress</span>
                    <span className="text-lg font-bold text-[#50B1D2]">
                      {activeProject.metrics.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#50B1D2] to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${activeProject.metrics.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#A3A0AF]">
                    <span>{activeProject.metrics.completedTasks} Completed</span>
                    <span>{activeProject.metrics.totalTasks} Total Tasks</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar: Search, Filters, and New Task */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A0AF]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgba(18,22,28,0.7)] border border-[rgba(80,177,210,0.15)] text-white text-xs focus:outline-none focus:border-[#50B1D2]"
              />
            </div>

            {!isClient && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[rgba(18,22,28,0.7)] border border-[rgba(80,177,210,0.15)] text-white text-xs focus:outline-none focus:border-[#50B1D2]"
              >
                <option value="ALL">All Departments</option>
                <option value="UIUX">UI/UX</option>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="MANAGEMENT">Management</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchTasks();
                refetchProjects();
              }}
              className="p-2 text-[#A3A0AF] hover:text-white rounded-xl bg-[rgba(18,22,28,0.7)] border border-[rgba(80,177,210,0.15)] hover:border-[#50B1D2]/40 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {isPM && activeProject && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="py-2 px-4 rounded-xl bg-[#50B1D2] hover:bg-[#3ca2c4] text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-[#50B1D2]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <ErrorState
            title="Unable to load tasks"
            message={(error as any)?.message || 'Server connection error'}
            onRetry={() => refetchTasks()}
          />
        )}

        {/* Loading Tasks */}
        {tasksLoading && <LoadingSpinner text="Retrieving operational tasks..." />}

        {/* Task Board Columns (Kanban) */}
        {!tasksLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              const ColIcon = col.icon;

              return (
                <div
                  key={col.id}
                  className="p-4 rounded-2xl bg-[rgba(12,15,20,0.6)] border border-[rgba(80,177,210,0.1)] flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.05)] mb-3">
                    <div className="flex items-center gap-2">
                      <ColIcon className={`w-4 h-4 ${col.color}`} />
                      <h2 className="text-xs font-bold text-white tracking-wide">{col.title}</h2>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[#A3A0AF]">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.length > 0 ? (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUser={user}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))
                    ) : (
                      <div className="h-40 flex items-center justify-center text-center text-xs text-[#A3A0AF]/60 italic border border-dashed border-[rgba(255,255,255,0.05)] rounded-xl">
                        No tasks in {col.title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          currentUser={user}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            refetchTasks();
            refetchProjects();
          }}
          onConflict={(serverData) => setConflictData(serverData)}
        />
      )}

      {/* 409 Conflict Modal */}
      {conflictData && (
        <ConcurrencyConflictModal
          isOpen={!!conflictData}
          onClose={() => setConflictData(null)}
          onRefresh={() => {
            refetchTasks();
            refetchProjects();
          }}
          serverData={conflictData}
        />
      )}

      {/* Create Task Modal */}
      {activeProject && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            refetchTasks();
            refetchProjects();
          }}
          projectId={activeProject.id}
          existingTasks={tasksData || []}
        />
      )}
    </div>
  );
}
