interface Props {
  view: 'upload' | 'review';
  courseNames: string[];
  onNewSession: () => void;
  onExport: () => void;
  rowCount: number;
}

export default function AppHeader({ view, courseNames, onNewSession, onExport, rowCount }: Props) {
  const contextLabel =
    view === 'review' && courseNames.length > 0
      ? courseNames.slice(0, 3).join(', ') + (courseNames.length > 3 ? ` +${courseNames.length - 3}` : '')
      : null;

  return (
    <header className="app-header" role="banner">
      <div className="header-brand" aria-label="Syllabus Review">
        <div className="header-logo" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="11" height="2" rx="0.5" fill="white" />
            <rect x="1" y="5" width="8" height="1.5" rx="0.5" fill="white" opacity="0.7" />
            <rect x="1" y="8" width="9" height="1.5" rx="0.5" fill="white" opacity="0.7" />
            <rect x="1" y="11" width="6" height="1" rx="0.5" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="header-name">Syllabus Review</span>
      </div>

      {contextLabel && (
        <>
          <div className="header-sep" aria-hidden="true" />
          <span className="header-context" title={courseNames.join(', ')}>
            {contextLabel}
          </span>
        </>
      )}

      <div className="header-spacer" />

      <div className="header-actions">
        {view === 'review' && (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onNewSession}
              aria-label="Upload another syllabus"
            >
              + Upload more
            </button>
            <div className="divider" aria-hidden="true" />
            <button
              className="btn btn-secondary btn-sm"
              onClick={onExport}
              disabled={rowCount === 0}
              aria-label={`Export ${rowCount} rows`}
            >
              Export
            </button>
          </>
        )}
      </div>
    </header>
  );
}
