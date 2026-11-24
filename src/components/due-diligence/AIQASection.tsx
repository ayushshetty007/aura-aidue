import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  FileText,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
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
  const [expandedEvidence, setExpandedEvidence] = useState<Record<number, boolean>>({});
  const [activeUploadedDocs, setActiveUploadedDocs] = useState<VDRDocument[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const promptSuggestions = [
    'What was total revenue and net profit/loss in the latest FY?',
    'What are the company’s biggest risks and debt obligations?',
    'How did margins and cash flow perform year-over-year?',
    'What growth opportunities or catalysts are highlighted?',
    'Are there any discrepancies across the uploaded documents?',
  ];

  // Load persisted chat history & uploaded docs whenever projectId changes
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch(`/api/documents?projectId=${encodeURIComponent(projectId)}`).then((r) => r.json()),
      fetch(`/api/qa?projectId=${encodeURIComponent(projectId)}`).then((r) => r.json()),
    ])
      .then(([docData, qaData]) => {
        if (!isMounted) return;
        setErrorMsg(null);
        const docs: VDRDocument[] = Array.isArray(docData.documents) ? docData.documents : [];
        const customDocs = docs.filter(
          (d) => d.uploadDate === 'Just now' || Boolean(d.chunkCount)
        );
        setActiveUploadedDocs(customDocs);

        if (qaData.success && Array.isArray(qaData.messages) && qaData.messages.length > 0) {
          setChatHistory(qaData.messages);
          setExpandedEvidence({ [qaData.messages.length - 1]: true });
        } else {
          setChatHistory([
            {
              sender: 'copilot',
              text:
                customDocs.length > 0
                  ? `Ready to answer evidence-grounded questions for **${dealName}** across ${customDocs.length} indexed PDF(s): ${customDocs.map((d) => d.fileName).join(', ')}.`
                  : `Ask any question about **${dealName}**. Upload a financial PDF in the Documents (VDR) tab to activate live vector retrieval and Gemini citations.`,
              time: 'Ready',
              isDemoFallback: customDocs.length === 0,
            },
          ]);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [projectId, dealName]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || isLoading) return;

    setErrorMsg(null);
    const nextUserIdx = chatHistory.length;
    setChatHistory((prev) => [...prev, { sender: 'user', text: q, time: 'Just now' }]);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, question: q }),
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
          metrics: {
            latencyMs: data.evalMetrics?.latencyMs,
            retrievedCount: (data.sources || []).length,
          },
        },
      ]);

      setExpandedEvidence((prev) => ({ ...prev, [nextUserIdx + 1]: true }));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while connecting to AI backend';
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    await fetch(`/api/qa?projectId=${encodeURIComponent(projectId)}`, { method: 'DELETE' }).catch(
      () => {}
    );
    setChatHistory([
      {
        sender: 'copilot',
        text: `Chat cleared for **${dealName}**. Ask a new question grounded in your uploaded VDR PDFs.`,
        time: 'Now',
        isDemoFallback: activeUploadedDocs.length === 0,
      },
    ]);
  };

  const toggleEvidence = (index: number) => {
    setExpandedEvidence((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col h-[620px]">
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
              Query VDR filings with persisted chat & mandatory page citations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeUploadedDocs.length > 0 ? (
            <Badge variant="green" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {activeUploadedDocs.length} PDF(s) Indexed
            </Badge>
          ) : (
            <Badge variant="amber">Awaiting PDF Upload</Badge>
          )}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeUploadedDocs.length > 0 && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              Active VDR:{' '}
              <strong className="text-slate-100">
                {activeUploadedDocs.map((d) => d.fileName).join(', ')}
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded shrink-0 ml-2">
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
                  ? 'bg-emerald-600/90 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1.5 text-[10px] text-slate-400 font-mono">
                <span>{msg.sender === 'user' ? 'Deal Analyst' : 'AI Copilot'}</span>
                {msg.sender === 'copilot' && (
                  <span className="flex items-center gap-1">
                    {msg.isDemoFallback ? (
                      <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Demo Fallback
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

              {msg.metrics && (
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3 pt-1 border-t border-slate-800/50">
                  {msg.metrics.latencyMs !== undefined && <span>Latency: {msg.metrics.latencyMs}ms</span>}
                  {msg.metrics.retrievedCount !== undefined && (
                    <span>Retrieved: {msg.metrics.retrievedCount} chunks</span>
                  )}
                </div>
              )}

              {msg.evidence && msg.evidence.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleEvidence(i)}
                    className="flex items-center justify-between w-full text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/5 hover:bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Evidence & Sources ({msg.evidence.length} Cited)
                    </span>
                    {expandedEvidence[i] ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {expandedEvidence[i] && (
                    <div className="space-y-2 font-mono text-[11px]">
                      {msg.evidence.map((ev, ei) => (
                        <div
                          key={ei}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                        >
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

      <div className="pt-3 pb-2 flex flex-wrap gap-1.5">
        {promptSuggestions.map((prompt, pi) => (
          <button
            key={pi}
            disabled={isLoading}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors flex items-center gap-1 font-mono disabled:opacity-50 cursor-pointer"
          >
            {prompt}
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        ))}
      </div>

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
          placeholder="Ask Copilot any question about financial statements, risks, profit, or debt..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
