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
  description?: string;
  status: WorkStatus;
  category: WorkCategory;
  priority: WorkPriority; // Domain-only property for now, demonstrating schema decoupling
  createdAt: Date; // Domain uses Date object instead of raw number timestamps
  updatedAt: Date;
  images: WorkImage[];
  links: WorkLink[];
}
