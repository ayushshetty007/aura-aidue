import { GoogleGenAI } from '@google/genai';
import {
  CompanyAnalysisData,
  CrossDocComparisonMetric,
  DetailedOpportunity,
  DetailedRisk,
  DueDiligenceProject,
  InvestmentAssessmentData,
  ProjectDueDiligenceAnalysis,
} from '@/types';
import { getGeminiApiKey } from '../config/env';
import {
  MOCK_CROSS_DOC_METRICS,
  MOCK_DETAILED_OPPORTUNITIES,
  MOCK_DETAILED_RISKS,
  MOCK_INVESTMENT_ASSESSMENT,
} from '../mockData';
import { globalVectorStore } from '../rag/vector-store';
import { TextChunk } from '../rag/types';
import {
  getCachedProjectAnalysis,
  getProjectById,
  getSettings,
  saveProjectAnalysis,
  upsertProject,
} from '../storage/app-storage';
import { getProjectDocuments } from '../storage/document-storage';
import { inferCurrencyFromTicker } from '../utils';

function buildSeededAnalysisFromProject(
  project: DueDiligenceProject,
  documentNames: string[],
  isDemoFallback: boolean,
  fallbackReason?: string
): ProjectDueDiligenceAnalysis {
  const currency = project.currency || inferCurrencyFromTicker(project.ticker);
  const rev = project.financialHighlights?.revenue || 100000000;
  const ebitdaMargin = project.financialHighlights?.ebitdaMargin || 22;
  const ebitda = Math.round(rev * (ebitdaMargin / 100));
  const netProfit = Math.round(ebitda * 0.58);

  const companyAnalysis: CompanyAnalysisData = {
    companyName: project.name,
    ticker: project.ticker,
    currency,
    executiveSummary: project.executiveSummary,
    businessModelSummary: `${project.name} operates in the ${project.sector} sector with an estimated EBITDA margin of ${ebitdaMargin}% and annual revenue growth of ${project.financialHighlights?.revenueGrowth ?? 20}%.`,
    competitivePositionSummary: `Target holds an established market footprint in ${project.sector} with ${project.status} conviction rating at ${project.ebitdaMultiple}x entry EBITDA.`,
    grossMarginMoat: `Estimated ${ebitdaMargin}% operating EBITDA margin with disciplined capital deployment.`,
    industryContext: `Active diligence across ${project.sector} secular growth vectors.`,
    cagrLabel: `+${project.financialHighlights?.revenueGrowth ?? 24}% YoY`,
    metrics: {
      revenue: rev,
      revenueGrowth: project.financialHighlights?.revenueGrowth ?? 24,
      ebitda,
      netProfit,
      eps: Number((netProfit / 10000000).toFixed(2)) || 1.5,
      netDebt: Math.round(ebitda * (project.financialHighlights?.netDebtToEbitda ?? 1.5)),
      cashAndEquivalents: Math.round(rev * 0.18),
      operatingMargin: ebitdaMargin,
    },
    trajectory: [
      { year: 'FY23', revenue: Math.round(rev * 0.62), ebitda: Math.round(ebitda * 0.52) },
      { year: 'FY24', revenue: Math.round(rev * 0.78), ebitda: Math.round(ebitda * 0.74) },
      { year: 'FY25', revenue: rev, ebitda },
      {
        year: 'FY26 Est',
        revenue: Math.round(rev * (1 + (project.financialHighlights?.revenueGrowth ?? 20) / 100)),
        ebitda: Math.round(ebitda * 1.24),
      },
    ],
    segments: [
      {
        name: `${project.sector} Core Platform`,
        sharePercent: 68,
        revenueLabel: `${Math.round(rev * 0.68)}`,
        description: 'Primary recurring revenue and core product line.',
      },
      {
        name: 'Enterprise & Expansion',
        sharePercent: 24,
        revenueLabel: `${Math.round(rev * 0.24)}`,
        description: 'High-growth enterprise expansion & upsell segment.',
      },
      {
        name: 'Services & Ancillary',
        sharePercent: 8,
        revenueLabel: `${Math.round(rev * 0.08)}`,
        description: 'Implementation, support, and strategic partnerships.',
      },
    ],
  };

  const risks: DetailedRisk[] =
    project.id === 'dd-101' && documentNames.length === 0
      ? MOCK_DETAILED_RISKS
      : (project.risks || []).length > 0
      ? project.risks.map((r, i) => ({
          id: `risk-${project.id}-${i}`,
          title: r.category,
          category: 'Business Risk',
          severity: r.severity,
          description: r.description,
          evidenceSource: documentNames[0] || `${project.ticker}_VDR_Summary`,
          evidenceSnippet: r.description,
          potentialImpact: `Could impact target IRR (${project.targetIrr}%) and margin stability if unmitigated.`,
          factorsToMonitor: ['Quarterly margin trend', 'Customer concentration', 'Management guidance'],
        }))
      : MOCK_DETAILED_RISKS;

  const opportunities: DetailedOpportunity[] =
    project.id === 'dd-101' && documentNames.length === 0
      ? MOCK_DETAILED_OPPORTUNITIES
      : (project.opportunities || []).length > 0
      ? project.opportunities.map((o, i) => ({
          id: `opp-${project.id}-${i}`,
          title: o.category,
          category: 'Revenue Growth',
          supportingEvidence: o.description,
          evidenceSnippet: o.description,
          potentialImpact: `${o.impact} upside impact on revenue expansion and EBITDA multiple expansion.`,
          growthDriver: o.category,
          risksConstraints: 'Execution timeline and capital allocation discipline.',
          sourceDocument: documentNames[0] || `${project.ticker}_VDR_Summary`,
        }))
      : MOCK_DETAILED_OPPORTUNITIES;

  const crossDocComparison: CrossDocComparisonMetric[] =
    documentNames.length >= 2
      ? [
          {
            id: 'cmp-1',
            metric: 'Reported Revenue Baseline',
            docA: documentNames[0],
            docB: documentNames[1],
            difference: 'Requires Gemini extraction (add key in .env.local)',
            status: 'Consistent',
            notes: 'Both documents indexed in VDR and ready for live LLM variance verification.',
          },
        ]
      : documentNames.length === 1
      ? [
          {
            id: 'cmp-single',
            metric: 'Single Document Indexed',
            docA: documentNames[0],
            docB: 'Upload a 2nd PDF to compare',
            difference: 'Awaiting 2nd VDR file',
            status: 'Missing',
            notes: 'Cross-document verification compares metrics automatically once 2+ PDFs are uploaded.',
          },
        ]
      : MOCK_CROSS_DOC_METRICS;

  const investmentAssessment: InvestmentAssessmentData =
    project.id === 'dd-101' && documentNames.length === 0
      ? MOCK_INVESTMENT_ASSESSMENT
      : {
          businessQualityScore: Math.min(98, project.score + 2),
          financialStrengthScore: Math.max(55, project.score - 3),
          growthIndicatorScore: Math.min(
            98,
            Math.round(65 + (project.financialHighlights?.revenueGrowth || 20) * 0.6)
          ),
          riskLevel:
            project.status === 'Flagged Risk'
              ? 'High'
              : project.score >= 85
              ? 'Low'
              : 'Moderate',
          opportunityLevel: project.score >= 85 ? 'High Conviction' : 'Moderate',
          overallScore: project.score,
          positiveIndicators: (project.opportunities || []).map((o) => `${o.category}: ${o.description}`),
          areasRequiringReview: (project.risks || []).map((r) => `${r.category}: ${r.description}`),
          potentialOpportunities: (project.opportunities || []).map((o) => o.description),
          risksToMonitor: (project.risks || []).map((r) => r.description),
          overallThesis: project.executiveSummary,
        };

  return {
    projectId: project.id,
    analyzedAt: new Date().toISOString(),
    documentNames,
    isDemoFallback,
    fallbackReason,
    companyAnalysis,
    risks,
    opportunities,
    crossDocComparison,
    investmentAssessment,
  };
}

