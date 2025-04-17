# Configuração de Ambiente Local

## Visão Geral
Guia completo para configurar o ambiente de desenvolvimento do Project Wiz em máquinas locais, incluindo pré-requisitos, instalação e configurações recomendadas.

## Pré-requisitos
- **Node.js**: Versão 18+ (recomendado LTS)
- **npm**: Versão 9+
- **Git**: Versão 2.25+
- **Editor de Código**: VS Code com extensões:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)

## Instalação
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/project-wiz.git
cd project-wiz
```

2. Instale as dependências:
```bash
npm install
```

## Configuração Avançada
### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:
```ini
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

### Configurações do VS Code
Recomendações de settings.json:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Solução de Problemas
| Problema | Causa Possível | Solução |
|----------|----------------|---------|
| Erro ao instalar dependências | Versão incorreta do Node.js | Usar nvm ou atualizar Node |
| ESLint não funciona | Extensão não instalada | Instalar ESLint no VS Code |
| Build falha | Variáveis de ambiente faltando | Verificar arquivo .env |

## Histórico de Versões
| Versão | Data       | Mudanças          |
|--------|------------|-------------------|
| 1.0.0  | 2025-04-17 | Versão inicial    |

## Links Relacionados
- [Guia de Desenvolvimento](../development.md)
- [Estratégia de Testes](../testing-strategy.md)