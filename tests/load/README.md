# Testes de Carga e Estresse

Este diretório contém testes de carga para o sistema usando k6.

## Testes Disponíveis

1. **Chat Load Test** (`chat-load-test.ts`)
   - Simula 1000+ usuários enviando mensagens simultâneas
   - Verifica latência e taxa de sucesso
   - Gera relatório em `reports/chat-load-test.html`

2. **IPC Stress Test** (`ipc-stress-test.ts`)
   - Testa a comunicação IPC sob carga pesada
   - Simula 1500+ chamadas simultâneas
   - Gera relatório em `reports/ipc-stress-test.html`

3. **LLM Scaling Test** (`llm-scaling-test.ts`)
   - Testa a escalabilidade do serviço LLM
   - Simula diferentes cargas de processamento
   - Gera relatório em `reports/llm-scaling-test.html`

## Pré-requisitos

- Node.js 18+
- k6 instalado globalmente: `npm install -g k6`
- Dependências do projeto: `npm install`

## Como Executar

1. Instale o k6 globalmente:
   ```bash
   npm install -g k6
   ```

2. Execute os testes individualmente:
   ```bash
   npm run test:load:chat
   npm run test:load:ipc
   npm run test:load:llm
   ```

3. Ou execute todos os testes:
   ```bash
   npm run test:load
   ```

4. Os relatórios serão gerados em `tests/load/reports/`

## Configuração

Os parâmetros dos testes podem ser ajustados nos arquivos:
- Número de usuários virtuais (VUs)
- Duração dos testes
- Limiares (thresholds) de performance
- Padrões de mensagens/prompts