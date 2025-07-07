# ADR-030: Diretrizes de Segurança da Aplicação

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A segurança é um aspecto crítico de qualquer aplicação, especialmente uma aplicação desktop que pode ter acesso a recursos do sistema e dados do usuário. Esta ADR consolida as diretrizes de segurança a serem seguidas em todo o Project Wiz, abrangendo desde a configuração do Electron até o tratamento de dados e dependências. Ela complementa as decisões de segurança específicas em ADR-023 (Electron Main Process) e ADR-024 (IPC & Preload).

**Decisão:**

As seguintes diretrizes de segurança DEVEM ser implementadas e seguidas:

**1. Configuração Segura do Electron (Reforço do ADR-023):**
    *   **`contextIsolation: true` (OBRIGATÓRIO):** Deve ser mantido como `true` em todas as `webPreferences` de `BrowserWindow`.
    *   **`nodeIntegration: false` (OBRIGATÓRIO):** Deve ser mantido como `false` em todas as `webPreferences`.
    *   **`preload: script` (OBRIGATÓRIO):** Um script de preload deve ser usado para expor APIs IPC de forma segura (ver ADR-024).
    *   **`webSecurity: true` (ALTAMENTE RECOMENDADO):** Manter o padrão (`true`). Desabilitar apenas com justificativa de segurança muito forte e análise de risco.
    *   **`allowRunningInsecureContent: false` (ALTAMENTE RECOMENDADO):** Manter o padrão (`false`).
    *   **Content Security Policy (CSP):**
        *   **Padrão:** Implementar uma Content Security Policy (CSP) restritiva no processo principal via `session.defaultSession.webRequest.onHeadersReceived`.
        *   **Política Inicial Sugerida (a ser refinada):**
            ```
            // default-src 'self'; // Restringe tudo (scripts, imagens, etc.) à mesma origem
            // script-src 'self'; // Permite scripts apenas da mesma origem (Vite pode precisar de ajustes em dev com HMR)
            // style-src 'self' 'unsafe-inline'; // Permite estilos da mesma origem e inline (Tailwind/Shadcn podem usar inline)
            // img-src 'self' data:; // Permite imagens da mesma origem e data URIs
            // connect-src 'self'; // Restringe conexões XHR/fetch/WebSocket à mesma origem
            // form-action 'self'; // Restringe para onde formulários podem enviar
            // object-src 'none'; // Desabilita plugins como Flash
            // frame-ancestors 'none'; // Previne clickjacking
            // base-uri 'self';
            ```
            *Nota: Em desenvolvimento com Vite e HMR, `script-src` e `style-src` podem precisar de `'unsafe-eval'` ou nonces/hashes, o que deve ser restrito apenas ao ambiente de desenvolvimento.*
        *   **Justificativa:** CSP é uma camada de defesa crucial contra ataques de Cross-Site Scripting (XSS) e injeção de dados.
    *   **Gerenciamento de Permissões:** Usar `session.setPermissionRequestHandler` para interceptar e aprovar/negar programaticamente requisições de permissões (e.g., notificações, acesso a dispositivos), idealmente solicitando consentimento explícito do usuário.
    *   **Justificativa:** Garante que a aplicação siga as melhores práticas de segurança do Electron desde a sua fundação.

**2. Segurança na Comunicação IPC (Reforço do ADR-024):**
    *   **Validação de Entradas (OBRIGATÓRIO):** Todos os dados recebidos de um processo de renderização em um handler IPC do processo principal DEVEM ser rigorosamente validados usando esquemas Zod antes de serem processados ou passados para serviços/casos de uso.
    *   **API Mínima no Preload:** Expor apenas a funcionalidade IPC estritamente necessária ao renderer através do `contextBridge`. Não expor `ipcRenderer` completo ou módulos Node.js.
    *   **Validação do Remetente (Opcional Avançado):** Para canais IPC particularmente sensíveis, pode-se considerar a validação de `event.senderFrame.url` no handler do processo principal para garantir que a mensagem se origina de um contexto esperado. No entanto, `contextIsolation` já oferece uma forte proteção.
    *   **Justificativa:** Previne que dados malformados ou maliciosos do renderer explorem vulnerabilidades no processo principal.

**3. Validação de Todas as Entradas Externas:**
    *   **Padrão:** Além das entradas IPC, qualquer dado que entre no sistema de uma fonte externa (e.g., respostas de APIs de terceiros, conteúdo de arquivos lidos do disco, configurações carregadas) DEVE ser validado (preferencialmente com Zod) antes de ser processado pela lógica de negócios.
    *   **Justificativa:** Garante a integridade e a forma esperada dos dados, prevenindo erros e potenciais vetores de ataque.

**4. Codificação e Sanitização de Saídas (Output Encoding/Sanitization):**
    *   **Padrão:**
        *   React geralmente lida bem com a prevenção de XSS ao renderizar strings. No entanto, EVITAR o uso de `dangerouslySetInnerHTML`.
        *   Se for necessário gerar HTML dinamicamente fora do React (e.g., para exportações, relatórios), utilizar bibliotecas de sanitização confiáveis para limpar qualquer conteúdo gerado pelo usuário ou externo antes de renderizá-lo como HTML.
        *   Para dados exibidos em outros contextos (e.g., logs, outras UIs), certifique-se de que a codificação apropriada seja aplicada se houver risco de interpretação maliciosa (e.g., newlines em logs sendo usados para forjar entradas).
    *   **Justificativa:** Prevenção de ataques de Cross-Site Scripting (XSS) e outras vulnerabilidades de injeção.

