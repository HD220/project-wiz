# Refatorar ModelSettings Component (`src/client/components/model-settings.tsx`)

## Contexto

O componente `ModelSettings` está funcional, porém apresenta diversos problemas que violam princípios de Clean Code, Clean Architecture e ADRs do projeto. A refatoração é necessária para garantir modularidade, manutenibilidade, testabilidade e internacionalização, além de alinhar o componente com os padrões estabelecidos no projeto.

## Problemas Identificados

1. **Função principal excede 50 linhas**
   - O componente está muito extenso e precisa ser quebrado em subcomponentes menores, respeitando o princípio da responsabilidade única (SRP) e facilitando a manutenção.

2. **Fonte de dados dos modelos não centralizada**
   - A fonte de dados dos modelos está dispersa. É necessário centralizar a obtenção dos modelos e passá-los via props para componentes filhos.

3. **Dados mockados na UI**
   - Existem dados mockados diretamente na interface. Estes devem ser removidos e substituídos por dados reais obtidos via hooks ou serviços.

4. **Textos e comentários em português**
   - O código contém textos e comentários em português. Todos os textos devem ser padronizados para inglês e os textos de UI devem ser internacionalizados.

5. **Repetição de textos e headers (violação do DRY)**
   - Textos e headers estão duplicados. Devem ser extraídos para constantes ou componentes reutilizáveis.

6. **Acoplamento entre UI e dados estáticos**
   - O componente está acoplado a dados estáticos. Deve-se utilizar hooks para buscar dados do domínio ou infraestrutura, alinhando com Clean Architecture.

7. **Garantir padrão kebab-case**
   - Verificar e garantir que todos os arquivos e pastas relacionados estejam em kebab-case, conforme ADR-0015.

## Checklist de Ações

- [ ] Quebrar o componente principal em subcomponentes menores, respeitando SRP.
- [ ] Centralizar a fonte de dados dos modelos e passar via props.
- [ ] Remover dados mockados e integrar com hooks/serviços reais.
- [ ] Padronizar todos os textos e comentários para inglês.
- [ ] Internacionalizar todos os textos de UI.
- [ ] Extrair textos e headers duplicados para constantes/componentes reutilizáveis.
- [ ] Desacoplar UI de dados estáticos, utilizando hooks alinhados à Clean Architecture.
- [ ] Garantir que todos os arquivos e pastas estejam em kebab-case.
- [ ] Atualizar testes e documentação conforme necessário.

## Critérios de Aceite

- O componente deve ser modular, testável e alinhado aos padrões de Clean Code e Clean Architecture.
- Não deve haver dados mockados ou textos em português no código-fonte.
- Todos os textos de UI devem ser internacionalizados.
- Não deve haver duplicação de textos ou headers.
- Estrutura de arquivos e pastas deve seguir kebab-case.

## Referências

- ADR-0012: Clean Architecture para módulos LLM
- ADR-0015: Padrão de nomenclatura kebab-case
- SDR-0001: Código-fonte em inglês
- docs/i18n-guide.md

---

## Progresso / Handoff

<!-- Utilize este espaço para documentar decisões, progresso, dificuldades e próximos passos durante a execução da issue. -->