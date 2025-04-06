# Implementar métricas de uso de GPU

## Descrição

Implementar um sistema para monitorar o uso de GPU (memória, utilização) e exibir as métricas no frontend. O sistema deve ser compatível com diferentes GPUs.

## Critérios de Aceitação

- [ ] Monitorar o uso de memória da GPU.
- [ ] Monitorar a utilização da GPU.
- [ ] Exibir as métricas no frontend em um painel dedicado.
- [ ] Compatibilidade com diferentes GPUs (NVIDIA, AMD, Intel).
- [ ] Criar testes unitários e de integração para garantir a coleta e exibição correta das métricas.

## Tarefas

- [ ] Implementar a coleta de métricas de uso de GPU no WorkerService.
- [ ] Criar uma API para fornecer as métricas para o frontend.
- [ ] Desenvolver um componente no frontend para exibir as métricas.
- [ ] Configurar um sistema de atualização em tempo real das métricas.
- [ ] Documentar o processo de coleta e exibição das métricas.

## Notas Adicionais

Considerar a utilização de bibliotecas como `nvidia-ml-py` ou `pycuda` para obter as métricas de GPUs NVIDIA. Para outras GPUs, pesquisar bibliotecas equivalentes.
