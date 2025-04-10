# Camada de Infraestrutura (`src/core/infrastructure`)

## Visão Geral

A camada **Infraestrutura** implementa as integrações técnicas do sistema, conectando as abstrações definidas nas camadas **Application** e **Domain** com tecnologias, serviços e recursos externos. Ela é responsável por fornecer implementações concretas para os **ports** (interfaces) definidos nessas camadas, sem conter regras de negócio.

A infraestrutura está organizada por tecnologia ou serviço externo, facilitando a manutenção, substituição e extensão de integrações específicas.

---

## Organização da Infraestrutura

```
src/core/infrastructure/
├── db/
│   └── repositories/
├── electron/
│   ├── adapters/
│   └── github/
├── llm/
│   └── gateways/
└── worker/
    └── adapters/
```

---

## Detalhes das Pastas

### `db/repositories/`

Implementações concretas dos repositórios de dados, como acesso a bancos de dados locais (ex: SQLite via Drizzle ORM). Essas classes implementam os **ports** de repositórios definidos na camada Application.

---

### `electron/`

Integrações específicas com a plataforma Electron.

- **`adapters/`**: Adaptadores que conectam funcionalidades do Electron às interfaces (ports) da Application, como histórico ou comunicação com processos.
- **`github/`**: Gateways que encapsulam integrações com a API do GitHub, como gerenciamento de tokens e autenticação.

---

### `llm/gateways/`

Gateways que encapsulam a comunicação com serviços de modelos de linguagem (LLMs), abstraindo detalhes de APIs, protocolos e formatos específicos. Implementam os ports definidos para serviços LLM.

---

### `worker/adapters/`

Adaptadores que conectam a infraestrutura de workers (ex: Web Workers, processos paralelos) às interfaces da Application, encapsulando detalhes de comunicação assíncrona e gerenciamento de tarefas.

---

## Conceitos-Chave

### Adaptadores

- **Função:** Conectar tecnologias específicas (Electron, Workers, banco de dados) às interfaces (ports) definidas na Application.
- **Responsabilidade:** Traduzir chamadas da aplicação para chamadas técnicas específicas da plataforma.
- **Exemplo:** `ElectronWorkerAdapter` conecta a interface de serviço de worker com a API IPC do Electron.

---

### Gateways

- **Função:** Encapsular integrações com serviços externos (APIs, provedores, SDKs).
- **Responsabilidade:** Isolar detalhes de comunicação, autenticação e protocolos externos.
- **Exemplo:** `GitHubTokenManagerGateway` gerencia tokens e chamadas à API do GitHub.

---

## Dependências

- A infraestrutura **depende exclusivamente das abstrações (ports)** definidas nas camadas **Application** e **Domain**.
- Não há dependência inversa: Application e Domain **não conhecem** a infraestrutura.
- **Não contém regras de negócio**, apenas implementações técnicas.

---

## Resumo

- **Isolamento:** Facilita substituição de tecnologias sem impacto nas regras de negócio.
- **Organização:** Separação clara por tecnologia ou serviço externo.
- **Responsabilidade:** Implementar integrações técnicas, sem lógica de domínio.
- **Facilidade de manutenção:** Estrutura modular e alinhada à Clean Architecture.

---

## Finalidade

Esta organização garante que a infraestrutura possa evoluir, ser substituída ou estendida com mínimo impacto nas demais camadas, mantendo o sistema desacoplado, testável e sustentável.