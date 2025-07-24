import { parseCsv, rowToText, extractKeywords, keywordsToSparseVector } from './utils';
import { getEmbedding } from './openai-utils';
import { ensureIndexExists } from './pinecone-utils';
import pLimit from 'p-limit';

const BATCH_SIZE = 250;
const CONCURRENCY = 5;

export async function embedCsv(filePath: string, namespace: string) {
  const records = await parseCsv(filePath);
  const index = await ensureIndexExists();

  const limit = pLimit(CONCURRENCY);
  const vectorBuffer: any[] = [];

  let uploadedCount = 0;

  const uploadBatch = async () => {
    if (vectorBuffer.length === 0) return;
    const batch = vectorBuffer.splice(0, BATCH_SIZE);
    await index.namespace(namespace).upsert(batch);
    uploadedCount += batch.length;
    console.log(`📤 Upserted ${uploadedCount}/${records.length} vectors...`);
  };

  const embedAndBuffer = async (row: any, i: number) => {
    const text = rowToText(row);
    const dense = await getEmbedding(text);
    const keywords = extractKeywords(text);
    const sparse = keywordsToSparseVector(keywords);

    const vector = {
      id: `row-${i}`,
      values: dense,
      sparseValues: sparse,
      metadata: row,
    };

    vectorBuffer.push(vector);

    if (vectorBuffer.length >= BATCH_SIZE) {
      await uploadBatch();
    }
  };

  // Start embedding all rows in parallel with concurrency limit
  await Promise.all(records.map((row, i) => limit(() => embedAndBuffer(row, i))));

  // Final flush
  await uploadBatch();

  console.log('✅ CSV upload complete.');
}