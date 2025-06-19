# 00: Visão Geral e Princípios da Arquitetura

## 1. Introdução

Este documento descreve a proposta de uma nova arquitetura para o sistema "project-wiz". O objetivo principal desta refatoração é modernizar a base de código, melhorar a Experiência do Desenvolvedor (DX), aumentar a manutenibilidade, testabilidade e escalabilidade do sistema a longo prazo.

A análise inicial do sistema revelou uma arquitetura emergente com alguns desafios:
- **Ausência de Injeção de Dependência (DI):** Apesar da biblioteca InversifyJS estar presente, ela não é utilizada, levando à instanciação manual de dependências, o que dificulta a substituição de componentes e o gerenciamento do ciclo de vida das dependências.
- **Múltiplos Componentes de Backend Desconectados:** Identificamos uma simulação de agente PO/CTO ativa e um sistema de Worker/Job mais robusto que não parecem estar integrados entre si nem totalmente conectados à UI principal de forma clara.
- **Clareza Arquitetural:** A separação de responsabilidades entre diferentes partes do sistema (domínio, aplicação, infraestrutura) pode ser significativamente melhorada.

A nova arquitetura visa resolver esses pontos, fornecendo uma estrutura coesa e bem definida que facilitará o desenvolvimento de novas funcionalidades e a manutenção do código existente. Os benefícios esperados incluem:
- **Maior Produtividade do Desenvolvedor:** Código mais fácil de entender, modificar e testar.
- **Redução de Bugs:** Tipagem forte, DI e separação clara de responsabilidades ajudam a prevenir erros.
- **Facilidade de Manutenção:** Componentes desacoplados podem ser atualizados ou substituídos com menor impacto no restante do sistema.
- **Melhor Escalabilidade:** Uma arquitetura modular permite que o sistema cresça de forma mais organizada.

## 2. Princípios da Nova Arquitetura

A nova arquitetura será guiada pelos seguintes princípios fundamentais:

1.  **Clean Architecture (Arquitetura Limpa):**
    *   **Independência de Frameworks:** O código de domínio e as regras de negócio não dependerão de frameworks de UI, banco de dados ou outros detalhes de infraestrutura.
    *   **Testabilidade:** As regras de negócio podem ser testadas sem UI, banco de dados, servidor web ou qualquer elemento externo.
    *   **Independência de UI:** A UI pode mudar facilmente, sem alterar o resto do sistema.
    *   **Independência de Banco de Dados:** O tipo de banco de dados pode ser trocado sem afetar as regras de negócio.
    *   **Regra de Dependência:** As dependências de código fonte só podem apontar para dentro. Nada em um círculo interno pode saber qualquer coisa sobre algo em um círculo externo.

    **Nota sobre Camadas Adicionais (Camada de Aplicação):**
    A arquitetura inicial foca em três camadas principais para clareza e simplicidade: Domínio (`src/domain`), Infraestrutura (`src/infrastructure`) e Compartilhada (`src/shared`). As responsabilidades que tradicionalmente pertencem a uma "Camada de Aplicação" (como DTOs específicos para casos de uso, orquestração de múltiplos casos de uso, ou regras de negócio que não são puramente do domínio nem detalhes de infraestrutura) são, neste momento, distribuídas (DTOs podem residir próximos aos seus casos de uso ou em `shared/dtos`, e a orquestração pode ser feita por casos de uso de nível mais alto no domínio). Conforme o sistema evoluir e a complexidade aumentar, uma camada `src/application` formal poderá ser introduzida para melhor organizar estas responsabilidades, seguindo os princípios da Clean Architecture.

2.  **Object Calisthenics:**
    *   Um conjunto de 9 regras de "exercício" para design de código orientado a objetos que promovem código limpo, legível e de fácil manutenção. Essas regras serão detalhadas e exemplificadas no documento [`07-object-calisthenics.md`](./07-object-calisthenics.md). O foco é em classes pequenas, coesas e com responsabilidades bem definidas.

3.  **Injeção de Dependência (DI) com InversifyJS:**
    *   Utilizaremos InversifyJS para gerenciar as dependências entre os componentes do sistema.
    *   Isso promoverá o desacoplamento, facilitará a substituição de implementações e melhorará a testabilidade, permitindo o uso de mocks/stubs para dependências externas.

4.  **Developer Experience (DX):**
    *   A arquitetura deve ser intuitiva e fácil para os desenvolvedores entenderem e trabalharem.
    *   Boas práticas de nomenclatura, estrutura de diretórios clara e documentação (como estes artefatos) são essenciais.

5.  **Domain-Driven Design (DDD) - Elementos:**
    *   Embora não seja uma implementação completa de DDD, utilizaremos conceitos como Entidades ricas em comportamento e Value Objects para modelar o domínio de forma mais eficaz.

6.  **Single Responsibility Principle (SRP):**
    *   Cada classe ou módulo deve ter uma, e somente uma, razão para mudar.

7.  **Don't Repeat Yourself (DRY):**
    *   Evitar a duplicação de código sempre que possível.
