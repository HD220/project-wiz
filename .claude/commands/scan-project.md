# Scan Project for improvements/features/refactor

## Objetivo

Analisar o repositório atual para identificar oportunidades de melhorias, novas funcionalidades ou refatoramentos necessários, gerando documentos em `prps/01-initials/[initial-slug].md` para cada oportunidade identificada.

## Instruções de Execução

1. **Análise Estrutural:**
   - Examine a arquitetura do projeto
   - Identifique padrões de código existentes
   - Analise dependências e tecnologias utilizadas
   - Revise documentação existente

2. **Identificação de Oportunidades:**
   - Funcionalidades ausentes ou incompletas
   - Código que precisa de refatoramento
   - Melhorias de performance
   - Implementação de melhores práticas
   - Correções de débito técnico

3. **Geração de Documentos:**
   - Criar arquivos [initial-slug].md em `prps/01-initials/`
   - Nomear arquivos como `{nome-descritivo}.md`
   - Descrever a oportuniade identificada em alto nivel (a não ser que seja essenciamente tecnica e especifica)

## Template

Para cada oportunidade identificada, use o seguinte template:

```markdown
# {Nome da Funcionalidade/Melhoria}

## Resumo Executivo

{Descrição explicando o que será implementado}

## Contexto e Motivação

{Por que esta implementação é necessária? Qual problema resolve?}

## Escopo

### Incluído:

- {Item específico 1}
- {Item específico 2}
- {Item específico 3}

### Não Incluído:

- {Item que fica fora do escopo}
- {Possíveis extensões futuras}

## Impacto Esperado

- **Usuários:** {Como afeta os usuários finais}
- **Desenvolvedores:** {Como afeta a experiência de desenvolvimento}
- **Sistema:** {Impacto na performance/arquitetura}

## Critérios de Sucesso

- {Critério mensurável 1}
- {Critério mensurável 2}
- {Critério mensurável 3}
```

## Resultado Esperado

Múltiplos arquivos [slug].md salvos em `prps/01-initials/` com oportunidades priorizadas e bem documentadas.
