import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Pause,
  Play,
} from 'lucide-react';
import React from 'react';

import { Project } from '@/ui/features/project/components/ProjectListItem';

export const statusDetails: Record<
  Project['status'],
  { label: string; icon: React.ElementType; colorClass: string }
> = {
  active: {
    label: 'Ativo',
    icon: Play,
    colorClass: 'text-green-500 dark:text-green-400',
  },
  paused: {
    label: 'Pausado',
    icon: Pause,
    colorClass: 'text-yellow-500 dark:text-yellow-400',
  },
  planning: {
    label: 'Planejamento',
    icon: Clock,
    colorClass: 'text-blue-500 dark:text-blue-400',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    colorClass: 'text-slate-500 dark:text-slate-400',
  },
  archived: {
    label: 'Arquivado',
    icon: AlertTriangle,
    colorClass: 'text-red-500 dark:text-red-400',
  },
};