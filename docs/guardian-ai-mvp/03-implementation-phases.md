# Implementation Phases for GuardianAI MVP

**Document Purpose**: Step-by-step implementation plan tailored for Claude
**Audience**: Claude (implementation agent)
**Focus**: Clear, actionable phases with concrete deliverables

## Phase Overview

```
Phase 1: Foundation     → Phase 2: Indexing      → Phase 3: Context
(Project Setup)           (Core Analysis)          (Information Assembly)
     ↓                        ↓                        ↓
Phase 4: Briefing      → Phase 5: Interface     → Phase 6: Self-Hosting
(Guidance Generation)    (User Interaction)       (Bootstrap Complete)
```

Each phase has:
- **Clear deliverables** that can be tested independently
- **Success criteria** to know when to move to next phase
- **Dependencies** on previous phases
- **Testing strategy** to validate functionality

---

## Phase 1: Foundation (Core Infrastructure)

**Duration**: 1-2 sessions
**Goal**: Establish project structure and core services foundation

### Deliverables

#### 1.1 Project Structure Setup
```bash
# Create project structure
mkdir guardian-ai-mvp
cd guardian-ai-mvp
npm init -y
# Install dependencies and setup TypeScript
```

**Files to Create**:
- `package.json` with all dependencies
- `tsconfig.json` with strict configuration  
- `guardian-ai.config.yaml` with default settings
- Basic project folder structure (src/, test/, templates/)

#### 1.2 Core Types and Interfaces
**File**: `src/core/types.ts`
- Define all TypeScript interfaces from technical specifications
- Focus on `ProjectIndex`, `FileInfo`, `ContextPackage`, `ImplementationBrief`
- Include comprehensive JSDoc comments

#### 1.3 Configuration System
**File**: `src/core/config.ts`
- Implement hierarchical configuration loading
- Support YAML, JSON, and environment variables
- Validate configuration schema
- Provide sensible defaults

#### 1.4 Event System
**File**: `src/core/events.ts`  
- Simple event bus implementation
- Type-safe event definitions
- Support for async event handlers
- Error handling for event processing

#### 1.5 Error Handling Framework
**File**: `src/core/errors.ts`
- Custom error classes for each domain
- Error context and cause chaining
- Centralized error handler
- Logging integration

#### 1.6 Basic Utilities
**Files**: `src/utils/file-utils.ts`, `src/utils/text-utils.ts`, `src/utils/hash-utils.ts`
- File system operations with error handling
- Text processing utilities
- Hash generation for file checksums
- Path normalization utilities

### Success Criteria
- [ ] Project compiles without errors
- [ ] Configuration loads from YAML file
- [ ] Event bus can emit and receive events
- [ ] Custom errors include proper context
- [ ] Basic utilities handle edge cases properly

### Testing Strategy
```typescript
// Example test structure
describe('Configuration System', () => {
  it('loads default configuration', () => {
    const config = loadConfig()
    expect(config.project.name).toBeDefined()
  })
  
  it('merges project-specific configuration', () => {
    // Test configuration hierarchy
  })
})
```

---

## Phase 2: Indexing Engine (Core Analysis)

**Duration**: 2-3 sessions
**Goal**: Build system that can understand project structure and relationships

### Deliverables

#### 2.1 File System Crawler
**File**: `src/services/indexing/FileCrawler.ts`
- Recursively scan project directories
- Respect include/exclude patterns
- Handle symbolic links and permission errors
- Generate file metadata (size, modification time, checksum)

#### 2.2 Language Parsers
**Files**: 
- `src/services/indexing/parsers/TypeScriptParser.ts`
- `src/services/indexing/parsers/JavaScriptParser.ts`

**Capabilities**:
- Parse AST using TypeScript compiler API
- Extract imports, exports, functions, classes
- Handle parsing errors gracefully
- Generate structured information about code elements

#### 2.3 Dependency Graph Builder
**File**: `src/services/indexing/DependencyGraph.ts`
- Build relationships between files
- Resolve import paths to actual files
- Detect circular dependencies
- Calculate dependency metrics

#### 2.4 Core Indexing Service
**File**: `src/services/indexing/IndexingService.ts`
- Orchestrate file crawling and parsing
- Build and maintain project index
- Handle incremental updates
- Persist and load index data

#### 2.5 File Watching System
**File**: `src/services/indexing/FileWatcher.ts`
- Watch for file system changes
- Debounce rapid changes
- Trigger incremental index updates
- Handle watch errors and edge cases

