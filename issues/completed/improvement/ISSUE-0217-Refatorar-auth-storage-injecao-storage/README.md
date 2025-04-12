# Refatorar auth-storage para permitir injeção de storage

## Arquivo alvo
`src/client/hooks/auth-storage.ts`

## Problemas identificados

- **Dependência direta de `localStorage`:** O hook utiliza diretamente o objeto global `localStorage`, o que dificulta a criação de testes automatizados, pois não é possível substituir facilmente o mecanismo de armazenamento.

## Refatoração necessária

- Modificar o hook para permitir a injeção de um storage alternativo (por exemplo, via parâmetro ou contexto), tornando possível utilizar mocks ou implementações customizadas em testes.

## Justificativa

A refatoração é necessária para garantir aderência aos princípios de Clean Code e Clean Architecture, especialmente no que diz respeito à testabilidade e desacoplamento de dependências externas. Isso facilitará a manutenção e a criação de testes automatizados robustos.

## Critérios de aceitação

- O hook deve aceitar um storage alternativo, além do `localStorage` padrão.
- Deve ser possível utilizar mocks de storage em testes unitários.
- Não deve haver dependência rígida de `localStorage` no código principal.
- Cobertura de testes deve ser ampliada para cenários com storage alternativo.