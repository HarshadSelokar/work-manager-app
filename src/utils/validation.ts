import { Work } from '@models/work.model';
import { Note } from '@models/note.model';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Reusable validation constraints enforcing data integrity at the domain level.
 */

// Helper to validate basic URL formats
const isValidUrl = (url: string): boolean => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  return !!pattern.test(url);
};

export const validateWork = (work: Partial<Work>): void => {
  if (!work.title || work.title.trim() === '') {
    throw new ValidationError('Task title is required and cannot be empty.');
  }

  if (work.title.length > 100) {
    throw new ValidationError('Task title cannot exceed 100 characters.');
  }

  if (work.description && work.description.length > 500) {
    throw new ValidationError('Task description cannot exceed 500 characters.');
  }

  // Validate links if present
  if (work.links && work.links.length > 0) {
    for (const link of work.links) {
      if (!link.url || link.url.trim() === '') {
        throw new ValidationError('Link URL cannot be empty.');
      }
      if (!isValidUrl(link.url)) {
        throw new ValidationError(`Link URL is invalid: "${link.url}".`);
      }
    }
  }

  // Validate images if present
  if (work.images && work.images.length > 0) {
    for (const img of work.images) {
      if (!img.imagePath || img.imagePath.trim() === '') {
        throw new ValidationError('Attachment image path cannot be empty.');
      }
    }
  }
};

export const validateNote = (note: Partial<Note>): void => {
  if (!note.content || note.content.trim() === '') {
    throw new ValidationError('Note content is required and cannot be empty.');
  }

  if (note.content.length > 2000) {
    throw new ValidationError('Note content cannot exceed 2000 characters.');
  }

  if (note.title && note.title.length > 100) {
    throw new ValidationError('Note title cannot exceed 100 characters.');
  }

  // Validate images if present
  if (note.images && note.images.length > 0) {
    for (const img of note.images) {
      if (!img.imagePath || img.imagePath.trim() === '') {
        throw new ValidationError('Note image path cannot be empty.');
      }
    }
  }
};
