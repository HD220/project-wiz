# Handoff - ISSUE-0142 - Padronizar nomenclatura para inglês no backend

## Visão geral
Esta melhoria visa padronizar toda a nomenclatura do backend para o inglês, eliminando termos em português, para garantir consistência, facilitar manutenção e preparar o projeto para colaboração internacional.

---

## Diagnóstico detalhado
Atualmente, o backend possui nomes de arquivos, pastas, classes, funções, variáveis e comentários em português e inglês misturados. Isso gera confusão, dificulta a integração com ferramentas internacionais e aumenta a curva de aprendizado para novos desenvolvedores.

---

## Contexto
- Adoção do inglês como idioma padrão para código backend
- Alinhamento com boas práticas globais
- Facilitar integração com APIs, frameworks e desenvolvedores internacionais

---

## Justificativa
- Facilitar onboarding de novos membros
- Reduzir ambiguidades e erros
- Melhorar integração com ferramentas internacionais
- Preparar para colaboração global

---

## Recomendações técnicas detalhadas
- **Inventário completo**: Levantar todos os nomes no backend (arquivos, pastas, classes, funções, variáveis, comentários)
- **Definição de convenção**:
  - camelCase para variáveis e funções
  - PascalCase para classes
  - kebab-case para arquivos e pastas
- **Renomeação**: Atualizar todos os nomes para inglês seguindo a convenção
- **Atualização de referências**: Corrigir todos os imports e referências internas
- **Documentação**: Criar ou atualizar documento com a convenção adotada

---

## Critérios de aceitação
- 100% do backend com nomes em inglês padronizados
- Convenção documentada e acessível
- Código funcionando sem erros de import ou execução
- Links cruzados e referências atualizados

---

## Riscos e mitigação
- **Quebra de imports**: Planejar renomeação em etapas, com testes contínuos
- **Conflitos em merges**: Sincronizar branches antes da renomeação
- **Ajustes em documentação e testes**: Atualizar paralelamente

---

## Dependências
- Refatoração dos tipos de domínio (ISSUE-0141)
- Reforço dos testes backend para garantir integridade após renomeação

---

## Links cruzados
- [ISSUE-0141-Refatorar-tipos-dominio-para-domain-contracts](../ISSUE-0141-Refatorar-tipos-dominio-para-domain-contracts/README.md)
- [ISSUE-0140-Adicionar-validacoes-infraestrutura](../../security/ISSUE-0140-Adicionar-validacoes-infraestrutura/README.md)

---

## Próximos passos sugeridos
1. Levantamento completo da nomenclatura atual
2. Definição e documentação da convenção
3. Planejamento da renomeação em etapas seguras
4. Execução da renomeação com atualização de referências
5. Validação com testes automatizados
6. Revisão final e merge