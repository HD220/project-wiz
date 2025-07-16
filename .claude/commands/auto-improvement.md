## Análise e Refatoração Prática

### 1. ANÁLISE REAL DA SITUAÇÃO

**Mapeie os problemas reais:**

- Onde está difícil de encontrar código?
- Quais arquivos estão grandes demais?
- Onde tem código duplicado?
- Qual parte dá mais trabalho para manter?
- Onde falta tipagem adequada?
- Quais componentes fazem coisa demais?

**Identifique por dor real:**

- **URGENTE**: Código que quebra frequentemente
- **IMPORTANTE**: Código difícil de manter/encontrar
- **ÚTIL**: Melhorias que facilitam desenvolvimento
- **PODE ESPERAR**: Otimizações menores

### 2. ESTRATÉGIAS PRÁTICAS DE REFATORAÇÃO

**Para cada execução, escolha uma área que dói:**

#### B. Simplificação de Layouts e Rotas

- Criar 2-3 layouts máximo (MainLayout, AuthLayout, etc.)
- Rotas agrupadas por funcionalidade
- Lazy loading onde faz sentido
- Loading states simples
- Navegação clara e previsível

#### C. Estado e Dados Organizados

- Store Zustand por feature quando necessário
- Estado React local quando faz sentido
- Eliminação de prop drilling óbvio
- Validações Zod centralizadas e reutilizadas
- Forms com React Hook Form bem estruturados

#### D. Componentes Práticos

- Componentes pequenos e focados
- Máximo 100 linhas por componente
- Nomes descritivos e óbvios
- Props tipadas adequadamente
- Reutilização real, não forçada

#### E. Comunicação Main/Renderer Simples

- IPC organizado por funcionalidade
- Tipos compartilhados
- Error handling adequado
- Abstrações apenas quando necessário

### 3. DIRETRIZES PRÁTICAS

**Object Calisthenics aplicados na prática:**

- Indentação máxima de 2 níveis
- Evitar else (usar early returns)
- Objetos pequenos e focados
- Nomes que explicam o que fazem
- Funções pequenas (máximo 20 linhas)

**KISS aplicado:**

- Se não está quebrado, não mexe
- Solução mais simples que funciona
- Evitar abstrações desnecessárias
- Código que qualquer dev entende
- Convenções óbvias

**Organização por funcionalidade:**

- Agrupar por feature, não por tipo de arquivo
- Colocar junto o que muda junto
- Separar apenas quando necessário
- Estrutura que facilita encontrar código

### 4. PROCESSO PRÁTICO DE EXECUÇÃO

**Para cada execução:**

1. **Identifique a dor** mais chata atualmente
2. **Analise os arquivos** relacionados
3. **Faça um plano simples** de reorganização

**Exemplo de saída esperada:**

```
PROBLEMA IDENTIFICADO: Componentes de formulário espalhados e duplicados
ARQUIVOS ANALISADOS: 15 arquivos com forms similares
SOLUÇÃO PROPOSTA:
- Criado components/forms/ com 3 componentes base
- Consolidado validações Zod em utils/schemas.ts
- Removido 8 arquivos duplicados
- Padronizado error handling
RESULTADO: Menos código, mais consistência, mais fácil manter
PRÓXIMA DOR: Estados sendo passados por 4 níveis de componentes
```

### 5. CRITÉRIOS DE QUALIDADE REAL

**Cada refatoração deve:**

- Resolver uma dor real
- Manter funcionalidade exata
- Deixar código mais fácil de entender
- Reduzir duplicação
- Melhorar tipagem TypeScript
- Facilitar manutenção

**Sinais de que está no caminho certo:**

- Menos linhas de código total
- Mais fácil encontrar onde mexer
- Menos bugs aparecem
- Mais fácil adicionar features
- Menos tempo para entender código

**Evite:**

- Abstrações complexas
- Patterns desnecessários
- Separação excessiva
- Código que ninguém entende
- Soluções over-engineered

### 6. ABORDAGEM PROGRESSIVA PRAGMÁTICA

**Sequência baseada em dor:**

1. **Primeira execução**: Resolver a maior dor atual
   - Exemplo: Componentes duplicados, props drilling, etc.

2. **Segunda execução**: Organizar estrutura de pastas
   - Apenas se estiver realmente bagunçado

3. **Terceira execução**: Simplificar estados e forms
   - Consolidar validações, estados desnecessários

4. **Quarta execução**: Otimizar layouts e rotas
   - Apenas se navegação estiver confusa

5. **Quinta execução**: Limpar comunicação IPC
   - Apenas se estiver complicado

---

Analise a codebase e identifique qual é a maior dor atual para desenvolver e manter. Foque em resolver esse problema específico com a solução mais simples possível, mantendo a funcionalidade exata mas melhorando significativamente a experiência de desenvolvimento.

Siga as diretrizes práticas acima para:

1. Identificar problemas reais (não teóricos)
2. Implementar soluções simples e efetivas
3. Manter funcionalidade exata
4. Melhorar experiência de desenvolvimento
5. Documentar mudanças feitas

Utilize a tool Task para executar o processo de forma efetiva.