### Success Criteria
- [ ] Can index a TypeScript project completely
- [ ] Correctly identifies imports and exports
- [ ] Builds accurate dependency graph
- [ ] Handles file changes incrementally
- [ ] Persists index data reliably

### Testing Strategy
```typescript
describe('IndexingService', () => {
  it('indexes sample TypeScript project', async () => {
    const index = await indexingService.indexProject('./fixtures/sample-project')
    
    expect(index.files.size).toBeGreaterThan(0)
    expect(index.dependencies.size).toBeGreaterThan(0) 
    expect(index.metadata.languages).toContain('typescript')
  })
  
  it('handles incremental updates', async () => {
    // Test file change detection and index updates
  })
})
```

---

## Phase 3: Context System (Information Assembly)

**Duration**: 2-3 sessions  
**Goal**: Compile relevant context for specific development tasks

### Deliverables

#### 3.1 Pattern Recognition Engine
**File**: `src/services/context/PatternMatcher.ts`
- Identify naming conventions (camelCase, PascalCase, etc.)
- Detect structural patterns (service classes, controllers, etc.)
- Find code patterns (error handling, logging, etc.)
- Generate pattern confidence scores

#### 3.2 Relevance Calculator  
**File**: `src/services/context/RelevanceCalculator.ts`
- Score file relevance for specific tasks
- Consider import/export relationships
- Factor in pattern matches and naming similarity
- Combine multiple relevance signals

#### 3.3 Context Compiler
**File**: `src/services/context/ContextService.ts`
- Analyze task descriptions
- Find relevant files using multiple strategies
- Extract meaningful code sections
- Compile architecture overview
- Generate implementation recommendations

#### 3.4 Code Section Extractor
**File**: `src/services/context/CodeExtractor.ts`
- Extract relevant functions, classes, interfaces
- Preserve context around important code
- Handle large files by selecting key sections
- Maintain line number references

### Success Criteria
- [ ] Identifies relevant files for typical development tasks
- [ ] Extracts meaningful patterns from codebase
- [ ] Generates helpful context packages
- [ ] Provides accurate relevance scoring
- [ ] Handles edge cases (empty projects, large files, etc.)

### Testing Strategy
```typescript
describe('ContextService', () => {
  it('compiles context for feature addition task', async () => {
    const task = {
      description: 'Add user authentication',
      type: 'feature',
      scope: ['src/auth'],
      constraints: []
    }
    
    const context = await contextService.compileContext(task)
    
    expect(context.relevantFiles.length).toBeGreaterThan(0)
    expect(context.patterns.length).toBeGreaterThan(0)
    expect(context.architecture.overview).toBeDefined()
  })
})
```

---

## Phase 4: Briefing System (Guidance Generation)

**Duration**: 2-3 sessions
**Goal**: Generate structured implementation guidance for Claude

### Deliverables

#### 4.1 Template Engine
**File**: `src/services/briefing/TemplateEngine.ts`
- Load and parse brief templates
- Support variable substitution
- Handle conditional sections
- Generate markdown and JSON output

#### 4.2 Implementation Brief Generator
**File**: `src/services/briefing/BriefingService.ts`
- Transform context into actionable guidance
- Generate specific implementation steps
- Include relevant code examples
- Provide architectural constraints
- Create testing recommendations

#### 4.3 Code Validation System
**File**: `src/services/briefing/ValidationService.ts`
- Compare implementations against briefs
- Check pattern adherence
- Validate architectural integration
- Generate improvement suggestions

#### 4.4 Brief Templates
**Files**: `templates/implementation-brief.md`, `templates/context-summary.md`
- Structured templates optimized for Claude
- Clear sections for different types of guidance
- Examples and code snippets
- Markdown formatting for readability

### Success Criteria
- [ ] Generates comprehensive implementation briefs
- [ ] Includes relevant examples from codebase
- [ ] Provides clear architectural guidance
- [ ] Validates implementations against patterns
- [ ] Templates are clear and actionable

### Testing Strategy
```typescript
describe('BriefingService', () => {
  it('generates implementation brief from context', async () => {
    const brief = await briefingService.generateBrief(task, context)
    
    expect(brief.implementation.suggestedApproach).toBeDefined()
    expect(brief.patterns.length).toBeGreaterThan(0)
    expect(brief.testing.unitTestRequirements.length).toBeGreaterThan(0)
  })
  
  it('validates code against brief', async () => {
    const validation = await briefingService.validateImplementation(code, brief)
    
    expect(validation.score).toBeGreaterThan(0)
    expect(validation.approved).toBeDefined()
  })
})
```

