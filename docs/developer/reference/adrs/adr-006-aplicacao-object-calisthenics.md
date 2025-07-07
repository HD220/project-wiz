# ADR 006: Aplicação Rigorosa de Object Calisthenics

- **Título:** Aplicação rigorosa dos princípios de Object Calisthenics.
- **Status:** Aceito.
- **Contexto:** Para garantir a alta qualidade, manutenibilidade e modularidade do código na nova implementação, é essencial seguir um conjunto claro de diretrizes de design orientado a objetos.
- **Decisão:** Todos os princípios de Object Calisthenics (One Level of Indentation Per Method, Don't Use the `else` Keyword, Wrap All Primitives and Strings, First-Class Collections, One Dot Per Line, Don't Abbreviate, Keep Entities Small, No More Than Two Instance Variables Per Class, No Getters/Setters/Properties for behavior, No Comments) serão aplicados rigorosamente durante a reescrita.
- **Consequências:**
  - Resultará em código mais limpo, coeso e fácil de entender e modificar.
  - Promove a criação de classes pequenas e focadas.
  - Pode exigir mais classes e métodos privados para refatorar lógica aninhada.
  - Requer disciplina e revisões de código para garantir a aderência aos princípios.
