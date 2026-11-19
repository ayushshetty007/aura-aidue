import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_VDR_DOCUMENTS } from '@/lib/mockData';
import { VDRDocument } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { DocumentUpload } from './DocumentUpload';
import { 
  FolderLock, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Search, 
  CheckCircle2, 
  FileSpreadsheet, 
  Building2, 
  PieChart,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface DocumentLibrarySectionProps {
  projectId?: string;
}

export const DocumentLibrarySection: React.FC<DocumentLibrarySectionProps> = ({ projectId = 'dd-101' }) => {
  const [documents, setDocuments] = useState<VDRDocument[]>(MOCK_VDR_DOCUMENTS);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const reloadDocuments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/documents?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) {
        throw new Error(`Failed to load documents (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.documents) && data.documents.length > 0) {
        setDocuments(data.documents);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching document list';
      console.warn('[DocumentLibrarySection] Error reloading documents:', message);
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isCancelled = false;
    fetch(`/api/documents?projectId=${encodeURIComponent(projectId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data.success && Array.isArray(data.documents) && data.documents.length > 0) {
          setDocuments(data.documents);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Error fetching document list';
          setFetchError(message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  const docTypes = [
    'All',
    'Annual Report',
    'Financial Statements',
    'Investor Presentation',
    'Earnings Report',
    'Market/Industry Report',
    'Other'
  ];

  const filteredDocs = documents.filter((doc) => {
    if (!doc) return false;
    const docName = doc.fileName || (doc as unknown as { name?: string }).name || '';
    const docType = doc.documentType || 'Other';
    const matchesType = selectedType === 'All' || docType === selectedType;
    const matchesSearch = docName.toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchesType && matchesSearch;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Annual Report':
        return Building2;
      case 'Financial Statements':
        return FileSpreadsheet;
      case 'Investor Presentation':
        return PieChart;
      case 'Earnings Report':
        return Clock;
      case 'Market/Industry Report':
        return Layers;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone Section */}
      <DocumentUpload
        projectId={projectId}
        onUploadComplete={(newDoc) => {
          const docName = newDoc.fileName || (newDoc as unknown as { name?: string }).name || 'Uploaded_Document.pdf';
          const doc: VDRDocument = {
            id: `vdr-${Date.now()}`,
            fileName: docName,
            documentType: newDoc.documentType || 'Financial Statements',
            uploadDate: 'Just now',
            processingStatus: 'Processed',
            pageCount: newDoc.pageCount || 1,
            analysisStatus: 'Complete',
            fileSize: 'Uploaded'
          };
          setDocuments((prev) => [doc, ...prev.filter((d) => d.fileName.toLowerCase() !== docName.toLowerCase())]);
          // Refresh from server to sync persisted store
          reloadDocuments();
        }}
      />

      {/* Document Library Header & Filters */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Virtual Data Room (VDR) Vault</h2>
              <p className="text-xs text-slate-400">Indexed disclosures, 10-Ks, financial statements, and CIM filings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Syncing VDR...
              </span>
            )}
            <Badge variant="green">{filteredDocs.length} Documents Indexed</Badge>
          </div>
        </div>

        {/* Loading / Error States */}
        {fetchError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Could not refresh live document list: {fetchError}</span>
            </div>
            <button
              onClick={() => reloadDocuments()}
              className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            {docTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedType === t
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search VDR files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Document Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs font-mono text-left text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="p-3 font-bold uppercase text-[10px]">Document Name</th>
                <th className="p-3 font-bold uppercase text-[10px]">Category</th>
                <th className="p-3 font-bold uppercase text-[10px]">Uploaded</th>
                <th className="p-3 font-bold uppercase text-[10px]">Pages</th>
                <th className="p-3 font-bold uppercase text-[10px]">Processing</th>
                <th className="p-3 font-bold uppercase text-[10px]">Analysis Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDocs.map((doc, idx) => {
                const docName = doc?.fileName || (doc as unknown as { name?: string })?.name || 'Untitled Document';
                const docType = doc?.documentType || 'Other';
                const Icon = getIconForType(docType);
                const fileSize = doc?.fileSize || 'N/A';
                const uploadDate = doc?.uploadDate || 'Just now';
                const pageCount = doc?.pageCount ?? 0;
                const processingStatus = doc?.processingStatus || 'Processed';
                const analysisStatus = doc?.analysisStatus || 'In Review';
                return (
                  <tr key={doc?.id || `vdr-row-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 truncate max-w-xs">{docName}</div>
                          <div className="text-[10px] text-slate-500">{fileSize}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-semibold">{docType}</td>
                    <td className="p-3 text-slate-400">{uploadDate}</td>
                    <td className="p-3 text-slate-300 font-bold">{pageCount} pgs</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        {processingStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-fit ${
                          analysisStatus === 'Complete'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : analysisStatus === 'Flagged Discrepancy'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {analysisStatus === 'Complete' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : analysisStatus === 'Flagged Discrepancy' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {analysisStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
