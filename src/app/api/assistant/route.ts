import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '@/lib/config/env';
import {
  getPortfolioHoldings,
  getProjects,
  getSettings,
  getWatchlistItems,
} from '@/lib/storage/app-storage';
import { searchCompaniesWithFY } from '@/lib/market/market-service';
import { defaultRAGService } from '@/lib/rag/rag';
import { globalVectorStore } from '@/lib/rag/vector-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = ((body.question as string) || '').trim();
    const activeProjectId = body.projectId as string | undefined;

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const projects = getProjects();
    const holdings = getPortfolioHoldings();
    const watchlist = getWatchlistItems();

    // Check if the user is asking about a specific project with uploaded PDFs
    let vdrAnswer = '';
    if (activeProjectId && globalVectorStore.hasProjectRecords(activeProjectId)) {
      const ragRes = await defaultRAGService.askQuestion(activeProjectId, question);
      if (!ragRes.isDemoFallback && ragRes.sources.length > 0) {
        vdrAnswer = ragRes.answer;
      }
    }

    // Look up company FY Profit/Loss if a company/ticker keyword is detected
    const words = question
      .replace(/[?.,!]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);
    const companyHits = await searchCompaniesWithFY(
      words.find((w) => /^[A-Z]{2,12}$/.test(w)) ||
        words.find((w) =>
          /tata|suzuki|maruti|reliance|tcs|nvidia|apple|microsoft|infosys|hdfc|zomato|tesla|amd/i.test(w)
        ) ||
        ''
    );

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      const topCompany = companyHits[0];
      if (vdrAnswer) {
        return NextResponse.json({
          success: true,
          answer: vdrAnswer,
          isDemoFallback: false,
        });
      }
      if (topCompany && question.length > 2) {
        return NextResponse.json({
          success: true,
          answer: `**${topCompany.name} (${topCompany.symbol})**\n• **Present FY Result (${topCompany.latestFYLabel})**: ${topCompany.latestFYProfitOrLoss}\n• **Revenue**: ${topCompany.latestFYRevenue} | **Net Margin**: ${topCompany.netMargin}\n• **Advisory Verdict**: ${topCompany.advisoryVerdict} (${topCompany.advisoryConfidence}% confidence)\n\n${topCompany.profitExplanation}`,
          isDemoFallback: true,
        });
      }
      return NextResponse.json({
        success: true,
        answer: `**Portfolio & Deal Snapshot (Demo Assistant Mode)**\n• Active Deals: ${projects.length} (${projects.slice(0, 3).map((p) => p.name).join(', ')})\n• Tracked Holdings: ${holdings.length} | Watchlist: ${watchlist.length}\n\n*Tip: Add \`GOOGLE_GENERATIVE_AI_API_KEY\` in \`.env.local\` for full conversational Gemini reasoning.*`,
        isDemoFallback: true,
      });
    }

    const settings = getSettings();
    const modelName = settings.model.toLowerCase().includes('pro')
      ? 'gemini-3.1-pro-preview'
      : 'gemini-3-flash-preview';

    const contextSummary = `
ACTIVE DUE DILIGENCE PROJECTS (${projects.length}):
${projects.slice(0, 5).map((p) => `- ${p.name} (${p.ticker}): Stage=${p.stage}, Score=${p.score}/100, IRR=${p.targetIrr}%, Summary=${p.executiveSummary}`).join('\n')}

PORTFOLIO HOLDINGS (${holdings.length}):
${holdings.slice(0, 6).map((h) => `- ${h.ticker} (${h.name}): ${h.shares} shares @ ${h.currentPrice}, PnL=${h.unrealizedGainPercent}%`).join('\n')}

COMPANY FY PROFIT/LOSS CONTEXT:
${companyHits.slice(0, 3).map((c) => `- ${c.name} (${c.symbol}): ${c.latestFYLabel} Revenue=${c.latestFYRevenue}, Profit/Loss=${c.latestFYProfitOrLoss}, LivePrice=${c.currentPrice ?? 'N/A'}, Verdict=${c.advisoryVerdict}`).join('\n')}

${vdrAnswer ? `GROUNDED VDR DOCUMENT EXCERPT ANSWER:\n${vdrAnswer}` : ''}
`;

    const aiClient = new GoogleGenAI({ apiKey });
    let answer = '';
    for (const candidate of Array.from(
      new Set([modelName, 'gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-2.5-flash'])
    )) {
      try {
        const res = await aiClient.models.generateContent({
          model: candidate,
          contents: `You are AURA, an institutional investment copilot. Answer concisely with bullet points and exact numbers using the context below.\n\nCONTEXT:\n${contextSummary}\n\nUSER QUESTION: ${question}`,
          config: { temperature: 0.2 },
        });
        if (res.text) {
          answer = res.text;
          break;
        }
      } catch {
        // try next fallback model
      }
    }

    return NextResponse.json({
      success: true,
      answer: answer || vdrAnswer || 'No response generated.',
      isDemoFallback: !answer,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Assistant query failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
