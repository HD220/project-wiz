# ADR-0002: Uso de componentes shadcn-ui

## Status

🟢 **Aceito**

---

## Contexto

O projeto utiliza componentes UI da biblioteca shadcn-ui na pasta `src/client/components/ui`. Estes componentes são mantidos pela biblioteca e **não devem ser modificados**.

---

## Decisão

- Os componentes na pasta `ui` são do shadcn-ui e **não devem ser documentados** no projeto.
- Não devem ser feitas alterações nestes componentes.
- Qualquer necessidade de customização deve ser feita criando novos componentes customizados fora da pasta `ui`.

---

## Consequências

- Redução da carga de manutenção de componentes UI.
- Garantia de consistência visual através da biblioteca.
- Necessidade de criar componentes customizados quando os do shadcn-ui não atendem.

---

## Alternativas Consideradas

- Modificar diretamente os componentes do shadcn-ui — rejeitado por dificultar atualizações futuras.
- Utilizar outra biblioteca de componentes — rejeitado por já termos padronizado o uso do shadcn-ui.

---

## Links Relacionados

- [Site oficial shadcn-ui](https://ui.shadcn.com/)
