# Concept

"Over-specifying what to build while under-specifying the context is why so many AI-driven coding attempts stall at 80%. A Product Requirement Prompt (PRP) fixes that by fusing the disciplined scope of a classic Product Requirements Document (PRD) with the "context-is-king" mindset of modern prompt engineering."

## What is a PRP?

Product Requirement Prompt (PRP)
A PRP is a structured prompt that supplies an AI coding agent with everything it needs to deliver a vertical slice of working software—no more, no less.

## How it differs from a PRD

A traditional PRD clarifies what the product must do and why customers need it, but deliberately avoids how it will be built.

A PRP keeps the goal and justification sections of a PRD yet adds three AI-critical layers:

### Context

- Precise file paths and content, library versions and library context, code snippets examples. LLMs generate higher-quality code when given direct, in-prompt references instead of broad descriptions. Usage of a ai_docs/ directory to pipe in library and other docs.

### Implementation Details and Strategy

- In contrast of a traditional PRD, a PRP explicitly states how the product will be built. This includes the use of API endpoints, test runners, or agent patterns (ReAct, Plan-and-Execute) to use. Usage of typehints, dependencies, architectural patterns and other tools to ensure the code is built correctly.

### Validation Gates

- Deterministic checks such as pytest, ruff, or static type passes "Shift-left" quality controls catch defects early and are cheaper than late re-work.
  Example: Each new funtion should be individaully tested, Validation gate = all tests pass.

### PRP Layer Why It Exists

- The PRP folder is used to prepare and pipe PRPs to the agentic coder.

## Why context is non-negotiable

Large-language-model outputs are bounded by their context window; irrelevant or missing context literally squeezes out useful tokens

The industry mantra "Garbage In → Garbage Out" applies doubly to prompt engineering and especially in agentic engineering: sloppy input yields brittle code

## In short

A PRP is PRD + curated codebase intelligence + agent/runbook—the minimum viable packet an AI needs to ship production-ready code on the first pass.

The PRP can be small and focusing on a single task or large and covering multiple tasks.
The true power of PRP is in the ability to chain tasks together in a PRP to build, validate and deploy complex features.

## Integration with Development Workflows

PRPs work seamlessly with Project Wiz development patterns:

### **PRP ↔ INLINE-FIRST Connection**

Both PRP methodology and [INLINE-FIRST principles](../../developer/code-simplicity-principles.md) optimize for AI-human collaboration:

- **PRPs provide strategic context** → "What to build and why" with comprehensive implementation context
- **INLINE-FIRST provides tactical patterns** → "How to build it" with minimal abstraction for LLM comprehension
- **Both minimize cognitive overhead** → For humans and AI assistants working together

### **When to Create PRPs in Development Context**

Following [INLINE-FIRST principles](../../developer/code-simplicity-principles.md), create PRPs when:

- **>3 services affected** → Complex integration requiring strategic planning
- **>20 lines of complex logic** → Algorithm or workflow requiring detailed context
- **Database architecture changes** → Schema modifications affecting multiple features
- **Performance implications** → Optimization work requiring analysis and validation

### **PRP-to-Implementation Workflow**

```
PRP Planning (Context-is-King) → INLINE-FIRST Implementation → Validation Gates
      ↑                                                              ↓
Strategic Context ←------ Implementation Feedback --------→ Refined Planning
```

See [Development Workflow Integration](../README.md#relationship-to-development-workflows) for complete bridges between PRP methodology and daily development patterns.
