# ISSUE-0104: Refatorar WorkerService para Mistral GGUF

## Descrição

Esta issue tem como objetivo refatorar o `WorkerService` para suportar modelos Mistral (GGUF) com `node-llama-cpp`, garantindo o uso de `utilityProcess.fork` e evitando a criação de um worker para cada modelo.

## Passos

1.  **Modificar `loadModel`:**
    *   Remover a lógica de criar um novo worker em `loadModel`.
    *   Enviar uma mensagem para o worker existente para carregar o modelo.
2.  **Criar Worker no Construtor:**
    *   Criar o worker no construtor do `WorkerService` e mantê-lo em execução.
3.  **Implementar Lógica de Carregamento no Worker:**
    *   Implementar a lógica para carregar e descarregar modelos no worker.
    *   Usar `node-llama-cpp` para carregar os modelos GGUF.
4.  **Implementar Cache de Modelos no Worker:**
    *   Implementar um cache de modelos no worker para evitar recarregamentos desnecessários.
5.  **Implementar Gerenciamento de Memória no Worker:**
    *   Monitorar o uso de memória no worker e liberar modelos não utilizados.
6.  **Implementar Tratamento de Erros no Worker:**
    *   Implementar tratamento de erros robusto no worker.

## Arquivo a ser modificado

`src/core/services/llm/WorkerService.ts`

## Contexto

Estamos refatorando o `WorkerService` para suportar modelos Mistral (GGUF) com `node-llama-cpp`, garantindo o uso de `utilityProcess.fork` e evitando a criação de um worker para cada modelo.