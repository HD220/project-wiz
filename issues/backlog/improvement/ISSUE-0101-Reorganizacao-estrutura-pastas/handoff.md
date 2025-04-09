# Handoff - Reorganização de Estrutura de Pastas

## Contexto
A estrutura atual do projeto cresceu organicamente e precisa ser reorganizada para:
- Facilitar a localização de arquivos
- Melhorar a manutenibilidade
- Permitir escalabilidade para novas funcionalidades

## Detalhes Técnicos
1. **Nova Estrutura**:
   - Agrupamento por domínio/funcionalidade
   - Separação clara entre código, configuração e documentação
   - Pastas dedicadas para tipos específicos de arquivos

2. **Mudanças Necessárias**:
   - Movimentação de arquivos para novas localizações
   - Atualização de imports e referências
   - Ajuste nas configurações de build

3. **Impactos**:
   - Build: Requer atualização dos caminhos nos scripts
   - Testes: Necessário ajustar paths nos arquivos de teste
   - Documentação: Atualizar referências à estrutura

## Riscos e Mitigação
| Risco | Mitigação |
|-------|-----------|
| Quebra de builds | Testar incrementalmente cada mudança |
| Imports quebrados | Usar ferramentas de refatoração para atualizar paths |
| Configurações desatualizadas | Validar todas as configurações após mudanças |

## Referências
- ADR-0001: Implementação de ADRs
- ADR-0004: Estrutura de Documentação
- ISSUE-0064: Remoção de código não utilizado (relacionado)