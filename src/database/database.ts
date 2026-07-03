import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { runMigrations } from './migrations';

let dbInstance: QuickSQLiteConnection | null = null;

/**
 * Initializes and returns the SQLite database connection singleton instance.
 * Enforces foreign keys and executes table setup.
 */
export const getDatabase = (): QuickSQLiteConnection => {
  if (dbInstance) {
    return dbInstance;
  }

  console.log('Initializing SQLite database...');

  // 1. Open the database file
  dbInstance = open({ name: 'work_manager.db' });

  // 2. Enforce referential integrity (foreign key constraints)
  dbInstance.execute('PRAGMA foreign_keys = ON;');

  // 3. Coordinate initial table setups
  runMigrations(dbInstance);

  console.log('Database initialized successfully.');
  return dbInstance;
};
