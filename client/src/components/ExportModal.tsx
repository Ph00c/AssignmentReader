import { useState } from 'react';

type ExportFormat = 'xlsx' | 'csv';

interface Props {
  rowCount: number;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
}

export default function ExportModal({ rowCount, onClose, onExport, exporting }: Props) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Export options"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Export</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close export dialog">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="2" y1="2" x2="10" y2="10" strokeLinecap="round" />
              <line x1="10" y1="2" x2="2" y2="10" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
            Exporting <strong style={{ color: 'var(--text)' }}>{rowCount}</strong>{' '}
            {rowCount === 1 ? 'row' : 'rows'}.
          </p>

          <button
            className={`export-option${format === 'xlsx' ? ' export-selected' : ''}`}
            onClick={() => setFormat('xlsx')}
            aria-pressed={format === 'xlsx'}
          >
            <div className="export-option-icon" aria-hidden="true">📊</div>
            <div className="export-option-text">
              <div className="export-option-label">Excel (.xlsx)</div>
              <div className="export-option-desc">Color-coded spreadsheet with formatted columns</div>
            </div>
          </button>

          <button
            className={`export-option${format === 'csv' ? ' export-selected' : ''}`}
            onClick={() => setFormat('csv')}
            aria-pressed={format === 'csv'}
          >
            <div className="export-option-icon" aria-hidden="true">📄</div>
            <div className="export-option-text">
              <div className="export-option-label">CSV (.csv)</div>
              <div className="export-option-desc">Plain text, compatible with any spreadsheet app</div>
            </div>
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onExport(format)}
            disabled={exporting}
          >
            {exporting
              ? <><span className="spinner" aria-hidden="true" /> Exporting…</>
              : `Download ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
