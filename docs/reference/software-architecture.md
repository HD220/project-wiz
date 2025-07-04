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
        *   A estrutura de diretórios reflete claramente as camadas: `core/domain/`, `core/application/`, `infrastructure/`, e `presentation/`.
        *   Casos de Uso (`core/application/use-cases/`) dependem de interfaces de repositório (`core/domain/<entidade>/ports/`) que são implementadas na camada de `infrastructure/persistence/`.
        *   Entidades e Objetos de Valor (`core/domain/`) não possuem conhecimento sobre Drizzle ORM, Electron, ou React. Eles contêm pura lógica de negócio.
        *   A comunicação entre a UI (`presentation/ui/`) e o backend é feita através de um conjunto bem definido de DTOs e handlers IPC, que por sua vez invocam Casos de Uso na camada de Aplicação.
    *   **ADRs Relevantes:** Este princípio é fundamental e permeia quase todas as ADRs que tratam de estrutura e interações entre componentes, notavelmente **ADR-010** (Entidades e VOs), **ADR-011** (Repositórios), **ADR-012** (Casos de Uso), **ADR-017** (Persistência), **ADR-018** (Adaptadores), **ADR-019** (Injeção de Dependência), **ADR-023** (Electron Main), **ADR-024** (IPC), e **ADR-025** (Componentes React). A visualização detalhada das camadas e suas responsabilidades é apresentada na seção "3. Camadas Arquiteturais".

*   **Object Calisthenics:**
    *   **Descrição:** Um conjunto de nove "exercícios" ou regras de programação que, quando aplicados, tendem a produzir código orientado a objetos extremamente limpo, legível, coeso e de fácil manutenção. São regras mais prescritivas que os princípios SOLID e visam reduzir a complexidade e aumentar a clareza.
    *   **Manifestação no Project Wiz:**
        *   "Envolva Todas as Primitivas e Strings": Fortemente aplicado através da adoção de Objetos de Valor (VOs) para representar conceitos de domínio em vez de tipos primitivos (ver **ADR-010**).
        *   "Sem Getters/Setters para estado mutável": Entidades seguem um padrão de imutabilidade funcional, onde métodos de alteração retornam novas instâncias (ADR-010), e VOs são estritamente imutáveis.
        *   "Apenas Um Nível de Indentação por Método" e "Não Use a Palavra-Chave ELSE": Incentivados para simplificar a lógica de métodos em Casos de Uso, Serviços e Entidades.
    *   **ADRs Relevantes:** **ADR-016: Aplicação Prática de Object Calisthenics no Project Wiz** detalha como cada uma das 9 regras é interpretada e aplicada. **ADR-010** sobre Entidades e VOs é uma implementação direta de várias dessas regras.

*   **SOLID:**
    *   **Descrição:** Acrônimo para cinco princípios de design que tornam os sistemas de software mais compreensíveis, flexíveis e manuteníveis.
        *   **S (Single Responsibility Principle - Princípio da Responsabilidade Única):** Uma classe deve ter apenas uma razão para mudar.
        *   **O (Open/Closed Principle - Princípio Aberto/Fechado):** Entidades de software devem ser abertas para extensão, mas fechadas para modificação.
        *   **L (Liskov Substitution Principle - Princípio da Substituição de Liskov):** Subtipos devem ser substituíveis por seus tipos base sem alterar a corretude do programa.
        *   **I (Interface Segregation Principle - Princípio da Segregação de Interfaces):** Clientes não devem ser forçados a depender de interfaces que não usam.
        *   **D (Dependency Inversion Principle - Princípio da Inversão de Dependência):** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. Abstrações não devem depender de detalhes; detalhes devem depender de abstrações.
    *   **Manifestação no Project Wiz:**
        *   **SRP:** Casos de Uso focados em uma única operação de aplicação (ADR-012). Entidades e VOs com responsabilidades bem definidas (ADR-010). Serviços de Aplicação (e.g., `WorkerService` - ADR-022) com um conjunto coeso de funcionalidades.
        *   **OCP:** Uso de interfaces (Portas) para Adaptadores de Infraestrutura (ADR-018) permite adicionar novas implementações (e.g., um novo provedor de LLM) sem modificar o código da camada de aplicação que usa a interface. O sistema de plugins de ferramentas (conceitual) também seguiria este princípio.
        *   **LSP:** Relevante ao considerar herança, como a hierarquia de `AbstractEntity` e `AbstractValueObject` (ADR-010), garantindo que as classes filhas respeitem o contrato da classe base.
        *   **ISP:** Interfaces de Repositório específicas por entidade (ADR-011) e interfaces de Adaptadores focadas em um conjunto coeso de operações (ADR-018, e.g., `ILLMAdapter`, `AbstractQueue` conforme ADR-020).
        *   **DIP:** A Clean Architecture é uma manifestação direta deste princípio. A Camada de Aplicação depende de abstrações (interfaces de repositório, de adaptadores), não de implementações concretas da Infraestrutura. O framework de Injeção de Dependência InversifyJS (ADR-019) é usado para realizar essa inversão de controle, ligando abstrações às suas implementações concretas em tempo de execução.
    *   **ADRs Relevantes:** Estes princípios são reforçados em múltiplas ADRs, incluindo **ADR-010** (Entidades/VOs), **ADR-011** (Repositórios), **ADR-012** (Casos de Uso/Serviços de Aplicação), **ADR-018** (Adaptadores), **ADR-019** (DI), **ADR-020** (Filas), e **ADR-022** (WorkerService).

