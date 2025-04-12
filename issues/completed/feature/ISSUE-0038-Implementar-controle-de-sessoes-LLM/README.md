# Implementar controle de sessões LLM

## Descrição

Implementar um sistema para controlar as sessões com os modelos LLM, permitindo pausar, cancelar e restaurar sessões.

## Critérios de Aceitação

- [ ] Permitir pausar a geração de texto.
- [ ] Permitir cancelar a geração de texto.
- [ ] Exibir um indicador visual do status da sessão (e.g., "Em execução", "Pausado", "Cancelado").
- [ ] Permitir salvar o estado da sessão atual.
- [ ] Permitir restaurar uma sessão previamente salva.

## Tarefas

- [ ] Modificar o `WorkerService` para suportar pausa e cancelamento.
- [ ] Criar um componente de UI para controlar as sessões (botões de pausar, cancelar, salvar, restaurar).
- [ ] Implementar a lógica para salvar e restaurar o estado da sessão.
- [ ] Adicionar um indicador visual do status da sessão na UI.

## Notas Adicionais

O estado da sessão pode ser salvo no local storage ou em um arquivo. A escolha da melhor abordagem deve ser feita durante a implementação.
