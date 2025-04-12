## Refatoração dos componentes Access Token Form

### Alterações realizadas

1. **Criação da pasta centralizada**
   - Criada a pasta `src/client/components/access-token-form/` para agrupar todos os componentes relacionados ao Access Token Form.

2. **Movimentação de arquivos**
   - Movidos para a nova pasta:
     - `access-token-form-footer.tsx`
     - `access-token-form-header.tsx`
     - `access-token-form.tsx`
     - `access-token-input-field.tsx`
     - `access-token-permissions-section.tsx`

3. **Criação de export centralizado**
   - Criado o arquivo `src/client/components/access-token-form/index.ts` exportando todos os componentes do módulo.

4. **Atualização de imports**
   - Atualizados os imports em `access-token-form.tsx` para utilizar o novo caminho centralizado.
   - Verificado e mantido o import correto em `repository-settings.tsx`.

5. **Correção de tipagem e uso de hooks**
   - Corrigido o uso do hook `useAccessTokenForm` e o repasse de props para o componente `AccessTokenInputField` conforme a tipagem esperada.

### Arquivos modificados

- `src/client/components/access-token-form-footer.tsx` (movido)
- `src/client/components/access-token-form-header.tsx` (movido)
- `src/client/components/access-token-form.tsx` (movido e refatorado)
- `src/client/components/access-token-input-field.tsx` (movido)
- `src/client/components/access-token-permissions-section.tsx` (movido)
- `src/client/components/access-token-form/index.ts` (criado)
- `src/client/components/repository-settings.tsx` (verificado)
- `src/client/hooks/use-access-token-form.ts` (referenciado para ajuste de uso)

### Observações

- Todos os imports agora utilizam o caminho centralizado `@/components/access-token-form`.
- A estrutura segue os padrões de organização e clean code do projeto.
- Não foram encontrados imports quebrados após a refatoração.

---

### Movimentação de status

- **Data:** 2025-04-11
- **Responsável:** Automação (Roo)
- **Ação:** Movido de `issues/backlog/improvement/ISSUE-0164-Refatorar-access-token-form` para `issues/completed/improvement/ISSUE-0164-Refatorar-access-token-form`
- **Justificativa:** Issue finalizada e transferida para a lista de concluídos conforme fluxo de trabalho do projeto.