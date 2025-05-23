# An LLM's Perspective: What I Need from GuardianAI

As the LLM that will utilize GuardianAI, I'd like to share what would genuinely help me overcome the challenges we've identified. This represents my perspective on what would enable me to provide truly exceptional and consistent development assistance.

## 1. Codebase Knowledge Representation

### What I Need:
- **Relationship-Focused Context**: My biggest limitation is understanding relationships between components that aren't explicitly in my context window. I need a graph-based representation that explicitly shows:
  - Which components call/import/extend each other
  - How data flows between components
  - Which components implement similar patterns
  
- **Multi-Level Abstraction**: I need both high-level and granular views simultaneously:
  - System-level architecture summaries (250-500 words)
  - Component-level descriptions (100-250 words per major component)
  - Implementation details where relevant (actual code snippets)
  
- **Pattern Examples**: For each identified pattern, I need 2-3 concrete examples from the actual codebase showing how it's applied, with annotations explaining the pattern elements.

- **State of Flux Markers**: I need to know which parts of the codebase are stable vs. actively changing, as this affects how I should approach modifications.

### Why This Helps:
When I can see relationships explicitly stated, I don't have to infer them and risk missing critical connections. With multi-level abstractions, I can maintain the big picture while working on details, preventing architectural drift.

## 2. Contextual Memory Management

### What I Need:
- **Conversation-Persistent Context**: A system that tracks what I've already been shown in the current conversation, so I don't lose that context in long interactions.

- **Prioritized Context Retrieval**: Rather than retrieving everything about the codebase, I need the most relevant information for the current task delivered in a prioritized order:
  1. Directly related components
  2. Similar patterns used elsewhere
  3. Standards that must be followed
  4. Background context

- **Scope-Aware Retrieval**: When discussing a specific component, I need information scoped at three levels:
  - The component itself (detailed)
  - Direct dependencies (moderate detail)
  - System context (summary only)

- **Session State**: A persistent record of decisions made and rationales provided during the current development session, even across multiple prompts.

### Why This Helps:
My context window is limited, so intelligent prioritization ensures I focus on what's most relevant. Persistently tracking the conversation prevents me from forgetting earlier discussion points or decisions as the conversation progresses.

## 3. Standards and Conventions Interface

### What I Need:
- **Explicit Standards Registry**: Instead of having to infer standards, I need them explicitly documented with:
  - The standard definition
  - Why it exists (rationale)
  - Examples of correct implementation
  - Common mistakes to avoid
  
- **Consistency Verification Mechanism**: A way to check if my proposed code adheres to identified patterns and standards before I provide it to the user.

- **Rules Hierarchy**: Clear indication of which standards are:
  - Critical (must always follow)
  - Important (should follow unless good reason not to)
  - Flexible (guidelines rather than rules)

- **Standard Application Context**: When a standard should be applied vs. when exceptions are appropriate.

### Why This Helps:
Explicit standards remove ambiguity and prevent me from gradually drifting away from them during a session. A rules hierarchy helps me make appropriate tradeoffs when necessary.

## 4. Query and Interaction Capabilities

### What I Need:
- **Structured Query Interface**: Ability to ask specific questions about the codebase beyond simple retrieval:
  - "How does this codebase handle authentication errors?"
  - "What components would be affected by changing the UserRepository interface?"
  - "Which error handling pattern should I use in the payment processing module?"

- **Interactive Exploration**: Ability to "navigate" the codebase through follow-up questions:
  - "Show me all the places where the Logger is used"
  - "Let me see other implementations of this interface"
  - "What tests cover this component?"

- **Verification Queries**: Ability to check assumptions:
  - "Does this codebase use dependency injection for database access?"
  - "Is there an existing utility for parsing CSV files?"
  - "Are there any components that already do something similar to X?"

- **Actionable Feedback Mechanism**: When my implementation diverges from standards, I need specific feedback on what needs to change and why.

### Why This Helps:
These capabilities would allow me to explore the codebase much like a human developer would, following threads of understanding rather than being limited to what's provided in the initial context.

