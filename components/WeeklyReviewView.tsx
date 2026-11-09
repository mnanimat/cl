'use client';

import React, { useState } from 'react';
import {
  CheckCheck,
  CheckCircle2,
  Inbox,
  Calendar,
  FolderKanban,
  Clock,
  Archive,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCompleteSound } from '@/lib/audio';

interface WeeklyReviewViewProps {
  completedDate?: string;
  onMarkReviewCompleted: (date: string) => void;
  onNavigateToView: (view: string) => void;
  inboxCount: number;
  projectsWithoutNextActions: number;
  waitingCount: number;
}

export function WeeklyReviewView({
  completedDate,
  onMarkReviewCompleted,
  onNavigateToView,
  inboxCount,
  projectsWithoutNextActions,
  waitingCount,
}: WeeklyReviewViewProps) {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const steps = [
    {
      id: 1,
      title: '1. Despejo Mental (Mind Sweep)',
      description: 'Esvazie sua mente, papéis de mesa, recibos, anotações soltas e e-mails não lidos, enviando tudo para a Caixa do Caos.',
      icon: Inbox,
      view: 'chaos_box',
      badge: `${inboxCount} itens pendentes`,
    },
    {
      id: 2,
      title: '2. Esvaziar a Caixa do Caos (Inbox Zero)',
      description: 'Processe item por item. O que levar menos de 2 minutos faça já. O resto transforme em Próxima Ação, Projeto ou Algum Dia.',
      icon: CheckCircle2,
      view: 'chaos_box',
    },
    {
      id: 3,
      title: '3. Revisar o Calendário (Passado & Futuro)',
      description: 'Veja os últimos 7 dias para recuperar pendências esquecidas e os próximos 14 dias para antecipar reuniões e prazos.',
      icon: Calendar,
      view: 'daily_plan',
    },
    {
      id: 4,
      title: '4. Auditar Projetos Ativos',
      description: 'Verifique se todo projeto ativo possui pelo menos uma Próxima Ação definida. Sem isso, o projeto estagna.',
      icon: FolderKanban,
      view: 'projects',
      alert: projectsWithoutNextActions > 0 ? `${projectsWithoutNextActions} projetos sem próxima ação!` : undefined,
    },
    {
      id: 5,
      title: '5. Revisar "Em Espera" e "Algum Dia / Talvez"',
      description: 'Faça follow-up com terceiros sobre entregas atrasadas e reavalie ideias da lista incubada para ativar novos projetos.',
      icon: Clock,
      view: 'waiting',
      badge: `${waitingCount} itens em espera`,
    },
  ];

  const toggleStep = (id: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allCompleted = steps.every((s) => checkedSteps[s.id]);

  const handleFinishReview = () => {
    const today = new Date().toISOString();
    onMarkReviewCompleted(today);
    playCompleteSound();
    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100 mb-2 border border-white/20">
          <CheckCheck className="w-3.5 h-3.5" />
          <span>O Hábito de Ouro da Produtividade</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Revisão Semanal GTD (Weekly Review)
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
          Como David Allen ensina: sem a revisão semanal, a vida vira um incêndio constante. Dedique 20 minutos uma vez por semana para recuperar o controle total do seu sistema.
        </p>

        {completedDate && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Última revisão concluída em: {new Date(completedDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      {/* Review Steps Checklist */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = !!checkedSteps[step.id];

          return (
            <div
              key={step.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  aria-label={`Concluir etapa ${step.title}`}
                  className={`mt-1 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isDone
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {step.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      {step.badge && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {step.badge}
                        </span>
                      )}

                      {step.alert && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800">
                          {step.alert}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onNavigateToView(step.view)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer ml-2"
                      >
                        <span>Abrir tela</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion CTA */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Finalizar Revisão Semanal
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {allCompleted
              ? 'Todas as 5 etapas foram checadas! Você está pronto para fechar a revisão.'
              : 'Complete os passos acima para registrar a conclusão desta semana.'}
          </p>
        </div>

        <button
          type="button"
          disabled={!allCompleted}
          onClick={handleFinishReview}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer ${
            allCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Registrar Revisão Semanal Completa</span>
        </button>
      </div>
    </div>
  );
}
