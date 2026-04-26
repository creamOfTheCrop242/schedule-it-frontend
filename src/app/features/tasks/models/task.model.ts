export interface CreateTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
  /** Completion log created when this task was marked complete (API includes `log` relation). */
  log?: { id: string; name?: string | null } | null;
}
