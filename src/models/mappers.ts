import { Work, WorkStatus, WorkCategory, WorkPriority } from './work.model';
import { Note } from './note.model';

/**
 * Mappers to bridge the SQLite Database layer and the Domain model layer.
 * This guarantees that changes to DB schema fields do not break application business logic.
 */

// 1. Works Mappers
export const mapWorkRowToDomain = (
  row: any,
  images: any[] = [],
  links: any[] = []
): Work => {
  return {
    id: row.id,
    title: row.title,
    reference: row.reference || undefined,
    description: row.description || undefined,
    deadline: row.deadline ? new Date(row.deadline) : undefined,
    status: row.status as WorkStatus,
    category: row.category as WorkCategory,
    priority: (row.priority as WorkPriority) || WorkPriority.MEDIUM,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    images: images.map(img => ({
      id: img.id,
      workId: img.work_id,
      imagePath: img.image_path,
    })),
    links: links.map(link => ({
      id: link.id,
      workId: link.work_id,
      url: link.url,
      title: link.title || undefined,
    })),
  };
};

export const mapWorkDomainToDb = (work: Work): any => {
  return {
    id: work.id,
    title: work.title,
    reference: work.reference || null,
    priority: work.priority,
    description: work.description || null,
    deadline: work.deadline ? work.deadline.getTime() : null,
    status: work.status,
    category: work.category,
    created_at: work.createdAt.getTime(),
    updated_at: work.updatedAt.getTime(),
  };
};

// 2. Notes Mappers
export const mapNoteRowToDomain = (row: any, images: any[] = []): Note => {
  return {
    id: row.id,
    title: row.title || undefined,
    content: row.content,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    images: images.map(img => ({
      id: img.id,
      noteId: img.note_id,
      imagePath: img.image_path,
    })),
  };
};

export const mapNoteDomainToDb = (note: Note): any => {
  return {
    id: note.id,
    title: note.title || null,
    content: note.content,
    created_at: note.createdAt.getTime(),
    updated_at: note.updatedAt.getTime(),
  };
};
