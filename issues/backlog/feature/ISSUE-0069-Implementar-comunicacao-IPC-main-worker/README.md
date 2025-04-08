# Implementar comunicação IPC entre main process e worker

## Descrição do Problema
Atualmente, a comunicação entre o main process e os workers do serviço LLM não está totalmente otimizada e padronizada. Isso pode levar a:
- Ineficiências na troca de mensagens
- Dificuldade de manutenção
- Possíveis problemas de sincronização
- Falta de padronização nos tipos de mensagens

## Objetivos
- Implementar um sistema robusto de comunicação IPC entre main process e workers
- Padronizar os tipos de mensagens e protocolo de comunicação
- Garantir eficiência na troca de dados
- Facilitar a manutenção e extensibilidade

## Requisitos Técnicos
- Utilizar IPC do Electron para comunicação entre processos
- Definir protocolo claro de mensagens (request/response, streaming, etc.)
- Implementar sistema de tipos para as mensagens (TypeScript)
- Garantir compatibilidade com o sistema existente de workers
- Manter retrocompatibilidade com implementações atuais

## Dependências
- src/core/services/llm/ipc.ts
- src/core/services/llm/worker.ts
- src/core/services/llm/WorkerService.ts
- src/core/events/bridge.ts

## Critérios de Aceitação
- [ ] Comunicação implementada seguindo padrões estabelecidos
- [ ] Tipagem completa das mensagens IPC
- [ ] Documentação atualizada com o novo protocolo
- [ ] Testes unitários para validação da comunicação
- [ ] Compatibilidade mantida com issues relacionadas (0041, 0049)

## Referências
- ISSUE-0041: Implementar gerenciamento de múltiplos workers
- ISSUE-0049: Implementar streaming WorkerService
- Documentação Electron IPC: https://www.electronjs.org/docs/latest/api/ipc-main