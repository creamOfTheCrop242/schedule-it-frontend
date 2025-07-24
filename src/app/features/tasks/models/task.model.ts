export interface Task {
  id: string;
  name: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  startDate?: Date;
  dueDate?: Date;
  completed: boolean;
  completedDate?: Date;
  dependencyTask?: Task;
  notes?: Note[];
  deletedAt?: Date;
}

export interface AddTask extends Omit<Task, 'id'> {}

// Related interfaces for dependencies
export interface Note {
  id: string;
  content: string;
  task?: Task;
}

export interface CompleteTaskModel {
  id: string;
  completed: boolean;
}
