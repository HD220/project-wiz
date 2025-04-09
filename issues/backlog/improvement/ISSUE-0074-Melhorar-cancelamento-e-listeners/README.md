# ISSUE-0074: Melhorar cancelamento e listeners

**Descrição:**  
Aprimorar o mecanismo de cancelamento das requisições aos serviços LLM, garantindo que os listeners e callbacks associados sejam corretamente removidos após o cancelamento. Isso evita vazamentos de memória, múltiplas notificações e comportamentos inesperados durante o uso intensivo do sistema.

**Objetivo:**  
- Tornar o cancelamento mais confiável e eficiente.  
- Garantir que todos os listeners sejam removidos ao cancelar uma requisição.  
- Prevenir vazamentos de memória relacionados a listeners não removidos.  
- Melhorar a estabilidade geral do fluxo de cancelamento.

**Prioridade:** Alta