/**
 * Client-side Real-time SQLite Sync Engine
 * Handles differential polling, mutations, and database health status.
 */

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface DbStatusInfo {
  status: 'connected' | 'error' | 'connecting';
  driver: string;
  url: string;
  isCloud: boolean;
  isConfigured: boolean;
  characterCount: number;
  campaignStateCount: number;
  message?: string;
  timestamp?: number;
}

export interface SyncApiResponse {
  upToDate: boolean;
  characters?: Record<string, { data: any; updatedAt: number }>;
  campaign?: Record<string, { data: any; updatedAt: number }>;
  lastUpdated: number;
  error?: string;
}

/**
 * Fetch latest state from server using differential since timestamp.
 */
export async function fetchSync(since = 0): Promise<SyncApiResponse | null> {
  try {
    const url = since > 0 ? `/api/sync?since=${encodeURIComponent(since)}` : '/api/sync';
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[SyncEngine] GET /api/sync returned ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('[SyncEngine] Network error during fetchSync:', err);
    return null;
  }
}

/**
 * Push character state mutation to SQLite.
 */
export async function pushCharacterSync(
  id: string,
  data: any,
  clientTimestamp = Date.now(),
  logMessage?: string
): Promise<{ success: boolean; timestamp: number } | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'character',
        id,
        data,
        clientTimestamp,
        logMessage,
      }),
    });

    if (!res.ok) {
      console.warn(`[SyncEngine] POST /api/sync character returned ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('[SyncEngine] Network error saving character:', err);
    return null;
  }
}

/**
 * Push campaign state mutation to SQLite.
 */
export async function pushCampaignSync(
  key: string,
  data: any,
  clientTimestamp = Date.now(),
  logMessage?: string
): Promise<{ success: boolean; timestamp: number } | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'campaign',
        key,
        data,
        clientTimestamp,
        logMessage,
      }),
    });

    if (!res.ok) {
      console.warn(`[SyncEngine] POST /api/sync campaign returned ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('[SyncEngine] Network error saving campaign state:', err);
    return null;
  }
}

/**
 * Check database connectivity & driver details.
 */
export async function fetchDbStatus(): Promise<DbStatusInfo | null> {
  try {
    const res = await fetch('/api/db-status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('[SyncEngine] Error querying db-status:', err);
    return null;
  }
}
