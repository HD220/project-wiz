# Segurança no Project Wiz

## Worker LLM
- Isolamento obrigatório em processo separado
- Validação de parâmetros:
  - Temperatura deve estar entre 0.1 e 2.0
  - Máximo de tokens entre 1 e 4096
  - ModelPath deve apontar para diretório local
- Restrições:
  - Acesso apenas ao diretório de modelos
  - Proibido acesso a outros diretórios do usuário

## Armazenamento
- Todos os dados ficam na máquina do usuário
- Modelos em `project-wiz/llama/models`
- Conversas em diretório local

## GitHub
- PATs (Personal Access Tokens) com escopo mínimo (repo)
- Armazenamento seguro no keychain do sistema operacional
- Escutar apenas repositórios autorizados
