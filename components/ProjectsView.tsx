'use client';

import React, { useState } from 'react';
import { Project, Task, Folder, ContextItem } from '@/lib/types';
import { calculateProjectProgress } from '@/lib/gtd-logic';
import {
  FolderKanban,
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  folders: Folder[];
  contexts: ContextItem[];
  onOpenNewProjectModal: () => void;
  onSelectProject: (project: Project) => void;
  onUpdateProjectStatus: (projectId: string, status: Project['status']) => void;
}

export function ProjectsView({
  projects,
  tasks,
  folders,
  contexts,
  onOpenNewProjectModal,
  onSelectProject,
  onUpdateProjectStatus,
}: ProjectsViewProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredProjects = projects.filter((project) => {
    if (selectedFolderId !== 'all' && project.folderId !== selectedFolderId) {
      return false;
    }
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100 mb-2 border border-white/20">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Estrutura de Resultados</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Projetos & Metas GTD
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
            Cada projeto representa um resultado desejado que requer múltiplos passos de ação. Acompanhe o avanço de cada meta com clareza.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Folder pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFolderId('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedFolderId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Todas as Pastas
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFolderId(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedFolderId === f.id
                  ? 'text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
              style={{
                backgroundColor: selectedFolderId === f.id ? f.color : undefined,
              }}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Concluídos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const folder = folders.find((f) => f.id === project.folderId);
            const progress = calculateProjectProgress(project.id, tasks);
            const nextAction = tasks.find(
              (t) => t.projectId === project.id && t.status !== 'completed'
            );

            return (
              <div
                key={project.id}
                data-testid={`project-card-${project.id}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600/60 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {folder && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                      >
                        {folder.name}
                      </span>
                    )}

                    {project.dueDate && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {project.dueDate}
                      </span>
                    )}
                  </div>

                  {/* Title & description */}
                  <h3
                    onClick={() => onSelectProject(project)}
                    className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
                  >
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* GTD Outcome */}
                  {project.targetOutcome && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold mb-0.5 text-[11px]">
                        <Target className="w-3 h-3 text-blue-500" />
                        <span>Resultado Esperado</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                        {project.targetOutcome}
                      </p>
                    </div>
                  )}

                  {/* Next immediate action */}
                  <div className="mt-3 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Próxima Ação:{' '}
                    </span>
                    {nextAction ? (
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {nextAction.title}
                      </span>
                    ) : (
                      <span className="italic text-amber-600 dark:text-amber-400">
                        Sem ações pendentes (adicione uma para manter o projeto vivo)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom card footer: Progress bar + open button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Progresso</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {progress.percentage}% ({progress.completed}/{progress.total})
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onUpdateProjectStatus(project.id, project.status === 'completed' ? 'active' : 'completed')}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        project.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {project.status === 'completed' ? 'Concluído ✓' : 'Marcar Concluído'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
                    >
                      <span>Ver Etapas</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <FolderKanban className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhum projeto encontrado neste filtro
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Crie seu primeiro projeto para agrupar metas e tarefas em um só lugar.
          </p>
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            + Criar Novo Projeto
          </button>
        </div>
      )}
    </div>
  );
}
