import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return res.data[0].embedding;
}

export async function askQuestion(context: string[], question: string): Promise<string> {
  const systemPrompt = `You are a helpful assistant that answers questions about uploaded CSV data.`;
  const userPrompt = `Given the following context:\n${context.join('\n\n')}\n\nAnswer the question: ${question}`;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return chat.choices[0].message.content || 'No response.';
}
