# Implementar internacionalização no componente Chart (children prop)

## Descrição

Esta issue tem como objetivo implementar a internacionalização no componente `src/client/components/ui/chart.tsx`, especificamente na prop `children`. Isso permitirá traduzir o texto dos elementos do gráfico para diferentes idiomas, garantindo uma experiência de usuário consistente e acessível em diferentes regiões.

## Critérios de Aceitação

- [ ] O componente `Chart` deve ser atualizado para permitir a internacionalização da prop `children`.
- [ ] Deve ser utilizada a biblioteca LinguiJS para a implementação da internacionalização.
- [ ] Devem ser fornecidas traduções para inglês e português.
- [ ] Os textos exibidos no gráfico devem ser traduzidos corretamente de acordo com o idioma selecionado.

## Tarefas

- [ ] Instalar as dependências necessárias do LinguiJS.
- [ ] Configurar o LinguiJS no componente `Chart`.
- [ ] Envolver os textos da prop `children` com os componentes de tradução do LinguiJS.
- [ ] Criar os arquivos de tradução para inglês e português.
- [ ] Testar a internacionalização do componente `Chart` em diferentes idiomas.

## Notas Adicionais

O componente `Chart` recebe a prop `children` que renderiza os elementos do gráfico. É necessário garantir que todos os textos renderizados através dessa prop sejam internacionalizados.
