# Reorganização da Estrutura de Pastas

## Objetivo
Reorganizar a estrutura de pastas do projeto para melhorar:
- Clareza na localização de arquivos
- Manutenibilidade do código
- Escalabilidade para novas funcionalidades

## Problemas Atuais
1. Pastas misturam arquivos de diferentes tipos (configuração, código, documentação)
2. Algumas pastas poderiam ser melhor organizadas por domínio/funcionalidade
3. Estrutura atual dificulta a localização de arquivos relacionados

## Proposta de Nova Estrutura

```
project-wiz/
├── .github/           # Configurações do GitHub
├── .vscode/           # Configurações do VSCode
├── build/             # Artefatos de build
├── configs/           # Arquivos de configuração
│   ├── vite/          # Configurações do Vite
│   ├── typescript/    # Configurações do TypeScript
│   └── jest/          # Configurações de testes
├── docs/              # Documentação (mantido)
├── issues/            # Issues (mantido)
├── packages/          # Código fonte organizado por domínio
│   ├── core/          # Funcionalidades centrais
│   ├── ui/            # Componentes de UI
│   ├── api/           # Integrações com APIs
│   └── shared/        # Utilitários compartilhados
└── scripts/           # Scripts auxiliares
```

## Tarefas
1. [ ] Criar ADR para documentar a decisão de estrutura
2. [ ] Mover arquivos para a nova estrutura
3. [ ] Atualizar imports e referências
4. [ ] Atualizar configurações de build
5. [ ] Validar funcionamento após reorganização

## Critérios de Aceitação
- [ ] Todos os arquivos estão nas pastas corretas
- [ ] Builds e testes continuam funcionando
- [ ] Documentação atualizada refletindo nova estrutura