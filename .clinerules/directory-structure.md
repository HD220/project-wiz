# Estrutura de Diretórios

## Principais Diretórios
- **memory-bank/**: Documentação do projeto
- **src/**: Código fonte principal
  - **client/**: Interface do usuário
    - **components/**: Componentes React
    - **hooks/**: Custom hooks
    - **lib/**: Utilitários e helpers
    - **styles/**: Estilos globais
  - **core/**: Lógica principal da aplicação
    - **llama/**: Integração com node-llama-cpp
  - **locales/**: Arquivos de internacionalização

## Arquivos de Configuração
- **tsconfig.json**: Configurações do TypeScript
- **.eslintrc.json**: Configurações do ESLint
- **package.json**: Dependências e scripts
- **vite.*.config.mts**: Configurações do Vite

## Boas Práticas
- Manter componentes em diretórios específicos
- Separar lógica de negócio da interface
- Organizar arquivos por funcionalidade
