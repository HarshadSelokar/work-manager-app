export enum WorkStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum WorkCategory {
  TODAY = 'today',
  OTHER = 'other',
}

export enum WorkPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface WorkImage {
  id: string;
  workId: string;
  imagePath: string;
}

export interface WorkLink {
  id: string;
  workId: string;
  url: string;
  title?: string;
}

export interface Work {
  id: string;
  title: string;
  reference?: string;
  description?: string;
  deadline?: Date;
  status: WorkStatus;
  category: WorkCategory;
  priority: WorkPriority;
  createdAt: Date;
  updatedAt: Date;
  images: WorkImage[];
  links: WorkLink[];
}
