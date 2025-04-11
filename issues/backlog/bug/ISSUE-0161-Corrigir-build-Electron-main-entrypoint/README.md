# ISSUE-0161 - Corrigir build Electron: main entrypoint não encontrado

## Problema

Durante o processo de build do projeto com `npm run build`, o Electron Forge **não consegue localizar o arquivo principal do processo Electron**:

```
Error: The main entry point to your app was not found. Make sure "D:\Documentos\Pessoal\Github\project-wiz\.vite\build\main.js" exists and does not get ignored by your ignore option
```

## Impacto

- O build **não gera o pacote Electron final**.
- O app **não pode ser distribuído ou iniciado via pacote**.
- Bloqueia o fluxo de deploy e testes integrados.

## Logs relevantes

- O Vite gera os bundles do renderer e preload normalmente.
- O Electron Forge falha ao empacotar, pois `.vite/build/main.js` está ausente.
- Warnings de deprecated e CSS não impedem o build.
- Diversos avisos `DeprecationWarning: Calling promisify on a function that returns a Promise`.

## Diagnóstico inicial

- O bundle do processo principal **não está sendo gerado** ou está em **local incorreto**.
- Pode ser problema na configuração do **`vite.main.config.mts`** ou **`forge.config.ts`**.
- O arquivo de entrada do Electron (`main.ts` ou similar) **não está sendo compilado para `.vite/build/main.js`**.
- O Electron Forge espera esse arquivo para empacotar o app.

## Próximos passos recomendados

1. **Verificar configurações do Vite para o processo principal**:
   - Confirme se o `vite.main.config.mts` está gerando o bundle no local correto.
   - Ajuste `build.outDir` se necessário.

2. **Verificar configurações do Electron Forge**:
   - Confirme se o caminho do entrypoint está correto.
   - Ajuste o `main` no `package.json` ou no `forge.config.ts`.

3. **Garantir que o arquivo `main.js` seja gerado**:
   - Execute `npm run build` e valide a existência do arquivo.
   - Se não existir, revise o processo de build do main process.

4. **Revisar `.gitignore` e configurações de ignore do Forge**:
   - Certifique-se que `.vite/build/main.js` **não está sendo ignorado**.

5. **Após ajustes, reexecutar o build e validar**.

---

**Status:** Build bloqueado até correção deste problema.