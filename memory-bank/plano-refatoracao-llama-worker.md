# Plano de Refatoração do LlamaWorker para LlamaChatSession

## Objetivo Principal

Modificar o `llama-worker.ts` para usar exclusivamente o `LlamaChatSession` para todas as interações de geração de texto.

## Microtarefas Sequenciais

### 1. Preparação e Análise

- [ ] Verificar versão atual do node-llama-cpp (3.6.0)
- [ ] Revisar documentação específica do LlamaChatSession
- [ ] Remover completamente métodos de completion e chat anteriores

### 2. Modificações de Importação

- [ ] Atualizar importações, removendo métodos não utilizados:
  ```typescript
  import {
    Llama,
    LlamaContext,
    LlamaModel,
    LlamaChatSession,
  } from "node-llama-cpp";
  ```

### 3. Estrutura da Classe

- [ ] Adicionar propriedade `chatSession`
- [ ] Criar método `ensureChatSession()` para inicialização sob demanda
- [ ] Modificar método de criação de contexto para preparar sessão de chat

### 4. Geração de Texto com LlamaChatSession

- [ ] Criar método unificado para geração de texto
- [ ] Suportar diferentes tipos de entrada (prompt simples, mensagens de chat)
- [ ] Implementar lógica de streaming
- [ ] Manter tratamento de progresso e erros
- [ ] Garantir flexibilidade para diferentes estilos de geração

### 5. Gerenciamento de Recursos

- [ ] Atualizar método `cleanup()`
- [ ] Adicionar liberação específica para `chatSession`
- [ ] Garantir fechamento correto de recursos

### 6. Interface de Comunicação

- [ ] Adaptar handlers de mensagens para novo método de geração
- [ ] Manter compatibilidade com interface existente
- [ ] Simplificar lógica de comunicação

### 7. Testes e Validação

- [ ] Testar geração de texto com diferentes entradas
- [ ] Verificar comportamento de streaming
- [ ] Validar tratamento de erros
- [ ] Confirmar performance e estabilidade

### 8. Documentação

- [ ] Atualizar comentários no código
- [ ] Documentar novo método de geração
- [ ] Adicionar exemplos de uso do LlamaChatSession

## Critérios de Aceitação

- [ ] Uso exclusivo de LlamaChatSession
- [ ] Remoção completa de métodos anteriores de completion
- [ ] Manutenção da funcionalidade de geração de texto
- [ ] Interface de comunicação inalterada
- [ ] Código limpo e bem documentado

## Considerações Especiais

- Foco total na simplicidade e uso direto do LlamaChatSession
- Flexibilidade para diferentes estilos de geração de texto
- Preparação para futuras evoluções da biblioteca
