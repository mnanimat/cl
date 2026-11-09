import { Task, Project, Folder, ContextItem, GTDAppState } from './types';

export function formatDateToIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayStr(referenceDate: Date = new Date()): string {
  return formatDateToIsoDay(referenceDate);
}

export function getTomorrowStr(referenceDate: Date = new Date()): string {
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToIsoDay(tomorrow);
}

export function isTaskOverdue(task: Task, todayStr: string = getTodayStr()): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  return task.dueDate < todayStr;
}

export function isTaskToday(task: Task, todayStr: string = getTodayStr()): boolean {
  return task.dueDate === todayStr;
}

export function isTaskTomorrow(task: Task, tomorrowStr: string = getTomorrowStr()): boolean {
  return task.dueDate === tomorrowStr;
}

export function isTaskUpcoming(task: Task, tomorrowStr: string = getTomorrowStr()): boolean {
  if (!task.dueDate) return false;
  return task.dueDate > tomorrowStr;
}

export function filterTasks(
  tasks: Task[],
  filter: 'inbox' | 'today' | 'tomorrow' | 'upcoming' | 'waiting' | 'someday' | 'completed' | 'all',
  options: {
    todayStr?: string;
    tomorrowStr?: string;
    projectId?: string;
    contextId?: string;
    searchQuery?: string;
  } = {}
): Task[] {
  const today = options.todayStr || getTodayStr();
  const tomorrow = options.tomorrowStr || getTomorrowStr();
  const query = (options.searchQuery || '').trim().toLowerCase();

  return tasks.filter((task) => {
    // Project filter if specified
    if (options.projectId && task.projectId !== options.projectId) {
      return false;
    }

    // Context filter if specified
    if (options.contextId && task.contextId !== options.contextId) {
      return false;
    }

    // Text search query
    if (query) {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchNote = task.note ? task.note.toLowerCase().includes(query) : false;
      const matchWaiting = task.waitingForWho ? task.waitingForWho.toLowerCase().includes(query) : false;
      if (!matchTitle && !matchNote && !matchWaiting) return false;
    }

    // Primary view tab filtering
    switch (filter) {
      case 'inbox':
        return task.status === 'inbox';
      case 'today':
        if (task.status === 'completed') {
          // Show tasks completed today
          return task.completedAt?.startsWith(today);
        }
        return (
          (task.dueDate === today || isTaskOverdue(task, today)) &&
          task.status !== 'someday' &&
          task.status !== 'inbox'
        );
      case 'tomorrow':
        return task.dueDate === tomorrow && task.status !== 'completed' && task.status !== 'inbox';
      case 'upcoming':
        return isTaskUpcoming(task, tomorrow) && task.status !== 'completed' && task.status !== 'inbox';
      case 'waiting':
        return task.status === 'waiting';
      case 'someday':
        return task.status === 'someday';
      case 'completed':
        return task.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });
}

export function calculateProjectProgress(
  projectId: string,
  tasks: Task[]
): { total: number; completed: number; percentage: number } {
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  if (projectTasks.length === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  const completed = projectTasks.filter((t) => t.status === 'completed').length;
  const percentage = Math.round((completed / projectTasks.length) * 100);
  return {
    total: projectTasks.length,
    completed,
    percentage,
  };
}

export function calculateContextCounts(
  contexts: ContextItem[],
  tasks: Task[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ctx of contexts) {
    counts[ctx.id] = 0;
  }
  for (const task of tasks) {
    if (task.contextId && task.status !== 'completed' && task.status !== 'someday') {
      counts[task.contextId] = (counts[task.contextId] || 0) + 1;
    }
  }
  return counts;
}

export function toggleTaskCompleted(task: Task, nowIso: string = new Date().toISOString()): Task {
  if (task.status === 'completed') {
    return {
      ...task,
      status: task.projectId ? 'next_action' : 'inbox',
      completedAt: undefined,
    };
  } else {
    return {
      ...task,
      status: 'completed',
      completedAt: nowIso,
    };
  }
}

export function processChaosItem(
  task: Task,
  updates: Partial<Pick<Task, 'title' | 'note' | 'projectId' | 'contextId' | 'dueDate' | 'priority' | 'status' | 'waitingForWho' | 'estimatedMinutes'>>
): Task {
  const newStatus = updates.status || (updates.projectId || updates.dueDate || updates.contextId ? 'next_action' : task.status);
  return {
    ...task,
    ...updates,
    status: newStatus,
  };
}

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'f-work', name: 'Trabalho & Negócios', color: '#3B82F6', icon: 'Briefcase' },
  { id: 'f-personal', name: 'Pessoal & Família', color: '#10B981', icon: 'User' },
  { id: 'f-growth', name: 'Estudos & Desenvolvimento', color: '#8B5CF6', icon: 'BookOpen' },
  { id: 'f-finance', name: 'Finanças & Projetos Futuros', color: '#F59E0B', icon: 'DollarSign' },
];

