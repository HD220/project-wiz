# Diretrizes de Código Limpo

## Princípios Gerais

1. **Nomes Descritivos**
   - Use nomes que revelem a intenção
   - Evite abreviações desnecessárias
   - Prefira nomes longos e descritivos a comentários

2. **Métodos Pequenos e Focados**
   - Cada método deve fazer uma única coisa
   - Mantenha métodos curtos (idealmente menos de 20 linhas)
   - Use nomes de métodos que descrevam claramente sua função

3. **Tipos Fortes**
   - Use tipos específicos em vez de `any`
   - Crie interfaces e tipos para estruturas de dados complexas
   - Use enums para conjuntos de valores relacionados

4. **Evitar Comentários**
   - O código deve ser autoexplicativo
   - Use comentários apenas para explicar decisões arquiteturais complexas
   - Nunca use comentários para explicar o que o código faz

5. **Consistência**
   - Siga o mesmo padrão em todo o código
   - Mantenha o mesmo estilo de nomenclatura
   - Use formatação consistente

## Boas Práticas Específicas

### TypeScript
- Use `interface` para definir contratos
- Prefira `type` para uniões e interseções
- Use enums para conjuntos de valores relacionados
- Evite o uso de `any`

### Organização de Código
- Agrupe funcionalidades relacionadas
- Use módulos para separar conceitos
- Mantenha imports organizados e limpos

### Tratamento de Erros
- Use tipos de erro específicos
- Centralize o tratamento de erros
- Forneça mensagens de erro claras e úteis