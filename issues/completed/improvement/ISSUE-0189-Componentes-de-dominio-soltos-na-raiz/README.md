# ISSUE-0189: Componentes de domínio soltos na raiz

## Descrição do problema
Componentes de domínio como `dashboard.tsx`, `documentation.tsx` e `model-settings.tsx` estão soltos na raiz do diretório `src/client/components/`, dificultando a organização, manutenção e escalabilidade do projeto.

### Exemplos concretos
- Arquivo: `src/client/components/dashboard.tsx`
- Arquivo: `src/client/components/documentation.tsx`
- Arquivo: `src/client/components/model-settings.tsx`

## Recomendação de correção/refatoração
Agrupar componentes de domínio em subpastas temáticas dentro de `components/`, conforme o contexto funcional (ex: `dashboard/`, `documentation/`, `model-settings/`). Atualizar imports e garantir que a estrutura reflita a separação de responsabilidades.

## Justificativa
- **ADR-0012**: Clean Architecture — separação clara de responsabilidades.
- **SDR-0001**: Organização modular e manutenção facilitada.
- **Regras Gerais**: Estrutura de pastas deve refletir o domínio e facilitar a escalabilidade.

## Contexto para execução autônoma
- Criar subpastas temáticas para cada componente de domínio.
- Mover os arquivos correspondentes para as novas pastas.
- Atualizar todos os imports e referências.