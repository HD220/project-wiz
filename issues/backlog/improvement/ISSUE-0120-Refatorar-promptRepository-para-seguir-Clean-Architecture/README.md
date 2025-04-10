# ISSUE-0120 - Refatorar promptRepository para seguir Clean Architecture

## Contexto

O arquivo `src/core/infrastructure/db/promptRepository.ts` possui aproximadamente 250 linhas, concentrando múltiplas responsabilidades, o que viola princípios fundamentais da Clean Architecture e Clean Code.

Atualmente, métodos como `createPrompt` e `updatePrompt`:

- São extensos e complexos
- Misturam **validação de dados**, **regras de negócio** e **persistência**
- Tornam difícil a manutenção, testes e evolução do código

---

## Problemas Identificados

- **Violação do princípio da responsabilidade única (SRP)**: o repositório não está limitado à persistência, acumulando lógica de domínio e validação.
- **Métodos longos e difíceis de testar isoladamente**
- **Acoplamento excessivo entre camadas**: infraestrutura, domínio e aplicação estão misturados.
- **Dificuldade para reaproveitar regras de negócio e validações em outros contextos**

---

## Objetivo da Refatoração

- **Isolar responsabilidades**:
  - Extrair **validações** para serviços ou use cases na camada **Application**
  - Extrair **regras de negócio** para camada **Domain** ou **Application**
  - Manter no repositório **apenas a persistência** (CRUD puro)
- **Dividir métodos longos** em funções menores, coesas e com nomes descritivos
- **Melhorar legibilidade, testabilidade e manutenibilidade**
- **Alinhar com a Clean Architecture**, facilitando evolução futura

---

## Critérios de Aceitação

- [ ] Validações extraídas para serviços ou use cases na camada Application
- [ ] Regras de negócio extraídas para Domain ou Application
- [ ] Repositório contendo apenas operações de persistência
- [ ] Métodos longos divididos em funções menores e focadas
- [ ] Funcionalidades mantidas intactas (sem regressão)
- [ ] Código mais legível, modular e fácil de testar
- [ ] Documentação mínima da nova estrutura no handoff da issue

---

## Prioridade

**Alta** — Essencial para garantir a qualidade arquitetural do projeto e facilitar futuras evoluções.

---

## Notas adicionais

- Seguir as recomendações da [ADR-0008-Clean-Architecture-LLM](docs/adr/ADR-0008-Clean-Architecture-LLM.md)
- Aproveitar para nomear funções e classes de forma descritiva
- Se necessário, criar interfaces para validações e regras de negócio para facilitar testes e substituições futuras
- Atualizar diagramas ou documentação impactada

---

## Relacionado a

- Clean Architecture no projeto
- Melhoria contínua da base de código
- Débito técnico acumulado no módulo de prompts