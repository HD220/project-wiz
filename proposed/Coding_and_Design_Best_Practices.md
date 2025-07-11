# Guia de Boas Práticas de Codificação e Design

Este documento estabelece as diretrizes e padrões para a codificação e o design de software dentro do Project Wiz. O objetivo é garantir a qualidade, manutenibilidade, escalabilidade e consistência do código-fonte gerado pelos agentes de IA e desenvolvido por humanos.

## 1. Padrões de Design e Princípios de Codificação Recomendados

O design da arquitetura e a organização do código devem priorizar a clareza, a manutenibilidade e a redução de boilerplate, seguindo os princípios do Object Calisthenics. Embora padrões como Clean Architecture e DDD sejam valiosos, a aplicação deve ser flexível e adaptada às necessidades específicas do projeto, sem aderir cegamente a um modelo rígido.

## 2. Conceitos de Arquitetura

*   **2.2 Injeção de Dependência (DI) via Construtor:**
    *   **Princípio:** As dependências de uma classe DEVE ser passadas para ela através do seu construtor, em vez de serem criadas internamente. Isso promove o baixo acoplamento, tornando o código mais modular, testável e fácil de manter.
    *   **Aplicação:** Evitar o uso de contêineres ou bibliotecas de DI. A injeção DEVE ser feita manualmente, garantindo que as classes recebam apenas o que precisam para funcionar, sem conhecimento de como essas dependências são construídas.



*   **3.1 Princípios SOLID:**
    *   **S (Single Responsibility Principle):** Cada classe ou módulo DEVE ter apenas uma razão para mudar.
    *   **O (Open/Closed Principle):** Entidades de software (classes, módulos, funções, etc.) DEVE ser abertas para extensão, mas fechadas para modificação.
    *   **L (Liskov Substitution Principle):** Subtipos DEVE ser substituíveis por seus tipos base sem alterar a correção do programa.
    *   **I (Interface Segregation Principle):** Clientes não DEVE ser forçados a depender de interfaces que não usam.
    *   **D (Dependency Inversion Principle):** Módulos de alto nível não DEVE depender de módulos de baixo nível. Ambos DEVE depender de abstrações.

*   **3.2 DRY (Don't Repeat Yourself):** Evitar duplicação de código. Promover a reutilização de componentes e lógica.

*   **3.3 Código Legível e Autoexplicativo:**
    *   Nomes de variáveis, funções e classes DEVE ser descritivos e refletir seu propósito.
    *   Funções DEVE ser pequenas e fazer apenas uma coisa.
    *   Evitar comentários excessivos; o código DEVE ser autoexplicativo. Comentários DEVE ser usados para explicar o *porquê*, não o *o quê*.

## 4. Convenções de Nomenclatura e Formatação de Código

*   **4.1 Nomenclatura:**
    *   **Variáveis e Funções:** `camelCase` (ex: `userName`, `calculateTotalAmount`).
    *   **Classes e Tipos:** `PascalCase` (ex: `UserEntity`, `ProductService`).
    *   **Constantes Globais:** `SCREAMING_SNAKE_CASE` (ex: `API_KEY`, `MAX_RETRIES`).
    *   **Arquivos:** `kebab-case` (ex: `user-repository.ts`, `product-entity.ts`, `my-component.tsx`).

*   **4.2 Formatação:**
    *   Utilizar ferramentas de formatação automática (ex: Prettier, configurado via ESLint) para garantir consistência.
    *   Indentações consistentes (2 ou 4 espaços, conforme configuração do projeto).
    *   Quebras de linha e espaçamento para melhorar a legibilidade.

## 5. Estratégias de Teste

*   **5.1 Testes de Integração:**
    *   **Foco:** Testar a interação entre diferentes módulos e componentes do sistema, priorizando o uso de implementações reais em vez de mocks, exceto quando estritamente necessário (ex: integração com APIs externas de LLM).
    *   **Ferramentas:** Vitest (para TypeScript/JavaScript).
    *   **Cobertura:** Focar na cobertura de fluxos de trabalho completos e interações entre os componentes.

## 6. Tratamento de Erros

*   **6.1 Erros Explícitos:** Utilizar classes de erro personalizadas para diferentes tipos de falhas (ex: `NotFoundError`, `ValidationError`, `DomainError`).
*   **6.2 Propagação de Erros:** Erros DEVE ser propagados de forma clara através das camadas, com tratamento adequado no ponto de origem e no ponto de consumo.
*   **6.3 Logging:** Utilizar a biblioteca Pino.js para registrar logs de forma eficiente e com baixo overhead, garantindo detalhes suficientes para depuração sem expor informações sensíveis.

## 7. Documentação

*   **7.1 Documentação de Código:** Utilizar JSDoc/TSDoc para documentar funções, classes, parâmetros e retornos.
*   **7.2 Documentação de Arquitetura:** Manter diagramas e descrições arquiteturais atualizados (como este conjunto de documentos).
*   **7.3 READMEs:** Cada módulo ou componente principal DEVE ter um `README.md` explicando seu propósito, como usá-lo e como testá-lo.
