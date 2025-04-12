# Refatorar componente Documentation: modularização, acessibilidade e i18n

## Contexto

O componente `src/client/components/documentation.tsx` apresenta boa estrutura geral, porém viola princípios de Clean Code e decisões arquiteturais do projeto. Foram identificados problemas de tamanho excessivo da função principal, múltiplas responsabilidades, ausência de internacionalização (i18n), falta de atributos de acessibilidade (ARIA) e possível não conformidade com o padrão de nomenclatura kebab-case.

Esta refatoração é fundamental para garantir manutenibilidade, escalabilidade, acessibilidade e aderência às ADRs e SDRs do projeto.

## Problemas Identificados

- Função principal excede 50 linhas (Clean Code)
- Violação do SRP: múltiplas responsabilidades (busca, lista, visualização)
- Textos hardcoded, sem suporte a i18n (ADR, SDR)
- Falta de atributos de acessibilidade (ARIA)
- Nome de arquivo: garantir kebab-case em todos os relacionados

## Recomendações

- Extrair subcomponentes para modularizar (busca, lista, visualização)
- Segregar responsabilidades conforme SRP
- Extrair todos os textos para o sistema de internacionalização (i18n)
- Adicionar atributos ARIA e revisar acessibilidade
- Validar e padronizar nomes de arquivos para kebab-case

## Checklist de Ações

- [ ] Extrair subcomponentes para busca, lista e visualização de documentação
- [ ] Reduzir função principal para menos de 50 linhas
- [ ] Garantir que cada subcomponente tenha responsabilidade única (SRP)
- [ ] Extrair todos os textos do JSX para arquivos de i18n
- [ ] Adicionar e revisar atributos de acessibilidade (ARIA) nos elementos relevantes
- [ ] Validar e padronizar nomes de arquivos relacionados para kebab-case
- [ ] Atualizar testes e documentação se necessário

## Critérios de Aceite

- Função principal e subcomponentes respeitam Clean Code e SRP
- Todos os textos estão internacionalizados
- Componentes acessíveis conforme boas práticas ARIA
- Nomenclatura dos arquivos em conformidade com ADR-0015
- Não há regressão de funcionalidades

## Referências

- ADR-0012: Clean Architecture para módulos LLM
- ADR-0015: Padrão de nomenclatura kebab-case
- SDR-0001: Código-fonte em inglês
- docs/i18n-guide.md
- docs/ui-components.md

---

> Progresso e decisões devem ser registrados em `handoff.md` nesta pasta.