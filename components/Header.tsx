'use client';

import React, { useRef } from 'react';
import { Menu, Search, Plus, Sparkles, X } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  activeView: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenQuickCapture: () => void;
  onImportFile: (content: string) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
}

export function Header({
  onToggleMobileMenu,
  activeView,
  searchQuery,
  onSearchChange,
  onOpenQuickCapture,
  onImportFile,
  importInputRef,
}: HeaderProps) {
  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    chaos_box: {
      title: 'Caixa do Caos',
      subtitle: 'Capture pensamentos e processe em ações claras e projetos.',
    },
    daily_plan: {
      title: 'Plano Diário',
      subtitle: 'Seu foco para hoje, amanhã e próximos compromissos.',
    },
    projects: {
      title: 'Projetos & Metas',
      subtitle: 'Objetivos estruturados com resultados desejados e próximas ações.',
    },
    contexts: {
      title: 'Contextos Situacionais (@)',
      subtitle: 'Filtre tarefas pelo local ou ferramenta disponível agora.',
    },
    waiting: {
      title: 'Lista de Em Espera',
      subtitle: 'Tarefas delegadas a terceiros e respostas pendentes.',
    },
    someday: {
      title: 'Algum Dia / Talvez',
      subtitle: 'Ideias valiosas para incubar sem poluir o foco ativo.',
    },
    pomodoro: {
      title: 'Timer de Foco Pomodoro',
      subtitle: 'Ciclos de 25 minutos de imersão total com pausas curtas.',
    },
    ai_clarifier: {
      title: 'Despejo Mental com IA (Gemini)',
      subtitle: 'Transforme anotações caóticas em projetos e ações GTD automáticas.',
    },
    weekly_review: {
      title: 'Revisão Semanal GTD',
      subtitle: 'O hábito essencial para manter sua mente livre de estresse.',
    },
  };

  const currentInfo = viewTitles[activeView] || {
    title: 'Chaos Control',
    subtitle: 'Sistema de Produtividade GTD',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportFile(content);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset so same file can be reloaded if needed
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Hidden file input for backup restoration */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Left: Mobile Toggle & View Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Abrir menu lateral"
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search & Action buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative w-28 sm:w-64">
          <label htmlFor="global-search-input" className="sr-only">
            Buscar tarefas ou projetos
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="global-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Capturar</span>
        </button>
      </div>
    </header>
  );
}
