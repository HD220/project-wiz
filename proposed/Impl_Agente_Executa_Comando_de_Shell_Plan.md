# Plano de Implementação Detalhado: Caso de Uso 5 - Agente Executa Comando de Shell

## 1. Visão Geral do Caso de Uso

Este documento detalha o plano de implementação para o caso de uso "Agente Executa Comando de Shell", conforme descrito em `proposed/Detailed_Use_Cases.md`. O objetivo é permitir que os agentes de IA executem comandos de shell em um ambiente seguro e isolado, capturando a saída e o código de saída para análise posterior pelo agente.

## 2. Análise da Base de Código Existente e Identificação de Gaps

A funcionalidade básica de execução de comandos de shell já existe, mas carece de mecanismos robustos de segurança, isolamento e feedback em tempo real, que são cruciais para um sistema de agentes.

### Componentes Existentes:

*   **`kernel/shell.service.ts`:**
    *   Contém a classe `ShellService` e a função `runShellCommand` que utilizam `child_process.exec` para executar comandos de shell. Isso forma a base da execução de comandos.
    *   Aceita `command`, `args` e `cwd` (current working directory), o que permite direcionar a execução para o diretório do projeto.
*   **`kernel/agent-runtime/agent-tool-executor.service.ts`:**
    *   Possui o método `executeShell` que encapsula `runShellCommand`, tornando a execução de comandos de shell uma "ferramenta" disponível para os agentes.
*   **`kernel/agent-runtime/agent.worker.ts`:**
    *   O `AgentWorker` já está configurado para utilizar ferramentas, incluindo `executeShell`. Isso significa que os agentes podem, em teoria, invocar comandos de shell.
*   **`modules/persona-management/domain/agents/code-review.agent.ts`:**
    *   Um exemplo de agente (`CodeReviewAgent`) lista `executeShell` como uma de suas ferramentas, confirmando a intenção de uso dessa funcionalidade pelos agentes.

### Gaps Identificados:

1.  **Segurança e Isolamento (Crítico):**
    *   O uso direto de `child_process.exec` sem sandboxing adequado representa um risco de segurança significativo. Um agente mal-intencionado ou com erro pode executar comandos arbitrários que afetam o sistema operacional do usuário (e.g., `rm -rf /`, acesso a arquivos sensíveis fora do diretório do projeto).
    *   O caso de uso exige um "ambiente seguro e isolado", o que não é fornecido pela implementação atual.
2.  **Autorização/Whitelisting de Comandos:**
    *   Não há um mecanismo para definir quais comandos um agente *pode* ou *não pode* executar. Isso é essencial para controlar o comportamento dos agentes e mitigar riscos de segurança.
3.  **Streaming de Saída em Tempo Real:**
    *   A função `runShellCommand` atual retorna `stdout` e `stderr` apenas *após* a conclusão do comando. Para comandos de longa duração (e.g., `npm install`, `build`), é crucial ter feedback em tempo real para o agente e para o usuário na interface.
4.  **Interface do Usuário para Saída do Shell:**
    *   Não há uma interface dedicada para o usuário visualizar a saída de comandos de shell executados pelos agentes. Isso é importante para depuração, auditoria e para o usuário entender o que o agente está fazendo.
5.  **Interpretação da Saída pelo Agente (LLM):**
    *   Embora o agente receba a saída, a capacidade do LLM de interpretar de forma inteligente a saída de comandos complexos (e.g., logs de erro, resultados de testes) e tomar decisões subsequentes é um desafio. Isso requer prompts específicos e talvez um parsing estruturado da saída.

## 3. Plano de Implementação Detalhado

### 3.1. Modificações no Backend (`src/main`)

**Objetivo:** Implementar um ambiente de execução de shell seguro, com autorização de comandos e streaming de saída em tempo real.

**Arquivos a Modificar/Criar:**

*   `src/main/kernel/shell.service.ts` (Modificar)
*   `src/main/kernel/command-whitelist.ts` (Novo)
*   `src/main/kernel/real-time-events.service.ts` (Modificar)
*   `src/main/modules/agent-interaction/application/events/shell-command-output.event.ts` (Novo)
*   `src/main/modules/agent-interaction/application/events/shell-command-output.handler.ts` (Novo)

**Passos:**

