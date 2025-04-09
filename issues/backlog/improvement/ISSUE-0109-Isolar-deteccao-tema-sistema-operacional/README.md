# ISSUE-0109 - Isolar detecção do tema do sistema operacional em adaptador externo

## Descrição
Atualmente, o componente `ThemeProvider` utiliza diretamente `window.matchMedia` para detectar o tema do sistema operacional. Isso mistura lógica de UI com dependência da plataforma, violando a Clean Architecture.

## Objetivo
- Criar um adaptador dedicado para detecção do tema do sistema operacional
- O `ThemeProvider` deve depender desse adaptador, facilitando testes e manutenção
- Não alterar funcionalidades, apenas isolar a responsabilidade

## Contexto
Identificado na análise da pasta `src/client/components/providers`.

## Critérios de aceitação
- Código do `ThemeProvider` não deve acessar diretamente `window.matchMedia`
- Adaptador deve ser facilmente mockável para testes
- Manter compatibilidade com o funcionamento atual