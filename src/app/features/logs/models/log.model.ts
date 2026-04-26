export const MOOD_PRESETS = [
  'Happy',
  'Calm',
  'Anxious',
  'Focused',
  'Tired',
  'Energized',
  'Stressed',
  'Angry',
  'Sad',
  'Numb',
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
  category?: string;
  startTime?: Date;
  endTime?: Date;
  completedDate?: Date;
  dependencyLog?: Log;
  notes?: Note[];
  deletedAt?: Date;
  habitId?: string;
  habit?: { id: string; name: string; description?: string | null } | null;
  /** Set on GET log detail when this log was created by completing a task. */
  sourceTask?: { id: string; title: string } | null;
}

/** POST/PATCH body fields (no relation graphs). */
export type AddLog = Omit<
  Log,
  'id' | 'dependencyLog' | 'notes' | 'habit' | 'sourceTask'
>;

export interface Note {
  id: string;
  content: string;
  log?: Log;
}

