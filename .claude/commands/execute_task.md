## Contexto do Sistema

Você está implementando uma refatoração completa do **Project Wiz**, uma aplicação Electron que atua como uma "fábrica de software autônoma"
usando agentes de IA. O sistema atual tem problemas de:

- Violações dos princípios SOLID, KISS, YAGNI
- Duplicação massiva de código (60-70%)
- Acoplamento forte entre módulos
- Complexidade desnecessária

## Sua Missão

Você deve implementar a tarefa especificada em `$ARGUMENTS` seguindo **rigorosamente** as instruções, princípios e padrões estabelecidos.
Esta é uma refatoração **sequencial** - não há necessidade de manter compatibilidade com código antigo.

## Instruções de Execução

### 1. Leitura e Análise

# Leia a tarefa específica

Read: $ARGUMENTS

1. Preparação

- Analise as dependências listadas
- Verifique se todas as dependências estão 100% completas
- Se alguma dependência não estiver completa, PARE e informe

2. Planejamento da Implementação

- Crie um plano detalhado baseado na tarefa
- TodoWrite: Criar todos os itens do checklist como tarefas individuais
- Organize as tarefas na ordem lógica de implementação
- Marque a primeira tarefa como "in_progress"

3. Implementação Rigorosa

SEMPRE siga esta ordem:

1. Estrutura de Pastas

- Crie todas as pastas necessárias
- Siga exatamente a estrutura especificada na tarefa

2. Interfaces e Abstrações

- Implemente interfaces primeiro
- Use TypeScript rigorosamente
- Documente com JSDoc

3. Implementações Concretas

- Implemente classes base
- Siga princípios SOLID
- Use padrões especificados

4. Integração

- Atualize arquivos de índice
- Registre novos componentes
- Valide integrações

5. Padrões Obrigatórios

Convenções de Código:

- Variáveis/funções: camelCase
- Classes/Tipos: PascalCase
- Constantes: SCREAMING_SNAKE_CASE
- Arquivos: kebab-case

Princípios SOLID:

- SRP: Uma responsabilidade por classe
- OCP: Aberto para extensão, fechado para modificação
- LSP: Substituição de Liskov
- ISP: Segregação de interfaces
- DIP: Inversão de dependências

Padrões de Qualidade:

- Classes pequenas (< 200 linhas)
- Métodos pequenos (< 20 linhas)
- Sem aninhamento > 3 níveis
- Sem duplicação de código

5. Validação Obrigatória

Após cada implementação:

# Execute comandos de qualidade

npm run format
npm run lint
npm run type-check

6. Checklist de Finalização

Marque cada item como completo no TodoWrite:

- Estrutura: Todas as pastas/arquivos criados
- Implementação: Todos os componentes implementados
- Qualidade: format, lint, type-check passando
- Integração: Componentes registrados e integrados
- Documentação: JSDoc e comentários adicionados
- Validação: Checklist da tarefa 100% completo

Diretrizes Específicas

❌ O que NÃO fazer:

- Não pule etapas do checklist
- Não implemente funcionalidades não especificadas
- Não use padrões diferentes dos especificados
- Não deixe códigos comentados ou TODOs
- Não commit até tudo estar 100% completo
- Não implemente testes este é um MVP e esta em processo de refatoração completo

✅ O que fazer:

- Siga rigorosamente a tarefa especificada
- Documente interfaces públicas
- Use padrões estabelecidos
- Valide cada etapa antes de continuar

Formato de Resposta

# Implementação da [NOME_DA_TAREFA]

## 📋 Análise da Tarefa

[Resumo da tarefa e dependências validadas]

## 🎯 Plano de Implementação

[TodoWrite com todos os itens do checklist]

## 🔧 Implementação

### Estrutura de Pastas

[Criação das pastas necessárias]

### Implementação dos Componentes

[Implementação sequencial de cada componente]

### Integração

[Integração com sistema existente]

## ✅ Validação Final

[Execução de todos os comandos de qualidade]

## 📝 Conclusão

[Resumo do que foi implementado e próximos passos]

Critérios de Sucesso

A implementação será considerada EXEMPLAR quando:

1. ✅ 100% do checklist da tarefa completado
2. ✅ Todos os comandos de qualidade passando
3. ✅ Princípios SOLID aplicados corretamente
4. ✅ Padrões de código seguidos rigorosamente
5. ✅ Documentação completa e clara
6. ✅ Integração funcionando perfeitamente

Lembre-se

- Qualidade é mais importante que velocidade
- Siga as instruções ao pé da letra
- Valide com os comandos de qualidade antes de finalizar
- Documente decisões importantes
- Mantenha foco na tarefa específica

---

Agora execute a tarefa em $ARGUMENTS seguindo estas diretrizes rigorosamente.
