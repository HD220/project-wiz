# ISSUE-0135 - Conflito de dependências entre React 19 e react-day-picker

## Descrição
Durante a execução do `npm install`, ocorre o seguinte erro:

```
While resolving: react-day-picker@8.10.1
Found: react@19.1.0
Could not resolve dependency:
peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-day-picker@8.10.1
```

## Impacto
- O projeto não instala dependências corretamente.
- O build e execução do app ficam bloqueados.

## Causa
`react-day-picker@8.10.1` não suporta React 19.

## Propostas de solução
- Verificar se há uma versão do `react-day-picker` compatível com React 19 e atualizar.
- Se não houver, substituir o componente por alternativa compatível.
- Como workaround temporário, usar `npm install --legacy-peer-deps` para continuar builds locais (não recomendado para produção).

## Critério de aceite
- `npm install` deve funcionar sem erros de dependência.
- O build e start do app devem funcionar normalmente.

## Relacionado a
Task: Build e validação do projeto