import type { ItemStatus } from '../types';

const LABELS: Record<ItemStatus, string> = {
  'verified':     'Verified',
  'needs-review': 'Needs review',
  'uncertain':    'Uncertain',
};

interface Props {
  status: ItemStatus;
}

export default function StatusIndicator({ status }: Props) {
  const cssClass = `status-indicator status-${status}`;
  return (
    <span className={cssClass} aria-label={`Status: ${LABELS[status]}`}>
      <span className="status-dot" aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
