export type ItemType =
  | 'exam'
  | 'assignment'
  | 'quiz'
  | 'lab'
  | 'project'
  | 'reading'
  | 'deadline'
  | 'other';

export type ItemStatus = 'verified' | 'needs-review' | 'uncertain';

export type SortField = 'course' | 'date' | 'type' | 'title';
export type SortDir = 'asc' | 'desc';

export interface ExtractedRow {
  id: string;
  course: string;
  title: string;
  date: string;
  notes: string;
  type: ItemType;
  status: ItemStatus;
}

export interface FilterState {
  course: string;
  type: string;
  status: string;
  search: string;
}

export interface SortState {
  field: SortField;
  dir: SortDir;
}
