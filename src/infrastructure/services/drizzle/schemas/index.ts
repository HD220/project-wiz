import * as usersSchema from './users';
import * as llmProvidersSchema from './llm-providers';
import * as llmModelsSchema from './llm-models';
import * as llmProvidersConfigSchema from './llm-providers-config';
import * as jobsSchema from './jobs';
import * as workersSchema from './workers';
import * as agentStatesSchema from './agent-states'; // New schema
import * as repeatableJobSchedulesSchema from './repeatableJobSchedules'; // Added new schema

export const schema = {
  ...usersSchema,
  ...llmProvidersSchema,
  ...llmModelsSchema,
  ...llmProvidersConfigSchema,
  ...jobsSchema,
  ...workersSchema,
  ...agentStatesSchema,
  ...repeatableJobSchedulesSchema, // Added new schema
};

// Also exporting individuals in case direct imports are preferred by some modules.
export * from './users';
export * from './llm-providers';
export * from './llm-models';
export * from './llm-providers-config';
export * from './jobs';
export * from './workers';
export * from './agent-states';
export * from './repeatableJobSchedules'; // Added new schema
