import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Database connection singleton
let db: Database | null = null;

/**
 * Get a database connection to the SQLite database
 */
export async function getDbConnection() {
  if (db) {
    return db;
  }

  // Determine the database path
  // In development, use the local database file
  const dbPath = path.resolve(process.cwd(), 'legispal.db');
  console.log(`Opening database at: ${dbPath}`);

  // Open the database connection
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  return db;
}

/**
 * Close the database connection
 */
export async function closeDbConnection() {
  if (db) {
    await db.close();
    db = null;
  }
}
