'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Folder,
  Tag,
  Clock,
  Check,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface AiClarifierViewProps {
  onImportBatch: (
    project: { title: string; outcome: string },
    actions: Array<{
      title: string;
      suggestedContext?: string;
      suggestedPriority?: string;
      estimatedMinutes?: number;
      note?: string;
    }>
  ) => void;
  onNavigateToChaosBox: () => void;
}

interface ClarifiedResult {
  summary: string;
  suggestedProject: {
    title: string;
    outcome: string;
  };
  actions: Array<{
    title: string;
    suggestedContext: string;
    suggestedPriority: string;
    estimatedMinutes: number;
    note?: string;
  }>;
}

export function AiClarifierView({
  onImportBatch,
  onNavigateToChaosBox,
}: AiClarifierViewProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClarifiedResult | null>(null);
  const [imported, setImported] = useState(false);

  const samplePrompts = [
    {
      title: 'Lançamento de Produto Digital',
      text: 'Preciso lançar o e-book na próxima quinta. Falta revisar o capítulo 4, comprar domínio na Hostinger, configurar o pixel do Facebook e da Meta, criar a página de vendas no Elementor, gravar o vídeo de boas-vindas e ligar pro Carlos para fechar a comissão de afiliado.',
    },
    {
      title: 'Finanças e Auditoria Pessoal',
      text: 'Auditar extratos dos últimos 3 meses do Nubank e Itaú, cancelar as assinaturas de streamings que não uso, ligar para o contador para entender a guia do DAS, comprar uma pasta sanfonada na papelaria e criar a planilha de orçamento para o próximo trimestre.',
    },
    {
      title: 'Reforma do Escritório',
      text: 'Pintar a parede de trás da bancada de cinza escuro, ir à Leroy Merlin comprar fita de LED e organizadores de cabos, ligar pro eletricista para puxar mais 2 tomadas 220v, doar os livros antigos e cotar uma cadeira ergonômica na Cavaletti.',
    },
  ];

  const handleClarify = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setImported(false);

    try {
      const res = await fetch('/api/clarify-chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('Erro ao conectar com a inteligência artificial. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!result) return;
    onImportBatch(result.suggestedProject, result.actions);
    setImported(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-purple-200 mb-2 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Estruturação Inteligente com Gemini</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Despejo Mental com IA (Chaos Clarifier)
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-purple-100/90 max-w-xl">
          Cole transcrições de reuniões, pensamentos desordenados ou áudios rápidos. O Gemini analisa os princípios GTD e decompõe tudo em projetos, contextos e próximas ações.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label htmlFor="brain-dump-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Cole aqui seu fluxo de pensamentos ou lista caótica:
          </label>
          <textarea
            id="brain-dump-input"
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Preciso organizar a viagem da semana que vem, comprar passagens no site da Latam, renovar passaporte, pedir indicação de hotel pro Renato..."
            className="w-full p-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Quick sample chips */}
        <div>
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Ou teste com um exemplo pronto:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(sample.text)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-left"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={handleClarify}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer ${
              loading || !input.trim()
                ? 'bg-slate-400 opacity-60 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando com Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Estruturar em GTD</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Structured Result Display */}
      {result && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-lg space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Resultado Estruturado pela IA
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {result.summary}
              </h3>
            </div>

            {imported ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                <Check className="w-4 h-4" />
                <span>Importado com sucesso!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Importar Tudo para Chaos Control</span>
              </button>
            )}
          </div>

          {/* Project Box */}
          {result.suggestedProject && (
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Folder className="w-4 h-4" />
                <span>Projeto Sugerido</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {result.suggestedProject.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                <strong>Resultado Esperado (Outcome):</strong> {result.suggestedProject.outcome}
              </p>
            </div>
          )}

          {/* Actions List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Próximas Ações Identificadas ({result.actions.length})
            </h4>
            <div className="space-y-2">
              {result.actions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {act.title}
                    </p>
                    {act.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                      <Tag className="w-3 h-3" />
                      {act.suggestedContext}
                    </span>

                    <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {act.estimatedMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {imported && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onNavigateToChaosBox}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Ir para a Caixa do Caos e Projetos para ver suas novas tarefas →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
