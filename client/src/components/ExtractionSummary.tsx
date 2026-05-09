import type { ExtractedRow } from '../types';

interface Props {
  rows: ExtractedRow[];
  syllabusCount: number;
}

export default function ExtractionSummary({ rows, syllabusCount }: Props) {
  const needsReview = rows.filter((r) => r.status === 'needs-review').length;
  const uncertain   = rows.filter((r) => r.status === 'uncertain').length;
  const verified    = rows.filter((r) => r.status === 'verified').length;

  return (
    <div className="summary-strip" role="region" aria-label="Extraction summary">
      <span className="summary-stat">
        <strong>{rows.length}</strong>
        {rows.length === 1 ? ' event' : ' events'} from{' '}
        <strong>{syllabusCount}</strong>{' '}
        {syllabusCount === 1 ? 'syllabus' : 'syllabi'}
      </span>

      {verified > 0 && (
        <>
          <span className="summary-sep" aria-hidden="true" />
          <span className="summary-stat">
            <strong>{verified}</strong> verified
          </span>
        </>
      )}

      {needsReview > 0 && (
        <>
          <span className="summary-sep" aria-hidden="true" />
          <span className="summary-stat summary-stat-review" aria-label={`${needsReview} items need review`}>
            <strong>{needsReview}</strong> need review
          </span>
        </>
      )}

      {uncertain > 0 && (
        <>
          <span className="summary-sep" aria-hidden="true" />
          <span className="summary-stat summary-stat-uncertain" aria-label={`${uncertain} uncertain items`}>
            <strong>{uncertain}</strong> uncertain
          </span>
        </>
      )}
    </div>
  );
}
