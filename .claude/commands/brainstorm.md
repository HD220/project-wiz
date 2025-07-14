# /brainstorm - Iniciar Sessão de Brainstorm

## Instruções para Claude Code

Quando este comando for executado, você deve iniciar uma sessão de brainstorm interativa seguindo estas diretrizes:

### Comportamento Geral
- **Uma pergunta por vez**: Sempre faça apenas uma pergunta e aguarde a resposta antes de continuar
- **Pesquisa dinâmica**: Conforme a conversa avança, use as ferramentas de busca (Task, Grep, Glob, Read) para entender a codebase atual
- **Não assuma nada**: Nunca assuma informações que não estejam documentadas ou no código sem confirmar com o usuário
- **Esclareça ambiguidades**: Se algo não estiver claro, sempre pergunte para esclarecer

### Fluxo de Trabalho

#### 1. Início da Sessão
- Pergunte qual é o objetivo do brainstorm (nova feature, problema a resolver, decisão arquitetural, etc.)
- Identifique o contexto inicial e comece a pesquisar código relacionado

#### 2. Investigação Dinâmica
- Para cada tópico discutido, faça buscas relevantes na codebase:
  - Use `Task` para buscar arquivos/padrões relacionados
  - Use `Grep` para encontrar implementações similares
  - Use `Read` para analisar código específico que possa ser relevante
- Sempre compartilhe suas descobertas com o usuário antes de fazer a próxima pergunta

#### 3. Estrutura de Perguntas
Adapte as perguntas conforme o contexto, mas considere estes aspectos:

**Para novas features:**
- Qual problema esta feature resolve?
- Como ela se integra com o sistema atual?
- Quais módulos/componentes serão afetados?
- Há implementações similares que podemos reutilizar?

**Para problemas/bugs:**
- Como reproduzir o problema?
- Quando o problema foi identificado?
- Qual é o impacto atual?
- Há workarounds temporários?

**Para decisões arquiteturais:**
- Qual é o contexto da decisão?
- Quais são as alternativas consideradas?
- Quais são os trade-offs envolvidos?
- Como isso afeta a arquitetura atual?

#### 4. Análise de Código
Durante o brainstorm, sempre que relevante:
- Analise padrões existentes no projeto
- Identifique pontos de integração
- Verifique dependências e impactos
- Procure por código reutilizável
- Documente descobertas importantes

#### 5. Finalização
Quando o brainstorm estiver completo:
- Resuma os pontos principais discutidos
- Confirme se todas as questões importantes foram abordadas
- Salve o brainstorm usando o template em `docs/templates/brainstorm-template.md`
- Crie o arquivo em `docs/brainstorms/[data]-[nome-descritivo].md`

### Templates e Referências

**Template de brainstorm**: `docs/templates/brainstorm-template.md`
**Pasta de destino**: `docs/brainstorms/`

### Formato do Arquivo de Saída
Nomeação: `YYYY-MM-DD-[nome-descritivo].md`
Exemplo: `2024-01-15-sistema-notificacoes.md`

### Dicas Importantes

1. **Seja proativo na pesquisa**: Não espere o usuário pedir para buscar código relevante
2. **Mantenha o foco**: Uma pergunta por vez, mas vá fundo nos tópicos importantes  
3. **Documente descobertas**: Sempre que encontrar algo relevante no código, compartilhe
4. **Confirme entendimento**: Antes de prosseguir, confirme se entendeu corretamente
5. **Use ferramentas**: Task, Grep, Glob e Read são suas ferramentas principais para investigação


### Estrutura do Arquivo Final
O arquivo salvo deve seguir exatamente o template em `docs/templates/brainstorm-template.md`, preenchendo todas as seções com as informações coletadas durante a sessão.