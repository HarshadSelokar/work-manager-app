import { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import * as schemas from './schema';

/**
 * Runs the database migrations to set up the tables and indexes.
 * Parent tables are created before child tables to satisfy foreign keys.
 */
export const runMigrations = (db: QuickSQLiteConnection): void => {
  console.log('Running database migrations...');

  const statements = [
    // 1. Parent Tables
    schemas.CREATE_WORKS_TABLE,
    schemas.CREATE_NOTES_TABLE,

    // 2. Child Tables (Reference parents via FK)
    schemas.CREATE_WORK_IMAGES_TABLE,
    schemas.CREATE_WORK_LINKS_TABLE,
    schemas.CREATE_NOTE_IMAGES_TABLE,

    // 3. Performance Indexes
    schemas.INDEX_WORKS_CATEGORY,
    schemas.INDEX_WORKS_STATUS,
    schemas.INDEX_WORK_IMAGES_FK,
    schemas.INDEX_WORK_LINKS_FK,
    schemas.INDEX_NOTE_IMAGES_FK,
  ];

  for (const sql of statements) {
    try {
      db.execute(sql);
    } catch (error) {
      console.error('Failed to execute migration statement:', sql, error);
      throw error;
    }
  }

  console.log('Database migrations completed successfully.');
};
