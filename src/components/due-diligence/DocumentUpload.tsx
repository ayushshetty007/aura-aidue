import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProjectDueDiligenceAnalysis, VDRDocument } from '@/types';

interface DocumentUploadProps {
  projectId?: string;
  onUploadComplete?: (
    newDoc: VDRDocument,
    analysis?: ProjectDueDiligenceAnalysis | null
  ) => void;
}

interface UploadedFileItem {
  name: string;
  size: string;
  status: string;
  pages: number;
  chunks?: number;
  documentType: string;
  aiTags: string[];
  isDemoFallback?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId = 'dd-101',
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [documentType, setDocumentType] =
    useState<VDRDocument['documentType']>('Financial Statements');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/documents?projectId=${encodeURIComponent(projectId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !Array.isArray(data.documents)) return;
        const mapped: UploadedFileItem[] = data.documents.map((d: VDRDocument) => ({
          name: d.fileName,
          size: d.fileSize || 'PDF',
          status: d.processingStatus || 'Processed',
          pages: d.pageCount || 1,
          chunks: d.chunkCount,
          documentType: d.documentType || 'Financial Statements',
          aiTags: [
            d.documentType || 'Financials',
            d.uploadDate === 'Just now' || d.chunkCount ? 'Live Vector Index' : 'Starter VDR',
          ],
          isDemoFallback: !d.chunkCount && d.uploadDate !== 'Just now',
        }));
        setFiles(mapped);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const processFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files (.pdf) are permitted for document-grounded processing.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Document exceeds maximum allowable size of 20MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('documentType', documentType);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process and vectorize document.');
      }

      const doc: VDRDocument = data.document;
      const newItem: UploadedFileItem = {
        name: doc.fileName,
        size: doc.fileSize,
        status: doc.processingStatus,
        pages: doc.pageCount,
        chunks: doc.chunkCount,
        documentType: doc.documentType,
        aiTags: [doc.documentType, 'Live Vector Index'],
        isDemoFallback: false,
      };

      setFiles((prev) => [
        newItem,
        ...prev.filter((f) => f.name.toLowerCase() !== doc.fileName.toLowerCase()),
      ]);

      setUploadSuccessMsg(
        `Indexed "${doc.fileName}" (${doc.pageCount} pages, ${doc.chunkCount || 0} chunks) and refreshed single-call Due Diligence analysis.`
      );

      onUploadComplete?.(doc, data.analysis || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading document';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFileUpload(selectedFile);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Document Type Selector + Upload Dropzone */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <span className="text-xs font-mono text-slate-400">Document Category:</span>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as VDRDocument['documentType'])}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="Annual Report">Annual Report</option>
          <option value="Financial Statements">Financial Statements</option>
          <option value="Investor Presentation">Investor Presentation</option>
          <option value="Earnings Report">Earnings Report</option>
          <option value="Market/Industry Report">Market/Industry Report</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-900/80 rounded-2xl p-6 text-center cursor-pointer transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-emerald-500/10 text-slate-400 group-hover:text-emerald-400 border border-slate-700 group-hover:border-emerald-500/30 flex items-center justify-center mx-auto mb-3 transition-colors">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>
        <h4 className="text-sm font-semibold text-slate-200">
          {isUploading
            ? 'Parsing PDF, Indexing Vectors & Running Gemini Extraction...'
            : 'Click to Upload Financial PDF (10-K, Annual Report, Balance Sheet, Pitch Deck)'}
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Max 20MB PDF. Automatically updates AI Q&A, Company Analysis, Risks, Opportunities & Assessment.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
          <Sparkles className="w-3 h-3" /> Server-side PDF Text Parsing + Single-Call Gemini Extraction
        </div>
      </div>

      {uploadSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button
            onClick={() => setUploadSuccessMsg(null)}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>INGESTED VIRTUAL DATA ROOM ({files.length} Files)</span>
          <span>Vector Index Status</span>
        </div>

        {files.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
            No PDFs uploaded for this project yet. Upload a financial PDF above to begin.
          </div>
        ) : (
          files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    {file.name}
                    <span className="text-[10px] text-slate-500 font-mono">({file.size})</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {file.aiTags.map((tag) => (
                      <Badge key={tag} variant="slate" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    <span className="text-[10px] text-slate-400">{file.pages} pages</span>
                    {file.chunks && (
                      <span className="text-[10px] text-emerald-400/80 font-mono">
                        • {file.chunks} chunks
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {file.isDemoFallback ? 'Starter VDR' : 'Indexed (Live RAG)'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
