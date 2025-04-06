# Handoff - ISSUE-0061: Implementar internacionalização no componente ThemeProvider (children prop)

## Contexto

O componente `ThemeProvider` em `src/client/components/providers/theme.tsx` precisa ser internacionalizado para suportar diferentes idiomas. Isso garantirá que a aplicação seja acessível a usuários de diferentes regiões.

## Requisitos

- Implementar a internacionalização no componente `ThemeProvider` utilizando LinguiJS.
- Criar arquivos de tradução para inglês e português.
- Garantir que o texto dentro do `ThemeProvider` seja traduzido corretamente com base na configuração de idioma do usuário.
- Implementar testes unitários para garantir a funcionalidade de internacionalização do componente.

## Observações

- Certifique-se de que a aplicação exiba o texto traduzido corretamente com base na configuração de idioma do usuário.
- Considere a possibilidade de adicionar suporte para outros idiomas no futuro.
- Documente o processo de internacionalização do componente para facilitar a manutenção e futuras atualizações.

## Links Úteis

- [LinguiJS Documentation](https://lingui.js.org/)
- [ThemeProvider Component](src/client/components/providers/theme.tsx)

## Checklist

- [ ] Componente `ThemeProvider` atualizado para utilizar LinguiJS para internacionalização.
- [ ] Arquivos de tradução para inglês e português criados.
- [ ] Testes unitários implementados para garantir a funcionalidade de internacionalização do componente.
- [ ] Aplicação testada com diferentes configurações de idioma.
- [ ] Processo de internacionalização do componente documentado.