function buildHeuristicAnalysisFromChunks(
  project: DueDiligenceProject,
  chunks: TextChunk[],
  documentNames: string[],
  reason: string
): ProjectDueDiligenceAnalysis {
  const base = buildSeededAnalysisFromProject(project, documentNames, true, reason);
  if (chunks.length === 0) return base;

  // Pick salient snippets containing financial keywords
  const finChunks = chunks.filter((c) =>
    /revenue|profit|ebitda|margin|cash|debt|growth|loss|crore|million|billion/i.test(c.text)
  );
  const riskChunks = chunks.filter((c) =>
    /risk|litigation|concentration|headwind|regulatory|debt|challenge|decline|loss/i.test(c.text)
  );
  const oppChunks = chunks.filter((c) =>
    /opportunity|expansion|growth|ai|launch|market share|margin expansion|export/i.test(c.text)
  );

  if (finChunks.length > 0) {
    base.companyAnalysis.executiveSummary = `Extracted from ${documentNames.join(', ')}: ${finChunks[0].text.substring(0, 320)}...`;
  }

  if (riskChunks.length > 0) {
    base.risks = riskChunks.slice(0, 4).map((rc, i) => ({
      id: `heur-risk-${i}`,
      title: `Document-Flagged Risk (${rc.documentName}, p.${rc.pageNumber})`,
      category: 'Business Risk',
      severity: i === 0 ? 'High' : 'Medium',
      description: rc.text.substring(0, 180) + '...',
      evidenceSource: `${rc.documentName} (Page ${rc.pageNumber})`,
      evidenceSnippet: rc.text.substring(0, 260),
      potentialImpact: 'Flagged in uploaded filing text; configure GOOGLE_GENERATIVE_AI_API_KEY for full AI impact quantification.',
      factorsToMonitor: ['Verify quantitative impact in financial notes', 'Track management commentary'],
    }));
  }

  if (oppChunks.length > 0) {
    base.opportunities = oppChunks.slice(0, 4).map((oc, i) => ({
      id: `heur-opp-${i}`,
      title: `Growth Catalyst (${oc.documentName}, p.${oc.pageNumber})`,
      category: 'Revenue Growth',
      supportingEvidence: `Extracted from page ${oc.pageNumber} of ${oc.documentName}`,
      evidenceSnippet: oc.text.substring(0, 260),
      potentialImpact: 'Positive expansion driver cited in VDR filing.',
      growthDriver: oc.text.substring(0, 90) + '...',
      risksConstraints: 'Subject to execution & market conditions.',
      sourceDocument: `${oc.documentName} (Page ${oc.pageNumber})`,
    }));
  }

  return base;
}

