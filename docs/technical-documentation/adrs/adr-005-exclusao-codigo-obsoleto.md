# ADR 005: Exclusão de Código e Testes Obsoletos

- **Título:** Exclusão completa de código e testes da implementação anterior de Agentes, Workers e Queues.
- **Status:** Aceito.
- **Contexto:** A implementação existente de agentes, workers e filas não está alinhada com a nova arquitetura e contém testes desnecessários. Manter esse código e testes criaria confusão, dificultaria a manutenção e atrasaria o desenvolvimento da nova arquitetura.
- **Decisão:** Todo o código-fonte e arquivos de teste relacionados à implementação anterior de agentes, workers e filas que não se encaixem na nova arquitetura e nos princípios definidos serão completamente removidos antes de iniciar a nova implementação.
- **Consequências:**
  - Garante um ponto de partida limpo para a nova implementação.
  - Reduz a confusão e a dívida técnica.
  - Requer uma análise cuidadosa para identificar e remover apenas o código e testes obsoletos, preservando partes reutilizáveis (ex: Value Objects genéricos, utilitários).
  - Nenhum teste novo será criado até que a implementação da nova arquitetura esteja completa e pronta para validação.
