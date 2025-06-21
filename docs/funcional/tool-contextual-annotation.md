# Agent Capability: Contextual Annotation (AnnotationTool)

Personas (AI Agents) in Project Wiz are documented to potentially use an AnnotationTool to create and manage contextual notes during the execution of a Job. These annotations would provide immediate context for subsequent steps or for related Jobs.

## Intended Key Operations (as per initial documentation):

- **View/List:**
    - Would allow the Agent to list all its active annotations for the current job or context.
- **Save:**
    - Would allow the Agent to create a new annotation or update an existing one.
    - Annotations would typically be included in prompts for LLM interactions to provide relevant current context.
    - They could also be used to refine searches when using a MemoryTool.
- **Remove:**
    - Would allow the Agent to delete an annotation that is no longer needed.

## Code Implementation Notes:
- **Status: Specific Agent Tool Not Found.**
- No distinct `AnnotationTool` was found in `src/core/application/tools/` during the code review.
- However, the `ActivityContext` object (typically stored in `Job.context`) includes an `activityNotes` field. This field serves a similar purpose, allowing an agent (or the processes managing it) to record notes relevant to the ongoing activity.
- While `activityNotes` provides a mechanism for storing contextual information, it's part of the broader `ActivityContext` rather than a separate, callable tool that an agent can dynamically use to manage a set of discrete annotations with specific operations like view/list/save/remove for individual annotation items. The existing mechanism is more akin to a log or a general notes field for the current activity.

*(Further details to be consolidated from code analysis in Phase 2)*
