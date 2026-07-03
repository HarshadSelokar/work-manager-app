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
        'INSERT INTO works (id, title, description, status, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [
          dbObj.id,
          dbObj.title,
          dbObj.description,
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
   * Validates updates and commits them inside a transaction block.
   */
  update(work: Work): void {
    validateWork(work);

    const dbObj = mapWorkDomainToDb(work);

    this.db.execute('BEGIN TRANSACTION;');
    try {
      this.db.execute(
        'UPDATE works SET title = ?, description = ?, status = ?, category = ?, updated_at = ? WHERE id = ?;',
        [
          dbObj.title,
          dbObj.description,
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
   * Deletes task records.
   */
  delete(id: string): void {
    this.db.execute('DELETE FROM works WHERE id = ?;', [id]);
  }
}
