# ADR-0011: Migração para ES Modules e Atualização do Target ECMAScript

## Status

Rejeitada

## Motivo da Rejeição

Esta funcionalidade não será implementada conforme decisão do time, que optou por priorizar outras features no roadmap atual.

## Contexto

O projeto atualmente utiliza `commonjs` como sistema de módulos e `ES2020` como target ECMAScript no `tsconfig.json`. A migração para ES Modules (ESM) e a atualização do target para `ESNext` podem trazer os seguintes benefícios:

- Melhor compatibilidade com o ecossistema JavaScript moderno.
- Melhor desempenho da aplicação.
- Acesso a novas funcionalidades da linguagem.
- Possível redução do tamanho do bundle.

## Decisão

Recomenda-se migrar para ES Modules (ESM) e atualizar o target do ECMAScript para `ESNext`.

## Consequências

**Positivas:**

- Melhor compatibilidade com o ecossistema JavaScript moderno.
- Melhor desempenho da aplicação.
- Acesso a novas funcionalidades da linguagem.
- Possível redução do tamanho do bundle.

**Negativas:**

- Possível incompatibilidade com dependências (deve ser verificado).
- Possível necessidade de polyfills para navegadores mais antigos (depende das funcionalidades utilizadas).
- Necessidade de refatoração do código existente para usar `import` e `export`.
- Possível necessidade de ajustes nas ferramentas de build.

## Plano de Migração

1. **Atualizar `target` para `ESNext`:**
   - Modificar o arquivo `tsconfig.json` para atualizar o target para `ESNext`.
   ```json
   {
     "compilerOptions": {
       "target": "ESNext"
     }
   }
   ```
2. **Migrar para ES Modules (ESM):**
   - Modificar o arquivo `tsconfig.json` para atualizar o module para `ESNext` ou `ES2020` (ou superior).
   ```json
   {
     "compilerOptions": {
       "module": "ESNext"
     }
   }
   ```
   - Adicionar `"type": "module"` no `package.json`.
   - Substituir `require` por `import` e `module.exports` por `export` no código.
   - Renomear arquivos `.js` para `.mts` (para módulos TypeScript) ou `.cts` (para CommonJS TypeScript, se necessário).
3. **Verificar Dependências:**
   - Analisar as dependências no `package.json` e verificar se elas suportam ESM.
   - Se alguma dependência não suportar ESM, considerar alternativas ou usar wrappers.
4. **Atualizar Ferramentas de Build:**
   - Verificar se as ferramentas de build (Electron Forge, Vite) precisam de configurações adicionais para suportar ESM.
5. **Testes:**
   - Executar os testes da aplicação para garantir que não haja regressões.
   ```bash
   npm test
   ```
6. **Verificar Funcionalidade:**
   - Verificar se a aplicação continua funcionando corretamente no Electron e em diferentes navegadores.
7. **Monitorar:**
   - Monitorar o tamanho do bundle para garantir que não haja um aumento significativo.
   - Realizar testes de desempenho antes e depois da atualização para garantir que não haja regressões.

## Observações

- É importante verificar a compatibilidade das dependências com ESM antes de realizar a migração.
- Considerar a necessidade de polyfills para navegadores mais antigos.
- A migração deve ser feita de forma gradual, convertendo módulos individualmente.

## Próximos Passos

1. Mudar para o modo "Developer" para atualizar o `tsconfig.json` e o `package.json`.
2. Executar os testes para verificar se há alguma regressão.