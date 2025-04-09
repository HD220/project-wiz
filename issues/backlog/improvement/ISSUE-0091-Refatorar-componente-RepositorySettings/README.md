### ISSUE: Refatorar componente RepositorySettings

**Descrição:**  
O componente `src/client/components/repository-settings.tsx` possui mais de 350 linhas, misturando múltiplas tabs, listas, configurações e permissões. Viola Clean Code.

**Objetivo:**  
Dividir em subcomponentes, separar lógica de dados, melhorar clareza e testabilidade.