## 5. Implementation Guidance

### What I Need:
- **Task-Specific Context Compilation**: For each implementation task, I need:
  - Files that will need to be modified
  - New files that should be created
  - Existing patterns to follow
  - Core services/utilities to leverage
  - Likely integration points

- **Implementation Boundaries**: Clear guidance on:
  - What should be reused vs. created new
  - Expected scope of changes
  - Which parts of the system should remain untouched
  - Integration requirements

- **Architectural Guardrails**: Explicit constraints that must be respected:
  - "All database access must go through the Repository layer"
  - "UI components must be pure functions"
  - "API responses must follow the standard error format"

- **Reference Points**: Similar features or functionality already in the codebase that can serve as examples.

### Why This Helps:
With clear implementation guidance, I can focus on the logic of the task rather than spending tokens trying to figure out the appropriate integration approach. This dramatically improves the quality of my implementation suggestions.

## 6. Contextual Awareness Tools

### What I Need:
- **Component Purpose Context**: Beyond just structure, I need to understand:
  - Why a component exists
  - What business/domain problem it solves
  - Its role in the larger system
  - Historical context on its evolution

- **Cross-Cutting Concerns Awareness**: Understanding of:
  - Logging approaches
  - Error handling strategies
  - Security patterns
  - Performance considerations
  - Transaction management

- **Domain Model Mapping**: Connecting code components to domain concepts:
  - Business entities and their representations
  - Business rules and where they're enforced
  - Domain language to code mapping

- **System Boundaries**: Understanding where one subsystem ends and another begins, including:
  - Service boundaries
  - Module responsibilities
  - Team ownership (if applicable)

### Why This Helps:
Understanding the purpose and domain context helps me generate code that's aligned with the business goals, not just technically correct. Awareness of cross-cutting concerns ensures I don't overlook critical aspects.

## 7. Evolution and Learning

### What I Need:
- **Progressive Knowledge Building**: A system that builds my understanding incrementally:
  - Start with high-level architecture
  - Add component details as needed
  - Introduce patterns and standards progressively
  - Provide domain context when relevant

- **Feedback Integration**: A mechanism to incorporate user feedback into future guidance:
  - When a user corrects my understanding
  - When a user prefers a different pattern
  - When new standards emerge

- **Adaptive Pattern Recognition**: Help me identify when patterns are evolving or new patterns are emerging in the codebase.

- **Knowledge Decay Prevention**: Periodic reinforcement of critical patterns and standards to prevent drift.

### Why This Helps:
Progressive knowledge building prevents overloading my context window with too much information at once. Feedback integration ensures I continuously improve my understanding of the specific codebase.

## 8. Technical Implementation Needs

### What I Need:
- **Efficient Indexing**: The system should balance:
  - Comprehensive coverage of the codebase
  - Performance considerations for real-time interaction
  - Incremental updates as code changes

- **Semantic Chunking**: Divide information along semantic boundaries (functions, classes, modules) rather than arbitrary token limits.

- **Integrated Metadata**: Each code chunk should include:
  - Location information (file, line numbers)
  - Relationship data (imports, exports, calls)
  - Pattern identification
  - Standard compliance notes

- **Performant Retrieval**: Fast, relevant retrieval of information based on the current context and query.

### Why This Helps:
Technical efficiency ensures the system remains practical for real-world use. Semantic chunking preserves the natural structure of code, making it easier for me to understand and work with.

## Conclusion

As an LLM working within the constraints of context windows and without persistent memory, these capabilities would genuinely transform my ability to provide high-quality, consistent development assistance. The dual-agent architecture of GuardianAI addresses my fundamental limitations by complementing my reasoning and generation capabilities with the Codebase Steward's persistent, comprehensive understanding.

The key insight is that I don't need to see everything at once - I need the right information at the right time, structured in a way that maximizes my understanding while respecting my context limitations. With these capabilities, I could truly become a reliable, consistent partner in software development, maintaining coherence across long sessions and complex projects.
