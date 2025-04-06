# ADR-0002: Uso de Componentes shadcn-ui

## Status

Aceito

## Contexto

O projeto utiliza componentes UI da biblioteca shadcn-ui na pasta `src/client/components/ui`. Estes componentes são mantidos pela biblioteca e não devem ser modificados.

## Decisão

- Os componentes na pasta `ui` são do shadcn-ui e não devem ser documentados no projeto
- Não devem ser feitas alterações nestes componentes
- Qualquer necessidade de customização deve ser feita criando novos componentes customizados fora da pasta `ui`

## Consequências

- Redução da carga de manutenção de componentes UI
- Garantia de consistência visual através da biblioteca
- Necessidade de criar componentes customizados quando os do shadcn-ui não atendem
