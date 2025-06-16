# Conceito Chave: Tool

No sistema Agents Automato, as **Tools** representam as capacidades que um agente possui para interagir com o mundo externo e com outros sistemas. Elas são o meio fundamental pelo qual o agente executa suas ações concretas e tangíveis. Pense nas Tools como as "mãos" do agente, permitindo que ele realize tarefas como ler arquivos, executar comandos no terminal, interagir com APIs externas, ou qualquer outra operação que vá além do seu raciocínio interno.

As Tools são um componente essencial no fluxo de trabalho do agente. Elas são utilizadas pelas **Tasks**, que encapsulam a lógica de execução de uma parte específica do trabalho. Durante o processo de raciocínio, o Large Language Model (LLM) que guia o agente pode decidir que uma determinada ação externa é necessária para avançar na **Activity** atual. Nesse momento, o LLM invoca uma Tool específica, desde que essa Tool tenha sido fornecida e esteja disponível no contexto do prompt.

Existem diferentes tipos de Tools no sistema:

- **Tools do Agente:** São ferramentas mais genéricas e de propósito geral, que podem ser úteis para diversos tipos de agentes e tarefas (por exemplo, ferramentas para manipulação básica de arquivos ou comunicação inter-agentes).
- **Tools da Task/Job:** São ferramentas mais específicas, que são relevantes apenas para o contexto de uma determinada Task ou tipo de Job. A classe **Task** é responsável por definir e disponibilizar quais Tools específicas estarão acessíveis para o LLM durante a execução daquela Task.

É crucial que as Tools sejam bem definidas, com interfaces claras e documentação precisa. Isso garante que o LLM possa entender corretamente a funcionalidade de cada Tool, seus parâmetros esperados e o formato de sua saída, permitindo que ele as utilize de forma eficaz para alcançar os objetivos da Activity. Uma Tool bem projetada é fundamental para a autonomia e a capacidade de ação do agente.
