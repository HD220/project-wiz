# Guia de Internacionalização (i18n)

Este guia tem como objetivo fornecer informações sobre como adicionar e manter traduções no projeto.

## Estrutura de Pastas

A estrutura de pastas para arquivos de localização é a seguinte:

```
src/locales/
├── en/
│   └── common.po
│   └── glossary.po
│   └── validation.po
└── pt-BR/
    └── common.po
    └── glossary.po
    └── validation.po
```

Cada idioma possui sua própria pasta dentro de `src/locales/`. Dentro de cada pasta de idioma, os arquivos `.po` contêm as traduções.

## Adicionando Novas Traduções

Para adicionar novas traduções, siga os seguintes passos:

1.  **Identifique o texto a ser traduzido:** Localize o texto no código que precisa ser internacionalizado.
2.  **Adicione a mensagem no arquivo `.po`:** Adicione a mensagem original (em inglês) e sua tradução para o idioma desejado no arquivo `.po` correspondente.
3.  **Execute o processo de extração/compilação:** Execute o comando para extrair as novas mensagens e compilar os arquivos de tradução.

## Processo de Extração/Compilação de Mensagens

O processo de extração e compilação de mensagens é feito utilizando a biblioteca LinguiJS. Para executar o processo, utilize o seguinte comando:

```bash
# TODO: Adicionar o comando correto
lingui extract
lingui compile
```

Este comando irá extrair as mensagens do código e compilar os arquivos `.po` em arquivos `.json` que serão utilizados pela aplicação.

## Boas Práticas para Textos Internacionalizados

- **Use variáveis para valores dinâmicos:** Evite concatenar strings diretamente. Utilize variáveis para inserir valores dinâmicos nas mensagens.
- **Utilize componentes para formatação:** Utilize componentes para formatar datas, números e moedas de acordo com o idioma.
- **Mantenha a consistência:** Utilize a mesma terminologia em todas as traduções.

## Links Úteis

- [Documentação do LinguiJS](https://lingui.js.org/)
