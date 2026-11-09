'use client';

import React from 'react';
import { Task, Project, ContextItem } from '@/lib/types';
import { isTaskOverdue, getTodayStr, getTomorrowStr } from '@/lib/gtd-logic';
import {
  Check,
  Clock,
  Tag,
  Folder as FolderIcon,
  Timer,
  SlidersHorizontal,
  Trash2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  project?: Project;
  context?: ContextItem;
  onToggle: (id: string) => void;
  onOrganize: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartPomodoro?: (task: Task) => void;
  showOrganizeButton?: boolean;
}

export function TaskItem({
  task,
  project,
  context,
  onToggle,
  onOrganize,
  onDelete,
  onStartPomodoro,
  showOrganizeButton = true,
}: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();
  const overdue = isTaskOverdue(task, todayStr);

  const priorityColor = {
    urgent: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
    high: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    medium: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
    low: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  }[task.priority || 'medium'];

  const priorityLabel = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  }[task.priority || 'medium'];

  return (
    <div
      data-testid={`task-item-${task.id}`}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
          : overdue
          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Left side: Checkbox + details */}
      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={isCompleted ? `Desmarcar ${task.title}` : `Concluir ${task.title}`}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline flex-wrap gap-2">
            <h4
              className={`text-sm font-medium leading-snug break-words ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {/* Priority tag */}
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${priorityColor}`}
            >
              {priorityLabel}
            </span>

            {/* Waiting for indicator */}
            {task.status === 'waiting' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/50 dark:border-amber-800">
                <UserCheck className="w-3 h-3" />
                {task.waitingForWho ? `Esperando: ${task.waitingForWho}` : 'Aguardando Terceiros'}
              </span>
            )}
          </div>

          {task.note && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.note}
            </p>
          )}

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-0.5 text-xs">
            {/* Context tag */}
            {context && (
              <span
                className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md text-[11px]"
                style={{
                  backgroundColor: `${context.color}15`,
                  color: context.color,
                }}
              >
                <Tag className="w-3 h-3" />
                {context.name}
              </span>
            )}

            {/* Project badge */}
            {project && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
                <FolderIcon className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[150px]">{project.title}</span>
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isCompleted
                    ? 'text-slate-400 dark:text-slate-500'
                    : overdue
                    ? 'text-red-700 dark:text-red-300 bg-red-100/70 dark:bg-red-950/60 font-semibold'
                    : task.dueDate === todayStr
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 font-semibold'
                    : task.dueDate === tomorrowStr
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/40'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {overdue && !isCompleted ? (
                  <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {overdue && !isCompleted
                  ? `Atrasada (${task.dueDate})`
                  : task.dueDate === todayStr
                  ? 'Hoje'
                  : task.dueDate === tomorrowStr
                  ? 'Amanhã'
                  : task.dueDate}
              </span>
            )}

            {/* Estimated time */}
            {task.estimatedMinutes && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ⏱️ {task.estimatedMinutes}m
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Action controls */}
      <div className="flex items-center gap-1.5 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 justify-end shrink-0">
        {onStartPomodoro && !isCompleted && (
          <button
            type="button"
            onClick={() => onStartPomodoro(task)}
            title="Iniciar Pomodoro com esta tarefa"
            aria-label={`Iniciar foco para ${task.title}`}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Focar</span>
          </button>
        )}

        {showOrganizeButton && (
          <button
            type="button"
            onClick={() => onOrganize(task)}
            title="Organizar (Projeto, Contexto, Data)"
            aria-label={`Organizar ${task.title}`}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Organizar</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Excluir ${task.title}`}
          title="Excluir tarefa"
          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
