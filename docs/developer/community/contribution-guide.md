# Guia de Contribuição para o Project Wiz

Agradecemos seu interesse em contribuir para o Project Wiz! Toda contribuição é bem-vinda, seja ela código, documentação, sugestões de funcionalidades ou relato de bugs.

Antes de começar, por favor, leia nosso [Código de Conduta](./code-of-conduct.md). Esperamos que todos os membros da comunidade sigam estas diretrizes para garantir um ambiente colaborativo e respeitoso.

Este guia fornece diretrizes para ajudar você a começar.

## Como Contribuir

Existem várias formas de contribuir:

*   **Relatando Bugs (Issues):**
    *   Se você encontrar um bug, por favor, verifique se já não existe uma issue aberta sobre ele.
    *   Se não houver, crie uma nova issue, fornecendo o máximo de detalhes possível:
        *   Passos para reproduzir o bug.
        *   Comportamento esperado vs. comportamento atual.
        *   Sua versão do sistema operacional e do Project Wiz (se aplicável).
        *   Screenshots ou logs relevantes.
*   **Sugerindo Melhorias ou Novas Funcionalidades (Issues):**
    *   Abra uma issue descrevendo sua sugestão, o problema que ela resolve ou o valor que ela agrega.
*   **Escrevendo ou Melhorando a Documentação:**
    *   A documentação é vital! Se você notar algo que está faltando, incorreto ou poderia ser mais claro, sinta-se à vontade para propor alterações.
*   **Contribuindo com Código:**
    *   Para correções de bugs ou implementação de novas funcionalidades. Veja as seções abaixo para mais detalhes.

## Contribuindo com Código

Se você deseja contribuir com código, siga estes passos:

1.  **Fork o Repositório:**
    *   Crie um fork do repositório principal do Project Wiz para sua conta no GitHub.

2.  **Clone seu Fork Localmente:**
    ```bash
    git clone https://github.com/SEU-USUARIO/project-wiz.git
    cd project-wiz
    ```

3.  **Crie uma Nova Branch:**
    *   Crie uma branch descritiva para sua feature ou correção:
        ```bash
        git checkout -b minha-nova-feature # Ex: feat/adicionar-nova-tool
        # ou
        git checkout -b correcao-de-bug   # Ex: fix/problema-no-login
        ```

4.  **Configure o Ambiente de Desenvolvimento:**
    *   Siga as instruções em [Configurando o Ambiente de Desenvolvimento](../developer/01-development-setup.md).

5.  **Faça suas Alterações:**
    *   Escreva seu código, seguindo os padrões de estilo e as convenções do projeto (veja abaixo).
    *   **Adicione testes** para suas alterações. Novas funcionalidades devem vir com testes, e correções de bugs devem incluir um teste que teria falhado antes da correção.

6.  **Verifique seu Código:**
    *   Execute o linter: `npm run lint` (e `npm run lint:fix` para correções automáticas).
    *   Execute os testes: `npm run test`. Certifique-se de que todos os testes passam.

