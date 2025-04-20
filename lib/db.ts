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
    
    CREATE TABLE IF NOT EXISTS vote_counts (
      bill_id TEXT NOT NULL,
      vote_id TEXT NOT NULL,
      option TEXT NOT NULL,
      value INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      PRIMARY KEY (bill_id, vote_id, option)
    );
  `);
} catch (error) {
  console.error('Error initializing database:', error);
  throw error;
}

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

// Define types for database records
interface BillRecord {
  data: string;
  timestamp: number;
}

interface BillTextRecord {
  text: string;
  timestamp: number;
}

interface VoteCountRecord {
  option: string;
  value: number;
}

export const getBillFromCache = (billId: string): any | null => {
  try {
    const stmt = db.prepare('SELECT data, timestamp FROM bills WHERE id = ?');
    const result = stmt.get(billId) as BillRecord | undefined;
    
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
    const result = stmt.get(billId) as BillTextRecord | undefined;
    
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

// New functions to handle vote counts
export interface VoteCount {
  option: string;
  value: number;
}

export const getVoteCountsFromCache = (billId: string, voteId: string): VoteCount[] | null => {
  try {
    const stmt = db.prepare('SELECT option, value FROM vote_counts WHERE bill_id = ? AND vote_id = ?');
    const results = stmt.all(billId, voteId) as VoteCountRecord[];
    
    if (!results || results.length === 0) return null;
    
    return results.map(row => ({
      option: row.option,
      value: row.value
    }));
  } catch (error) {
    console.error('Error getting vote counts from cache:', error);
    return null;
  }
};

export const cacheVoteCounts = (billId: string, voteId: string, voteCounts: VoteCount[]): void => {
  try {
    const deleteStmt = db.prepare('DELETE FROM vote_counts WHERE bill_id = ? AND vote_id = ?');
    const insertStmt = db.prepare('INSERT INTO vote_counts (bill_id, vote_id, option, value, timestamp) VALUES (?, ?, ?, ?, ?)');
    
    // Use a transaction to ensure all vote counts are updated together
    const transaction = db.transaction((billId, voteId, counts) => {
      deleteStmt.run(billId, voteId);
      const now = Date.now();
      
      for (const count of counts) {
        insertStmt.run(billId, voteId, count.option, count.value, now);
      }
    });
    
    transaction(billId, voteId, voteCounts);
  } catch (error) {
    console.error('Error caching vote counts:', error);
  }
};

export default db; 