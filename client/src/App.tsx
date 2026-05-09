import { useState, useMemo, useCallback } from 'react';
import type { ExtractedRow, FilterState, SortState } from './types';
import { extractPdfText } from './utils/pdfExtract';
import { parsePipeText, rowsToPipeText, rowsToCsv } from './utils/parser';

import AppHeader from './components/AppHeader';
import UploadPanel from './components/UploadPanel';
import ExtractionSummary from './components/ExtractionSummary';
import FilterBar from './components/FilterBar';
import ReviewTable from './components/ReviewTable';
import RowDetailDrawer from './components/RowDetailDrawer';
import ExportModal from './components/ExportModal';

type AppView = 'upload' | 'review';
type ProcessingState = 'idle' | 'reading-pdf' | 'extracting' | 'error';

const DEFAULT_FILTERS: FilterState = { course: 'all', type: 'all', status: 'all', search: '' };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [view, setView]               = useState<AppView>('upload');
  const [files, setFiles]             = useState<File[]>([]);
  const [syllabusCount, setSyllabusCount] = useState(0);
  const [processing, setProcessing]   = useState<ProcessingState>('idle');
  const [error, setError]             = useState<string | null>(null);
  const [rows, setRows]               = useState<ExtractedRow[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showExport, setShowExport]   = useState(false);
  const [exporting, setExporting]     = useState(false);

  const [filters, setFilters]         = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort]               = useState<SortState | null>(null);

  // ── Derived data ─────────────────────────────────────────────────
  const courses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.course).filter(Boolean))).sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = filters.search.toLowerCase();
    return rows.filter((r) => {
      if (filters.course !== 'all' && r.course !== filters.course) return false;
      if (filters.type   !== 'all' && r.type   !== filters.type)   return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (q && !r.course.toLowerCase().includes(q) && !r.title.toLowerCase().includes(q) &&
               !r.date.toLowerCase().includes(q)   && !r.notes.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [rows, filters]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = a[sort.field] ?? '';
      const bv = b[sort.field] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sort]);

  const activeRow = useMemo(
    () => rows.find((r) => r.id === activeRowId) ?? null,
    [rows, activeRowId]
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setProcessing('reading-pdf');
    setError(null);

    try {
      const texts = await Promise.all(files.map(extractPdfText));
      const combined = texts
        .map((t, i) => `=== ${files[i].name} ===\n${t}`)
        .join('\n\n');

      setProcessing('extracting');
      const res = await fetch('/api/SyllabusParser', {
        method:  'POST',
        headers: { 'Content-Type': 'text/plain' },
        body:    combined,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const text   = await res.text();
      const parsed = parsePipeText(text);

      setSyllabusCount(files.length);
      setRows(parsed);
      setSelectedIds(new Set());
      setFilters(DEFAULT_FILTERS);
      setSort(null);
      setProcessing('idle');
      setView('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setProcessing('error');
    }
  }, [files]);

  const handleNewSession = useCallback(() => {
    setView('upload');
    setFiles([]);
    setError(null);
    setProcessing('idle');
    setActiveRowId(null);
    setSelectedIds(new Set());
  }, []);

  const handleRowChange = useCallback((id: string, changes: Partial<ExtractedRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  }, []);

  const handleRowDelete = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    if (activeRowId === id) setActiveRowId(null);
  }, [activeRowId]);

  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (selected) s.add(id); else s.delete(id);
      return s;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedIds(selected ? new Set(sortedRows.map((r) => r.id)) : new Set());
  }, [sortedRows]);

  const handleRowDetail = useCallback((id: string) => {
    setActiveRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleBulkVerify = useCallback(() => {
    setRows((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: 'verified' } : r))
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBulkDelete = useCallback(() => {
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    if (activeRowId && selectedIds.has(activeRowId)) setActiveRowId(null);
  }, [selectedIds, activeRowId]);

  const handleExportXlsx = useCallback(async () => {
    setExporting(true);
    try {
      const body = rowsToPipeText(rows);
      const res  = await fetch('/api/Excel', {
        method:  'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      downloadBlob(blob, 'ParsedSyllabi.xlsx');
    } finally {
      setExporting(false);
      setShowExport(false);
    }
  }, [rows]);

  const handleExportCsv = useCallback(() => {
    const csv  = rowsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'ParsedSyllabi.csv');
    setShowExport(false);
  }, [rows]);

  const handleExport = useCallback((format: 'xlsx' | 'csv') => {
    if (format === 'xlsx') handleExportXlsx();
    else handleExportCsv();
  }, [handleExportXlsx, handleExportCsv]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="app">
      <AppHeader
        view={view}
        courseNames={courses}
        onNewSession={handleNewSession}
        onExport={() => setShowExport(true)}
        rowCount={rows.length}
      />

      {view === 'upload' && (
        <UploadPanel
          files={files}
          onFilesChange={setFiles}
          onSubmit={handleProcess}
          processing={processing}
          error={error}
        />
      )}

      {view === 'review' && (
        <main className="review-view">
          <ExtractionSummary rows={rows} syllabusCount={syllabusCount} />

          <FilterBar
            filters={filters}
            onFiltersChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
            courses={courses}
            visibleCount={sortedRows.length}
            totalCount={rows.length}
            selectedCount={selectedIds.size}
            onVerifySelected={handleBulkVerify}
            onDeleteSelected={handleBulkDelete}
            onClearSelection={() => setSelectedIds(new Set())}
          />

          <ReviewTable
            rows={sortedRows}
            selectedIds={selectedIds}
            activeRowId={activeRowId}
            sort={sort}
            onRowChange={handleRowChange}
            onRowDelete={handleRowDelete}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            onRowDetail={handleRowDetail}
            onSortChange={setSort}
          />

          <RowDetailDrawer
            row={activeRow}
            open={activeRowId !== null}
            onClose={() => setActiveRowId(null)}
            onSave={handleRowChange}
            onDelete={handleRowDelete}
          />
        </main>
      )}

      {showExport && (
        <ExportModal
          rowCount={rows.length}
          onClose={() => setShowExport(false)}
          onExport={handleExport}
          exporting={exporting}
        />
      )}
    </div>
  );
}