7.  **Faça Commit das suas Alterações:**
    *   Use mensagens de commit claras e descritivas, seguindo o padrão de [Commits Semânticos](https://www.conventionalcommits.org/) se possível (ex: `feat: Adiciona nova Tool X`, `fix: Corrige problema de login ao usar Y`).
    ```bash
    git add .
    git commit -m "feat: Descrição da sua feature"
    ```

8.  **Envie suas Alterações para seu Fork:**
    ```bash
    git push origin minha-nova-feature
    ```

9.  **Abra um Pull Request (PR):**
    *   Vá para o repositório original do Project Wiz no GitHub.
    *   Clique em "New pull request".
    *   Escolha sua branch do seu fork para comparar com a branch principal do repositório original (geralmente `main` ou `develop`).
    *   Forneça um título claro e uma descrição detalhada do seu PR, explicando as alterações feitas e o problema que elas resolvem.
    *   Se seu PR resolve uma issue existente, mencione-a no PR (ex: "Closes #123").

10. **Revisão do Código:**
    *   Um ou mais mantenedores do projeto revisarão seu PR.
    *   Esteja preparado para discutir suas alterações e fazer ajustes se necessário.
    *   Após a aprovação e a passagem de quaisquer verificações de CI, seu PR será mesclado!

## Padrões de Código e Estilo

*   **Linguagem Principal:** TypeScript.
    *   Utilizamos a configuração `strict` ativada (`noImplicitAny`, `strictNullChecks`) para maior segurança de tipo.
    *   Path aliases como `@/components`, `@/lib` são utilizados para facilitar a importação.
    *   Priorize a tipagem forte; evite `any` sempre que possível e justifique seu uso se estritamente necessário.
*   **Formatação (Prettier):**
    *   O projeto utiliza Prettier para garantir consistência na formatação do código.
    *   Principais configurações: indentação de 2 espaços, aspas simples, ponto e vírgula opcional (verifique as configurações do Prettier no projeto para detalhes completos).
    *   Recomenda-se configurar seu editor para formatar ao salvar ou executar `npm run format` (se disponível).
*   **Linting (ESLint):**
    *   ESLint é usado para análise estática de código. A configuração base estende-se de `eslint:recommended`, `@typescript-eslint/recommended`, e `import/recommended`.
    *   Regras customizadas podem incluir permissões para non-null assertions, funções vazias e `explicit any` (com moderação e justificativa).
    *   O plugin `eslint-plugin-import` ajuda a manter a organização das importações.
    *   Execute `npm run lint` para verificar e `npm run lint:fix` para tentar correções automáticas.
*   **Convenções de Nomenclatura:**
    *   Use nomes claros, descritivos e em inglês para variáveis, funções, classes, arquivos e pastas.
    *   Pastas devem ser nomeadas em inglês.
*   **Controle de Versão (Git):**
    *   Faça commits pequenos e atômicos.
    *   Escreva mensagens de commit claras, descritivas e em inglês. Siga o padrão de [Commits Semânticos](https://www.conventionalcommits.org/) se possível (ex: `feat: Adiciona nova Tool X`, `fix: Corrige problema de login ao usar Y`).
*   **Comentários:** Comente código complexo ou não óbvio, mas evite comentários desnecessários para código autoexplicativo. Escreva comentários em inglês.

<<<<<<< HEAD
**Para um conjunto mais abrangente de diretrizes de desenvolvimento, incluindo boas práticas gerais, de arquitetura e específicas de tecnologias utilizadas no projeto, consulte o documento: [Padrões de Código e Diretrizes de Desenvolvimento](../developer/02-coding-standards.md) e o detalhado [Boas Práticas e Diretrizes de Desenvolvimento Detalhadas](../reference/02-best-practices.md).**
=======
**Para um conjunto mais abrangente de diretrizes de desenvolvimento, incluindo boas práticas gerais, de arquitetura e específicas de tecnologias utilizadas no projeto, consulte o documento: [Padrões de Código e Diretrizes de Desenvolvimento](../developer/02-coding-standards.md) e o detalhado [Boas Práticas e Diretrizes de Desenvolvimento Detalhadas](../reference/02-best-practices.md).** (Estes links serão válidos após a reestruturação completa da documentação).
>>>>>>> lint-tests

## Documentação e Decisões de Arquitetura

*   **Manutenção da Documentação:** Contribuições para a documentação (localizada na pasta `docs/`) são muito bem-vindas, seja para adicionar novos conteúdos, corrigir erros ou melhorar a clareza.
*   **ADRs (Architecture Decision Records):** Decisões importantes de arquitetura são documentadas usando ADRs, que também fazem parte da documentação do projeto. Consulte-os para entender o racional por trás de escolhas arquiteturais chave.

## Testes

*   Novas funcionalidades devem ser acompanhadas de testes unitários e/ou de integração.
*   Correções de bugs devem, idealmente, incluir um teste que demonstre o bug e verifique a correção.
<<<<<<< HEAD
*   Consulte o [Guia de Testes](../developer/03-testing-guide.md) para mais detalhes.
=======
*   Consulte o [Guia de Testes](../developer/03-testing-guide.md) para mais detalhes. (Este link será válido após a criação/movimentação do guia de testes).
>>>>>>> lint-tests

## Comunicação

*   Para discussões gerais ou dúvidas, utilize as Issues do GitHub ou canais de comunicação do projeto (se existirem, como um servidor Discord ou fórum).

Obrigado por considerar contribuir para o Project Wiz!
