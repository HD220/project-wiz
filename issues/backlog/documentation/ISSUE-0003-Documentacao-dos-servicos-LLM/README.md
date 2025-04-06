# Documentação dos serviços LLM

## Descrição

Documentação técnica detalhada dos serviços de Modelos de Linguagem (LLM) do projeto, incluindo:

- Visão geral dos serviços
- Arquitetura e componentes
- Handlers IPC disponíveis
- Fluxos de comunicação
- Exemplos de uso

## Conteúdo Atual

```markdown
# Serviços LLM do Project Wiz

## Visão Geral

Os serviços LLM fornecem integração com modelos de linguagem locais via node-llama-cpp, permitindo:

- Carregamento de modelos Llama
- Criação de contextos de inferência
- Geração de respostas via prompts
- Comunicação IPC entre processos

## Handlers IPC Disponíveis:

1. **worker:initialize** - Inicializa o runtime Llama
2. **worker:loadModel** - Carrega um modelo na memória
3. **worker:createContext** - Cria contexto para inferência
4. **worker:prompt** - Executa um prompt no modelo

## Componentes Principais

- **LlamaWorker**: Gerencia ciclo de vida do modelo LLM
- **LlamaWorkerBridge**: Gerencia comunicação IPC entre processos
```

## Histórico de Implementação

### 02/04/2025 - Implementação de Novos Handlers IPC

**Descrição:**

- Implementados novos handlers IPC para "download-model" e "send-prompt"
- Adicionados testes de integração correspondentes
- Documentação atualizada em `docs/llm-services.md` e `docs/testing-strategy.md`

**Arquivos Modificados:**

- `src/core/services/llm/WorkerService.ts`
- `src/core/main.ts`
- `src/core/__tests__/integration/worker.integration.test.ts`

**Impacto:**

- Nova funcionalidade de download de modelos remotos
- Suporte a envio assíncrono de prompts
- Melhoria na cobertura de testes

**Próximos Passos:**

- Monitorar performance das novas operações
- Adicionar tratamento de erros específicos

### 02/04/2025 - Padronização dos Handlers IPC

**Descrição:**

- Todos os handlers do WorkerService foram padronizados para receber e repassar payloads idênticos aos do worker
- As interfaces públicas foram mantidas consistentes em toda a cadeia de chamadas

**Arquivos Modificados:**

- `src/core/services/llm/WorkerService.ts`

**Impacto:**

- Melhoria na consistência da API
- Facilita a manutenção e extensão futura
- Documentação atualizada em `docs/llm-services.md`

**Próximos Passos:**

- Monitorar possíveis impactos nos consumidores da API
- Atualizar exemplos de uso conforme necessário

## Tarefas

## Tarefas

- [ ] Revisar documentação atual
- [ ] Completar seção "Integração com Hugging Face"
- [ ] Atualizar exemplos de código conforme necessário
- [ ] Verificar consistência com a implementação atual

## Critérios de Aceitação

- Documentação completa e atualizada
- Todos os handlers IPC documentados
- Exemplos de código funcionais
- Seções incompletas finalizadas
