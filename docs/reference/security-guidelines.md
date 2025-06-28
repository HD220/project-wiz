# Guia: Diretrizes de Segurança

Este documento descreve as principais diretrizes e considerações de segurança a serem observadas durante o desenvolvimento do Project Wiz. A segurança é um aspecto crucial, especialmente ao lidar com código-fonte, APIs externas e automação de tarefas de desenvolvimento.

## Princípios Gerais de Segurança

*   **Mínimo Privilégio:** Os componentes do sistema, incluindo Agentes e Tools, devem operar com o mínimo de permissões necessárias para realizar suas tarefas.
*   **Defesa em Profundidade:** Aplicar múltiplas camadas de segurança.
*   **Segurança por Design (Security by Design):** Considerar a segurança desde as fases iniciais do design de funcionalidades e arquitetura.
*   **Manter Dependências Atualizadas:** Monitorar e atualizar regularmente as dependências do projeto para corrigir vulnerabilidades conhecidas.

## Diretrizes Específicas Implementadas/Planejadas

As seguintes práticas de segurança são relevantes para o Project Wiz, baseadas nas informações de conhecimento do projeto:

*   **Content Security Policy (CSP):**
    *   Implementação de CSP com o uso de "nonce" dinâmico para mitigar riscos de cross-site scripting (XSS) nas interfaces web (processo renderer do Electron).
*   **Geração Segura de Tokens:**
    *   Quaisquer tokens gerados ou gerenciados pelo sistema (ex: para autenticação de API, sessões) devem seguir práticas seguras de geração, armazenamento e transmissão.
*   **Validação Rigorosa de Inputs:**
    *   Toda entrada de dados proveniente de fontes externas (usuários, APIs, arquivos de configuração, payloads de Job) deve ser rigorosamente validada.
    *   A biblioteca [Zod](./05-database-schema.md) (mencionada em "Tratamento de Erros" e usada para schema de banco de dados) é uma excelente ferramenta para essa finalidade e deve ser usada para validar a estrutura e o tipo de dados de entrada. Veja também [Diretrizes para Zod](./bp-zod-rules.md).

## Outras Considerações de Segurança para Aplicações Electron

*   **Context Isolation e Preload Scripts:** Conforme detalhado em [Diretrizes para Electron.js](./bp-electronjs-rules.md), `contextIsolation` deve ser habilitado e `nodeIntegration` desabilitado nos renderers. APIs seguras devem ser expostas via `contextBridge` em scripts de preload.
*   **Permissões do Sistema de Arquivos:** Tools que interagem com o sistema de arquivos (`FilesystemTool`) devem ter suas permissões cuidadosamente gerenciadas, especialmente se operarem com base em input do usuário ou de LLMs.
*   **Execução de Comandos (`TerminalTool`):** A `TerminalTool` deve ser usada com extrema cautela, com validação rigorosa dos comandos a serem executados para prevenir injeção de comandos.
*   **Gerenciamento de Chaves de API:** Chaves de API para serviços externos (LLMs, GitHub) devem ser armazenadas e gerenciadas de forma segura, preferencialmente não em texto plano no código ou em arquivos de configuração não protegidos. O uso de variáveis de ambiente (conforme `docs/technical-documentation/06-development-setup.md`) é um primeiro passo. Soluções mais robustas podem ser consideradas para produção.

## Conclusão

A segurança é uma responsabilidade compartilhada. Todos os contribuidores devem estar cientes das implicações de segurança de suas alterações. Este documento serve como um lembrete das principais diretrizes e será expandido conforme necessário.

Para mais informações sobre práticas específicas de tecnologias, consulte os respectivos guias de boas práticas. Em caso de descoberta de uma vulnerabilidade, por favor, reporte-a de forma responsável aos mantenedores do projeto.
