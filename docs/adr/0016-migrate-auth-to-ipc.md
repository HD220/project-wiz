# ADR-0016: Migração da Autenticação para IPC Nativo do Electron

**Status:** Proposto

**Contexto:**

A análise de segurança realizada na issue #327 ("Reforcar seguranca geral do projeto") identificou que o mecanismo de autenticação atual, baseado em uma API Express local dentro do processo principal do Electron, apresenta riscos de segurança. Manter um servidor HTTP(S) aberto, mesmo que localmente, aumenta a superfície de ataque da aplicação. Além disso, essa abordagem é inconsistente com o padrão de comunicação segura via IPC (Inter-Process Communication) já utilizado em outras partes do sistema para interações entre o processo principal e os processos de renderização. A recomendação resultante dessa análise (registrada na memória como "ADR-Auth-IPC Recommendation") foi migrar a lógica de autenticação para utilizar o IPC nativo do Electron.

**Decisão:**

Decidimos **migrar o sistema de autenticação da API Express local para utilizar o IPC nativo do Electron**. Toda a comunicação relacionada à autenticação (login, registro, verificação de token, etc.) entre os processos de renderização e o processo principal ocorrerá através dos canais seguros de IPC fornecidos pelo Electron (`ipcMain` e `ipcRenderer`).

**Consequências:**

**Positivas:**
*   **Segurança Aprimorada:** Elimina a necessidade de um servidor HTTP(S) local, reduzindo significativamente a superfície de ataque relacionada à autenticação.
*   **Consistência Arquitetural:** Alinha o mecanismo de autenticação com o padrão de comunicação IPC seguro já estabelecido no restante da aplicação.
*   **Simplificação:** Remove a dependência do Express e a complexidade associada à gestão de um servidor web interno para essa finalidade.
*   **Melhor Integração:** Facilita a integração direta com APIs internas do Electron no processo principal, se necessário para a lógica de autenticação.

**Negativas:**
*   **Esforço de Refatoração:** Exigirá um esforço considerável para refatorar o código existente no frontend (processo de renderização) e no backend (processo principal) para usar IPC em vez de requisições HTTP.
*   **Testes:** Será necessário adaptar e criar novos testes para cobrir o fluxo de autenticação via IPC.
*   **Gerenciamento de Estado:** A lógica de gerenciamento de estado de autenticação no frontend pode precisar de ajustes.

**Alternativas Consideradas:**

1.  **Manter a API Express Local:**
    *   *Prós:* Nenhum esforço de refatoração imediato.
    *   *Contras:* Mantém os riscos de segurança identificados, inconsistência arquitetural, maior complexidade a longo prazo. (Descartada devido aos riscos de segurança e inconsistência).
2.  **Usar uma Biblioteca de Autenticação Externa:**
    *   *Prós:* Poderia delegar a complexidade da autenticação.
    *   *Contras:* Introduziria uma dependência externa significativa, poderia não se integrar perfeitamente com o fluxo do Electron, potencialmente adicionaria custos ou limitações. (Considerada excessiva para as necessidades atuais).

A migração para IPC nativo foi considerada a melhor abordagem por equilibrar segurança, consistência e esforço de implementação a longo prazo.