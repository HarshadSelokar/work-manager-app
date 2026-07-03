import { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { getDatabase } from '../database/database';
import { Work, mapWorkRowToDomain, mapWorkDomainToDb } from '@models/index';
import { validateWork } from '@utils/validation';

export class WorksRepository {
  private db: QuickSQLiteConnection;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Validates and saves a Work domain model, mapping dates to integers.
   */
  create(work: Work): void {
    // 1. Validate inputs before starting database write
    validateWork(work);

    // 2. Map domain entity to DB data structures
    const dbObj = mapWorkDomainToDb(work);

    this.db.execute('BEGIN TRANSACTION;');
    try {
      this.db.execute(
        'INSERT INTO works (id, title, reference, priority, description, deadline, status, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [
          dbObj.id,
          dbObj.title,
          dbObj.reference,
          dbObj.priority,
          dbObj.description,
          dbObj.deadline,
          dbObj.status,
          dbObj.category,
          dbObj.created_at,
          dbObj.updated_at,
        ]
      );

      if (work.images && work.images.length > 0) {
        for (const img of work.images) {
          this.db.execute(
            'INSERT INTO work_images (id, work_id, image_path) VALUES (?, ?, ?);',
            [img.id, work.id, img.imagePath]
          );
        }
      }

      if (work.links && work.links.length > 0) {
        for (const link of work.links) {
          this.db.execute(
            'INSERT INTO work_links (id, work_id, url, title) VALUES (?, ?, ?, ?);',
            [link.id, work.id, link.url, link.title || null]
          );
        }
      }

      this.db.execute('COMMIT;');
    } catch (error) {
      this.db.execute('ROLLBACK;');
      console.error('Failed to create task in repository, rolled back:', error);
      throw error;
    }
  }

  /**
   * Retrieves and maps a database row to a type-safe Work domain object.
   */
  findById(id: string): Work | null {
    const workRes = this.db.execute('SELECT * FROM works WHERE id = ?;', [id]);
    if (!workRes.rows || workRes.rows.length === 0) {
      return null;
    }

    const row = workRes.rows.item(0);

    const imgRes = this.db.execute('SELECT * FROM work_images WHERE work_id = ?;', [id]);
    const images: any[] = [];
    if (imgRes.rows) {
      for (let i = 0; i < imgRes.rows.length; i++) {
        images.push(imgRes.rows.item(i));
      }
    }

    const linkRes = this.db.execute('SELECT * FROM work_links WHERE work_id = ?;', [id]);
    const links: any[] = [];
    if (linkRes.rows) {
      for (let i = 0; i < linkRes.rows.length; i++) {
        links.push(linkRes.rows.item(i));
      }
    }

    return mapWorkRowToDomain(row, images, links);
  }

  /**
   * Queries list of all domain tasks for a category.
   */
  findByCategory(category: 'today' | 'other'): Work[] {
    const res = this.db.execute(
      'SELECT * FROM works WHERE category = ? ORDER BY created_at DESC;',
      [category]
    );
    const list: Work[] = [];
    if (res.rows) {
      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows.item(i);
        list.push(mapWorkRowToDomain(row));
      }
    }
    return list;
  }

  /**
   * Queries list of all completed tasks.
   * Sorted by completion date (updated_at DESC).
   */
  findCompleted(): Work[] {
    const res = this.db.execute(
      'SELECT * FROM works WHERE status = \'completed\' ORDER BY updated_at DESC;'
    );
    const list: Work[] = [];
    if (res.rows) {
      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows.item(i);
        list.push(mapWorkRowToDomain(row));
      }
    }
    return list;
  }

  /**
   * Validates updates and commits them inside a transaction block.
   */
  update(work: Work): void {
    validateWork(work);

    const dbObj = mapWorkDomainToDb(work);

    this.db.execute('BEGIN TRANSACTION;');
    try {
      this.db.execute(
        'UPDATE works SET title = ?, reference = ?, priority = ?, description = ?, deadline = ?, status = ?, category = ?, updated_at = ? WHERE id = ?;',
        [
          dbObj.title,
          dbObj.reference,
          dbObj.priority,
          dbObj.description,
          dbObj.deadline,
          dbObj.status,
          dbObj.category,
          dbObj.updated_at,
          dbObj.id,
        ]
      );

      this.db.execute('DELETE FROM work_images WHERE work_id = ?;', [work.id]);
      this.db.execute('DELETE FROM work_links WHERE work_id = ?;', [work.id]);

      if (work.images && work.images.length > 0) {
        for (const img of work.images) {
          this.db.execute(
            'INSERT INTO work_images (id, work_id, image_path) VALUES (?, ?, ?);',
            [img.id, work.id, img.imagePath]
          );
        }
      }

      if (work.links && work.links.length > 0) {
        for (const link of work.links) {
          this.db.execute(
            'INSERT INTO work_links (id, work_id, url, title) VALUES (?, ?, ?, ?);',
            [link.id, work.id, link.url, link.title || null]
          );
        }
      }

      this.db.execute('COMMIT;');
    } catch (error) {
      this.db.execute('ROLLBACK;');
      console.error('Failed to update task in repository, rolled back:', error);
      throw error;
    }
  }

  /**
   * Checks if a reference code already exists in the database.
   * Useful for preventing duplicate reference constraints before database insert/update.
   */
  referenceExists(reference: string, excludeId?: string): boolean {
    const query = excludeId
      ? 'SELECT COUNT(*) as count FROM works WHERE reference = ? AND id != ?;'
      : 'SELECT COUNT(*) as count FROM works WHERE reference = ?;';
    const params = excludeId ? [reference, excludeId] : [reference];

    const res = this.db.execute(query, params);
    if (res.rows && res.rows.length > 0) {
      const row = res.rows.item(0);
      return row.count > 0;
    }
    return false;
  }

  /**
   * Performs global query searching and filters/sorts results dynamically.
   */
  searchAndFilter(
    queryText: string,
    filters: {
      priority?: string;
      status?: string;
      category?: string;
      deadline?: string;
    },
    sortBy: 'priority' | 'deadline' | 'created_at' | 'updated_at' | 'title'
  ): Work[] {
    let sql = 'SELECT * FROM works WHERE 1=1';
    const params: any[] = [];

    const cleanQuery = queryText.trim();
    if (cleanQuery) {
      sql += ' AND (title LIKE ? OR reference LIKE ? OR description LIKE ?)';
      const queryParam = `%${cleanQuery}%`;
      params.push(queryParam, queryParam, queryParam);
    }

    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.deadline === 'overdue') {
        sql += ' AND deadline < ? AND status != \'completed\'';
        params.push(today.getTime());
      } else if (filters.deadline === 'today') {
        const tomorrow = new Date(today.getTime() + 86400000);
        sql += ' AND deadline >= ? AND deadline < ?';
        params.push(today.getTime(), tomorrow.getTime());
      } else if (filters.deadline === 'tomorrow') {
        const tomorrow = new Date(today.getTime() + 86400000);
        const dayAfter = new Date(today.getTime() + 86400000 * 2);
        sql += ' AND deadline >= ? AND deadline < ?';
        params.push(tomorrow.getTime(), dayAfter.getTime());
      } else if (filters.deadline === 'no_deadline') {
        sql += ' AND deadline IS NULL';
      }
    }

    // Sort operations
    if (sortBy === 'priority') {
      sql += " ORDER BY CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 END DESC, title COLLATE NOCASE ASC";
    } else if (sortBy === 'deadline') {
      sql += ' ORDER BY CASE WHEN deadline IS NULL THEN 1 ELSE 0 END, deadline ASC, title COLLATE NOCASE ASC';
    } else if (sortBy === 'created_at') {
      sql += ' ORDER BY created_at DESC';
    } else if (sortBy === 'updated_at') {
      sql += ' ORDER BY updated_at DESC';
    } else {
      sql += ' ORDER BY title COLLATE NOCASE ASC';
    }

    const res = this.db.execute(sql, params);
    const list: Work[] = [];
    if (res.rows) {
      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows.item(i);
        list.push(mapWorkRowToDomain(row));
      }
    }
    return list;
  }

  /**
   * Calculates dashboard statistics across all tasks and notes.
   */
  getStatistics() {
    const total = this.db.execute('SELECT COUNT(*) as count FROM works;').rows?.item(0).count || 0;
    const completed = this.db.execute('SELECT COUNT(*) as count FROM works WHERE status = \'completed\';').rows?.item(0).count || 0;
    const pending = this.db.execute('SELECT COUNT(*) as count FROM works WHERE status != \'completed\';').rows?.item(0).count || 0;
    const highPriority = this.db.execute('SELECT COUNT(*) as count FROM works WHERE priority = \'high\';').rows?.item(0).count || 0;
    const todayCount = this.db.execute('SELECT COUNT(*) as count FROM works WHERE category = \'today\';').rows?.item(0).count || 0;
    const notesCount = this.db.execute('SELECT COUNT(*) as count FROM notes;').rows?.item(0).count || 0;

    return {
      total,
      completed,
      pending,
      highPriority,
      todayCount,
      notesCount,
    };
  }

  /**
   * Resets local SQLite database by clearing all records, relying on cascade deletes.
   */
  resetDatabase() {
    this.db.execute('BEGIN TRANSACTION;');
    try {
      this.db.execute('DELETE FROM works;');
      this.db.execute('DELETE FROM notes;');
      this.db.execute('COMMIT;');
    } catch (err) {
      this.db.execute('ROLLBACK;');
      throw err;
    }
  }

  /**
   * Deletes task records.
   */
  delete(id: string): void {
    this.db.execute('DELETE FROM works WHERE id = ?;', [id]);
  }
}
