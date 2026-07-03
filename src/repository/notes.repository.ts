import { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { getDatabase } from '../database/database';
import { Note, mapNoteRowToDomain, mapNoteDomainToDb } from '@models/index';
import { validateNote } from '@utils/validation';

export class NotesRepository {
  private db: QuickSQLiteConnection;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Validates and inserts a Note domain model, mapping dates to integers.
   */
  create(note: Note): void {
    // 1. Validate inputs before writing to database
    validateNote(note);

    // 2. Map domain model to DB parameters
    const dbObj = mapNoteDomainToDb(note);

    this.db.execute('BEGIN TRANSACTION;');
    try {
      this.db.execute(
        'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?);',
        [dbObj.id, dbObj.title, dbObj.content, dbObj.created_at, dbObj.updated_at]
      );

      if (note.images && note.images.length > 0) {
        for (const img of note.images) {
          this.db.execute(
            'INSERT INTO note_images (id, note_id, image_path) VALUES (?, ?, ?);',
            [img.id, note.id, img.imagePath]
          );
        }
      }

      this.db.execute('COMMIT;');
    } catch (error) {
      this.db.execute('ROLLBACK;');
      console.error('Failed to create note in repository, rolled back:', error);
      throw error;
    }
  }

  /**
   * Retrieves and maps a database note record to a Note domain object.
   */
  findById(id: string): Note | null {
    const res = this.db.execute('SELECT * FROM notes WHERE id = ?;', [id]);
    if (!res.rows || res.rows.length === 0) {
      return null;
    }

    const row = res.rows.item(0);

    const imgRes = this.db.execute('SELECT * FROM note_images WHERE note_id = ?;', [id]);
    const images: any[] = [];
    if (imgRes.rows) {
      for (let i = 0; i < imgRes.rows.length; i++) {
        images.push(imgRes.rows.item(i));
      }
    }

    return mapNoteRowToDomain(row, images);
  }

  /**
   * Queries list of all domain notes.
   */
  findAll(): Note[] {
    const res = this.db.execute(
      'SELECT *, (SELECT COUNT(*) FROM note_images WHERE note_id = notes.id) as image_count FROM notes ORDER BY created_at DESC;'
    );
    const list: Note[] = [];
    if (res.rows) {
      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows.item(i);
        const mapped = mapNoteRowToDomain(row);
        mapped.imageCount = row.image_count;
        list.push(mapped);
      }
    }
    return list;
  }

  /**
   * Validates and updates a Note domain model.
   */
  update(note: Note): void {
    validateNote(note);

    const dbObj = mapNoteDomainToDb(note);

    this.db.execute('BEGIN TRANSACTION;');
    try {
      this.db.execute(
        'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?;',
        [dbObj.title, dbObj.content, dbObj.updated_at, dbObj.id]
      );

      this.db.execute('DELETE FROM note_images WHERE note_id = ?;', [note.id]);

      if (note.images && note.images.length > 0) {
        for (const img of note.images) {
          this.db.execute(
            'INSERT INTO note_images (id, note_id, image_path) VALUES (?, ?, ?);',
            [img.id, note.id, img.imagePath]
          );
        }
      }

      this.db.execute('COMMIT;');
    } catch (error) {
      this.db.execute('ROLLBACK;');
      console.error('Failed to update note in repository, rolled back:', error);
      throw error;
    }
  }

  /**
   * Performs search query filtering notes by title or content.
   */
  search(queryText: string): Note[] {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) {
      return this.findAll();
    }

    const res = this.db.execute(
      'SELECT *, (SELECT COUNT(*) FROM note_images WHERE note_id = notes.id) as image_count FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC;',
      [`%${cleanQuery}%`, `%${cleanQuery}%`]
    );
    const list: Note[] = [];
    if (res.rows) {
      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows.item(i);
        const mapped = mapNoteRowToDomain(row);
        mapped.imageCount = row.image_count;
        list.push(mapped);
      }
    }
    return list;
  }

  /**
   * Deletes a note.
   */
  delete(id: string): void {
    this.db.execute('DELETE FROM notes WHERE id = ?;', [id]);
  }
}
