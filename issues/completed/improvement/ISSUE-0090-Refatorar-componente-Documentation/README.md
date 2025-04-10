### ISSUE: Refatorar componente Documentation

**Descrição original:**  
O componente `src/client/components/documentation.tsx` possuía quase 400 linhas, com lógica de filtragem, formatação e renderização misturadas, violando princípios de Clean Code.

**Objetivo:**  
Modularizar em subcomponentes e hooks, separar responsabilidades, facilitar manutenção.

---

### Status da implementação: **Concluído**

- O componente `documentation.tsx` foi reduzido para aproximadamente 75 linhas, focado apenas na renderização.
- A lógica de carregamento, filtragem e formatação foi extraída para o hook dedicado `src/client/components/use-documentation.ts`.
- Foram utilizados subcomponentes (`Input`, `Card`, `FileList`, etc.) para segmentar a UI.
- A separação de responsabilidades foi alcançada, melhorando a legibilidade e facilitando a manutenção futura.

---

### Resultado
A refatoração atendeu aos objetivos definidos, eliminando o problema de código monolítico e misturado, alinhando-se às boas práticas de Clean Code e arquitetura de componentes React.