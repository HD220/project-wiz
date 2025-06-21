// src/shared/ipc-types.ts

export type WorkerRequestType =
    // Job Repository
    | 'JOB_REPO_CREATE'
    | 'JOB_REPO_LOAD'
    | 'JOB_REPO_SAVE'
    | 'JOB_REPO_LIST'
    | 'JOB_REPO_DELETE'
    | 'JOB_REPO_FIND_NEXT_PROCESSABLE'
    // Agent Repository
    | 'AGENT_REPO_CREATE'
    | 'AGENT_REPO_LOAD'
    | 'AGENT_REPO_SAVE'
    | 'AGENT_REPO_LIST'
    | 'AGENT_REPO_DELETE'
    // AgentRuntimeState Repository
    | 'AGENT_RUNTIME_STATE_REPO_CREATE'
    | 'AGENT_RUNTIME_STATE_REPO_LOAD'
    | 'AGENT_RUNTIME_STATE_REPO_SAVE'
    | 'AGENT_RUNTIME_STATE_REPO_LIST'
    | 'AGENT_RUNTIME_STATE_REPO_DELETE'
    // Persona Repository
    | 'PERSONA_REPO_CREATE'
    | 'PERSONA_REPO_LOAD'
    | 'PERSONA_REPO_SAVE'
    | 'PERSONA_REPO_LIST'
    | 'PERSONA_REPO_DELETE'
    // User Repository
    | 'USER_REPO_CREATE'
    | 'USER_REPO_LOAD'
    | 'USER_REPO_SAVE'
    | 'USER_REPO_LIST'
    | 'USER_REPO_DELETE'
    // Worker Repository
    | 'WORKER_REPO_CREATE'
    | 'WORKER_REPO_LOAD'
    | 'WORKER_REPO_SAVE'
    | 'WORKER_REPO_LIST'
    | 'WORKER_REPO_DELETE'
    | 'WORKER_REPO_FIND_FIRST_AVAILABLE'
    // LLMProviderConfig Repository
    | 'LLM_PROVIDER_CONFIG_REPO_CREATE'
    | 'LLM_PROVIDER_CONFIG_REPO_LOAD'
    | 'LLM_PROVIDER_CONFIG_REPO_SAVE'
    | 'LLM_PROVIDER_CONFIG_REPO_LIST'
    | 'LLM_PROVIDER_CONFIG_REPO_DELETE'
    // LLM Adapter
    | 'LLM_ADAPTER_EXECUTE_WITH_TOOLS' // Changed from LLM_ADAPTER_GENERATE to match new interface
    // Job Queue
    | 'JOB_QUEUE_ADD_JOB'
    | 'JOB_QUEUE_REMOVE_JOB'
    ;

export interface WorkerRequest {
    requestId: string; // To pair requests with responses
    type: WorkerRequestType;
    payload: any; // Payload structure depends on the request type
}

export interface WorkerResponse {
    requestId: string;
    success: boolean;
    data?: any; // Response data if successful
    error?: { // Error details if not successful
        message: string;
        name?: string;
        stack?: string; // Stack might not be fully relevant across IPC
    };
}

// Type guard for WorkerRequest
export function isWorkerRequest(message: any): message is WorkerRequest {
    return message && typeof message.requestId === 'string' && typeof message.type === 'string' && 'payload' in message;
}

// Type guard for WorkerResponse (useful in worker)
export function isWorkerResponse(message: any): message is WorkerResponse {
    return message && typeof message.requestId === 'string' && typeof message.success === 'boolean';
}
