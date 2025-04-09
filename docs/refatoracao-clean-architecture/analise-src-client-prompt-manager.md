# Análise da pasta `src/client/components/prompt-manager`

## Visão geral

A pasta contém componentes React para gerenciamento de prompts customizados, incluindo criação, edição, visualização, listagem e manipulação de variáveis. Os componentes possuem responsabilidades múltiplas e acoplamento excessivo com infraestrutura, violando princípios de Clean Code e Clean Architecture.

---

## PromptForm.tsx

### Organização geral
- Interface `PromptFormProps` clara.
- Função/componente `PromptForm` com estado, efeitos, validação e renderização.
- JSX estruturado em blocos (nome, descrição, conteúdo, variáveis, preview, botões).

### Nomeação
- Adequada e descritiva.

### Tamanho e responsabilidade
- Função com ~90 linhas, muito longa.
- Mistura lógica de estado, validação e renderização.
- Viola responsabilidade única.

### Violações Clean Code
- Função longa.
- Responsabilidades múltiplas.
- Sugestão: extrair componentes menores e função de validação.

### Violações Clean Architecture
- Usa tipos da infraestrutura (`PromptData`).
- Validações poderiam estar na camada de domínio.

### Melhorias estruturais
- Extrair componentes para seções do formulário.
- Extrair validação.
- Definir DTOs próprios para UI.

---

## PromptList.tsx

### Organização geral
- Interface clara.
- Função/componente com filtro, toolbar e lista.

### Nomeação
- Adequada.

### Tamanho e responsabilidade
- Função com ~80 linhas.
- Mistura filtro, ações e renderização da lista.

### Violações Clean Code
- Função um pouco longa.
- Responsabilidades múltiplas.
- Sugestão: extrair toolbar, lista e item.

### Violações Clean Architecture
- Usa tipos da infraestrutura.

### Melhorias estruturais
- Extrair componentes menores.
- Definir DTOs próprios.

---

## PromptManager.tsx

### Organização geral
- Função utilitária para mapear dados do banco.
- Componente com múltiplos estados e funções CRUD, exportação, importação, geração de link.
- Renderização condicional.

### Nomeação
- Adequada.

### Tamanho e responsabilidade
- Função com quase 200 linhas.
- Mistura controle, dados e UI.
- Viola responsabilidade única.

### Violações Clean Code
- Função muito longa.
- Muitas funções internas.
- Sugestão: extrair hook para lógica, componentes menores, utilitários.

### Violações Clean Architecture
- Acesso direto à infraestrutura.
- Lógica de negócio misturada com UI.
- Ideal: camada de aplicação intermediária.

### Melhorias estruturais
- Extrair hook `usePromptManager`.
- Extrair serviços para camada de aplicação.
- Dividir renderização.
- Definir DTOs próprios.

---

## PromptPreview.tsx

### Organização geral
- Interface clara.
- Função/componente com estado, efeito assíncrono e renderização dinâmica.

### Nomeação
- Adequada.

### Tamanho e responsabilidade
- Função com ~90 linhas.
- Mistura geração de preview e renderização.

### Violações Clean Code
- Função longa.
- Responsabilidades múltiplas.
- Sugestão: extrair hook para preview, componente para inputs.

### Violações Clean Architecture
- Importa serviço diretamente.
- Usa tipos da infraestrutura.

### Melhorias estruturais
- Extrair hook e componentes.
- Definir DTOs próprios.

---

## VariableEditor.tsx

### Organização geral
- Interface clara.
- Função/componente com funções internas para manipulação e renderização da lista.

### Nomeação
- Adequada.

### Tamanho e responsabilidade
- Função com ~100 linhas.
- Mistura manipulação e renderização.

### Violações Clean Code
- Função longa.
- Responsabilidades múltiplas.
- Sugestão: extrair componente para item.

### Violações Clean Architecture
- Usa tipos da infraestrutura.

### Melhorias estruturais
- Extrair componente para item.
- Definir DTOs próprios.

---

## Problemas gerais identificados

- Componentes excessivamente longos e com múltiplas responsabilidades.
- Acoplamento direto com infraestrutura (`PromptData`, `VariableData`).
- Lógica de negócio misturada com UI.
- Falta de separação clara entre camadas.

## Recomendações gerais

- Extrair componentes menores e hooks para separar responsabilidades.
- Criar camada de aplicação para orquestrar operações.
- Definir DTOs próprios para UI, desacoplando da infraestrutura.
- Aplicar princípios SOLID e Clean Architecture para melhorar manutenibilidade.

---

**Importante:** Não resolver problemas agora, apenas documentar. Criar issues separadas para melhorias estruturais e para problemas que extrapolam escopo (ex: acoplamento com infraestrutura).