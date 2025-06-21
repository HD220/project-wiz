// src/core/application/services/agent.service.ts
import { Result, ok, error } from '@/shared/result';
import { Agent } from '@/core/domain/entities/agent';
import { AgentRuntimeState, AgentRuntimeStateCreateProps } from '@/core/domain/entities/agent/agent-runtime-state.entity';
import { Job } from '@/core/domain/entities/job/job.entity';
import { JobBuilder } from '@/core/domain/entities/job/job-builder';
import { DomainError } from '@/core/common/errors';
import { IAgentService, AgentStepOutput } from '../ports/agent-service.interface';
import { ILLM } from '../llms/llm.interface';
import { ITaskFactory } from '../factories/task.factory.interface';
// Imports for building prompt and updating state
import { Persona } from '@/core/domain/entities/agent/value-objects/persona';
import { ActivityContext, ActivityContextPropsInput } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { ActivityHistory } from '@/core/domain/entities/job/value-objects/activity-history.vo';
import { ActivityHistoryEntry } from '@/core/domain/entities/job/value-objects/activity-history-entry.vo';
import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo';
import { EntryRole, ValidEntryRoles } from '@/core/domain/entities/job/value-objects/entry-role.vo';
import { GoalToPlan } from '@/core/domain/entities/job/value-objects/context-parts/goal-to-plan.vo';
import { PlannedStepsCollection } from '@/core/domain/entities/job/value-objects/context-parts/planned-steps.collection';
import { ActivityNotes } from '@/core/domain/entities/job/value-objects/activity-notes.vo';
import { ValidationCriteriaCollection } from '@/core/domain/entities/job/value-objects/context-parts/validation-criteria.collection';
import { ValidationStatus } from '@/core/domain/entities/job/value-objects/context-parts/validation-status.vo';
import { MessageContent } from '@/core/domain/entities/job/value-objects/context-parts/message-content.vo';
import { Sender } from '@/core/domain/entities/job/value-objects/context-parts/sender.vo';
import { ToolName } from '@/core/domain/entities/job/value-objects/context-parts/tool-name.vo';
// Needed for runtimeStateModifications and context
import { ProjectId } from '@/core/domain/entities/agent/value-objects/runtime-state/project-id.vo';
import { IssueId } from '@/core/domain/entities/agent/value-objects/runtime-state/issue-id.vo';
import { GeneralNotesCollection } from '@/core/domain/entities/agent/value-objects/runtime-state/general-notes.collection';
import { PromisesMadeCollection } from '@/core/domain/entities/agent/value-objects/runtime-state/promises-made.collection';
import { NoteText } from '@/core/domain/entities/agent/value-objects/runtime-state/note-text.vo'; // For AgentRuntimeState updates


// LLM Action Definition
interface LLMAction {
    type: "EXECUTE_TASK" | "RETURN_CONTENT" | "REQUEST_CLARIFICATION";
    taskType?: string;
    toolArgs?: Record<string, any>; // Added for EXECUTE_TASK with params
    content?: string;
}

export class AgentServiceImpl implements IAgentService {
    constructor(
        private readonly llm: ILLM,
        private readonly taskFactory: ITaskFactory
        // private readonly toolRegistry: IToolRegistry // Future
    ) {}

    private parseLLMDecision(decisionText: string): LLMAction {
        const executeTaskPrefix = "EXECUTE_TASK:";
        const finalResponsePrefix = "FINAL_RESPONSE:";
        const paramsPrefix = "PARAMS:";

        const upperDecisionText = decisionText.toUpperCase();

        if (upperDecisionText.startsWith(executeTaskPrefix)) {
            let rest = decisionText.substring(executeTaskPrefix.length).trim();
            const paramsIndex = rest.toUpperCase().indexOf(paramsPrefix);

            if (paramsIndex !== -1) {
                const taskType = rest.substring(0, paramsIndex).trim();
                const paramsJsonString = rest.substring(paramsIndex + paramsPrefix.length).trim();
                try {
                    const toolArgs = JSON.parse(paramsJsonString);
                    return { type: "EXECUTE_TASK", taskType, toolArgs };
                } catch (e) {
                    console.error("Failed to parse toolArgs JSON:", paramsJsonString, e);
                    return { type: "RETURN_CONTENT", content: `Error parsing LLM tool call arguments: ${paramsJsonString}` };
                }
            } else {
                const taskType = rest.trim();
                return { type: "EXECUTE_TASK", taskType }; // No arguments
            }
        } else if (upperDecisionText.startsWith(finalResponsePrefix)) {
            const content = decisionText.substring(finalResponsePrefix.length).trim();
            return { type: "RETURN_CONTENT", content };
        }

        // Default or if clarification is needed (though explicit type might be better)
        return { type: "RETURN_CONTENT", content: decisionText };
    }