1.  **Implementar Sandboxing e Whitelisting de Comandos:**
    *   **Abordagem:** Em vez de `child_process.exec`, considerar o uso de bibliotecas que ofereçam sandboxing (e.g., `vm2` para Node.js, embora mais para JS, ou execução em contêineres leves como Docker/gVisor se a complexidade for aceitável). Para um MVP, um `CommandWhitelist` é um bom primeiro passo.
    *   **`src/main/kernel/command-whitelist.ts` (Novo):** Criar um módulo que define uma lista explícita de comandos e seus argumentos permitidos.

    ```typescript
    // src/main/kernel/command-whitelist.ts
    export interface AllowedCommand {
      command: string; // O comando base (e.g., 'git', 'npm', 'ls')
      args?: string[]; // Argumentos permitidos (pode ser regex ou lista exata)
      allowAnyArgs?: boolean; // Se true, permite quaisquer argumentos para o comando base
    }

    const WHITELISTED_COMMANDS: AllowedCommand[] = [
      { command: 'git', args: ['init', 'clone', 'add', 'commit', 'pull', 'push', 'status', 'log'], allowAnyArgs: false },
      { command: 'npm', args: ['install', 'test', 'run', 'start', 'build'], allowAnyArgs: true }, // npm run <script> pode ter args variáveis
      { command: 'ls', allowAnyArgs: true },
      { command: 'cd', allowAnyArgs: true },
      { command: 'mkdir', allowAnyArgs: true },
      { command: 'rm', args: ['-rf', '-r', '-f'], allowAnyArgs: true }, // CUIDADO: rm é perigoso, limitar escopo
      // Adicionar outros comandos conforme necessário
    ];

    export function isCommandAllowed(command: string, args: string[]): boolean {
      const baseCommand = command.split(' ')[0]; // Pega o comando principal
      const fullArgs = command.split(' ').slice(1).concat(args); // Combina args da string e do array

      for (const allowed of WHITELISTED_COMMANDS) {
        if (allowed.command === baseCommand) {
          if (allowed.allowAnyArgs) {
            return true;
          }
          // Verificar se todos os argumentos fornecidos estão na lista de argumentos permitidos
          return fullArgs.every(arg => allowed.args?.includes(arg));
        }
      }
      return false;
    }
    ```

    *   **Modificar `src/main/kernel/shell.service.ts`:**
        *   Antes de executar qualquer comando, chamar `isCommandAllowed`.
        *   Se o comando não for permitido, lançar um erro de segurança.
        *   **Importante:** Para `rm`, garantir que o `cwd` e os argumentos limitem a ação ao diretório do projeto ou a arquivos temporários. Isso pode exigir lógica adicional no `ShellService` ou no `AgentToolExecutorService`.

    ```typescript
    // src/main/kernel/shell.service.ts
    // ... imports existentes ...
    import { isCommandAllowed } from "./command-whitelist"; // Novo import
    import { RealTimeEventsService } from "./real-time-events.service"; // Novo import
    import { IpcChannel } from "@/shared/ipc-types/ipc-channels"; // Novo import

    export class ShellService {
      constructor(private readonly realTimeEventsService: RealTimeEventsService) {} // Injetar

      async executeCommand(
        command: string,
        args: string[],
        cwd: string,
        projectId: string, // Novo: para rotear eventos
        taskId: string, // Novo: para rotear eventos
      ): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
        const fullCommand = `${command} ${args.join(' ')}`;

        // 1. Validação de segurança: Whitelisting
        if (!isCommandAllowed(command, args)) {
          throw new ApplicationError(`Comando não autorizado: ${fullCommand}`);
        }

        logger.info(`Executing shell command: ${fullCommand} in ${cwd}`);

        return new Promise((resolve, reject) => {
          const child = exec(fullCommand, { cwd });

          let stdout = '';
          let stderr = '';

          // 2. Streaming de saída em tempo real
          child.stdout?.on('data', (data) => {
            stdout += data.toString();
            this.realTimeEventsService.emit(IpcChannel.SHELL_COMMAND_OUTPUT, {
              projectId, taskId, type: 'stdout', content: data.toString(),
            });
          });

          child.stderr?.on('data', (data) => {
            stderr += data.toString();
            this.realTimeEventsService.emit(IpcChannel.SHELL_COMMAND_OUTPUT, {
              projectId, taskId, type: 'stderr', content: data.toString(),
            });
          });

          child.on('close', (code) => {
            if (code !== 0) {
              const errorMessage = `Command failed with exit code ${code}. Stderr: ${stderr}`;
              logger.error(errorMessage);
              this.realTimeEventsService.emit(IpcChannel.SHELL_COMMAND_OUTPUT, {
                projectId, taskId, type: 'error', content: errorMessage,
              });
              reject(new ApplicationError(errorMessage));
            } else {
              logger.info(`Command completed successfully. Stdout: ${stdout}`);
              this.realTimeEventsService.emit(IpcChannel.SHELL_COMMAND_OUTPUT, {
                projectId, taskId, type: 'success', content: 'Comando executado com sucesso.',
              });
              resolve({ stdout, stderr, exitCode: code });
            }
          });

          child.on('error', (error) => {
            const errorMessage = `Failed to start command: ${error.message}`;
            logger.error(errorMessage);
            this.realTimeEventsService.emit(IpcChannel.SHELL_COMMAND_OUTPUT, {
              projectId, taskId, type: 'error', content: errorMessage,
            });
            reject(new ApplicationError(errorMessage));
          });
        });
      }
    }

    // Atualizar a exportação da função runShellCommand para injetar o ShellService
    // Isso exigirá que o ShellService seja instanciado e injetado onde runShellCommand é usado.
    // Exemplo: src/main/kernel/agent-runtime/agent-tool-executor.service.ts
    // constructor(private readonly shellService: ShellService) {}
    // return this.shellService.executeCommand(command, args, projectPath, projectId, taskId);
    ```

