import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'legisloom.db');
let db: Database.Database;

try {
  db = new Database(dbPath);
  
  // Initialize tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS bill_texts (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
} catch (error) {
  console.error('Error initializing database:', error);
  throw error;
}

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export const getBillFromCache = (billId: string): any | null => {
  try {
    const stmt = db.prepare('SELECT data, timestamp FROM bills WHERE id = ?');
    const result = stmt.get(billId);
    
    if (!result) return null;
    
    // Check if cache is expired
    const now = Date.now();
    if (now - result.timestamp > CACHE_EXPIRATION) {
      // Cache expired, delete the entry
      const deleteStmt = db.prepare('DELETE FROM bills WHERE id = ?');
      deleteStmt.run(billId);
      return null;
    }
    
    return JSON.parse(result.data);
  } catch (error) {
    console.error('Error getting bill from cache:', error);
    return null;
  }
};

export const cacheBill = (billId: string, billData: any): void => {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO bills (id, data, timestamp) VALUES (?, ?, ?)');
    stmt.run(billId, JSON.stringify(billData), Date.now());
  } catch (error) {
    console.error('Error caching bill:', error);
  }
};

export const getBillTextFromCache = (billId: string): string | null => {
  try {
    const stmt = db.prepare('SELECT text, timestamp FROM bill_texts WHERE id = ?');
    const result = stmt.get(billId);
    
    if (!result) return null;
    
    // Check if cache is expired
    const now = Date.now();
    if (now - result.timestamp > CACHE_EXPIRATION) {
      // Cache expired, delete the entry
      const deleteStmt = db.prepare('DELETE FROM bill_texts WHERE id = ?');
      deleteStmt.run(billId);
      return null;
    }
    
    return result.text;
  } catch (error) {
    console.error('Error getting bill text from cache:', error);
    return null;
  }
};

export const cacheBillText = (billId: string, text: string): void => {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO bill_texts (id, text, timestamp) VALUES (?, ?, ?)');
    stmt.run(billId, text, Date.now());
  } catch (error) {
    console.error('Error caching bill text:', error);
  }
};

export default db; 