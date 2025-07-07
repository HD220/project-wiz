# ADR-023: Configuração e Segurança do Processo Principal Electron (`main.ts`)

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
O processo principal do Electron (`main.ts`) é o coração da aplicação desktop. Ele gerencia o ciclo de vida da aplicação, a criação de janelas (BrowserWindow), o registro de handlers IPC, e é fundamental para a segurança geral da aplicação. A análise do `main.ts` atual revelou boas práticas de segurança na configuração da `webPreferences`, mas também a ausência de registro dos handlers IPC específicos da aplicação. Esta ADR visa padronizar a configuração e as práticas de segurança para o `main.ts`.

**Decisão:**

Serão adotados os seguintes padrões para a configuração e segurança do processo principal do Electron:

**1. Estrutura e Responsabilidades do `main.ts`:**
    *   **Responsabilidades Primárias:**
        *   Gerenciar o ciclo de vida da aplicação Electron (eventos `ready`, `window-all-closed`, `activate`, `will-quit`).
        *   Lidar com a inicialização específica de instaladores (e.g., `electron-squirrel-startup`).
        *   Criar e gerenciar instâncias de `BrowserWindow`.
        *   Registrar todos os handlers IPC que permitem a comunicação entre o processo de renderização (UI) e o processo principal.
        *   Configurar aspectos globais da aplicação (e.g., atalhos de teclado globais, menu da aplicação, se houver).
    *   **Organização:** O código em `main.ts` deve ser bem organizado, com funções auxiliares para tarefas como criação de janela (`createWindow`).

**2. Gerenciamento do Ciclo de Vida da Aplicação:**
    *   **Padrão:** Utilizar os eventos do módulo `app` do Electron de forma padronizada:
        *   `app.on("ready", callback)`: Ponto de entrada principal para inicializar a aplicação, registrar handlers IPC e criar a janela principal.
        *   `app.on("window-all-closed", callback)`: Encerrar a aplicação (`app.quit()`) quando todas as janelas forem fechadas (exceto no macOS, onde é comum a aplicação continuar rodando).
        *   `app.on("activate", callback)`: (macOS) Recriar a janela principal se a aplicação for ativada e não houver janelas abertas.
        *   `app.on("will-quit", callback)`: Para qualquer limpeza final antes de a aplicação encerrar.
    *   **Squirrel Startup:** Incluir tratamento para `electron-squirrel-startup` no início do `main.ts` para lidar corretamente com eventos de instalação/atualização no Windows.
    *   **Justificativa:** Comportamento padrão e esperado para aplicações desktop.

**3. Criação de Janelas (`BrowserWindow`):**
    *   **Padrão:** A criação de instâncias de `BrowserWindow` deve ser encapsulada em uma função (e.g., `createWindow`).
    *   **Configurações de Segurança Essenciais (`webPreferences`):**
        *   `contextIsolation: true` (OBRIGATÓRIO): Isola o contexto do script de preload e do código do renderer do ambiente interno do Electron.
        *   `nodeIntegration: false` (OBRIGATÓRIO): Impede que o processo de renderização acesse APIs Node.js diretamente.
        *   `preload: path.join(__dirname, "preload.js")` (OBRIGATÓRIO): Especifica o script de preload que atuará como ponte segura entre o renderer e o main.
        *   `webSecurity: true` (Recomendado, padrão é `true`): Desabilitar apenas se houver uma razão muito forte e as implicações de segurança forem compreendidas (e.g., para carregar conteúdo local de forma específica, mas geralmente não recomendado).
        *   `allowRunningInsecureContent: false` (Recomendado, padrão é `false`): Previne o carregamento de HTTP sobre HTTPS.
    *   **Carregamento de Conteúdo (Vite):** Utilizar o padrão para carregar a URL do servidor de desenvolvimento Vite (`MAIN_WINDOW_VITE_DEV_SERVER_URL`) em ambiente de desenvolvimento e o arquivo `index.html` do build de produção (`../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`).
    *   **DevTools:** Abrir DevTools automaticamente em ambiente de desenvolvimento.
    *   **Gerenciamento da Instância da Janela:** Manter uma referência à instância da janela (e.g., `let mainWindow: BrowserWindow | null`) e setá-la para `null` no evento `closed`.
    *   **Justificativa:** Garante que as janelas sejam criadas com as configurações de segurança mais importantes, prevenindo vulnerabilidades comuns em aplicações Electron.

**4. Registro de Handlers IPC:**
    *   **Padrão CRÍTICO:** Todas as funções de registro de handlers IPC (e.g., `registerProjectHandlers()`, `registerDMHandlers()` de `src/presentation/electron/main/handlers/`) DEVEM ser chamadas explicitamente no `main.ts`, tipicamente dentro do callback de `app.on("ready", ...)`, antes da criação da janela principal ou logo após, dependendo se os handlers precisam de acesso à instância da janela.
    *   **Consolidação de Diretório:** Conforme identificado na análise, os handlers IPC devem ser consolidados em um único diretório (`src/presentation/electron/main/handlers/`). O diretório `ipc-handlers/` deve ser removido.
    *   **Acesso a Dependências (DI):** Se os handlers IPC (ou as funções que eles invocam) necessitarem de serviços da camada de aplicação/infraestrutura, essas dependências devem ser resolvidas a partir do container DI (`appContainer` de `inversify.config.ts`) no `main.ts` e passadas para as funções de registro dos handlers, ou os próprios handlers devem ser classes injetáveis (menos comum para simples agrupamentos de `ipcMain.handle`). (Ver ADR-019 para DI).
    *   **Justificativa:** É essencial que os handlers sejam registrados para que a comunicação entre o renderer e o main funcione. A ausência de registro (estado atual comentado no código) impede a funcionalidade da aplicação.

