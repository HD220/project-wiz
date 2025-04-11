# Bug: Build falha por não resolver módulo nativo `better-sqlite3` no Vite/Rollup

## Descrição
Durante o build (`npm run build`), ocorre o erro:

```
[vite]: Rollup failed to resolve import "better-sqlite3" from "src/core/infrastructure/db/client.ts".
This is most likely unintended because it can break your application at runtime.
If you do want to externalize this module explicitly add it to
`build.rollupOptions.external`
```

## Impacto
- O build do projeto falha.
- O app não pode ser empacotado ou distribuído.

## Causa
- O pacote `better-sqlite3` é uma dependência nativa (C++).
- O Vite/Rollup tenta empacotar o módulo, o que não é suportado.
- Código que usa `better-sqlite3` está sendo incluído no bundle do renderer.

## Propostas de solução
- Adicionar `better-sqlite3` como **externo** na configuração do Vite (`build.rollupOptions.external`).
- Garantir que o código que usa `better-sqlite3` só seja carregado no processo **main** do Electron.
- Usar `require` dinâmico para evitar que o bundler tente empacotar o módulo.
- Refatorar para separar claramente código backend e frontend.

## Critério de aceite
- O build deve ser concluído com sucesso.
- O app deve funcionar corretamente com acesso ao banco SQLite.

## Relacionado a
Task: Build e validação do projeto
