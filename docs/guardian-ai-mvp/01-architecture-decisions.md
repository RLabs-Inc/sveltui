# Architecture Decisions for GuardianAI MVP

**Document Purpose**: Core architectural choices that will guide the entire implementation
**Audience**: Claude (implementation agent)
**Decision Criteria**: Simplicity, effectiveness for AI development, rapid iteration capability

## Core Architectural Philosophy

### 1. Layered Architecture (Simple 3-Layer)

```
┌─────────────────────────────────────────┐
│              Interface Layer            │  ← TUI, CLI commands
├─────────────────────────────────────────┤
│              Service Layer              │  ← Business logic, coordination
├─────────────────────────────────────────┤
│               Data Layer                │  ← File system, indexing, storage
└─────────────────────────────────────────┘
```

**Why This Choice**:
- Simple enough to understand completely
- Clear separation of concerns
- Easy to test each layer independently
- Matches how Claude naturally thinks about systems

### 2. Service-Oriented Design

Each major capability is a service with a clear interface:

```typescript
interface IndexingService {
  indexProject(rootPath: string): Promise<ProjectIndex>
  updateIndex(changedFiles: string[]): Promise<void>
  queryIndex(query: IndexQuery): Promise<IndexResult>
}

interface ContextService {
  compileContext(task: TaskDescription): Promise<ContextPackage>
  findRelatedFiles(filePath: string): Promise<string[]>
  extractPatterns(scope: string[]): Promise<Pattern[]>
}

interface BriefingService {
  generateBrief(task: TaskDescription, context: ContextPackage): Promise<ImplementationBrief>
  validateImplementation(code: string, brief: ImplementationBrief): Promise<ValidationResult>
}
```

**Why This Choice**:
- Each service has a single, clear responsibility
- Services can be developed and tested independently
- Easy to extend or replace individual services
- Matches Claude's preference for explicit interfaces

### 3. File-Based Storage (Not Database)

All persistent data stored as files:
- **Project indices**: JSON files with structured data
- **Pattern libraries**: YAML files with examples
- **Context packages**: JSON files with compiled context
- **Configuration**: YAML files

**Why This Choice**:
- No database setup complexity
- Easy to version control
- Human-readable for debugging
- Simple backup and sync
- Matches development workflow

### 4. Plugin-Based Language Support

Core system is language-agnostic, with language-specific plugins:

```typescript
interface LanguagePlugin {
  name: string
  extensions: string[]
  parseFile(content: string): Promise<ParseResult>
  extractPatterns(files: ParseResult[]): Promise<Pattern[]>
  validateCode(code: string): Promise<ValidationResult>
}
```

**Why This Choice**:
- Start with TypeScript/JavaScript support
- Easy to add new languages later
- Keeps core system simple
- Allows specialized analysis per language

### 5. Event-Driven Updates

Services communicate through events:

```typescript
interface EventBus {
  emit(event: string, data: any): void
  on(event: string, handler: (data: any) => void): void
}

// Example events:
// 'file.changed' → triggers index update
// 'index.updated' → triggers context refresh
// 'task.started' → triggers context compilation
```

**Why This Choice**:
- Loose coupling between services
- Easy to add new features without changing existing code
- Natural for reactive systems
- Matches how development workflows actually work

## Technology Stack Decisions

### 1. Runtime: Node.js with TypeScript
- **Why**: Excellent file system access, great TypeScript support, rich ecosystem
- **Alternative Considered**: Bun (faster, but less mature ecosystem)

### 2. UI Framework: Ink (React for CLI)
- **Why**: Component-based, reactive, excellent for complex TUIs
- **Alternative Considered**: Blessed (lower level, more complex)

### 3. Parsing: Tree-sitter
- **Why**: Fast, accurate, supports many languages, great for AST parsing
- **Alternative Considered**: Language-specific parsers (more complex to manage)

### 4. File Watching: Chokidar
- **Why**: Reliable, cross-platform, handles edge cases well
- **Alternative Considered**: Native fs.watch (less reliable)

### 5. Configuration: Cosmiconfig
- **Why**: Standard approach, supports multiple formats, user-friendly
- **Alternative Considered**: Simple JSON files (less flexible)

## Data Structure Decisions

### 1. Project Index Structure

