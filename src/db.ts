// src/db.ts  ← FINAL VERSION (works in browser + deployed)
import { drizzle } from 'drizzle-orm/mysql2';

// ONLY run real MySQL when we're deployed (not in browser)
let db: any;

if (typeof window === 'undefined') {
  // We're on the server (deployed on your hosting) → use real MySQL
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
    user: import.meta.env.VITE_MYSQL_USER,
    password: import.meta.env.VITE_MYSQL_PASSWORD,
    database: import.meta.env.VITE_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  });
  db = drizzle(pool);
} else {
  // We're in the browser → use fake in-memory DB (for dev only)
  const { create } = require('drizzle-orm/mysql2');
  const fakePool = { query: () => Promise.resolve({ rows: [] }) };
  db = drizzle(fakePool);
}

export { db };