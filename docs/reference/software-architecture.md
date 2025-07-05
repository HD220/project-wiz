# Arquitetura de Software - Project Wiz

Este documento descreve a arquitetura de software para o Project Wiz. A arquitetura é projetada para ser robusta, escalável, manutenível e testável, aderindo às melhores práticas modernas e aos requisitos específicos do projeto. Todo o código e identificadores seguem as convenções detalhadas na **ADR-028: Convenções Abrangentes de Nomenclatura**.

## 1. Princípios Arquiteturais Fundamentais

A arquitetura do Project Wiz é guiada por um conjunto de princípios fundamentais que visam garantir a qualidade, flexibilidade e longevidade do sistema. Eles são a espinha dorsal das decisões de design e são refletidos em várias ADRs.

```mermaid
graph TD
    Usuarios[Usuários / Clientes Externos] --> CAM_PRES[Camada de Apresentação (Electron UI, CLI)];
    CAM_PRES --> CAM_APP[Camada de Aplicação (Casos de Uso, Serviços de Aplicação)];
    CAM_APP --> CAM_DOM[Camada de Domínio (Entidades, VOs, Serviços de Domínio)];
    CAM_APP --> PORTAS_INFRA[Portas (Abstrações para Infraestrutura)];
    CAM_INFRA[Camada de Infraestrutura (Adaptadores, Persistência, Dispositivos Externos)] --> PORTAS_INFRA;

    subgraph " "
      direction LR
      SHARED_KERNEL[Kernel Compartilhado (Erros, DTOs Comuns, Utilitários Base)]
    end

    CAM_PRES --> SHARED_KERNEL;
    CAM_APP --> SHARED_KERNEL;
    CAM_DOM --> SHARED_KERNEL;
    CAM_INFRA --> SHARED_KERNEL;

    subgraph "Interface do Usuário / Mecanismos de Entrega"
        CAM_PRES
    end
    subgraph "Lógica de Negócios Principal e Orquestração da Aplicação"
        CAM_DOM
        CAM_APP
    end
    subgraph "Detalhes Técnicos e Dependências Externas"
        CAM_INFRA
    end
    subgraph "Recursos Transversais (Cross-Cutting)"
        SHARED_KERNEL
    end

    style CAM_DOM fill:#FFDAB9,stroke:#333,stroke-width:2px
    style CAM_APP fill:#ADD8E6,stroke:#333,stroke-width:2px
    style CAM_PRES fill:#E6E6FA,stroke:#333,stroke-width:2px
    style CAM_INFRA fill:#90EE90,stroke:#333,stroke-width:2px
    style PORTAS_INFRA fill:#FFFFE0,stroke:#333,stroke-width:2px
    style SHARED_KERNEL fill:#F5F5DC,stroke:#333,stroke-width:2px

    classDef default fill:#fff,stroke:#333,stroke-width:2px;
```
*Legenda: As setas indicam a direção das dependências permitidas.*

*   **Clean Architecture:**
    *   **Descrição:** O sistema segue rigorosamente os princípios da Clean Architecture. Esta abordagem organiza a codebase em camadas concêntricas (Domínio, Aplicação, Infraestrutura), com uma regra estrita de dependência: todas as dependências de código fonte fluem para dentro, em direção à camada de Domínio. Isso garante que a lógica de negócios central (contida nas camadas de Domínio e Aplicação) seja independente de frameworks externos, UI, e detalhes de banco de dados, promovendo alta testabilidade e manutenibilidade.
    *   **Manifestação no Project Wiz:**
        *   A estrutura de diretórios (e.g., `core/domain/`, `core/application/`, `infrastructure/`, `presentation/`) reflete claramente as camadas. Todos os nomes de diretórios e arquivos dentro de `src_refactored/` seguem `kebab-case`, com sufixos de tipo apropriados (e.g., `user.entity.ts`, `project.repository.ts`, `create-user.use-case.ts`), conforme **ADR-028** e **ADR-027**.
        *   Casos de Uso (`core/application/use-cases/`) dependem de interfaces de repositório (e.g., `core/domain/project/ports/project-repository.interface.ts`) que são implementadas na camada de `infrastructure/persistence/`.
        *   Entidades e Objetos de Valor (`core/domain/`) não possuem conhecimento sobre Drizzle ORM, Electron, ou React. Eles contêm pura lógica de negócio.
        *   A comunicação entre a UI (`presentation/ui/`) e o backend é feita através de um conjunto bem definido de DTOs e handlers IPC, que por sua vez invocam Casos de Uso na camada de Aplicação.
    *   **ADRs Relevantes:** Este princípio é fundamental e permeia quase todas as ADRs que tratam de estrutura e interações entre componentes, notavelmente **ADR-010** (Entidades e VOs), **ADR-011** (Repositórios), **ADR-012** (Casos de Uso), **ADR-017** (Persistência), **ADR-018** (Adaptadores), **ADR-019** (Injeção de Dependência), **ADR-023** (Electron Main), **ADR-024** (IPC), e **ADR-025** (Componentes React). A visualização detalhada das camadas e suas responsabilidades é apresentada na seção "3. Camadas Arquiteturais".

*   **Object Calisthenics:**
    *   **Descrição:** Um conjunto de nove "exercícios" ou regras de programação que, quando aplicados, tendem a produzir código orientado a objetos extremamente limpo, legível, coeso e de fácil manutenção. São regras mais prescritivas que os princípios SOLID e visam reduzir a complexidade e aumentar a clareza.
    *   **Manifestação no Project Wiz:**
        *   "Envolva Todas as Primitivas e Strings": Fortemente aplicado através da adoção de Objetos de Valor (VOs), instanciados via `new VOName(valorPrimitivo)` com validação em seus construtores públicos, para representar conceitos de domínio em vez de tipos primitivos (ver **ADR-010 Revisado**).
        *   "Sem Getters/Setters para estado mutável": Entidades seguem um padrão de imutabilidade funcional, onde métodos de alteração de estado retornam novas instâncias (criadas via `new Entidade(novasProps)` usando construtores públicos), e VOs são estritamente imutáveis (**ADR-010 Revisado**). Getters são usados para exposição controlada do estado.
        *   "Apenas Um Nível de Indentação por Método" e "Não Use a Palavra-Chave ELSE": Incentivados para simplificar a lógica de métodos em Casos de Uso, Serviços e Entidades.
    *   **ADRs Relevantes:** **ADR-016: Aplicação Prática de Object Calisthenics no Project Wiz** detalha como cada uma das 9 regras é interpretada e aplicada. **ADR-010 Revisado** sobre Entidades e VOs é uma implementação direta de várias dessas regras.