2.  **Emitir Eventos de Saída do Shell em Tempo Real:**
    *   O `RealTimeEventsService` já existe. Ele precisará de um novo tipo de evento IPC para a saída do shell.

    ```typescript
    // src/shared/ipc-types/ipc-channels.ts
    export enum IpcChannel {
      // ... existentes ...
      SHELL_COMMAND_OUTPUT = "shell:command-output",
    }

    // src/shared/ipc-types/ipc-payloads.ts
    export interface IpcShellCommandOutputPayload {
      projectId: string;
      taskId: string; // Para associar a saída a uma tarefa específica
      type: 'stdout' | 'stderr' | 'error' | 'success';
      content: string;
    }
    ```

3.  **Processamento da Saída do Shell pelo Agente:**
    *   O `AgentWorker` (e, por extensão, o LLM) precisará ser capaz de receber e interpretar esses eventos de saída em tempo real.
    *   Isso pode ser feito através de um mecanismo de "observação" ou "callback" no `AgentWorker` que o LLM pode usar para ajustar seu raciocínio.

    ```typescript
    // src/main/kernel/agent-runtime/agent.worker.ts
    // ... imports existentes ...
    import { IpcShellCommandOutputPayload } from "@/shared/ipc-types/ipc-payloads";

    export class AgentWorker {
      // ... construtor e outras propriedades ...

      // Método para lidar com a saída do shell (chamado pelo RealTimeEventsService)
      handleShellOutput(payload: IpcShellCommandOutputPayload): void {
        if (payload.taskId === this.workerData.taskId) {
          // Aqui, o agente pode processar a saída
          // Por exemplo, alimentar o LLM com a saída para a próxima etapa de raciocínio
          logger.debug(`Agent ${this.workerData.agentId} received shell output: ${payload.content}`);
          // Lógica para atualizar o estado interno do agente ou do LLM
        }
      }

      // ... modificar executeShell para passar projectId e taskId
      private initializeTools(): AgentTools {
        return {
          // ... outras ferramentas ...
          executeShell: async (command: string, args: string[]) => {
            return this.callTool("executeShell", { command, args, projectId: this.workerData.projectId, taskId: this.workerData.taskId });
          },
        };
      }
    }
    ```

### 3.2. Modificações no Frontend (`src/renderer`)

**Objetivo:** Exibir a saída de comandos de shell em tempo real para o usuário.

**Arquivos a Modificar/Criar:**

*   `src/renderer/features/project-management/components/project-dashboard.tsx` (ou um novo componente de console)
*   `src/renderer/hooks/use-ipc-query.hook.ts` (para escutar eventos de saída do shell)

**Passos:**

