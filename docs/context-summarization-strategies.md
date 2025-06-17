# Context Summarization Strategies for Long-Running Agents

## 1. Introduction

As AI agents, particularly those using `GenericAgentExecutor` for complex, multi-step tasks like the "Fullstack Developer" agent, engage in extended interactions (numerous LLM calls, tool executions, and results), the `conversationHistory` stored in `AgentJobState` can grow very large. LLMs have token limits for their context windows. Exceeding these limits can lead to errors or poor performance. Effective context management is crucial to ensure the agent remains functional and effective over long tasks.

This document outlines several strategies for managing and summarizing `conversationHistory` to keep it within token limits while preserving essential information.

## 2. Context Management Strategies

### 2.1. Simple Truncation / Windowing

This is the most basic set of techniques.

*   **Keep Last N Messages/Tokens:**
    *   **Description:** Only the N most recent messages (or a total of M tokens from recent messages) are retained in the history sent to the LLM. Older messages are discarded.
    *   **Pros:**
        *   Extremely simple to implement.
        *   Computationally very cheap.
        *   Predictable context size.
    *   **Cons:**
        *   Abrupt loss of potentially critical earlier context (e.g., initial instructions, key decisions, outputs from earlier tools that are relevant later).
        *   Not suitable for tasks requiring long-term memory or understanding of the full task evolution. The "Fullstack Developer" agent would likely fail with this alone.
    *   **Variants:**
        *   **Keep Last K Turns:** A "turn" usually consists of a user/assistant message and subsequent tool calls/results.

*   **Keep First N and Last M Messages/Tokens ("Fixed Window with Ends"):**
    *   **Description:** Preserves the initial system prompt and user request (first N messages/tokens) and the most recent interaction (last M messages/tokens). All intermediate messages are discarded.
    *   **Pros:**
        *   Retains initial grounding (system prompt, main goal) and the immediate recent flow.
        *   Relatively simple to implement.
    *   **Cons:**
        *   Loses all intermediate context, which is often vital for multi-step reasoning, problem decomposition, and iterative tool use. The "gap" in the middle can be very detrimental.

### 2.2. LLM-Based Summarization

These techniques use an LLM to condense parts of the conversation history.

*   **Summarize Oldest Turns / Sliding Window Summary:**
    *   **Description:** When the context window limit is approached, the oldest K messages (e.g., excluding the system prompt and perhaps the initial user goal) are sent to an LLM with a prompt like "Summarize this part of our conversation concisely." This summary then replaces those K messages in the history. This can be done reactively or proactively.
    *   **Pros:**
        *   Retains information from older parts of the conversation in a compressed form, which is better than simple truncation.
        *   Can preserve the gist of important past interactions.
    *   **Cons:**
        *   **Cost and Latency:** Incurs additional LLM calls specifically for summarization.
        *   **Information Loss/Bias:** The summarization LLM might misinterpret, omit critical details, or introduce its own biases. The quality of the summary is crucial.
        *   **Complexity:** Requires logic to decide when to summarize, which messages to summarize, how to integrate the summary effectively into the ongoing conversation history (e.g., as a special "summary" message).
        *   **Token Cost of Summary:** The summary itself still consumes tokens.

*   **Rolling Summary:**
    *   **Description:** A summary of the conversation is maintained and updated after each turn or every few turns. The LLM is prompted to "Update this existing summary with the key information from our latest interaction: [latest messages]".
    *   **Pros:**
        *   Can lead to a more coherent and contextually evolving summary.
    *   **Cons:**
        *   Similar to above: cost, latency, potential information loss.
        *   Prompting for effective "summary updates" can be more challenging than summarizing a fixed chunk. Requires careful prompt engineering.

### 2.3. Embedding-Based Retrieval (RAG-like Approach)

This is a more advanced technique that focuses on retrieving relevant context rather than just summarizing chronologically.

*   **Description:**
    1.  **Storage & Embedding:** All messages (or meaningful segments, like user queries, LLM thoughts, tool calls, and tool results) are stored persistently, potentially using the `MemoryTool`. Each storable piece of information is converted into a numerical vector (embedding) using an embedding model. These embeddings and their corresponding text are stored in a vector database or a system that supports similarity search.
    2.  **Retrieval:** For each new turn before calling the main LLM:
        *   The current query, goal, or the last few messages are embedded.
        *   A similarity search is performed against the vector store to find the K most semantically relevant past messages or memory items.
    3.  **Context Augmentation:** These K retrieved relevant items are added to the current (short) conversation context that is sent to the main LLM. The system prompt might also guide the LLM on how to use this retrieved information.
