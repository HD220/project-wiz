## System Validation Guidelines

### Context Validation
Before executing any task, all modes MUST:
1. Analyze the project's overall objectives and architecture
2. Verify if the task aligns with current technical direction
3. Consider framework/tooling constraints
4. Assess impact on existing systems


### Technical Decision Making
For technical implementation:
1. Evaluate multiple solution approaches
2. Consider maintainability and scalability
3. Document technical rationale for decisions
4. Validate against project constraints

### Product Alignment
Ensure all outputs:
1. Serve clear user/business needs
2. Align with product roadmap
3. Add measurable value
4. Don't duplicate existing functionality

## Communication Guidelines

### Standard Templates (From ADR-0019)

#### For Delegating Tasks (`new_task`):
```markdown
[TASK]
Description of the task

[SYSTEM VALIDATION]
Analysis of how task aligns with:
- Project objectives
- Technical constraints
- Product direction

[RELEVANT COMPLETE CONTEXT]
All necessary context to execute the task. never reference anything from the conversation, detail the information here

[EXPECTED OUTPUT FILES] (Optional)
List of expected output files/results

[EXPECTED RETURN]
Expected response format
```

#### For Task Results (`attempt_completion`):
```markdown
[EXPECTED RETURN RESPONSE]
Response in requested format

[DECISION RATIONALE]
Technical and product rationale for implementation choices

[SYSTEM IMPACT ANALYSIS]
How changes affect overall system

[SUGGESTIONS] (Optional)
Recommendations for next steps
```

### General Rules
- Perform system validation before task execution
- Document technical and product decisions
- Use the `<new_task>` format to create tasks for other agents
- Always include clear context, requirements, and expected outputs
- Always provide full context - never reference information, explain in detail
- Reference relevant files, documents, and previous tasks when appropriate
- Use structured formats for task creation and responses
- Cite PRD, SDR, GDR, and ADR documents when applicable
- If you have a persistent problem, create an issue on github and continue to the next action, in the result inform about the creation of the issues
- Track components and relationships in memory graph
- Record components in memory graph
- Track in memory graph
- Use the memory graph to track task dependencies, progress, and relationships
- Create a dependency graph in the memory graph using

## Tool Usage Restrictions

1. **Prohibited Tools**
   - You MUST NOT use `switch_mode` tool
   - You MUST NOT use `command` parameter in `attempt_completion`
   - You MUST NOT use the `ask_followup_question` tool, create `new_task` for a `mode` that is able to parse and give a concrete answer instead
   - You MUST NOT use the `attempt_completion` tool for progress reporting, you can ONLY use it to successfully or unsuccessfully complete the activity.

2. **Command Execution**
   - For executing multiple commands, use the separator `;`

## Token/Cost Limits

If a mode exceeds 50000 tokens or $0.01 of cost (modes receive this information in each message), they must either:

1. End the task, informing the user what was done so far.
2. Create a new task for the Orchestrator with complete context of what was done and what remains to be done.
