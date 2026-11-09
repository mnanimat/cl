'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGTDStore } from '@/lib/useGTDStore';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChaosBoxView } from '@/components/ChaosBoxView';
import { DailyPlanView } from '@/components/DailyPlanView';
import { ProjectsView } from '@/components/ProjectsView';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { ContextsView } from '@/components/ContextsView';
import { PomodoroTimerView } from '@/components/PomodoroTimerView';
import { AiClarifierView } from '@/components/AiClarifierView';
import { WeeklyReviewView } from '@/components/WeeklyReviewView';
import { FilteredListView } from '@/components/FilteredListView';
import { OrganizeTaskModal } from '@/components/OrganizeTaskModal';
import { NewProjectModal } from '@/components/NewProjectModal';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';
import { Task, Project } from '@/lib/types';
import { filterTasks, getTodayStr } from '@/lib/gtd-logic';
import { Timer, ArrowRight, X } from 'lucide-react';

export default function ChaosControlApp() {
  const {
    isLoaded,
    tasks,
    projects,
    folders,
    contexts,
    weeklyReviewCompletedDate,
    setWeeklyReviewCompletedDate,
    activeView,
    setActiveView,
    selectedProjectId,
    setSelectedProjectId,
    selectedContextId,
    setSelectedContextId,
    searchQuery,
    setSearchQuery,
    activePomodoroTask,
    setActivePomodoroTask,
    addChaosTask,
    deleteTask,
    toggleTask,
    organizeTask,
    addProject,
    updateProject,
    deleteProject,
    addBatchFromAI,
    resetToDefaultData,
    exportBackupJson,
    importBackupJson,
  } = useGTDStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [organizingTask, setOrganizingTask] = useState<Task | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isQuickCaptureModalOpen, setIsQuickCaptureModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger import file picker
  const handleTriggerImport = () => {
    importFileInputRef.current?.click();
  };

  const handleImportContent = (content: string) => {
    const success = importBackupJson(content);
    if (success) {
      alert('Backup do Chaos Control restaurado com sucesso!');
    } else {
      alert('Arquivo de backup inválido. Verifique o formato JSON.');
    }
  };

  // Keyboard shortcut: 'c' or 'n' opens quick capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only when not typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'c' || e.key === 'C') {
        setIsQuickCaptureModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter tasks by global search if search query exists
  const displayedTasks = searchQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.note?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  const handleStartPomodoro = (task: Task) => {
    setActivePomodoroTask(task);
    setActiveView('pomodoro');
  };

  const handleQuickAddForToday = (title: string) => {
    const todayStr = getTodayStr();
    const newTask = addChaosTask(title);
    if (newTask) {
      organizeTask(newTask.id, {
        status: 'next_action',
        dueDate: todayStr,
      });
    }
  };

  const handleAddTaskToProject = (projId: string, title: string) => {
    const newTask = addChaosTask(title);
    if (newTask) {
      organizeTask(newTask.id, {
        projectId: projId,
        status: 'next_action',
      });
    }
  };

  // Audit count for weekly review
  const projectsWithoutActions = projects.filter((p) => {
    if (p.status !== 'active') return false;
    const hasNext = tasks.some((t) => t.projectId === p.id && t.status !== 'completed');
    return !hasNext;
  }).length;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Carregando Chaos Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          setSearchQuery('');
        }}
        onOpenQuickCapture={() => setIsQuickCaptureModalOpen(true)}
        tasks={tasks}
        projects={projects}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onExport={exportBackupJson}
        onImport={handleTriggerImport}
        onReset={() => {
          if (confirm('Restaurar dados de exemplo do Chaos Control? Suas alterações locais serão redefinidas.')) {
            resetToDefaultData();
          }
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenQuickCapture={() => setIsQuickCaptureModalOpen(true)}
          onImportFile={handleImportContent}
          importInputRef={importFileInputRef}
        />

        {/* Scrollable Main Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Active View Switcher */}
          {activeView === 'chaos_box' && (
            <ChaosBoxView
              tasks={displayedTasks}
              projects={projects}
              contexts={contexts}
              onAddTask={addChaosTask}
              onToggleTask={toggleTask}
              onOrganizeTask={setOrganizingTask}
              onDeleteTask={deleteTask}
              onStartPomodoro={handleStartPomodoro}
              onNavigateToAI={() => setActiveView('ai_clarifier')}
            />
          )}

          {activeView === 'daily_plan' && (
            <DailyPlanView
              tasks={displayedTasks}
              projects={projects}
              contexts={contexts}
              onToggleTask={toggleTask}
              onOrganizeTask={setOrganizingTask}
              onDeleteTask={deleteTask}
              onStartPomodoro={handleStartPomodoro}
              onQuickAddForToday={handleQuickAddForToday}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={displayedTasks}
              folders={folders}
              contexts={contexts}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onSelectProject={setDetailProject}
              onUpdateProjectStatus={(id, status) => updateProject(id, { status })}
            />
          )}

          {activeView === 'contexts' && (
            <ContextsView
              contexts={contexts}
              tasks={displayedTasks}
              projects={projects}
              selectedContextId={selectedContextId}
              onSelectContext={setSelectedContextId}
              onToggleTask={toggleTask}
              onOrganizeTask={setOrganizingTask}
              onDeleteTask={deleteTask}
              onStartPomodoro={handleStartPomodoro}
            />
          )}

          {activeView === 'waiting' && (
            <FilteredListView
              type="waiting"
              tasks={displayedTasks}
              projects={projects}
              contexts={contexts}
              onToggleTask={toggleTask}
              onOrganizeTask={setOrganizingTask}
              onDeleteTask={deleteTask}
              onStartPomodoro={handleStartPomodoro}
              onOpenQuickCapture={() => setIsQuickCaptureModalOpen(true)}
            />
          )}

          {activeView === 'someday' && (
            <FilteredListView
              type="someday"
              tasks={displayedTasks}
              projects={projects}
              contexts={contexts}
              onToggleTask={toggleTask}
              onOrganizeTask={setOrganizingTask}
              onDeleteTask={deleteTask}
              onStartPomodoro={handleStartPomodoro}
              onOpenQuickCapture={() => setIsQuickCaptureModalOpen(true)}
            />
          )}

          {activeView === 'pomodoro' && (
            <PomodoroTimerView
              activeTask={activePomodoroTask}
              onClearActiveTask={() => setActivePomodoroTask(null)}
              onCompleteTask={(id) => {
                toggleTask(id);
                setActivePomodoroTask(null);
              }}
            />
          )}

          {activeView === 'ai_clarifier' && (
            <AiClarifierView
              onImportBatch={(project, actions) => {
                addBatchFromAI(project, actions);
              }}
              onNavigateToChaosBox={() => setActiveView('chaos_box')}
            />
          )}

          {activeView === 'weekly_review' && (
            <WeeklyReviewView
              completedDate={weeklyReviewCompletedDate}
              onMarkReviewCompleted={(date) => setWeeklyReviewCompletedDate(date)}
              onNavigateToView={(v) => setActiveView(v)}
              inboxCount={filterTasks(tasks, 'inbox').length}
              projectsWithoutNextActions={projectsWithoutActions}
              waitingCount={filterTasks(tasks, 'waiting').length}
            />
          )}
        </main>

        {/* Floating Mini Pomodoro Bar when navigating elsewhere */}
        {activePomodoroTask && activeView !== 'pomodoro' && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-lg">
            <div className="flex items-center gap-2 truncate pr-2">
              <Timer className="w-4 h-4 animate-spin-slow shrink-0" />
              <span className="truncate">
                Foco Ativo: <strong>{activePomodoroTask.title}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('pomodoro')}
                className="flex items-center gap-1 bg-slate-950 text-white px-2.5 py-1 rounded-lg text-xs cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <span>Ver Timer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setActivePomodoroTask(null)}
                title="Fechar barra"
                className="p-1 hover:bg-amber-600 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <OrganizeTaskModal
        task={organizingTask}
        projects={projects}
        contexts={contexts}
        isOpen={!!organizingTask}
        onClose={() => setOrganizingTask(null)}
        onSave={organizeTask}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        folders={folders}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={addProject}
      />

      <ProjectDetailModal
        project={detailProject}
        folder={folders.find((f) => f.id === detailProject?.folderId)}
        tasks={tasks}
        contexts={contexts}
        isOpen={!!detailProject}
        onClose={() => setDetailProject(null)}
        onToggleTask={toggleTask}
        onOrganizeTask={setOrganizingTask}
        onDeleteTask={deleteTask}
        onStartPomodoro={handleStartPomodoro}
        onAddTaskToProject={handleAddTaskToProject}
        onUpdateProjectStatus={(id, status) => {
          updateProject(id, { status });
          if (detailProject && detailProject.id === id) {
            setDetailProject((prev) => (prev ? { ...prev, status } : null));
          }
        }}
        onDeleteProject={deleteProject}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureModalOpen}
        onClose={() => setIsQuickCaptureModalOpen(false)}
        onAdd={addChaosTask}
      />
    </div>
  );
}
