/**
 * SQLite Relational Schema Definitions
 * 
 * We use text IDs (UUIDs) for primary keys rather than auto-incrementing integers.
 * This is a best practice for offline-first apps because it allows client-side
 * ID generation before syncing with the cloud, avoiding primary key collisions.
 */

// 1. Works Table
// Stores the core properties of a task.
// Indexes will be added to status and category since they are frequently queried.
export const CREATE_WORKS_TABLE = `
  CREATE TABLE IF NOT EXISTS works (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    reference TEXT UNIQUE,
    priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
    description TEXT,
    deadline INTEGER,
    status TEXT NOT NULL CHECK(status IN ('todo', 'in_progress', 'completed')),
    category TEXT NOT NULL CHECK(category IN ('today', 'other')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

// 2. Work Images Table
// Stores local paths of attachments associated with a work task.
// Establishes a One-to-Many relationship with a foreign key referencing works(id).
// ON DELETE CASCADE automatically deletes attachments when the parent work item is deleted.
export const CREATE_WORK_IMAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS work_images (
    id TEXT PRIMARY KEY NOT NULL,
    work_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE CASCADE
  );
`;

// 3. Work Links Table
// Stores URL bookmarks attached to a work task.
// Establishes a One-to-Many relationship with works(id) with cascading deletion.
export const CREATE_WORK_LINKS_TABLE = `
  CREATE TABLE IF NOT EXISTS work_links (
    id TEXT PRIMARY KEY NOT NULL,
    work_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE CASCADE
  );
`;

// 4. Notes Table
// Stores quick, standalone notes.
export const CREATE_NOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

// 5. Note Images Table
// Stores local images attached to a note (One-to-Many with cascading deletion).
export const CREATE_NOTE_IMAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS note_images (
    id TEXT PRIMARY KEY NOT NULL,
    note_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
  );
`;

/**
 * INDEXES
 * 
 * We create indexes on fields that are frequently utilized in WHERE clauses
 * (like filtering tasks by status or category) or in JOIN relationships
 * (like linking child attachments to parent IDs).
 */

// Index on works category (e.g. today vs other)
export const INDEX_WORKS_CATEGORY = `
  CREATE INDEX IF NOT EXISTS idx_works_category ON works (category);
`;

// Index on works status
export const INDEX_WORKS_STATUS = `
  CREATE INDEX IF NOT EXISTS idx_works_status ON works (status);
`;

// Index on work_images foreign key for fast joins
export const INDEX_WORK_IMAGES_FK = `
  CREATE INDEX IF NOT EXISTS idx_work_images_fk ON work_images (work_id);
`;

// Index on work_links foreign key for fast joins
export const INDEX_WORK_LINKS_FK = `
  CREATE INDEX IF NOT EXISTS idx_work_links_fk ON work_links (work_id);
`;

// Index on note_images foreign key for fast joins
export const INDEX_NOTE_IMAGES_FK = `
  CREATE INDEX IF NOT EXISTS idx_note_images_fk ON note_images (note_id);
`;
