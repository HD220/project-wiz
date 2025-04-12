# ISSUE-0186: Hooks fora do diretório correto

## Descrição do problema
Foi identificado que o hook `use-documentation.ts` está localizado no diretório de componentes, contrariando a convenção de organização do projeto, que exige que hooks fiquem centralizados em `src/client/hooks/`. Isso dificulta a manutenção, descoberta e reutilização dos hooks.

### Exemplo concreto
- Arquivo: `src/client/components/use-documentation.ts`

## Recomendação de correção/refatoração
Mover o arquivo `use-documentation.ts` para o diretório `src/client/hooks/`, renomeando para seguir o padrão kebab-case se necessário. Atualizar todos os imports no projeto para refletir a nova localização.

## Justificativa
- **ADR-0012**: Clean Architecture — separação clara de responsabilidades e organização modular.
- **ADR-0015**: Padrão de nomenclatura kebab-case para arquivos e pastas.
- **SDR-0001**: Código-fonte deve ser claro e de fácil manutenção.

## Contexto para execução autônoma
- Mover `src/client/components/use-documentation.ts` para `src/client/hooks/use-documentation.ts`.
- Garantir que o nome do arquivo siga o padrão kebab-case.
- Atualizar todos os imports que referenciam o hook.