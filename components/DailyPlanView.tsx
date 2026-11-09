'use client';

import React, { useState } from 'react';
import { Task, Project, ContextItem } from '@/lib/types';
import { TaskItem } from './TaskItem';
import {
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { getTodayStr, getTomorrowStr, isTaskOverdue, filterTasks } from '@/lib/gtd-logic';

interface DailyPlanViewProps {
  tasks: Task[];
  projects: Project[];
  contexts: ContextItem[];
  onToggleTask: (id: string) => void;
  onOrganizeTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onQuickAddForToday: (title: string) => void;
}

export function DailyPlanView({
  tasks,
  projects,
  contexts,
  onToggleTask,
  onOrganizeTask,
  onDeleteTask,
  onStartPomodoro,
  onQuickAddForToday,
}: DailyPlanViewProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'upcoming' | 'completed'>('today');
  const [quickTitle, setQuickTitle] = useState('');

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  const todayTasks = filterTasks(tasks, 'today', { todayStr, tomorrowStr });
  const tomorrowTasks = filterTasks(tasks, 'tomorrow', { todayStr, tomorrowStr });
  const upcomingTasks = filterTasks(tasks, 'upcoming', { todayStr, tomorrowStr });
  const completedTodayTasks = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt?.startsWith(todayStr)
  );

  const overdueTasks = tasks.filter((t) => isTaskOverdue(t, todayStr));

  const totalEstMinutesToday = todayTasks
    .filter((t) => t.status !== 'completed')
    .reduce((sum, t) => sum + (t.estimatedMinutes || 25), 0);
  const estHours = Math.floor(totalEstMinutesToday / 60);
  const estMins = totalEstMinutesToday % 60;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddForToday(quickTitle.trim());
    setQuickTitle('');
  };

  const currentDisplayTasks = {
    today: todayTasks,
    tomorrow: tomorrowTasks,
    upcoming: upcomingTasks,
    completed: completedTodayTasks,
  }[activeTab];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Overdue alert notice */}
      {overdueTasks.length > 0 && activeTab === 'today' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs sm:text-sm flex-1">
            <strong>{overdueTasks.length} {overdueTasks.length === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}:</strong> Priorize reagendar ou concluir para manter seu fluxo GTD limpo.
          </div>
        </div>
      )}

      {/* Daily Progress Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <ListTodo className="w-4 h-4 text-blue-500" />
            <span>Ações Hoje</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {todayTasks.filter((t) => t.status !== 'completed').length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedTodayTasks.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Tempo Estimado</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {estHours > 0 ? `${estHours}h ` : ''}
            {estMins}m
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Amanhã</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {tomorrowTasks.length}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Hoje ({todayTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'tomorrow'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Amanhã ({tomorrowTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Próximos ({upcomingTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Concluídas ({completedTodayTasks.length})
          </button>
        </div>
      </div>

      {/* Quick Add for current date view */}
      {activeTab === 'today' && (
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="+ Adicionar tarefa diretamente para o plano de hoje..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Adicionar
          </button>
        </form>
      )}

      {/* Task List */}
      {currentDisplayTasks.length > 0 ? (
        <div className="space-y-2.5">
          {currentDisplayTasks.map((task) => {
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
          <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhuma ação agendada nesta lista
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Abra a <strong>Caixa do Caos</strong> para programar novas tarefas para este dia.
          </p>
        </div>
      )}
    </div>
  );
}
