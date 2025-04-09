# Plano Incremental de Ajustes - Personalização de Prompts

## Objetivo

Corrigir problemas críticos, implementar melhorias recomendadas e garantir aderência a requisitos, segurança e qualidade.

---

## Microetapas detalhadas

### 1. Sanitização reforçada

**Backend**
- Reforçar sanitização profunda em prompts, variáveis e metadados
- Bloquear scripts, HTML, SQL injection, caracteres perigosos
- Criar testes unitários para inputs maliciosos

**Frontend**
- Sanitizar inputs no formulário e editor de variáveis
- Prevenir XSS na renderização da prévia
- Validar e limpar dados antes do envio

---

### 2. Conversão correta de tipos no frontend

- Corrigir parsing/conversão para boolean, number, date
- Evitar envio de strings onde são esperados outros tipos
- Adicionar testes para inputs inválidos

---

### 3. Substituir checksum por assinatura digital

- Implementar assinatura digital (ex: HMAC-SHA256)
- Validar assinatura na importação
- Remover lógica antiga de checksum

---

### 4. Centralizar todas as validações no `SettingsService`

- Mover regras dispersas para métodos centralizados
- Garantir uso consistente em API, UI e import/export
- Cobrir com testes unitários

---

### 5. Confirmação e preview na importação

- Criar modal com preview do conteúdo importado
- Solicitar confirmação do usuário antes de importar
- Backend: validar assinatura e sanitização antes de salvar

---

### 6. Adicionar campo `description` para prompts

- Alterar schema e entidades
- Atualizar repositórios e UI
- Migrar dados existentes

---

### 7. Implementar histórico de versões com rollback

- Armazenar versões anteriores
- API para listar e restaurar versões
- UI para visualizar e acionar rollback

---

### 8. Controle multi-tenant e permissões

- Definir modelo multi-tenant
- Adaptar schema, repositórios e UI
- Implementar controle de permissões

---

### 9. Gerenciamento de tokens de compartilhamento

- Criar estrutura para tokens com expiração e revogação
- API e UI para gerenciar tokens

---

### 10. Alertas para dados sensíveis

- Detectar dados sensíveis (regex)
- Alertar usuário ao compartilhar
- Solicitar confirmação extra

---

## Dependências e ordem recomendada

1. Sanitização reforçada
2. Conversão correta de tipos
3. Assinatura digital
4. Centralizar validações
5. Confirmação e preview importação
6. Campo descrição
7. Histórico e rollback
8. Multi-tenant e permissões
9. Gerenciamento tokens
10. Alertas dados sensíveis

---

Este plano deve ser seguido incrementalmente, priorizando segurança e correções críticas.