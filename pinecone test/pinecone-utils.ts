import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

export const pinecone = new Pinecone();

export async function ensureIndexExists() {
  const indexName = process.env.PINECONE_INDEX_NAME!;
  const { indexes } = await pinecone.listIndexes();

  const indexNames = indexes?.map((i) => i.name);

  if (!indexNames?.includes(indexName)) {
    console.log(`Creating index "${indexName}"...`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536,
      metric: 'dotproduct',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
      waitUntilReady: true,
    });

    console.log('Index created. Waiting for readiness...');
  }

  const index = pinecone.index(indexName);
  return index;
}

