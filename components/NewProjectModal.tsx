'use client';

import React, { useState } from 'react';
import { Project, Folder } from '@/lib/types';
import { X, Target, Calendar } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  folders: Folder[];
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export function NewProjectModal({
  isOpen,
  folders,
  onClose,
  onCreate,
}: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [folderId, setFolderId] = useState(folders[0]?.id || 'f-work');
  const [color, setColor] = useState('#3B82F6');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const colorOptions = [
    { name: 'Azul', hex: '#3B82F6' },
    { name: 'Esmeralda', hex: '#10B981' },
    { name: 'Âmbar', hex: '#F59E0B' },
    { name: 'Roxo', hex: '#8B5CF6' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Ciano', hex: '#06B6D4' },
    { name: 'Vermelho', hex: '#EF4444' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      targetOutcome: targetOutcome.trim() || undefined,
      folderId,
      status: 'active',
      color,
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDescription('');
    setTargetOutcome('');
    setDueDate('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="new-project-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Criar Novo Projeto GTD
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No GTD, um projeto é qualquer objetivo com mais de um passo de ação.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="project-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Nome do Projeto *
            </label>
            <input
              id="project-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reformar Escritório, Lançar Podcast"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="project-outcome-input" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              Resultado Esperado (GTD Outcome)
            </label>
            <textarea
              id="project-outcome-input"
              rows={2}
              value={targetOutcome}
              onChange={(e) => setTargetOutcome(e.target.value)}
              placeholder="Como você saberá que o projeto está 100% concluído? (Ex: Pintura seca, nova mesa montada e computadores ligados)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="folder-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Pasta / Área da Vida
              </label>
              <select
                id="folder-select"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="proj-due-date" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Data Alvo (Opcional)
              </label>
              <input
                id="proj-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Color palette */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  aria-label={`Cor ${c.name}`}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c.hex ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
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
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
