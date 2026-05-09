import type { ItemType } from '../types';

const LABELS: Record<ItemType, string> = {
  exam:       'Exam',
  assignment: 'Assignment',
  quiz:       'Quiz',
  lab:        'Lab',
  project:    'Project',
  reading:    'Reading',
  deadline:   'Deadline',
  other:      'Other',
};

interface Props {
  type: ItemType;
}

export default function TypeBadge({ type }: Props) {
  return (
    <span className={`type-badge type-${type}`} aria-label={`Type: ${LABELS[type]}`}>
      {LABELS[type]}
    </span>
  );
}
