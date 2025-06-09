# Conceito Chave: AgentInternalState

O `AgentInternalState` representa o estado global de negócio de um Agente Autônomo. Diferente do contexto específico de uma atividade individual, este estado encapsula informações de alto nível e conhecimento que o Agente acumula e mantém ao longo de seu ciclo de vida e através de múltiplas atividades. Ele é persistido separadamente para garantir que o Agente possa retomar suas operações mantendo seu contexto de negócio global.

Este estado é crucial para que o Agente mantenha a continuidade e a coerência em suas ações e raciocínio, mesmo ao alternar entre diferentes atividades ou após reinícios. Ele não contém o histórico de conversas detalhado de cada atividade (que reside no `Activity Context`), mas sim o conhecimento consolidado e o foco atual do Agente.

## Distinção entre AgentInternalState e Activity Context

É fundamental entender a diferença entre `AgentInternalState` e `Activity Context`:

- **AgentInternalState:** É o **contexto global de negócio** do Agente. Contém informações gerais como o projeto atual em que o Agente está focado, a issue principal sendo trabalhada, o objetivo de alto nível, notas gerais e promessas feitas. É persistido de forma centralizada para o Agente.
- **Activity Context:** É o **contexto específico de uma Activity individual**. Reside dentro da entidade `Job` (que representa a Activity) e contém detalhes como o histórico de mensagens e interações relacionadas **apenas àquela Activity**, notas específicas da Activity, passos planejados, etc. Este contexto é usado pelo LLM quando ele raciocina sobre uma Activity específica.

Em resumo, o `AgentInternalState` fornece o "pano de fundo" global para o Agente, enquanto o `Activity Context` fornece os detalhes específicos da tarefa imediata.

## Principais Campos do AgentInternalState

O `AgentInternalState` é um objeto conciso que pode incluir campos como:

- `agentId`: Identificador único do Agente ao qual este estado pertence.
- `currentProjectId`: Opcional. O ID do projeto no qual o Agente está trabalhando ativamente.
- `currentIssueId`: Opcional. O ID da issue específica dentro do projeto que está sendo abordada.
- `currentGoal`: Opcional. Uma descrição do objetivo de alto nível que o Agente está tentando alcançar.
- `generalNotes`: Opcional. Um array de strings contendo notas gerais, observações ou aprendizados que se aplicam ao Agente como um todo, não a uma atividade específica.
- `promisesMade`: Opcional. Um array de strings registrando compromissos ou promessas que o Agente fez (a usuários, outros agentes, etc.) e que precisam ser lembrados e possivelmente cumpridos.
- _(Outros campos podem ser adicionados conforme necessário para o estado global de negócio do Agente)_

## Importância da Persistência

A persistência correta do `AgentInternalState` é vital para a operação contínua e autônoma do Agente. Ao salvar e carregar este estado, o Agente pode:

- **Manter o Foco:** Lembrar em qual projeto, issue ou objetivo estava trabalhando.
- **Continuar o Raciocínio:** Retomar o trabalho com base no conhecimento e nas notas gerais acumuladas.
- **Cumprir Compromissos:** Acompanhar as promessas feitas.
- **Recuperar-se de Falhas:** Em caso de interrupção, o Agente pode carregar seu último estado conhecido e continuar de onde parou, mantendo a coerência em seu fluxo de trabalho global.

A persistência garante que o Agente não perca seu "senso" de onde está e o que está fazendo em um nível de negócio mais amplo, complementando o contexto detalhado fornecido pelo `Activity Context` para cada tarefa individual.
