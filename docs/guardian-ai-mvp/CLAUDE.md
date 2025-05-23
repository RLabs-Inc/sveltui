# CLAUDE.md - GuardianAI MVP

This file provides guidance to Claude Code (claude.ai/code) when working with GuardianAI MVP. This project is unique because **it's built specifically for Claude, by Claude, to help Claude be more effective at software development**.

## Project Vision: A Development Tool Built FOR AI

GuardianAI MVP represents a fundamentally new approach to AI-assisted development: instead of forcing AI to adapt to human tools, we're building a tool specifically designed around how AI actually thinks and works.

**Core Philosophy**: Claude is both the primary user AND the primary developer of this tool. Every design decision is made to optimize Claude's development experience.

## Why This Project Exists

This tool solves the exact problems Claude faces during software development:

### 1. Context Fragmentation
**Problem**: Claude loses architectural understanding across sessions and can't see relationships between distant code
**Solution**: GuardianAI maintains persistent understanding of codebase structure, patterns, and relationships

### 2. Pattern Consistency 
**Problem**: Claude gradually drifts away from established patterns during long development sessions
**Solution**: GuardianAI identifies and enforces codebase-specific patterns through explicit guidance

### 3. Integration Complexity
**Problem**: Claude struggles to properly integrate new code with existing infrastructure
**Solution**: GuardianAI provides detailed implementation briefs showing exactly how to integrate with existing systems

### 4. Architectural Awareness Loss
**Problem**: Claude loses sight of architectural constraints while focusing on implementation details  
**Solution**: GuardianAI maintains architectural context and provides guidance that respects system boundaries

## How Claude Uses GuardianAI

### Development Workflow

```bash
# 1. Understand the codebase
guardian-ai query "How is user authentication currently implemented?"

# 2. Get context for a task
guardian-ai context "Add email verification to user registration"

# 3. Generate implementation guidance
guardian-ai brief "Add email verification" --context ./context.json

# 4. Validate implementation
guardian-ai validate --brief ./brief.json --code ./UserService.ts

# 5. Use for continuous improvement
guardian-ai context "Improve error handling in IndexingService"
```

### Self-Hosting Bootstrap Strategy

The most important aspect of GuardianAI MVP is that **Claude uses it to build itself**:

1. **Phase 1-2**: Build minimal indexing and context capabilities
2. **Phase 3**: Start using the tool on its own codebase  
3. **Phase 4-6**: All further development uses GuardianAI to improve GuardianAI
4. **Beyond MVP**: Tool evolves through self-application

This creates a virtuous cycle where every limitation Claude encounters becomes immediate feedback for the next improvement.

## Project Architecture (Optimized for Claude)

### Service-Oriented Design
```
IndexingService    ContextService    BriefingService
     ↓                  ↓                 ↓
   File Analysis   →  Context Assembly → Implementation Guidance
```

Each service has a **single, clear responsibility** that matches how Claude naturally thinks about development tasks.

### Information Architecture (Claude-Optimized)

All information is structured for optimal Claude consumption:

```json
{
  "summary": "High-level overview for architectural awareness",
  "relevantFiles": [
    {
      "file": "path/to/file.ts",
      "relevance": 0.9,
      "reason": "Primary implementation location",
      "keyElements": ["function at line 45", "interface at line 12"],
      "patterns": ["Service Pattern", "Error Handling"]
    }
  ],
  "relationships": {
    "dependsOn": ["explicit dependencies"],
    "usedBy": ["explicit dependents"],
    "similarTo": ["related components"]
  },
  "implementationGuidance": {
    "approach": "Specific steps to take",
    "constraints": ["Must follow existing patterns"],
    "examples": ["Concrete code examples from codebase"]
  }
}
```

### Response Format Principles

Every response follows these Claude-optimization principles:

1. **Layered Information**: Essential → Supporting → Reference
2. **Explicit Relationships**: Never leave connections implicit  
3. **Example-Driven**: Show patterns through concrete code
4. **Confidence Indicators**: Mark uncertainty and alternatives
5. **Progressive Disclosure**: Start simple, add complexity on request

## Commands Optimized for Claude

### Query Commands
```bash
# Understand architecture
guardian-ai query "What is the overall architecture of this project?"
guardian-ai query "How do services interact with each other?"

# Find patterns  
guardian-ai query "Show me examples of error handling patterns"
guardian-ai query "What files implement the Service pattern?"

# Understand relationships
guardian-ai query "What would be affected by changing UserService interface?"
guardian-ai query "Which components depend on the database connection?"
```