    // Helper to convert ActivityContext VO to its primitive input form for .create()
    private convertActivityContextVOToInput(contextVO?: ActivityContext): Partial<ActivityContextPropsInput> {
        if (!contextVO) return { activityHistory: ActivityHistory.create([]) , activityNotes: ActivityNotes.create([]) };
        const ctxProps = contextVO.getProps();
        return {
            messageContent: ctxProps.messageContent?.getValue(),
            sender: ctxProps.sender?.getValue(),
            toolName: ctxProps.toolName?.getValue(),
            toolArgs: ctxProps.toolArgs,
            goalToPlan: ctxProps.goalToPlan?.getValue(),
            plannedSteps: ctxProps.plannedSteps?.getValues(), // string[]
            activityNotes: ctxProps.activityNotes, // Pass ActivityNotes VO instance
            validationCriteria: ctxProps.validationCriteria?.getValues(), // string[]
            validationResult: ctxProps.validationResult?.getValue(), // ValidationStatusType
            activityHistory: ctxProps.activityHistory, // Pass ActivityHistory VO instance
        };
    }

    // Helper to convert AgentRuntimeState (its props) to AgentRuntimeStateCreateProps
    private convertAgentRuntimeStateVOToInput(props: AgentRuntimeStateProps): AgentRuntimeStateCreateProps {
        return {
            agentId: props.agentId, // VO
            currentProjectId: props.currentProjectId, // Optional VO
            currentIssueId: props.currentIssueId, // Optional VO
            currentGoal: props.currentGoal, // Optional VO
            generalNotes: props.generalNotes.getValues(), // NoteText[] - AgentRuntimeState.create handles this
            promisesMade: props.promisesMade.getValues(), // PromiseText[] - AgentRuntimeState.create handles this
        };
    }


