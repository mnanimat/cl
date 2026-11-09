'use client';

import React, { useState } from 'react';
import { Project, Task, ContextItem, Folder } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { calculateProjectProgress } from '@/lib/gtd-logic';
import {
  X,
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  folder?: Folder;
  tasks: Task[];
  contexts: ContextItem[];
  isOpen: boolean;
  onClose: () => void;
  onToggleTask: (id: string) => void;
  onOrganizeTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onAddTaskToProject: (projectId: string, title: string) => void;
  onUpdateProjectStatus: (projectId: string, status: Project['status']) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectDetailModal({
  project,
  folder,
  tasks,
  contexts,
  isOpen,
  onClose,
  onToggleTask,
  onOrganizeTask,
  onDeleteTask,
  onStartPomodoro,
  onAddTaskToProject,
  onUpdateProjectStatus,
  onDeleteProject,
}: ProjectDetailModalProps) {
  const [newActionTitle, setNewActionTitle] = useState('');

  if (!isOpen || !project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const progress = calculateProjectProgress(project.id, tasks);

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    onAddTaskToProject(project.id, newActionTitle.trim());
    setNewActionTitle('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {folder && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                  >
                    {folder.name}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    project.status === 'active'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                      : project.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {project.status === 'active' ? 'Ativo' : project.status === 'completed' ? 'Concluído' : 'Em Espera'}
                </span>
              </div>
              <h3 id="project-detail-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {project.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Outcome highlight */}
          {project.targetOutcome && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-2.5">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-blue-900 dark:text-blue-300">Resultado Esperado (GTD Outcome): </span>
                <span className="text-blue-800 dark:text-blue-200">{project.targetOutcome}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400">Progresso do Projeto</span>
              <span className="text-blue-600 dark:text-blue-400">
                {progress.percentage}% ({progress.completed}/{progress.total} ações)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task list inside project */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Próximas Ações Deste Projeto ({projectTasks.length})
            </h4>

            {/* Quick status dropdown */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateProjectStatus(project.id, project.status === 'completed' ? 'active' : 'completed')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  project.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{project.status === 'completed' ? 'Reabrir Projeto' : 'Marcar Projeto Concluído'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este projeto? As tarefas associadas serão mantidas como avulsas.')) {
                    onDeleteProject(project.id);
                    onClose();
                  }
                }}
                title="Excluir projeto"
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick add action input */}
          <form onSubmit={handleAddAction} className="flex gap-2">
            <input
              type="text"
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="+ Adicionar próxima ação para este projeto..."
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>

          {/* Tasks */}
          {projectTasks.length > 0 ? (
            <div className="space-y-2">
              {projectTasks.map((task) => {
                const context = contexts.find((c) => c.id === task.contextId);
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    project={project}
                    context={context}
                    onToggle={onToggleTask}
                    onOrganize={onOrganizeTask}
                    onDelete={onDeleteTask}
                    onStartPomodoro={onStartPomodoro}
                    showOrganizeButton={true}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Nenhuma ação cadastrada para este projeto ainda. Adicione o primeiro passo acima!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
