export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

/**
 * Formula Injection Protection:
 * Values starting with =, +, -, @ are prefixed with a single quote '
 */
const protectFormula = (val: string): string => {
  if (/^[=+\-@]/.test(val)) {
    return `'${val}`;
  }
  return val;
};

/**
 * Escape values containing quotes, commas, or newlines for CSV compliance
 */
const escapeCsvValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';

  let text = String(val);
  text = protectFormula(text);
  text = text.replace(/"/g, '""');

  if (/[",\n\r]/.test(text)) {
    return `"${text}"`;
  }
  return text;
};

/**
 * Generate and download a UTF-8 BOM formatted CSV file
 */
export function exportToCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  if (!rows || rows.length === 0) return;

  const BOM = '\uFEFF';
  const headers = columns.map((col) => escapeCsvValue(col.header)).join(',');
  const rowLines = rows.map((row) =>
    columns.map((col) => escapeCsvValue(col.value(row))).join(',')
  );

  const csvContent = BOM + [headers, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a clean filename slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
