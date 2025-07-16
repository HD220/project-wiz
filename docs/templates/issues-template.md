# Lista de Issues e Problemas

**Última Atualização:** [DATA]  
**Status:** [X] pendentes, [Y] concluídas

---

## Instruções de Uso

Este arquivo contém uma lista de problemas, bugs e melhorias identificadas no projeto. Cada item deve ser marcado conforme for resolvido.

**Para adicionar um novo problema:**

1. Adicione uma nova linha com checkbox: `- [ ] Descrição do problema`
2. Inclua detalhes suficientes para reproduzir ou entender o problema
3. Opcionalmente, adicione contexto sobre onde o problema ocorre

**Para marcar como resolvido:**

1. Marque o checkbox: `- [x] Descrição do problema`
2. Mantenha o item na lista para histórico

---

## Bugs Críticos

### Funcionalidade Principal

- [ ] [CRÍTICO] Descrição do bug crítico que impede uso básico do sistema
- [ ] [CRÍTICO] Outro bug que causa crash ou perda de dados

### Performance

- [ ] [CRÍTICO] Sistema muito lento ao carregar lista com +100 itens
- [ ] [CRÍTICO] Memory leak identificado em [local específico]

---

## Bugs Médios

### Interface do Usuário

- [ ] Botão "Salvar" não responde em formulário de [feature]
- [ ] Layout quebrado em tela de [nome da tela] em resolução [resolução]
- [ ] Toast de sucesso não aparece após [ação específica]

### Funcionalidades

- [ ] Validação incorreta no campo [nome do campo]
- [ ] Filtro de busca não funciona com caracteres especiais
- [ ] Exportação de dados gera arquivo corrompido

### Integração

- [ ] Erro de comunicação IPC em [contexto específico]
- [ ] Falha na sincronização com banco de dados em [situação]

---

## Bugs Menores

### Usabilidade

- [ ] Texto de ajuda incorreto na seção [seção]
- [ ] Cursor não muda ao passar sobre elemento clicável
- [ ] Focus não segue ordem lógica nos formulários

### Visual

- [ ] Ícone incorreto sendo exibido em [local]
- [ ] Espaçamento inconsistente entre elementos em [página]
- [ ] Cores não seguem design system em [componente]

---

## Melhorias e Otimizações

### Performance

- [ ] Implementar paginação virtual em lista de [entidade]
- [ ] Otimizar queries do banco de dados em [módulo]
- [ ] Adicionar cache para dados frequentemente acessados

### UX/UI

- [ ] Adicionar loading skeleton em [componente]
- [ ] Melhorar feedback visual para ações assíncronas
- [ ] Implementar undo/redo para ações críticas

### Código

- [ ] Refatorar [arquivo/função] para melhor legibilidade
- [ ] Extrair lógica duplicada em [local] para utility function
- [ ] Adicionar validação mais robusta em [funcionalidade]

---

## Refatorações Necessárias

### Arquitetura

- [ ] Reestruturar módulo [nome] para seguir padrão DDD
- [ ] Extrair lógica de [responsabilidade] para service separado
- [ ] Simplificar fluxo de dados em [feature]

### Código Legacy

- [ ] Remover código comentado em [arquivo]
- [ ] Migrar [componente] para usar hooks modernos
- [ ] Atualizar [biblioteca] para versão mais recente

---

## Dívida Técnica

### Documentação

- [ ] Documentar API de [módulo]
- [ ] Adicionar comentários JSDoc em [arquivo]
- [ ] Atualizar README com instruções de [processo]

### Testes

- [ ] Adicionar testes unitários para [funcionalidade]
- [ ] Criar testes de integração para [fluxo]
- [ ] Aumentar cobertura de testes em [módulo]

### Configuração

- [ ] Configurar linting para [regra específica]
- [ ] Adicionar pre-commit hook para [validação]
- [ ] Otimizar configuração de build para [ambiente]

---

## Itens Concluídos

### [DATA] - Bugs Resolvidos

- [x] Bug crítico em autenticação que causava logout inesperado
- [x] Erro de validação em formulário de criação de usuário

### [DATA] - Melhorias Implementadas

- [x] Adicionado loading spinner em operações assíncronas
- [x] Melhorado layout responsivo da página principal

---

## Notas

### Problemas Conhecidos (Não Priorizados)

- Edge case raro em [situação específica] - baixa prioridade
- Incompatibilidade com browser [nome] versão antiga

### Observações Técnicas

- [Anotação sobre problema complexo que precisa de mais investigação]
- [Link para issue relacionada no GitHub, se aplicável]

---

## Histórico de Manutenção

**[DATA]:** Início do arquivo de tracking de issues  
**[DATA]:** Reorganização por prioridade  
**[DATA]:** Adição de seção de refatorações