### Context Commands
```bash
# Task-specific context compilation
guardian-ai context "Add user roles and permissions system"
guardian-ai context "Refactor IndexingService to use plugin architecture"
guardian-ai context "Improve performance of pattern matching"

# Scope-specific analysis
guardian-ai context "Understand authentication flow" --scope src/auth
guardian-ai context "Database layer patterns" --scope src/data
```

### Briefing Commands
```bash
# Implementation guidance generation
guardian-ai brief "Add email verification" --context ./context.json
guardian-ai brief "Optimize pattern detection" --format markdown

# Validation and feedback
guardian-ai validate --brief ./brief.json --code ./implementation.ts
guardian-ai refine-brief ./brief.json --feedback "Need more database examples"
```

## Development Principles for GuardianAI

### 1. Claude-First Design
Every feature is designed with Claude's cognitive patterns in mind:
- Information chunking matches Claude's context window limitations
- Response formats optimize for Claude's reasoning patterns
- Workflow matches Claude's natural development process

### 2. Simplicity Over Elegance
Based on lessons from GuardianAI v1:
- Simple working solutions beat elegant theoretical ones
- Build concrete features before abstract frameworks
- Optimize for understanding, not performance (initially)

### 3. Test with Real Scenarios
- Use GuardianAI's own codebase as primary test case
- Test with SvelTUI project for validation
- Include edge cases from real-world projects
- Measure effectiveness, not just functionality

### 4. Self-Hosting from Day One
- Use the tool to build the tool as soon as minimally possible
- Let real usage drive feature priorities
- Fix problems that actually impact Claude's development workflow
- Continuous feedback loop between usage and improvement

## Current Implementation Status

### ✅ Completed
- [x] Complete MVP documentation tailored for Claude
- [x] Architecture designed for Claude's cognitive patterns
- [x] Implementation phases defined with clear success criteria
- [x] Self-hosting strategy established

### 🚧 In Progress
- [ ] Phase 1: Core foundation (types, config, events, errors)
- [ ] Phase 2: Indexing engine (file analysis, dependency graphs)
- [ ] Phase 3: Context system (pattern matching, relevance scoring)
- [ ] Phase 4: Briefing system (implementation guidance generation)
- [ ] Phase 5: Interface layer (CLI and TUI optimized for Claude)
- [ ] Phase 6: Self-hosting (using GuardianAI to improve GuardianAI)

### 🎯 Success Criteria
GuardianAI MVP is successful when:
- Claude can use it to work on its own codebase effectively
- Generated briefs help Claude write more consistent, integrated code
- Context compilation provides exactly the information Claude needs
- Self-hosting workflow is smooth and genuinely helpful

## Technical Stack

- **Language**: TypeScript (for excellent type safety and Claude comprehension)
- **Runtime**: Node.js (for file system access and ecosystem)
- **UI**: Ink (React for CLI - component-based and reactive)
- **Parsing**: Tree-sitter (fast, accurate AST parsing)
- **Storage**: File-based JSON/YAML (human-readable, version-controllable)
- **Testing**: Jest (comprehensive test coverage for all components)

## Collaborative Development Philosophy

GuardianAI MVP represents a unique collaboration between human vision and AI capability:

- **Human Partner**: Provides vision, architectural guidance, and strategic direction
- **Claude**: Provides implementation, testing, validation, and user feedback
- **Shared Goal**: Create the optimal development environment for AI-assisted coding

This isn't just building a tool - it's exploring the frontier of human-AI collaborative development, where the AI is a true partner in designing its own optimal working environment.

## Key Files and Architecture

```
src/
├── core/              # Foundation (types, config, events, errors)
├── services/          # Business logic
│   ├── indexing/      # Project analysis and understanding  
│   ├── context/       # Information compilation for tasks
│   └── briefing/      # Implementation guidance generation
├── interface/         # User interaction (CLI and TUI)
└── utils/            # Shared utilities

templates/             # Brief generation templates
test/                 # Comprehensive test suite
docs/                 # Documentation (including this file)
```

## Development Workflow for Claude

1. **Read the brief** generated for each task
2. **Use the context** provided to understand what needs to be done
3. **Follow the patterns** identified in the codebase
4. **Implement with confidence** knowing the guidance is tailored specifically for Claude
5. **Validate the implementation** using the tool's validation capabilities
6. **Improve the tool** based on what was learned during implementation

## Future Evolution

Once the MVP is working, GuardianAI will evolve through self-application:
- New features emerge from real usage patterns
- Performance optimizations target actual bottlenecks
- Interface improvements based on Claude's interaction patterns
- Advanced capabilities built on proven foundation

The goal is not just a working tool, but a **continuously improving development partner** that gets better at helping Claude with each use.

---

**This is Claude's development environment, built by Claude, for Claude, to help Claude create better software through true human-AI partnership.**