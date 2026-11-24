import { NextRequest, NextResponse, connection } from 'next/server';
import {
  getWatchlistItems,
  saveWatchlistItems,
} from '@/lib/storage/app-storage';
import {
  fetchExtendedStockDetail,
  fetchLiveQuote,
} from '@/lib/market/market-service';
import { generateBuySellAdvisory } from '@/lib/ai/advisory-engine';
import { WatchlistItem } from '@/types';
import { inferCurrencyFromTicker } from '@/lib/utils';

export async function GET() {
  await connection();
  try {
    const stored = getWatchlistItems();
    const enriched = await Promise.all(
      stored.map(async (item) => {
        const q = await fetchLiveQuote(item.ticker);
        if (!q) return item;
        return {
          ...item,
          currency: q.currency,
          price: q.price,
          change24h: q.changePercent,
          volume: q.volume !== 'N/A' ? q.volume : item.volume,
          marketCap: q.marketCap !== 'N/A' ? q.marketCap : item.marketCap,
          peRatio: q.peRatio > 0 ? q.peRatio : item.peRatio,
        };
      })
    );
    return NextResponse.json({ success: true, items: enriched });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load watchlist';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawTicker = ((body.ticker as string) || '').trim().toUpperCase();
    if (!rawTicker) {
      return NextResponse.json(
        { success: false, error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    const stock = await fetchExtendedStockDetail(rawTicker);
    const advisory = await generateBuySellAdvisory({
      ticker: stock.ticker,
      stock,
    });

    const newItem: WatchlistItem = {
      id: `w-${Date.now()}`,
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.exchange || 'Public Equity',
      currency: stock.currency || inferCurrencyFromTicker(stock.ticker),
      price: stock.price,
      change24h: stock.changePercent,
      change1w: stock.performance['1W'],
      change1m: stock.performance['1M'],
      change1y: stock.performance['1Y'],
      volume: 'Live',
      marketCap: stock.marketCap,
      peRatio: stock.peRatio,
      targetPrice: advisory.targetPriceHigh,
      aiSignal: advisory.signalLabel,
      aiConfidence: advisory.confidenceScore,
      notes: advisory.rationaleSummary,
    };

    const current = getWatchlistItems();
    const filtered = current.filter(
      (i) => i.ticker.toUpperCase() !== newItem.ticker.toUpperCase()
    );
    const next = [newItem, ...filtered];
    saveWatchlistItems(next);

    return NextResponse.json({ success: true, item: newItem, items: next });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add watchlist item';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Watchlist id is required' }, { status: 400 });
    }
    const next = getWatchlistItems().filter((i) => i.id !== id);
    saveWatchlistItems(next);
    return NextResponse.json({ success: true, items: next });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to remove watchlist item';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
