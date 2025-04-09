# Consolidação Serviços LLM - Plano de Execução Detalhado

## Objetivo Técnico
Implementar arquitetura limpa para serviços LLM com:
- Desacoplamento total do Electron
- Suporte nativo a streaming
- Testabilidade aprimorada
- Manutenção simplificada

## Roadmap Técnico

### 🏗️ Fase 1: Core Architecture (5 dias úteis)
1. **Estrutura Base** (Dia 1)
   - [ ] Criar `domain/ports/llm-service.ts`
   - [ ] Definir `domain/entities/prompt.ts`
   - [ ] Implementar `application/services/llm-service.ts`

2. **Model Management** (Dias 2-3)
   - [ ] Interface `model-manager`
   - [ ] Serviço `model-manager`
   - [ ] Adaptador `electron-model-manager`

3. **Contracts** (Dias 4-5)
   - [ ] DTOs para todas comunicações
   - [ ] Tipos para eventos de streaming
   - [ ] Validação de payloads

### ⚙️ Fase 2: LLM Engine (10 dias úteis)
1. **Worker Service** (Dias 1-4)
   ```typescript
   // domain/ports/worker-service.ts
   interface WorkerService {
     executePrompt(
       prompt: Prompt,
       onChunk: (chunk: StreamChunk) => void
     ): Promise<void>;
   }
   ```

2. **Streaming Protocol** (Dias 5-7)
   - [ ] Definir formato dos chunks
   - [ ] Implementar buffer de streaming
   - [ ] Tratamento de erros

3. **IPC Layer** (Dias 8-10)
   - [ ] Serialização eficiente
   - [ ] Handlers para todos eventos
   - [ ] Timeout management

### 🖥️ Fase 3: Client Integration (5 dias úteis)
1. **Hook useLLM** (Dias 1-2)
   - [ ] Manter API existente
   - [ ] Adaptar para nova arquitetura
   - [ ] Suporte a cancelamento

2. **UI Components** (Dias 3-5)
   - [ ] Criar `presentation/components/llm`
   - [ ] Isolar lógica de renderização
   - [ ] Loading states

## ✅ Critérios de Qualidade
| Métrica            | Alvo         | Ferramenta       |
|--------------------|--------------|------------------|
| Cobertura tipos    | 100%         | TypeScript       |
| Testes unitários   | 90%+         | Jest             |
| Latência streaming| <100ms/chunk | Chrome DevTools  |
| Memória           | -10%         | Process Explorer |

## 📚 Referências Técnicas
1. [ADR-0008](/docs/adr/ADR-0008-Clean-Architecture-LLM.md)
2. [Node-Llama-CPP Docs](https://github.com/withcatai/node-llama-cpp)
3. [Electron IPC Best Practices](https://www.electronjs.org/docs/latest/tutorial/ipc)