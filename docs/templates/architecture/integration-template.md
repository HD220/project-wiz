---
template_type: "architecture"
complexity: "medium"
primary_agent: "solution-architect"
estimated_time: "1-3 hours"
related_patterns:
  - "docs/developer/ipc-communication-patterns.md"
  - "docs/technical-guides/ai-integration/"
  - "docs/developer/error-handling-patterns.md"
---

# Integration Architecture: [INTEGRATION_NAME]

**Date:** [DATE]  
**Version:** [VERSION]  
**Status:** [Draft/In Review/Approved/Implemented]  
**Authors:** [AUTHOR_NAME], Claude Code  
**Integration Type:** [API/SDK/Service/Database/File System]

## Executive Summary

### Integration Overview

[Describe the integration being designed - what external system/service is being integrated and why.]

### Key Integration Points

- [Integration point 1]
- [Integration point 2]
- [Integration point 3]

### Success Criteria

- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]

## Context and Requirements

### Business Context

[Explain the business need for this integration and how it supports Project Wiz's goals.]

### Integration Scope

**In Scope:**

- [Feature/capability 1 to be integrated]
- [Feature/capability 2 to be integrated]
- [Feature/capability 3 to be integrated]

**Out of Scope:**

- [Capability 1 explicitly excluded]
- [Capability 2 for future consideration]
- [Capability 3 handled by other integrations]

### Project Wiz Context

[Explain how this integration fits within Project Wiz's architecture:]

- **Desktop App Integration:** [How this works within Electron context]
- **Security Requirements:** [Desktop app security considerations]
- **INLINE-FIRST Impact:** [How integration code follows inline-first principles]
- **Data Flow Integration:** [How this fits with TanStack Router/Query patterns]

## External System Analysis

### System Overview

**System Name:** [EXTERNAL_SYSTEM_NAME]  
**Type:** [REST API/GraphQL/SDK/Database/File System/Other]  
**Version:** [VERSION_INFO]  
**Documentation:** [LINK_TO_DOCUMENTATION]

### Capabilities and Constraints

**Capabilities:**

- [Capability 1 with details]
- [Capability 2 with details]
- [Capability 3 with details]

**Constraints:**

- [Rate limits, quotas, or usage restrictions]
- [Authentication and authorization requirements]
- [Data format and protocol limitations]
- [Availability and reliability characteristics]

### Authentication & Security

```typescript
// Authentication pattern for external system
interface [SystemName]Config {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  rateLimitPerMinute: number;
}

// Secure configuration management
export class [SystemName]Config {
  private static config: [SystemName]Config | null = null;

  static initialize(config: [SystemName]Config): void {
    // Validate configuration
    if (!config.apiKey || !config.baseUrl) {
      throw new Error('Invalid [SystemName] configuration');
    }

    this.config = config;
  }

  static getConfig(): [SystemName]Config {
    if (!this.config) {
      throw new Error('[SystemName] not initialized');
    }
    return this.config;
  }
}
```

## Integration Architecture

### High-Level Integration Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Project Wiz   │    │   Integration   │    │   External      │
│   Frontend      │    │   Layer         │    │   System        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ [Component]     │◄──►│ [Integration    │◄──►│ [External API]  │
│ TanStack Query  │    │  Service]       │    │ [SDK/Library]   │
│ Error Handling  │    │ Error Handling  │    │ [Database]      │
└─────────────────┘    │ Rate Limiting   │    └─────────────────┘
                       │ Caching         │
                       │ Retry Logic     │
                       └─────────────────┘
```

### Integration Service Layer

```typescript
// Integration service following Project Wiz INLINE-FIRST patterns
export class [SystemName]IntegrationService {
  static async [operationName](input: [InputType]): Promise<[ReturnType]> {
    // INLINE-FIRST: Validation + API call + error handling
    const validated = [ValidationSchema].parse(input);
    const config = [SystemName]Config.getConfig();

    try {
      // Rate limiting check (inline)
      await this.checkRateLimit();

      // API call with timeout (inline)
      const response = await fetch(`${config.baseUrl}/[endpoint]`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
        signal: AbortSignal.timeout(config.timeout),
      });

      // Response handling (inline)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `[SystemName] API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Data transformation (inline if < 15 lines)
      return {
        id: data.id,
        result: data.result,
        processedAt: new Date(data.timestamp),
      };

    } catch (error) {
      // Error handling and logging (inline)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`[SystemName] request timeout after ${config.timeout}ms`);
        }
        if (error.message.includes('rate limit')) {
          throw new Error('[SystemName] rate limit exceeded - please retry later');
        }
      }

      // Log error for monitoring
      logger.error('[SystemName] integration error', {
        error: error.message,
        input: validated
      });

      throw error;
    }
  }

  private static async checkRateLimit(): Promise<void> {
    // INLINE-FIRST: Simple rate limiting logic
    const key = '[system-name]-rate-limit';
    const limit = [SystemName]Config.getConfig().rateLimitPerMinute;

    // Implementation depends on Project Wiz's caching strategy
    // This could be in-memory for desktop app or database-based
    const currentCount = await this.getRateLimitCount(key);

    if (currentCount >= limit) {
      throw new Error(`Rate limit exceeded: ${currentCount}/${limit} requests per minute`);
    }

    await this.incrementRateLimit(key);
  }
}
```

### IPC Handler Integration

```typescript
// IPC handler for integration operations
export function setup[SystemName]Handlers(): void {
  ipcMain.handle(
    '[system-name]:[operation]',
    async (_, input: [InputType]): Promise<IpcResponse<[ReturnType]>> => {
      try {
        const result = await [SystemName]IntegrationService.[operationName](input);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '[SystemName] operation failed',
        };
      }
    },
  );

  // Health check handler
  ipcMain.handle(
    '[system-name]:health-check',
    async (): Promise<IpcResponse<{ status: string; lastCheck: Date }>> => {
      try {
        const health = await [SystemName]IntegrationService.healthCheck();
        return { success: true, data: health };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '[SystemName] health check failed',
        };
      }
    },
  );
}
```

### Frontend Integration

```typescript
// Frontend integration with TanStack Query
export function use[SystemName]Integration() {
  return {
    // Mutation for external system operations
    [operationName]: useMutation({
      mutationFn: async (input: [InputType]) => {
        return await loadApiData(
          () => window.api.[systemName].[operation](input),
          '[SystemName] operation failed'
        );
      },
      onSuccess: (data) => {
        toast.success('[Operation] completed successfully');
        // Invalidate related queries if needed
        queryClient.invalidateQueries({ queryKey: ['related-data'] });
      },
      onError: (error) => {
        toast.error(error.message);
        // Log error for debugging
        logger.error('[SystemName] operation failed', { error });
      },
    }),

    // Health check query
    healthCheck: useQuery({
      queryKey: ['[system-name]', 'health'],
      queryFn: () => loadApiData(
        () => window.api.[systemName].healthCheck(),
        'Failed to check [SystemName] health'
      ),
      refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
      retry: 3,
    }),
  };
}

