# Handoff Técnico — Remover importação não utilizada em `repositories/index.tsx`

## Contexto
Durante a análise do arquivo `src/client/pages/repositories/index.tsx`, foi identificado que o componente `Dashboard` está sendo importado, porém não é utilizado em nenhuma parte do código.

## Problema
Manter importações não utilizadas:
- Gera código morto
- Aumenta o ruído visual
- Pode confundir desenvolvedores na manutenção
- Pode impactar levemente o bundle final

## Solução proposta
Remover a importação do `Dashboard` para manter o código limpo e alinhado às boas práticas.

## Impacto esperado
- Nenhuma alteração funcional na página
- Código mais limpo e fácil de manter
- Redução mínima no tamanho do bundle