*   **SOLID:**
    *   **Descrição:** Acrônimo para cinco princípios de design que tornam os sistemas de software mais compreensíveis, flexíveis e manuteníveis.
        *   **S (Single Responsibility Principle - Princípio da Responsabilidade Única):** Uma classe deve ter apenas uma razão para mudar.
        *   **O (Open/Closed Principle - Princípio Aberto/Fechado):** Entidades de software devem ser abertas para extensão, mas fechadas para modificação.
        *   **L (Liskov Substitution Principle - Princípio da Substituição de Liskov):** Subtipos devem ser substituíveis por seus tipos base sem alterar a corretude do programa.
        *   **I (Interface Segregation Principle - Princípio da Segregação de Interfaces):** Clientes não devem ser forçados a depender de interfaces que não usam.
        *   **D (Dependency Inversion Principle - Princípio da Inversão de Dependência):** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. Abstrações não devem depender de detalhes; detalhes devem depender de abstrações.
    *   **Manifestação no Project Wiz:**
        *   **SRP:** Casos de Uso focados em uma única operação de aplicação (ADR-012). Entidades e VOs com responsabilidades bem definidas (ADR-010). Serviços de Aplicação (e.g., `worker.service.ts` conforme ADR-022) com um conjunto coeso de funcionalidades.
        *   **OCP:** Uso de interfaces (Portas) para Adaptadores de Infraestrutura (ADR-018) permite adicionar novas implementações (e.g., um novo provedor de LLM) sem modificar o código da camada de aplicação que usa a interface.
        *   **LSP:** Relevante ao considerar herança, como a hierarquia de `AbstractEntity` e `AbstractValueObject` (ADR-010), garantindo que as classes filhas respeitem o contrato da classe base.
        *   **ISP:** Interfaces de Repositório específicas por entidade (ADR-011) e interfaces de Adaptadores focadas em um conjunto coeso de operações (ADR-018, e.g., `ILLMAdapter`, `AbstractQueue` conforme ADR-020).
        *   **DIP:** A Clean Architecture é uma manifestação direta deste princípio. A Camada de Aplicação depende de abstrações (interfaces de repositório, de adaptadores), não de implementações concretas da Infraestrutura. O framework de Injeção de Dependência InversifyJS (ADR-019) é usado para realizar essa inversão de controle.
    *   **ADRs Relevantes:** Estes princípios são reforçados em múltiplas ADRs, incluindo **ADR-010** (Entidades/VOs), **ADR-011** (Repositórios), **ADR-012** (Casos de Uso/Serviços de Aplicação), **ADR-018** (Adaptadores), **ADR-019** (DI), **ADR-020** (Filas), e **ADR-022** (WorkerService).

