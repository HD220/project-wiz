# ISSUE-0185: Componentes grandes com subcomponentes internos

## Descrição do problema
O componente `dashboard.tsx` contém subcomponentes internos (ex: `MetricsList`, `MetricCard`) e apresenta alta complexidade e tamanho excessivo, dificultando a manutenção, testes e reutilização.

### Exemplo concreto
- Arquivo: `src/client/components/dashboard.tsx`
- Linhas: 10-57 (subcomponentes internos)
```tsx
function MetricsList({ metrics }) {
  function MetricCard({ label, value, progress, icon }) {
    // ...
  }
  return (
    <>
      {metrics.map((metric) => (
        <MetricCard ... />
      ))}
    </>
  );
}
```

## Recomendação de correção/refatoração
Extrair subcomponentes internos para arquivos próprios e dividir o componente principal em unidades menores, seguindo o princípio de responsabilidade única e facilitando testes e manutenção.

## Justificativa
- **ADR-0012**: Adotar Clean Architecture para módulos LLM.
- **SDR-0001**: Código-fonte deve ser claro, modular e de fácil manutenção.
- **Regras Gerais**: Funções/componentes devem ser pequenos e focados em uma única responsabilidade.

## Contexto para execução autônoma
- Identificar todos os subcomponentes internos em `dashboard.tsx`.
- Extrair para arquivos próprios em subpastas temáticas.
- Garantir que o componente principal fique abaixo de 50 linhas e sem subcomponentes internos complexos.
- Atualizar imports e testes conforme necessário.