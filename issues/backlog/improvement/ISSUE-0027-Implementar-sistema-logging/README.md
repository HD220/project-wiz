# Implementar sistema de logging centralizado

## Descrição

Atualmente o projeto não possui um sistema de logging estruturado, utilizando apenas `console.log` de forma esparsa. Isso dificulta a manutenção e o debug do sistema.

## Objetivo

Implementar um sistema de logging centralizado que:

1. Forneça uma interface unificada para todo o sistema
2. Suporte diferentes níveis de log (info, warn, error)
3. Permita persistência em arquivo
4. Seja facilmente integrável com os serviços existentes

## Requisitos Técnicos

- **Backend**: Implementar em `core/services/logging`
- **Frontend**: Criar interface para consumo no client
- **Níveis de log**: info, warn, error
- **Persistência**: Armazenar logs em arquivo com rotação
- **Integração**: Substituir todos os `console.log` existentes

## Critérios de Aceitação

- [ ] Serviço de logging implementado no backend
- [ ] Interface para frontend criada
- [ ] Todos os `console.log` substituídos
- [ ] Logs sendo persistidos em arquivo
- [ ] Documentação atualizada

## Dependências

- Nenhuma

## Observações

O sistema deve ser flexível para permitir futuras extensões como:

- Envio de logs para serviços externos
- Filtros de log por nível
- Formatação customizada
