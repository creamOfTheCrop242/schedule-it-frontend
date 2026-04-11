export enum LogPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export const MOOD_PRESETS = [
  'Happy',
  'Calm',
  'Anxious',
  'Focused',
  'Tired',
  'Energized',
  'Stressed',
  'Peaceful',
  'Motivated',
  'Overwhelmed',
  'Grateful',
] as const;
export const MOOD_CUSTOM = 'Custom';

export interface Log {
  id: string;
  name: string;
  description?: string;
  surroundings?: string;
  mood?: string;
  priority: LogPriority;
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  completedDate?: Date;
  dependencyLog?: Log;
  notes?: Note[];
  deletedAt?: Date;
}

export interface AddLog extends Omit<Log, 'id'> {}

export interface Note {
  id: string;
  content: string;
  log?: Log;
}

export interface CompleteLogModel {
  id: string;
  completed: boolean;
}
