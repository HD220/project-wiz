# Documentação Conceitual do Project Wiz

Bem-vindo à documentação conceitual do Project Wiz! Este conjunto de documentos visa fornecer um entendimento claro e abrangente da arquitetura, funcionalidades e fluxos de interação do sistema.

## Documento Central da Arquitetura

A principal referência para a arquitetura detalhada e as decisões de design do Project Wiz é o seguinte documento:

*   **[`target_architecture.md`](./target_architecture.md):** Descreve a Proposta de Arquitetura Alvo para o sistema, incluindo princípios de design (Clean Architecture, Object Calisthenics, DDD, DI), a arquitetura em camadas detalhada, o sistema de processamento assíncrono (Jobs, Filas, Workers inspirado no BullMQ), Injeção de Dependência com InversifyJS, e diretrizes de qualidade de código. **Este é o ponto de partida recomendado para um entendimento técnico profundo.**

## Visão Geral da Aplicação e Frontend

Os seguintes diretórios contêm informações de mais alto nível sobre a aplicação como um todo e sua interface com o usuário:

*   **[`application/`](./application/):**
    *   [`overview.md`](./application/overview.md): Uma visão geral do Project Wiz, seu propósito, objetivos, público-alvo, o que os usuários podem fazer, e as tecnologias chave.
    *   [`entities.md`](./application/entities.md): Um glossário de alto nível das principais entidades conceituais do sistema, com referências ao `target_architecture.md` para detalhes.
*   **[`frontend/`](./frontend/):**
    *   [`ui_structure.md`](./frontend/ui_structure.md): Descreve a estrutura geral da interface do usuário (inspirada no Discord).
    *   [`user_interactions.md`](./frontend/user_interactions.md): Detalha como os usuários interagem com o sistema, alinhado com os Casos de Uso e a arquitetura de backend definida em `target_architecture.md`.

## Documentos de Apoio e Discussão (Briefing)

A pasta `briefing/` contém documentos que foram gerados durante o processo de análise, design e discussão da arquitetura e dos conceitos do sistema.

*   **[`briefing/`](./briefing/):**
    *   [`05_caso_de_uso_refatoracao.md`](./briefing/05_caso_de_uso_refatoracao.md): Um caso de uso detalhado ("Refatorar Código Legado e Adicionar Testes Unitários") que ilustra a aplicação da arquitetura alvo em um cenário prático.
    *   [`explicacao_usuario_final.md`](./briefing/explicacao_usuario_final.md): Uma explicação do Project Wiz sob a perspectiva de um usuário final.
    *   [`explicacao_desenvolvedor.md`](./briefing/explicacao_desenvolvedor.md): Um guia para desenvolvedores sobre como entender e trabalhar com a `target_architecture.md`.
    *   **Documentos Históricos/Referência:** Os arquivos `01_analise_documentacao_atual.md`, `06_comparativo_documentacao.md`, e `07_conceitos_bullmq_para_fila_sqlite.md` contêm análises e discussões de estágios anteriores do design. Eles são mantidos para referência histórica, mas o `target_architecture.md` prevalece como a fonte atual. Os arquivos de diagramas antigos (`02_diagramas_fluxo_atual.md`, `03_diagramas_fluxo_sugerido.md`) foram removidos ou seus conteúdos relevantes integrados em outros documentos.

## Como Navegar

1.  Comece pelo `target_architecture.md` para um entendimento profundo da arquitetura.
2.  Consulte `application/overview.md` para uma visão geral do produto.
3.  Explore `frontend/` para entender a interface e interação do usuário.
4.  Use `application/entities.md` como um glossário rápido.
5.  Analise o `briefing/05_caso_de_uso_refatoracao.md` para ver a arquitetura em ação.
6.  Leia as explicações em `briefing/` para diferentes perspectivas.

Esta documentação é um recurso vivo e será atualizada conforme o projeto evolui.