function sampleRepresentativeChunks(chunks: TextChunk[], maxChars = 28000): string {
  // Group by document so every uploaded PDF is represented in the single extraction call
  const byDoc = new Map<string, TextChunk[]>();
  for (const ch of chunks) {
    const arr = byDoc.get(ch.documentName) || [];
    arr.push(ch);
    byDoc.set(ch.documentName, arr);
  }

  const docCount = Math.max(1, byDoc.size);
  const budgetPerDoc = Math.floor(maxChars / docCount);
  const sections: string[] = [];

  for (const [docName, docChunks] of byDoc.entries()) {
    let used = 0;
    const picked: string[] = [];
    // Prioritize early pages + financial/risk keyword pages
    const prioritized = [...docChunks].sort((a, b) => {
      const aScore =
        (a.pageNumber <= 5 ? 2 : 0) +
        (/revenue|profit|ebitda|risk|debt|cash|guidance|fy2/i.test(a.text) ? 2 : 0);
      const bScore =
        (b.pageNumber <= 5 ? 2 : 0) +
        (/revenue|profit|ebitda|risk|debt|cash|guidance|fy2/i.test(b.text) ? 2 : 0);
      return bScore - aScore || a.pageNumber - b.pageNumber;
    });

    for (const chunk of prioritized) {
      const entry = `[Doc: "${chunk.documentName}" | Page ${chunk.pageNumber}]\n${chunk.text}`;
      if (used + entry.length > budgetPerDoc) break;
      picked.push(entry);
      used += entry.length;
    }
    sections.push(`=== DOCUMENT: ${docName} ===\n${picked.join('\n\n')}`);
  }

  return sections.join('\n\n');
}