---

## Phase 5: Interface Layer (User Interaction)

**Duration**: 2-3 sessions
**Goal**: Create intuitive interfaces for Claude to interact with the system

### Deliverables

#### 5.1 CLI Framework
**File**: `src/cli.ts`
- Command-line interface using Commander.js
- Support for all major operations (index, context, brief)
- Proper help text and examples
- Error handling and user feedback

#### 5.2 TUI Components (Ink-based)
**Files**:
- `src/interface/components/App.tsx` - Main application
- `src/interface/components/IndexView.tsx` - Project index browser
- `src/interface/components/ContextView.tsx` - Context viewer
- `src/interface/components/BriefView.tsx` - Brief display

#### 5.3 Interactive Commands
**Files**: `src/interface/commands/` directory
- Query command for information retrieval
- Context command for task preparation  
- Brief command for implementation guidance
- Validate command for code review

#### 5.4 Output Formatting
**File**: `src/interface/formatters/`
- JSON formatter for programmatic consumption
- Markdown formatter for human reading
- Console formatter for CLI output
- Color and styling for better UX

### Success Criteria
- [ ] CLI commands work as documented
- [ ] TUI provides intuitive navigation
- [ ] Output formats are correctly structured
- [ ] Error messages are helpful and actionable
- [ ] Performance is acceptable for typical projects

### Testing Strategy
```typescript
describe('CLI Interface', () => {
  it('handles index command', async () => {
    const result = await execCommand('guardian-ai index ./test-project')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Indexing complete')
  })
  
  it('generates context via CLI', async () => {
    const result = await execCommand('guardian-ai context "Add user auth"')
    expect(result.exitCode).toBe(0)
    // Validate output format
  })
})
```

---

## Phase 6: Self-Hosting (Bootstrap Complete)

**Duration**: 2-4 sessions
**Goal**: Use GuardianAI to improve GuardianAI itself

### Deliverables

#### 6.1 Self-Analysis
- Run GuardianAI on its own codebase
- Generate project index for guardian-ai-mvp
- Identify patterns in the MVP codebase
- Document architectural decisions made

#### 6.2 Self-Improvement Tasks
**Example tasks to perform using the tool**:
1. "Improve error handling in IndexingService"
2. "Add configuration validation"
3. "Optimize pattern matching performance"  
4. "Add more detailed logging"
5. "Refactor context compilation algorithm"

#### 6.3 Feedback Collection
- Document what works well
- Identify missing information
- Note improvements needed
- Record performance bottlenecks

#### 6.4 Iteration Planning
- Plan next features based on self-hosting experience
- Prioritize improvements that help Claude most
- Design evolution path toward full GuardianAI

### Success Criteria
- [ ] GuardianAI can analyze its own codebase
- [ ] Claude can use the tool to make improvements to the tool
- [ ] Self-generated briefs are helpful and accurate
- [ ] Tool performance is acceptable during self-hosting
- [ ] Clear path forward is established

### Testing Strategy
```typescript
describe('Self-Hosting Capability', () => {
  it('can index its own codebase', async () => {
    const index = await indexingService.indexProject('./src')
    
    expect(index.files.size).toBeGreaterThan(10)
    expect(index.patterns.length).toBeGreaterThan(0)
    expect(index.metadata.languages).toContain('typescript')
  })
  
  it('generates helpful context for self-improvement', async () => {
    const task = {
      description: 'Improve pattern recognition accuracy',
      type: 'enhancement',
      scope: ['src/services/context'],
      constraints: []
    }
    
    const context = await contextService.compileContext(task)
    expect(context.relevantFiles.length).toBeGreaterThan(0)
  })
})
```

---

## Cross-Phase Considerations

### Testing Strategy
Each phase includes:
- **Unit tests** for individual components
- **Integration tests** for service interactions
- **End-to-end tests** for full workflows
- **Performance tests** for bottlenecks

### Documentation Updates
- Update README with current capabilities
- Document API as it evolves
- Maintain CHANGELOG for each phase
- Create user guides for CLI/TUI

### Performance Monitoring
- Track indexing performance
- Monitor memory usage
- Measure context compilation time
- Profile pattern matching efficiency

### Error Handling Evolution
- Improve error messages based on usage
- Add more specific error types
- Enhance error recovery strategies
- Better logging and debugging info

---

**Next Steps**: Begin Phase 1 implementation following the technical specifications (02-technical-specifications.md)