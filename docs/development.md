# Desenvolvimento

Este documento fornece uma visão geral do processo de desenvolvimento do Project Wiz. Para guias detalhados, consulte:

- [Configuração de Ambiente Local](../guides/ambiente-local.md)
- [Fluxo de Trabalho Git](../guides/fluxo-git.md)
- [Convenções de Código](../guides/convencoes-codigo.md)

## Visão Geral
O projeto segue os princípios de:
- Desenvolvimento modular
- Revisão por pares
- Integração contínua
- Documentação como código


## Build e Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build:prod
npm run package
```

### Publicação
- Automatizada via GitHub Actions
- Gera artefatos para Windows, Linux e macOS
- Configuração detalhada em `.github/workflows`

## Testes

Consulte a [Estratégia de Testes](../testing-strategy.md) para detalhes completos.

Processo atual:
- Testes unitários: `npm test`
- Testes manuais seguindo checklist
- Code Review obrigatório antes do merge

---

## Segurança

Principais considerações:
- Rate Limiting (configurável via ADR-0032)
- Política de atualização de dependências
- Validação de inputs

Consulte a [Política de Segurança](../security-policy.md) para detalhes completos.

## Referências

- [Guia de Estilo](../style-guide.md)
- [Estratégia de Testes](../testing-strategy.md)
- [Política de Segurança](../security-policy.md)
- [Visão da Arquitetura](../architecture-overview.md)

**Última Atualização**: 2025-04-17
