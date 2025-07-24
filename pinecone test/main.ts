import readline from 'readline-sync';
import { embedCsv } from './embed-csv';
import { askCsvQuestion } from './query';

async function main() {
  console.log('Pinecone CSV Assistant (Hybrid Search)\n');
  const mode = readline.question('Do you want to (u)pload or (q)uery? \n');

  if (mode === 'u') {
    const file = readline.question('Path to CSV file: ');
    const namespace = readline.question('Namespace to store in: ');
    await embedCsv(file, namespace);
  } else if (mode === 'q') {
    const namespace = readline.question('Namespace to query: ');
    while (true) {
      const question = readline.question('\nEnter question (or "exit"): ');
      if (question.toLowerCase() === 'exit') break;
      await askCsvQuestion(namespace, question);
    }
  } else {
    console.log('❌ Invalid mode.');
  }
}

main();
