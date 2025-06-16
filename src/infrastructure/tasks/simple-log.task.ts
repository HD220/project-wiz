// src/infrastructure/tasks/simple-log.task.ts

import { ITask } from '../../core/ports/task.interface';

interface SimpleLogTaskInput {
  message: string;
  data?: any;
}

interface SimpleLogTaskOutput {
  status: string;
  receivedMessage: string;
  timestamp: string;
}

export class SimpleLogTask implements ITask<SimpleLogTaskInput, SimpleLogTaskOutput, any> {
  async execute(
    payload: SimpleLogTaskInput,
    tools?: any // Tools not used in this simple task
  ): Promise<SimpleLogTaskOutput | void> {
    console.log('SimpleLogTask: Executing with payload:', payload);

    if (!payload || !payload.message) {
      console.warn('SimpleLogTask: No message provided in payload.');
      // Indicate continuation or a specific kind of "soft" error if needed,
      // for now, let's treat it as a success but with a note.
      // Or, throw new Error('Message is required for SimpleLogTask'); if it's a hard requirement.
      return {
        status: 'No message provided',
        receivedMessage: '',
        timestamp: new Date().toISOString(),
      };
    }

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work

    console.log(`SimpleLogTask: Message received - "${payload.message}". Additional data:`, payload.data);

    return {
      status: 'success',
      receivedMessage: payload.message,
      timestamp: new Date().toISOString(),
    };
  }
}