export const INITIAL_CONTEXTS: ContextItem[] = [
  { id: 'ctx-comp', name: '@computador', color: '#0284C7', icon: 'Laptop', description: 'Trabalho focado no navegador e software' },
  { id: 'ctx-escrit', name: '@escritório', color: '#4F46E5', icon: 'Building2', description: 'Atividades presenciais na mesa ou escritório' },
  { id: 'ctx-fone', name: '@celular / ligação', color: '#16A34A', icon: 'Phone', description: 'Ligações, mensagens rápidas e follow-ups' },
  { id: 'ctx-rua', name: '@rua / compras', color: '#D97706', icon: 'Car', description: 'Recados externos, mercado e compromissos' },
  { id: 'ctx-casa', name: '@casa', color: '#EC4899', icon: 'Home', description: 'Manutenção da casa, bem-estar e lazer familiar' },
  { id: 'ctx-reuniao', name: '@reuniões', color: '#9333EA', icon: 'Users', description: 'Assuntos para pautas com sócios e equipe' },
  { id: 'ctx-leitura', name: '@leitura / foco', color: '#0D9488', icon: 'BookOpen', description: 'Livros, artigos técnicos e pesquisas profundas' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Lançamento do Portal Web 2.0',
    description: 'Finalizar desenvolvimento front-end, SEO e infraestrutura de produção.',
    folderId: 'f-work',
    status: 'active',
    targetOutcome: 'Portal no ar recebendo clientes com tempo de carregamento < 1.2s e notas 100% no Lighthouse.',
    color: '#3B82F6',
    icon: 'Rocket',
    dueDate: getTomorrowStr(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Planejamento Financeiro Trimestral',
    description: 'Auditoria de despesas, conciliação e projeção de fluxo de caixa.',
    folderId: 'f-finance',
    status: 'active',
    targetOutcome: 'Planilha orçamentária finalizada e reserva de emergência aportada.',
    color: '#F59E0B',
    icon: 'TrendingUp',
    dueDate: getTodayStr(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    title: 'Rotina de Saúde & Treino 5x/sem',
    description: 'Manter constância nos treinos e planejar alimentação da semana.',
    folderId: 'f-personal',
    status: 'active',
    targetOutcome: '5 treinos semanais concluídos e exame de rotina agendado.',
    color: '#10B981',
    icon: 'Heart',
    dueDate: getTomorrowStr(),
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-inbox-1',
    title: 'Pesquisar fornecedor de hospedagem e DNS para novo domínio',
    note: 'Comparar Vercel, Cloudflare Pages e Google Cloud Run.',
    status: 'inbox',
    priority: 'high',
    estimatedMinutes: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-inbox-2',
    title: 'Idéia: criar template de onboarding interativo em vídeo',
    note: 'Ver exemplos no site da Linear e Notion.',
    status: 'inbox',
    priority: 'medium',
    estimatedMinutes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-today-1',
    title: 'Revisar métricas de conversão e aprovar design final da landing page',
    note: 'Conferir contraste no mobile e tempo de resposta.',
    status: 'next_action',
    projectId: 'proj-1',
    contextId: 'ctx-comp',
    dueDate: getTodayStr(),
    priority: 'urgent',
    estimatedMinutes: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-today-2',
    title: 'Conferir extrato bancário e categorizar notas fiscais de serviços',
    note: 'Verificar pagamentos recorrentes de SaaS.',
    status: 'next_action',
    projectId: 'proj-2',
    contextId: 'ctx-escrit',
    dueDate: getTodayStr(),
    priority: 'high',
    estimatedMinutes: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-tmrw-1',
    title: 'Configurar scripts de analytics e tags de evento no Google Tag Manager',
    status: 'next_action',
    projectId: 'proj-1',
    contextId: 'ctx-comp',
    dueDate: getTomorrowStr(),
    priority: 'high',
    estimatedMinutes: 40,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-waiting-1',
    title: 'Aguardando aprovação do contrato de prestação pelo setor jurídico',
    note: 'Enviado para Dr. Marcelo na terça-feira.',
    status: 'waiting',
    projectId: 'proj-1',
    contextId: 'ctx-fone',
    waitingForWho: 'Dr. Marcelo (Jurídico)',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-someday-1',
    title: 'Aprender Rust para microserviços de alta performance',
    note: 'Comprar livro The Rust Programming Language.',
    status: 'someday',
    contextId: 'ctx-leitura',
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
];