function safeParseJson<T>(rawText: string): T | null {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(rawText.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Runs a SINGLE structured Gemini JSON extraction call per project and caches the result
 * in .data/analyses.json to stay fast and well within Gemini free-tier RPM limits.
 */
export async function analyzeProjectDocuments(
  projectId: string,
  options: { force?: boolean } = {}
): Promise<ProjectDueDiligenceAnalysis> {
  if (!options.force) {
    const cached = getCachedProjectAnalysis(projectId);
    if (cached) return cached;
  }

  const project = getProjectById(projectId) || {
    id: projectId,
    name: `Project ${projectId}`,
    ticker: 'TARGET',
    sector: 'Corporate',
    currency: 'INR' as const,
    stage: 'Initial Review' as const,
    status: 'Under Review' as const,
    targetIrr: 20,
    dealSize: 100000000,
    ebitdaMultiple: 14,
    score: 78,
    updatedAt: 'Just now',
    analyst: 'Rohan Mehta',
    executiveSummary: 'Due diligence project.',
    documentsCount: 0,
    risks: [],
    opportunities: [],
    financialHighlights: {
      revenue: 100000000,
      revenueGrowth: 15,
      ebitdaMargin: 20,
      netDebtToEbitda: 1.5,
      freeCashFlow: 15000000,
    },
  };

  const chunks = globalVectorStore.getProjectChunks(projectId);
  const docs = getProjectDocuments(projectId);
  const documentNames = Array.from(
    new Set([
      ...chunks.map((c) => c.documentName),
      ...docs.filter((d) => d.uploadDate === 'Just now' || chunks.some((c) => c.documentName === d.fileName)).map((d) => d.fileName),
    ])
  );

  // If no uploaded chunks exist yet, return seeded project analysis without burning an API call
  if (chunks.length === 0) {
    const seeded = buildSeededAnalysisFromProject(
      project,
      docs.map((d) => d.fileName),
      true,
      'No custom PDFs uploaded to this project yet. Upload a company PDF in Documents (VDR) to trigger live Gemini extraction.'
    );
    return seeded;
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const heuristic = buildHeuristicAnalysisFromChunks(
      project,
      chunks,
      documentNames,
      'GOOGLE_GENERATIVE_AI_API_KEY is still a placeholder in .env.local. Showing heuristic VDR extraction.'
    );
    saveProjectAnalysis(projectId, heuristic);
    return heuristic;
  }

  const contextText = sampleRepresentativeChunks(chunks);
  const currency = project.currency || inferCurrencyFromTicker(project.ticker);
  const settings = getSettings();
  const modelName = settings.model.toLowerCase().includes('pro')
    ? 'gemini-3.1-pro-preview'
    : 'gemini-3-flash-preview';

  const prompt = `You are AURA, an institutional investment due-diligence AI.
Analyze the uploaded VDR document excerpts for "${project.name}" (Ticker: ${project.ticker}, Sector: ${project.sector}, Preferred Currency: ${currency}) and return ONLY ONE valid JSON object matching this exact schema (no markdown fences, no commentary).

Required JSON Schema:
{
  "companyAnalysis": {
    "companyName": "string",
    "ticker": "string",
    "currency": "INR" | "USD",
    "executiveSummary": "2-3 sentence grounded executive summary",
    "businessModelSummary": "string",
    "competitivePositionSummary": "string",
    "grossMarginMoat": "string",
    "industryContext": "string",
    "cagrLabel": "e.g. +18.4% YoY",
    "metrics": {
      "revenue": number (raw numeric value in base currency units, e.g. 4396950000000 or 142000000; 0 if unknown),
      "revenueGrowth": number (percentage e.g. 14.2),
      "ebitda": number,
      "netProfit": number (negative if net loss),
      "eps": number,
      "netDebt": number,
      "cashAndEquivalents": number,
      "operatingMargin": number (percentage)
    },
    "trajectory": [
      { "year": "FY23", "revenue": number, "ebitda": number },
      { "year": "FY24", "revenue": number, "ebitda": number },
      { "year": "FY25", "revenue": number, "ebitda": number }
    ],
    "segments": [
      { "name": "string", "sharePercent": number, "revenueLabel": "string", "description": "string" }
    ]
  },
  "risks": [
    {
      "id": "risk-1",
      "title": "string",
      "category": "Financial Risk" | "Operational Risk" | "Business Risk" | "Market Risk" | "Regulatory Risk",
      "severity": "High" | "Medium" | "Low",
      "description": "string",
      "evidenceSource": "DocumentName.pdf (Page X)",
      "evidenceSnippet": "short direct quote or figure from text",
      "potentialImpact": "string",
      "factorsToMonitor": ["string", "string"]
    }
  ],
  "opportunities": [
    {
      "id": "opp-1",
      "title": "string",
      "category": "Revenue Growth" | "Market Expansion" | "Product Growth" | "Operational Improvement" | "Industry Growth" | "Strategic Opportunities",
      "supportingEvidence": "string",
      "evidenceSnippet": "short direct quote or figure from text",
      "potentialImpact": "string",
      "growthDriver": "string",
      "risksConstraints": "string",
      "sourceDocument": "DocumentName.pdf (Page X)"
    }
  ],
  "crossDocComparison": [
    {
      "id": "cmp-1",
      "metric": "string",
      "docA": "value & source",
      "docB": "value & source (or 'Single PDF uploaded')",
      "difference": "string",
      "status": "Consistent" | "Changed" | "Potential Inconsistency" | "Missing",
      "notes": "string"
    }
  ],
  "investmentAssessment": {
    "businessQualityScore": number (0-100),
    "financialStrengthScore": number (0-100),
    "growthIndicatorScore": number (0-100),
    "riskLevel": "Low" | "Moderate" | "High" | "Severe",
    "opportunityLevel": "High Conviction" | "Moderate" | "Selective",
    "overallScore": number (0-100),
    "positiveIndicators": ["string"],
    "areasRequiringReview": ["string"],
    "potentialOpportunities": ["string"],
    "risksToMonitor": ["string"],
    "overallThesis": "3-4 sentence investment committee synthesis grounded in the PDFs"
  }
}

Rules:
- Ground every metric, risk, opportunity, and citation strictly in the supplied text.
- Provide 3-5 risks, 3-4 opportunities, 3-5 cross-doc comparison rows, and 3 segments (use best-supported figures if exact split isn't stated).
- If only 1 document is uploaded, populate crossDocComparison with key metrics verified across sections/pages of that document and mark secondary doc as "N/A (Single PDF)".

UPLOADED VDR EXCERPTS:
${contextText}`;

  try {
    const aiClient = new GoogleGenAI({ apiKey });
    let rawJson = '';
    for (const candidate of Array.from(
      new Set([modelName, 'gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-2.5-flash'])
    )) {
      try {
        const res = await aiClient.models.generateContent({
          model: candidate,
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        });
        if (res.text) {
          rawJson = res.text;
          break;
        }
      } catch (err) {
        console.warn(`[DueDiligenceAnalyzer] Model ${candidate} failed:`, err);
      }
    }

    const parsed = safeParseJson<Omit<ProjectDueDiligenceAnalysis, 'projectId' | 'analyzedAt' | 'documentNames' | 'isDemoFallback'>>(rawJson);
    if (!parsed || !parsed.companyAnalysis || !parsed.investmentAssessment) {
      const heuristic = buildHeuristicAnalysisFromChunks(
        project,
        chunks,
        documentNames,
        'Gemini returned unparseable output; using grounded heuristic extraction.'
      );
      saveProjectAnalysis(projectId, heuristic);
      return heuristic;
    }

    const finalAnalysis: ProjectDueDiligenceAnalysis = {
      projectId,
      analyzedAt: new Date().toISOString(),
      documentNames,
      isDemoFallback: false,
      companyAnalysis: parsed.companyAnalysis,
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      crossDocComparison: Array.isArray(parsed.crossDocComparison)
        ? parsed.crossDocComparison
        : [],
      investmentAssessment: parsed.investmentAssessment,
    };

    saveProjectAnalysis(projectId, finalAnalysis);

    // Sync headline score/summary back to persisted project record
    const existingProj = getProjectById(projectId);
    if (existingProj) {
      upsertProject({
        ...existingProj,
        score: finalAnalysis.investmentAssessment.overallScore || existingProj.score,
        executiveSummary:
          finalAnalysis.companyAnalysis.executiveSummary || existingProj.executiveSummary,
        documentsCount: Math.max(existingProj.documentsCount, documentNames.length),
        updatedAt: 'Just now',
        financialHighlights: {
          revenue:
            finalAnalysis.companyAnalysis.metrics.revenue ||
            existingProj.financialHighlights.revenue,
          revenueGrowth:
            finalAnalysis.companyAnalysis.metrics.revenueGrowth ||
            existingProj.financialHighlights.revenueGrowth,
          ebitdaMargin:
            finalAnalysis.companyAnalysis.metrics.operatingMargin ||
            existingProj.financialHighlights.ebitdaMargin,
          netDebtToEbitda: existingProj.financialHighlights.netDebtToEbitda,
          freeCashFlow: existingProj.financialHighlights.freeCashFlow,
        },
      });
    }

    return finalAnalysis;
  } catch (err) {
    console.warn('[DueDiligenceAnalyzer] Gemini extraction failed:', err);
    const heuristic = buildHeuristicAnalysisFromChunks(
      project,
      chunks,
      documentNames,
      'Gemini API call failed; showing grounded heuristic extraction.'
    );
    saveProjectAnalysis(projectId, heuristic);
    return heuristic;
  }
}
