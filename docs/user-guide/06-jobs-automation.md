# Guia: Automatizando Tarefas com Jobs

No Project Wiz, os **Jobs** são as unidades fundamentais de trabalho que você atribui às suas Personas (Agentes de IA) para execução. Este sistema é o coração da capacidade de automação da plataforma, permitindo que tarefas complexas sejam decompostas, distribuídas e gerenciadas eficientemente.

## 1. O que é um Job?

Um Job representa uma tarefa específica que uma Persona deve realizar. Pode variar em complexidade, desde uma simples análise de código até o desenvolvimento de um módulo completo ou a execução de uma bateria de testes.

Cada Job no sistema possui:

*   **Nome/Identificador:** Para referência.
*   **Descrição:** Detalhes sobre o que precisa ser feito.
*   **Payload de Entrada:** Dados ou parâmetros necessários para a Persona iniciar o trabalho.
*   **Status:** Indicando o estado atual do Job (ex: Pendente, Em Execução, Concluído, Falhou).
*   **Prioridade:** Para ajudar o sistema a decidir qual Job executar em seguida.
*   **Logs e Resultados:** Registros da execução e os artefatos ou conclusões geradas.

O funcionamento detalhado dos Jobs, incluindo seu ciclo de vida e a arquitetura do sistema de workers, está descrito no documento técnico [Arquitetura do Sistema de Jobs e Workers](../technical-documentation/01-architecture.md) e visualizado no [README principal](../../README.md#ciclo-de-vida-de-um-job).

## 2. Criando e Atribuindo Jobs

A interface do Project Wiz (nas seções "Tarefas" da Home ou da "Visão por Projeto") permitirá que você crie e atribua Jobs. O processo geralmente envolverá:

*   **Definir o Job:**
    *   Fornecer um nome e uma descrição clara da tarefa.
    *   Especificar o `payload` inicial (ex: link para um requisito, um trecho de código para revisar, parâmetros para uma análise).
    *   Definir critérios de aceitação ou o resultado esperado.
*   **Selecionar a Persona:** Escolher qual Persona (ou tipo de Persona) é mais adequada para executar o Job, com base em seu papel, habilidades e disponibilidade.
*   **Definir Prioridade:** Indicar a urgência ou importância do Job em relação a outros na fila.
*   **Agendar ou Iniciar:** Optar por iniciar o Job imediatamente (se a Persona estiver disponível) ou agendá-lo para ser pego da fila.

*(A interface exata para criação e atribuição de Jobs será detalhada conforme a funcionalidade é implementada e a UI finalizada).*

## 3. Acompanhando o Progresso dos Jobs

Uma vez que um Job é atribuído, você poderá acompanhar seu progresso:

*   **Status do Job:** A UI mostrará o status atual de cada Job (Pendente, Em Execução, Concluído, Falhou, Atrasado).
*   **Logs de Execução:** As Personas registrarão informações sobre os passos que estão tomando, as Tools que estão utilizando e quaisquer dificuldades encontradas. Esses logs serão visíveis nos canais de chat ou em uma visualização específica de detalhes do Job.
*   **Resultados e Artefatos:** Quando um Job é concluído, os resultados (ex: código gerado, relatório de análise, resumo de teste) estarão disponíveis para revisão.
*   **Notificações:** Você poderá ser notificado sobre mudanças importantes no status dos Jobs (ex: conclusão, falha).

## 4. Interação Durante a Execução de um Job

Embora as Personas visem a autonomia, pode haver momentos em que a interação é necessária:

*   **Esclarecimentos:** Uma Persona pode solicitar mais informações ou esclarecimentos através do chat se encontrar ambiguidades na descrição do Job.
*   **Decisões Críticas:** Para certas decisões, uma Persona pode apresentar opções e aguardar sua aprovação antes de prosseguir.
*   **Cancelamento ou Interrupção:** Você terá a capacidade de cancelar ou interromper um Job em andamento, se necessário.

## 5. O Papel das Tools na Execução de Jobs

As Personas utilizam suas **Tools** (descritas no guia [Configurando Personas e Agentes](./05-personas-agents.md#ferramentas-tools)) para realizar o trabalho efetivo de um Job. Por exemplo:

*   Para um Job de "escrever código", a Persona pode usar a `FilesystemTool` para criar arquivos e a `TerminalTool` para rodar linters ou testes.
*   Para um Job de "analisar um documento", a Persona pode usar a `MemoryTool` para buscar informações contextuais e a `AnnotationTool` para registrar suas descobertas.

## Próximos Passos

Com este guia, você tem uma visão geral de como os Jobs e a automação funcionam no Project Wiz.

*   Revise o [Guia de Configuração de Personas e Agentes](./05-personas-agents.md) para garantir que seus agentes estejam prontos para o trabalho.
*   Explore a [Visão Geral da Interface](./03-interface-overview.md) para localizar as seções de gerenciamento de Tarefas/Jobs.

Este guia será continuamente atualizado para refletir a evolução das capacidades de automação do Project Wiz.
