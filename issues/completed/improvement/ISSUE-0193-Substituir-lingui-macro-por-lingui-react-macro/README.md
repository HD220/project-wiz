# ISSUE-0193: Substituir `@lingui/macro` por `@lingui/react/macro` em todo o projeto

## Descrição do problema

O projeto utiliza o pacote `@lingui/macro` para internacionalização em diversos componentes e hooks. No entanto, conforme a documentação oficial do Lingui, o uso de `@lingui/macro` está deprecado e deve ser substituído por `@lingui/react/macro` para garantir compatibilidade futura, evitar warnings e seguir as melhores práticas de manutenção.

## Exemplos concretos

Ocorrências encontradas (arquivo, linha):

- `src/client/hooks/use-repository-metrics.ts` (linha 2): `import { t } from '@lingui/macro';`
- `src/client/hooks/use-documentation-aria.ts` (linha 2): `import { t } from "@lingui/macro";`
- `src/client/components/model-settings.tsx` (linha 8): `import { Trans } from "@lingui/macro";`
- `src/client/components/model-status.tsx` (linha 1): `import { Trans } from "@lingui/macro";`
- `src/client/components/model-configuration.tsx` (linha 3): `import { Trans } from "@lingui/macro";`
- `src/client/components/file-list.tsx` (linha 14): `import { t } from "@lingui/macro";`
- `src/client/components/dashboard.tsx` (linha 2): `import { t } from '@lingui/macro';`
- `src/client/components/access-token-form/access-token-permissions-section.tsx` (linha 3): `import { Trans } from "@lingui/macro";`
- `src/client/components/access-token-form/access-token-input-field.tsx` (linha 5): `import { Trans } from "@lingui/macro";`
- `src/client/components/access-token-form/access-token-form.tsx` (linha 3): `import { Trans } from "@lingui/macro";`
- `src/client/components/access-token-form/access-token-form-header.tsx` (linha 2): `import { Trans } from "@lingui/macro";`
- `src/client/components/access-token-form/access-token-form-footer.tsx` (linha 4): `import { Trans } from "@lingui/macro";`

## Recomendação de correção/refatoração

Substituir todas as importações de `@lingui/macro` por `@lingui/react/macro` nos arquivos listados e em qualquer outro arquivo do projeto que utilize o macro deprecado.

Exemplo de correção:
```diff
- import { Trans } from "@lingui/macro";
+ import { Trans } from "@lingui/react/macro";
```

## Justificativa

- **Manutenção e compatibilidade:** O uso de pacotes deprecados pode causar problemas de compatibilidade em futuras atualizações e gerar warnings desnecessários.
- **Aderência às regras do projeto:** Seguir as melhores práticas e manter as dependências atualizadas está alinhado com Clean Code, Clean Architecture e as decisões do projeto (ver ADR-0002, ADR-0012).
- **Prevenção de technical debt:** Corrigir agora evita acúmulo de dívida técnica e facilita futuras manutenções.

---