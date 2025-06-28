## Estrutura de Testes

### Fluxo de Configuração

1. **setup.ts** (configuração global)
   - Executado antes de todos os testes
   - Configura ambiente de teste
   - Importa configurações globais

2. **BaseTest** (classe base)
   - Herdada por suites de teste
   - Contém:
     - Configuração do banco de dados (via `setupTestDB`)
     - Teardown do banco (via `teardownTestDB`)
     - Utilitários comuns

3. **Testes Específicos**
   - Herdam de BaseTest
   - Focam apenas na lógica do teste
   - Não repetem configuração

### Quando usar cada abordagem:

- **setup.ts**: Para configurações globais que afetam TODOS os testes
- **BaseTest**: Para configurações compartilhadas por múltiplos testes
- **beforeEach/afterEach**: Para resetar estado entre testes individuais