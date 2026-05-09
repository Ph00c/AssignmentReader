import type { FilterState, ItemType, ItemStatus } from '../types';

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',        label: 'All types' },
  { value: 'exam',       label: 'Exam' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz',       label: 'Quiz' },
  { value: 'project',    label: 'Project' },
  { value: 'lab',        label: 'Lab' },
  { value: 'reading',    label: 'Reading' },
  { value: 'deadline',   label: 'Deadline' },
  { value: 'other',      label: 'Other' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',          label: 'All statuses' },
  { value: 'verified',     label: 'Verified' },
  { value: 'needs-review', label: 'Needs review' },
  { value: 'uncertain',    label: 'Uncertain' },
];

interface Props {
  filters: FilterState;
  onFiltersChange: (f: Partial<FilterState>) => void;
  courses: string[];
  visibleCount: number;
  totalCount: number;
  selectedCount: number;
  onVerifySelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export default function FilterBar({
  filters,
  onFiltersChange,
  courses,
  visibleCount,
  totalCount,
  selectedCount,
  onVerifySelected,
  onDeleteSelected,
  onClearSelection,
}: Props) {
  const filtered = visibleCount < totalCount;

  return (
    <>
      <div className="filter-bar" role="search" aria-label="Filter extracted events">
        <span className="filter-label" aria-hidden="true">Filter</span>

        {/* Course filter */}
        <select
          className="filter-select"
          value={filters.course}
          onChange={(e) => onFiltersChange({ course: e.target.value })}
          aria-label="Filter by course"
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Type filter */}
        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => onFiltersChange({ type: e.target.value as ItemType | 'all' })}
          aria-label="Filter by type"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as ItemStatus | 'all' })}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="filter-spacer" />

        {/* Row count indicator */}
        <span className="filter-count" aria-live="polite">
          {filtered ? `${visibleCount} of ${totalCount}` : `${totalCount}`}{' '}
          {totalCount === 1 ? 'row' : 'rows'}
        </span>

        {/* Search */}
        <input
          className="filter-search"
          type="search"
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          aria-label="Search rows"
        />
      </div>

      {/* Bulk action bar — shown only when rows are selected */}
      {selectedCount > 0 && (
        <div className="bulk-bar" role="toolbar" aria-label="Bulk actions">
          <span className="bulk-bar-count">{selectedCount} selected</span>
          <button className="btn btn-sm btn-secondary" onClick={onVerifySelected}>
            Mark verified
          </button>
          <button className="btn btn-sm btn-danger-ghost" onClick={onDeleteSelected}>
            Delete
          </button>
          <div className="filter-spacer" />
          <button className="btn btn-ghost btn-sm" onClick={onClearSelection}>
            Deselect all
          </button>
        </div>
      )}
    </>
  );
}