// Component usage example
export function [IntegrationComponent]() {
  const { [operationName], healthCheck } = use[SystemName]Integration();
  const [input, setInput] = useState<[InputType]>({ /* default values */ });

  // Health status display
  const isHealthy = healthCheck.data?.status === 'healthy';

  // Operation handler (INLINE-FIRST)
  const handleOperation = async () => {
    if (!isHealthy) {
      toast.error('[SystemName] is currently unavailable');
      return;
    }

    try {
      await [operationName].mutateAsync(input);
      setInput({ /* reset values */ });
    } catch (error) {
      // Error already handled by mutation onError
      console.error('Operation failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Health status indicator */}
      <div className={cn(
        "flex items-center gap-2 p-2 rounded",
        isHealthy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isHealthy ? "bg-green-600" : "bg-red-600"
        )} />
        <span>{isHealthy ? '[SystemName] Connected' : '[SystemName] Unavailable'}</span>
      </div>

      {/* Integration form */}
      <form onSubmit={(e) => { e.preventDefault(); handleOperation(); }}>
        {/* Form fields */}
        <Button
          type="submit"
          disabled={[operationName].isPending || !isHealthy}
        >
          {[operationName].isPending ? 'Processing...' : '[Operation Name]'}
        </Button>
      </form>
    </div>
  );
}
```

## Data Flow and Transformation

### Data Flow Diagram

```
[User Input] → [Frontend Validation] → [IPC Call] → [Integration Service]
     ↓                                                      ↓
[UI Update] ← [Response Processing] ← [IPC Response] ← [External API]
     ↓                                                      ↓
[State Update] ← [Data Transformation] ← [Response Parsing] ← [API Response]
```

### Data Transformation Patterns

```typescript
// Input transformation (Project Wiz → External System)
export const toExternalFormat = (input: ProjectWizType): ExternalSystemType => {
  // INLINE-FIRST: Simple transformation logic
  return {
    external_id: input.id,
    external_name: input.name.toUpperCase(),
    external_config: {
      setting1: input.settings.enableFeature,
      setting2: input.settings.maxRetries,
    },
    metadata: {
      source: "project-wiz",
      version: "1.0",
      timestamp: new Date().toISOString(),
    },
  };
};

// Output transformation (External System → Project Wiz)
export const fromExternalFormat = (
  external: ExternalSystemResponse,
): ProjectWizResult => {
  // INLINE-FIRST: Simple transformation logic
  return {
    id: external.external_id,
    result: external.result_data,
    status: external.status_code === 200 ? "success" : "failed",
    processedAt: new Date(external.timestamp),
    metadata: {
      externalVersion: external.version,
      processingTime: external.processing_time_ms,
    },
  };
};
```

## Error Handling and Resilience

### Error Categories and Handling

```typescript
// Error types specific to integration
export type IntegrationError =
  | 'network_error'
  | 'authentication_error'
  | 'rate_limit_error'
  | 'validation_error'
  | 'timeout_error'
  | 'service_unavailable';

export class [SystemName]Error extends Error {
  constructor(
    public type: IntegrationError,
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = '[SystemName]Error';
  }
}

// Error handling in integration service
export class [SystemName]IntegrationService {
  static async [operationName](input: [InputType]): Promise<[ReturnType]> {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        return await this.performOperation(input);
      } catch (error) {
        const integrationError = this.mapError(error);

        // INLINE-FIRST: Retry logic
        if (integrationError.retryable && retryCount < maxRetries) {
          retryCount++;
          const delayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        throw integrationError;
      }
    }
  }

  private static mapError(error: unknown): [SystemName]Error {
    // INLINE-FIRST: Error mapping logic
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new [SystemName]Error('timeout_error', 'Request timeout', undefined, true);
      }
      if (error.message.includes('401') || error.message.includes('403')) {
        return new [SystemName]Error('authentication_error', 'Authentication failed', undefined, false);
      }
      if (error.message.includes('429')) {
        return new [SystemName]Error('rate_limit_error', 'Rate limit exceeded', 429, true);
      }
      if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        return new [SystemName]Error('service_unavailable', 'Service temporarily unavailable', undefined, true);
      }
    }

    return new [SystemName]Error('network_error', 'Network error occurred', undefined, true);
  }
}
```

### Circuit Breaker Pattern

```typescript
// Simple circuit breaker for integration resilience
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private failureThreshold: number = 5,
    private timeoutMs: number = 60000,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // INLINE-FIRST: Circuit breaker logic
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is OPEN - service unavailable");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "open";
    }
  }
}
```

## Configuration and Security

### Configuration Management

```typescript
// Secure configuration for desktop app
export interface [SystemName]Configuration {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  rateLimitPerMinute: number;
  retryAttempts: number;
  circuitBreakerThreshold: number;
}

