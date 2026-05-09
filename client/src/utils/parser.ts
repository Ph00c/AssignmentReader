import type { ExtractedRow, ItemType, ItemStatus } from '../types';

function inferType(notes: string, title: string): ItemType {
  const t = (notes + ' ' + title).toUpperCase();
  if (t.includes('EXAM') || t.includes('MIDTERM') || t.includes('FINAL EXAM')) return 'exam';
  if (t.includes('QUIZ')) return 'quiz';
  if (t.includes('PROJECT')) return 'project';
  if (t.includes('LAB')) return 'lab';
  if (t.includes('READING')) return 'reading';
  if (t.includes('DEADLINE')) return 'deadline';
  if (
    t.includes('HW') ||
    t.includes('HOMEWORK') ||
    t.includes('ASSIGNMENT') ||
    t.includes('PROBLEM SET') ||
    t.includes('PSET')
  )
    return 'assignment';
  return 'other';
}

function inferStatus(date: string, notes: string): ItemStatus {
  const d = date.trim().toUpperCase();
  const n = notes.toLowerCase();
  if (!date || d === '' || d === 'TBD' || d === 'N/A' || d === '-') return 'needs-review';
  if (n.includes('tbd') || n.includes('tentative') || n.includes('to be announced'))
    return 'uncertain';
  return 'verified';
}

const SKIP_PATTERNS = [
  /^#/,
  /^```/,
  /^---/,
  /^class\s*\|/i,
  /^course\s*\|/i,
  /^\|\s*-+\s*\|/,
];

export function parsePipeText(text: string): ExtractedRow[] {
  const rows: ExtractedRow[] = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (SKIP_PATTERNS.some((p) => p.test(line))) continue;

    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 2) continue;

    const [course = '', title = '', date = '', notes = ''] = parts;
    if (!course && !title) continue;

    rows.push({
      id: `row-${i}-${Math.random().toString(36).slice(2, 7)}`,
      course,
      title,
      date,
      notes,
      type: inferType(notes, title),
      status: inferStatus(date, notes),
    });
  }

  return rows;
}

export function rowsToPipeText(rows: ExtractedRow[]): string {
  return rows
    .map((r) => `${r.course} | ${r.title} | ${r.date} | ${r.notes}`)
    .join('\n');
}

export function rowsToCsv(rows: ExtractedRow[]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = ['Course', 'Title', 'Date', 'Type', 'Status', 'Notes']
    .map(escape)
    .join(',');
  const body = rows
    .map((r) =>
      [r.course, r.title, r.date, r.type, r.status, r.notes].map(escape).join(',')
    )
    .join('\n');
  return header + '\n' + body;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
