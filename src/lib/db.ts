import { createClient, type Client } from '@libsql/client';
import { createDefaultCharacterState } from './persistence';
import { createDefaultAriaState } from './aria-engine';
import { createDefaultCyrusState } from './cyrus-engine';

const isVercel = process.env.VERCEL === '1';
const defaultFile = isVercel ? 'file:/tmp/dnd.db' : 'file:dnd.db';
const url = process.env.DATABASE_URL || defaultFile;
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Create singleton client (works for local file, /tmp on Vercel, and cloud libsql://)
export const db: Client = createClient({
  url,
  authToken,
});

let isInitialized = false;

/**
 * Initialize SQLite database, ensuring tables exist and initial character/campaign records are seeded.
 */
export async function initDb(): Promise<void> {
  if (isInitialized) return;

  // 1. Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS campaign_state (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      character_id TEXT,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  // 2. Check if characters table has seeds; if not, seed defaults
  try {
    const charRows = await db.execute('SELECT id FROM characters LIMIT 1');
    if (charRows.rows.length === 0) {
      const now = Date.now();

      // Seed Vesper
      const defaultVesper = createDefaultCharacterState();
      await db.execute({
        sql: 'INSERT INTO characters (id, data, updated_at) VALUES (?, ?, ?)',
        args: ['vesper', JSON.stringify(defaultVesper), now],
      });

      // Seed Aria
      const defaultAria = createDefaultAriaState();
      await db.execute({
        sql: 'INSERT INTO characters (id, data, updated_at) VALUES (?, ?, ?)',
        args: ['aria', JSON.stringify(defaultAria), now],
      });

      // Seed Cyrus
      const defaultCyrus = createDefaultCyrusState();
      await db.execute({
        sql: 'INSERT INTO characters (id, data, updated_at) VALUES (?, ?, ?)',
        args: ['cyrus', JSON.stringify(defaultCyrus), now],
      });
    }

    // Check campaign_state defaults
    const mediaRow = await db.execute("SELECT key FROM campaign_state WHERE key = 'custom_media'");
    if (mediaRow.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO campaign_state (key, data, updated_at) VALUES (?, ?, ?)',
        args: ['custom_media', JSON.stringify({ portraits: {}, backgrounds: {} }), Date.now()],
      });
    }

    const rosterRow = await db.execute("SELECT key FROM campaign_state WHERE key = 'custom_roster'");
    if (rosterRow.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO campaign_state (key, data, updated_at) VALUES (?, ?, ?)',
        args: ['custom_roster', JSON.stringify([]), Date.now()],
      });
    }
  } catch (err) {
    console.error('[db] Error seeding default records:', err);
  }

  isInitialized = true;
}

/**
 * Return summary driver info for UI status and health checks.
 */
export function getDbDriverInfo() {
  const isVercelEnv = process.env.VERCEL === '1';
  const rawUrl = process.env.DATABASE_URL || (isVercelEnv ? 'file:/tmp/dnd.db' : 'file:dnd.db');
  const isTurso = rawUrl.startsWith('libsql://') || rawUrl.includes('.turso.io');
  
  let maskedUrl = rawUrl;
  if (isTurso) {
    try {
      const parsed = new URL(rawUrl);
      maskedUrl = `libsql://${parsed.hostname}`;
    } catch {
      maskedUrl = 'libsql://[turso-database]';
    }
  }

  return {
    provider: isTurso ? 'Turso Cloud SQLite' : isVercelEnv ? 'Vercel Ephemeral (/tmp)' : 'Local SQLite',
    url: maskedUrl,
    isCloud: isTurso,
    isConfigured: Boolean(process.env.DATABASE_URL),
    isVercel: isVercelEnv,
    warning: isVercelEnv && !isTurso ? 'Running on Vercel without Turso cloud database. Add DATABASE_URL to Vercel Environment Variables to persist data across deployments!' : undefined,
  };
}

/**
 * Fetch all characters and their timestamps.
 */
export async function getAllCharacters(): Promise<Record<string, { data: any; updatedAt: number }>> {
  await initDb();
  const res = await db.execute('SELECT id, data, updated_at FROM characters');
  const result: Record<string, { data: any; updatedAt: number }> = {};
  for (const row of res.rows) {
    try {
      result[row.id as string] = {
        data: JSON.parse(row.data as string),
        updatedAt: Number(row.updated_at),
      };
    } catch (e) {
      console.error(`[db] Failed to parse character ${row.id}:`, e);
    }
  }
  return result;
}

/**
 * Fetch all campaign state slices and their timestamps.
 */
export async function getAllCampaignState(): Promise<Record<string, { data: any; updatedAt: number }>> {
  await initDb();
  const res = await db.execute('SELECT key, data, updated_at FROM campaign_state');
  const result: Record<string, { data: any; updatedAt: number }> = {};
  for (const row of res.rows) {
    try {
      result[row.key as string] = {
        data: JSON.parse(row.data as string),
        updatedAt: Number(row.updated_at),
      };
    } catch (e) {
      console.error(`[db] Failed to parse campaign_state ${row.key}:`, e);
    }
  }
  return result;
}

/**
 * Upsert character data.
 */
export async function saveCharacter(id: string, data: any, clientTimestamp?: number): Promise<number> {
  await initDb();
  const timestamp = Math.max(Date.now(), clientTimestamp || 0);
  await db.execute({
    sql: `
      INSERT INTO characters (id, data, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
      WHERE excluded.updated_at >= characters.updated_at
    `,
    args: [id, JSON.stringify(data), timestamp],
  });
  return timestamp;
}

/**
 * Upsert campaign state data.
 */
export async function saveCampaignState(key: string, data: any, clientTimestamp?: number): Promise<number> {
  await initDb();
  const timestamp = Math.max(Date.now(), clientTimestamp || 0);
  await db.execute({
    sql: `
      INSERT INTO campaign_state (key, data, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
      WHERE excluded.updated_at >= campaign_state.updated_at
    `,
    args: [key, JSON.stringify(data), timestamp],
  });
  return timestamp;
}

/**
 * Log an activity event.
 */
export async function addActivityLog(characterId: string, message: string): Promise<void> {
  try {
    await initDb();
    await db.execute({
      sql: 'INSERT INTO activity_logs (id, character_id, message, timestamp) VALUES (?, ?, ?, ?)',
      args: [`log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, characterId, message, Date.now()],
    });
  } catch (err) {
    console.error('[db] Error logging activity:', err);
  }
}
