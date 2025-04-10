# ISSUE-0094 - Extrair persistência do tema para serviço externo

## Descrição
Atualmente, o componente `ThemeProvider` acessa diretamente o `localStorage` para salvar e recuperar o tema. Isso viola a separação de camadas da Clean Architecture, misturando lógica de UI com infraestrutura.

## Objetivo
- Criar um serviço dedicado para persistência do tema
- O `ThemeProvider` deve depender desse serviço, facilitando testes e manutenção
- Não alterar funcionalidades, apenas isolar a responsabilidade

## Contexto
Identificado na análise da pasta `src/client/components/providers`.

## Critérios de aceitação
- Código do `ThemeProvider` não deve acessar diretamente o `localStorage`
- Serviço deve ser facilmente mockável para testes
- Manter compatibilidade com o funcionamento atual

---

## Status: **Concluído**

### Resumo da implementação
- Criado o serviço `src/client/services/theme-storage.ts` com funções para obter, definir e limpar o tema no `localStorage`.
- O `ThemeProvider` foi refatorado para utilizar exclusivamente esse serviço, removendo qualquer acesso direto ao `localStorage`.
- A lógica de detecção do tema do sistema foi mantida separada em `system-theme-detector.ts`.
- A solução está alinhada com Clean Architecture, isolando infraestrutura da camada de UI e facilitando testes.

### Pendências
- Não foram identificadas pendências relacionadas a esta melhoria.