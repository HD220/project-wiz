# ISSUE-0061: Implementar internacionalização no componente ThemeProvider (children prop)

## Descrição

Esta issue tem como objetivo implementar a internacionalização no componente `ThemeProvider` localizado em `src/client/components/providers/theme.tsx`. A internacionalização deve permitir traduzir o texto dentro do `ThemeProvider` para diferentes idiomas, garantindo que a aplicação seja acessível a usuários de diferentes regiões.

## Motivação

A internacionalização é crucial para garantir que a aplicação possa ser utilizada por um público global. Ao implementar a internacionalização no componente `ThemeProvider`, garantimos que o tema da aplicação possa ser adaptado para diferentes idiomas, melhorando a experiência do usuário.

## Critérios de Aceitação

- O componente `ThemeProvider` deve ser atualizado para utilizar LinguiJS para internacionalização.
- Deve ser possível traduzir o texto dentro do `ThemeProvider` para inglês e português.
- A aplicação deve exibir o texto traduzido corretamente com base na configuração de idioma do usuário.
- Testes unitários devem ser implementados para garantir a funcionalidade de internacionalização do componente.

## Plano de Desenvolvimento

1.  Instalar e configurar LinguiJS no projeto.
2.  Atualizar o componente `ThemeProvider` para utilizar LinguiJS para internacionalização.
3.  Criar arquivos de tradução para inglês e português.
4.  Implementar testes unitários para garantir a funcionalidade de internacionalização do componente.
5.  Testar a aplicação com diferentes configurações de idioma para garantir que o texto seja exibido corretamente.

## Estimativa

5 dias
