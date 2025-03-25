# Padrões de Codificação

## TypeScript
- Tipagem estrita (noImplicitAny ativado)
- Uso de interfaces e tipos bem definidos
- Generics quando apropriado
- Path aliases configurados no tsconfig

## React
- Componentes funcionais
- Hooks para gerenciamento de estado
- Separação clara de responsabilidades
- Uso de Context API para estado global

## Estilo
- ESLint configurado com regras recomendadas
- Prettier para formatação consistente
- Nomes descritivos para variáveis e funções
- Comentários JSDoc para funções complexas

## Comentários
- Evite comentários desnecessários. Insira comentários somente quando for estritamente necessário para explicar lógicas complexas ou decisões críticas que não sejam imediatamente autoexplicativas pelo código. Comentários redundantes ou explicativos excessivos devem ser evitados para manter o código limpo e legível. 
- Evite inclusive JSDoc, pois o projeto já utiliza typescript e o codigo já é tipado, JSDoc só deve ser utilizado em caso de funções muito complexas.

## Internacionalização
- Uso de LinguiJS para i18n
- Mensagens centralizadas em arquivos .po
- Componentes Trans para textos traduzíveis
