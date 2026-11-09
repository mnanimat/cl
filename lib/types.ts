export type TaskStatus = 'inbox' | 'next_action' | 'waiting' | 'someday' | 'completed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  note?: string;
  status: TaskStatus;
  projectId?: string;
  contextId?: string;
  dueDate?: string; // ISO string 'YYYY-MM-DD'
  priority: TaskPriority;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
  waitingForWho?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  folderId: string;
  status: 'active' | 'on_hold' | 'completed';
  targetOutcome?: string; // GTD Outcome: O que significa este projeto concluído com sucesso?
  color: string;
  icon?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface ContextItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface GTDAppState {
  tasks: Task[];
  projects: Project[];
  folders: Folder[];
  contexts: ContextItem[];
  weeklyReviewCompletedDate?: string;
}