**5. Manuseio e Armazenamento Seguro de Dados:**
    *   **Dados Sensíveis (PII, Chaves de API, Tokens):**
        *   **NÃO HARDCODAR:** Segredos nunca devem ser codificados diretamente no código-fonte.
        *   **Variáveis de Ambiente:** Usar variáveis de ambiente para chaves de API de serviços de build/desenvolvimento, gerenciadas de forma segura fora do repositório (e.g., arquivos `.env` não versionados, segredos de CI/CD).
        *   **Configurações do Usuário (e.g., Chave LLM do Usuário):** Para segredos fornecidos pelo usuário e armazenados localmente (como a `apiKey` em `LLMProviderConfig`), utilizar `electron.safeStorage` para criptografá-los quando armazenados no disco do usuário. A descriptografia deve ocorrer apenas quando necessário em memória.
        *   **Tokens de Sessão:** Se aplicável, devem ser armazenados de forma segura (e.g., `HttpOnly` cookies se fosse uma aplicação web, ou mecanismos seguros no contexto desktop) e transmitidos apenas sobre HTTPS (para chamadas de API externas).
    *   **Logging de Dados Sensíveis:** Conforme ADR-013, NUNCA logar dados sensíveis em plain text. Implementar redação ou anonimização.
    *   **Princípio do Menor Privilégio:** Processos e componentes devem ter acesso apenas aos dados estritamente necessários para suas funções.
    *   **Justificativa:** Protege informações confidenciais contra acesso não autorizado, vazamento ou roubo.

**6. Gerenciamento de Dependências:**
    *   **Padrão:**
        *   Realizar auditorias de segurança das dependências do projeto regularmente usando `npm audit fix` (ou `pnpm audit`).
        *   Considerar o uso de ferramentas automatizadas como Snyk ou Dependabot para monitorar e alertar sobre vulnerabilidades conhecidas em dependências.
        *   Manter as dependências razoavelmente atualizadas, especialmente aquelas com patches de segurança. Avaliar o impacto de atualizações antes de aplicá-las.
    *   **Justificativa:** Vulnerabilidades em pacotes de terceiros são um vetor de ataque comum.

**7. Tratamento de Erros Seguro:**
    *   **Padrão:** Conforme ADR-014, evitar o vazamento de informações sensíveis ou detalhes excessivos da estrutura interna do sistema em mensagens de erro que são expostas ao usuário final (renderer) ou logadas em ambientes menos seguros.
    *   Stack traces detalhados devem ser restritos a logs de desenvolvimento ou logs de servidor seguros.
    *   **Justificativa:** Previne que atacantes obtenham informações sobre o funcionamento interno da aplicação através de mensagens de erro.

**8. Acesso Seguro ao Sistema de Arquivos:**
    *   **Padrão:** Se qualquer parte da aplicação (especialmente o processo principal ou ferramentas/agentes invocados) precisar acessar o sistema de arquivos com base em caminhos fornecidos pelo usuário ou por fontes externas:
        *   Os caminhos DEVEM ser rigorosamente validados e sanitizados.
        *   Normalizar caminhos (e.g., usando `path.normalize()`).
        *   Resolver caminhos para sua forma absoluta e canônica (e.g., `fs.realpathSync()`) e verificar se estão dentro de um diretório base permitido e esperado.
        *   Prevenir ataques de Path Traversal (e.g., `../../secret-file`).
        *   Limitar o escopo de acesso o máximo possível.
    *   **Justificativa:** Previne acesso não autorizado a arquivos e diretórios do sistema do usuário.

**9. Autenticação e Autorização (Diretrizes Gerais):**
    *   **Padrão (se/quando implementado):**
        *   **Autenticação:** Se houver contas locais, senhas devem ser armazenadas usando hashes fortes e com salt (e.g., Argon2, scrypt, bcrypt). Para autenticação baseada em token (e.g., JWT), os tokens devem ser gerados de forma segura, ter tempo de expiração curto, e ser transmitidos apenas por canais seguros.
        *   **Autorização:** Após a autenticação, verificações de autorização explícitas DEVEM ser realizadas nos Casos de Uso ou Serviços de Aplicação antes de executar operações sensíveis ou acessar recursos protegidos.
    *   **Justificativa:** Garante que apenas usuários autenticados e autorizados possam acessar funcionalidades e dados apropriados.

**10. Manter o Electron Atualizado:**
    *   **Padrão:** A versão do Electron usada no projeto DEVE ser atualizada regularmente para incorporar os últimos patches de segurança do Chromium, Node.js e do próprio Electron.
    *   **Justificativa:** Versões desatualizadas do Electron podem conter vulnerabilidades conhecidas.

**Consequências:**
*   Redução significativa da superfície de ataque da aplicação.
*   Melhor proteção dos dados do usuário e da integridade do sistema.
*   Aumento da confiança na segurança da aplicação.
*   Alinhamento com as melhores práticas de desenvolvimento seguro para aplicações Electron e desktop em geral.

---
**Notas de Implementação para LLMs:**
*   Sempre valide e sanitize qualquer dado proveniente do processo de renderização ou de fontes externas antes de usá-lo no processo principal. Use Zod para validação de DTOs IPC.
*   Tenha extremo cuidado ao construir caminhos de arquivo ou executar comandos baseados em entrada externa.
*   Não exponha funcionalidades sensíveis do Node.js ou Electron diretamente ao renderer via `contextBridge`. Use a API IPC curada.
*   Ao lidar com chaves de API ou outros segredos, pense em como eles são armazenados e transmitidos. Use `safeStorage` para configurações do usuário. Não os logue.
*   Lembre-se das configurações de segurança em `webPreferences` ao criar novas janelas.