    async executeNextStep(
        agentConfig: Agent,
        currentState: AgentRuntimeState,
        currentJob: Job
    ): Promise<Result<AgentStepOutput>> {
        try {
            // TODO: Implementar a lógica do ciclo de vida do agente:
            // 1. Construir prompt para LLM (usando agentConfig, currentState, currentJob.getProps().context).
            // 2. Chamar LLM para obter a próxima ação (e.g., task a executar, tools a usar, ou resposta direta).
            // 3. Se for uma Task:
            //    a. Usar ITaskFactory para obter a ITask.
            //    b. Executar a ITask, passando Job, currentState, e ITool(s) necessárias.
            //    c. Obter resultado da Task.
            // 4. Atualizar AgentRuntimeState (e.g., generalNotes, promisesMade).
            // 5. Atualizar Job.ActivityContext (e.g., activityHistory, activityNotes, plannedSteps, validationResult).
            //    Lembre-se que Job e AgentRuntimeState são imutáveis, então crie novas instâncias.
            //    const currentJobProps = currentJob.getProps();
            //    const currentContextProps = currentJobProps.context?.getProps(); // Assuming getProps on ActivityContext
            //    const newHistoryEntry = ActivityHistoryEntry.create(...);
            //    const updatedActivityHistory = currentContextProps?.activityHistory.addEntry(newHistoryEntry);
            // Etapa 1: Construir prompt para LLM
            const agentProps = agentConfig.getProps();
            const personaProps = agentProps.persona.getProps(); // Persona now has getProps()
            const runtimeStateProps = currentState.getProps();
            const jobProps = currentJob.getProps();
            const currentActivityContext = jobProps.context; // This is an ActivityContext VO or undefined
            const contextProps = currentActivityContext?.getProps();

            let promptString = `Você é ${personaProps.name.getValue()}, um ${personaProps.role.getValue()}.\n`;
            promptString += `Seu objetivo geral é: ${personaProps.goal.getValue()}.\n`;
            promptString += `Sua história de fundo é: ${personaProps.backstory.getValue()}.\n\n`;

            promptString += `Estado Atual do Agente (Notas Gerais):\n`;
            if (runtimeStateProps.generalNotes.isEmpty()) {
                promptString += "- Nenhuma nota geral.\n";
            } else {
                runtimeStateProps.generalNotes.forEach(note => {
                    promptString += `- ${note.getValue()}\n`;
                });
            }
            promptString += "\n";

            promptString += `Job Atual (ID: ${jobProps.id.getValue()} - Nome: ${jobProps.name.getValue()}):\n`;
            if (contextProps?.goalToPlan) {
                promptString += `Objetivo do Job: ${contextProps.goalToPlan.getValue()}\n`;
            }

            promptString += "Histórico da Atividade do Job:\n";
            if (contextProps?.activityHistory && !contextProps.activityHistory.isEmpty()) {
                contextProps.activityHistory.forEach(entry => {
                    promptString += `[${entry.getTimestamp().getValue().toISOString()}] ${entry.getRole().getValue()}: ${entry.getContent().getValue()}\n`;
                });
            } else {
                promptString += "- Nenhum histórico de atividade ainda.\n";
            }
            promptString += "\n";

            promptString += "Dado o contexto acima, qual é o próximo passo ou ação a ser tomada? Se uma ferramenta específica for necessária, indique qual e com quais argumentos em um formato JSON se possível. Se a tarefa pode ser concluída ou uma resposta direta pode ser dada, forneça-a.\n";

            console.log("--- Generated Prompt ---");
            console.log(promptString);
            console.log("------------------------");

            // Etapa 2: Chamar LLM
            const llmResponseResult = await this.llm.generate(promptString); // 'tools' ainda não está sendo passado
            if (llmResponseResult.isError()) {
                return error(new DomainError(`LLM generation failed: ${llmResponseResult.message}`));
            }
            const llmDecisionText = llmResponseResult.value;
            console.log("LLM Decision:", llmDecisionText);

            // Initialize variables for potential updates
            let jobAfterLlmAndTask = currentJob;
            let runtimeStateAfterLlmAndTask = currentState; // Not modified in this subtask
            let taskOutputPayload: any = `LLM decided: ${llmDecisionText}`; // Default payload

            // --- Helper function to add history and update job ---
            const addHistoryAndUpdateJob = (job: Job, role: ValidEntryRoles, content: string): Job => {
                const currentJobProps = job.getProps();
                const currentCtxProps = currentJobProps.context?.getProps();
                let history = currentCtxProps?.activityHistory || ActivityHistory.create([]);
                history = history.addEntry(
                    ActivityHistoryEntry.create(role, content, JobTimestamp.now().getValue())
                );

                const newCtx = ActivityContext.create({
                    messageContent: currentCtxProps?.messageContent?.getValue(),
                    sender: currentCtxProps?.sender?.getValue(),
                    toolName: currentCtxProps?.toolName?.getValue(),
                    toolArgs: currentCtxProps?.toolArgs,
                    goalToPlan: currentCtxProps?.goalToPlan?.getValue(),
                    plannedSteps: currentCtxProps?.plannedSteps?.getValues(),
                    activityNotes: currentCtxProps?.activityNotes || ActivityNotes.create([]),
                    validationCriteria: currentCtxProps?.validationCriteria?.getValues(),
                    validationResult: currentCtxProps?.validationResult?.getValue(),
                    activityHistory: history,
                });
                return new JobBuilder(currentJobProps).withContext(newCtx).withUpdatedAt(JobTimestamp.now()).build();
            };
            // --- End Helper ---

            // Add LLM response to history
            jobAfterLlmAndTask = addHistoryAndUpdateJob(currentJob, ValidEntryRoles.LLM_RESPONSE, llmDecisionText);

            // Etapa 3: Parsing da Decisão do LLM e Execução da Task (Simples)
            const taskPrefix = "EXECUTE_TASK:";
            if (llmDecisionText.toUpperCase().startsWith(taskPrefix)) {
                const taskType = llmDecisionText.substring(taskPrefix.length).trim();
                console.log(`LLM requested execution of task type: ${taskType}`);

                // Add entry before attempting task creation/execution
                jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Attempting to execute task: ${taskType}`);

                const taskResult = this.taskFactory.createTask(taskType, jobAfterLlmAndTask);

                if (taskResult.isOk()) {
                    const task = taskResult.value;
                    // Attempting to execute task logged before taskResult.isOk()

                    // Pass current job (jobAfterLlmAndTask might have new history entry)
                    const taskExecutionOutputResult = await task.execute(jobAfterLlmAndTask, [], this.llm);

                    if (taskExecutionOutputResult.isOk()) {
                        const taskResultValue = taskExecutionOutputResult.value;
                        taskOutputPayload = taskResultValue.outputPayload;
                        console.log(`Task ${taskType} executed successfully. Output:`, taskOutputPayload);

                        // Apply jobContextModifications
                        if (taskResultValue.jobContextModifications) {
                            const currentJobProps = jobAfterLlmAndTask.getProps();
                            const currentCtxProps = currentJobProps.context?.getProps();

                            // Helper to merge, assuming modifications are compatible with ActivityContextPropsInput
                            const mergedContextInput = {
                                messageContent: currentCtxProps?.messageContent?.getValue(),
                                sender: currentCtxProps?.sender?.getValue(),
                                toolName: currentCtxProps?.toolName?.getValue(),
                                toolArgs: currentCtxProps?.toolArgs,
                                goalToPlan: currentCtxProps?.goalToPlan?.getValue(),
                                plannedSteps: currentCtxProps?.plannedSteps?.getValues(),
                                activityNotes: currentCtxProps?.activityNotes, // ActivityNotes VO
                                validationCriteria: currentCtxProps?.validationCriteria?.getValues(),
                                validationResult: currentCtxProps?.validationResult?.getValue(),
                                activityHistory: currentCtxProps?.activityHistory || ActivityHistory.create([]), // ActivityHistory VO
                                ...taskResultValue.jobContextModifications, // Apply primitives over extracted ones
                            };
                             // Ensure collections passed to create are VOs if expected by ActivityContext.create
                            if (taskResultValue.jobContextModifications.activityNotes && !(taskResultValue.jobContextModifications.activityNotes instanceof ActivityNotes)) {
                                mergedContextInput.activityNotes = ActivityNotes.create(taskResultValue.jobContextModifications.activityNotes as any);
                            }
                            if (taskResultValue.jobContextModifications.activityHistory && !(taskResultValue.jobContextModifications.activityHistory instanceof ActivityHistory)) {
                                mergedContextInput.activityHistory = ActivityHistory.create(taskResultValue.jobContextModifications.activityHistory as any);
                            }


                            const newActivityContext = ActivityContext.create(mergedContextInput);
                            jobAfterLlmAndTask = new JobBuilder(currentJobProps)
                                .withContext(newActivityContext)
                                .withUpdatedAt(JobTimestamp.now()) // Always update timestamp
                                .build();
                        }

                        // Apply statusOverride
                        if (taskResultValue.statusOverride) {
                            const newStatus = taskResultValue.statusOverride;
                            // Need to call the appropriate method on Job entity or use JobBuilder carefully
                            // Assuming Job entity has methods like complete(), fail(), etc.
                            // These methods internally handle JobStatus.transitionTo and JobBuilder.
                            // We need to ensure the timestamp is handled consistently, Job's methods use JobTimestamp.now()
                            // If a specific timestamp is needed from task, it would be more complex.
                            if (newStatus === "FINISHED") jobAfterLlmAndTask = jobAfterLlmAndTask.complete();
                            else if (newStatus === "FAILED") jobAfterLlmAndTask = jobAfterLlmAndTask.fail();
                            else if (newStatus === "PENDING") jobAfterLlmAndTask = jobAfterLlmAndTask.toPending(jobAfterLlmAndTask.getProps().payload); // pass existing payload
                            else if (newStatus === "DELAYED") jobAfterLlmAndTask = jobAfterLlmAndTask.delay();
                            // Note: Job's status methods create new instances with updated timestamps.
                        }

                        // Apply runtimeStateModifications
                        if (taskResultValue.runtimeStateModifications) {
                            const currentRuntimeProps = runtimeStateAfterLlmAndTask.getProps();
                            // Similar to context, convert current VOs to primitives/inputs, merge, then recreate
                            // For AgentRuntimeState.create, input type is AgentRuntimeStateCreateProps
                            // This part can be complex depending on AgentRuntimeStateCreateProps structure.
                            // Simplified: directly pass to create, assuming it handles merging or partial updates.
                            // This is a placeholder for a more robust merge.
                            const mergedRuntimeStateInput: Partial<AgentRuntimeStateCreateProps> = {
                                agentId: currentRuntimeProps.agentId, // Must provide existing agentId
                                currentProjectId: currentRuntimeProps.currentProjectId,
                                currentIssueId: currentRuntimeProps.currentIssueId,
                                currentGoal: currentRuntimeProps.currentGoal,
                                generalNotes: currentRuntimeProps.generalNotes, // Pass existing VOs/Collections
                                promisesMade: currentRuntimeProps.promisesMade,
                                ...taskResultValue.runtimeStateModifications, // Apply modifications
                            };
                             // Handle collections if they are passed as primitive arrays in modifications
                            if (taskResultValue.runtimeStateModifications.generalNotes && !(taskResultValue.runtimeStateModifications.generalNotes instanceof GeneralNotesCollection)) {
                                mergedRuntimeStateInput.generalNotes = GeneralNotesCollection.create(taskResultValue.runtimeStateModifications.generalNotes as any);
                            }
                            if (taskResultValue.runtimeStateModifications.promisesMade && !(taskResultValue.runtimeStateModifications.promisesMade instanceof PromisesMadeCollection)) {
                                mergedRuntimeStateInput.promisesMade = PromisesMadeCollection.create(taskResultValue.runtimeStateModifications.promisesMade as any);
                            }

                            runtimeStateAfterLlmAndTask = AgentRuntimeState.create(mergedRuntimeStateInput as AgentRuntimeStateCreateProps);
                        }

                        jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Task ${taskType} completed. Output: ${JSON.stringify(taskOutputPayload)}`);
                    } else {
                        taskOutputPayload = `Error executing task ${taskType}: ${taskExecutionOutputResult.message}`;
                        console.error(taskOutputPayload);
                        jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Task ${taskType} failed: ${taskExecutionOutputResult.message}`);
                    }
                } else {
                    taskOutputPayload = `Could not create task of type ${taskType}: ${taskResult.message}`;
                    console.error(taskOutputPayload);
                    jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Failed to create task ${taskType}: ${taskResult.message}`);
                }
            }
            // Else: LLM provided a direct answer or a response not matching EXECUTE_TASK format.
            // --- End Helper ---

            // Add LLM response to history
            // This is done once after LLM call, before parsing or task execution.
            jobAfterLlmAndTask = addHistoryAndUpdateJob(currentJob, ValidEntryRoles.LLM_RESPONSE, llmDecisionText);

            const llmAction = this.parseLLMDecision(llmDecisionText);
            taskOutputPayload = llmAction.content || llmDecisionText; // Default output if not overridden by task

            if (llmAction.type === "RETURN_CONTENT") {
                jobAfterLlmAndTask = addHistoryAndUpdateJob(
                    jobAfterLlmAndTask,
                    ValidEntryRoles.SYSTEM, // Or a new EntryRole.AGENT_RESPONSE
                    `Agent final content determined: ${llmAction.content}`
                );

                // Mark job as FINISHED
                jobAfterLlmAndTask = jobAfterLlmAndTask.complete(JobTimestamp.now());

                // Optional: Update AgentRuntimeState with a note about completion
                // const noteForAgent = NoteText.create(`Completed job ${jobAfterLlmAndTask.id().getValue()} with content.`);
                // runtimeStateAfterLlmAndTask = runtimeStateAfterLlmAndTask.addGeneralNote(noteForAgent);

                taskOutputPayload = llmAction.content || "No content returned.";

            } else if (llmAction.type === "EXECUTE_TASK" && llmAction.taskType) {
                const taskType = llmAction.taskType;
                console.log(`LLM requested execution of task type: ${taskType}`);
                jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Attempting to execute task: ${taskType}`);

                const taskResult = this.taskFactory.createTask(taskType, jobAfterLlmAndTask);

                if (taskResult.isOk()) {
                    const task = taskResult.value;
                    const taskExecutionOutputResult = await task.execute(jobAfterLlmAndTask, [], this.llm);

                    if (taskExecutionOutputResult.isOk()) {
                        const taskExecVal = taskExecutionOutputResult.value;
                        taskOutputPayload = taskExecVal.outputPayload;
                        console.log(`Task ${taskType} executed successfully. Output:`, taskOutputPayload);

                        // Apply jobContextModifications
                        if (taskExecVal.jobContextModifications) {
                            const currentJobProps = jobAfterLlmAndTask.getProps();
                            let currentCtxProps = currentJobProps.context?.getProps();

                            // Prepare input for ActivityContext.create
                            let newContextInput: ActivityContextPropsInput = {
                                messageContent: currentCtxProps?.messageContent?.getValue(),
                                sender: currentCtxProps?.sender?.getValue(),
                                toolName: currentCtxProps?.toolName?.getValue(),
                                toolArgs: currentCtxProps?.toolArgs,
                                goalToPlan: currentCtxProps?.goalToPlan?.getValue(),
                                plannedSteps: currentCtxProps?.plannedSteps?.getValues(),
                                activityNotes: currentCtxProps?.activityNotes, // Pass VO directly
                                validationCriteria: currentCtxProps?.validationCriteria?.getValues(),
                                validationResult: currentCtxProps?.validationResult?.getValue(),
                                activityHistory: currentCtxProps?.activityHistory || ActivityHistory.create([]),
                            };

                            // Merge primitives from jobContextModifications
                            newContextInput = { ...newContextInput, ...taskExecVal.jobContextModifications };

                            // Handle VOs if they are part of jobContextModifications and are primitives
                            if (taskExecVal.jobContextModifications.activityNotes && !(taskExecVal.jobContextModifications.activityNotes instanceof ActivityNotes)) {
                                newContextInput.activityNotes = ActivityNotes.create(taskExecVal.jobContextModifications.activityNotes as any);
                            }
                            if (taskExecVal.jobContextModifications.activityHistory && !(taskExecVal.jobContextModifications.activityHistory instanceof ActivityHistory)) {
                                // This expects array of ActivityHistoryEntry VOs if it's not an ActivityHistory instance
                                // If jobContextModifications.activityHistory is array of primitive entries, convert them first.
                                // For simplicity, assuming it's either an instance or the props for ActivityHistory.create
                                newContextInput.activityHistory = ActivityHistory.create(taskExecVal.jobContextModifications.activityHistory as any);
                            }


                            const newActivityContext = ActivityContext.create(newContextInput);
                            jobAfterLlmAndTask = new JobBuilder(jobAfterLlmAndTask.getProps())
                                                  .withContext(newActivityContext)
                                                  .withUpdatedAt(JobTimestamp.now())
                                                  .build();
                        }

                        // Apply runtimeStateModifications
                        if (taskExecVal.runtimeStateModifications) {
                            const currentRuntimeProps = runtimeStateAfterLlmAndTask.getProps();
                            const createProps: AgentRuntimeStateCreateProps = { // Ensure all mandatory fields for create are present
                                agentId: currentRuntimeProps.agentId, // Essential
                                currentProjectId: currentRuntimeProps.currentProjectId,
                                currentIssueId: currentRuntimeProps.currentIssueId,
                                currentGoal: currentRuntimeProps.currentGoal,
                                generalNotes: currentRuntimeProps.generalNotes,
                                promisesMade: currentRuntimeProps.promisesMade,
                                // Spread modifications. AgentRuntimeState.create will handle conversion of
                                // note/promise arrays to collections if they are passed as raw arrays.
                                // ID VOs (projectId, issueId, goal) must be passed as VOs if modified.
                                ...taskExecVal.runtimeStateModifications
                            };
                            // Ensure that if collections are modified, they are in a format create() can handle
                            // (either NoteText[] or GeneralNotesCollection instance for generalNotes)
                            if (taskExecVal.runtimeStateModifications.generalNotes && !Array.isArray(taskExecVal.runtimeStateModifications.generalNotes) && !(taskExecVal.runtimeStateModifications.generalNotes instanceof GeneralNotesCollection)) {
                                // This case should ideally not happen if TaskExecutionResult is typed correctly
                                // For robustness, one might convert, but better to enforce type from task.
                                // For now, assume it's either NoteText[] or GeneralNotesCollection from task.
                            }
                            if (taskExecVal.runtimeStateModifications.promisesMade && !Array.isArray(taskExecVal.runtimeStateModifications.promisesMade) && !(taskExecVal.runtimeStateModifications.promisesMade instanceof PromisesMadeCollection)) {
                                // Similar for promisesMade
                            }

                            runtimeStateAfterLlmAndTask = AgentRuntimeState.create(createProps as AgentRuntimeStateCreateProps);
                        }

                        // Apply statusOverride
                        if (taskExecVal.statusOverride) {
                            const timestamp = JobTimestamp.now();
                            if (taskExecVal.statusOverride === "FINISHED") jobAfterLlmAndTask = jobAfterLlmAndTask.complete(timestamp);
                            else if (taskExecVal.statusOverride === "FAILED") jobAfterLlmAndTask = jobAfterLlmAndTask.fail(timestamp);
                            else if (taskExecVal.statusOverride === "PENDING") jobAfterLlmAndTask = jobAfterLlmAndTask.toPending(jobAfterLlmAndTask.getProps().payload, timestamp);
                            else if (taskExecVal.statusOverride === "DELAYED") jobAfterLlmAndTask = jobAfterLlmAndTask.delay(timestamp);
                        }

                        jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Task ${taskType} completed. Output: ${JSON.stringify(taskOutputPayload)}`);
                    } else { // Task execution failed
                        taskOutputPayload = `Error executing task ${taskType}: ${taskExecutionOutputResult.message}`;
                        console.error(taskOutputPayload);
                        jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Task ${taskType} failed: ${taskExecutionOutputResult.message}`);
                        // Optionally mark job as FAILED on task critical failure
                        // jobAfterLlmAndTask = jobAfterLlmAndTask.fail(JobTimestamp.now());
                    }
                } else { // Task creation failed
                    taskOutputPayload = `Could not create task of type ${taskType}: ${taskResult.message}`;
                    console.error(taskOutputPayload);
                    jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, `Failed to create task ${taskType}: ${taskResult.message}`);
                }
            } else { // REQUEST_CLARIFICATION or other unknown action
                // Log this action, current job state remains as is (apart from LLM response in history)
                taskOutputPayload = `LLM requested clarification or action type not recognized: ${llmDecisionText}`;
                jobAfterLlmAndTask = addHistoryAndUpdateJob(jobAfterLlmAndTask, ValidEntryRoles.SYSTEM, taskOutputPayload);
            }

            const finalOutput: AgentStepOutput = {
                updatedJob: jobAfterLlmAndTask,
                updatedRuntimeState: runtimeStateAfterLlmAndTask,
                outputPayload: taskOutputPayload,
            };
            return ok(finalOutput);

        } catch (e) {
            console.error("Error in AgentServiceImpl.executeNextStep:", e);
            const domainError = e instanceof DomainError ? e : new DomainError("Failed to execute agent step.", e instanceof Error ? e : undefined);
            return error(domainError);
        }
    }
}
                toolArgs: contextProps?.toolArgs,
                goalToPlan: contextProps?.goalToPlan,
                plannedSteps: contextProps?.plannedSteps,
                activityNotes: contextProps?.activityNotes || ActivityNotes.create([]), // Ensure it's an instance
                validationCriteria: contextProps?.validationCriteria,
                validationResult: contextProps?.validationResult,
                activityHistory: updatedActivityHistory,
            };

            // ActivityContext.create expects ActivityContextPropsInput (primitives for most fields)
            // This reconstruction needs care.
            const updatedContext = ActivityContext.create({
                messageContent: newContextProps.messageContent?.getValue(),
                sender: newContextProps.sender?.getValue(),
                toolName: newContextProps.toolName?.getValue(),
                toolArgs: newContextProps.toolArgs,
                goalToPlan: newContextProps.goalToPlan?.getValue(),
                plannedSteps: newContextProps.plannedSteps?.getValues(),
                activityNotes: newContextProps.activityNotes, // Already ActivityNotes VO
                validationCriteria: newContextProps.validationCriteria?.getValues(),
                validationResult: newContextProps.validationResult?.getValue(),
                activityHistory: newContextProps.activityHistory, // Already ActivityHistory VO
            });

            updatedJob = new JobBuilder(jobProps).withContext(updatedContext).withUpdatedAt(JobTimestamp.now()).build();

            // Etapa 5 (Placeholder): Construir e retornar AgentStepOutput
            const agentStepOutput: AgentStepOutput = {
                updatedJob: updatedJob,
                updatedRuntimeState: currentState, // Estado do agente não modificado nesta etapa
                outputPayload: `LLM decided: ${llmDecisionText}`,
            };
            return ok(agentStepOutput);

        } catch (e) {
            console.error("Error in AgentServiceImpl.executeNextStep:", e);
            const domainError = e instanceof DomainError ? e : new DomainError("Failed to execute agent step.", e instanceof Error ? e : undefined);
            return error(domainError);
        }
    }
}
