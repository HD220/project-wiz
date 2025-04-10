# ADR-0007: DSL para fluxos de trabalho

## Status

Rejeitada

## Motivo da Rejeição

Esta funcionalidade não será implementada conforme decisão do time, que optou por priorizar outras features no roadmap atual.

## Contexto

Precisamos definir uma DSL (Domain Specific Language) para representar os fluxos de trabalho que automatizam tarefas de desenvolvimento. Essa DSL deve ser fácil de criar, editar e executar.

## Decisão

Vamos usar JSON ou YAML para definir os fluxos de trabalho. Ambos os formatos são legíveis por humanos e fáceis de analisar e gerar programaticamente.

Exemplo de fluxo de trabalho em JSON:

```json
{
  "name": "Geração de código",
  "description": "Gera código a partir de um template",
  "steps": [
    {
      "type": "gerar_codigo",
      "template": "template.txt",
      "output": "output.txt",
      "data": { "name": "valor" }
    }
  ]
}
```

Exemplo de fluxo de trabalho em YAML:

```yaml
name: Geração de código
description: Gera código a partir de um template
steps:
  - type: gerar_codigo
    config:
      template: template.txt
      output: output.txt
      data:
        name: valor
```

## Consequências

- YAML é fácil de ler e escrever.
- Existem muitas bibliotecas para analisar e gerar YAML em diferentes linguagens de programação.
- YAML pode ser facilmente armazenado em arquivos ou bancos de dados.

## Próximos passos

- Definir a estrutura completa da DSL.
- Implementar a engine de execução.

## Estrutura da DSL

```yaml
name: Nome do fluxo de trabalho
description: Descrição do fluxo de trabalho
steps:
  - type: Tipo do passo (e.g., gerar_codigo, analisar_codigo, criar_pr)
    config: Configuração específica para o tipo de passo