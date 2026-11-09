import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
        <Compass className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">404 - Página Não Encontrada</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        Esta rota não existe no Chaos Control. Retorne para a visualização principal do seu gerenciador GTD.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Início</span>
      </Link>
    </div>
  );
}
