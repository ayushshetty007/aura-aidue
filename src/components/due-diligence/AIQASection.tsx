import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, FileText, ArrowRight, ChevronDown, ChevronUp, Loader2, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { VDRDocument } from '@/types';

interface AIQASectionProps {
  dealName: string;
  projectId?: string;
}

interface ChatMessage {
  sender: 'user' | 'copilot';
  text: string;
  time: string;
  isDemoFallback?: boolean;
  evidence?: {
    documentName: string;
    pageNumber: number;
    excerpt: string;
    relevance?: number;
  }[];
  metrics?: {
    latencyMs?: number;
    retrievedCount?: number;
  };
}

export const AIQASection: React.FC<AIQASectionProps> = ({ dealName, projectId = 'dd-101' }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<number, boolean>>({ 1: true });
  const [activeUploadedDoc, setActiveUploadedDoc] = useState<VDRDocument | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'user',
      text: 'What are the major revenue drivers and customer concentration risk?',
      time: '10:14 AM'
    },
    {
      sender: 'copilot',
      text: `Based on cross-indexing of ${dealName} files (Audited 10-K & CIM):

1. **Kubernetes Auto-scaler SKU**: Represents 64% of total FY25 ARR (₹90.8M), growing 36% YoY driven by enterprise AI workload compute scaling.
2. **Customer Concentration Exposure**: Top 3 enterprise clients generate 48.2% of total ARR (₹68.4M). Client #1 renewal is up in Q2 2027.`,
      time: '10:14 AM',
      isDemoFallback: true,
      evidence: [
        {
          documentName: 'CloudScale_Systems_FY25_10K_Annual_Report.pdf',
          pageNumber: 42,
          excerpt: '"Customer Alpha, Beta, and Gamma collectively represented ₹68.4M (48.2%) of total ARR as of Q3 FY26."',
          relevance: 0.94
        },
        {
          documentName: 'Project_Valkyrie_Confidential_Information_Memo.pdf',
          pageNumber: 19,
          excerpt: '"Auto-scaler SKU generated ₹90.8M in FY25 recurring subscriptions under flat-rate and usage-based tiers."',
          relevance: 0.89
        }
      ]
    }
  ]);

  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([
    'What are the major revenue drivers?',
    'How has profitability changed?',
    'What are the company\'s biggest risks?',
    'What debt obligations exist?',
    'What growth opportunities are mentioned?',
    'Are there inconsistencies between documents?'
  ]);

  // Check for uploaded custom documents for this project
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/documents?projectId=${encodeURIComponent(projectId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !Array.isArray(data.documents)) return;
        // Identify uploaded custom document (first one with uploadDate 'Just now' or not default mock)
        const customDoc = data.documents.find(
          (d: VDRDocument) => !['CloudScale_CIM_Final_2026.pdf', 'Audited_Financials_FY2025_10K.pdf', 'Management_Presentation_Q3.pptx'].includes(d.fileName)
        );

        if (customDoc) {
          setActiveUploadedDoc(customDoc);
          setPromptSuggestions([
            'What was total revenue in FY2025–26?',
            'What was the year-over-year revenue growth?',
            'What was operating profit in FY2025–26?',
            'How much cash and cash equivalents did the company report at year-end?',
            'What risks are described in the report?',
          ]);
        }
      })
      .catch((err) => console.warn('[AIQASection] Error checking uploaded docs:', err));

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || isLoading) return;

    setErrorMsg(null);
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { sender: 'user', text: q, time: 'Just now' },
    ];
    setChatHistory(newHistory);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          question: q
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process question with AI Copilot');
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: data.answer,
          time: 'Just now',
          isDemoFallback: data.isDemoFallback,
          evidence: data.sources || [],
          metrics: data.evalMetrics || data.metrics
        }
      ]);

      setExpandedEvidence((prev) => ({ ...prev, [newHistory.length]: true }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while connecting to AI backend';
      setErrorMsg(errorMessage);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: `⚠️ Query Failed: ${errorMessage}\n\nPlease check your system configuration or try again.`,
          time: 'Just now',
          isDemoFallback: true,
          evidence: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEvidence = (index: number) => {
    setExpandedEvidence((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col h-[600px]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono">
              Document-Grounded AI Q&A Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Query VDR filings with mandatory evidence & page citations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeUploadedDoc ? (
            <Badge variant="green" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Grounded in {activeUploadedDoc.fileName}
            </Badge>
          ) : (
            <Badge variant="green">Grounding Pipeline Active</Badge>
          )}
        </div>
      </div>

      {activeUploadedDoc && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Active Document: <strong className="text-slate-100">{activeUploadedDoc.fileName}</strong> ({activeUploadedDoc.pageCount} pages, vector indexed)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
            Project: {projectId}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'copilot' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-emerald-600/90 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1.5 text-[10px] text-slate-400 font-mono">
                <span>{msg.sender === 'user' ? 'Deal Analyst' : 'AI Copilot'}</span>
                {msg.sender === 'copilot' && (
                  <span className="flex items-center gap-1">
                    {msg.isDemoFallback ? (
                      <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Demo Grounding
                      </span>
                    ) : (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Live Gemini RAG
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

              {/* Metrics bar if available */}
              {msg.metrics && (
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3 pt-1 border-t border-slate-800/50">
                  {msg.metrics.latencyMs && <span>Latency: {msg.metrics.latencyMs}ms</span>}
                  {msg.metrics.retrievedCount !== undefined && (
                    <span>Retrieved: {msg.metrics.retrievedCount} chunks</span>
                  )}
                </div>
              )}

              {/* Expandable Evidence & Sources Section */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleEvidence(i)}
                    className="flex items-center justify-between w-full text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/5 hover:bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Evidence & Sources ({msg.evidence.length} Cited)
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      {expandedEvidence[i] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {expandedEvidence[i] && (
                    <div className="space-y-2 font-mono text-[11px]">
                      {msg.evidence.map((ev, ei) => (
                        <div key={ei} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-slate-300 font-bold">
                            <span className="truncate max-w-[240px]">{ev.documentName}</span>
                            <div className="flex items-center gap-2 text-[10px]">
                              {ev.relevance !== undefined && (
                                <span className="text-slate-400">
                                  Score: {(ev.relevance > 1 ? ev.relevance : ev.relevance * 100).toFixed(0)}%
                                </span>
                              )}
                              <span className="text-emerald-400">Page {ev.pageNumber}</span>
                            </div>
                          </div>
                          <p className="text-slate-400 italic font-sans text-[11px] leading-relaxed bg-slate-900 p-2 rounded border border-slate-800/80">
                            {ev.excerpt}
                          </p>
                          <span className="text-[9px] text-slate-500 uppercase block tracking-wider">
                            {msg.isDemoFallback ? 'Demo Evidence (Simulated Grounding)' : 'Verified Document Citation'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-emerald-400 font-mono p-3 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse">
            <Bot className="w-4 h-4" />
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Retrieving vector embeddings & synthesizing answer with Gemini...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="pt-3 pb-2 flex flex-wrap gap-1.5">
        {promptSuggestions.map((prompt, pi) => (
          <button
            key={pi}
            disabled={isLoading}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors flex items-center gap-1 font-mono disabled:opacity-50"
          >
            {prompt}
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          disabled={isLoading}
          placeholder="Ask Copilot any question about financial covenants, risks, EBITDA, revenue..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:hover:bg-emerald-500"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
