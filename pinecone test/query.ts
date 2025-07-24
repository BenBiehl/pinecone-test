import { ensureIndexExists } from './pinecone-utils';
import { getEmbedding, askQuestion } from './openai-utils';
import { extractKeywords, keywordsToSparseVector } from './utils';

export async function askCsvQuestion(namespace: string, question: string) {
  const index = await ensureIndexExists();

  const dense = await getEmbedding(question);
  const keywords = extractKeywords(question);
  const sparse = keywordsToSparseVector(keywords);

  const result = await index.namespace(namespace).query({
    vector: dense,
    sparseVector: sparse,
    topK: 5,
    includeMetadata: true,
  });

  const context = result.matches.map((m) => JSON.stringify(m.metadata, null, 2));
  const response = await askQuestion(context, question);
  console.log(`\n🧠 Answer:\n${response}`);
}
