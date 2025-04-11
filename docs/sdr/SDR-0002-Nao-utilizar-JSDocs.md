# SDR-0002: Não Utilizar JSDocs

**Status:** Aceito

## Contexto

O projeto mantém sua documentação em arquivos Markdown separados. O uso de JSDocs diretamente no código pode criar duplicação de documentação e dificultar a manutenção.

## Decisão

- Não utilizar JSDocs em nenhuma parte do projeto
- Manter toda a documentação em arquivos Markdown dedicados
- Utilizar TypeScript types para tipagem quando necessário
- Documentação de funções e classes deve ser feita nos arquivos de documentação, não no código

## Consequências

- Documentação centralizada e mais fácil de manter
- Redução de ruído no código fonte
- Necessidade de manter a documentação externa sempre atualizada
- Maior clareza na separação entre código e documentação