# Contexto do Projeto

## Visão Geral do Projeto

Project Wiz é uma interface ElectronJS para execução de modelos LLM (Large Language Models) localmente. O objetivo principal é fornecer uma interface amigável para interação com LLMs locais, permitindo:

- Gerenciamento de modelos locais
- Execução de prompts
- Configuração de parâmetros
- Histórico de interações

## Estado Atual

O projeto está em desenvolvimento ativo com as seguintes características implementadas:

- Interface ElectronJS com React
- Integração com modelos LLM locais
- Sistema de internacionalização (i18n)
- Componentes UI baseados em shadcn/ui
- Comunicação IPC entre processos main/renderer

## Arquitetura

### Modelo de Domínio

O sistema é organizado em três camadas principais:

1. **Camada de Interface**: Componentes React + Electron
2. **Camada de Serviços**: Lógica de negócios e comunicação com LLMs
3. **Camada de Modelos**: Integração com bibliotecas de LLM locais

### Componentes Principais

- **src/client**: Interface do usuário (React)
- **src/core**: Lógica principal e comunicação Electron
- **src/locales**: Internacionalização (i18n)
- **docs**: Documentação do sistema

## Iniciativas Ativas

1. **Documentação do Sistema**: Em andamento - Criação da documentação abrangente
2. **Integração com LLMs**: Em desenvolvimento - Suporte a múltiplos modelos
3. **Internacionalização**: Parcialmente implementada - Traduções em pt-BR e en

## Stakeholders Principais

- **Desenvolvedores**: Manutenção e evolução do sistema
- **Usuários Finais**: Interação com modelos LLM locais

## Dívida Técnica

- Documentação incompleta
- Testes automatizados limitados
- Refatoração de alguns componentes legados

## Decisões Recentes

- 01/04/2025 - Adoção do shadcn/ui para componentes
- 15/03/2025 - Implementação de internacionalização
- 10/03/2025 - Estruturação da documentação

## Próximos Marcos

- 30/04/2025 - Versão 1.0 com documentação completa
- 15/05/2025 - Suporte a múltiplos modelos LLM
- 01/06/2025 - Sistema de plugins

## Desafios Conhecidos

- Performance com modelos grandes
- Gerenciamento de memória
- Compatibilidade entre plataformas

## Índice de Documentação

- [README.md](../README.md)
- [Índice Principal](./index.md)
- [Status da Documentação](./documentation-status.md)
