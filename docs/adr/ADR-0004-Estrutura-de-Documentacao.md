# ADR-0004: Estrutura de documentação

## Status

🟢 **Aceito**

---

## Contexto

O projeto precisava de uma estrutura de documentação clara e abrangente para:
- Facilitar a manutenção
- Permitir fácil expansão
- Garantir consistência
- Apoiar novos contribuidores

---

## Decisão

Adotamos a seguinte estrutura de documentação:

1. **README.md** – Visão geral do projeto e ponto de entrada
2. **docs/**
   - **project-context.md** – Visão geral técnica
   - **documentation-status.md** – Status e métricas
   - **ui-components.md** – Documentação de componentes
   - **llm-services.md** – Documentação de serviços
   - **adr/** – Decisões arquiteturais
   - **templates/** – Templates para documentação

---

## Consequências

- Melhor organização da documentação
- Facilidade para encontrar informações
- Consistência entre documentos
- Requer manutenção contínua para atualizar links e referências

---

## Alternativas Consideradas

- Documentação monolítica em um único arquivo — rejeitado por dificultar manutenção e organização
- Documentação apenas no README — rejeitado por limitar a profundidade técnica e poluir o arquivo principal

---

## Links Relacionados

- [Template de documentação](../templates/)
