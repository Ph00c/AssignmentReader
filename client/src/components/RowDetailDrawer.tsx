import { useState, useEffect } from 'react';
import type { ExtractedRow, ItemType, ItemStatus } from '../types';
import TypeBadge from './TypeBadge';

const TYPE_OPTIONS: ItemType[] = [
  'exam', 'assignment', 'quiz', 'project', 'lab', 'reading', 'deadline', 'other',
];

interface Props {
  row: ExtractedRow | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, changes: Partial<ExtractedRow>) => void;
  onDelete: (id: string) => void;
}

export default function RowDetailDrawer({ row, open, onClose, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<ExtractedRow | null>(null);

  useEffect(() => {
    if (row) setDraft({ ...row });
  }, [row]);

  if (!row || !draft) {
    return (
      <div className={`drawer-overlay${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="drawer-backdrop" onClick={onClose} />
        <aside className="drawer" aria-label="Row details" />
      </div>
    );
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(row);

  const handleSave = () => {
    if (!isDirty) { onClose(); return; }
    onSave(row.id, draft);
    onClose();
  };

  const handleDelete = () => {
    onDelete(row.id);
    onClose();
  };

  const set = (changes: Partial<ExtractedRow>) =>
    setDraft((d) => (d ? { ...d, ...changes } : d));

  const statusOptions: { value: ItemStatus; label: string }[] = [
    { value: 'verified',     label: 'Verified' },
    { value: 'needs-review', label: 'Needs review' },
    { value: 'uncertain',    label: 'Uncertain' },
  ];

  return (
    <div
      className={`drawer-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Row details"
      aria-hidden={!open}
    >
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />

      <aside className="drawer">
        {/* Header */}
        <div className="drawer-header">
          <TypeBadge type={draft.type} />
          <span className="drawer-title">{draft.title || 'Untitled'}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close panel">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="2" y1="2" x2="11" y2="11" strokeLinecap="round" />
              <line x1="11" y1="2" x2="2" y2="11" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">

          {/* Core fields */}
          <div className="drawer-section">
            <div className="drawer-section-label">Details</div>

            <div className="drawer-field">
              <div className="drawer-field-label">Title</div>
              <input
                className="drawer-input"
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
                aria-label="Title"
              />
            </div>

            <div className="drawer-field">
              <div className="drawer-field-label">Course</div>
              <input
                className="drawer-input"
                value={draft.course}
                onChange={(e) => set({ course: e.target.value })}
                aria-label="Course"
              />
            </div>

            <div className="drawer-field">
              <div className="drawer-field-label">Date</div>
              <input
                className="drawer-input"
                value={draft.date}
                onChange={(e) => set({ date: e.target.value })}
                placeholder="e.g. 03/15"
                aria-label="Date"
              />
            </div>

            <div className="drawer-field">
              <div className="drawer-field-label">Type</div>
              <select
                className="drawer-select"
                value={draft.type}
                onChange={(e) => set({ type: e.target.value as ItemType })}
                aria-label="Item type"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="drawer-section">
            <div className="drawer-section-label">Review status</div>
            <div className="drawer-status-row">
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  className={`drawer-status-btn ${
                    draft.status === value
                      ? `active-${value === 'needs-review' ? 'needs-review' : value}`
                      : 'inactive'
                  }`}
                  onClick={() => set({ status: value })}
                  aria-pressed={draft.status === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / source excerpt */}
          {draft.notes && (
            <div className="drawer-section">
              <div className="drawer-section-label">Extracted notes</div>
              <div className="source-excerpt">{draft.notes}</div>
            </div>
          )}

          <div className="drawer-section">
            <div className="drawer-section-label">Notes</div>
            <textarea
              className="drawer-textarea"
              value={draft.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Additional notes…"
              aria-label="Notes"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={handleDelete}
            aria-label="Delete this row"
          >
            Delete
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save
          </button>
        </div>
      </aside>
    </div>
  );
}
