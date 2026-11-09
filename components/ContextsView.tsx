'use client';

import React, { useState } from 'react';
import { ContextItem, Task, Project } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { calculateContextCounts } from '@/lib/gtd-logic';
import {
  Tag,
  Laptop,
  Building2,
  Phone,
  Car,
  Home,
  Users,
  BookOpen,
  Filter,
} from 'lucide-react';

interface ContextsViewProps {
  contexts: ContextItem[];
  tasks: Task[];
  projects: Project[];
  selectedContextId: string | null;
  onSelectContext: (id: string | null) => void;
  onToggleTask: (id: string) => void;
  onOrganizeTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
}

export function ContextsView({
  contexts,
  tasks,
  projects,
  selectedContextId,
  onSelectContext,
  onToggleTask,
  onOrganizeTask,
  onDeleteTask,
  onStartPomodoro,
}: ContextsViewProps) {
  const counts = calculateContextCounts(contexts, tasks);

  const iconMap: Record<string, React.ElementType> = {
    Laptop,
    Building2,
    Phone,
    Car,
    Home,
    Users,
    BookOpen,
  };

  const activeContext = contexts.find((c) => c.id === selectedContextId);

  const contextTasks = tasks.filter((t) => {
    if (selectedContextId) {
      return t.contextId === selectedContextId && t.status !== 'someday';
    }
    return t.contextId !== undefined && t.status !== 'someday';
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-2 border border-white/20">
          <Tag className="w-3.5 h-3.5" />
          <span>Filtro de Energia & Local</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Contextos Situacionais (@)
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-emerald-100/90 max-w-xl">
          Execute as tarefas certas no momento e lugar certos. Filtre suas ações pelo recurso que você tem em mãos agora.
        </p>
      </div>

      {/* Contexts Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Selecione um Contexto para Filtrar
          </h3>
          {selectedContextId && (
            <button
              type="button"
              onClick={() => onSelectContext(null)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
            >
              Ver Todas as Tarefas com Contexto
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {contexts.map((ctx) => {
            const Icon = iconMap[ctx.icon] || Tag;
            const count = counts[ctx.id] || 0;
            const isSelected = selectedContextId === ctx.id;

            return (
              <button
                key={ctx.id}
                type="button"
                onClick={() => onSelectContext(isSelected ? null : ctx.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-white dark:bg-slate-800 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${ctx.color}20`, color: ctx.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      count > 0
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {ctx.name}
                  </h4>
                  {ctx.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {ctx.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list for selected context */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {activeContext ? `Ações em ${activeContext.name}` : 'Todas as Ações Contextualizadas'} ({contextTasks.length})
          </h3>
        </div>

        {contextTasks.length > 0 ? (
          <div className="space-y-2.5">
            {contextTasks.map((task) => {
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
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Tag className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nenhuma ação atribuída a este contexto. Organize itens na Caixa do Caos para categorizá-los aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
