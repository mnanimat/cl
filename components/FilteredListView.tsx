'use client';

import React from 'react';
import { Task, Project, ContextItem } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { Clock, Archive, UserCheck, Plus } from 'lucide-react';

interface FilteredListViewProps {
  type: 'waiting' | 'someday';
  tasks: Task[];
  projects: Project[];
  contexts: ContextItem[];
  onToggleTask: (id: string) => void;
  onOrganizeTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onOpenQuickCapture: () => void;
}

export function FilteredListView({
  type,
  tasks,
  projects,
  contexts,
  onToggleTask,
  onOrganizeTask,
  onDeleteTask,
  onStartPomodoro,
  onOpenQuickCapture,
}: FilteredListViewProps) {
  const isWaiting = type === 'waiting';

  const items = tasks.filter((t) => t.status === (isWaiting ? 'waiting' : 'someday'));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div
        className={`p-6 rounded-2xl text-white shadow-xl bg-gradient-to-r ${
          isWaiting
            ? 'from-amber-600 via-amber-700 to-slate-900'
            : 'from-purple-700 via-indigo-700 to-slate-900'
        }`}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white mb-2 border border-white/20">
          {isWaiting ? <Clock className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          <span>{isWaiting ? 'Aguardando Terceiros' : 'Incubação de Ideias'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {isWaiting ? 'Lista de Em Espera (Waiting For)' : 'Algum Dia / Talvez (Someday / Maybe)'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-white/90 max-w-xl">
          {isWaiting
            ? 'Tudo o que você delegou ou solicitou e está aguardando resposta de outra pessoa. Essencial para cobranças sem esquecimentos.'
            : 'Projetos e aspirações para avaliar no futuro, sem poluir suas listas de ação diárias imediatas.'}
        </p>
      </div>

      {/* Header and Quick Add */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Itens Registrados ({items.length})
        </h3>
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Entrada</span>
        </button>
      </div>

      {/* List */}
      {items.length > 0 ? (
        <div className="space-y-2.5">
          {items.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
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
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {isWaiting ? (
            <UserCheck className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          ) : (
            <Archive className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          )}
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isWaiting ? 'Nenhuma pendência aguardando terceiros' : 'Nenhuma ideia incubada no momento'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ao organizar tarefas na Caixa do Caos, selecione o destino &ldquo;{isWaiting ? 'Em Espera' : 'Algum Dia'}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
