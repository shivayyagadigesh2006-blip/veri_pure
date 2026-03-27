import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const PORT = 3001;
const app = express();
app.use(express.json());

let db: any;

async function setupDb() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS blocks (
      "index" INTEGER PRIMARY KEY,
      "timestamp" INTEGER,
      "data" TEXT,
      "previousHash" TEXT,
      "hash" TEXT,
      "nonce" INTEGER
    );

    CREATE TABLE IF NOT EXISTS reports (
      "id" TEXT PRIMARY KEY,
      "stationId" TEXT,
      "category" TEXT,
      "description" TEXT,
      "timestamp" INTEGER,
      "status" TEXT,
      "resolvedAt" INTEGER
    );
  `);
}

// API Endpoints for Blockchain
app.get('/api/chain', async (req, res) => {
  try {
    const blocks = await db.all('SELECT * FROM blocks ORDER BY "index" ASC');
    const parsedBlocks = blocks.map((b: any) => ({
      ...b,
      data: JSON.parse(b.data)
    }));
    res.json(parsedBlocks);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/chain', async (req, res) => {
  try {
    const block = req.body;
    await db.run(
      `INSERT INTO blocks ("index", "timestamp", "data", "previousHash", "hash", "nonce") VALUES (?, ?, ?, ?, ?, ?)`,
      [block.index, block.timestamp, JSON.stringify(block.data), block.previousHash, block.hash, block.nonce]
    );
    res.json({ success: true, block });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// API Endpoints for Reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.all('SELECT * FROM reports ORDER BY timestamp ASC');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const report = req.body;
    await db.run(
      `INSERT INTO reports (id, stationId, category, description, timestamp, status, resolvedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [report.id, report.stationId, report.category, report.description, report.timestamp, report.status, report.resolvedAt || null]
    );
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/reports/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const resolvedAt = req.body.resolvedAt || Date.now();
    await db.run(`UPDATE reports SET status = 'resolved', resolvedAt = ? WHERE id = ?`, [resolvedAt, id]);
    res.json({ success: true, resolvedAt });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

setupDb().then(() => {
  app.listen(PORT, () => {
    console.log(`VeriPure API Backend running on http://localhost:${PORT}`);
  });
}).catch(console.error);
