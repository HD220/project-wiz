# Templates de Documentação

Este diretório contém templates padronizados para vários tipos de documentação do projeto.

## Templates Disponíveis

### [Documentação Técnica](./technical-documentation.md)
Para documentar componentes, serviços e features técnicas.

### [ADR (Architecture Decision Record)](./ADR.md)
Para registrar decisões arquiteturais importantes.

### [GDR (Governance Decision Record)](./GDR.md)
Para registrar decisões de governança.

### [SDR (Style Decision Record)](./SDR.md)
Para registrar decisões de estilo e padrões.

### [Documentação de API](./api-inventory.md)
Para documentar endpoints e contratos de API.

## Como Usar

1. Selecione o template apropriado para seu tipo de documentação
2. Copie o template para um novo arquivo
3. Preencha todas as seções relevantes
4. Remova seções não aplicáveis
5. Adicione exemplos específicos quando possível

## Boas Práticas

- Mantenha um tom consistente em toda a documentação
- Atualize os templates conforme as necessidades do projeto evoluem
- Consulte o [Guia de Estilo](../style-guide.md) para formatação
- Adicione diagramas e exemplos de código quando relevante

## Exemplo de Uso

```bash
# Criar nova documentação técnica
cp technical-documentation.md ../new-component.md

# Criar novo ADR
cp ADR.md ../adr/ADR-0019-nova-decisao.md

# Criar novo GDR (Governance Decision Record)
cp GDR.md ../gdr/GDR-0005-nova-decisao.md

# Criar novo SDR (Style Decision Record)
cp SDR.md ../sdr/SDR-0003-novo-padrao.md
```

## Boas Práticas Adicionais

- Sempre verifique a versão mais recente dos templates
- Consulte o [Guia de Estilo](../style-guide.md) antes de criar novos documentos
- Atualize o [documentation-status.md](../documentation-status.md) após criar/atualizar documentos

## Histórico de Versões

| Data       | Versão | Mudanças                |
|------------|--------|-------------------------|
| 2025-04-16 | 1.2.0  | Atualização templates GDR/SDR |
| 2025-04-16 | 1.1.0  | Adicionado template técnico |
| 2025-04-05 | 1.0.0  | Versão inicial          |
