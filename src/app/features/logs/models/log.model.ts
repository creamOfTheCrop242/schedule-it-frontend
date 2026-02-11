export enum LogPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Log {
  id: string;
  name: string;
  description?: string;
  priority: LogPriority;
  startDate?: Date;
  dueDate?: Date;
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