*   **DRY (Don't Repeat Yourself - Não se Repita):**
    *   **Descrição:** Evitar a duplicação de código, lógica e conhecimento. Conhecimento e comportamento devem ser definidos em um único local canônico dentro do sistema.
    *   **Manifestação no Project Wiz:**
        *   Criação de Objetos de Valor (ADR-010) para encapsular dados com regras de validação e formatação próprias.
        *   Uso de Serviços de Aplicação (ADR-012) para orquestrar lógica de negócios reutilizável.
        *   Desenvolvimento de hooks customizados no frontend (`use-*.hook.ts` conforme ADR-027, ADR-025) para encapsular lógica de UI reutilizável.
        *   Esquemas Zod reutilizáveis (`*.schema.ts`) para validação em diferentes camadas (ADR-007, ADR-010, ADR-012, ADR-024).
    *   **ADRs Relevantes:** Diretrizes explícitas em `docs/developer/coding-standards.md`.

*   **KISS (Keep It Simple, Stupid - Mantenha Simples, Estúpido):**
    *   **Descrição:** Priorizar soluções simples e diretas em detrimento de complexidade desnecessária ou engenharia excessiva (over-engineering). O design mais simples que funciona é geralmente o melhor.
    *   **Manifestação no Project Wiz:**
        *   Preferir implementações diretas e claras.
        *   Adoção de padrões de design apenas quando a complexidade do problema realmente os justifica.
        *   Foco em interfaces claras e concisas entre componentes.
    *   **ADRs Relevantes:** Diretrizes explícitas em `docs/developer/coding-standards.md`.

*   **Modularidade e Separação de Responsabilidades (Separation of Concerns - SoC):**
    *   **Descrição:** Cada componente, módulo e camada do sistema deve ter responsabilidades bem definidas e distintas, minimizando sobreposições e acoplamento. Isso torna o sistema mais fácil de entender, manter e evoluir.
    *   **Manifestação no Project Wiz:**
        *   A própria Clean Architecture.
        *   A divisão em `core/domain`, `core/application`, `infrastructure` e `presentation`.
        *   Dentro da UI, a estrutura de `features/` (ADR-027).
        *   A decomposição de funcionalidades complexas em serviços menores (e.g., no sistema de filas, ADR-020).
    *   **ADRs Relevantes:** Fundamental para a maioria das ADRs de design (e.g., ADR-010 a ADR-031).

## 2. Tecnologias Chave

A seleção de tecnologias visa robustez, produtividade, suporte da comunidade e alinhamento com os princípios arquiteturais. O guia `docs/developer/tooling-guide.md` oferece detalhes sobre a configuração de ferramentas e extensões. Arquivos de configuração de ferramentas (e.g., `vite.config.ts`, `tailwind.config.ts`) seguem as convenções de nomenclatura das próprias ferramentas e podem ser exceções às regras de sufixo de tipo do projeto se localizados na raiz do projeto.

*   **Application Framework:** ElectronJS.
    *   **Justificativa (ADR-023, ADR-024):** Permite o desenvolvimento de aplicações desktop multiplataforma com tecnologias web.
*   **Frontend (UI - Processo de Renderização):**
    *   **React:** Biblioteca para construção de interfaces de usuário.
        *   **Justificativa (ADR-025):** Vasto ecossistema, modelo de componentes declarativo.
    *   **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
        *   **Justificativa (ADR-015):** Essencial para segurança de tipo e manutenibilidade.
    *   **Tailwind CSS:** Framework CSS utility-first.
        *   **Justificativa (ADR-026):** Agilidade no desenvolvimento de UI, consistência visual. (Arquivo de configuração: `tailwind.config.ts`)
    *   **Shadcn/UI:** Coleção de componentes React reutilizáveis.
        *   **Justificativa (ADR-026):** Componentes acessíveis e customizáveis.
    *   **Vite:** Ferramenta de build e servidor de desenvolvimento.
        *   **Justificativa:** Performance superior em desenvolvimento e build otimizado. (Arquivo de configuração: `vite.config.ts`)
    *   **TanStack Router (`@tanstack/react-router`):** Para roteamento na SPA React.
        *   **Justificativa (ADR-027):** Roteamento type-safe, file-based routing.
    *   **React Hook Form & Zod:** Para gerenciamento e validação de formulários.
        *   **Justificativa (ADR-025):** Performance, DX, e integração com Zod.
*   **Backend/Core Logic (Processo Principal Electron e Lógica de Negócios):**
    *   **TypeScript & Node.js:** Ambiente de execução e linguagem.
        *   **Justificativa (ADR-015):** Consistência de linguagem, tipagem estática.
    *   **InversifyJS (`inversify`, `reflect-metadata`):** Framework de Injeção de Dependência (DI).
        *   **Justificativa (ADR-019):** Leve, poderoso, bom suporte a TypeScript e decoradores. (Arquivo de configuração: `inversify.config.ts`)
*   **AI/LLM Integration:** AI SDK (Vercel AI SDK).
    *   **Justificativa (ADR-018):** Biblioteca moderna e flexível para interagir com LLMs.
*   **Database/Persistence:** SQLite (via `better-sqlite3`) com Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
        *   **Justificativa (ADR-017):** SQLite para portabilidade; Drizzle ORM por ser moderno, leve e type-safe. (Arquivo de configuração: `drizzle.config.ts`)
*   **Testes Automatizados:** Vitest.
    *   **Justificativa (ADR-029):** Framework moderno, rápido, com API compatível com Jest. (Arquivo de configuração: `vitest.config.ts` ou integrado ao `vite.config.ts`)

## 3. Camadas Arquiteturais (Clean Architecture)

A arquitetura do Project Wiz é baseada nos princípios da Clean Architecture de Robert C. Martin, que organiza o software em camadas concêntricas. Esta estrutura promove a separação de responsabilidades, testabilidade e independência de frameworks e tecnologias externas. A regra fundamental é a **Regra de Dependência**: o código fonte só pode ter dependências que apontam para "dentro", ou seja, camadas de alto nível (como a de Domínio) não devem depender de camadas de baixo nível (como a de Infraestrutura). Em vez disso, ambas dependem de abstrações.

### Visualização das Camadas Principais
(Esta visualização é uma representação da Clean Architecture clássica, adaptada para o contexto do projeto)
```mermaid
graph TD
    FrameworksDrivers[Frameworks & Drivers (Ex: Electron, React, Drizzle ORM, APIs Externas)] --Implementa e Interage com--> AdaptadoresInterface(Adaptadores de Interface (Ex: Controladores UI, Handlers IPC, Repositórios DB, Adaptadores de API))
    AdaptadoresInterface --Invoca e é Implementado por--> CasosDeUso(Casos de Uso / Serviços de Aplicação)
    CasosDeUso --Orquestra e Utiliza--> EntidadesVOs(Entidades / Objetos de Valor / Serviços de Domínio)

    subgraph CamadaExterna [Detalhes de Implementação Externa]
        FrameworksDrivers
    end
    subgraph CamadaAdaptadores [Adaptadores (Tradução e Mediação)]
        AdaptadoresInterface
    end
    subgraph CamadaAplicacao [Lógica de Aplicação (Regras Específicas da Aplicação)]
        CasosDeUso
    end
    subgraph CamadaDominio [Lógica de Negócios Central (Regras Universais de Negócio)]
        EntidadesVOs
    end

    style EntidadesVOs fill:#FFDAB9,stroke:#333,stroke-width:2px
    style CasosDeUso fill:#ADD8E6,stroke:#333,stroke-width:2px
    style AdaptadoresInterface fill:#90EE90,stroke:#333,stroke-width:2px
    style FrameworksDrivers fill:#E6E6FA,stroke:#333,stroke-width:2px

    classDef CamadaExterna fill:#F0F8FF, stroke:#D3D3D3
    classDef CamadaAdaptadores fill:#FAFAD2, stroke:#D3D3D3
    classDef CamadaAplicacao fill:#FFF0F5, stroke:#D3D3D3
    classDef CamadaDominio fill:#FFE4E1, stroke:#D3D3D3
```
*Legenda: As setas indicam a direção das dependências permitidas. A Camada de Domínio é o núcleo, não dependendo de nenhuma outra. As demais camadas dependem apenas de camadas mais internas.*

*   **Fluxo de Controle:** O fluxo de controle geralmente começa em uma camada externa (e.g., interação do usuário na UI), passa pelos adaptadores de interface (e.g., um handler IPC que valida e transforma dados), chega à camada de aplicação (casos de uso), que então orquestra as entidades e objetos de valor da camada de domínio. Os dados resultantes retornam pelo mesmo caminho, sendo transformados pelos adaptadores para o formato esperado pela camada externa.
*   **Interfaces (Portas):** As interfaces definidas nas camadas internas (e.g., interfaces de repositório no domínio, interfaces de adaptadores para serviços externos na aplicação) atuam como "portas" que são implementadas pelas camadas externas. Isso permite que as implementações concretas (detalhes) sejam trocadas sem afetar as camadas internas.

A seguir, detalhamos as principais camadas conforme implementadas no Project Wiz, localizadas primariamente em `src_refactored/`.

### 3.1. Camada de Domínio (`src_refactored/core/domain/`)

*   **Propósito:** Contém a lógica de negócios mais pura e central da aplicação, representando as regras, conceitos e o "idioma" do domínio do Project Wiz. Esta camada é o coração do software e deve ser completamente independente de qualquer outra camada em termos de dependências de código fonte. Sua estabilidade é crucial. Os nomes de arquivos aqui seguem o padrão `kebab-case.sufixo.ts` (e.g., `project.entity.ts`, `user-email.vo.ts`, `project-repository.interface.ts`).
*   **Componentes Chave:**
    *   **Entidades (`*.entity.ts`):**
        *   **Papel:** Representam objetos de negócio com uma identidade única que persiste ao longo do tempo (e.g., `UserEntity`, `ProjectEntity`, `JobEntity`). Encapsulam atributos e a lógica de negócios (invariantes) que governam seu estado.
        *   **Padrões (ADR-010 Revisado):**
            *   Instanciadas via construtor público (e.g., `new ProjectEntity(props)`), que é responsável pela validação inicial das props de entrada (usando um esquema Zod para `ProjectConstructorProps`, por exemplo) e pela inicialização do estado. Lançam `EntityError` em caso de falha na validação.
            *   Seguem um padrão de imutabilidade funcional: métodos que alteram o estado retornam uma nova instância da entidade (e.g., `return new ProjectEntity(novasProps);`).
            *   Implementam `toPersistence()` para converter o estado para um POJO serializável.
            *   A reconstrução de Entidades a partir de dados de persistência é responsabilidade da camada de Repositório/Mapper, que utilizará o construtor público da Entidade (conforme ADR-017).
        *   **Exemplo (Estrutura Conceitual - `project.entity.ts`):**
            ```typescript
            // // src_refactored/core/domain/project/project.entity.ts
            // import { z } from "zod";
            // import { AbstractEntity, EntityError } from "@shared/domain";
            // import { ProjectId } from "./project-id.vo";
            // import { ProjectName } from "./project-name.vo";
            // // Supondo a existência de ProjectDescription VO e UserId VO
            // // import { ProjectDescription } from "./project-description.vo";
            // // import { UserId } from "@core/domain/user/user-id.vo";
            // import { type ProjectConstructorProps, ProjectConstructorPropsSchema } from "./project.schemas";
            // import { type InternalProjectProps, type ProjectPersistenceData } from "./project.types";

            // export class ProjectEntity extends AbstractEntity<ProjectId, InternalProjectProps> {
            //   public constructor(props: ProjectConstructorProps) { // Construtor público
            //     const validationResult = ProjectConstructorPropsSchema.safeParse(props);
            //     if (!validationResult.success) {
            //       throw new EntityError("Props de ProjectEntity inválidas.",
            //                           validationResult.error.flatten().fieldErrors);
            //     }
            //     const { id, name, description, userId, createdAt, updatedAt } = validationResult.data;
            //     // VOs (id, name, description se for VO, userId) devem ser passados já instanciados e validados.
            //     super(id, {
            //       name,
            //       description,
            //       userId,
            //       createdAt: createdAt || new Date(),
            //       updatedAt: updatedAt || new Date(),
            //     });
            //   }

            //   public get name(): ProjectName { return this.props.name; }
            //   public get description(): string /* ou ProjectDescription */ { return this.props.description; }
            //   // ... outros getters ...

            //   public updateDetails(newName: ProjectName, newDescription: string /* ou ProjectDescription */): ProjectEntity {
            //     const newConstructorProps: ProjectConstructorProps = {
            //       id: this.id,
            //       name: newName,
            //       description: newDescription,
            //       userId: this.props.userId,
            //       createdAt: this.props.createdAt, // Mantém data de criação original
            //       updatedAt: new Date(), // Atualiza data de modificação
            //     };
            //     return new ProjectEntity(newConstructorProps); // Retorna nova instância
            //   }

            //   public toPersistence(): ProjectPersistenceData { /* ...converte props para POJO ... */ }
            // }
            ```
    *   **Objetos de Valor (VOs - `*.vo.ts`):**
        *   **Papel:** Representam conceitos descritivos do domínio sem identidade única, definidos por seus atributos. São imutáveis e comparados por valor (e.g., `user-email.vo.ts`, `job-status.vo.ts`).
        *   **Padrões (ADR-010 Revisado):**
            *   Estritamente imutáveis (`public readonly` para propriedades).
            *   Validação no construtor público (e.g., `new JobStatus("PENDING")`), usando Zod para os dados de entrada. Lançam `ValueError` em caso de falha.
            *   Método `equals()` para comparação estrutural.
        *   **Exemplo (Estrutura Conceitual - `job-status.vo.ts`):**
            ```typescript
            // // src_refactored/core/domain/job/value-objects/job-status.vo.ts
            // import { z } from "zod";
            // import { AbstractValueObject, ValueError } from "@shared/domain";

            // const validStatuses = ["PENDING", "RUNNING", "COMPLETED", "FAILED"] as const;
            // // O schema valida o input para o construtor
            // const JobStatusInputSchema = z.string().toUpperCase().pipe(z.enum(validStatuses));
            // type JobStatusType = z.infer<typeof JobStatusInputSchema>;
            // interface JobStatusProps { value: JobStatusType; }

            // export class JobStatus extends AbstractValueObject<JobStatusProps> {
            //   public readonly value: JobStatusType;
            //   public constructor(statusInput: string) { // Construtor público
            //     const validationResult = JobStatusInputSchema.safeParse(statusInput);
            //     if (!validationResult.success) {
            //       throw new ValueError(`Status de Job inválido: ${statusInput}`,
            //                            validationResult.error.flatten().fieldErrors);
            //     }
            //     super({ value: validationResult.data });
            //     this.value = validationResult.data;
            //   }
            // }
            ```
    *   **Serviços de Domínio (`*.domain-service.ts` - usar com critério):**
        *   **Papel:** Encapsulam lógica de domínio que não pertence a uma Entidade/VO ou coordena múltiplas Entidades. São stateless. Arquivo: `nome-servico.domain-service.ts`.
    *   **Interfaces de Repositório (`<nome-da-entidade-kebab-case>-repository.interface.ts`):**
        *   **Papel:** Definem contratos (portas) para persistência e recuperação de Entidades.
        *   **Localização (ADR-011):** `src_refactored/core/domain/<nome-da-entidade-kebab-case>/ports/`.
        *   **Padrões (ADR-011):** Nomenclatura `I[NomeDaEntidade]Repository`. Métodos CRUD padrão. IDs como VOs. Retornos `Promise`.
    *   **Eventos de Domínio (`*.domain-event.ts` - Opcional/Futuro):**
        *   **Papel:** Representam ocorrências significativas no domínio. Arquivo: `nome-evento.domain-event.ts`.

### 3.2. Camada de Aplicação (`src_refactored/core/application/`)

*   **Propósito:** Contém a lógica específica da aplicação, orquestrando os casos de uso do sistema. Atua como mediadora entre o Domínio e as camadas externas. Nomes de arquivos aqui seguem `kebab-case.sufixo.ts` (e.g., `create-project.use-case.ts`, `notification.service.ts`).
*   **Componentes Chave:**
    *   **Casos de Uso (Interactors - `use-cases/**/*.[use-case.ts`):**
        *   **Papel:** Implementam operações específicas da aplicação (e.g., `create-project.use-case.ts`).
        *   **Padrões (ADR-012 Revisado):**
            *   A implementação concreta do método `execute(input: TInput)` DEVE retornar `Promise<TSuccessData>` diretamente em caso de sucesso, ou lançar (`throw`) uma instância de `CoreError` (ou suas subclasses) em caso de falha.
            *   Validam DTOs de entrada (`*.schema.ts`, e.g., `create-project.schema.ts`) com Zod no início do `execute`, lançando `ApplicationError` em falha de validação.
            *   A transformação para `IUseCaseResponse` é feita por um `UseCaseWrapper` (ADR-008).
        *   **Exemplo (Estrutura Conceitual - `create-project.use-case.ts`):**
            ```typescript
            // // src_refactored/core/application/use-cases/project/create-project.use-case.ts
            // import { injectable, inject } from "inversify";
            // import { IUseCase, ApplicationError, CoreError } from "@shared/application";
            // import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from "@core/domain/project/ports/project-repository.interface";
            // import { ProjectEntity } from "@core/domain/project/project.entity";
            // import { ProjectId } from "@core/domain/project/project-id.vo";
            // import { ProjectName } from "@core/domain/project/project-name.vo";
            // import { UserId } from "@core/domain/user/user-id.vo";
            // // Supondo ProjectDescription VO
            // // import { ProjectDescription } from "@core/domain/project/project-description.vo";
            // import { type CreateProjectInput, CreateProjectInputSchema } from "./create-project.schema";
            // import { type ProjectDto, projectToDto } from "../dtos/project.dto";

            // @injectable()
            // export class CreateProjectUseCase implements IUseCase<CreateProjectInput, Promise<ProjectDto>> {
            //   constructor(
            //     @inject(PROJECT_REPOSITORY_TOKEN) private readonly projectRepository: IProjectRepository
            //   ) {}

            //   async execute(input: CreateProjectInput): Promise<ProjectDto> {
            //     const validationResult = CreateProjectInputSchema.safeParse(input);
            //     if (!validationResult.success) {
            //       throw new ApplicationError("Validação de entrada falhou para CreateProjectUseCase",
            //                                  validationResult.error.flatten().fieldErrors);
            //     }
            //     const { name, description, userIdValue } = validationResult.data;

            //     // Instanciação de VOs antes de criar a Entidade
            //     const projectNameVo = new ProjectName(name);
            //     // const projectDescriptionVo = new ProjectDescription(description); // Se description for um VO
            //     const ownerIdVo = new UserId(userIdValue);

            //     // Criação da Entidade usando construtor público (ADR-010 Revisado)
            //     // Assumindo que ProjectId.create() ou new ProjectId() é válido conforme ADR-010
            //     const projectId = new ProjectId(); // Ou outra forma de obter/gerar o ProjectId VO

            //     const project = new ProjectEntity({
            //       id: projectId,
            //       name: projectNameVo,
            //       description: description, // Ou projectDescriptionVo se for um VO
            //       userId: ownerIdVo,
            //       // createdAt e updatedAt são gerenciados internamente pela AbstractEntity ou no construtor de ProjectEntity
            //     });

            //     await this.projectRepository.save(project);
            //     return projectToDto(project); // Retorna DTO de sucesso diretamente
            //   }
            // }
            ```
    *   **Serviços de Aplicação (`services/**/*.service.ts`):**
        *   **Papel:** Coordenam lógica de aplicação complexa (e.g., `generic-agent-executor.service.ts`).
        *   **Padrões (ADR-012 Revisado):** Métodos públicos que são pontos de entrada principais retornam dados de sucesso diretamente ou lançam `CoreError`. Um `UseCaseWrapper` ou lógica similar no chamador (e.g., handler IPC) pode converter isso para `IUseCaseResponse`.
    *   **Portas (Interfaces para Infraestrutura - `ports/` ou `core/ports/adapters/`):**
        *   **Papel:** Definem contratos para funcionalidades da infraestrutura. Arquivos como `<nome-adaptador>.adapter.interface.ts` ou `<nome-porta>.port.ts`.
        *   **Exemplos:** `ILLMAdapter` (ADR-018), `AbstractQueue` (ADR-020, e.g., `abstract-queue.port.ts`), `ILogger` (ADR-013, e.g., `logger.interface.ts`).
    *   **DTOs / Esquemas (`*.schema.ts`, `*.types.ts`, `dtos/`):**
        *   **Padrão:** Zod (ADR-007) para esquemas. Arquivos em `kebab-case.schema.ts` ou `kebab-case.types.ts`.
    *   **Factories (`factories/**/*.factory.ts` - usar com critério):**
        *   **Papel:** Para criação de objetos complexos. Arquivo: `nome-fabrica.factory.ts`.

A camada de aplicação é crucial para manter a lógica de domínio pura, pois ela lida com a orquestração e a adaptação de dados entre o mundo externo e o núcleo de negócios.
### 3.3. Camada de Infraestrutura (`src_refactored/infrastructure/` e `src_refactored/presentation/electron/main/`)

*   **Propósito:** Contém todas as implementações concretas de detalhes externos à aplicação. Esta camada lida com frameworks, acesso a banco de dados, interação com sistemas de arquivos, comunicação com APIs de terceiros, e a interface do usuário (UI) no contexto de ser um mecanismo de entrega. Ela implementa as interfaces (portas) definidas pelas camadas de Aplicação e Domínio, tornando as camadas internas independentes de detalhes de implementação específicos.
*   **Componentes Chave:**
    *   **Implementações de Persistência (`infrastructure/persistence/drizzle/`):**
        *   **Papel:** Implementações concretas das Interfaces de Repositório (definidas em `core/domain/<entidade-kebab-case>/ports/`) usando Drizzle ORM e SQLite. Arquivos como `drizzle-project.repository.ts`.
        *   **Padrões (ADR-017):** Definição de esquemas de tabela (`*.schema.ts` ou `*.table.ts`), mappers (`*.mapper.ts`), `save()` como upsert, tratamento de erros com `InfrastructureError`. A reconstrução de entidades é feita aqui usando os construtores públicos das entidades/VOs.
        *   **Diagrama de Interação da Persistência (Conceitual):**
            ```mermaid
            graph LR
                AppService[Serviço de Aplicação / Caso de Uso] -- Chama --> RepoInterface(IProjectRepository)
                subgraph infra [Camada de Infraestrutura]
                    direction LR
                    DrizzleRepoImpl[DrizzleProjectRepository] -- Implementa --> RepoInterface
                    DrizzleRepoImpl -- Usa --> DrizzleMapper[ProjectDrizzleMapper]
                    DrizzleRepoImpl -- Interage com --> DrizzleClient[Cliente Drizzle (db)]
                    DrizzleClient -- Executa SQL --> SQLite[(SQLite Banco de Dados)]
                    DrizzleMapper -- Converte para/de --> ProjectSchema[project.table.ts (Drizzle Schema)]
                end
                style DrizzleRepoImpl fill:#90EE90,stroke:#333,stroke-width:2px
                style DrizzleMapper fill:#90EE90,stroke:#333,stroke-width:2px
                style DrizzleClient fill:#90EE90,stroke:#333,stroke-width:2px
            ```
    *   **Implementações de Fila (`infrastructure/queue/drizzle/`):**
        *   **Papel:** Implementação concreta do sistema de filas (e.g., `drizzle-queue.facade.ts`).
        *   **Padrões (ADR-020):** `DrizzleQueueFacade` implementa `AbstractQueue` (e.g., `abstract-queue.port.ts`), compõe serviços internos (`queue-service-core.service.ts`, etc.).
    *   **Adaptadores (`infrastructure/adapters/`):**
        *   **Papel:** Encapsulam comunicação com serviços externos (e.g., `openai-llm.adapter.ts`).
        *   **Padrões (ADR-018):** Implementam portas de `core/application/ports/adapters/` (e.g., `llm.adapter.interface.ts`). Retornam `Promise<OutputTipoEspecifico>` ou lançam `InfrastructureError`.
        *   **Diagrama de Fluxo de Adaptador (Conceitual):**
            ```mermaid
            sequenceDiagram
                participant AppService as Serviço de Aplicação
                participant AdapterPort as ILLMAdapter (Porta da Aplicação)
                participant AdapterImpl as OpenAILLMAdapter (Infraestrutura)
                participant ExternalAPI as API Externa (e.g., OpenAI)

                AppService->>+AdapterPort: generateText(prompt)
                AdapterPort->>+AdapterImpl: generateText(prompt)
                AdapterImpl->>AdapterImpl: Traduz 'prompt' para formato da API externa
                AdapterImpl->>+ExternalAPI: Requisição HTTP (prompt formatado, API Key)
                ExternalAPI-->>-AdapterImpl: Resposta HTTP (texto gerado ou erro da API)
                AdapterImpl->>AdapterImpl: Traduz resposta para formato da aplicação (e.g., string ou lança InfrastructureError)
                AdapterImpl-->>-AdapterPort: Promise<string | InfrastructureError>
                AdapterPort-->>-AppService: Promise<string | InfrastructureError>
            ```
    *   **Processo Principal Electron e Handlers IPC (`src_refactored/presentation/electron/main/`):**
        *   **Papel:** `main.ts` gerencia ciclo de vida e registra handlers IPC (e.g., `project.handlers.ts`).
        *   **Padrões:** ADR-023 (Setup Main Process), ADR-024 (IPC/Preload).
    *   **Configuração da Injeção de Dependência (`infrastructure/ioc/inversify.config.ts`):**
        *   **Papel:** Configura o container InversifyJS.
        *   **Padrões (ADR-019):** Uso de `Symbol` como tokens, injeção via construtor.

### 3.4. Arquitetura Frontend (UI - React) (`src_refactored/presentation/ui/`)

A interface do usuário (UI) do Project Wiz é uma Single Page Application (SPA) construída com React, TypeScript e Vite, localizada em `src_refactored/presentation/ui/`. Ela é responsável por toda a interação visual com o usuário e comunica-se com o processo principal do Electron via IPC para executar operações de backend e persistir dados. Todos os arquivos seguem `kebab-case` (e.g., `meu-componente.tsx`, `use-minha-logica.hook.ts`, `utils-formatacao.utils.ts`), conforme ADR-027 e ADR-028.

*   **Princípios de Design da UI (ADR-025):**
    *   Componentes Funcionais e Hooks. Separação Container/Presentational.
    *   Gerenciamento de Estado: Local (`useState`), Compartilhado (Context API), Estado de Servidor (hooks IPC como `use-ipc-query.hook.ts`), Global (Zustand/Jotai se necessário).
    *   Formulários: React Hook Form + Zod (`meu-formulario.schema.ts`).
*   **Estilização (ADR-026):**
    *   Tailwind CSS (utility-first). Shadcn/UI para componentes base (e.g., `components/ui/button.tsx`). Função `cn` para classes.
*   **Estrutura de Diretórios e Nomenclatura (ADR-027):**
    *   `app/` (rotas), `components/` (globais), `features/<nome-da-feature>/` (módulos), `hooks/`, `lib/`, `services/` (e.g. `ipc.service.ts`), `styles/`, `types/`.
    *   **Diagrama da Estrutura de Diretórios Frontend (ADR-027):**
        ```mermaid
        graph LR
            subgraph presentation_ui [presentation/ui/]
                direction LR
                appDir["app/ (Rotas TanStack Router)"]
                componentsDir["components/ (Componentes Globais Reutilizáveis)"]
                featuresDir["features/ (Módulos por Funcionalidade de Negócio)"]
                hooksDir["hooks/ (Hooks Globais Reutilizáveis)"]
                libDir["lib/ (Utilitários JS/TS Puros)"]
                servicesDir["services/ (ipc.service.ts, etc.)"]
                stylesDir["styles/ (CSS Global, Tailwind Config)"]
                typesDir["types/ (Tipos TypeScript Globais da UI)"]
                mainTsx["main.tsx (Ponto de Entrada da UI)"]
                indexHtml["index.html (Host da SPA)"]
            end

            appDir --> routeLayout["(group)/_layout.tsx (Layout de Grupo de Rota)"]
            appDir --> routePage["feature-x/page.tsx (Página de Rota)"]
            appDir --> routeIndex["index.tsx (Rota Raiz '/')"]

            componentsDir --> commonComp["common/ (e.g., action-button.tsx)"]
            componentsDir --> layoutComp["layout/ (e.g., app-shell.tsx)"]
            componentsDir --> uiComp["ui/ (Shadcn Primitives e.g. button.tsx)"]

            featuresDir --> featureA["project-management/ (Exemplo de Feature)"]
            featureA --> fa_components["components/ (e.g. project-card.tsx)"]
            featureA --> fa_hooks["hooks/ (e.g. use-project-filters.hook.ts)"]
            featureA --> fa_services["services/ (e.g. project-view.service.ts)"]
            featureA --> fa_types["types/ (project.types.ts)"]
            featureA --> fa_index["index.ts (Exportações públicas da feature)"]

            style appDir fill:#D2E0FB, stroke:#333
            style componentsDir fill:#D2E0FB, stroke:#333
            style featuresDir fill:#D2E0FB, stroke:#333
            style hooksDir fill:#D2E0FB, stroke:#333
            style libDir fill:#D2E0FB, stroke:#333
            style servicesDir fill:#D2E0FB, stroke:#333
            style stylesDir fill:#D2E0FB, stroke:#333
            style typesDir fill:#D2E0FB, stroke:#333
        ```
*   **Comunicação IPC (ADR-024, ADR-025):**
    *   `ipc.service.ts` abstrai chamadas para `window.electronIPC`. Hooks como `use-ipc-query.hook.ts` e `use-ipc-mutation.hook.ts` usam este serviço.

## 4. Principais Padrões de Design e Conceitos Aplicados

Esta seção resume os principais padrões de design e conceitos arquiteturais empregados no Project Wiz, com referências às ADRs que os formalizam ou exemplificam sua aplicação.

*   **Repository Pattern:**
    *   **Aplicação no Project Wiz:** Interfaces em `core/domain/<entidade-kebab-case>/ports/<entidade-kebab-case>-repository.interface.ts` (**ADR-011**). Implementações em `infrastructure/persistence/drizzle/drizzle-<entidade-kebab-case>.repository.ts` (**ADR-017**).
*   **Service Layer (Application Services & Domain Services):**
    *   **Aplicação no Project Wiz:** Serviços de Aplicação (e.g., `generic-agent-executor.service.ts`) em `core/application/services/` (**ADR-012**, **ADR-022**).
*   **Factory Pattern (via Construtores Públicos com Validação):**
    *   **Aplicação no Project Wiz:** Entidades e VOs usam construtores públicos que encapsulam validação (Zod) e lógica de instanciação, atuando como o ponto de criação controlada (**ADR-010 Revisado**).
*   **Value Objects (VOs):**
    *   **Aplicação no Project Wiz:** Amplamente utilizado (e.g., `user-email.vo.ts`, `job-status.vo.ts`), conforme **ADR-010 Revisado**.
*   **Entities:**
    *   **Aplicação no Project Wiz:** `user.entity.ts`, `job.entity.ts`, etc., conforme **ADR-010 Revisado**.
*   **Use Cases/Interactors:**
    *   **Aplicação no Project Wiz:** Casos de Uso em `core/application/use-cases/` (e.g., `create-project.use-case.ts`) retornam dados diretamente ou lançam `CoreError`, com `IUseCaseResponse` sendo responsabilidade de um Wrapper (**ADR-012 Revisado**, **ADR-008**).
*   **Dependency Injection (DI):**
    *   **Aplicação no Project Wiz:** InversifyJS, configurado em `inversify.config.ts` (**ADR-019**).
*   **Facade Pattern:**
    *   **Aplicação no Project Wiz:** `drizzle-queue.facade.ts` para o sistema de filas (**ADR-020**).
*   **Asynchronous Processing (Jobs & Queue):**
    *   **Aplicação no Project Wiz:** `JobEntity` (`job.entity.ts`), `AbstractQueue` (`abstract-queue.port.ts`), `DrizzleQueueFacade` (`drizzle-queue.facade.ts`), `WorkerService` (`worker.service.ts`), `ProcessorFunction` (**ADR-010**, **ADR-020**, **ADR-021**, **ADR-022**).
*   **Adapter Pattern:**
    *   **Aplicação no Project Wiz:** `ILLMAdapter` (`llm.adapter.interface.ts`), `OpenAILLMAdapter` (`openai-llm.adapter.ts`) (**ADR-018**).
*   **Strategy Pattern (implícito em Processors/Tools):**
    *   **Aplicação no Project Wiz:** `ProcessorFunction` (ADR-021) e design de `IAgentTool`.
*   **State Pattern (implícito em JobEntity/Agents):**
    *   **Aplicação no Project Wiz:** `JobStatus` VO em `JobEntity` (ADR-010, ADR-020).
*   **Configuration Management:**
    *   **Aplicação no Project Wiz:** Variáveis de ambiente, `.env` files, `IConfigurationService` (`configuration.service.ts` ou similar) injetável (**ADR-031**).
*   **Error Handling Strategy:**
    *   **Aplicação no Project Wiz:** `CoreError` (`core.error.ts`) e subclasses. `IUseCaseResponse` para limites de API. `UseCaseWrapper` para padronização (**ADR-014**, **ADR-008**, **ADR-012 Revisado**).
*   **Logging Strategy:**
    *   **Aplicação no Project Wiz:** `ILogger` (`logger.interface.ts` ou `logger.port.ts`), logging estruturado (**ADR-013**).

## 5. Exemplos de Fluxo de Dados

Esta seção ilustra como os dados fluem através das camadas e componentes em cenários chave da aplicação, demonstrando a interação entre os princípios arquiteturais e os padrões de design discutidos.

### 5.1. Fluxo de Interação da UI para o Processo Principal (Ex: Criação de Projeto)

Este diagrama ilustra uma interação típica iniciada na UI.

```mermaid
sequenceDiagram
    participant CompReact as Componente React (UI)
    participant HookIPC as Hook useIpcMutation (e.g., use-create-project.hook.ts)
    participant IpcService as ipc.service.ts (UI)
    participant PreloadAPI as window.electronIPC (Preload)
    participant MainRouter as Roteador IPC (Main Process)
    participant ProjHandler as project.handlers.ts (Main)
    participant CreateProjUC as create-project.use-case.ts (Aplicação)
    participant ProjEntityCons as new ProjectEntity() (Domínio)
    participant ProjRepoPort as IProjectRepository (Porta Domínio)
    participant DrizzleProjRepo as drizzle-project.repository.ts (Infra)
    participant Wrapper as UseCaseWrapper (Aplicação/Infra)

    CompReact->>+HookIPC: user submits form; calls mutate({ nome, desc })
    HookIPC->>+IpcService: invoke("PROJECT:CREATE", { nome, desc })
    IpcService->>+PreloadAPI: invoke("PROJECT:CREATE", { nome, desc })
    PreloadAPI-->>+MainRouter: Mensagem IPC ("PROJECT:CREATE", payload) via ipcRenderer.invoke
    MainRouter->>+ProjHandler: handleCreateProject(event, payload)
    ProjHandler->>ProjHandler: Valida payload com Zod (create-project.schema.ts - ADR-024)
    alt Validação Falhou no Handler
        ProjHandler->>+Wrapper: wrapError(validationError)
        Wrapper-->>-ProjHandler: IUseCaseResponse (com erro)
        ProjHandler-->>-MainRouter: Retorna IUseCaseResponse (erro)
    else Validação OK no Handler
        ProjHandler->>+Wrapper: wrapUseCase(CreateProjUC, validatedInput)
        Wrapper->>+CreateProjUC: execute(validatedInput)
        CreateProjUC->>CreateProjUC: new ProjectName(name), new UserId(userIdValue), etc. (VOs - ADR-010)
        CreateProjUC->>+ProjEntityCons: new ProjectEntity(propsComVOs) (ADR-010)
        ProjEntityCons-->>-CreateProjUC: projectEntity
        alt Criação da Entidade Falhou (Regra de Negócio na Entidade)
            CreateProjUC-->>Wrapper: throws EntityError (ADR-010, ADR-014)
        else Criação da Entidade OK
            CreateProjUC->>+ProjRepoPort: save(projectEntity) (ADR-011)
            ProjRepoPort-->>DrizzleProjRepo: save(projectEntity) (ADR-017)
            DrizzleProjRepo-->>-ProjRepoPort: Promise<void> (sucesso)
            ProjRepoPort-->>-CreateProjUC: Promise<void> (sucesso)
            CreateProjUC->>CreateProjUC: Mapeia projectEntity para projectDto
            CreateProjUC-->>Wrapper: return projectDto (Dados de sucesso)
        end
        Wrapper-->>-ProjHandler: IUseCaseResponse (projectDto ou erro do UC)
        ProjHandler-->>-MainRouter: IUseCaseResponse
    end
    MainRouter-->>-PreloadAPI: Retorna IUseCaseResponse
    PreloadAPI-->>-IpcService: Retorna IUseCaseResponse
    IpcService-->>-HookIPC: Atualiza estado (data: projectDto ou error: coreErrorDetails)
    HookIPC-->>-CompReact: Re-renderiza componente
```
*   **Descrição Detalhada do Fluxo (com wrappers):**
    1.  **UI (Apresentação):** Usuário submete formulário. Hook `useIpcMutation` chama `ipcService.invoke("PROJECT:CREATE", dados)`.
    2.  **IPC (Preload -> Main):** A chamada é encaminhada para o handler IPC `project.handlers.ts` no processo principal.
    3.  **Handler IPC (Main):**
        *   Valida o DTO de entrada com Zod (`create-project.schema.ts`). Se falhar, um `ApplicationError` é lançado.
        *   **Invoca o `UseCaseWrapper`**, passando a instância do `CreateProjectUseCase` e os dados validados.
    4.  **UseCaseWrapper (Aplicação/Infra):**
        *   Executa o método `execute()` do `CreateProjectUseCase`.
        *   **Dentro do `CreateProjectUseCase.execute()`:**
            *   Cria instâncias de VOs necessários (e.g., `new ProjectName(val.name)`).
            *   Cria a instância da `ProjectEntity` usando `new ProjectEntity(propsComVOs)`. O construtor da entidade valida as regras de negócio e lança `EntityError` se necessário.
            *   Chama `projectRepository.save(projectEntity)`.
            *   Retorna o `ProjectDto` (dados de sucesso) diretamente.
            *   Se qualquer etapa falhar (e.g., erro do repositório, `EntityError`), uma exceção (`CoreError` ou subclasse) é lançada.
        *   O `UseCaseWrapper` captura o retorno de sucesso ou a exceção lançada.
        *   Transforma o resultado/erro em um objeto `IUseCaseResponse` (ADR-008).
    5.  **Handler IPC (Main):** Recebe `IUseCaseResponse` do Wrapper e o retorna.
    6.  **Retorno via IPC (Main -> Preload -> UI):** `IUseCaseResponse` propaga de volta para o hook na UI.
    7.  **Atualização da UI (Apresentação):** Hook atualiza seu estado, UI re-renderiza.

### 5.2. Fluxo de Processamento de Job por um Worker (Backend)

Este diagrama detalha como um `WorkerService` (e.g., `worker.service.ts`) processa um job.

```mermaid
sequenceDiagram
    participant WorkerSvc as worker.service.ts (Aplicação - ADR-022)
    participant QueuePort as abstract-queue.port.ts (Porta Aplicação - ADR-020)
    participant QueueImpl as drizzle-queue.facade.ts (Infra - ADR-020)
    participant JobRepoPort as IJobRepository (Porta Domínio - ADR-011)
    participant JobRepoImpl as drizzle-job.repository.ts (Infra - ADR-017)
    participant JobEntityInst as JobEntity (Instância Domínio, new JobEntity() - ADR-010)
    participant ProcessorFn as ProcessorFunction (Aplicação - ADR-021)
    participant LLMAdapterPort as ILLMAdapter (Porta Aplicação - ADR-018)
    participant ConfigSvcPort as IConfigurationService (Porta Aplicação - ADR-031)

    loop Ciclo de Polling do WorkerService
        WorkerSvc->>+QueuePort: fetchNextJobAndLock(workerId, lockDuration)
        QueuePort-->>+QueueImpl: fetchNextJobAndLock(workerId, lockDuration)
        QueueImpl->>+JobRepoPort: findAndLockNextAvailableJob(...)
        JobRepoPort-->>+JobRepoImpl: findAndLockNextAvailableJob(...)
        JobRepoImpl-->>-JobRepoPort: jobData | null
        JobRepoPort-->>-QueueImpl: jobData | null
        alt Job Encontrado
            QueueImpl-->>QueueImpl: Reconstrói JobEntity (new JobEntity(propsFromData))
            QueueImpl-->>-QueuePort: jobEntity
            QueuePort-->>-WorkerSvc: jobEntity
            WorkerSvc->>WorkerSvc: Instrumenta JobEntity (addLog, updateProgress via QueuePort)
            WorkerSvc->>WorkerSvc: Inicia Renovação de Lock
            WorkerSvc->>+ProcessorFn: process(jobEntityInstrumentada, ConfigSvcPort)
            loop Ciclo de Execução Interno do Processador
                ProcessorFn->>JobEntityInst: addLog("Etapa X...") (Chamada instrumentada)
                ProcessorFn->>+LLMAdapterPort: generate(...) (Exemplo)
                LLMAdapterPort-->>-ProcessorFn: LLMResponse
            end
            ProcessorFn-->>-WorkerSvc: Retorna resultado (dados de sucesso) OU lança CoreError
            WorkerSvc->>WorkerSvc: Para Renovação de Lock
            alt Processamento Bem-sucedido
                WorkerSvc->>+QueuePort: markJobAsCompleted(jobId, workerId, resultadoFinal, logsColetados)
            else Falha no Processamento (Erro da ProcessorFn)
                WorkerSvc->>+QueuePort: markJobAsFailed(jobId, workerId, erroDoProcessador, logsColetados)
            end
            QueuePort-->>+QueueImpl: (Chama método correspondente)
            QueueImpl->>+JobRepoPort: updateJobStatus(...) (Atualiza job no DB)
            JobRepoPort-->>-QueueImpl: Promise<void>
            QueueImpl-->>-WorkerSvc: Promise<void>
        else Nenhum Job Disponível
            QueueImpl-->>-QueuePort: null
            QueuePort-->>-WorkerSvc: null
            WorkerSvc->>WorkerSvc: Aguarda e tenta novamente
        end
    end
```
*   **Descrição Detalhada do Fluxo:**
    1.  **Polling e Lock (WorkerService -> QueueFacade -> JobRepository):** `worker.service.ts` chama `fetchNextJobAndLock()` na `abstract-queue.port.ts`. A `drizzle-queue.facade.ts` usa o `drizzle-job.repository.ts` para buscar e bloquear um job.
    2.  **Reconstrução da Entidade (QueueFacade/Mapper):** Se um job é encontrado, a `drizzle-queue.facade.ts` (ou seu mapper) reconstrói a `JobEntity` usando `new JobEntity(propsFromData)` (ADR-010, ADR-017).
    3.  **Instrumentação e Execução (WorkerService):** `worker.service.ts` recebe a `JobEntity`, instrumenta seus métodos `addLog`/`updateProgress`, e invoca a `ProcessorFunction` (ADR-021, ADR-022).
    4.  **Processamento (ProcessorFunction):** A função executa a lógica, possivelmente chamando adaptadores (e.g., `ILLMAdapter` via `llm.adapter.interface.ts`) ou outros serviços. Retorna dados de sucesso ou lança `CoreError` (ADR-012, ADR-014).
    5.  **Finalização (WorkerService -> QueueFacade -> JobRepository):** `worker.service.ts` reporta o sucesso (com dados) ou falha (com o erro) para a `abstract-queue.port.ts`, que atualiza o job no banco via `drizzle-job.repository.ts`.

Estes fluxos demonstram a aplicação dos princípios da Clean Architecture e dos padrões definidos nas ADRs, mantendo a separação de responsabilidades e permitindo que as diferentes partes do sistema evoluam de forma independente.

## 6. Nota sobre Componentes em Fase de Design/Pesquisa (Revisado)

A arquitetura do Project Wiz, conforme detalhada nas ADRs 001 a 031 e neste documento, estabelece uma base sólida para a maioria dos componentes centrais do sistema. Muitos aspectos, desde a persistência de dados (**ADR-017**), sistema de filas (**ADR-020**, **ADR-021**, **ADR-022**), injeção de dependência (**ADR-019**), até os padrões de UI (**ADR-025**, **ADR-026**, **ADR-027**) e comunicação IPC (**ADR-023**, **ADR-024**), foram formalizados.

No entanto, áreas que permanecem em desenvolvimento ativo e podem ter aspectos mais conceituais ou em fase de prototipação incluem:

*   **Mecanismos Avançados de Interação e Gerenciamento de Estado de Agentes de IA:**
    *   Enquanto o `generic-agent-executor.service.ts` (**ADR-021**) e os serviços de job/worker (**ADR-020**, **ADR-022**) fornecem a infraestrutura para execução, os detalhes mais finos sobre o ciclo de vida completo de uma "Atividade" ou "Tarefa" de agente (conceitos que podem emergir acima de um `JobEntity`), estratégias complexas de composição e sequenciamento de `IAgentTool`, gerenciamento de contexto de memória de longo prazo para agentes, e a orquestração de múltiplos agentes colaborando em uma tarefa complexa ainda estão sendo ativamente pesquisados e projetados. As interfaces e abstrações atuais são projetadas para acomodar essa evolução.

*   **Ecossistema de Ferramentas (`IAgentTool`):**
    *   A interface `IAgentTool` e um `ToolRegistryService` (e.g., `tool-registry.service.ts`) são, no momento, mais conceituais do que implementações detalhadas. Embora a infraestrutura para um agente *executar algo* (uma ferramenta) esteja planejada, a definição de um conjunto rico e robusto de ferramentas específicas do Project Wiz, seus schemas de entrada/saída padronizados, versionamento, e como elas são descobertas, registradas e gerenciadas de forma segura ainda é uma área de expansão e futuras ADRs.

*   **Visualização e Monitoramento Avançado de Agentes e Jobs:**
    *   Enquanto o logging (**ADR-013**) e o rastreamento básico de status de jobs (**ADR-020**) estão definidos, interfaces de usuário ou sistemas dedicados para visualização detalhada do progresso de jobs complexos (especialmente aqueles executados por agentes de IA), monitoramento em tempo real da performance de agentes, depuração interativa de fluxos de execução de IA, e análise de resultados de múltiplos jobs são funcionalidades futuras que dependerão da evolução dos componentes de agente e ferramentas.

A abordagem arquitetural tem sido construir primeiro os pilares robustos e bem definidos da aplicação, permitindo que estas áreas mais especializadas e inovadoras (particularmente em torno da IA) sejam construídas sobre uma fundação estável e desacoplada. Novas ADRs serão criadas à medida que estes componentes mais avançados forem solidificando seu design e implementação.
