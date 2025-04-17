# ADR-0019: Implementação de Validações na Camada de Infraestrutura

## Status
✅ Aprovado

## Contexto
Necessidade de implementar validações robustas na camada de infraestrutura para:
- Tipos de dados
- Formatos
- Limites  
- Segurança
- Conformidade com contratos de domínio

## Decisão
### Abordagem Híbrida
- Usar Zod para validação estrutural básica
- Implementar validadores customizados para regras complexas
- Aplicar Design by Contract nas interfaces críticas

### Camadas de Validação
1. **Entrada**: Validação imediata de payloads/requests
2. **Processamento**: Verificação de invariantes durante operações  
3. **Saída**: Garantia de conformidade com contratos

### Bibliotecas
- Zod (validação estrutural)
- Custom validators (regras de negócio)
- Type guards (TypeScript)

## Alternativas Consideradas
1. **Apenas Zod** - Limitado para regras complexas
2. **Apenas Custom** - Maior esforço de manutenção  
3. **Joi/Yup** - Redundante com Zod já em uso

## Consequências
### Positivas
- Maior robustez e segurança
- Melhor documentação implícita  
- Erros detectados mais cedo

### Negativas
- Overhead de performance
- Complexidade aumentada

## Implementação
1. Criar módulo `validation` em `src/core/infrastructure`
2. Definir contratos em `src/shared/types/validation.ts`  
3. Implementar validadores específicos por domínio

## Histórico de Alterações
- 2025-04-16: Criação inicial do ADR