export type Role = 'PRODUCT_MANAGER' | 'INTERNAL_TEAM' | 'CLIENT_GUEST';

export type Department = 'MANAGEMENT' | 'UIUX' | 'FRONTEND' | 'BACKEND' | 'CLIENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: Role;
  department: Department;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  uploadedById: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export interface TaskAuditLog {
  id: string;
  taskId: string;
  userId?: string | null;
  user?: { id: string; fullName: string } | null;
  changedColumn: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  prerequisiteTaskId: string;
  prerequisiteTask: {
    id: string;
    title: string;
    status: TaskStatus;
    department: Department;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  department: Department | null;
  clientVisible: boolean;
  version: number;
  projectId: string;
  project?: { id: string; name: string };
  assigneeId?: string | null;
  assignee?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    department: Department;
  } | null;
  dependencies: TaskDependency[];
  prerequisiteFor?: {
    dependentTask: {
      id: string;
      title: string;
      status: TaskStatus;
      department: Department;
    };
  }[];
  attachments?: TaskAttachment[];
  auditLogs?: TaskAuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId?: string | null;
  createdAt: string;
  updatedAt: string;
  members?: {
    user: {
      id: string;
      fullName: string;
      role: Role;
      department: Department;
      avatarUrl?: string | null;
    };
  }[];
  metrics?: {
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
  };
}

export interface DailyStandupReport {
  reportDate: string;
  reportingPeriod: {
    startOfYesterday: string;
    endOfYesterday: string;
  };
  summaryByDepartment: Record<
    string,
    {
      completedYesterday: {
        taskId: string;
        taskTitle: string;
        projectName: string;
        completedBy: string;
        completedAt: string;
      }[];
      blockedToday: {
        taskId: string;
        taskTitle: string;
        projectName: string;
        assignee: string;
        blockingPrerequisites: {
          prerequisiteTitle: string;
          prerequisiteDept: string;
          currentStatus: string;
        }[];
      }[];
    }
  >;
  rawMetrics: {
    totalCompletedYesterday: number;
    totalBlockedToday: number;
  };
}

