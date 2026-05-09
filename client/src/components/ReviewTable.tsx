import { useState, useRef, useCallback } from 'react';
import type { ExtractedRow, SortState, SortField } from '../types';
import TypeBadge from './TypeBadge';
import StatusIndicator from './StatusIndicator';

interface InlineEdit {
  rowId: string;
  field: 'title' | 'date' | 'course';
  value: string;
}

interface Props {
  rows: ExtractedRow[];
  selectedIds: Set<string>;
  activeRowId: string | null;
  sort: SortState | null;
  onRowChange: (id: string, changes: Partial<ExtractedRow>) => void;
  onRowDelete: (id: string) => void;
  onRowSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRowDetail: (id: string) => void;
  onSortChange: (s: SortState) => void;
}

const SORT_FIELDS: { field: SortField; label: string }[] = [
  { field: 'course', label: 'Course' },
  { field: 'date',   label: 'Date' },
  { field: 'type',   label: 'Type' },
  { field: 'title',  label: 'Title' },
];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active)
    return (
      <svg className="th-sort-icon" width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true">
        <path d="M4 0L7 4H1L4 0ZM4 10L1 6H7L4 10Z" opacity="0.35" />
      </svg>
    );
  return (
    <svg className="th-sort-icon" width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true">
      {dir === 'asc' ? <path d="M4 0L7 5H1L4 0Z" /> : <path d="M4 10L1 5H7L4 10Z" />}
    </svg>
  );
}

export default function ReviewTable({
  rows,
  selectedIds,
  activeRowId,
  sort,
  onRowChange,
  onRowDelete,
  onRowSelect,
  onSelectAll,
  onRowDetail,
  onSortChange,
}: Props) {
  const [editing, setEditing] = useState<InlineEdit | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id)) && !allSelected;

  const startEdit = useCallback(
    (rowId: string, field: InlineEdit['field'], currentValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditing({ rowId, field, value: currentValue });
      setTimeout(() => editInputRef.current?.select(), 0);
    },
    []
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;
    onRowChange(editing.rowId, { [editing.field]: editing.value });
    setEditing(null);
  }, [editing, onRowChange]);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const handleSort = (field: SortField) => {
    if (sort?.field === field) {
      onSortChange({ field, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ field, dir: 'asc' });
    }
  };

  if (rows.length === 0) {
    return (
      <div className="table-scroll">
        <div className="empty-state" role="status">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" />
          </svg>
          <p className="empty-state-title">No rows match</p>
          <p className="empty-state-desc">Try adjusting the filters or search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-scroll" role="region" aria-label="Extracted events table">
      <table className="review-table" aria-label="Extracted events">
        <colgroup>
          <col style={{ width: '36px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '96px' }} />
          <col style={{ width: '102px' }} />
          <col />
          <col style={{ width: '100px' }} />
          <col style={{ width: '68px' }} />
        </colgroup>

        <thead>
          <tr>
            <th className="col-check" scope="col">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
              />
            </th>

            {SORT_FIELDS.slice(0, 3).map(({ field, label }) => (
              <th
                key={field}
                className={`col-${field} th-sortable`}
                scope="col"
                onClick={() => handleSort(field)}
                aria-sort={
                  sort?.field === field
                    ? sort.dir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                {label}
                <SortIcon active={sort?.field === field} dir={sort?.dir ?? 'asc'} />
              </th>
            ))}

            <th
              className="col-title th-sortable"
              scope="col"
              onClick={() => handleSort('title')}
              aria-sort={
                sort?.field === 'title'
                  ? sort.dir === 'asc' ? 'ascending' : 'descending'
                  : 'none'
              }
            >
              Title
              <SortIcon active={sort?.field === 'title'} dir={sort?.dir ?? 'asc'} />
            </th>

            <th className="col-status" scope="col">Status</th>
            <th className="col-actions" scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const isSelected = selectedIds.has(row.id);
            const isActive   = row.id === activeRowId;
            const rowClass   = [
              isSelected ? 'row-selected' : '',
              isActive   ? 'row-active'   : '',
              row.status === 'needs-review' ? 'row-review'    : '',
              row.status === 'uncertain'    ? 'row-uncertain' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <tr
                key={row.id}
                className={rowClass}
                onClick={() => onRowDetail(row.id)}
                aria-selected={isSelected}
              >
                {/* Checkbox */}
                <td className="col-check" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onRowSelect(row.id, e.target.checked)}
                    aria-label={`Select row: ${row.title || row.course}`}
                  />
                </td>

                {/* Course */}
                <td className="col-course">
                  {editing?.rowId === row.id && editing.field === 'course' ? (
                    <div className="cell-edit-wrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        className="cell-edit-input"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={commitEdit}
                        onKeyDown={handleEditKeyDown}
                        aria-label="Edit course"
                      />
                    </div>
                  ) : (
                    <span
                      className="cell-text cell-course"
                      title={row.course}
                      onDoubleClick={(e) => startEdit(row.id, 'course', row.course, e)}
                    >
                      {row.course || <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className="col-date">
                  {editing?.rowId === row.id && editing.field === 'date' ? (
                    <div className="cell-edit-wrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        className="cell-edit-input"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={commitEdit}
                        onKeyDown={handleEditKeyDown}
                        aria-label="Edit date"
                      />
                    </div>
                  ) : (
                    <span
                      className={`cell-text ${row.date ? 'cell-date' : 'cell-date-missing'}`}
                      onDoubleClick={(e) => startEdit(row.id, 'date', row.date, e)}
                      title={row.date || 'No date — double-click to add'}
                    >
                      {row.date || 'No date'}
                    </span>
                  )}
                </td>

                {/* Type */}
                <td className="col-type">
                  <TypeBadge type={row.type} />
                </td>

                {/* Title */}
                <td className="col-title">
                  {editing?.rowId === row.id && editing.field === 'title' ? (
                    <div className="cell-edit-wrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        className="cell-edit-input"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={commitEdit}
                        onKeyDown={handleEditKeyDown}
                        aria-label="Edit title"
                      />
                    </div>
                  ) : (
                    <span
                      className="cell-text cell-title"
                      title={row.title}
                      onDoubleClick={(e) => startEdit(row.id, 'title', row.title, e)}
                    >
                      {row.title || <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Untitled</span>}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="col-status">
                  <StatusIndicator status={row.status} />
                </td>

                {/* Row actions */}
                <td className="col-actions col-actions-cell">
                  <span className="row-actions">
                    <button
                      className="icon-btn"
                      title="Open details"
                      aria-label={`Open details for ${row.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowDetail(row.id);
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M6.5 2.5h4v4M10 6.5 6 2.5M2 11l8.5-8.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete row"
                      aria-label={`Delete row: ${row.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowDelete(row.id);
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M2 3.5h9M5 3.5V2h3v1.5M4.5 3.5l.5 7M8.5 3.5l-.5 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