*   **Pros:**
    *   **Highly Relevant Context:** Can retrieve specific, important details from very long histories, even if they are not recent. This is powerful for recalling past decisions, facts, or code snippets.
    *   **Scalability:** Handles extremely long conversations or large knowledge bases much better than linear summarization or truncation.
    *   **Reduced Noise:** Provides the LLM with focused, relevant information rather than a long, potentially noisy history.
*   **Cons:**
    *   **Highest Implementation Complexity:** Requires:
        *   An embedding model (e.g., from OpenAI, Hugging Face, or self-hosted).
        *   A vector database/store (e.g., Pinecone, Weaviate, FAISS, ChromaDB, or even simple in-memory for small scale).
        *   Logic for chunking messages (if needed), generating embeddings, storing, and retrieving.
        *   This would require significant enhancements to the current `MemoryTool` or a dedicated new service.
    *   **Cost:** Cost of generating embeddings for messages and potentially cost of vector DB hosting/operations.
    *   **Latency:** The retrieval step adds latency before each LLM call.
    *   **Effectiveness Depends On:** Quality of embeddings, chunking strategy, and retrieval method.

### 2.4. Hybrid Approaches

*   **Description:** Combine multiple techniques for a balanced approach.
    *   Example 1: Keep a short sliding window of recent messages verbatim (for immediate context). For messages older than this window, use LLM-based summarization to create condensed historical summaries. When the LLM needs more detail, it could potentially use a RAG-like mechanism (if implemented) to search through the full verbose history or more detailed summaries.
    *   Example 2: Store all messages in a vector store (RAG). The context sent to the LLM includes the K most recent messages (for conversational flow) + M most relevant retrieved messages from the vector store.
*   **Pros:** Can offer the best of different worlds, balancing recency, summarized history, and targeted retrieval.
*   **Cons:** Increased overall system complexity in managing and orchestrating the different context strategies.

## 3. Initial Recommendation for `GenericAgentExecutor` ("Fullstack Developer" Agent)

Given the "Fullstack Developer" agent will engage in complex, multi-step tasks requiring long-term memory of requirements, design decisions, code context, and past actions, a robust context management strategy is essential.

**Phased Recommendation:**

1.  **Phase A (Short-Term/Initial Implementation): LLM-Based Summarization of Oldest Turns**
    *   **Strategy:** When `conversationHistory` approaches a defined token threshold (e.g., 75% of the model's max context window minus space for new prompt and response), trigger a summarization process.
    *   **Implementation:**
        *   The `GenericAgentExecutor` could use a helper function or a dedicated internal "summarization tool" (not exposed to the LLM for general use, but called by the executor itself).
        *   This process would take the oldest N messages (e.g., after the system prompt and initial user goal), send them to an LLM (could be a cheaper/faster model optimized for summarization) with a prompt like "Concisely summarize the key information, decisions, and outcomes from this segment of our conversation related to the overall goal: [overall goal]. Retain any critical details, code snippets, or unresolved questions."
        *   Replace the oldest N messages with a single message: `{ role: 'system', content: 'Summary of earlier conversation: [LLM-generated summary]' }`.
    *   **Pros:** Relatively straightforward to implement compared to RAG. Retains some historical context.
    *   **Cons:** Adds LLM call cost/latency. Risk of information loss in summary.
    *   **Consideration:** The `MemoryTool` could be used to store these summaries with tags for later, more structured retrieval if needed.

2.  **Phase B (Medium-Term/Advanced): Hybrid Approach - Recent Window + RAG from `MemoryTool`**
    *   **Strategy:**
        *   Keep the most recent K messages verbatim in `conversationHistory`.
        *   All messages (or significant ones like tool calls/results, LLM decisions) are asynchronously saved to the `MemoryTool` and embedded.
        *   Before an LLM call, augment the current K recent messages with M most relevant items retrieved from `MemoryTool` using semantic search based on the current goal or last few messages.
    *   **Implementation:**
        *   Requires `MemoryTool` to be enhanced with embedding generation and vector search capabilities (this would be a separate, significant task in the roadmap, e.g., M007 onwards).
        *   `GenericAgentExecutor` would query `MemoryTool` to fetch relevant context.
    *   **Pros:** Highly relevant context, scales well, supports "learning."
    *   **Cons:** Significant implementation effort for the enhanced `MemoryTool`.

**Initial Step for Implementation (following this research):**
The next actionable step after this research would be to implement **Phase A (LLM-Based Summarization of Oldest Turns)**. This would involve adding logic to `GenericAgentExecutor` to monitor context length and trigger summarization. A new roadmap item (e.g., A003 or similar) would detail this implementation.

This research provides a foundation for making an informed decision on how to tackle context length, starting with a practical approach and paving the way for more sophisticated methods as the agent's capabilities evolve.
