# Camada Domain — Visão Geral

## Estrutura da Camada Domain

A camada **Domain** representa o núcleo da lógica de negócio da aplicação, modelando conceitos essenciais de forma independente de frameworks, tecnologias ou detalhes de infraestrutura. Ela está organizada nas seguintes pastas:

### `entities/`
Contém as **Entidades**, que representam objetos do domínio com identidade própria e ciclo de vida definido. São responsáveis por encapsular regras de negócio relacionadas a si mesmas.

### `value-objects/`
Agrupa os **Value Objects**, que são objetos imutáveis, sem identidade, usados para representar conceitos ou atributos do domínio (ex: parâmetros de prompt, configurações). Garantem consistência e validação de dados.

### `contracts/`
Define **Contratos** e **tipos compartilhados** entre entidades, serviços e value objects. São estruturas que padronizam a comunicação e a troca de dados dentro da camada Domain.

### `services/`
Reúne **Serviços de Domínio**, que encapsulam regras de negócio que não pertencem a uma única entidade ou value object. São funções ou classes puras, focadas em operações específicas do domínio.

### `ports/`
Contém as **Portas (Interfaces)** que definem contratos para comunicação com o mundo externo (ex: repositórios, serviços de LLM, workers). Essas interfaces permitem a inversão de dependência, desacoplando a camada Domain das implementações concretas.

---

## Princípios Arquiteturais

A organização da camada Domain segue os princípios da **Clean Architecture**, **SOLID** e **Clean Code**:

- **Independência**: a camada Domain não depende de frameworks, bibliotecas externas ou detalhes de infraestrutura, facilitando testes, manutenção e evolução.
- **Isolamento da Regra de Negócio**: toda a lógica central está concentrada aqui, protegida de mudanças em outras camadas.
- **Inversão de Dependência (DIP)**: a comunicação com o exterior ocorre via interfaces (ports), permitindo trocar implementações sem afetar o domínio.
- **Responsabilidade Única (SRP)**: cada entidade, value object, serviço ou contrato tem uma responsabilidade clara e única.
- **Código Limpo**: nomes descritivos, organização modular e foco na simplicidade para facilitar entendimento e colaboração.

---

## Independência da Camada Domain

A camada Domain é **totalmente independente** das demais camadas da aplicação (Application, Infrastructure, UI). Ela define o **coração do sistema**, podendo ser reutilizada ou testada isoladamente, sem dependências externas.

Essa independência garante que mudanças em frameworks, tecnologias ou integrações não afetem a lógica de negócio central.

---

## Pendências Conhecidas

- **Tipagem Estrita**: ainda existem pontos onde o tipo `any` é utilizado em contratos ou value objects. Está planejada a substituição gradual por tipos mais específicos e seguros, reforçando a robustez da camada Domain.

---

## Objetivo da Documentação

Este documento visa facilitar o entendimento da estrutura da camada Domain, orientando a manutenção e evolução futura do projeto, alinhada às melhores práticas de arquitetura e desenvolvimento.