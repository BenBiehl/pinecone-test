import fs from 'fs';
import { parse } from 'csv-parse';

export async function parseCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

export function rowToText(row: Record<string, any>): string {
  return Object.entries(row)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

export function hashToken(token: string, buckets = 10000): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash * 31 + token.charCodeAt(i)) % buckets;
  }
  return hash;
}

export function keywordsToSparseVector(keywords: string[]) {
  const freq: Record<number, number> = {};
  for (const word of keywords) {
    const idx = hashToken(word);
    freq[idx] = (freq[idx] || 0) + 1;
  }

  return {
    indices: Object.keys(freq).map(Number),
    values: Object.values(freq),
  };
}
