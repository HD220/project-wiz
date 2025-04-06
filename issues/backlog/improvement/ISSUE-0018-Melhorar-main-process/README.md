# Melhorar Main Process do Electron

## Descrição

O main process (main.ts) pode ser melhorado com:

- DevTools apenas em desenvolvimento
- Melhor tratamento de erros
- Graceful shutdown
- Logs para debug

## Tarefas

- [ ] Configurar DevTools condicional
- [ ] Adicionar tratamento de erros centralizado
- [ ] Implementar graceful shutdown
- [ ] Adicionar logs para operações críticas

## Critérios de Aceitação

- DevTools só abre em dev
- Erros são tratados adequadamente
- Aplicação fecha corretamente
- Logs para operações importantes
