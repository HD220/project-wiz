# Handoff - Implementar configurações avançadas do LLM

## Visão geral

Esta feature visa permitir configurações avançadas e detalhadas para os modelos LLM, ajustando parâmetros que impactam diretamente o comportamento da geração de texto. O sistema deve oferecer flexibilidade para salvar presets, aplicar configurações globalmente ou por sessão, priorizando usabilidade, segurança e extensibilidade.

---

## 1. Parâmetros avançados suportados

- **temperature**: controla a aleatoriedade da saída (0 a 2)
- **top_p**: probabilidade acumulada para nucleus sampling (0 a 1)
- **top_k**: número máximo de tokens considerados (inteiro >= 0)
- **frequency_penalty**: penaliza tokens repetidos com base na frequência (-2 a 2)
- **presence_penalty**: penaliza tokens já presentes (-2 a 2)
- **max_tokens**: limite máximo de tokens gerados (inteiro > 0)
- **stop_sequences**: lista de strings para interromper a geração
- **seed**: valor para reprodutibilidade (opcional)
- **repeat_penalty**: penalidade para repetições (0 a 2)
- **outros parâmetros específicos do modelo**: permitir extensão futura

---

## 2. Gestão de presets

- **Criar preset**: salvar um conjunto de configurações com nome e descrição
- **Editar preset**: alterar parâmetros de um preset salvo
- **Excluir preset**: remover presets não desejados
- **Aplicar preset globalmente**: define como padrão para todas as sessões futuras
- **Aplicar preset por sessão**: sobrescreve o global apenas para a sessão ativa
- **Resetar para padrão**: restaurar configurações default do sistema

---

## 3. Escopo das configurações

- **Global**: configurações padrão aplicadas a todas as sessões, salvo sobrescrita
- **Sessão**: configurações específicas que prevalecem sobre o global durante a sessão

---

## 4. Fluxos detalhados

### Fluxo A: Configurar parâmetros manualmente
1. Usuário acessa tela de configurações avançadas
2. Ajusta valores dos parâmetros desejados
3. Salva como preset ou aplica diretamente (global ou sessão)

### Fluxo B: Salvar preset
1. Após ajustar parâmetros, usuário clica em "Salvar como preset"
2. Informa nome e descrição
3. Preset fica disponível para uso futuro

### Fluxo C: Selecionar preset existente
1. Usuário acessa lista de presets
2. Seleciona um preset
3. Aplica globalmente ou apenas na sessão atual

### Fluxo D: Resetar configurações
1. Usuário opta por resetar configurações
2. Sistema restaura valores padrão (globais ou da sessão)

---

## 5. Critérios de aceitação

- Interface permite configurar todos os parâmetros listados
- Usuário pode salvar, editar, excluir presets
- Usuário pode aplicar presets globalmente ou por sessão
- Configurações são persistidas corretamente
- WorkerService utiliza as configurações aplicadas
- Validações impedem valores inválidos ou perigosos
- Mudanças aplicadas sem travar o sistema
- Flexibilidade para adicionar novos parâmetros no futuro
- Documentação clara para o usuário sobre o efeito de cada parâmetro

---

## 6. Requisitos não funcionais

- **Usabilidade**: interface intuitiva, com descrições e limites claros
- **Segurança**: validação rigorosa dos valores
- **Flexibilidade**: arquitetura que permita fácil adição de novos parâmetros
- **Performance**: mudanças rápidas, sem impacto negativo na experiência
- **Persistência confiável**: configurações e presets salvos de forma segura

---

## 7. Observações finais

- O WorkerService já aceita `LLamaChatPromptOptions`, mas a interface para configuração ainda não existe.
- A arquitetura deve permitir extensão para outros modelos além do LLama.
- Priorizar experiência do usuário para facilitar ajustes sem conhecimento técnico profundo.
- Garantir que configurações incorretas não causem falhas ou travamentos.
