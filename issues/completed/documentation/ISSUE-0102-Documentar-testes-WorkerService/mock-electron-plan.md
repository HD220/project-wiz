# Plano para implementar o mock do Electron

Este documento descreve o plano para implementar o mock do Electron no arquivo `src/core/__mocks__/electron.ts`.

## Requisitos

O mock do Electron deve incluir:

*   Um mock para `utilityProcess.fork` que retorna um objeto com os métodos `postMessage`, `on` e `kill`.
*   Um mock para `MessageChannelMain` que retorna um objeto com as propriedades `port1` e `port2`.
*   Um mock para `ipcMain.handle` que permite registrar handlers para eventos IPC.

## Implementação

1.  Criar um mock para `utilityProcess.fork`:
    *   O mock deve retornar um objeto com os métodos `postMessage`, `on` e `kill` mockados.
    *   Os métodos `postMessage`, `on` e `kill` devem ser implementados como funções `jest.fn()`.
2.  Criar um mock para `MessageChannelMain`:
    *   O mock deve retornar um objeto com as propriedades `port1` e `port2`.
    *   As propriedades `port1` e `port2` devem ser implementadas como objetos mockados.
3.  Criar um mock para `ipcMain.handle`:
    *   O mock deve permitir registrar handlers para eventos IPC.
    *   O mock deve ser implementado como uma função `jest.fn()`.

## Testes

*   Adicionar testes para verificar se o mock do Electron está funcionando corretamente.
*   Os testes devem verificar se os métodos `postMessage`, `on` e `kill` do `utilityProcess` estão sendo chamados corretamente.
*   Os testes devem verificar se os handlers de eventos IPC estão sendo registrados corretamente.