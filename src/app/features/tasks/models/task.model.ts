export interface CreateTaskPayload {
  title: string;
  description?: string;
  category?: string;
  habitId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  habitId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category?: string | null;
  habitId?: string | null;
  habit?: { id: string; name: string; description?: string | null } | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
  /** Completion log created when this task was marked complete (API includes `log` relation). */
  log?: { id: string; name?: string | null } | null;
}