1.  **Criar Componente de Console/Log:**
    *   Um novo componente que exibe a saída de comandos de shell, talvez dentro da visualização do projeto.

    ```typescript
    // src/renderer/components/shell-output-console.tsx (Novo)
    import React, { useState, useEffect, useRef } from 'react';
    import { useIpcQuery } from "@/renderer/hooks/use-ipc-query.hook";
    import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
    import { IpcShellCommandOutputPayload } from "@/shared/ipc-types/ipc-payloads";

    interface ShellOutputConsoleProps {
      projectId: string;
      taskId?: string; // Opcional, para filtrar por tarefa
    }

    export const ShellOutputConsole: React.FC<ShellOutputConsoleProps> = ({ projectId, taskId }) => {
      const [logs, setLogs] = useState<IpcShellCommandOutputPayload[]>([]);
      const endOfLogsRef = useRef<HTMLDivElement>(null);

      useIpcQuery<IpcShellCommandOutputPayload>({
        channel: IpcChannel.SHELL_COMMAND_OUTPUT,
        onSuccess: (payload) => {
          if (payload.projectId === projectId && (!taskId || payload.taskId === taskId)) {
            setLogs((prevLogs) => [...prevLogs, payload]);
          }
        },
      });

      useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [logs]);

      return (
        <div className="bg-black text-white p-4 font-mono text-sm overflow-auto h-64 rounded-md">
          {logs.map((log, index) => (
            <div key={index} className={log.type === 'error' ? 'text-red-400' : log.type === 'stderr' ? 'text-yellow-400' : 'text-green-400'}>
              {log.content}
            </div>
          ))}
          <div ref={endOfLogsRef} />
        </div>
      );
    };
    ```

2.  **Integrar Console na UI do Projeto:**
    *   Adicionar o `ShellOutputConsole` em uma seção relevante da interface do projeto, talvez em uma aba de "Logs" ou "Atividade do Agente".

### 3.3. Testes e Verificação

**Objetivo:** Garantir que a execução de comandos de shell seja segura, autorizada e que a saída seja exibida em tempo real.

**Passos:**

1.  **Testes Unitários:**
    *   Testar `isCommandAllowed` com diferentes comandos e argumentos (permitidos e não permitidos).
    *   Testar `ShellService.executeCommand` para:
        *   Verificar se comandos não autorizados são bloqueados.
        *   Verificar se a saída (stdout/stderr) é capturada corretamente.
        *   Verificar se eventos IPC de `SHELL_COMMAND_OUTPUT` são emitidos em tempo real.
        *   Testar o tratamento de erros (comando não encontrado, permissão negada).

2.  **Testes de Integração (Manual/E2E):**
    *   Iniciar a aplicação.
    *   Criar um projeto.
    *   Interagir com um agente para que ele execute um comando de shell permitido (e.g., `@DevAgent, execute 'ls -la' no diretório do projeto`).
    *   Observar a saída do comando no `ShellOutputConsole` em tempo real.
    *   Tentar fazer com que um agente execute um comando não autorizado (e.g., `@DevAgent, execute 'rm -rf /'`).
    *   Verificar se o comando é bloqueado e uma mensagem de erro apropriada é exibida/registrada.
    *   Testar comandos de longa duração para verificar o streaming de saída.

## 4. Considerações Adicionais

*   **Sandboxing Avançado:** Para ambientes de produção ou cenários de alta segurança, considerar soluções de sandboxing mais robustas, como a execução de comandos dentro de contêineres Docker leves ou VMs. Isso adicionaria complexidade, mas aumentaria significativamente a segurança.
*   **Gerenciamento de Permissões:** Implementar um sistema de permissões mais granular para agentes, permitindo que diferentes tipos de agentes tenham acesso a diferentes conjuntos de comandos ou diretórios.
*   **Limitação de Recursos:** Adicionar limites de tempo de execução e uso de recursos para comandos de shell para evitar que agentes consumam recursos excessivos ou entrem em loops infinitos.
*   **Interação com o Usuário:** Para comandos que exigem interação (e.g., prompts de senha), será necessário um mecanismo para o agente solicitar essa informação ao usuário e passá-la para o comando.
*   **Logs Detalhados:** Manter logs detalhados de todas as execuções de comandos de shell, incluindo o agente que o executou, o comando completo, a saída e o status.

Este plano detalha as modificações necessárias para implementar o caso de uso "Agente Executa Comando de Shell", cobrindo tanto o frontend quanto o backend, e incluindo considerações sobre testes e boas práticas.