// Configuration validation
const [SystemName]ConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Valid base URL required'),
  timeout: z.number().min(1000).max(60000),
  rateLimitPerMinute: z.number().min(1).max(1000),
  retryAttempts: z.number().min(0).max(5),
  circuitBreakerThreshold: z.number().min(1).max(10),
});

// Secure storage in main process (NOT renderer process)
export class [SystemName]ConfigManager {
  private static configPath = path.join(app.getPath('userData'), '[system-name]-config.json');

  static async saveConfig(config: [SystemName]Configuration): Promise<void> {
    // Validate configuration
    const validated = [SystemName]ConfigSchema.parse(config);

    // Encrypt sensitive data before storage
    const encrypted = await this.encryptConfig(validated);

    await fs.writeFile(this.configPath, JSON.stringify(encrypted, null, 2));
  }

  static async loadConfig(): Promise<[SystemName]Configuration | null> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const encrypted = JSON.parse(data);
      const decrypted = await this.decryptConfig(encrypted);

      return [SystemName]ConfigSchema.parse(decrypted);
    } catch (error) {
      return null;
    }
  }

  private static async encryptConfig(config: [SystemName]Configuration): Promise<any> {
    // Implementation depends on Project Wiz's encryption strategy
    // Could use Node.js crypto module or electron-store with encryption
    return config; // Placeholder - implement actual encryption
  }

  private static async decryptConfig(encrypted: any): Promise<[SystemName]Configuration> {
    // Implementation depends on Project Wiz's encryption strategy
    return encrypted; // Placeholder - implement actual decryption
  }
}
```

## Testing Strategy

### Unit Testing

```typescript
// Integration service testing
describe('[SystemName]IntegrationService', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();

    // Setup test configuration
    [SystemName]Config.initialize({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com',
      timeout: 5000,
      rateLimitPerMinute: 60,
    });
  });

  it('should successfully perform operation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', result: 'success' }),
    } as Response);

    const input = { data: 'test' };
    const result = await [SystemName]IntegrationService.[operationName](input);

    expect(result).toMatchObject({ id: '123', result: 'success' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/[endpoint]',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key',
        }),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Invalid input' }),
    } as Response);

    const input = { data: 'invalid' };

    await expect([SystemName]IntegrationService.[operationName](input))
      .rejects.toThrow('[SystemName] API error: 400 - Invalid input');
  });
});
```

### Integration Testing

```typescript
// IPC integration testing
describe("[SystemName] IPC Integration", () => {
  it("should handle successful operation via IPC", async () => {
    const input = { data: "test" };
    const response = await ipcRenderer.invoke(
      "[system-name]:[operation]",
      input,
    );

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  it("should handle errors via IPC", async () => {
    const invalidInput = { data: "" };
    const response = await ipcRenderer.invoke(
      "[system-name]:[operation]",
      invalidInput,
    );

    expect(response.success).toBe(false);
    expect(response.error).toContain("validation");
  });
});
```

### End-to-End Testing

```typescript
// E2E testing with external system
describe("[SystemName] E2E Integration", () => {
  beforeEach(async () => {
    // Setup test environment with real or mocked external system
    await setupTestEnvironment();
  });

  it("should complete full integration workflow", async () => {
    // Test complete user workflow
    const userInput = {
      /* realistic test data */
    };
    const result = await performCompleteWorkflow(userInput);

    expect(result.success).toBe(true);
    expect(result.data).toMatchSnapshot();
  });
});
```

## Monitoring and Observability

### Health Monitoring

```typescript
// Health check implementation
export class [SystemName]HealthMonitor {
  static async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastCheck: Date;
    responseTime?: number;
    details: Record<string, any>;
  }> {
    const startTime = Date.now();

    try {
      // INLINE-FIRST: Simple health check
      const config = [SystemName]Config.getConfig();
      const response = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: responseTime > 3000 ? 'degraded' : 'healthy',
          lastCheck: new Date(),
          responseTime,
          details: { statusCode: response.status },
        };
      } else {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime,
          details: { statusCode: response.status, error: response.statusText },
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}
```

### Metrics Collection

```typescript
// Integration metrics
interface IntegrationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export class [SystemName]Metrics {
  private static metrics: IntegrationMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  };

  static recordRequest(success: boolean, responseTime: number, error?: string): void {
    // INLINE-FIRST: Simple metrics recording
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
      this.metrics.lastError = error;
      this.metrics.lastErrorTime = new Date();
    }

    // Update average response time
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests;
  }

  static getMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  static resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    };
  }
}
```

## Implementation Checklist

### Pre-Implementation

- [ ] External system documentation reviewed
- [ ] Authentication credentials obtained and tested
- [ ] Rate limits and quotas understood
- [ ] Security requirements defined
- [ ] Error scenarios identified

### Implementation Phase 1: Core Integration

- [ ] Integration service implemented with INLINE-FIRST principles
- [ ] IPC handlers created and tested
- [ ] Configuration management implemented
- [ ] Basic error handling in place
- [ ] Unit tests written and passing

### Implementation Phase 2: Resilience

- [ ] Retry logic implemented
- [ ] Circuit breaker pattern added (if needed)
- [ ] Rate limiting implemented
- [ ] Health monitoring added
- [ ] Integration tests written and passing

### Implementation Phase 3: Frontend Integration

- [ ] TanStack Query hooks implemented
- [ ] UI components created with proper error handling
- [ ] Loading states and error feedback implemented
- [ ] E2E tests written and passing

### Post-Implementation

- [ ] Documentation updated
- [ ] Monitoring and alerting configured
- [ ] Performance benchmarks established
- [ ] Security review completed

## References

### Project Wiz Documentation

- [IPC Communication Patterns](../../developer/ipc-communication-patterns.md)
- [Error Handling Patterns](../../developer/error-handling-patterns.md)
- [AI Integration Guides](../../technical-guides/ai-integration/)

### External Documentation

- [External System API Documentation]
- [SDK Documentation]
- [Authentication Documentation]

### Related Architectural Documents

- [Related ADRs]
- [System design documents]
- [Security specifications]

---

## Template Usage Notes

**For Claude Code Agents:**

1. Replace all `[PLACEHOLDER]` text with integration-specific content
2. Include actual code examples following Project Wiz patterns
3. Reference specific external system documentation and capabilities
4. Ensure security considerations are properly addressed for desktop app context
5. Test integration thoroughly with both mocked and real external systems

**File Naming Convention:** `integration-[external-system-name].md`  
**Location:** Save completed integration designs in `docs/architecture/integrations/`
