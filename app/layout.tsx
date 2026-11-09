import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Chaos Control Web - Gestão de Projetos e Tarefas GTD',
  description: 'Aplicativo web de produtividade e gerenciamento GTD com Caixa do Caos, Projetos, Contextos e Plano Diário.',
  openGraph: {
    title: 'Chaos Control Web - Gestão de Projetos e Tarefas GTD',
    description: 'Aplicativo web de produtividade e gerenciamento GTD com Caixa do Caos, Projetos, Contextos e Plano Diário.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chaos Control Web - Gestão de Projetos e Tarefas GTD',
    description: 'Aplicativo web de produtividade e gerenciamento GTD com Caixa do Caos, Projetos, Contextos e Plano Diário.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
