import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCharacters,
  getAllCampaignState,
  saveCharacter,
  saveCampaignState,
  addActivityLog,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? parseInt(sinceParam, 10) : 0;

    const characters = await getAllCharacters();
    const campaign = await getAllCampaignState();

    // Compute max updated timestamp across all records
    let maxUpdated = 0;
    for (const char of Object.values(characters)) {
      if (char.updatedAt > maxUpdated) maxUpdated = char.updatedAt;
    }
    for (const item of Object.values(campaign)) {
      if (item.updatedAt > maxUpdated) maxUpdated = item.updatedAt;
    }

    // Differential sync check: if client already has latest data, return 304-equivalent
    if (since > 0 && maxUpdated <= since) {
      return NextResponse.json(
        { upToDate: true, lastUpdated: maxUpdated },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      {
        upToDate: false,
        characters,
        campaign,
        lastUpdated: maxUpdated,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/sync GET] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch synchronized data', message: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, key, data, clientTimestamp, logMessage, items } = body;

    const now = Date.now();

    // Support batch saving
    if (type === 'batch' && Array.isArray(items)) {
      for (const item of items) {
        if (item.type === 'character' && item.id) {
          await saveCharacter(item.id, item.data, item.clientTimestamp);
        } else if (item.type === 'campaign' && item.key) {
          await saveCampaignState(item.key, item.data, item.clientTimestamp);
        }
      }
      return NextResponse.json({ success: true, timestamp: now, count: items.length });
    }

    if (type === 'character' && id) {
      const savedTime = await saveCharacter(id, data, clientTimestamp);
      if (logMessage) {
        await addActivityLog(id, logMessage);
      }
      return NextResponse.json({ success: true, timestamp: savedTime, id });
    }

    if (type === 'campaign' && key) {
      const savedTime = await saveCampaignState(key, data, clientTimestamp);
      if (logMessage) {
        await addActivityLog(key, logMessage);
      }
      return NextResponse.json({ success: true, timestamp: savedTime, key });
    }

    return NextResponse.json(
      { error: 'Invalid payload: missing type, id/key, or data' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[API /api/sync POST] Error:', err);
    return NextResponse.json(
      { error: 'Failed to persist update', message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
