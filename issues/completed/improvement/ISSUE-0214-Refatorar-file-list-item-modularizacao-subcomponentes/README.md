# Refatorar file-list-item: modularização de subcomponentes internos

## Contexto

O componente `src/client/components/file-list-item.tsx` atualmente possui subcomponentes internos definidos no mesmo arquivo. Essa abordagem pode dificultar a manutenção, a clareza e a testabilidade do código, especialmente à medida que o componente cresce ou ganha novas responsabilidades.

## Problema

- Subcomponentes internos dificultam a leitura e a compreensão do componente principal.
- A manutenção e evolução do código se tornam mais complexas, pois alterações em subcomponentes impactam diretamente o arquivo principal.
- A testabilidade dos subcomponentes é reduzida, já que não podem ser facilmente importados ou testados isoladamente.
- Viola boas práticas de modularização e organização de componentes em projetos React de médio e grande porte.

## Proposta de Melhoria

- Extrair todos os subcomponentes internos do arquivo `file-list-item.tsx` para arquivos próprios, localizados no mesmo diretório ou em uma subpasta dedicada.
- Garantir que cada subcomponente tenha responsabilidades bem definidas e nomes descritivos.
- Atualizar as importações no componente principal para utilizar os subcomponentes extraídos.
- Seguir as boas práticas de modularização, clareza e testabilidade recomendadas para projetos React.

## Benefícios Esperados

- Melhoria na modularidade e organização do código.
- Facilidade de manutenção e evolução futura do componente.
- Aumento da clareza e legibilidade do código.
- Possibilidade de testes unitários mais granulares para cada subcomponente.
- Alinhamento com padrões de qualidade adotados no projeto.

## Escopo

**Não implementar a refatoração neste momento.** Esta issue é apenas para rastrear e planejar a melhoria.

---