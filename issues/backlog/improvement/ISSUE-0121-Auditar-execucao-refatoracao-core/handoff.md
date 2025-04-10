# Auditoria da Refatoração do PromptRepository para Clean Architecture

## Diagnóstico Geral

A refatoração do PromptRepository avançou significativamente na direção da Clean Architecture, com separação clara entre infraestrutura, aplicação e domínio. No entanto, foram identificados pontos de melhoria para garantir aderência total aos princípios arquiteturais e SOLID.

---

## Análise por Camada

### 1. **Infraestrutura**

- **Arquivo:** `src/core/infrastructure/db/repositories/PromptRepositoryImpl.ts`
- **Papel:** Implementa a interface `PromptRepositoryPort` da camada de aplicação.
- **Pontos positivos:**
  - Não possui dependências do domínio, apenas da aplicação (correto).
  - Implementa explicitamente a interface da aplicação.
  - Comentários indicam claramente métodos do contrato e métodos auxiliares específicos da infraestrutura.
- **Pontos de atenção:**
  - Métodos auxiliares (`importPrompts`, `exportPrompts`, `listPromptNames`, `restoreDefaultPrompts`) **não fazem parte do contrato** e deveriam ser segregados em uma interface separada para evitar violação do SRP.
  - Uso excessivo de `any` em parâmetros e retornos, o que prejudica a segurança de tipos.

---

### 2. **Aplicação**

- **Arquivo:** `src/core/application/ports/PromptRepositoryPort.ts`
- **Papel:** Define o contrato da aplicação para persistência de prompts.
- **Pontos positivos:**
  - Interface enxuta, focada em operações CRUD essenciais.
  - Não depende de detalhes de infraestrutura.
- **Pontos de atenção:**
  - Define um tipo `Prompt` que **duplica** o Value Object já existente no domínio.
  - Isso viola o princípio DRY e pode gerar inconsistências.

---

### 3. **Domínio**

- **Arquivo:** `src/core/domain/value-objects/prompt.ts`
- **Papel:** Define o **Value Object** `Prompt` e seus parâmetros.
- **Pontos positivos:**
  - Representa claramente o conceito central do domínio.
  - Estrutura adequada para uso em regras de negócio e validações.
- **Pontos de atenção:**
  - Não está sendo utilizado pela camada de aplicação, que duplicou o tipo.

---

### 4. **Casos de Uso**

- **Exemplo:** `src/core/application/usecases/CreatePromptUseCase.ts`
- **Papel:** Orquestra a criação de prompts, usando abstrações.
- **Pontos positivos:**
  - Depende apenas da interface `PromptRepositoryPort` e de serviços de domínio.
  - Não possui dependência da infraestrutura.
  - Fluxo limpo e alinhado com Clean Architecture.

---

## Problemas Identificados

| Problema                                                                 | Impacto                                                                                     | Severidade  |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-------------|
| Duplicação do tipo `Prompt` na aplicação e domínio                       | Risco de inconsistência, viola DRY, dificulta manutenção                                    | Alta        |
| Métodos específicos da infraestrutura misturados na implementação        | Viola SRP, aumenta acoplamento, dificulta testes e manutenção                               | Média       |
| Uso de `any` em métodos da infraestrutura                               | Reduz segurança de tipos, aumenta risco de erros                                            | Média       |
| Aplicação não depende explicitamente do domínio para o conceito `Prompt` | Viola parcialmente DIP, dificulta evolução do domínio                                       | Alta        |

---

## Recomendações Estratégicas

1. **Unificar o conceito de Prompt**
   - Remover a definição do tipo `Prompt` da camada de aplicação.
   - Importar e usar o `Prompt` do domínio em todos os ports, casos de uso e serviços.

2. **Segregar responsabilidades na infraestrutura**
   - Criar uma interface separada para métodos auxiliares (`importPrompts`, `exportPrompts`, etc).
   - Manter o `PromptRepositoryPort` apenas com métodos essenciais.

3. **Melhorar tipagem**
   - Substituir `any` por tipos explícitos, preferencialmente definidos no domínio ou DTOs.

4. **Atualizar documentação**
   - Refletir essas mudanças nas ADRs e diagramas.
   - Reforçar que o domínio é a fonte da verdade para conceitos centrais.

5. **Revisar dependências**
   - Garantir que a camada de aplicação dependa do domínio para conceitos, e não redefina tipos.

---

## Conclusão

A estrutura geral está **majoritariamente aderente** à Clean Architecture, com separação clara e inversão de dependências respeitada.  
Entretanto, a duplicação do conceito `Prompt` e a mistura de responsabilidades na infraestrutura precisam ser corrigidas para garantir:

- **Baixo acoplamento**
- **Alta coesão**
- **Facilidade de evolução**
- **Manutenção sustentável**

---

## Plano de Correção Resumido

- [ ] Remover tipo `Prompt` da aplicação e usar o do domínio.
- [ ] Segregar métodos auxiliares em interface separada.
- [ ] Refinar tipagem, eliminando `any`.
- [ ] Atualizar documentação e ADRs.
- [ ] Validar dependências entre camadas.

---

**Status:** Auditoria concluída.  
**Próximos passos:** Aprovar plano de correção e iniciar ajustes.