*   **DRY (Don't Repeat Yourself - Não se Repita):**
    *   **Descrição:** Evitar a duplicação de código, lógica e conhecimento. Conhecimento e comportamento devem ser definidos em um único local canônico dentro do sistema.
    *   **Manifestação no Project Wiz:**
        *   Criação de Objetos de Valor (ADR-010) para encapsular dados com regras de validação e formatação próprias, evitando lógica duplicada.
        *   Uso de Serviços de Aplicação (ADR-012) para orquestrar lógica de negócios que pode ser invocada por diferentes Casos de Uso.
        *   Desenvolvimento de hooks customizados no frontend (ADR-025) para encapsular lógica de UI reutilizável.
        *   Esquemas Zod reutilizáveis para validação em diferentes camadas (ADR-007, ADR-010, ADR-012, ADR-024).
    *   **ADRs Relevantes:** Diretrizes explícitas em `docs/developer/coding-standards.md`.

*   **KISS (Keep It Simple, Stupid - Mantenha Simples, Estúpido):**
    *   **Descrição:** Priorizar soluções simples e diretas em detrimento de complexidade desnecessária ou engenharia excessiva (over-engineering). O design mais simples que funciona é geralmente o melhor.
    *   **Manifestação no Project Wiz:**
        *   Preferir implementações diretas e claras, mesmo que uma solução "mais inteligente" ou "mais genérica" seja possível, se esta última adicionar complexidade sem um benefício claro e imediato.
        *   Adoção de padrões de design apenas quando a complexidade do problema realmente os justifica, conforme documentado nas ADRs.
        *   Foco em interfaces claras e concisas entre componentes.
    *   **ADRs Relevantes:** Diretrizes explícitas em `docs/developer/coding-standards.md`.

*   **Modularidade e Separação de Responsabilidades (Separation of Concerns - SoC):**
    *   **Descrição:** Cada componente, módulo e camada do sistema deve ter responsabilidades bem definidas e distintas, minimizando sobreposições e acoplamento. Isso torna o sistema mais fácil de entender, manter e evoluir.
    *   **Manifestação no Project Wiz:**
        *   A própria Clean Architecture é um forte exemplo de SoC em alto nível.
        *   A divisão em `core/domain`, `core/application`, `infrastructure` e `presentation` reflete isso.
        *   Dentro da UI, a estrutura de "features" (ADR-027) visa agrupar código por funcionalidade, promovendo SoC.
        *   A decomposição de funcionalidades complexas em serviços menores e mais focados (e.g., no sistema de filas, ADR-020, com `QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService`).
    *   **ADRs Relevantes:** Este é um metaprincípio que influencia a maioria das ADRs de design, como **ADR-010** a **ADR-031**.

## 2. Tecnologias Chave

A seleção de tecnologias visa robustez, produtividade, suporte da comunidade e alinhamento com os princípios arquiteturais. O guia `docs/developer/tooling-guide.md` oferece detalhes sobre a configuração de ferramentas e extensões.

*   **Application Framework:** ElectronJS.
    *   **Justificativa (ADR-023, ADR-024):** Permite o desenvolvimento de aplicações desktop multiplataforma com tecnologias web (HTML, CSS, JavaScript/TypeScript), facilitando a criação de interfaces ricas e o acesso a recursos do sistema operacional de forma segura.
*   **Frontend (UI - Processo de Renderização):**
    *   **React:** Biblioteca para construção de interfaces de usuário.
        *   **Justificativa (ADR-025):** Vasto ecossistema, modelo de componentes declarativo, excelente suporte a TypeScript e ferramentas de desenvolvimento.
    *   **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
        *   **Justificativa (ADR-015):** Essencial para a segurança de tipo, melhor manutenibilidade e escalabilidade do código em um projeto de grande porte.
    *   **Tailwind CSS:** Framework CSS utility-first.
        *   **Justificativa (ADR-026):** Agilidade no desenvolvimento de UI, consistência visual, e evita a necessidade de CSS customizado excessivo, promovendo um sistema de design mais coeso.
    *   **Shadcn/UI:** Coleção de componentes React reutilizáveis, construídos com Radix UI e Tailwind CSS.
        *   **Justificativa (ADR-026):** Fornece componentes acessíveis, bem desenhados e customizáveis diretamente no projeto, acelerando o desenvolvimento da UI.
    *   **Vite:** Ferramenta de build e servidor de desenvolvimento.
        *   **Justificativa:** Performance superior em desenvolvimento (Hot Module Replacement rápido) e build otimizado para produção.
    *   **TanStack Router (`@tanstack/react-router`):** Para roteamento na SPA React.
        *   **Justificativa (ADR-027):** Oferece roteamento type-safe, com funcionalidades modernas como rotas aninhadas, lazy loading de componentes e integração com TypeScript.
    *   **React Hook Form & Zod:** Para gerenciamento e validação de formulários.
        *   **Justificativa (ADR-025):** Combinação poderosa para criar formulários performáticos, com excelente Developer Experience e validação de dados robusta e type-safe usando Zod.
*   **Backend/Core Logic (Processo Principal Electron e Lógica de Negócios):**
    *   **TypeScript & Node.js:** Ambiente de execução e linguagem para o processo principal e toda a lógica de negócios.
        *   **Justificativa (ADR-015):** Consistência de linguagem com o frontend, tipagem estática, e vasto ecossistema Node.js.
    *   **InversifyJS (`inversify`, `reflect-metadata`):** Framework de Injeção de Dependência (DI).
        *   **Justificativa (ADR-019):** Leve, poderoso, com excelente suporte a TypeScript e decoradores, facilitando a implementação do Princípio da Inversão de Dependência e promovendo código desacoplado e testável.
*   **AI/LLM Integration:** AI SDK (Vercel AI SDK).
    *   **Justificativa (ADR-018):** Biblioteca moderna e flexível para interagir com diversos Modelos de Linguagem Grandes (LLMs), simplificando o streaming de respostas e a integração com React/Svelte. Embora a ADR-018 seja sobre o design de adaptadores em geral, a escolha da AI SDK se alinha com a necessidade de um adaptador LLM robusto.
*   **Database/Persistence:** SQLite (via `better-sqlite3`) com Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
    *   **Justificativa (ADR-017):** SQLite para portabilidade e facilidade de uso em uma aplicação desktop. Drizzle ORM por ser um ORM moderno, leve, type-safe, com boa integração TypeScript e que permite escrever queries SQL de forma mais familiar quando necessário.
*   **Testes Automatizados:** Vitest.
    *   **Justificativa (ADR-029):** Framework de testes moderno, rápido, com API compatível com Jest, excelente integração com Vite e TypeScript, e suporte para testes unitários, de integração e, potencialmente, E2E.

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

*   **Propósito:** Contém a lógica de negócios mais pura e central da aplicação, representando as regras, conceitos e o "idioma" do domínio do Project Wiz. Esta camada é o coração do software e deve ser completamente independente de qualquer outra camada em termos de dependências de código fonte (não deve importar nada de `application`, `infrastructure` ou `presentation`). Sua estabilidade é crucial, pois mudanças aqui refletem mudanças fundamentais no negócio.
*   **Componentes Chave:**
    *   **Entidades (`*.entity.ts`):**
        *   **Papel:** Representam objetos de negócio com uma identidade única que persiste ao longo do tempo e através de diferentes estados (e.g., `UserEntity`, `ProjectEntity`, `JobEntity`, `LLMProviderConfigEntity`). Elas encapsulam atributos e, crucialmente, a lógica de negócios e as regras (invariantes) que governam seu estado e comportamento. São a espinha dorsal do modelo de domínio.
        *   **Padrões (ADR-010):**
            *   Instanciadas via método estático `create()` que contém validação de regras de negócio (usando Zod para estrutura inicial e lógica customizada para invariantes complexas) e lógica de inicialização. Construtores são `private` ou `protected`.
            *   Seguem um padrão de imutabilidade funcional: métodos que alteram o estado da entidade retornam uma nova instância da entidade com o estado atualizado, em vez de modificar a instância atual. Isso melhora a previsibilidade e facilita o rastreamento de mudanças.
            *   Implementam `toPersistence()` para converter o estado da entidade para um POJO (Plain Old JavaScript Object) serializável, adequado para persistência.
            *   Implementam um método estático `fromPersistenceData()` (ou similar) para reconstruir a entidade a partir de dados crus vindos da camada de persistência.
            *   Possuem um Objeto de Valor `Identity` para seu ID (e.g., `UserId`, `ProjectId`).
        *   **Exemplo (Estrutura Conceitual):**
            ```typescript
            // // src_refactored/core/domain/project/project.entity.ts
            // import { AbstractEntity, EntityError, Result, success, failure } from "@shared"; // Exemplo
            // import { ProjectId } from "./value-objects/project-id.vo";
            // import { ProjectName } from "./value-objects/project-name.vo";
            // import { ProjectProps, ProjectCreateProps, ProjectPersistenceData } from "./project.types";
            // import { ProjectSchema } from "./project.schema"; // Zod Schema para ProjectCreateProps

            // export class ProjectEntity extends AbstractEntity<ProjectId, ProjectProps> {
            //   private constructor(id: ProjectId, props: ProjectProps) {
            //     super(id, props);
            //   }

            //   public static create(createProps: ProjectCreateProps): Result<ProjectEntity, EntityError> {
            //     const validationResult = ProjectSchema.safeParse(createProps);
            //     if (!validationResult.success) {
            //       return failure(new EntityError("Validação falhou", validationResult.error.flatten()));
            //     }
            //     const { name, description, userId } = validationResult.data;
            //     // Regras de negócio adicionais podem ser verificadas aqui
            //     return success(new ProjectEntity(ProjectId.create(), {
            //       name: ProjectName.create(name).getValue(), // Assumindo que VOs têm getValue() ou similar
            //       description,
            //       userId: UserId.create(userId).getValue(), // Assumindo UserId VO
            //       createdAt: new Date(),
            //       updatedAt: new Date(),
            //     }));
            //   }

            //   public get name(): ProjectName { return this.props.name; }
            //   // Outros getters para VOs...

            //   public updateDetails(newName: ProjectName, newDescription: string): Result<ProjectEntity, EntityError> {
            //     // Lógica de validação para atualização
            //     // ADR-010 sugere retornar nova instância para imutabilidade funcional:
            //     const newProps = { ...this.props, name: newName, description: newDescription, updatedAt: new Date() };
            //     return success(new ProjectEntity(this._id, newProps));
            //   }

            //   public toPersistence(): ProjectPersistenceData {
            //     return {
            //       id: this._id.value,
            //       name: this.props.name.value, // Supondo que VOs como ProjectName tenham .value
            //       description: this.props.description,
            //       userId: this.props.userId.value, // Supondo que UserId seja um VO com .value
            //       createdAt: this.props.createdAt,
            //       updatedAt: this.props.updatedAt,
            //     };
            //   }

            //   public static fromPersistenceData(data: ProjectPersistenceData): ProjectEntity {
            //     // Esta é uma simplificação. A recriação de VOs deve ser feita com seus métodos create()
            //     // para garantir validações, a menos que os dados de persistência já sejam primitivos válidos.
            //     return new ProjectEntity(ProjectId.create(data.id), {
            //       name: ProjectName.create(data.name).getValue(), // Idealmente, ProjectName.create()
            //       description: data.description,
            //       userId: UserId.create(data.userId).getValue(), // Idealmente, UserId.create()
            //       createdAt: data.createdAt,
            //       updatedAt: data.updatedAt,
            //     });
            //   }
            // }
            ```
    *   **Objetos de Valor (VOs - `*.vo.ts`):**
        *   **Papel:** Representam conceitos descritivos do domínio que não possuem uma identidade única, sendo definidos pelos seus atributos e seu significado conceitual. São imutáveis e comparados por valor (e.g., `UserEmail`, `JobId`, `ProjectName`, `MonetaryValue`, `Status`). Eles ajudam a garantir a validade e a semântica dos dados manipulados pelas Entidades.
        *   **Padrões (ADR-010):**
            *   Estritamente imutáveis (todas as propriedades `readonly` após a criação).
            *   Validação de regras intrínsecas e formato no método estático `create()` (ou construtor, se preferido, mas `create()` permite retorno de `Result` para tratamento de falhas de validação). Zod é usado para a validação da estrutura de entrada.
            *   Método `equals()` para comparação estrutural (pode ser herdado de uma classe base como `AbstractValueObject`).
            *   Podem ter métodos que expõem seus valores primitivos de forma controlada (e.g., `get value(): string`).
            *   Não possuem IDs próprios, exceto se o ID em si for um VO (como `JobId`, que é um `Identity<string>`).
        *   **Exemplo (Estrutura Conceitual):**
            ```typescript
            // // src_refactored/core/domain/job/value-objects/job-status.vo.ts
            // import { AbstractValueObject, ValueError, Result, success, failure } from "@shared"; // Exemplo
            // import { z } from "zod";

            // const validStatuses = ["PENDING", "RUNNING", "COMPLETED", "FAILED"] as const;
            // const JobStatusSchema = z.enum(validStatuses);
            // export type JobStatusType = z.infer<typeof JobStatusSchema>;

            // export class JobStatus extends AbstractValueObject<{ value: JobStatusType }> {
            //   private constructor(value: JobStatusType) {
            //     super({ value });
            //   }

            //   public static create(status: string): Result<JobStatus, ValueError> {
            //     const validationResult = JobStatusSchema.safeParse(status.toUpperCase());
            //     if (!validationResult.success) {
            //       return failure(new ValueError(`Status inválido: ${status}`, validationResult.error.flatten()));
            //     }
            //     return success(new JobStatus(validationResult.data));
            //   }

            //   public get value(): JobStatusType { return this.props.value; }
            // }
            ```
    *   **Serviços de Domínio (`*.domain-service.ts` - usar com critério):**
        *   **Papel:** Encapsulam lógica de domínio significativa que não pertence naturalmente a uma única Entidade ou Objeto de Valor, ou que coordena operações complexas entre múltiplas Entidades de forma agnóstica à aplicação. São stateless e não mantêm estado próprio entre chamadas.
        *   **Aplicação no Project Wiz:** Devem ser usados com moderação. Um exemplo poderia ser um serviço que calcula a prioridade de um `JobEntity` com base em múltiplas outras entidades e regras de negócio complexas que não se encaixam bem nem na `JobEntity` nem em um Serviço de Aplicação (pois a lógica é puramente de domínio e reutilizável em diferentes contextos de aplicação). Atualmente, a maioria da lógica de coordenação reside nos Serviços de Aplicação.
    *   **Interfaces de Repositório (`<entidade>-repository.interface.ts`):**
        *   **Papel:** Definem os contratos (portas) que a camada de domínio (e, por extensão, a camada de aplicação) utiliza para persistir e recuperar Entidades. Especificam *o quê* precisa ser persistido ou recuperado, mas não *como* isso é feito. Isso isola o domínio dos detalhes de persistência.
        *   **Localização (ADR-011):** `src_refactored/core/domain/<nome-da-entidade>/ports/`.
        *   **Padrões (ADR-011):**
            *   Nomenclatura `I[NomeDaEntidade]Repository` (e.g., `IProjectRepository`).
            *   Métodos CRUD padrão (`findById`, `save` com semântica de upsert, `delete`).
            *   Parâmetros de ID de entidade devem ser os VOs de ID específicos (e.g., `findById(id: ProjectId)`).
            *   Tipos de retorno são `Promise<Entidade | null>` ou `Promise<Entidade[]>` para consultas, ou `Promise<void>` / `Promise<Result<void, CoreError>>` para comandos.
            *   Podem incluir métodos de consulta específicos do domínio, baseados em critérios de negócio (e.g., `IUserRepository.findByEmail(email: UserEmail)`).
    *   **Eventos de Domínio (`*.domain-event.ts` - Opcional/Futuro):**
        *   **Papel:** Representam ocorrências significativas dentro do domínio que outros partes do sistema (inclusive outros domínios agregados, bounded contexts, ou a camada de aplicação) podem ter interesse em reagir. São fatos que aconteceram.
        *   **Padrão:** Se implementados, seriam objetos imutáveis, nomeados no tempo passado (e.g., `ProjectCreatedEvent`), e poderiam ser despachados por Entidades após uma mudança de estado. Um dispatcher de eventos central poderia então notificar os subscribers interessados.

### 3.2. Camada de Aplicação (`src_refactored/core/application/`)

*   **Propósito:** Contém a lógica específica da aplicação, orquestrando os casos de uso do sistema. Ela atua como uma mediadora entre a camada de Domínio (onde reside a lógica de negócios pura) e as camadas externas (Apresentação e Infraestrutura). Esta camada define o que a aplicação pode fazer e como as interações externas são convertedas em operações de domínio.
*   **Componentes Chave:**
    *   **Casos de Uso (Interactors - `use-cases/**/*.use-case.ts`):**
        *   **Papel:** Implementam operações ou "user stories" específicos da aplicação (e.g., `CreateProjectUseCase`, `AssignAgentToJobUseCase`, `ExecuteAgentToolUseCase`). Cada Caso de Uso encapsula a lógica de orquestração para uma interação completa e significativa com o sistema, do ponto de vista da aplicação.
        *   **Estrutura:**
            *   Orquestram o fluxo de dados: recebem DTOs (Data Transfer Objects) de entrada, utilizam interfaces de repositório (da camada de domínio) para buscar ou persistir entidades, invocam métodos em entidades ou serviços de domínio para executar a lógica de negócios, e retornam DTOs de saída ou respostas padronizadas.
            *   São geralmente stateless (ou seu estado é gerenciado externamente se forem operações de longa duração, como no `GenericAgentExecutor`).
        *   **Padrões (ADR-012):**
            *   Implementam a interface genérica `IUseCase<TInput, TOutputResponse>`, onde `TInput` é o DTO de entrada e `TOutputResponse` é o tipo de resposta, geralmente `IUseCaseResponse<TSuccessData, TErrorData>`.
            *   Validam DTOs de entrada usando esquemas Zod co-localizados (`*.schema.ts`).
            *   Retornam `Promise<IUseCaseResponse<TOutputData, TErrorDetails>>` (conforme **ADR-008**) para indicar sucesso ou falha de forma padronizada e estruturada.
        *   **Exemplo (Estrutura Conceitual):**
            ```typescript
            // // src_refactored/core/application/use-cases/project/create-project.use-case.ts
            // import { injectable, inject } from "inversify";
            // import { IUseCase, IUseCaseResponse, successUseCaseResponse, errorUseCaseResponse, CoreError } from "@shared/application"; // Exemplo de localização
            // import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from "@core/domain/project/ports/project-repository.interface";
            // import { ProjectEntity } from "@core/domain/project/project.entity";
            // import { CreateProjectInput, CreateProjectInputSchema } from "./create-project.schema";
            // import { ProjectDto, projectToDto } from "../dtos/project.dto"; // Exemplo de DTO de saída
            // import { TYPES } from "@infrastructure/ioc/types"; // Exemplo de tokens DI

            // @injectable()
            // export class CreateProjectUseCase implements IUseCase<CreateProjectInput, IUseCaseResponse<ProjectDto, CoreError>> {
            //   constructor(
            //     @inject(TYPES.ProjectRepository) private readonly projectRepository: IProjectRepository
            //   ) {}

            //   async execute(input: CreateProjectInput): Promise<IUseCaseResponse<ProjectDto, CoreError>> {
            //     try {
            //       // 1. Validação do DTO de entrada com Zod
            //       const validationResult = CreateProjectInputSchema.safeParse(input);
            //       if (!validationResult.success) {
            //         // ADR-008 especifica como lidar com erros de validação.
            //         // Normalmente, um erro específico (e.g., ValidationError) seria retornado.
            //         return errorUseCaseResponse(new CoreError("Input validation failed", validationResult.error.flatten()));
            //       }
            //       const validatedInput = validationResult.data;

            //       // 2. Criação da Entidade de Domínio
            //       const projectResult = ProjectEntity.create({
            //         name: validatedInput.name,
            //         description: validatedInput.description,
            //         userId: validatedInput.userId, // Supondo que userId já seja do tipo correto ou um VO seja criado aqui
            //       });

            //       if (projectResult.isFailure()) {
            //         return errorUseCaseResponse(projectResult.error);
            //       }
            //       const project = projectResult.getValue();

            //       // 3. Persistência via Repositório da Camada de Domínio
            //       await this.projectRepository.save(project);

            //       // 4. Mapeamento da Entidade para DTO de Saída
            //       const projectDto = projectToDto(project);

            //       // 5. Retorno da Resposta de Sucesso Padronizada
            //       return successUseCaseResponse(projectDto);
            //     } catch (error: any) {
            //       // Lidar com erros inesperados não capturados (e.g., falha de infraestrutura não tratada no repositório)
            //       // ADR-014 orienta sobre o tratamento e logging de erros.
            //       // Idealmente, registrar o 'error' original e retornar um CoreError genérico ou específico.
            //       return errorUseCaseResponse(new CoreError(error.message || "Erro inesperado ao criar projeto.", error));
            //     }
            //   }
            // }
            ```
    *   **Serviços de Aplicação (`services/**/*.service.ts`):**
        *   **Papel:** Coordenam tarefas e operações que não se encaixam em um único Caso de Uso CRUD-like, ou que encapsulam lógica de aplicação mais complexa envolvendo múltiplas entidades de domínio, múltiplos Casos de Uso, ou interações com portas da camada de aplicação. Podem manter algum estado relacionado à operação que orquestram, especialmente se forem de longa duração.
        *   **Exemplos no Project Wiz:** `GenericAgentExecutor` (orquestra a execução de agentes e suas ferramentas), `ChatService` (gerencia a lógica de interações de chat com histórico e contexto), `WorkerService` (processa jobs da fila, conforme **ADR-022**), `JobProcessingService` (parte do sistema de filas, **ADR-020**), `QueueMaintenanceService` (ADR-020).
        *   **Padrões (ADR-012):**
            *   Devem ser `@injectable()` e receber dependências via construtor (DI via InversifyJS, **ADR-019**).
            *   Métodos públicos representam suas capacidades. Se um método é um ponto de entrada principal para uma funcionalidade da aplicação, ele pode retornar `IUseCaseResponse` (ADR-008) para consistência no tratamento de respostas e erros.
    *   **Portas (Interfaces para Infraestrutura - `ports/` ou `core/ports/adapters/`):**
        *   **Papel:** Definem contratos (interfaces) para funcionalidades que dependem de detalhes de infraestrutura ou sistemas externos, mas são necessárias pela camada de aplicação para cumprir suas responsabilidades. A camada de aplicação depende dessas interfaces, e a camada de Infraestrutura fornece as implementações concretas.
        *   **Exemplos:**
            *   `ILLMAdapter` (**ADR-018**): Para interagir com Modelos de Linguagem Grandes.
            *   `AbstractQueue` (**ADR-020**): Para interagir com o sistema de filas de jobs.
            *   `ILogger` (**ADR-013**): Para logging estruturado em toda a aplicação.
            *   `IConfigurationService` (**ADR-031**): Para acesso a configurações da aplicação de forma tipada e segura.
            *   Outras interfaces podem incluir `IFileSystemAdapter`, `IVersionControlAdapter`.
    *   **DTOs (Data Transfer Objects) / Esquemas de Entrada e Saída:**
        *   **Padrão:** Zod (**ADR-007**) é usado extensivamente para definir os esquemas para os DTOs de entrada dos Casos de Uso e Serviços de Aplicação. Estes esquemas garantem que os dados recebidos pela camada de aplicação sejam válidos antes do processamento. DTOs também são usados para formatar os dados de saída, garantindo que a camada de aplicação exponha uma interface de dados estável.
        *   **Localização:** Esquemas de entrada (`*.schema.ts`) são geralmente co-localizados com o Caso de Uso/Serviço. DTOs de saída (`*.dto.ts`) podem estar em um subdiretório `dtos/` dentro da pasta do módulo de aplicação correspondente ou em um local compartilhado se forem muito genéricos.
    *   **Factories (`factories/**/*.factory.ts` - usar com critério):**
        *   **Papel:** Responsáveis pela criação de objetos complexos, especialmente se a criação envolver lógica condicional, a necessidade de buscar dados de configuração, ou a resolução de múltiplas dependências que não devem poluir os construtores dos Casos de Uso ou Serviços.
        *   **Exemplo no Project Wiz:** Se a criação de uma `ITask` específica (conceito ainda em desenvolvimento) ou de um `IAgentTool` se tornar complexa, dependendo de configurações dinâmicas ou múltiplas sub-dependências, uma fábrica poderia ser introduzida para encapsular essa lógica de instanciação.

A camada de aplicação é crucial para manter a lógica de domínio pura, pois ela lida com a orquestração, a adaptação de dados entre o mundo externo (UI, infraestrutura) e o núcleo de negócios, e a execução dos fluxos de trabalho que definem as funcionalidades da aplicação.
### 3.3. Camada de Infraestrutura (`src_refactored/infrastructure/` e `src_refactored/presentation/electron/main/`)

*   **Propósito:** Contém todas as implementações concretas de detalhes externos à aplicação. Esta camada lida com frameworks, acesso a banco de dados, interação com sistemas de arquivos, comunicação com APIs de terceiros, e a interface do usuário (UI) no contexto de ser um mecanismo de entrega. Ela implementa as interfaces (portas) definidas pelas camadas de Aplicação e Domínio, tornando as camadas internas independentes de detalhes de implementação específicos.
*   **Componentes Chave:**
    *   **Implementações de Persistência (`infrastructure/persistence/drizzle/`):**
        *   **Papel:** Implementações concretas das Interfaces de Repositório (definidas em `core/domain/<entidade>/ports/`) usando Drizzle ORM e SQLite. Responsáveis por traduzir as operações de domínio em interações com o banco de dados.
        *   **Padrões (ADR-017):**
            *   **Definição de Esquemas de Tabela:** Os esquemas Drizzle (`*.schema.ts` ou `*.table.ts`) são definidos em `infrastructure/persistence/drizzle/schema/`, representando as tabelas do banco de dados. Incluem tipos de coluna, índices e relações.
            *   **Implementações de Repositório:** Classes como `DrizzleProjectRepository` implementam as interfaces `IProjectRepository`. Elas contêm a lógica de consulta específica do Drizzle e usam mappers para converter entre o formato das entidades de domínio e o formato das tabelas Drizzle.
            *   **Mappers (`*.mapper.ts`):** Co-localizados com as implementações de repositório, responsáveis pela tradução bidirecional entre Entidades/VOs de domínio e os objetos de dados crus do Drizzle (e.g., de `ProjectEntity` para `projectsTable` e vice-versa).
            *   **`save()` como Upsert:** O método `save()` nos repositórios geralmente implementa uma lógica de "upsert" (inserir se novo, atualizar se existente), utilizando as funcionalidades do Drizzle para tal.
            *   **Gerenciamento de Transações:** A camada de aplicação é responsável por iniciar e finalizar transações quando uma operação de Caso de Uso envolve múltiplos repositórios ou passos que devem ser atômicos. Os repositórios individuais operam dentro da transação fornecida ou em operações atômicas se não houver transação explícita.
            *   **Tratamento de Erros:** Erros específicos do Drizzle ou do banco de dados (e.g., violações de constraint, erros de conexão) são capturados e encapsulados em `InfrastructureError` ou subclasses (conforme **ADR-014**), evitando o vazamento de detalhes de infraestrutura para as camadas superiores.
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
        *   **Papel:** Implementação concreta do sistema de filas, usando Drizzle para persistir jobs e gerenciar seu estado, garantindo que as tarefas assíncronas sejam processadas de forma confiável.
        *   **Padrões (ADR-020):**
            *   `DrizzleQueueFacade` implementa a interface `AbstractQueue` (definida em `core/application/ports/queue/`), atuando como o ponto de entrada principal para interações com a fila (e.g., `addJob`, `fetchNextJobAndLock`).
            *   Compõe serviços internos como `QueueServiceCore` (para lógica central de adição, recuperação e atualização de jobs no banco de dados via `IJobRepository`), `JobProcessingService` (para orquestrar a execução de jobs pelos workers, interagindo com `WorkerService` e `ProcessorFunction` - este serviço é mais conceitual dentro da ADR-020, sendo o `WorkerService` o principal ator no processamento), e `QueueMaintenanceService` (para tarefas como limpeza de jobs antigos, tratamento de jobs "presos", ou retentativas).
            *   Define o fluxo de criação de `JobEntity` (ADR-010) e sua persistência através do `IJobRepository` (implementado pelo `DrizzleJobRepository`).
            *   Emite eventos sobre o ciclo de vida dos jobs (e.g., `job.created`, `job.completed`, `job.failed`) usando um sistema de eventos interno ou uma biblioteca, permitindo que outras partes do sistema reajam a estas mudanças de estado.
    *   **Adaptadores (`infrastructure/adapters/`):**
        *   **Papel:** Encapsulam a comunicação com serviços externos (LLMs, APIs de terceiros, sistemas de arquivos, etc.), implementando as interfaces (portas) definidas em `core/application/ports/adapters/`. Eles traduzem as requisições da aplicação para o formato esperado pelo serviço externo e as respostas do serviço externo para o formato esperado pela aplicação.
        *   **Padrões (ADR-018):**
            *   Cada adaptador implementa uma porta específica (e.g., `OpenAILLMAdapter` implementa `ILLMAdapter`).
            *   Encapsulam a lógica de comunicação (e.g., chamadas HTTP, uso de SDKs de terceiros como `ai` para LLMs).
            *   Tratamento de erros específico do adaptador: falhas de comunicação ou erros retornados pelo serviço externo são capturados e encapsulados em `InfrastructureError` ou subclasses (ADR-014).
            *   Tipos de Retorno: Retornam `Promise` com tipos de dados específicos da operação (e.g., `Promise<string>` para uma geração de texto LLM), NÃO `IUseCaseResponse`.
            *   Logging: Interações significativas (requisições, respostas, erros) são registradas usando `ILogger` (ADR-013).
            *   Configuração: API keys, URLs base, etc., são injetados via `IConfigurationService` (ADR-031) ou DI.
            *   Mocks: Implementações mock (e.g., `MockLLMAdapter`) são fornecidas para testes e desenvolvimento local, permitindo que a aplicação seja executada sem dependências externas reais.
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
        *   **Papel:** O processo principal do Electron (`main.ts`) é responsável por gerenciar o ciclo de vida da aplicação, criar janelas de navegador (`BrowserWindow`), e registrar handlers para chamadas de Comunicação Inter-Processos (IPC) vindas do processo de renderização (UI). Do ponto de vista da Clean Architecture, os handlers IPC (e.g., `ProjectActionHandler`) atuam como adaptadores de interface, recebendo requisições da UI e delegando para Casos de Uso ou Serviços de Aplicação na camada de Aplicação.
        *   **Padrões:**
            *   **ADR-023 (Configuração e Segurança do Main Process):** Detalha a configuração segura das `BrowserWindow` (e.g., `contextIsolation: true`, `nodeIntegration: false`, uso de `preload` scripts), gerenciamento do ciclo de vida da aplicação (eventos `ready`, `window-all-closed`, `activate`), e tratamento de erros no processo principal.
            *   **ADR-024 (Padrões IPC e Script de Preload):** Define como os canais IPC são nomeados (e.g., `feature:action`), como os dados são serializados (DTOs validados por Zod nos handlers), e como o script de `preload` expõe uma API IPC segura e tipada para o processo de renderização usando `contextBridge` (e.g., `window.electronIPC.invoke('channel', data)`). Os handlers no processo principal validam rigorosamente todas as entradas antes de invocar a lógica de aplicação.
    *   **Configuração da Injeção de Dependência (`infrastructure/ioc/inversify.config.ts`):**
        *   **Papel:** Configura o container InversifyJS, registrando todas as bindings (ligações) entre interfaces (representadas por tokens, geralmente Symbols) e suas implementações concretas. Define também os escopos de ciclo de vida dos objetos gerenciados (e.g., singleton, transient, request).
        *   **Padrões (ADR-019):**
            *   Uso de `Symbol` como tokens de DI (e.g., `TYPES.ILogger`, `TYPES.ProjectRepository`) para evitar colisões de nome e garantir um contrato claro.
            *   Preferência por injeção via construtor para clareza de dependências.
            *   Organização das bindings em módulos do InversifyJS (`ContainerModule`) para melhor escalabilidade e separação de responsabilidades de configuração.
            *   Resolução de dependências para classes em todas as camadas que necessitam de serviços externos ou outras dependências gerenciadas (e.g., um Caso de Uso recebendo um Repositório e um Logger).

### 3.4. Arquitetura Frontend (UI - React) (`src_refactored/presentation/ui/`)

A interface do usuário (UI) do Project Wiz é uma Single Page Application (SPA) construída com React, TypeScript e Vite, localizada em `src_refactored/presentation/ui/`. Ela é responsável por toda a interação visual com o usuário e comunica-se com o processo principal do Electron via IPC para executar operações de backend e persistir dados.

*   **Princípios de Design da UI (ADR-025):**
    *   **Componentes Funcionais e Hooks:** Uso exclusivo de componentes funcionais e React Hooks para toda a lógica de UI, promovendo um estilo de codificação mais conciso e componível.
    *   **Composição e Reusabilidade:** Priorizar a composição de componentes menores e reutilizáveis para construir interfaces complexas, evitando componentes monolíticos.
    *   **Separação de Responsabilidades:**
        *   **Componentes de Apresentação (Dumb/Presentational):** Focados exclusivamente na aparência (como renderizar dados e estilização). Recebem dados e callbacks via props e não possuem estado próprio complexo ou lógica de negócios. São altamente reutilizáveis.
        *   **Componentes Container/Feature (Smart):** Gerenciam estado, lógica de busca de dados (via hooks IPC), interações do usuário, e passam dados e callbacks para componentes de apresentação. Frequentemente associados a rotas específicas ou representam uma funcionalidade de negócio completa na UI.
    *   **Gerenciamento de Estado (ADR-025):**
        *   **Estado Local:** `useState`, `useReducer` para estado que é relevante apenas dentro de um único componente ou uma pequena subárvore de componentes.
        *   **Estado Compartilhado (Context API):** Para dados que precisam ser acessados por uma subárvore de componentes sem prop drilling excessivo (e.g., tema da UI, informações de autenticação do usuário, configurações globais da UI). Usar com moderação para evitar complexidade excessiva.
        *   **Estado de Servidor (Interação IPC):** Hooks customizados como `useIpcQuery` (para buscar dados) e `useIpcMutation` (para enviar comandos/criar/atualizar dados) localizados em `presentation/ui/hooks/ipc/` são usados para interagir com o backend. Estes hooks encapsulam o uso do `IPCService` (que por sua vez interage com `window.electronIPC` exposto pelo preload script, conforme **ADR-024**) e gerenciam estados de `loading`, `error`, e `data` para os componentes. A ADR-025 também considera a futura adoção de bibliotecas como TanStack Query (`@tanstack/react-query`) para otimizar o caching, a sincronização de estado do servidor e funcionalidades como retentativas automáticas e paginação.
        *   **Estado Global (Opcional):** Para estado global complexo que afeta múltiplas partes não diretamente relacionadas da UI, bibliotecas como Zustand ou Jotai podem ser consideradas se a Context API se tornar difícil de gerenciar (ADR-025). A decisão de adotar tal biblioteca será baseada na necessidade e complexidade crescente.
    *   **Hooks Customizados (`hooks/`):** Para encapsular lógica de UI reutilizável (e.g., manipulação de formulários complexos, interações com browser APIs, lógica de IPC específica para um conjunto de funcionalidades, gerenciamento de timers/intervalos).
    *   **Formulários:** React Hook Form em conjunto com Zod para validação de esquemas (**ADR-025**). Esta combinação oferece performance, excelente Developer Experience, e validação de dados robusta e type-safe.
    *   **Performance:** Otimizações como `React.memo` (aplicado criteriosamente a componentes que recebem props complexas e não re-renderizam frequentemente), virtualização de listas longas (e.g., com `@tanstack/react-virtual`), e `React.lazy` para code splitting de rotas e componentes pesados.
    *   **Acessibilidade (A11y):** Desenvolvimento com acessibilidade em mente, usando HTML semântico, atributos ARIA quando necessário, e testando a navegabilidade via teclado e com leitores de tela.
    *   **Error Boundaries:** Componentes React que capturam erros de JavaScript em sua árvore de componentes filhos, registram esses erros (e.g., enviando para o processo principal para logging) e exibem uma UI de fallback em vez de quebrar toda a aplicação.

*   **Estilização (ADR-026):**
    *   **Tailwind CSS:** Framework utility-first como base para toda a estilização. Permite desenvolvimento rápido e consistente, aplicando estilos diretamente no HTML/JSX, e reduz a necessidade de escrever CSS customizado extensivamente.
    *   **Shadcn/UI:** Utilizado como uma coleção de "receitas" para construir componentes React acessíveis e bem desenhados (e.g., Button, Dialog, Input). Os componentes são "copiados" para o projeto (geralmente em `components/ui/`) e customizados conforme necessário, não instalados como uma dependência de biblioteca tradicional. Isso dá controle total sobre o código do componente.
    *   **Gerenciamento de Nomes de Classe:** Uso da função utilitária `cn` (que geralmente combina `clsx` e `tailwind-merge`) para aplicar classes Tailwind condicionalmente e resolver conflitos de classes utilitárias de forma inteligente.
    *   **Design Responsivo:** Abordagem mobile-first utilizando os breakpoints responsivos do Tailwind (`sm:`, `md:`, `lg:`, `xl:`) para adaptar a UI a diferentes tamanhos de tela.
    *   **Tematização (Dark Mode):** Suporte a múltiplos temas (e.g., claro/escuro) usando as variantes `dark:` do Tailwind e variáveis CSS definidas no arquivo global de estilos, permitindo a troca de tema dinamicamente.

*   **Estrutura de Diretórios e Nomenclatura (ADR-027):**
    *   **Organização Principal:**
        *   `app/`: Contém as definições de rotas e os componentes de página associados, seguindo a convenção de file-based routing do TanStack Router. Subdiretórios representam segmentos de rota. Layouts de rota (`_layout.tsx`) também residem aqui.
        *   `components/`: Componentes de UI globais e reutilizáveis em várias partes da aplicação.
            *   `common/`: Componentes genéricos e atômicos (e.g., `Button`, `Spinner`, `Card`).
            *   `layout/`: Componentes para a estrutura visual principal da aplicação (e.g., `AppShell`, `Sidebar`, `Header`).
            *   `ui/`: Componentes base da biblioteca Shadcn/UI que foram adicionados ao projeto e podem ser customizados.
        *   `features/<nome-da-feature>/`: Módulos de UI agrupados por funcionalidade de negócio (e.g., `project-management`, `user-settings`, `agent-execution-monitoring`). Cada diretório de feature contém seus próprios `components/` (específicos da feature), `hooks/`, `services/` (se aplicável, e.g., para lógica de UI complexa da feature), `types/`, e `index.ts` para exportações. Esta abordagem é conhecida como "feature-sliced design".
        *   `hooks/`: Hooks React globais e reutilizáveis em diferentes features ou componentes.
        *   `lib/`: Utilitários JavaScript/TypeScript puros, não específicos do React (e.g., formatação de datas, cálculos).
        *   `services/`: Serviços globais da UI, como o `IPCService` para comunicação com o processo principal.
        *   `styles/`: Arquivos de CSS global, configuração de tema Tailwind (`tailwind.css`, `globals.css`).
        *   `types/`: Definições de tipos TypeScript globais para a UI.
    *   **Nomenclatura (ADR-027, ADR-028):** Diretórios em `kebab-case`. Componentes React em `PascalCase.tsx`. Hooks em `useCamelCase.ts` ou `usePascalCase.ts`. Outros arquivos TS (serviços, libs, types) em `kebab-case.ts`.
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
                servicesDir["services/ (IPCService, etc.)"]
                stylesDir["styles/ (CSS Global, Tailwind Config)"]
                typesDir["types/ (Tipos TypeScript Globais da UI)"]
                mainTsx["main.tsx (Ponto de Entrada da UI)"]
                indexHtml["index.html (Host da SPA)"]
            end

            appDir --> routeLayout["(group)/_layout.tsx (Layout de Grupo de Rota)"]
            appDir --> routePage["feature-x/page.tsx (Página de Rota)"]
            appDir --> routeIndex["index.tsx (Rota Raiz '/')"]

            componentsDir --> commonComp["common/ (e.g., Button, Input, Spinner)"]
            componentsDir --> layoutComp["layout/ (e.g., AppShell, Sidebar, PageHeader)"]
            componentsDir --> uiComp["ui/ (Componentes base Shadcn/UI customizados)"]

            featuresDir --> featureA["project-management/ (Exemplo de Feature)"]
            featureA --> fa_components["components/ (Componentes específicos da feature)"]
            featureA --> fa_hooks["hooks/ (Hooks específicos da feature)"]
            featureA --> fa_services["services/ (Lógica de UI da feature)"]
            featureA --> fa_types["types/ (Tipos da feature)"]
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
    *   O `IPCService` (localizado em `presentation/ui/services/ipc.service.ts`) abstrai as chamadas para `window.electronIPC.invoke('channel', data)` e `window.electronIPC.on('channel', listener)` (esta API é exposta de forma segura pelo script de `preload` usando `contextBridge`).
    *   Hooks customizados como `useIpcQuery` e `useIpcMutation` (localizados em `presentation/ui/hooks/ipc/`) utilizam o `IPCService` para interagir com o backend (processo principal). Eles são responsáveis por:
        *   Enviar dados (validados no lado do cliente, se apropriado, mas a validação principal ocorre no main process) para o processo principal.
        *   Receber respostas (que devem ser instâncias de `IUseCaseResponse` indicando sucesso com dados, ou falha com detalhes do erro, conforme **ADR-008**).
        *   Gerenciar o estado da chamada assíncrona (e.g., `isLoading`, `error`, `data`) para que os componentes React possam re-renderizar de acordo.
    *   É crucial que a API exposta pelo `preload` script seja mínima e segura, e que toda a validação de dados de entrada ocorra nos handlers IPC no processo principal (usando Zod) antes de invocar qualquer Caso de Uso ou Serviço de Aplicação, conforme detalhado na **ADR-024**.

## 4. Principais Padrões de Design e Conceitos Aplicados

Esta seção resume os principais padrões de design e conceitos arquiteturais empregados no Project Wiz, com referências às ADRs que os formalizam ou exemplificam sua aplicação.

*   **Repository Pattern:**
    *   **Descrição:** Abstrai o acesso aos dados, desacoplando a lógica de domínio e aplicação dos mecanismos de persistência. A camada de domínio define a interface do repositório (o contrato), e a camada de infraestrutura fornece a implementação concreta.
    *   **Aplicação no Project Wiz:** Interfaces como `IUserRepository`, `IJobRepository` são definidas em `core/domain/<entidade>/ports/` (**ADR-011**). Implementações concretas como `DrizzleUserRepository` usando Drizzle ORM residem em `infrastructure/persistence/drizzle/` (**ADR-017**).
*   **Service Layer (Application Services & Domain Services):**
    *   **Descrição:** Encapsula a lógica de aplicação (Application Services) ou lógica de domínio complexa que não pertence a uma única entidade (Domain Services).
    *   **Aplicação no Project Wiz:** Serviços de Aplicação (e.g., `GenericAgentExecutor`, `ChatService`, `WorkerService`) em `core/application/services/` orquestram casos de uso e interações com a infraestrutura através de portas (**ADR-012**, **ADR-022**). Serviços de Domínio são usados com mais critério para lógica de negócio pura e complexa que transcende entidades individuais e é reutilizável por múltiplos casos de uso.
*   **Factory Pattern (via Métodos Estáticos `create`):**
    *   **Descrição:** Usado para criar instâncias de objetos complexos, especialmente quando a criação envolve lógica de validação, inicialização de estado complexo, ou encapsulamento da escolha da classe concreta a ser instanciada.
    *   **Aplicação no Project Wiz:** Entidades e Objetos de Valor utilizam um método estático `create()` que atua como uma fábrica, encapsulando a validação de entrada (com Zod) e a lógica de instanciação, retornando um objeto `Result` para indicar sucesso ou falha na criação (**ADR-010**).
*   **Value Objects (VOs):**
    *   **Descrição:** Objetos imutáveis definidos por seus atributos e seu significado conceitual, usados para representar conceitos descritivos do domínio (e.g., um endereço, um status, um identificador tipado) e garantir a validade e consistência dos dados.
    *   **Aplicação no Project Wiz:** Amplamente utilizado para IDs (e.g., `ProjectId` como um `Identity<string>`), emails, status (e.g., `JobStatus`), e outros atributos que possuem regras de validação e significado próprios, conforme **ADR-010**.
*   **Entities:**
    *   **Descrição:** Objetos com identidade única que persistem ao longo do tempo (mesmo que seus atributos mudem), representando conceitos centrais do domínio e encapsulando seu estado e comportamento (regras de negócio).
    *   **Aplicação no Project Wiz:** `UserEntity`, `JobEntity`, `ProjectEntity`, etc., conforme **ADR-010**.
*   **Use Cases/Interactors:**
    *   **Descrição:** Classes que definem e executam operações específicas da aplicação (user stories), orquestrando a interação entre a UI/handlers e a camada de domínio para atingir um objetivo de negócio.
    *   **Aplicação no Project Wiz:** Casos de Uso em `core/application/use-cases/` implementam a interface `IUseCase` e retornam uma `IUseCaseResponse` padronizada, encapsulando a lógica de uma funcionalidade específica (**ADR-012**, **ADR-008**).
*   **Dependency Injection (DI):**
    *   **Descrição:** Padrão onde as dependências de um objeto são fornecidas externamente (injetadas) em vez de o objeto criá-las internamente. Promove baixo acoplamento, alta testabilidade e flexibilidade.
    *   **Aplicação no Project Wiz:** InversifyJS é usado para gerenciar e injetar dependências em todo o backend (processo principal e lógica core), conforme **ADR-019**. Isso inclui a injeção de repositórios em casos de uso, loggers em serviços, etc.
*   **Facade Pattern:**
    *   **Descrição:** Fornece uma interface simplificada e unificada para um subsistema mais complexo, escondendo sua complexidade interna.
    *   **Aplicação no Project Wiz:** `DrizzleQueueFacade` atua como uma fachada para os serviços internos do sistema de filas (`QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService`), simplificando a interação com o sistema de filas para o restante da aplicação (**ADR-020**).
*   **Asynchronous Processing (Jobs & Queue):**
    *   **Descrição:** Padrão para lidar com tarefas de longa duração, operações em segundo plano, ou tarefas que precisam ser desacopladas do fluxo principal de execução para melhorar a responsividade da aplicação e a resiliência a falhas.
    *   **Aplicação no Project Wiz:**
        *   **Jobs:** `JobEntity` representa unidades de trabalho discretas, identificáveis e persistíveis (**ADR-010**, **ADR-020**).
        *   **Queue:** `AbstractQueue` (interface) e `DrizzleQueueFacade` (implementação) gerenciam o enfileiramento, persistência, e ciclo de vida dos jobs (**ADR-020**).
        *   **Workers:** `WorkerService` é responsável por consumir jobs da fila, gerenciando concorrência e o ciclo de vida do processamento de cada job (**ADR-022**).
        *   **Processor Function:** Lógica específica que executa o trabalho de um job, definida pela assinatura `ProcessorFunction<P, R>` e injetada ou selecionada pelo `WorkerService` (**ADR-021**). `GenericAgentExecutor` é um exemplo de implementação de uma `ProcessorFunction`.
*   **Adapter Pattern:**
    *   **Descrição:** Converte a interface de uma classe em outra interface que os clientes esperam, permitindo que classes com interfaces incompatíveis trabalhem juntas. Frequentemente usado para integrar componentes de terceiros ou sistemas legados.
    *   **Aplicação no Project Wiz:** Usado para integrar serviços externos. Por exemplo, `ILLMAdapter` define uma interface padrão para interação com LLMs, e implementações como `OpenAILLMAdapter` adaptam essa interface para a API específica de um provedor de LLM (e.g., OpenAI, Anthropic), conforme **ADR-018**.
*   **Strategy Pattern (implícito em Processors/Tools):**
    *   **Descrição:** Define uma família de algoritmos (estratégias), encapsula cada um deles e os torna intercambiáveis. Permite que o algoritmo varie independentemente dos clientes que o utilizam.
    *   **Aplicação no Project Wiz:** O sistema de `ProcessorFunction` (**ADR-021**) permite que diferentes estratégias de processamento de jobs sejam definidas e executadas pelo `WorkerService`. Mais especificamente, o design de `IAgentTool` (ainda conceitual, mas relacionado à execução de agentes) permitiria que diferentes ferramentas (estratégias de ação) sejam selecionadas e executadas dinamicamente pelo `GenericAgentExecutor`.
*   **State Pattern (implícito em JobEntity/Agents):**
    *   **Descrição:** Permite que um objeto altere seu comportamento quando seu estado interno muda. O objeto parecerá ter mudado de classe.
    *   **Aplicação no Project Wiz:** `JobEntity` possui um `JobStatus` (VO) que dita as operações válidas e o comportamento esperado em diferentes fases do seu ciclo de vida (e.g., um job `COMPLETED` não pode ser reprocessado da mesma forma que um `PENDING`), conforme **ADR-010** e **ADR-020**. Similarmente, o estado de um Agente (se formalizado com um VO de Status específico) influenciaria seu comportamento e as ações disponíveis.
*   **Configuration Management:**
    *   **Descrição:** Abordagem centralizada e consistente para gerenciar configurações da aplicação de forma segura, tipada e acessível em diferentes partes do sistema.
    *   **Aplicação no Project Wiz:** Uso de variáveis de ambiente, arquivos `.env` (com `.env.example` versionado), e um `IConfigurationService` injetável para fornecer configurações de forma estruturada e validada com Zod para componentes do backend e frontend (via IPC para o frontend, se necessário), conforme **ADR-031**.
*   **Error Handling Strategy:**
    *   **Descrição:** Um conjunto de padrões para tratamento, encapsulamento e comunicação de erros de forma consistente em toda a aplicação.
    *   **Aplicação no Project Wiz:** Uso da classe base `CoreError` e subclasses específicas (`EntityError`, `ApplicationError`, `InfrastructureError`, `NotFoundError`, etc.) para categorizar erros. Encapsulamento de erros de camadas inferiores. Uso de `IUseCaseResponse` para comunicar sucesso ou falha de Casos de Uso de forma padronizada. Logging detalhado de erros. (**ADR-014**, **ADR-008**).
*   **Logging Strategy:**
    *   **Descrição:** Padrões para registrar informações sobre o comportamento da aplicação, eventos significativos e erros para fins de depuração, monitoramento e auditoria.
    *   **Aplicação no Project Wiz:** Uso da interface `ILogger` para abstrair a implementação de logging. Logging estruturado (preferencialmente JSON em produção). Níveis de log padronizados. Contextualização de logs com informações relevantes (e.g., `jobId`, `userId`). Distinção entre logging de aplicação (`ILogger`) e logging operacional de jobs (`JobEntity.addLog()`). (**ADR-013**).

## 5. Exemplos de Fluxo de Dados

Esta seção ilustra como os dados fluem através das camadas e componentes em cenários chave da aplicação, demonstrando a interação entre os princípios arquiteturais e os padrões de design discutidos.

### 5.1. Fluxo de Interação da UI para o Processo Principal (Ex: Criação de Projeto)

Este diagrama ilustra uma interação típica iniciada na UI, como a submissão de um formulário para criar um novo projeto.

```mermaid
sequenceDiagram
    participant CompReact as Componente React (UI - presentation/ui)
    participant HookIPC as Hook useIpcMutation (UI - presentation/ui/hooks/ipc)
    participant IPCService as IPCService (UI - presentation/ui/services)
    participant PreloadAPI as window.electronIPC (API do Preload - presentation/electron/preload)
    participant MainRouter as Roteador IPC (Main Process - presentation/electron/main)
    participant ProjHandler as ProjectActionHandler (Main Process - presentation/electron/main/handlers)
    participant CreateProjUC as CreateProjectUseCase (Aplicação - core/application/use-cases)
    participant ProjEntity as ProjectEntity (Domínio - core/domain/project)
    participant ProjRepoPort as IProjectRepository (Porta do Domínio)
    participant DrizzleProjRepo as DrizzleProjectRepository (Infraestrutura - infrastructure/persistence/drizzle)

    CompReact->>+HookIPC: user submits form; calls mutate({ nome, desc })
    HookIPC->>+IPCService: invoke("project:create", { nome, desc })
    IPCService->>+PreloadAPI: invoke("project:create", { nome, desc })
    PreloadAPI-->>+MainRouter: Mensagem IPC ("project:create", payload) via ipcRenderer.invoke
    MainRouter->>+ProjHandler: handleCreateProject(event, payload)
    ProjHandler->>ProjHandler: Valida payload com Zod (CreateProjectInputSchema - ADR-024)
    alt Validação Falhou
        ProjHandler-->>-MainRouter: Retorna errorUseCaseResponse(validationError)
    else Validação OK
        ProjHandler->>+CreateProjUC: execute(validatedInput) (DI via ADR-019)
        CreateProjUC->>+ProjEntity: static create(props) (ADR-010)
        ProjEntity-->>-CreateProjUC: Result<ProjectEntity, EntityError> (projetoOuErro)
        alt Criação da Entidade Falhou (Regra de Negócio)
            CreateProjUC-->>-ProjHandler: errorUseCaseResponse(entityError) (ADR-008, ADR-014)
        else Criação da Entidade OK
            CreateProjUC->>+ProjRepoPort: save(projeto) (Interface do Domínio - ADR-011)
            ProjRepoPort-->>DrizzleProjRepo: save(projeto) (Implementação da Infra - ADR-017)
            DrizzleProjRepo->>DrizzleProjRepo: Mapeia ProjectEntity para formato Drizzle, executa upsert SQL
            DrizzleProjRepo-->>-ProjRepoPort: Promise<void> (sucesso)
            ProjRepoPort-->>-CreateProjUC: Promise<void> (sucesso)
            CreateProjUC->>CreateProjUC: Mapeia ProjectEntity para ProjectDto (DTO de saída)
            CreateProjUC-->>-ProjHandler: successUseCaseResponse(projectDto) (ADR-008)
        end
    end
    ProjHandler-->>-MainRouter: IUseCaseResponse (projectDto ou CoreError)
    MainRouter-->>-PreloadAPI: Retorna IUseCaseResponse
    PreloadAPI-->>-IPCService: Retorna IUseCaseResponse
    IPCService-->>-HookIPC: Atualiza estado (data: projectDto ou error: coreError)
    HookIPC-->>-CompReact: Re-renderiza componente com novos dados ou mensagem de erro
```
*   **Descrição Detalhada do Fluxo:**
    1.  **UI (Apresentação):** O usuário interage com um Componente React (e.g., `ProjectForm`), preenchendo dados para um novo projeto e clica em "Salvar". O componente chama a função `mutate` fornecida pelo hook `useIpcMutation`, passando os dados do formulário.
    2.  **Hook IPC (Apresentação):** O hook `useIpcMutation` (ADR-025) utiliza o `IPCService` para enviar uma mensagem ao processo principal. Ele especifica o canal IPC (e.g., `"project:create"`) e o payload (dados do projeto).
    3.  **IPCService (Apresentação):** Este serviço é um wrapper em torno da API `window.electronIPC` exposta pelo script de preload, garantindo uma interface tipada e centralizada para chamadas IPC (ADR-024).
    4.  **Preload Script (Apresentação):** O script de preload, através de `ipcRenderer.invoke`, envia a mensagem para o processo principal. `contextBridge` garante que apenas a API definida seja exposta de forma segura (ADR-024).
    5.  **Roteador IPC (Main Process - Apresentação/Infra):** No processo principal, `ipcMain.handle('project:create', ...)` recebe a mensagem. Este handler atua como um ponto de entrada e roteamento.
    6.  **Handler Específico (Main Process - Apresentação/Infra):** O `ProjectActionHandler.handleCreateProject` é invocado.
        *   A primeira responsabilidade é validar o payload recebido usando um esquema Zod (e.g., `CreateProjectInputSchema`), conforme **ADR-024**. Se a validação falhar, uma `errorUseCaseResponse` com os detalhes do erro de validação é retornada imediatamente.
    7.  **Caso de Uso (Aplicação):** Se a validação do input for bem-sucedida, o handler invoca o `CreateProjectUseCase.execute(validatedInput)`. A instância do Caso de Uso é obtida via Injeção de Dependência (DI com InversifyJS, **ADR-019**).
    8.  **Entidade (Domínio):** O `CreateProjectUseCase` chama o método estático `ProjectEntity.create(props)` para criar uma nova instância da entidade. Este método contém lógica de validação de regras de negócio intrínsecas à entidade (e.g., nome do projeto não pode ser vazio, formato específico), conforme **ADR-010**. Retorna um `Result<ProjectEntity, EntityError>`.
    9.  **Tratamento de Resultado da Criação da Entidade (Aplicação):**
        *   Se `ProjectEntity.create()` falhar (e.g., regra de negócio violada), o Caso de Uso retorna uma `errorUseCaseResponse` contendo o `EntityError` (ADR-008, ADR-014).
    10. **Repositório (Aplicação -> Domínio -> Infraestrutura):**
        *   Se a entidade é criada com sucesso, o Caso de Uso chama `projectRepository.save(projectEntity)`. `projectRepository` é uma instância de `IProjectRepository` (interface da Camada de Domínio, ADR-011), injetada no Caso de Uso.
        *   A implementação concreta (e.g., `DrizzleProjectRepository` na Camada de Infraestrutura, ADR-017) é invocada. Ela mapeia a `ProjectEntity` para o formato da tabela Drizzle e executa a operação de `INSERT` (ou upsert) no banco de dados SQLite.
    11. **Resposta do Caso de Uso (Aplicação):** Após a persistência bem-sucedida, o Caso de Uso mapeia a `ProjectEntity` para um `ProjectDto` (um objeto de dados simples para transferência) e retorna `successUseCaseResponse(projectDto)`.
    12. **Retorno via IPC (Main Process -> Preload -> UI):** A `IUseCaseResponse` (seja de sucesso ou erro) propaga de volta pela mesma cadeia IPC até o hook `useIpcMutation` na UI.
    13. **Atualização da UI (Apresentação):** O hook `useIpcMutation` atualiza seu estado interno (`data`, `error`, `isLoading`), o que faz com que o Componente React que o utiliza seja re-renderizado para refletir o resultado da operação (e.g., exibir o novo projeto na lista ou mostrar uma mensagem de erro).

### 5.2. Fluxo de Processamento de Job por um Worker (Backend)

Este diagrama detalha como um `WorkerService` (camada de Aplicação) pega um job da fila (gerenciada pela Infraestrutura da Fila), e o processa usando uma `ProcessorFunction` (que pode ser, por exemplo, um `GenericAgentExecutor`).

```mermaid
sequenceDiagram
    participant WorkerSvc as WorkerService (Aplicação - ADR-022)
    participant QueuePort as AbstractQueue (Porta da Aplicação - ADR-020)
    participant QueueImpl as DrizzleQueueFacade (Infra - ADR-020)
    participant JobRepoPort as IJobRepository (Porta do Domínio - ADR-011)
    participant JobRepoImpl as DrizzleJobRepository (Infra - ADR-017)
    participant JobEntityInst as JobEntity (Instância do Domínio - ADR-010)
    participant ProcessorFn as ProcessorFunction (Aplicação - ADR-021, e.g., GenericAgentExecutor)
    participant AgentToolPort as IAgentTool (Porta para Ferramentas - Conceitual)
    participant LLMAdapterPort as ILLMAdapter (Porta da Aplicação - ADR-018)
    participant LLMAdapterImpl as OpenAILLMAdapter (Infra - ADR-018)
    participant ConfigSvcPort as IConfigurationService (Porta da Aplicação - ADR-031)

    loop Ciclo de Polling do WorkerService
        WorkerSvc->>+QueuePort: fetchNextJobAndLock(workerId, lockDuration)
        QueuePort-->>+QueueImpl: fetchNextJobAndLock(workerId, lockDuration)
        QueueImpl->>+JobRepoPort: findAndLockNextAvailableJob(workerId, lockDuration)
        JobRepoPort-->>+JobRepoImpl: findAndLockNextAvailableJob(workerId, lockDuration)
        JobRepoImpl-->>-JobRepoPort: jobData | null
        JobRepoPort-->>-QueueImpl: jobData | null
        alt Job Encontrado
            QueueImpl-->>QueueImpl: Reconstrói JobEntity de jobData
            QueueImpl-->>-QueuePort: jobEntity
            QueuePort-->>-WorkerSvc: jobEntity
            WorkerSvc->>WorkerSvc: Instrumenta JobEntity (addLog, updateProgress via QueuePort)
            WorkerSvc->>WorkerSvc: Inicia Renovação de Lock (via QueuePort.extendLock)
            WorkerSvc->>+ProcessorFn: process(jobEntityInstrumentada, ConfigSvcPort)
            ProcessorFn->>ProcessorFn: Analisa payload do Job, decide estratégia de execução
            ProcessorFn->>+ConfigSvcPort: getLLMApiKey() (Exemplo de uso de config)
            ConfigSvcPort-->>-ProcessorFn: apiKey
            loop Ciclo de Execução Interno do Processador (e.g., Agente)
                ProcessorFn->>ProcessorFn: Determina próxima ferramenta/passo
                opt Uso de Ferramenta
                    ProcessorFn->>+AgentToolPort: execute(toolName, params)
                    AgentToolPort-->>-ProcessorFn: ToolOutput (Resultado da Ferramenta)
                end
                opt Chamada ao LLM para decisão ou geração
                    ProcessorFn->>+LLMAdapterPort: generate(promptComplexo)
                    LLMAdapterPort-->>+LLMAdapterImpl: generate(promptComplexo)
                    LLMAdapterImpl-->>-LLMAdapterPort: LLMResponse
                    LLMAdapterPort-->>-ProcessorFn: LLMResponse
                end
                ProcessorFn->>JobEntityInst: addLog("Etapa X concluída com sucesso.") (Chamada instrumentada)
                Note right of JobEntityInst: WorkerSvc intercepta e chama QueuePort.addLogToJob()
                ProcessorFn->>JobEntityInst: updateProgress(75) (Chamada instrumentada)
                Note right of JobEntityInst: WorkerSvc intercepta e chama QueuePort.updateJobProgress()
            end
            ProcessorFn-->>-WorkerSvc: Resultado (sucesso com dados, ou falha com CoreError)
            WorkerSvc->>WorkerSvc: Para Renovação de Lock
            alt Processamento Bem-sucedido
                WorkerSvc->>+QueuePort: markJobAsCompleted(jobId, workerId, resultadoFinal, logsColetados)
            else Falha no Processamento (Erro da ProcessorFn)
                WorkerSvc->>+QueuePort: markJobAsFailed(jobId, workerId, erroDoProcessador, logsColetados)
            end
            QueuePort-->>+QueueImpl: (Chama método correspondente)
            QueueImpl->>+JobRepoPort: updateJobStatus(...) (Atualiza job no DB)
            JobRepoPort-->>+JobRepoImpl: updateJobStatus(...)
            JobRepoImpl-->>-JobRepoPort: Promise<void>
            JobRepoPort-->>-QueueImpl: Promise<void>
            QueueImpl-->>-QueuePort: Promise<void>
            QueuePort-->>-WorkerSvc: Promise<void>
        else Nenhum Job Disponível
            QueueImpl-->>-QueuePort: null
            QueuePort-->>-WorkerSvc: null
            WorkerSvc->>WorkerSvc: Aguarda 'pollingIntervalMs' e tenta novamente
        end
    end
```
*   **Descrição Detalhada do Fluxo:**
    1.  **Polling (Aplicação):** O `WorkerService` (ADR-022) periodicamente chama `fetchNextJobAndLock()` na `AbstractQueue` (porta da aplicação, ADR-020).
    2.  **Busca e Lock (Infraestrutura da Fila):** A implementação `DrizzleQueueFacade` (ADR-020) recebe a chamada. Ela interage com o `IJobRepository` (porta do domínio, ADR-011), cuja implementação `DrizzleJobRepository` (ADR-017) busca no banco de dados um job disponível que corresponda aos critérios do worker, aplica um lock (e.g., atualizando um campo `lockedBy` e `lockExpiresAt`) e retorna os dados do job.
    3.  **Reconstrução da Entidade (Infraestrutura da Fila/Domínio):** Se um job é encontrado, a `DrizzleQueueFacade` usa os dados para reconstruir uma instância da `JobEntity` (ADR-010).
    4.  **Instrumentação (Aplicação):** O `WorkerService` recebe a `JobEntity`. Ele a "instrumenta", o que significa que métodos como `addLog` e `updateProgress` na instância da entidade são interceptados pelo `WorkerService`. Quando a `ProcessorFunction` os chama, o `WorkerService` garante que estas atualizações sejam comunicadas de volta à `DrizzleQueueFacade` para serem persistidas no banco de dados (ADR-022).
    5.  **Renovação de Lock (Aplicação):** O `WorkerService` inicia um mecanismo para renovar periodicamente o lock do job (chamando `extendLock` na `AbstractQueue`), prevenindo que outro worker pegue o mesmo job se o processamento for longo.
    6.  **Invocação da `ProcessorFunction` (Aplicação):** O `WorkerService` invoca a `ProcessorFunction` apropriada para o tipo de job (registrada ou selecionada dinamicamente), passando a `JobEntity` instrumentada e acesso a serviços necessários como o `IConfigurationService` (ADR-031), conforme definido na **ADR-021**.
    7.  **Execução Interna da `ProcessorFunction` (Aplicação):**
        *   A `ProcessorFunction` (e.g., `GenericAgentExecutor`) executa a lógica principal do job.
        *   Pode consultar configurações (e.g., API keys de LLM) através do `IConfigurationService`.
        *   Pode executar um ciclo de interações, envolvendo:
            *   Uso de `IAgentTool` (porta para ferramentas que podem ser implementadas na infraestrutura ou serem puramente lógicas).
            *   Chamadas a `ILLMAdapter` (porta da aplicação, ADR-018) para interagir com modelos de linguagem (a implementação `OpenAILLMAdapter` reside na infraestrutura).
            *   Atualização do progresso e logs chamando `jobEntityInstrumentada.addLog()` e `jobEntityInstrumentada.updateProgress()`.
    8.  **Resultado do Processamento (Aplicação):** A `ProcessorFunction` retorna um resultado, que pode ser um objeto de sucesso com dados ou um objeto de erro (idealmente um `CoreError` ou subtipo, ADR-014).
    9.  **Finalização do Lock (Aplicação):** O `WorkerService` para o mecanismo de renovação de lock.
    10. **Atualização do Status do Job (Aplicação -> Infraestrutura da Fila -> Infraestrutura de Persistência):**
        *   Com base no resultado, o `WorkerService` chama `markJobAsCompleted()` ou `markJobAsFailed()` na `AbstractQueue`.
        *   A `DrizzleQueueFacade` recebe esta chamada e instrui o `IJobRepository` a atualizar o status final do job, seus logs acumulados, e o resultado (ou erro) no banco de dados.
    11. **Ciclo (Aplicação):** Se nenhum job foi encontrado, o `WorkerService` aguarda por um `pollingIntervalMs` e reinicia o ciclo.

Estes fluxos demonstram como as camadas interagem, respeitando a Regra de Dependência, e como as ADRs definem os contratos e comportamentos dos diferentes componentes do Project Wiz.

## 6. Nota sobre Componentes em Fase de Design/Pesquisa (Revisado)

A arquitetura do Project Wiz, conforme detalhada nas ADRs 001 a 031 e neste documento, estabelece uma base sólida para a maioria dos componentes centrais do sistema. Muitos aspectos, desde a persistência de dados (**ADR-017**), sistema de filas (**ADR-020**, **ADR-021**, **ADR-022**), injeção de dependência (**ADR-019**), até os padrões de UI (**ADR-025**, **ADR-026**, **ADR-027**) e comunicação IPC (**ADR-023**, **ADR-024**), foram formalizados.

No entanto, áreas que permanecem em desenvolvimento ativo e podem ter aspectos mais conceituais ou em fase de prototipação incluem:

*   **Mecanismos Avançados de Interação e Gerenciamento de Estado de Agentes de IA:**
    *   Enquanto o `GenericAgentExecutor` (**ADR-021**) e os serviços de job/worker (**ADR-020**, **ADR-022**) fornecem a infraestrutura para execução, os detalhes mais finos sobre o ciclo de vida completo de uma "Atividade" ou "Tarefa" de agente (conceitos que podem emergir acima de um `JobEntity`), estratégias complexas de composição e sequenciamento de `IAgentTool`, gerenciamento de contexto de memória de longo prazo para agentes, e a orquestração de múltiplos agentes colaborando em uma tarefa complexa ainda estão sendo ativamente pesquisados e projetados. As interfaces e abstrações atuais são projetadas para acomodar essa evolução.

*   **Ecossistema de Ferramentas (`IAgentTool`):**
    *   A interface `IAgentTool` e um `ToolRegistryService` são, no momento, mais conceituais do que implementações detalhadas. Embora a infraestrutura para um agente *executar algo* (uma ferramenta) esteja planejada, a definição de um conjunto rico e robusto de ferramentas específicas do Project Wiz, seus schemas de entrada/saída padronizados, versionamento, e como elas são descobertas, registradas e gerenciadas de forma segura ainda é uma área de expansão e futuras ADRs.

*   **Visualização e Monitoramento Avançado de Agentes e Jobs:**
    *   Enquanto o logging (**ADR-013**) e o rastreamento básico de status de jobs (**ADR-020**) estão definidos, interfaces de usuário ou sistemas dedicados para visualização detalhada do progresso de jobs complexos (especialmente aqueles executados por agentes de IA), monitoramento em tempo real da performance de agentes, depuração interativa de fluxos de execução de IA, e análise de resultados de múltiplos jobs são funcionalidades futuras que dependerão da evolução dos componentes de agente e ferramentas.

A abordagem arquitetural tem sido construir primeiro os pilares robustos e bem definidos da aplicação, permitindo que estas áreas mais especializadas e inovadoras (particularmente em torno da IA) sejam construídas sobre uma fundação estável e desacoplada. Novas ADRs serão criadas à medida que estes componentes mais avançados forem solidificando seu design e implementação.
