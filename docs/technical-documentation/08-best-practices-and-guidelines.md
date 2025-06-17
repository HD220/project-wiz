# Boas Práticas e Diretrizes de Desenvolvimento

Esta seção consolida diversos guias de boas práticas e regras de desenvolvimento que são relevantes para o trabalho no Project Wiz. Estes documentos foram originados da pasta `.roo/rules/` e adaptados para esta documentação.

Consultar estas diretrizes pode ajudar a manter a qualidade, consistência e manutenibilidade do código.

## Guias de Boas Práticas de Codificação:

*   **Gerais:**
    *   [20 Regras Comuns de Desenvolvimento](./bp-20-common-dev-rules.md)
    *   [Princípios de Clean Architecture](./bp-clean-architecture-rules.md)
    *   [Clean Code: Object Calisthenics](./bp-clean-code-object-calisthenics.md) - A adesão a estes princípios é ativamente monitorada através de revisões de código e processos de refatoração, visando a melhoria contínua da qualidade e manutenibilidade do código.

*   **Específicas de Tecnologias/Ferramentas:**
    *   [Diretrizes para Electron.js](./bp-electronjs-rules.md)
    *   [Diretrizes para React](./bp-react-rules.md)
    *   [Diretrizes para TypeScript](./bp-typescript-rules.md)
    *   [Diretrizes para Vite.js](./bp-vitejs-rules.md)
    *   [Diretrizes para Zod](./bp-zod-rules.md)

Recomenda-se que os desenvolvedores se familiarizem com estas diretrizes, especialmente aquelas relevantes para as tecnologias que estão utilizando no projeto.

## Práticas de Manutenção do Projeto

### Gerenciamento de Código Obsoleto e Cleanup

Manter a base de código limpa e livre de componentes obsoletos é crucial para a saúde do projeto a longo prazo. As seguintes práticas são recomendadas com base nas auditorias do processo de cleanup:

*   **Manutenção de Histórico de Código Obsoleto:**
    *   Manter um registro dos arquivos e componentes que foram removidos.
    *   Incluir a justificativa para sua obsolescência (por exemplo, em um arquivo `OBSOLETE_COMPONENTS.md` ou similar na documentação do projeto).
*   **Documentação do Processo de Cleanup:**
    *   O processo de identificação, análise e remoção de código obsoleto deve ser documentado.
    *   Considerar o uso de templates para listar arquivos e componentes candidatos à remoção.
    *   Documentar como lidar com cenários de exceção, como componentes compartilhados ou com dependências não óbvias.
*   **Rastreabilidade da Obsolescência:**
    *   Ao marcar arquivos ou componentes como obsoletos, deve haver uma ligação clara (referência a ADRs, issues, ou decisões de design) com a justificativa arquitetural ou de negócio que levou à decisão.
*   **Validação Cruzada e Backup:**
    *   Antes da exclusão em massa de código, realizar análises de dependências estáticas (quando possível) para confirmar a não utilização.
    *   Sempre realizar backups ou garantir que o sistema de controle de versão permita um rollback fácil (e.g., criar tags git) antes de grandes remoções.
*   **Automação e Ferramentas:**
    *   Considerar a criação de scripts para auxiliar na geração de listas de arquivos candidatos à obsolescência ou para validar caminhos e permissões antes da exclusão.

Adotar estas práticas ajuda a garantir que o processo de cleanup seja seguro, rastreável e bem compreendido pela equipe.
