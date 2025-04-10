# Handoff Técnico - ISSUE-0136

## Passos Técnicos para Reorganização

1. **Mapear todos os serviços existentes** em `src/core/services/` e classificar:
   - **Domínio:** regras de negócio puras
   - **Aplicação:** orquestração, casos de uso
   - **Infraestrutura:** integrações técnicas, acesso a APIs, storage, etc.
2. **Mover arquivos** para as pastas correspondentes:
   - `src/core/domain/services/`
   - `src/core/application/services/`
   - `src/core/infrastructure/adapters/` ou `gateways/`
3. **Atualizar imports** em todo o core para refletir a nova estrutura.
4. **No client (`src/client/services/`):**
   - Extrair integrações para `src/client/adapters/` ou `src/client/gateways/`
   - UI deve consumir interfaces, não implementações concretas
5. **No mobile:**
   - Extrair integrações específicas das telas para módulos próprios (ex: `mobile/src/integrations/`)
   - UI deve depender de interfaces, facilitando mocks
6. **Revisar dependências cruzadas** e eliminar acoplamentos indevidos.
7. **Atualizar testes** para refletir a nova estrutura e garantir cobertura.

---

## Estratégias para Modularizar Integrações Mobile

- Criar **camada de abstração** para integrações (ex: APIs, storage, sensores)
- Utilizar **injeção de dependências** nas telas
- Facilitar **mocking** para testes unitários
- Evitar chamadas diretas a SDKs ou APIs externas na UI

---

## Dependências e Pré-requisitos

- Leitura detalhada da [ADR-0008 - Clean Architecture LLM](../../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)
- Conclusão da issue [ISSUE-0135 - Isolar integrações Electron](../ISSUE-0135-Isolar-integracoes-Electron-e-eliminar-dependencias-cruzadas/README.md)
- Mapeamento completo dos serviços atuais

---

## Recomendações para Validação Pós-Refatoração

- Executar **testes automatizados** para garantir não regressão
- Realizar **code review focado em dependências e responsabilidades**
- Validar que a UI consome **interfaces** e não implementações concretas
- Atualizar documentação e ADRs conforme necessário

---

## Referências

- **Clean Architecture** (Robert C. Martin)
- ADR-0008 - Clean Architecture LLM
- Outras ADRs relacionadas à estrutura de pastas e integrações