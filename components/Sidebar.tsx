'use client';

import React from 'react';
import {
  Inbox,
  Calendar,
  FolderKanban,
  Tag,
  Clock,
  Archive,
  Timer,
  Sparkles,
  CheckCheck,
  Plus,
  Compass,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { Task, Project } from '@/lib/types';
import { filterTasks } from '@/lib/gtd-logic';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenQuickCapture: () => void;
  tasks: Task[];
  projects: Project[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  onOpenQuickCapture,
  tasks,
  projects,
  isOpenMobile,
  onCloseMobile,
  onExport,
  onImport,
  onReset,
}: SidebarProps) {
  const inboxCount = filterTasks(tasks, 'inbox').length;
  const todayCount = filterTasks(tasks, 'today').length;
  const waitingCount = filterTasks(tasks, 'waiting').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;

  const navItems = [
    {
      id: 'chaos_box',
      label: 'Caixa do Caos',
      subtitle: 'Inbox GTD',
      icon: Inbox,
      badge: inboxCount,
      badgeColor: inboxCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500',
    },
    {
      id: 'daily_plan',
      label: 'Plano Diário',
      subtitle: 'Hoje & Próximos',
      icon: Calendar,
      badge: todayCount,
      badgeColor: todayCount > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500',
    },
    {
      id: 'projects',
      label: 'Projetos & Metas',
      subtitle: 'Objetivos e Etapas',
      icon: FolderKanban,
      badge: activeProjectsCount,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    },
    {
      id: 'contexts',
      label: 'Contextos (@)',
      subtitle: 'Filtro Situacional',
      icon: Tag,
    },
    {
      id: 'waiting',
      label: 'Em Espera',
      subtitle: 'Delegados / Terceiros',
      icon: Clock,
      badge: waitingCount,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    },
    {
      id: 'someday',
      label: 'Algum Dia / Talvez',
      subtitle: 'Ideias Futuras',
      icon: Archive,
    },
    {
      id: 'pomodoro',
      label: 'Timer de Foco',
      subtitle: 'Pomodoro GTD',
      icon: Timer,
    },
    {
      id: 'ai_clarifier',
      label: 'Despejo Mental IA',
      subtitle: 'Estruturação Gemini',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'weekly_review',
      label: 'Revisão Semanal',
      subtitle: 'Hábito de Ouro GTD',
      icon: CheckCheck,
    },
  ];

  const handleNavClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Chaos Control
                <span className="text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
                  WEB
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">GTD Methodology</p>
            </div>
          </div>
        </div>

        {/* Primary CTA: Captura Rápida */}
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>+ Captura Rápida</span>
          </button>
        </div>

        {/* Nav Links List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : item.highlight
                        ? 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-medium block truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {typeof item.badge === 'number' && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer controls: Backup / Import / Reset */}
        <div className="p-4 pb-6 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
              Dados & Backup
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Salvo local
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={onExport}
              title="Baixar backup JSON"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px]">Exportar</span>
            </button>

            <button
              type="button"
              onClick={onImport}
              title="Restaurar backup JSON"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[10px]">Importar</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              title="Restaurar exemplos iniciais"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px]">Padrão</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
