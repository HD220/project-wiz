# Vercel AI SDK Guide for Project Wiz

## Overview

The AI SDK is the TypeScript toolkit for building AI applications with React, Next.js, Vue, Svelte, Node.js, and more. It provides a unified API for generating text, structured objects, tool calls, and building agents with LLMs.

**Key Point**: The AI SDK Core can be used anywhere JavaScript runs, making it perfect for Electron applications.

## Installation

```bash
npm i ai
npm i @ai-sdk/openai    # For OpenAI models
npm i @ai-sdk/deepseek  # For DeepSeek models
```

## Core Concepts for Electron/Node.js

### 1. Text Generation (Non-Streaming)

In Electron's main process, use `generateText` instead of `streamText`:

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateResponse(prompt: string) {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    prompt: prompt,
  });
  
  return text;
}
```

### 2. Streaming Considerations

While the AI SDK supports streaming, in Electron you typically:
- Use `generateText` in the main process
- Send complete responses via IPC to the renderer
- This avoids complexity of streaming across process boundaries

### 3. Tool Calling for Agent Actions

Agents can use tools to perform actions:

```typescript
import { generateText, tool } from 'ai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4o'),
  tools: {
    writeFile: tool({
      description: 'Write content to a file',
      parameters: z.object({
        path: z.string(),
        content: z.string(),
      }),
      execute: async ({ path, content }) => {
        await fs.writeFile(path, content);
        return { success: true };
      },
    }),
  },
  toolChoice: 'auto',
  prompt: 'Create a new React component for a Button',
});
```

### 4. Model Configuration

```typescript
// OpenAI configuration
const model = openai('gpt-4o-mini', {
  apiKey: process.env.OPENAI_API_KEY,
});

// DeepSeek configuration  
import { deepseek } from '@ai-sdk/deepseek';
const model = deepseek('deepseek-chat', {
  apiKey: process.env.DEEPSEEK_API_KEY,
});
```

## Best Practices for Electron

1. **API Key Management**
   - Store in environment variables
   - Never expose to renderer process
   - Load from .env file in development

2. **Error Handling**
   ```typescript
   try {
     const { text } = await generateText({...});
   } catch (error) {
     if (error.name === 'AI_APICallError') {
       // Handle API errors (rate limits, auth, etc.)
     }
   }
   ```

3. **Response Parsing**
   ```typescript
   // For structured responses
   const { object } = await generateObject({
     model: openai('gpt-4o'),
     schema: z.object({
       code: z.string(),
       explanation: z.string(),
     }),
     prompt: 'Generate a React component',
   });
   ```

## Integration Pattern for Project Wiz

```typescript
// In agent.worker.ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export class AgentWorker {
  private model: any;
  
  constructor(private config: AgentConfig) {
    this.model = openai(config.model, {
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async processTask(task: AgentTask) {
    const { text } = await generateText({
      model: this.model,
      system: this.config.systemPrompt,
      prompt: this.buildPrompt(task),
      temperature: 0.7,
      maxTokens: 2000,
    });
    
    return this.parseResponse(text);
  }
}
```

## Common Patterns

### 1. Conversation Context
```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
    { role: 'assistant', content: previousResponse },
    { role: 'user', content: newMessage },
  ],
});
```

### 2. JSON Mode
```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Analyze this code and return JSON',
  experimental_jsonMode: true,
});
```

### 3. Token Usage Tracking
```typescript
const { text, usage } = await generateText({...});
console.log(`Tokens used: ${usage.totalTokens}`);
```

## References

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK Core - Generating Text](https://sdk.vercel.ai/docs/ai-sdk-core/generating-text)
- [AI SDK Core - Tools and Tool Calling](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [GitHub Repository](https://github.com/vercel/ai)