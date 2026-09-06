import { NextResponse } from 'next/server';
import { db, initDb, getDbDriverInfo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    const info = getDbDriverInfo();

    // Test query
    const charRes = await db.execute('SELECT COUNT(*) as count FROM characters');
    const campRes = await db.execute('SELECT COUNT(*) as count FROM campaign_state');

    const charCount = Number(charRes.rows[0]?.count ?? 0);
    const campCount = Number(campRes.rows[0]?.count ?? 0);

    return NextResponse.json(
      {
        status: 'connected',
        driver: info.provider,
        url: info.url,
        isCloud: info.isCloud,
        isConfigured: info.isConfigured,
        characterCount: charCount,
        campaignStateCount: campCount,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/db-status GET] Error:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Database connection error',
        driver: process.env.DATABASE_URL ? 'Remote Database' : 'Local SQLite',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
