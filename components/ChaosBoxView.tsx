'use client';

import React, { useState } from 'react';
import { Task, Project, ContextItem, TaskPriority } from '@/lib/types';
import { TaskItem } from './TaskItem';
import {
  Inbox,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListFilter,
  Lightbulb,
} from 'lucide-react';

interface ChaosBoxViewProps {
  tasks: Task[];
  projects: Project[];
  contexts: ContextItem[];
  onAddTask: (title: string, note?: string, priority?: TaskPriority) => void;
  onToggleTask: (id: string) => void;
  onOrganizeTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onNavigateToAI: () => void;
}

export function ChaosBoxView({
  tasks,
  projects,
  contexts,
  onAddTask,
  onToggleTask,
  onOrganizeTask,
  onDeleteTask,
  onStartPomodoro,
  onNavigateToAI,
}: ChaosBoxViewProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');

  const inboxTasks = tasks.filter((t) => t.status === 'inbox');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onAddTask(quickTitle.trim(), undefined, quickPriority);
    setQuickTitle('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Quick Add Input */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100 mb-3 border border-white/20">
            <Inbox className="w-3.5 h-3.5" />
            <span>Despejo Rápido de Pensamentos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Caixa do Caos (Inbox GTD)
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Sua mente serve para ter ideias, não para guardá-las. Capture tudo o que vier à cabeça aqui para esvaziar sua mente e processe depois.
          </p>

          {/* Quick Capture Input Bar */}
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Digite qualquer ideia, tarefa ou pendência e dê Enter..."
                className="w-full pl-4 pr-24 py-3 text-sm rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-amber-400 shadow-md font-medium"
              />
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                aria-label="Prioridade inicial da tarefa"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs py-1 px-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium"
              >
                <option value="urgent">🔴 Urgente</option>
                <option value="high">🟠 Alta</option>
                <option value="medium">🔵 Média</option>
                <option value="low">⚪ Baixa</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Capturar</span>
            </button>
          </form>

          {/* AI brainstorm link */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Tem um bloco de texto ou anotações caóticas?</span>
            </span>
            <button
              type="button"
              onClick={onNavigateToAI}
              className="inline-flex items-center gap-1 text-white hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Usar Despejo com IA</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Background decorative circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 -mb-10 w-60 h-60 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Task List Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Itens na Caixa ({inboxTasks.length})
          </h3>
        </div>
        {inboxTasks.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Clique em <strong>Organizar</strong> para definir projeto e data.
          </span>
        )}
      </div>

      {/* Task List */}
      {inboxTasks.length > 0 ? (
        <div className="space-y-2.5">
          {inboxTasks.map((task) => {
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
        /* Empty state */
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            🎉 Caixa do Caos Zerada! (Inbox Zero)
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Você processou todas as ideias e pendências. Verifique o <strong>Plano Diário</strong> para focar nas ações de hoje!
          </p>
        </div>
      )}
    </div>
  );
}
