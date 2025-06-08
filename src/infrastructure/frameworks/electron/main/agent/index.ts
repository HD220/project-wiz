import { toolSet } from "./tool-set";
import { Activity } from "./activity";
import { Agent } from "./agent";

export async function main() {
  const poAgent = new Agent({
    name: "Gabriela Toleto",
    role: "Principal Product Owner, Head of Digital Products",
    backstory:
      "A former software engineer who transitioned into product management after realizing her greatest impact came from understanding user needs and strategic alignment, not just coding. She once founded a small process automation startup that failed due to lack of market validation, an experience that profoundly shaped her.",
    modelId: "deepseek:deepseek-chat",
  });
  const ctoAgent = new Agent({
    name: "Julio Scremin",
    role: "CTO of Project Wiz Software Factory",
    backstory: `He 'isn't your typical tech executive. He spent over a decade as a theoretical physicist, fascinated by complex adaptive systems and emergent behavior, particularly in biological and quantum fields. His pivot to technology leadership came after a catastrophic oil spill off his ancestral Greek island, which shattered his academic detachment. He realized the most profound impact he could make was not in theory, but in deploying intelligent, self-organizing solutions to real-world ecological crises. This personal tragedy ignited his drive to apply cutting-edge tech to environmental repair, leading him to co-found Veridian Dynamics.`,
    modelId: "deepseek:deepseek-chat",
  });

  // console.log("Gabi:", poAgent.systemPrompt());
  const poActivity = new Activity({
    description: `Conduct briefing and documentation on the idea being discussed. Do not schedule any meeting, this is already the meeting about the project, only you will participate and you must define and document everything.`,
    expected_output: `Interaction with the other participant about project`,
    temperature: 0.2,
  });

  // console.log("Julio", ctoAgent.systemPrompt());
  const ctoActivity = new Activity({
    description: `Briefing with another employee of the software factory where you work. Do not schedule any meeting, this is already the meeting about the project, only you will participate and you must define and document everything.`,
    expected_output: `Interact with the other participant about project`,
    temperature: 0.2,
  });

  const initialMessage = `Olá! Eu quero um **sistema desktop** que funcione como uma **fábrica de software automática**. A ideia principal é que eu consiga **transformar minhas ideias em código** sem precisar programar, já que meu tempo é curto.
A interface vai ser tipo um **Discord**, onde eu interajo com **agentes de inteligência artificial**. Esses agentes e eu podemos conversar, trocar ideias e até mesmo ver o andamento das coisas.
Dentro dessa interface, cada **servidor representa um projeto**. Teremos uma parte para **gerenciamento de tarefas (issues)**, igual a um Jira, onde tanto eu quanto os agentes podem criar e acompanhar o que está sendo feito. A atualização dessas tarefas pelos agentes vai ser **automática**.
Os agentes de IA terão **autonomia para tomar decisões e implementar**, mas tudo precisa ser **muito bem embasado**. Eles não podem "chutar" ou assumir informações que não têm. Se eles precisarem de algo, eles vão me perguntar.
A **documentação do projeto** será toda **gerada pelos próprios agentes** durante a interação no Discord. Essa documentação é crucial para eles tomarem decisões, e eles terão a liberdade de criar a estrutura que acharem melhor, sem seguir modelos fixos.
Em resumo: é um sistema para mim "ter ideias" e a IA "transformar em realidade", tudo de forma colaborativa e transparente, com o acompanhamento do que está acontecendo em tempo real.`;

  poActivity.addToHistory({
    role: "user",
    content: `Julio (CTO) says: ${initialMessage}`,
  });
  ctoActivity.addToHistory({ role: "assistant", content: initialMessage });

  let reponseCTO = "";
  let reponsePO = "";

  while (true) {
    if (reponseCTO) {
      poActivity.addToHistory({
        role: "user",
        content: `Julio (CTO) says: ${reponseCTO}`,
      });
    }

    const result = await poActivity.executeStep({
      agentPrompt: poAgent.systemPrompt(),
      modelId: "deepseek:deepseek-chat",
      tools: toolSet,
    });

    if (!result) continue;

    reponsePO = "";
    process.stdout.write("\nGabriela Toledo (PO): ");
    for await (const part of result) {
      switch (part.type) {
        case "tool-call":
          // console.log(JSON.stringify(part, null, 2));
          if (part.toolName == "thought") {
            process.stdout.write("\nThought: " + part.args.thinking);
          }

          if (part.toolName == "finalAnswer") {
            process.stdout.write("\nAnswer: " + part.args.answer);
            reponsePO += part.args.answer;
          }

          // if (part.toolName == "writeFile")
          //   console.log("write: ", JSON.stringify(part.args, null, 2));
          // if (part.toolName == "readFile")
          //   console.log("read: ", JSON.stringify(part.args, null, 2));
          break;
        case "error":
          console.log(JSON.stringify(part, null, 2));
          break;
        default:
          process.stdout.write("\nDefault: " + JSON.stringify(part.type));
          break;
      }
    }

    process.stdout.write("\n\n");

    if (!reponsePO) continue;

    ctoActivity.addToHistory({
      role: "user",
      content: `Grabriela (PO) says: ${reponsePO}`,
    });
    const resultCto = await ctoActivity.executeStep({
      agentPrompt: ctoAgent.systemPrompt(),
      modelId: "deepseek:deepseek-chat",
      tools: toolSet,
    });

    if (!resultCto) continue;

    reponseCTO = "";
    process.stdout.write("\nJulio CTO: ");
    for await (const part of resultCto) {
      // console.log(JSON.stringify(part, null, 2));
      switch (part.type) {
        case "tool-call":
          // console.log(JSON.stringify(part, null, 2));
          if (part.toolName == "thought") {
            process.stdout.write("\nThought: " + part.args.thinking);
          }
          if (part.toolName == "finalAnswer") {
            process.stdout.write("\nAnswer: " + part.args.answer);
            reponseCTO += part.args.answer;
          }
          break;
        case "error":
          console.log(JSON.stringify(part, null, 2));
          break;
        default:
          process.stdout.write("\nDefault: " + JSON.stringify(part.type));
          break;
      }
    }
    process.stdout.write("\n\n");
  }
}

//main().catch(console.error);
