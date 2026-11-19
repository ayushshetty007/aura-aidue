import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface DocumentUploadProps {
  projectId?: string;
  onUploadComplete?: (newDoc: { 
    fileName: string; 
    documentType: 'Annual Report' | 'Financial Statements' | 'Investor Presentation' | 'Earnings Report' | 'Market/Industry Report' | 'Other';
    pageCount?: number;
    chunkCount?: number;
  }) => void;
}

interface UploadedFileItem {
  name: string;
  size: string;
  status: string;
  pages: number;
  chunks?: number;
  aiTags: string[];
  isDemoFallback?: boolean;
}

const DEFAULT_MOCK_FILES: UploadedFileItem[] = [
  { name: 'CloudScale_CIM_Final_2026.pdf', size: '14.2 MB', status: 'Parsed', pages: 48, chunks: 76, aiTags: ['Financials', 'Cap Table'], isDemoFallback: true },
  { name: 'Audited_Financials_FY2025_10K.pdf', size: '28.6 MB', status: 'Parsed', pages: 124, chunks: 198, aiTags: ['Audited 10-K', 'Risk Factors'], isDemoFallback: true },
  { name: 'Management_Presentation_Q3.pptx', size: '8.4 MB', status: 'Parsed', pages: 32, chunks: 45, aiTags: ['Product Roadmap'], isDemoFallback: true },
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  projectId = 'dd-101', 
  onUploadComplete 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFileItem[]>(DEFAULT_MOCK_FILES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync uploaded files from persistent server store on mount and tab return
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/documents?projectId=${encodeURIComponent(projectId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !Array.isArray(data.documents)) return;

        const defaultNames = new Set(DEFAULT_MOCK_FILES.map((f) => f.name.toLowerCase()));
        // Identify uploaded custom files
        const customDocs = data.documents.filter(
          (d: { fileName?: string }) => d.fileName && !defaultNames.has(d.fileName.toLowerCase())
        );

        if (customDocs.length > 0) {
          const customItems: UploadedFileItem[] = customDocs.map((d: { fileName: string; fileSize?: string; processingStatus?: string; pageCount?: number; chunkCount?: number }) => ({
            name: d.fileName,
            size: d.fileSize || '30 KB',
            status: d.processingStatus || 'Parsed',
            pages: d.pageCount || 1,
            chunks: d.chunkCount || 12,
            aiTags: ['Uploaded Filing', 'Live Vector Index'],
            isDemoFallback: false,
          }));

          setFiles((prev) => {
            const currentNames = new Set(prev.map((f) => f.name.toLowerCase()));
            const toAdd = customItems.filter((item) => !currentNames.has(item.name.toLowerCase()));
            return [...toAdd, ...prev];
          });
        }
      })
      .catch((err) => console.warn('[DocumentUpload] Could not sync ingested files:', err));

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const processFileUpload = async (file: File) => {
    // 1. Validate PDF file format
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Security Validation: Only PDF files (.pdf) are permitted for document-grounded processing.');
      return;
    }

    // 2. Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File Size Limit: Document exceeds maximum allowable size of 20MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process and vectorize document.');
      }

      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      const docName = data.document?.fileName || data.document?.name || file.name || 'Uploaded_Document.pdf';
      const newDocItem: UploadedFileItem = {
        name: docName,
        size: formattedSize,
        status: data.document?.status || data.document?.processingStatus || 'Parsed',
        pages: data.document?.pageCount || 1,
        chunks: data.document?.chunkCount || 12,
        aiTags: ['Uploaded Filing', 'Live Vector Index'],
        isDemoFallback: false,
      };

      setFiles((prev) => [newDocItem, ...prev.filter((f) => f.name.toLowerCase() !== docName.toLowerCase())]);

      if (onUploadComplete) {
        onUploadComplete({
          fileName: docName,
          documentType: 'Financial Statements',
          pageCount: newDocItem.pages,
          chunkCount: newDocItem.chunks,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading document';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFileUpload(selectedFile);
    }
  };

  const handleSimulateUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Upload Dropzone Box */}
      <div 
        onClick={handleSimulateUpload}
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
          {isUploading ? 'Ingesting, Chunking & Vectorizing PDF...' : 'Click or Drop PDF to Upload & Process'}
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Supports SEC PDF Filings (10-K, 10-Q), CIM PDF, Pitch Decks & Annual Reports (Max 20MB).
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
          <Sparkles className="w-3 h-3" /> Server-side PDF Text Parsing + Persistent Vector Store Active
        </div>
      </div>

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button 
            onClick={() => setUploadError(null)} 
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>INGESTED VIRTUAL DATA ROOM (VDR) ({files.length} Files)</span>
          <span>Vector Index Status</span>
        </div>

        {files.map((file, idx) => (
          <div
            key={idx}
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

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {file.isDemoFallback ? 'Indexed (Demo)' : 'Indexed (Live RAG)'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
