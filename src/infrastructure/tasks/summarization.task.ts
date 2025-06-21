// src/infrastructure/tasks/summarization.task.ts
import { ITask } from '../../core/ports/task.interface';
import { Job } from '../../core/domain/entities/jobs/job.entity'; // Though not directly used, good for context
import { generateText } from 'ai'; // Assuming 'modelos' is a typo and should be 'experimental_generateText' or specific model import
import { deepseek } from '@ai-sdk/deepseek'; // Or any other provider compatible with ai-sdk

// Ensure DEEPSEEK_API_KEY is handled by dotenv at application start
// For local testing, ensure .env file has DEEPSEEK_API_KEY=sk-xxxxxxxx

export class SummarizationTask implements ITask<string, string> {
  readonly name = 'SummarizationTask';

  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn('DEEPSEEK_API_KEY is not set. SummarizationTask may fail.');
      // Depending on strictness, could throw new Error here.
    }
  }

  async execute(payload: string): Promise<string | void> {
    if (!payload || typeof payload !== 'string' || payload.trim() === '') {
      console.error('SummarizationTask: Received empty or invalid payload.');
      throw new Error('Payload must be a non-empty string.');
    }

    console.log(`SummarizationTask: Processing text: "${payload.substring(0, 50)}..."`);

    try {
      const { text: summary } = await generateText({
        model: deepseek('deepseek-chat'), // Example model, adjust as needed
        prompt: `Summarize the following text in a single sentence: ${payload}`,
        maxTokens: 60, // Adjust based on expected summary length
      });

      if (!summary || summary.trim() === '') {
        console.warn('SummarizationTask: LLM returned an empty summary.');
        // Decide if this is an error or a valid (though poor) outcome
        // For this example, let's treat it as something that needs re-evaluation or a different approach
        return; // Indicates task didn't "complete" with a usable summary but didn't catastrophically fail
      }

      console.log(`SummarizationTask: Summary generated: "${summary}"`);
      return summary;

    } catch (error) {
      console.error('SummarizationTask: Error during LLM call:', error);
      // Rethrow to allow WorkerService to handle retry logic based on Job settings
      if (error instanceof Error) {
        throw new Error(`LLM API error in SummarizationTask: ${error.message}`);
      }
      throw new Error('Unknown error during LLM call in SummarizationTask.');
    }
  }
}
