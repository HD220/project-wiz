# Análise da pasta `src/core/application`

## Visão geral da pasta

A pasta `src/core/application` concentra os serviços de orquestração da lógica de negócio, intermediando o domínio e a infraestrutura. Ela contém serviços relacionados à manipulação de prompts, integração com LLMs, compartilhamento e configurações. A organização geral segue o padrão de agrupar serviços em uma subpasta `services/`, mas há pontos de acoplamento e violações de princípios que precisam ser tratados.

---

## Análise por arquivo

### `services/llm-service.ts`

- **Organização geral:** contém a classe `LlmService` que implementa a interface `ILlmService`.
- **Nomeação:** adequada e descritiva para a responsabilidade de orquestrar chamadas para LLM.
- **Tamanho e responsabilidade:**
  - A maioria das funções são pequenas e focadas.
  - A função `promptStream` possui cerca de 28 linhas, com múltiplas responsabilidades: gerenciar Promise, listeners, callbacks e tratamento de erros.
  - Dentro de `promptStream`, há funções internas `handleResponse` e `handleError`.
- **Violações de Clean Code:**
  - `promptStream` viola o princípio da função pequena e única responsabilidade (SRP).
  - Funções internas aumentam a complexidade e dificultam testes isolados.
  - Comentários indicam risco de vazamento de memória devido a listeners não removidos.
- **Violações de Clean Architecture:**
  - Nenhuma explícita além do risco de vazamento afetar a estabilidade da aplicação.
- **Possíveis melhorias:**
  - Extrair `handleResponse` e `handleError` para métodos privados.
  - Dividir `promptStream` em funções menores e mais focadas.
  - Criar uma issue para tratar o risco de vazamento de memória.

---

### `services/prompt-processor.ts`

- **Organização geral:** contém a função `applyPrompt`.
- **Nomeação:** clara quanto ao propósito de aplicar transformações no prompt.
- **Tamanho e responsabilidade:**
  - `applyPrompt` possui aproximadamente 100 linhas.
  - Realiza múltiplas tarefas: validação, conversão, sanitização, substituição de variáveis.
  - Contém switches aninhados e loops que aumentam a complexidade.
- **Violações de Clean Code:**
  - Função excessivamente longa, dificultando leitura e manutenção.
  - Viola o princípio da responsabilidade única.
- **Violações de Clean Architecture:**
  - Nenhuma explícita, mas a complexidade prejudica a clareza da camada de aplicação.
- **Possíveis melhorias:**
  - Extrair validação, conversão e substituição para funções menores e específicas.
  - Criar uma issue para refatoração da função.

---

### `services/prompt-share-service.ts`

- **Organização geral:** funções para exportar e importar prompts.
- **Nomeação:** adequada e clara.
- **Tamanho e responsabilidade:**
  - Funções pequenas, focadas e coesas.
  - Define a interface `ExportedPromptPackage`.
- **Violações de Clean Code:**
  - Nenhuma relevante.
- **Violações de Clean Architecture:**
  - Depende diretamente do tipo `PromptData` que pertence à infraestrutura.
  - Isso viola o princípio de independência da camada de aplicação em relação à infraestrutura.
- **Possíveis melhorias:**
  - Mover `PromptData` para o domínio ou criar um DTO específico para a aplicação.
  - Criar uma issue para tratar essa dependência incorreta.

---

### `services/settings-service.ts`

- **Organização geral:** classe com métodos estáticos para fornecer configurações fixas.
- **Nomeação:** adequada para o propósito.
- **Tamanho e responsabilidade:**
  - Código simples, focado e de fácil leitura.
- **Violações de Clean Code:**
  - Configurações estão hardcoded, dificultando mudanças e testes.
- **Violações de Clean Architecture:**
  - A camada de aplicação não deveria conter configurações fixas, mas depender de abstrações.
- **Possíveis melhorias:**
  - Extrair uma interface `ISettingsProvider`.
  - Implementar busca dinâmica de configurações via injeção de dependência.
  - Criar uma issue para tratar essa dependência fixa.

---

## Lista de problemas detectados

- Funções longas e complexas:
  - `promptStream` (28 linhas, múltiplas responsabilidades)
  - `applyPrompt` (~100 linhas, múltiplas responsabilidades)
- Risco de vazamento de memória em `promptStream` (listeners não removidos)
- Dependência da infraestrutura (`PromptData`) na camada de aplicação
- Configurações fixas hardcoded na aplicação

---

## Sugestões gerais

- Refatorar funções longas em funções menores, focadas e testáveis.
- Isolar responsabilidades múltiplas em funções e classes específicas.
- Remover dependências da infraestrutura da camada de aplicação, criando DTOs ou movendo tipos para o domínio.
- Implementar interfaces para configurações dinâmicas, removendo valores hardcoded da aplicação.
- Corrigir o risco de vazamento de memória, garantindo a remoção adequada de listeners.

---