import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Texto de entrada é obrigatório' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Smart local heuristic fallback if API key is not configured
      const lines = input
        .split('\n')
        .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

      const items = lines.map((line, idx) => ({
        title: line,
        suggestedContext: line.toLowerCase().includes('comprar') || line.toLowerCase().includes('rua')
          ? '@rua / compras'
          : line.toLowerCase().includes('ligar') || line.toLowerCase().includes('falar')
          ? '@celular / ligação'
          : line.toLowerCase().includes('ler') || line.toLowerCase().includes('artigo')
          ? '@leitura / foco'
          : '@computador',
        suggestedPriority: idx === 0 ? 'urgent' : 'high',
        estimatedMinutes: 25,
        targetOutcome: `Concluir: ${line}`,
      }));

      return NextResponse.json({
        summary: 'Despejo mental analisado e estruturado localmente.',
        suggestedProject: {
          title: lines[0] ? `Projeto: ${lines[0].slice(0, 40)}` : 'Novo Projeto Estruturado',
          outcome: 'Todas as ações identificadas foram distribuídas e executadas.',
        },
        actions: items,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Você é um especialista em produtividade e metodologia GTD (Getting Things Done) para o aplicativo Chaos Control.
O usuário digitou um despejo mental rápido (anotações caóticas, pensamentos soltos, e-mail ou lista desordenada):
"""
${input}
"""

Analise esse texto e estruture em ações claras, acionáveis no formato GTD.
Responda EXCLUSIVAMENTE em formato JSON com o seguinte schema:
{
  "summary": "Breve síntese de 1 frase do que foi capturado",
  "suggestedProject": {
    "title": "Título claro do Projeto ou Meta (ex: Lançar Site, Organizar Escritório)",
    "outcome": "Resultado específico desejado (GTD Outcome: Como sei que está pronto?)"
  },
  "actions": [
    {
      "title": "Ação concreta começando com verbo no infinitivo (ex: Pesquisar preços de domínios)",
      "suggestedContext": "@computador" | "@escritório" | "@celular / ligação" | "@rua / compras" | "@casa" | "@reuniões" | "@leitura / foco",
      "suggestedPriority": "urgent" | "high" | "medium" | "low",
      "estimatedMinutes": 15 | 30 | 45 | 60,
      "note": "Detalhe adicional ou dica de execução rápida"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error clarifying chaos input:', error);
    return NextResponse.json(
      { error: 'Falha ao processar com IA. Tente novamente ou use a criação manual.' },
      { status: 500 }
    );
  }
}
