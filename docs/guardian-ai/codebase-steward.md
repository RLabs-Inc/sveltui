# Codebase Steward

The Codebase Steward is an intelligent agent that provides deep understanding and insights about a codebase. It serves as a guide to developers, helping them navigate, understand, and extend the project with high-quality, well-integrated code.

## Overview

The Codebase Steward leverages vector search and large language models to provide advanced understanding of code patterns, relationships, and architectural insights. Unlike simple code search or basic RAG systems, the Steward can:

- Identify architectural patterns in the codebase
- Map component relationships and dependencies
- Extract and maintain "living standards" documentation
- Provide context-aware implementation guidance
- Analyze specific aspects of the codebase architecture
- Detect potential bugs and improvement opportunities

## Architecture

The Codebase Steward is built on top of GuardianAI's core services:

1. **Indexing Service**: Provides code parsing and symbol extraction
2. **RAG Service**: Handles vector embeddings and semantic search
3. **LLM Service**: Generates advanced insights and analysis

The Steward adds specialized capabilities for:

- Pattern recognition
- Relationship mapping
- Code context enrichment
- Query-type-aware prompting
- Structured analysis generation

## Query Types

The Steward supports multiple query types, each optimized for different kinds of developer questions:

| Query Type      | Description                                        | Example Questions                                           |
|-----------------|----------------------------------------------------|------------------------------------------------------------|
| `EXPLANATION`   | General code explanation                           | "How does the auth system work?"                            |
| `ARCHITECTURE`  | High-level architecture analysis                   | "Explain the architecture of the data processing pipeline"  |
| `IMPLEMENTATION`| Implementation guidance                            | "How should I implement a new user notification feature?"   |
| `PATTERN`       | Code pattern identification                        | "What design patterns are used in this codebase?"           |
| `RELATIONSHIP`  | Component dependency analysis                      | "How does the UI interact with the backend services?"       |
| `BUG`           | Bug analysis and fixing guidance                   | "Why might users be getting a 404 on the profile page?"     |
| `STANDARD`      | Codebase conventions and standards                 | "What naming conventions are used in this project?"         |

## Using the Steward

### Command Line Interface

The primary way to interact with the Codebase Steward is through the `ask` command:

```bash
# Basic question
guardian-ai ask "How does the authentication service work?"

# Specify query type
guardian-ai ask "What would be the best way to add a new endpoint?" --type implementation

# Get detailed analysis
guardian-ai ask "What design patterns are used in this codebase?" --analysis

# Verbose mode (includes analysis details)
guardian-ai ask "How do the components interact?" --verbose
```

### Query Options

The `ask` command supports several options to customize the Steward's behavior:

- `--type`: Specify the query type (explanation, architecture, implementation, pattern, relationship, bug, standard)
- `--analysis`: Include detailed analysis in the response
- `--verbose`: Show more detailed information, including analysis
- `--context`: Provide additional context for the query

### Programmatic Usage

For advanced use cases, you can integrate with the Codebase Steward programmatically:

```typescript
import { VectorizedCodebaseStewardService, StewardQueryType } from '../services/steward/index.js';

// Initialize the steward with required services
const stewardService = new VectorizedCodebaseStewardService(
  llmService,
  fileSystemService,
  indexingService,
  ragService
);

await stewardService.initialize();

// Query the steward
const result = await stewardService.query(
  "How does the authentication flow work?",
  StewardQueryType.EXPLANATION,
  {
    maxTokens: 4000,
    includeAnalysis: true
  }
);

// Access the response
console.log(result.response);

// Access analysis details if requested
if (result.analysis) {
  console.log("Patterns:", result.analysis.patterns);
  console.log("Relationships:", result.analysis.relationships);
  console.log("Relevant Files:", result.analysis.relevantFiles);
}
```

## Advanced Features

### Pattern Recognition

The Steward can identify code patterns using vector similarity and LLM analysis:

```typescript
// Get identified patterns with confidence score
const patterns = await stewardService.getPatterns({
  confidence: 0.7,  // Minimum confidence threshold (0-1)
  limit: 10         // Maximum number of patterns to return
});
```

Each pattern includes:
- Name
- Description
- Code examples
- Confidence score
- Files where the pattern is used

### Relationship Mapping

Understand how components relate to each other:

```typescript
// Get all relationships
const allRelationships = await stewardService.getRelationships();

// Get relationships for a specific component
const authRelationships = await stewardService.getRelationships(
  "AuthService",
  { 
    types: ["imports", "calls"],  // Filter by relationship type
    depth: 2                      // Include indirect relationships (up to 2 levels)
  }
);
```

### Living Standards

Extract and maintain documentation of coding standards from the actual codebase:

```typescript
// Get all standards
const allStandards = await stewardService.getLivingStandards();

// Get standards for a specific category
const securityStandards = await stewardService.getLivingStandards("security");
```

### Architecture Analysis

Get deep insights into specific aspects of the codebase:

```typescript
// Analyze dependencies
const dependencyAnalysis = await stewardService.analyzeAspect(
  "dependencies",
  {
    depth: 3,              // Analysis depth (1=high-level, 3=detailed)
    focus: "external-apis" // Focus area
  }
);

console.log(dependencyAnalysis.analysis);        // Detailed text analysis
console.log(dependencyAnalysis.recommendations); // Actionable recommendations
```

### Implementation Guidance

Get detailed guidance for implementing new features:

```typescript
const guidance = await stewardService.getImplementationGuidance(
  "Add user profile image upload feature",
  {
    existingComponents: ["UserProfile", "FileStorage"],
    technicalConstraints: ["Must use S3 for storage", "Max file size: 5MB"]
  }
);

console.log(guidance.architecture);       // High-level approach
console.log(guidance.filesToModify);      // Files that need changes
console.log(guidance.newFilesToCreate);   // New files to create
console.log(guidance.implementationSteps); // Step-by-step plan
```

## Implementation Details

### Vector Storage

The Steward leverages vector embeddings to represent code symbols, patterns, and relationships. This enables semantic similarity search and pattern matching.

The vector storage system:
- Stores embeddings for code symbols and their relationships
- Supports semantic search based on natural language queries
- Maintains metadata about code locations and types
- Persists to disk for fast reloading

### LLM Prompting

The Steward uses specialized prompts for each query type to extract the most relevant information. Prompts include:

- Code context from vector search
- Query-specific instructions
- Formatting guidance for structured data extraction
- Known patterns and relationships

### Analysis Generation

For complex queries, the Steward can generate detailed analysis including:

- Architectural patterns with confidence scores
- Component relationships and dependencies
- Implementation recommendations
- Code standards and conventions
- Relevant files and code references

## Extending the Steward

The Codebase Steward is designed to be extensible. You can add new capabilities by:

1. Adding new query types in `StewardQueryType`
2. Creating specialized prompt templates for these types
3. Implementing new analysis methods in the `VectorizedCodebaseStewardService`
4. Enhancing the vector storage to capture additional code insights

## Future Enhancements

Planned improvements to the Codebase Steward include:

1. **Change Impact Analysis**: Predict effects of code changes
2. **Test Coverage Analysis**: Identify poorly tested code areas
3. **Performance Profiling Integration**: Link performance data to code patterns
4. **Multi-repository Understanding**: Connect insights across related projects
5. **Interactive Code Exploration**: Conversational interface for code navigation