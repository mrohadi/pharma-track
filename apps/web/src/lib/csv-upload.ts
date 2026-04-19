import Papa from 'papaparse';
import { CSV_HEADERS, CsvOrderRow, ALL_CSV_HEADERS, type CsvRowError } from '@pharmatrack/shared';

export type ParsedCsvItem = {
  name: string;
  quantity: number;
  position: number;
};

export type ParsedCsvOrder = CsvOrderRow & { items: ParsedCsvItem[] };

export type ParsedCsv = {
  valid: ParsedCsvOrder[];
  errors: CsvRowError[];
};

/**
 * Parse a raw CSV string against our CsvOrderRow schema.
 *
 * Design choices:
 * - We parse with headers and normalize them to lowercase/underscored so
 *   "Patient Name" / "patient_name" / "PATIENT_NAME" all work.
 * - Unknown columns are ignored (won't fail the upload).
 * - Missing required columns fail fast with one "schema" error (row 0).
 * - Individual row errors are collected; we still return the valid rows so
 *   the caller can decide to partial-commit or reject entirely (we reject
 *   any file with errors — partial commits muddy the audit trail).
 */
export function parseOrderCsv(text: string): ParsedCsv {
  const errors: CsvRowError[] = [];
  const valid: ParsedCsvOrder[] = [];

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  if (parsed.errors.length > 0) {
    for (const e of parsed.errors) {
      errors.push({
        row: (e.row ?? 0) + 2, // Papa rows are 0-based and exclude header
        message: `CSV parse error: ${e.message}`,
      });
    }
  }

  const headers = parsed.meta.fields?.map((h) => h.toLowerCase()) ?? [];
  const missing = CSV_HEADERS.required.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    errors.push({
      row: 1,
      message: `Missing required column(s): ${missing.join(', ')}. Expected: ${ALL_CSV_HEADERS.join(', ')}`,
    });
    return { valid, errors };
  }

  parsed.data.forEach((rawRow, idx) => {
    const rowNum = idx + 2; // +1 for header, +1 to make 1-based
    const result = CsvOrderRow.safeParse(rawRow);
    if (result.success) {
      valid.push({
        ...result.data,
        items: [{ name: result.data.medicine, quantity: 1, position: 0 }],
      });
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          row: rowNum,
          field: issue.path.join('.') || undefined,
          message: issue.message,
        });
      }
    }
  });

  return { valid, errors };
}