```typescript
interface ProjectIndex {
  metadata: {
    version: string
    created: Date
    lastUpdated: Date
    rootPath: string
  }
  
  files: Map<string, FileInfo>
  dependencies: Map<string, string[]>  // file -> dependencies
  exports: Map<string, ExportInfo[]>   // file -> exports
  patterns: Pattern[]
  
  // Quick lookup indices
  byType: Map<string, string[]>        // file extension -> files
  byPattern: Map<string, string[]>     // pattern name -> files
}

interface FileInfo {
  path: string
  type: string
  size: number
  lastModified: Date
  checksum: string
  
  // Parsed information
  imports: ImportInfo[]
  exports: ExportInfo[]
  functions: FunctionInfo[]
  classes: ClassInfo[]
  
  // Analysis results
  patterns: string[]
  complexity: number
  dependencies: string[]
}
```

**Why This Structure**:
- All information needed for context compilation
- Fast lookups for common queries
- Incremental updates possible
- Human-readable when serialized

### 2. Context Package Structure

```typescript
interface ContextPackage {
  task: TaskDescription
  relevantFiles: {
    file: string
    relevance: number
    sections: CodeSection[]
    patterns: string[]
  }[]
  
  patterns: {
    pattern: Pattern
    examples: CodeExample[]
    usage: string
  }[]
  
  architecture: {
    overview: string
    constraints: string[]
    integrationPoints: IntegrationPoint[]
  }
  
  recommendations: {
    approach: string
    pitfalls: string[]
    testing: TestingGuidance
  }
}
```

**Why This Structure**:
- Contains everything Claude needs for a task
- Organized by relevance and importance
- Includes examples and guidance
- Structured for easy consumption

## Service Interaction Patterns

### 1. Request-Response Pattern
For synchronous operations:
```typescript
const context = await contextService.compileContext(task)
const brief = await briefingService.generateBrief(task, context)
```

### 2. Event-Driven Pattern  
For asynchronous updates:
```typescript
eventBus.emit('file.changed', { path: 'src/service.ts' })
// IndexingService listens and updates index
// ContextService listens and invalidates cached context
```

### 3. Pipeline Pattern
For complex transformations:
```typescript
const pipeline = new Pipeline()
  .add(parseFiles)
  .add(extractPatterns)
  .add(buildIndex)
  .add(validateIndex)

const result = await pipeline.execute(inputData)
```

## Error Handling Strategy

### 1. Domain-Specific Errors
```typescript
class IndexingError extends Error {
  constructor(message: string, public file?: string, public cause?: Error) {
    super(message)
    this.name = 'IndexingError'
  }
}
```

### 2. Graceful Degradation
- If indexing fails for one file, continue with others
- If pattern recognition fails, fall back to simple heuristics
- If context compilation is incomplete, provide what we have

### 3. Rich Error Information
All errors include:
- Clear message for humans
- Context about what was being attempted
- Suggestions for resolution
- Stack trace for debugging

## Configuration Strategy

### 1. Hierarchical Configuration
1. **Default configuration** (built into the tool)
2. **Global configuration** (~/.guardian-ai/config.yaml)
3. **Project configuration** (./guardian-ai.config.yaml)
4. **Environment variables** (GUARDIAN_AI_*)
5. **Command line arguments** (highest priority)

### 2. Configuration Schema
```yaml
# guardian-ai.config.yaml
project:
  name: "my-project"
  rootPath: "./src"
  exclude: ["node_modules", "dist", ".git"]
  
indexing:
  languages: ["typescript", "javascript"]
  maxFileSize: 1000000  # 1MB
  debounceMs: 500
  
context:
  maxFiles: 20
  maxLinesPerFile: 200
  relevanceThreshold: 0.3
  
patterns:
  autoDetect: true
  customPatterns: "./patterns"
  
interface:
  theme: "dark"
  verbose: false
```

## Performance Considerations

### 1. Incremental Processing
- Only reprocess changed files
- Cache parsed results
- Update indices incrementally

### 2. Lazy Loading
- Load language plugins only when needed
- Parse files only when accessed
- Generate context only when requested

### 3. Memory Management
- Stream large files instead of loading entirely
- Use WeakMaps for temporary data
- Clean up unused caches periodically

---

**Next Steps**: Review technical specifications (02-technical-specifications.md)