**5. Tratamento de Erros no Processo Principal:**
    *   **Padrão:** Configurar um handler global para exceções não capturadas no processo principal:
        ```typescript
        // process.on('uncaughtException', (error, origin) => {
        //   // Idealmente usar ILogger aqui, se já inicializado
        //   console.error(`[Main Process] Uncaught Exception at: ${origin}, error: ${error.stack || error}`);
        //   // Considerar sair da aplicação ou mostrar uma caixa de diálogo de erro fatal
        // });
        ```
    *   Utilizar a instância `ILogger` (uma vez disponível e configurada) para todo o logging dentro do `main.ts` e nos handlers IPC, em vez de `console.*` (exceto para logs muito iniciais).
    *   **Justificativa:** Garante que falhas inesperadas no processo principal sejam logadas e tratadas de alguma forma, prevenindo que a aplicação feche silenciosamente.

**6. Considerações de Segurança Adicionais:**
    *   **Validação do Remetente IPC (Opcional Avançado):** Embora `contextIsolation` seja a principal defesa, para canais IPC muito sensíveis, pode-se considerar a validação do `event.senderFrame.url` para garantir que a mensagem venha de uma origem esperada. Geralmente desnecessário com `contextIsolation: true`.
    *   **Content Security Policy (CSP):** Considerar a configuração de uma CSP rigorosa através de `session.defaultSession.webRequest.onHeadersReceived` para mitigar riscos de XSS se a aplicação carregar conteúdo de múltiplas fontes ou tiver áreas de conteúdo gerado pelo usuário.
        ```typescript
        // // Exemplo de CSP (a ser ajustado):
        // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        //   callback({
        //     responseHeaders: {
        //       ...details.responseHeaders,
        //       'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"]
        //     }
        //   });
        // });
        ```
        *Nota: `unsafe-inline` deve ser evitado se possível; requer configuração cuidadosa com Vite/React.*
    *   **Gerenciamento de Permissões:** Se a aplicação precisar de acesso a recursos sensíveis (câmera, microfone, localização), usar `session.setPermissionRequestHandler` para controlar ou solicitar explicitamente essas permissões ao usuário.
    *   **Atualizações:** Manter o Electron e suas dependências (Node.js, Chromium) atualizados para mitigar vulnerabilidades conhecidas.
    *   **Acesso ao Sistema de Arquivos:** Qualquer lógica no processo principal que acesse o sistema de arquivos, especialmente com base em caminhos fornecidos pelo renderer (via IPC), deve validar e sanitizar esses caminhos rigorosamente para prevenir vulnerabilidades de path traversal ou acesso a arquivos indevidos.
    *   **Justificativa:** Fortalece a postura de segurança da aplicação contra uma variedade de vetores de ataque.

**7. Bloqueio de Instância Única:**
    *   **Padrão:** Implementar um bloqueio de instância única para prevenir que múltiplos instâncias da aplicação rodem simultaneamente.
        ```typescript
        // if (!app.requestSingleInstanceLock()) {
        //   app.quit();
        // } else {
        //   app.on('second-instance', (event, commandLine, workingDirectory) => {
        //     if (mainWindow) {
        //       if (mainWindow.isMinimized()) mainWindow.restore();
        //       mainWindow.focus();
        //     }
        //   });
        //   // ... resto do app.on('ready')
        // }
        ```
    *   **Justificativa:** Comportamento esperado para a maioria das aplicações desktop e previne conflitos de estado ou recursos.

**8. Atualizações Automáticas (Auto-updates):**
    *   **Consideração:** A lógica para atualizações automáticas (e.g., usando `electron-updater`) deve ser gerenciada no processo principal.
    *   Esta ADR não detalha a implementação, mas reconhece que é uma responsabilidade do `main.ts`. (Pode ser um ADR futuro se a implementação for complexa).
    *   **Justificativa:** Mantém a aplicação atualizada com as últimas funcionalidades e correções de segurança.

**Consequências:**
*   Processo principal mais seguro e robusto.
*   Configuração padronizada para novas janelas e ciclo de vida da aplicação.
*   Clareza sobre como os handlers IPC devem ser registrados e gerenciados.
*   Melhoria na postura de segurança geral da aplicação Electron.

---
**Notas de Implementação para LLMs:**
*   Ao modificar `main.ts`, certifique-se de que as `webPreferences` (`contextIsolation: true`, `nodeIntegration: false`, `preload`) estão sempre configuradas corretamente para novas `BrowserWindow`.
*   Garanta que TODAS as funções de registro de handlers IPC (e.g., `registerProjectHandlers`) sejam chamadas dentro de `app.on('ready', ...)`.
*   Use `ILogger` para logging no processo principal, evitando `console.*` após a inicialização do logger.
*   Considere as implicações de segurança de qualquer nova funcionalidade adicionada ao processo principal, especialmente se envolver IPC ou acesso a recursos do sistema.
