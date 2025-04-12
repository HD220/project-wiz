# ADR-0012: Implementação de Clean Architecture para Serviços LLM

## Status

- 🟢 **Aceito**

---

## Contexto

O serviço LLM apresentava desafios como alto acoplamento com a implementação do Electron, dificuldade para testar componentes isoladamente, complexidade para adicionar novos provedores LLM e dependência direta do client com detalhes de implementação. Era necessário adotar uma arquitetura que promovesse separação de responsabilidades, testabilidade e flexibilidade.

---

## Decisão

Adotar Clean Architecture para organizar o código dos serviços LLM em camadas bem definidas:
- **Domain:** Entidades e interfaces de negócio (ex: prompt, session, model, ports)
- **Application:** Casos de uso e serviços (ex: model-manager, prompt-service)
- **Infrastructure:** Implementações concretas (ex: electron-adapters, workers)
- **Client:** Componentes UI e hooks (ex: useLLM)
- **Shared:** Utilitários e helpers

A comunicação entre camadas deve ser feita por meio de interfaces e contratos bem definidos, facilitando a troca de implementações e a adição de novos provedores LLM.

---

## Consequências

**Positivas:**
- Separação clara de responsabilidades e camadas
- Domínio independente de frameworks
- Testabilidade aprimorada (mocks e testes isolados)
- Facilidade para adicionar novos provedores LLM
- Manutenção e refatoração localizadas

**Negativas:**
- Demanda inicial de refatoração significativa
- Curva de aprendizado para a equipe

---

## Alternativas Consideradas

- **Manter arquitetura atual** — rejeitado por dificultar manutenção, testes e evolução.
- **Adotar outra arquitetura (ex: DDD puro)** — rejeitado por não atender à necessidade de desacoplamento entre camadas e flexibilidade para múltiplos provedores.

---

## Links Relacionados

- [ADR-0005 - Estrutura de Pastas Electron](./ADR-0005-Estrutura-de-Pastas-Electron.md)
- [ISSUE-0065 - Reorganização de pastas](../../issues/backlog/improvement/ISSUE-0065-Reorganizacao-estrutura-pastas/README.md)
- [ISSUE-0068 - Consolidação serviços LLM](../../issues/backlog/improvement/ISSUE-0068-Consolidacao-servicos-LLM/README.md)