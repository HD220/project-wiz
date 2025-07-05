# Padrões de Código e Diretrizes de Desenvolvimento

Manter um padrão de código consistente e seguir as diretrizes de desenvolvimento é crucial para a qualidade, legibilidade e manutenção do Project Wiz. Este documento resume os principais padrões de estilo e aponta para recursos mais detalhados.

## Princípios Fundamentais

No Project Wiz, seguimos os seguintes princípios de desenvolvimento de software:

*   **DRY (Don't Repeat Yourself):** Evite duplicação de código. Abstraia lógica comum em funções, classes ou módulos reutilizáveis.
*   **KISS (Keep It Simple, Stupid):** Mantenha as soluções o mais simples possível, mas não mais simples. Evite complexidade desnecessária.
*   **YAGNI (You Aren't Gonna Need It):** Implemente apenas o que é necessário agora. Evite adicionar funcionalidades ou abstrações especulativamente.
*   **Clean Code:** Escreva código que seja fácil de ler, entender e modificar.
*   **SOLID:**
    *   **S**ingle Responsibility Principle (Princípio da Responsabilidade Única): Classes e métodos devem ter uma responsabilidade única e bem definida.
    *   **O**pen/Closed Principle (Princípio Aberto/Fechado): Entidades devem ser abertas para extensão, mas fechadas para modificação.
    *   **L**iskov Substitution Principle (Princípio da Substituição de Liskov): Subtipos devem ser substituíveis por seus tipos base.
    *   **I**nterface Segregation Principle (Princípio da Segregação de Interfaces): Clientes não devem depender de interfaces que não utilizam.
    *   **D**ependency Inversion Principle (Princípio da Inversão de Dependência): Dependa de abstrações (interfaces/portas), não de implementações concretas.
*   **Nomenclatura Descritiva:** Use nomes claros, inequívocos e descritivos para variáveis, funções, classes e arquivos. Os nomes devem transmitir intenção e propósito.
*   **Falhar Rápido (Fail Fast):** Detecte erros o mais cedo possível e saia graciosamente. Valide entradas na primeira oportunidade para prevenir a propagação de estados inválidos.
*   **Operações Idempotentes:** Projete operações para serem idempotentes quando aplicável, significando que executá-las múltiplas vezes tem o mesmo efeito que executá-las uma vez.
*   **Dados Imutáveis:** Prefira estruturas de dados imutáveis quando possível. Evite modificar objetos ou arrays no local; em vez disso, crie novas instâncias com valores atualizados.
*   **Consciência de Performance:** Considere os impactos de performance das escolhas de código. Otimize caminhos críticos, reduza computações desnecessárias e minimize o consumo de recursos.
*   **Melhores Práticas de Segurança:** Esteja atento a vulnerabilidades de segurança. Sanitize todas as entradas do usuário, evite codificar informações sensíveis e siga diretrizes de codificação segura.
*   **Refatoração Regular:** Refatore continuamente o código para melhorar seu design, legibilidade e manutenibilidade. Não adie o débito técnico indefinidamente.
*   **Evitar Números Mágicos/Strings:** Substitua números ou strings codificados por constantes nomeadas ou variáveis de configuração para melhorar a legibilidade e manutenibilidade.
*   **Baixo Acoplamento, Alta Coesão:** Projete módulos para serem fracamente acoplados (minimize dependências entre eles) e altamente coesos (elementos dentro de um módulo são funcionalmente relacionados).
*   **Revisões de Código:** Participe e conduza revisões de código completas para pegar erros, compartilhar conhecimento e melhorar a qualidade do código.

Para uma discussão aprofundada sobre estes e outros princípios gerais, bem como diretrizes de arquitetura (Clean Architecture, Object Calisthenics) e práticas específicas para as tecnologias que usamos (Electron, React, TypeScript, Vite, Zod), consulte o nosso documento principal de Boas Práticas:

*   **[Boas Práticas e Diretrizes de Desenvolvimento Detalhadas](../reference/02-best-practices.md)**

## Padrões de Estilo de Código

### Linguagem Principal: TypeScript

*   Utilizamos a configuração `strict` ativada (`noImplicitAny`, `strictNullChecks`) para maior segurança de tipo.
*   Path aliases como `@/components`, `@/lib` são utilizados para facilitar a importação.
*   Priorize a tipagem forte; evite `any` sempre que possível e justifique seu uso se estritamente necessário.
*   **Aplicação de Tipos:** Defina explicitamente tipos para todas as variáveis, argumentos de função e valores de retorno.
*   **Interface/Type:** Use `interface` ou `type` para formas de objeto e tipos complexos.
*   **Propriedades Readonly:** Aplique `readonly` a propriedades que não devem ser reatribuídas após a inicialização.
*   **Enums vs. Tipos de União:** Prefira tipos de união (ex: `'status-ativo' | 'status-inativo'`) para um conjunto pequeno e fixo de valores literais conhecidos. Use `enum` para conjuntos distintos de constantes relacionadas com nomes simbólicos.
*   **Genéricos para Reusabilidade:** Empregue genéricos para criar componentes e funções reutilizáveis que mantêm a segurança de tipo através de diferentes tipos.
*   **Tratamento de Null e Undefined:** Trate explicitamente valores `null` ou `undefined` usando encadeamento opcional (`?.`), coalescência nula (`??`) ou guardas de tipo.
*   **Módulos ESM:** Sempre prefira a sintaxe de módulo ES (`import`/`export`).
*   **Opções Estritas do Compilador:** Assuma que as opções estritas do compilador TypeScript (ex: `strict: true`) estão habilitadas e escreva código compatível com elas.

### Formatação (Prettier)

*   O projeto utiliza Prettier para garantir consistência na formatação do código.
*   Principais configurações (verifique o arquivo de configuração do Prettier no projeto para detalhes completos, geralmente `.prettierrc.js` ou similar):
    *   Indentação: 2 espaços.
    *   Aspas: Simples (`singleQuote: true`).
    *   Ponto e vírgula: Sempre no final das instruções (`semi: true`).
*   Recomenda-se configurar seu editor para formatar ao salvar ou executar o script de formatação (ex: `npm run format`).
*   **Consistência na Formatação:** Adira a um estilo de formatação de código consistente. Mantenha indentação, espaçamento e posicionamento de chaves uniformes.

### Linting (ESLint)

*   ESLint é usado para análise estática de código e para impor padrões.
*   A configuração base geralmente estende-se de presets recomendados como `eslint:recommended`, `@typescript-eslint/recommended`, e `import/recommended`.
*   Verifique o arquivo de configuração do ESLint (ex: `eslint.config.js`) para regras específicas do projeto.
*   Execute `npm run lint` para verificar e `npm run lint:fix` para tentar correções automáticas.
*   **Instrução Crucial:** Após criar ou modificar um arquivo, **SEMPRE execute o ESLint (`npx eslint path/to/your/file.tsx --fix` ou o script do projeto `npm run lint`) e realize TODOS os ajustes e refatorações necessários para eliminar erros e avisos.** Não prossiga até que o arquivo esteja limpo de problemas de linting.

### Convenções de Nomenclatura

*   Use nomes claros, descritivos e em **inglês** para variáveis, funções, classes e pastas.
*   Pastas devem ser nomeadas em inglês.

### Convenções de Nomenclatura de Arquivos

*   **Todos os nomes de arquivos devem estar em kebab-case** (e.g., `meu-arquivo.ts`, `componente-perfil-usuario.tsx`).
*   Esta regra se aplica a todos os tipos de arquivo (.ts, .tsx, .md, .json, etc.), a menos que um framework ou biblioteca específica exija explicitamente uma convenção de nomenclatura diferente (e.g., roteamento de páginas Next.js, arquivos de configuração específicos como `vite.config.ts`). Tais exceções devem ser documentadas e justificadas.
*   **Exemplos:**
    *   **Bom:** `user-service.ts`, `calculadora-de-imposto.tsx`, `guia-de-contribuicao.md`, `configuracoes-aplicacao.json`
    *   **Ruim:** `UserService.ts`, `calculadoraDeImposto.tsx`, `GuiaDeContribuição.md`, `configuracoes_aplicacao.json`, `user.profile.component.ts`

### Controle de Versão (Git)

*   Faça commits pequenos e atômicos.
*   Escreva mensagens de commit claras, descritivas e em inglês. Siga o padrão de [Commits Semânticos](https://www.conventionalcommits.org/) (ex: `feat: Adiciona nova Tool X`, `fix: Corrige problema de login ao usar Y`).
*   **Disciplina de Controle de Versão:** Gerencie dependências do projeto explicitamente (ex: `package.json`). Mantenha as dependências atualizadas e monitore vulnerabilidades.

### Comentários

*   **Evite comentários o máximo possível.** O código deve ser autoexplicativo.
*   Se um comentário for *absolutamente necessário* (e.g., para explicar lógica de negócios complexa que não pode ser simplificada, ou um workaround temporário para um problema externo), ele deve explicar o *porquê* da lógica, não apenas o *o quê*.
*   Escreva comentários em inglês.
*   **Não use comentários para desabilitar código (linhas comentadas).** Se o código não é necessário, remova-o. O histórico do Git mantém versões anteriores.
*   **Não inclua um comentário no início de um arquivo indicando seu caminho.** Caminhos de arquivo são evidentes pelo IDE e controle de versão.
    *   **Não inclua um comentário no final de um arquivo indicando algo como `[fim do arquivo]` ou `[fim de X]`.** Estes são desnecessários e adicionam ruído visual.
*   **REMOVA TODOS OS COMENTÁRIOS EXPLICATIVOS PARA MODIFICAÇÕES DE CÓDIGO:** Após qualquer alteração, revise e remova quaisquer comentários adicionados para explicar a própria alteração (e.g., 'corrigido X', 'adicionado Y'). O histórico do Git serve a esse propósito. Comentários são permitidos apenas para explicar o *porquê* de uma lógica complexa que não pode ser simplificada, nunca o *o quê*.
*   **Priorize Clareza Sobre Comentários:** Em vez de comentar uma seção confusa do código, dedique tempo para refatorá-la até que se torne autoexplicativa. Nomes de variáveis, funções e classes bem escolhidos são sempre preferíveis a comentários. O código deve comunicar claramente sua intenção.

## Validação da Camada de Domínio (Entidades e Objetos de Valor)

*   **Autovalidação:** Entidades e Objetos de Valor (VOs) na Camada de Domínio (`src_refactored/core/domain/`) são responsáveis por garantir sua própria consistência interna e aderir a invariantes de negócios. Eles devem validar seus dados na criação ou em mudanças significativas de estado.
*   **Zod para Validação de Domínio:** Zod é a biblioteca padrão para definir esquemas de validação dentro da Camada de Domínio.
    *   VOs devem usar esquemas Zod em seus métodos de fábrica `create` (ou construtores, se a instanciação direta for permitida) para validar dados de entrada. Em caso de falha na validação, um `ValueError` (de `@/domain/common/errors`) deve ser lançado, idealmente contendo os detalhes do erro Zod achatados.
    *   Entidades também devem usar esquemas Zod em seus métodos de fábrica `create` para validar o conjunto inicial de VOs e quaisquer props primitivas. Para métodos que alteram o estado, as entidades devem garantir que o novo estado seja válido de acordo com suas invariantes, potencialmente usando Zod para validação de regras complexas. Falhas de validação no nível da entidade devem resultar no lançamento de um `EntityError` ou um `DomainError` mais específico.
*   **Confiança do Caso de Uso na Validação do Domínio:**
    *   Casos de Uso da Camada de Aplicação continuarão a usar Zod para validar a forma e a presença de seus DTOs de entrada.
    *   No entanto, para validação de regras de negócios e a consistência interna de objetos de domínio, os casos de uso dependerão da validação realizada pelos próprios VOs e Entidades.
    *   Se a criação/atualização de um VO ou Entidade falhar dentro de um caso de uso devido a um erro de validação lançado pelo objeto de domínio, o caso de uso deve capturar esse `ValueError`, `EntityError` ou `DomainError`. O caso de uso então mapeará esse erro para o DTO de erro padrão e o retornará como parte da `IUseCaseResponse`.
*   **Benefícios:** Esta abordagem centraliza a validação de regras de negócios dentro dos próprios objetos de domínio, tornando o domínio mais rico e robusto. Reduz a duplicação da lógica de validação em casos de uso e garante que objetos de domínio não possam existir em um estado inválido.

## Padrão de Resposta e Tratamento de Erros de Caso de Uso

*   **DTO de Resposta Padronizado:** Todos os Casos de Uso da Camada de Aplicação (`src_refactored/application/use-cases/`) devem retornar um objeto de resposta padronizado em conformidade com a interface `IUseCaseResponse<TOutput, TErrorDetails>` (definida em `src_refactored/shared/application/use-case-response.dto.ts`).
    *   Este DTO inclui uma flag `success: boolean`, um campo opcional `data: TOutput` (para respostas bem-sucedidas) e um campo opcional `error: TErrorDetails` (para respostas falhas).
    *   `TErrorDetails` é um objeto contendo `name`, `message`, e opcionalmente `code` e `details` para o erro.
*   **Implementação via `UseCaseWrapper` (Decorator):** Este padrão é implementado centralmente por um decorador `UseCaseWrapper`.
    *   Classes de Caso de Uso concretas devem focar apenas na lógica de negócios e orquestração. Elas devem lançar exceções (e.g., `ZodError` para validação de entrada, subtipos de `CoreError` para erros de negócios/domínio) quando as operações não puderem prosseguir como esperado.
    *   Casos de Uso concretos retornam `successUseCaseResponse(data)` diretamente após a conclusão bem-sucedida.
    *   O `UseCaseWrapper` é responsável por:
        1.  Executar o Caso de Uso concreto dentro de um bloco `try/catch`.
        2.  Registrar qualquer erro capturado com seu contexto completo.
        3.  Mapear a exceção capturada (e.g., `ZodError`, `CoreError`, `Error` genérico) para a estrutura `IUseCaseErrorDetails`.
        4.  Retornar um `IUseCaseResponse` com `success: false` e o campo `error` preenchido, ou encaminhar a resposta de sucesso do Caso de Uso concreto.
*   **Referência ADR:** Este padrão, incluindo a estratégia de implementação do `UseCaseWrapper` e a hierarquia `CoreError`, está formalmente documentado em **ADR-008: Padrão de Tratamento de Erros e Resposta para Casos de Uso**. A adesão a este ADR é mandatória.
*   **Benefícios:** Esta abordagem garante DRY, promove SRP mantendo Casos de Uso limpos de tratamento de erro boilerplate, fornece um contrato consistente para consumidores e centraliza a lógica de registro e mapeamento de erros.

## Melhores Práticas Específicas de Tecnologia/Ferramenta

### Electron.js
*   **Separar Processos Principal e de Renderização:** Separe estritamente a lógica. O processo principal lida com o ciclo de vida do aplicativo e APIs nativas. Processos de renderização lidam com a UI. Evite misturar preocupações.
*   **Comunicação IPC:** Use `ipcMain` e `ipcRenderer` para toda comunicação entre os processos principal e de renderização. Defina nomes de canal claros e descritivos e envie apenas os dados necessários.
*   **Melhores Práticas de Segurança:** Implemente segurança estrita: habilite `contextIsolation`, desabilite `nodeIntegration` em processos de renderização e use scripts de preload para expor apenas APIs seguras via `contextBridge`.
*   **Scripts de Preload:** Toda comunicação interprocessos (IPC) para processos de renderização deve ser tratada via um script de preload seguro. Não exponha APIs Node.js diretamente ao renderizador.
*   **Uso do Context Bridge:** Exponha apenas funções e objetos específicos e seguros do processo principal para o renderizador via `contextBridge` no script de preload. Evite expor `ipcRenderer` diretamente.
*   **Manuseio de Recursos:** Gerencie recursos da aplicação (arquivos, conexões de banco de dados) primariamente no processo principal. Renderizadores devem solicitar esses recursos via IPC.
*   **Considerações de Performance:** Otimize o tempo de inicialização e o uso de recursos. Carregue módulos preguiçosamente, minimize operações síncronas e gerencie a memória eficientemente, especialmente para múltiplas janelas.
*   **Tratamento de Erros e Logging:** Implemente tratamento de erros robusto em ambos os processos. Centralize o logging para erros do principal e do renderizador para facilitar a depuração.
*   **Integração de Módulo Nativo:** Ao usar módulos Node.js nativos, garanta que sejam corretamente reconstruídos para Electron e manuseados exclusivamente no processo principal.

### React
*   **Componentes Funcionais & Hooks:** Sempre use componentes funcionais e React Hooks (useState, useEffect, useContext, useCallback, useMemo, etc.) para gerenciamento de estado e efeitos colaterais. Evite componentes de classe.
*   **Estrutura de Componentes:** Organize componentes logicamente (e.g., Atomic Design). Cada componente deve idealmente aderir ao Princípio da Responsabilidade Única, fazendo uma coisa bem. Quebre componentes complexos.
*   **Evitar Prop Drilling:** Minimize o "prop drilling". Para dados profundamente aninhados, considere `useContext` ou uma biblioteca de gerenciamento de estado dedicada.
*   **Memoização para Performance:** Use `React.memo`, `useCallback` e `useMemo` criteriosamente para prevenir re-renderizações desnecessárias de componentes, funções e cálculos caros.
*   **Prop Key para Listas:** Sempre forneça uma prop `key` estável e única ao renderizar listas de elementos. A chave deve idealmente ser derivada do ID do item, não do seu índice.
*   **Acessibilidade (A11y):** Priorize a acessibilidade web. Use HTML semântico, atributos `aria-*` onde necessário, e garanta navegação por teclado e compatibilidade com leitores de tela.
*   **Renderização Condicional:** Use técnicas de renderização condicional claras e legíveis.
*   **Gerenciamento de Estado:** Gerencie o estado local do componente com `useState`. Para estado compartilhado ou global, avalie `useContext` ou uma biblioteca de gerenciamento de estado.
*   **Hooks Customizados para Reuso de Lógica:** Extraia lógica reutilizável e com estado para Hooks customizados. Nomeie-os começando com `use`.
*   **Efeitos Colaterais com useEffect:** Manipule todos os efeitos colaterais (busca de dados, inscrições, manipulações do DOM) dentro de hooks `useEffect`. Garanta arrays de dependência corretos para prevenir loops infinitos ou closures obsoletas.

### Vite.js
*   **Recursos Nativos do Vite:** Utilize as importações de módulo ES nativas do Vite para Hot Module Replacement (HMR) rápido e servidor de desenvolvimento.
*   **Configuração (vite.config.ts):** Mantenha `vite.config.ts` limpo e mínimo. Use plugins para funcionalidade estendida.
*   **Manuseio de Ativos:** Gerencie ativos estáticos usando o manuseio de ativos embutido do Vite. Use a pasta `public` para ativos estáticos que precisam ser servidos diretamente.
*   **Variáveis de Ambiente:** Use `import.meta.env` para acessar variáveis de ambiente, seguindo a convenção do Vite (prefixo `VITE_`).

### Zod
*   **Abordagem Schema First:** Sempre defina um esquema Zod para validação de entrada antes de processar quaisquer dados externos.
*   **Esquemas de Objeto Estritos:** Prefira `z.object().strict()` para esquemas de objeto para proibir chaves desconhecidas por padrão.
*   **Inferência de Tipo:** Utilize `z.infer<typeof seuSchema>` do Zod para derivar tipos TypeScript diretamente de seus esquemas.
*   **Refinamento para Lógica Complexa:** Use `z.refine()` ou `z.superRefine()` para lógica de validação complexa.
*   **Customização de Mensagem de Erro:** Forneça mensagens de erro customizadas descritivas.
*   **Campos Opcionais e Anuláveis:** Distinga claramente entre campos opcionais (`z.optional()`), anuláveis (`z.nullable()`) e padrão (`z.default()`).
*   **Transformações (`.transform()`):** Use `.transform()` para transformações de dados *após* a validação.
*   **Validação em Endpoints de API/Pontos de Entrada:** Realize a validação Zod no ponto de entrada mais cedo possível para dados externos.

## Qualidade do Código e Refatoração

*   **Testes:** Novas funcionalidades devem ser acompanhadas de testes unitários e/ou de integração. Correções de bugs devem, idealmente, incluir um teste que demonstre o bug e verifique a correção. Consulte o [Guia de Testes](./03-testing-guide.md) (a ser criado/movido).
*   **Revisão de Código:** Todos os Pull Requests devem ser revisados por pelo menos um outro desenvolvedor.
*   **Refatoração Contínua:** Dedique tempo para refatorar o código e reduzir o débito técnico.

Ao aderir a esses padrões e diretrizes, contribuímos para um projeto mais robusto, colaborativo e sustentável. Lembre-se de consultar o [documento detalhado de Boas Práticas](../reference/02-best-practices.md) para um entendimento mais profundo.
