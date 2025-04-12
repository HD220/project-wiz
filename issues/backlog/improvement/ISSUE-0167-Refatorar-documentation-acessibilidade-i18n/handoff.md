---
**Diagnóstico Inicial da Internacionalização (`documentation.tsx`):**

- O componente `src/client/components/documentation.tsx` não possui textos hardcoded diretamente.
- Todos os textos exibidos ao usuário são provenientes dos subcomponentes:
  - `DocumentationHeader`
  - `DocumentationSearch`
  - `DocumentationFileList`
  - `DocumentationViewer`
- Portanto, a internacionalização deste componente depende da análise e refatoração dos subcomponentes citados.

**Plano de Ação:**
1. Analisar cada subcomponente para identificar textos hardcoded.
2. Extrair textos para o sistema de i18n do projeto.
3. Atualizar arquivos PO (`src/locales/en/common.po` e `src/locales/pt-BR/common.po`) com as novas chaves.
4. Refatorar os subcomponentes para consumir as traduções.
5. Validar a ausência de textos hardcoded e a correta integração.
6. Registrar decisões e progresso neste handoff.

**Próximo passo:** Iniciar análise pelo subcomponente `DocumentationHeader`.

---
