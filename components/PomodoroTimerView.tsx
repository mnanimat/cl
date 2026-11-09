'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task } from '@/lib/types';
import { playTimerChime } from '@/lib/audio';
import confetti from 'canvas-confetti';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Target,
  Coffee,
} from 'lucide-react';

interface PomodoroTimerViewProps {
  activeTask: Task | null;
  onClearActiveTask: () => void;
  onCompleteTask: (taskId: string) => void;
}

export function PomodoroTimerView({
  activeTask,
  onClearActiveTask,
  onCompleteTask,
}: PomodoroTimerViewProps) {
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessionsToday, setCompletedSessionsToday] = useState<number>(0);

  const totalDuration = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  }[mode];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectMode = (newMode: 'work' | 'short_break' | 'long_break') => {
    setMode(newMode);
    const duration = {
      work: 25 * 60,
      short_break: 5 * 60,
      long_break: 15 * 60,
    }[newMode];
    setTimeLeft(duration);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);

            if (soundEnabled) {
              playTimerChime();
            }

            if (mode === 'work') {
              setCompletedSessionsToday((c) => c + 1);
              try {
                confetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              } catch {
                // ignore
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled]);

  const toggleRunning = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-amber-100 mb-2 border border-white/20">
          <Timer className="w-3.5 h-3.5" />
          <span>Foco & Execução Contínua</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Timer de Foco Pomodoro
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-amber-100/90 max-w-md mx-auto">
          25 minutos de imersão total sem interrupções. Desligue notificações e entre em estado de fluxo.
        </p>
      </div>

      {/* Active task banner if selected */}
      {activeTask && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
              <Target className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Foco Vinculado
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {activeTask.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onCompleteTask(activeTask.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluir</span>
            </button>
            <button
              type="button"
              onClick={onClearActiveTask}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Desvincular
            </button>
          </div>
        </div>
      )}

      {/* Main Timer Display Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        {/* Mode selector pills */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
          <button
            type="button"
            onClick={() => selectMode('work')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'work'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Foco (25 min)
          </button>
          <button
            type="button"
            onClick={() => selectMode('short_break')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pausa Curta (5 min)
          </button>
          <button
            type="button"
            onClick={() => selectMode('long_break')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pausa Longa (15 min)
          </button>
        </div>

        {/* Digital Countdown Display */}
        <div className="my-6">
          <div
            className={`text-7xl sm:text-8xl font-black tracking-tight font-mono transition-colors ${
              isRunning ? 'text-amber-500 dark:text-amber-400 animate-pulse-slow' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {formattedTime}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium uppercase tracking-wider">
            {isRunning ? 'Sessão em andamento... Mantenha o foco!' : 'Pressione Iniciar para começar'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-8">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleRunning}
            aria-label={isRunning ? 'Pausar timer' : 'Iniciar timer'}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Iniciar Foco</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar timer"
            title="Reiniciar timer"
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label={soundEnabled ? 'Silenciar som' : 'Ativar som'}
            title={soundEnabled ? 'Som ativado' : 'Som silenciado'}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>
        </div>

        {/* Stats footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              <strong>{completedSessionsToday}</strong> sessões concluídas hoje
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-500" />
            <span>Pausas recomendadas a cada 4 ciclos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
