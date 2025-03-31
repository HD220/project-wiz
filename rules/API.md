# Interfaces do Project Wiz

## GitHub
- Configuração:
  - Token de acesso
  - Repositórios monitorados
  - Eventos escutados (issues, pull_request)
  - Intervalo de polling (opcional)

- Eventos:
  - Tipo (issue_opened, pr_merged, etc)
  - Repositório origem
  - Dados do evento

## Worker LLM
- Configuração:
  - Caminho do modelo (obrigatório)
  - Parâmetros:
    - Temperatura (0.1-2.0)
    - Máximo de tokens (1-4096)
    - Top-p (0-1)
    - Repeat penalty (opcional)
  - Callbacks:
    - onTextChunk(chunk: string)

- Métodos:
  - prompt(input: string, options?: object): Promise<string>

## Hooks
- Identificador único
- Gatilho (github_event, app_start)