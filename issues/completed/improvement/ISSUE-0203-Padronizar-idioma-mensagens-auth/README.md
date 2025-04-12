# ISSUE-0203: Padronizar idioma das mensagens internas nos componentes de autenticação

## Tipo

improvement

## Contexto

Os arquivos do diretório `src/client/components/auth` — `auth-provider.tsx`, `login-form.tsx`, `register-form.tsx` e `route-guard.tsx` — utilizam mensagens e textos internos em português. Esta prática viola a [SDR-0001](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md), que determina que todo o código-fonte, incluindo nomes de variáveis, funções, comentários e mensagens internas, deve ser escrito em inglês.

A padronização do idioma é fundamental para garantir a consistência, facilitar a colaboração internacional e alinhar o projeto às melhores práticas de desenvolvimento de software.

## Escopo

- Identificar e revisar todas as mensagens/textos internos em português nos arquivos:
  - `src/client/components/auth/auth-provider.tsx`
  - `src/client/components/auth/login-form.tsx`
  - `src/client/components/auth/register-form.tsx`
  - `src/client/components/auth/route-guard.tsx`
- Adequar todas as mensagens/textos internos para o idioma inglês **ou** implementar mecanismo de internacionalização (i18n) conforme as diretrizes do projeto.
- Garantir que, após a adequação, não haja mais mensagens internas em português nestes arquivos.

## Critérios de Aceite

- Todos os textos e mensagens internas dos arquivos listados devem estar em inglês ou utilizar o sistema de internacionalização adotado pelo projeto.
- A issue deve ser validada com base na conformidade com a SDR-0001.
- Não deve haver impacto negativo na experiência do usuário ou na funcionalidade dos componentes.

## Referências

- [SDR-0001 - Código-fonte em inglês](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- [Guia de Internacionalização](../../../docs/i18n-guide.md)