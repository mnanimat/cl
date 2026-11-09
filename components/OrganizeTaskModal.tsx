'use client';

import React, { useState } from 'react';
import { Task, Project, ContextItem } from '@/lib/types';
import { getTodayStr, getTomorrowStr } from '@/lib/gtd-logic';
import {
  X,
  Calendar,
  Folder as FolderIcon,
  Tag,
  CheckCircle2,
  Clock,
  UserCheck,
  Archive,
} from 'lucide-react';

interface OrganizeTaskModalProps {
  task: Task | null;
  projects: Project[];
  contexts: ContextItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'note' | 'projectId' | 'contextId' | 'dueDate' | 'priority' | 'status' | 'waitingForWho' | 'estimatedMinutes'>>
  ) => void;
}

export function OrganizeTaskModal({
  task,
  projects,
  contexts,
  isOpen,
  onClose,
  onSave,
}: OrganizeTaskModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="organize-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="organize-modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Organizar Tarefa (GTD)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transforme caos em ação estruturada com projeto, contexto e prazo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Keyed Form so it auto-initializes without useEffect */}
        <OrganizeTaskForm
          key={task.id}
          task={task}
          projects={projects}
          contexts={contexts}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}

function OrganizeTaskForm({
  task,
  projects,
  contexts,
  onClose,
  onSave,
}: {
  task: Task;
  projects: Project[];
  contexts: ContextItem[];
  onClose: () => void;
  onSave: OrganizeTaskModalProps['onSave'];
}) {
  const [title, setTitle] = useState(task.title || '');
  const [note, setNote] = useState(task.note || '');
  const [projectId, setProjectId] = useState<string>(task.projectId || '');
  const [contextId, setContextId] = useState<string>(task.contextId || '');
  const [dueDate, setDueDate] = useState<string>(task.dueDate || '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority || 'medium');
  const [status, setStatus] = useState<Task['status']>(task.status === 'inbox' ? 'next_action' : task.status);
  const [waitingForWho, setWaitingForWho] = useState<string>(task.waitingForWho || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(task.estimatedMinutes || 25);

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(task.id, {
      title: title.trim(),
      note: note.trim() || undefined,
      projectId: projectId || undefined,
      contextId: contextId || undefined,
      dueDate: dueDate || undefined,
      priority,
      status,
      waitingForWho: status === 'waiting' ? waitingForWho.trim() || undefined : undefined,
      estimatedMinutes: Number(estimatedMinutes) || 25,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="task-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Título da Ação Concreta *
        </label>
        <input
          id="task-title-input"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Ligar para fornecedor e aprovar proposta"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes / Details */}
      <div>
        <label htmlFor="task-note-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Anotações & Detalhes (Opcional)
        </label>
        <textarea
          id="task-note-input"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Links, contatos, contexto de apoio..."
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GTD Status Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Tipo de Destino GTD
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStatus('next_action')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              status === 'next_action'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Próxima Ação</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus('waiting')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              status === 'waiting'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-semibold ring-1 ring-amber-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Em Espera</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus('someday')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              status === 'someday'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 font-semibold ring-1 ring-purple-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Algum Dia</span>
          </button>
        </div>
      </div>

      {/* Conditional: Waiting for who? */}
      {status === 'waiting' && (
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
          <label htmlFor="waiting-who-input" className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
            De quem você está esperando resposta ou entrega?
          </label>
          <input
            id="waiting-who-input"
            type="text"
            value={waitingForWho}
            onChange={(e) => setWaitingForWho(e.target.value)}
            placeholder="Ex: Mariana do Comercial, Cliente Dr. Silva"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>
      )}

      {/* Project & Context row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project-select" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <FolderIcon className="w-3.5 h-3.5" />
            Projeto Associado
          </label>
          <select
            id="project-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Nenhum (Ação Avulsa)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="context-select" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <Tag className="w-3.5 h-3.5" />
            Contexto Situacional (@)
          </label>
          <select
            id="context-select"
            value={contextId}
            onChange={(e) => setContextId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Sem Contexto Específico</option>
            {contexts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date with quick presets */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          <Calendar className="w-3.5 h-3.5" />
          Data Limite / Planejamento
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setDueDate(todayStr)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
              dueDate === todayStr
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setDueDate(tomorrowStr)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
              dueDate === tomorrowStr
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            Amanhã
          </button>
          <button
            type="button"
            onClick={() => setDueDate('')}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
              !dueDate
                ? 'bg-slate-600 text-white border-slate-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            Sem Data Fixa
          </button>
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Priority & Estimation row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Prioridade
          </label>
          <select
            id="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Alta</option>
            <option value="medium">🔵 Média</option>
            <option value="low">⚪ Baixa</option>
          </select>
        </div>

        <div>
          <label htmlFor="time-est-input" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            Tempo Estimado (min)
          </label>
          <input
            id="time-est-input"
            type="number"
            min="5"
            step="5"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}
