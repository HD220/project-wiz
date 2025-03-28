## Registro de Decisões de Desenvolvimento

### Refatoração do Tipo de Mensagem do LlamaWorker

#### Decisão
- Modificar `LlamaWorkerMessageType` para uma estrutura de objeto mais segura e explícita
- Tornar `modelUris` um parâmetro obrigatório para mensagens de download de modelo

#### Motivação
- Melhorar a segurança de tipos em tempo de compilação
- Prevenir erros potenciais relacionados a parâmetros de mensagem

#### Detalhes da Implementação
- Localização: `src/core/llama/llama-types.ts`
- Mudança de tipo: De união de strings para união de objetos
- Adição de propriedades específicas para cada tipo de mensagem
- Remoção da natureza opcional de `modelUris`

#### Impacto
- Melhoria na clareza do código
- Redução de possíveis erros de tipo
- Documentação mais explícita das estruturas de mensagem

#### Próximos Passos
- Realizar testes de compatibilidade
- Verificar todas as chamadas que utilizam este tipo de mensagem
- Atualizar documentação relacionada

#### Data da Decisão
2025-03-28
