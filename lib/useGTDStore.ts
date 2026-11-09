'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { Task, Project, Folder, ContextItem, GTDAppState } from './types';
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_FOLDERS,
  INITIAL_CONTEXTS,
  toggleTaskCompleted,
  processChaosItem,
} from './gtd-logic';
import { playCompleteSound } from './audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'chaos_control_app_state_v1';

const defaultState: GTDAppState = {
  tasks: INITIAL_TASKS,
  projects: INITIAL_PROJECTS,
  folders: INITIAL_FOLDERS,
  contexts: INITIAL_CONTEXTS,
  weeklyReviewCompletedDate: undefined,
};

let memoryState: GTDAppState = defaultState;
let hasLoadedFromStorage = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function loadInitialState(): GTDAppState {
  if (typeof window === 'undefined') return defaultState;
  if (hasLoadedFromStorage) return memoryState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: GTDAppState = JSON.parse(stored);
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
        memoryState = {
          tasks: parsed.tasks,
          projects: parsed.projects,
          folders: parsed.folders || INITIAL_FOLDERS,
          contexts: parsed.contexts || INITIAL_CONTEXTS,
          weeklyReviewCompletedDate: parsed.weeklyReviewCompletedDate,
        };
        hasLoadedFromStorage = true;
        return memoryState;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored GTD state', e);
  }

  memoryState = defaultState;
  hasLoadedFromStorage = true;
  return memoryState;
}

function saveState(newState: GTDAppState) {
  memoryState = newState;
  notify();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useGTDStore() {
  const state = useSyncExternalStore(
    subscribe,
    () => loadInitialState(),
    () => defaultState
  );

  // Active view & filters
  const [activeView, setActiveView] = useState<string>('chaos_box');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePomodoroTask, setActivePomodoroTask] = useState<Task | null>(null);

  const { tasks, projects, folders, contexts, weeklyReviewCompletedDate } = state;

  const setWeeklyReviewCompletedDate = useCallback((date: string | undefined) => {
    saveState({ ...memoryState, weeklyReviewCompletedDate: date });
  }, []);

  const addChaosTask = useCallback((title: string, note?: string, priority: Task['priority'] = 'medium') => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      note: note?.trim(),
      status: 'inbox',
      priority,
      createdAt: new Date().toISOString(),
    };
    saveState({
      ...memoryState,
      tasks: [newTask, ...memoryState.tasks],
    });
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    saveState({
      ...memoryState,
      tasks: memoryState.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    saveState({
      ...memoryState,
      tasks: memoryState.tasks.filter((t) => t.id !== id),
    });
    if (activePomodoroTask?.id === id) {
      setActivePomodoroTask(null);
    }
  }, [activePomodoroTask]);

  const toggleTask = useCallback((id: string) => {
    let isNowCompleted = false;
    const nextTasks = memoryState.tasks.map((t) => {
      if (t.id === id) {
        const updated = toggleTaskCompleted(t);
        if (updated.status === 'completed') {
          isNowCompleted = true;
        }
        return updated;
      }
      return t;
    });

    saveState({
      ...memoryState,
      tasks: nextTasks,
    });

    if (isNowCompleted) {
      playCompleteSound();
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch {
        // ignore
      }
    }
  }, []);

  const organizeTask = useCallback((
    id: string,
    updates: Partial<Pick<Task, 'title' | 'note' | 'projectId' | 'contextId' | 'dueDate' | 'priority' | 'status' | 'waitingForWho' | 'estimatedMinutes'>>
  ) => {
    saveState({
      ...memoryState,
      tasks: memoryState.tasks.map((t) => (t.id === id ? processChaosItem(t, updates) : t)),
    });
  }, []);

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    saveState({
      ...memoryState,
      projects: [newProject, ...memoryState.projects],
    });
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    saveState({
      ...memoryState,
      projects: memoryState.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    saveState({
      ...memoryState,
      projects: memoryState.projects.filter((p) => p.id !== id),
      tasks: memoryState.tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
    });
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId]);

  const addBatchFromAI = useCallback((project: { title: string; outcome: string }, actions: Array<{
    title: string;
    suggestedContext?: string;
    suggestedPriority?: string;
    estimatedMinutes?: number;
    note?: string;
  }>) => {
    let createdProjectId: string | undefined;
    let nextProjects = [...memoryState.projects];

    if (project && project.title) {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        title: project.title,
        folderId: 'f-work',
        status: 'active',
        targetOutcome: project.outcome || 'Projeto estruturado com IA concluído com sucesso.',
        color: '#3B82F6',
        icon: 'Sparkles',
        createdAt: new Date().toISOString(),
      };
      nextProjects = [newProj, ...nextProjects];
      createdProjectId = newProj.id;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newTasks: Task[] = actions.map((act, index) => {
      const matchedCtx = memoryState.contexts.find((c) =>
        act.suggestedContext && c.name.toLowerCase().includes(act.suggestedContext.toLowerCase().replace('@', ''))
      );

      const priorityMap: Record<string, Task['priority']> = {
        urgent: 'urgent',
        high: 'high',
        medium: 'medium',
        low: 'low',
      };

      return {
        id: `task-ai-${Date.now()}-${index}`,
        title: act.title,
        note: act.note,
        status: 'next_action',
        projectId: createdProjectId,
        contextId: matchedCtx ? matchedCtx.id : 'ctx-comp',
        dueDate: index === 0 ? todayStr : undefined,
        priority: priorityMap[act.suggestedPriority || 'medium'] || 'medium',
        estimatedMinutes: act.estimatedMinutes || 25,
        createdAt: new Date().toISOString(),
      };
    });

    saveState({
      ...memoryState,
      projects: nextProjects,
      tasks: [...newTasks, ...memoryState.tasks],
    });
  }, []);

  const resetToDefaultData = useCallback(() => {
    saveState({
      tasks: INITIAL_TASKS,
      projects: INITIAL_PROJECTS,
      folders: INITIAL_FOLDERS,
      contexts: INITIAL_CONTEXTS,
      weeklyReviewCompletedDate: undefined,
    });
  }, []);

  const exportBackupJson = useCallback(() => {
    const jsonStr = JSON.stringify(memoryState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaos-control-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importBackupJson = useCallback((jsonContent: string) => {
    try {
      const parsed: GTDAppState = JSON.parse(jsonContent);
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
        saveState({
          tasks: parsed.tasks,
          projects: parsed.projects,
          folders: parsed.folders || INITIAL_FOLDERS,
          contexts: parsed.contexts || INITIAL_CONTEXTS,
          weeklyReviewCompletedDate: parsed.weeklyReviewCompletedDate,
        });
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  return {
    isLoaded: true,
    tasks,
    projects,
    folders,
    contexts,
    weeklyReviewCompletedDate,
    setWeeklyReviewCompletedDate,
    activeView,
    setActiveView,
    selectedProjectId,
    setSelectedProjectId,
    selectedContextId,
    setSelectedContextId,
    searchQuery,
    setSearchQuery,
    activePomodoroTask,
    setActivePomodoroTask,
    addChaosTask,
    updateTask,
    deleteTask,
    toggleTask,
    organizeTask,
    addProject,
    updateProject,
    deleteProject,
    addBatchFromAI,
    resetToDefaultData,
    exportBackupJson,
    importBackupJson,
  };
}
