# Technical Specifications for GuardianAI MVP

**Document Purpose**: Detailed technical specifications for implementation
**Audience**: Claude (implementation agent)
**Focus**: Concrete, implementable specifications with clear interfaces

## Project Structure

```
guardian-ai-mvp/
├── package.json
├── tsconfig.json
├── guardian-ai.config.yaml
├── README.md
│
├── src/
│   ├── index.ts              # Main entry point
│   ├── cli.ts                # CLI interface
│   │
│   ├── core/                 # Core business logic
│   │   ├── types.ts          # Core type definitions
│   │   ├── config.ts         # Configuration management
│   │   ├── events.ts         # Event bus implementation
│   │   └── errors.ts         # Error definitions
│   │
│   ├── services/             # Business logic services
│   │   ├── indexing/
│   │   │   ├── IndexingService.ts
│   │   │   ├── FileWatcher.ts
│   │   │   └── parsers/
│   │   │       ├── TypeScriptParser.ts
│   │   │       └── JavaScriptParser.ts
│   │   │
│   │   ├── context/
│   │   │   ├── ContextService.ts
│   │   │   ├── PatternMatcher.ts
│   │   │   └── RelevanceCalculator.ts
│   │   │
│   │   └── briefing/
│   │       ├── BriefingService.ts
│   │       ├── TemplateEngine.ts
│   │       └── ValidationService.ts
│   │
│   ├── interface/            # User interface layer
│   │   ├── components/       # Ink components
│   │   │   ├── App.tsx
│   │   │   ├── IndexView.tsx
│   │   │   ├── ContextView.tsx
│   │   │   └── BriefView.tsx
│   │   │
│   │   └── commands/         # CLI commands
│   │       ├── index.ts
│   │       ├── analyze.ts
│   │       ├── context.ts
│   │       └── brief.ts
│   │
│   └── utils/               # Utility functions
│       ├── file-utils.ts
│       ├── text-utils.ts
│       └── hash-utils.ts
│
├── templates/               # Brief templates
│   ├── implementation-brief.md
│   ├── context-summary.md
│   └── pattern-guide.md
│
├── test/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
└── docs/                   # Documentation
    └── api/               # API documentation
```

## Core Type Definitions

```typescript
// src/core/types.ts

export interface ProjectIndex {
  metadata: ProjectMetadata
  files: Map<string, FileInfo>
  dependencies: DependencyGraph
  patterns: Pattern[]
  exports: Map<string, ExportInfo[]>
}

export interface ProjectMetadata {
  version: string
  created: Date
  lastUpdated: Date
  rootPath: string
  totalFiles: number
  totalLines: number
  languages: string[]
}

export interface FileInfo {
  path: string
  relativePath: string
  type: string
  size: number
  lines: number
  lastModified: Date
  checksum: string
  
  // Parsed structure
  imports: ImportInfo[]
  exports: ExportInfo[]
  functions: FunctionInfo[]
  classes: ClassInfo[]
  interfaces: InterfaceInfo[]
  types: TypeInfo[]
  
  // Analysis results
  patterns: PatternMatch[]
  complexity: ComplexityMetrics
  dependencies: string[]
}

export interface ImportInfo {
  module: string
  imported: string[]
  importType: 'default' | 'named' | 'namespace' | 'side-effect'
  line: number
  resolvedPath?: string
}

export interface ExportInfo {
  name: string
  type: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'default'
  line: number
  signature?: string
}

export interface FunctionInfo {
  name: string
  parameters: ParameterInfo[]
  returnType?: string
  line: number
  endLine: number
  isAsync: boolean
  isExported: boolean
  complexity: number
}

export interface Pattern {
  id: string
  name: string
  description: string
  category: string
  examples: CodeExample[]
  indicators: PatternIndicator[]
  confidence: number
}

export interface CodeExample {
  title: string
  description: string
  code: string
  file: string
  lines: [number, number]
  explanation: string
}

export interface PatternIndicator {
  type: 'naming' | 'structure' | 'import' | 'usage'
  pattern: string | RegExp
  weight: number
}

export interface ContextPackage {
  task: TaskDefinition
  relevantFiles: RelevantFile[]
  patterns: RelevantPattern[]
  architecture: ArchitectureInfo
  recommendations: Recommendation[]
  generatedAt: Date
}

export interface TaskDefinition {
  description: string
  type: 'feature' | 'bugfix' | 'refactor' | 'test'
  scope: string[]
  constraints: string[]
}

export interface RelevantFile {
  path: string
  relevance: number
  reason: string
  sections: CodeSection[]
  patterns: string[]
}

export interface CodeSection {
  title: string
  content: string
  lines: [number, number]
  importance: number
}

export interface ImplementationBrief {
  task: TaskDefinition
  context: ContextSummary
  architecture: ArchitectureGuidance
  patterns: PatternGuidance[]
  implementation: ImplementationGuidance
  testing: TestingGuidance
  generatedAt: Date
}
```

## Service Specifications

### 1. IndexingService

```typescript
// src/services/indexing/IndexingService.ts

export class IndexingService {
  private index: ProjectIndex | null = null
  private fileWatcher: FileWatcher
  private parsers: Map<string, LanguageParser>
  
  constructor(
    private config: IndexingConfig,
    private eventBus: EventBus
  ) {}
  
  // Primary interface methods
  async indexProject(rootPath: string): Promise<ProjectIndex>
  async updateIndex(changedFiles: string[]): Promise<void>
  async queryIndex(query: IndexQuery): Promise<IndexResult>
  
  // File operations
  async addFile(filePath: string): Promise<void>
  async removeFile(filePath: string): Promise<void>
  async updateFile(filePath: string): Promise<void>
  
  // Query operations
  async findFilesByPattern(pattern: string): Promise<FileInfo[]>
  async findDependencies(filePath: string): Promise<string[]>
  async findDependents(filePath: string): Promise<string[]>
  async findSimilarFiles(filePath: string): Promise<FileInfo[]>
  
  // Export/Import operations
  async saveIndex(filePath: string): Promise<void>
  async loadIndex(filePath: string): Promise<ProjectIndex>
  
  // Internal methods
  private async parseFile(filePath: string): Promise<FileInfo>
  private async detectPatterns(files: FileInfo[]): Promise<Pattern[]>
  private buildDependencyGraph(files: FileInfo[]): DependencyGraph
  private calculateMetrics(files: FileInfo[]): ProjectMetadata
}

export interface IndexingConfig {
  rootPath: string
  excludePatterns: string[]
  includePatterns: string[]
  maxFileSize: number
  debounceMs: number
  languages: string[]
}

export interface IndexQuery {
  type: 'files' | 'dependencies' | 'patterns' | 'exports'
  filter?: QueryFilter
  sort?: QuerySort
  limit?: number
}

export interface QueryFilter {
  fileType?: string
  pattern?: string
  hasPattern?: string
  modifiedAfter?: Date
  complexity?: { min?: number, max?: number }
}
```

### 2. ContextService

```typescript
// src/services/context/ContextService.ts

export class ContextService {
  constructor(
    private indexingService: IndexingService,
    private config: ContextConfig,
    private eventBus: EventBus
  ) {}
  
  // Primary interface methods
  async compileContext(task: TaskDefinition): Promise<ContextPackage>
  async findRelatedFiles(filePath: string): Promise<RelevantFile[]>
  async extractPatterns(scope: string[]): Promise<RelevantPattern[]>
  
  // Analysis methods
  async calculateRelevance(file: FileInfo, task: TaskDefinition): Promise<number>
  async identifyArchitecture(files: FileInfo[]): Promise<ArchitectureInfo>
  async generateRecommendations(task: TaskDefinition, context: ContextPackage): Promise<Recommendation[]>
  
  // Context operations
  async saveContext(context: ContextPackage, filePath: string): Promise<void>
  async loadContext(filePath: string): Promise<ContextPackage>
  async updateContext(context: ContextPackage, changes: string[]): Promise<ContextPackage>
  
  // Internal methods
  private async scoreFileRelevance(file: FileInfo, task: TaskDefinition): Promise<number>
  private async extractCodeSections(file: FileInfo, maxLines: number): Promise<CodeSection[]>
  private async identifyPatternUsage(files: RelevantFile[]): Promise<RelevantPattern[]>
  private async analyzeArchitecture(files: FileInfo[]): Promise<ArchitectureInfo>
}

export interface ContextConfig {
  maxFiles: number
  maxLinesPerFile: number
  relevanceThreshold: number
  includePatterns: boolean
  includeArchitecture: boolean
  includeRecommendations: boolean
}

export interface RelevanceScorer {
  scoreImportance(file: FileInfo, task: TaskDefinition): Promise<number>
  scoreRelation(file: FileInfo, targetFiles: string[]): Promise<number>
  scorePattern(file: FileInfo, patterns: string[]): Promise<number>
}
```

### 3. BriefingService

```typescript
// src/services/briefing/BriefingService.ts

export class BriefingService {
  constructor(
    private contextService: ContextService,
    private templateEngine: TemplateEngine,
    private config: BriefingConfig,
    private eventBus: EventBus
  ) {}
  
  // Primary interface methods
  async generateBrief(task: TaskDefinition, context?: ContextPackage): Promise<ImplementationBrief>
  async validateImplementation(code: string, brief: ImplementationBrief): Promise<ValidationResult>
  async regenerateBrief(brief: ImplementationBrief, feedback: string): Promise<ImplementationBrief>
  
  // Brief operations
  async saveBrief(brief: ImplementationBrief, filePath: string): Promise<void>
  async loadBrief(filePath: string): Promise<ImplementationBrief>
  
  // Template operations
  async renderBrief(brief: ImplementationBrief, format: 'markdown' | 'json'): Promise<string>
  async customizeBrief(brief: ImplementationBrief, customizations: BriefCustomization): Promise<ImplementationBrief>
  
  // Internal methods
  private async generateContextSummary(context: ContextPackage): Promise<ContextSummary>
  private async generateArchitectureGuidance(context: ContextPackage): Promise<ArchitectureGuidance>
  private async generatePatternGuidance(context: ContextPackage): Promise<PatternGuidance[]>
  private async generateImplementationGuidance(task: TaskDefinition, context: ContextPackage): Promise<ImplementationGuidance>
  private async generateTestingGuidance(task: TaskDefinition): Promise<TestingGuidance>
}

export interface BriefingConfig {
  templatePath: string
  includeExamples: boolean
  includeConstraints: boolean
  verboseGuidance: boolean
  maxBriefLength: number
}

export interface ValidationResult {
  score: number
  issues: ValidationIssue[]
  suggestions: string[]
  approved: boolean
}

export interface ValidationIssue {
  type: 'pattern' | 'architecture' | 'integration' | 'quality'
  severity: 'error' | 'warning' | 'info'
  message: string
  line?: number
  suggestion?: string
}
```

## TUI Interface Specifications

### 1. Main App Component

```typescript
// src/interface/components/App.tsx

import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'

export interface AppProps {
  indexingService: IndexingService
  contextService: ContextService
  briefingService: BriefingService
}

export const App: React.FC<AppProps> = ({ indexingService, contextService, briefingService }) => {
  const [currentView, setCurrentView] = useState<'index' | 'context' | 'brief'>('index')
  const [projectIndex, setProjectIndex] = useState<ProjectIndex | null>(null)
  const [currentContext, setCurrentContext] = useState<ContextPackage | null>(null)
  const [currentBrief, setCurrentBrief] = useState<ImplementationBrief | null>(null)
  
  // Input handling
  useInput((input, key) => {
    if (key.tab) {
      // Switch views
    }
    if (key.return) {
      // Execute current action
    }
    // ... other key handlers
  })
  
  return (
    <Box flexDirection="column" height="100%">
      <Header currentView={currentView} />
      
      <Box flexGrow={1}>
        {currentView === 'index' && (
          <IndexView 
            index={projectIndex}
            onFileSelect={handleFileSelect}
            onPatternSelect={handlePatternSelect}
          />
        )}
        
        {currentView === 'context' && (
          <ContextView 
            context={currentContext}
            onTaskDefine={handleTaskDefine}
            onContextRefresh={handleContextRefresh}
          />
        )}
        
        {currentView === 'brief' && (
          <BriefView 
            brief={currentBrief}
            onBriefGenerate={handleBriefGenerate}
            onBriefExport={handleBriefExport}
          />
        )}
      </Box>
      
      <StatusBar />
    </Box>
  )
}
```

### 2. CLI Command Interface

```typescript
// src/cli.ts

import { Command } from 'commander'
import { IndexingService } from './services/indexing/IndexingService'
import { ContextService } from './services/context/ContextService'
import { BriefingService } from './services/briefing/BriefingService'

export function createCLI() {
  const program = new Command()
  
  program
    .name('guardian-ai')
    .description('AI-powered development assistant')
    .version('0.1.0')
  
  // Index commands
  program
    .command('index')
    .description('Index the current project')
    .option('-p, --path <path>', 'Project root path', '.')
    .option('-w, --watch', 'Watch for file changes')
    .action(async (options) => {
      // Implementation
    })
  
  // Context commands
  program
    .command('context')
    .description('Generate context for a task')
    .argument('<task>', 'Task description')
    .option('-f, --files <files...>', 'Specific files to include')
    .option('-o, --output <file>', 'Output file for context')
    .action(async (task, options) => {
      // Implementation
    })
  
  // Brief commands
  program
    .command('brief')
    .description('Generate implementation brief')
    .argument('<task>', 'Task description')
    .option('-c, --context <file>', 'Context file to use')
    .option('-o, --output <file>', 'Output file for brief')
    .option('-f, --format <format>', 'Output format (json|markdown)', 'markdown')
    .action(async (task, options) => {
      // Implementation
    })
  
  // Interactive mode
  program
    .command('ui')
    .description('Start interactive TUI')
    .action(async () => {
      // Start Ink app
    })
  
  return program
}
```

## Configuration Schema

```yaml
# guardian-ai.config.yaml

# Project settings
project:
  name: "guardian-ai-mvp"
  rootPath: "./src"
  exclude: 
    - "node_modules"
    - "dist" 
    - ".git"
    - "*.log"
  include:
    - "**/*.ts"
    - "**/*.js"
    - "**/*.json"

# Indexing configuration
indexing:
  languages: ["typescript", "javascript"]
  maxFileSize: 1000000  # 1MB
  debounceMs: 500
  parseComments: true
  generateHashes: true
  
# Context compilation settings
context:
  maxFiles: 20
  maxLinesPerFile: 200
  relevanceThreshold: 0.3
  includePatterns: true
  includeArchitecture: true
  includeTests: false

# Pattern recognition settings  
patterns:
  autoDetect: true
  customPatterns: "./patterns"
  confidenceThreshold: 0.7
  maxPatterns: 50

# Brief generation settings
briefing:
  templatePath: "./templates"
  includeExamples: true
  includeConstraints: true
  verboseGuidance: false
  maxBriefLength: 10000

# Interface settings
interface:
  theme: "dark"
  verbose: false
  autoRefresh: true
  shortcuts:
    switchView: "tab"
    refresh: "r"
    help: "?"

# Performance settings
performance:
  cacheSize: 100
  maxMemoryMB: 512
  gcIntervalMs: 30000
```

## Error Handling Specifications

```typescript
// src/core/errors.ts

export abstract class GuardianError extends Error {
  abstract readonly code: string
  abstract readonly category: string
  
  constructor(
    message: string,
    public readonly context?: Record<string, any>,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class IndexingError extends GuardianError {
  readonly code = 'INDEXING_ERROR'
  readonly category = 'indexing'
}

export class ContextError extends GuardianError {
  readonly code = 'CONTEXT_ERROR'  
  readonly category = 'context'
}

export class BriefingError extends GuardianError {
  readonly code = 'BRIEFING_ERROR'
  readonly category = 'briefing'
}

export class ConfigurationError extends GuardianError {
  readonly code = 'CONFIG_ERROR'
  readonly category = 'configuration'
}

export class FileSystemError extends GuardianError {
  readonly code = 'FILESYSTEM_ERROR'
  readonly category = 'filesystem'
}

// Error handler
export class ErrorHandler {
  static handle(error: Error): void {
    if (error instanceof GuardianError) {
      console.error(`[${error.category}] ${error.message}`)
      if (error.context) {
        console.error('Context:', JSON.stringify(error.context, null, 2))
      }
      if (error.cause) {
        console.error('Caused by:', error.cause.message)
      }
    } else {
      console.error('Unexpected error:', error.message)
      console.error(error.stack)
    }
  }
}
```

## Testing Specifications

```typescript
// Test structure and examples

// Unit test example
// test/unit/services/IndexingService.test.ts
describe('IndexingService', () => {
  let indexingService: IndexingService
  let mockEventBus: EventBus
  
  beforeEach(() => {
    mockEventBus = new MockEventBus()
    indexingService = new IndexingService(testConfig, mockEventBus)
  })
  
  describe('indexProject', () => {
    it('should index all files in project', async () => {
      const result = await indexingService.indexProject('./test/fixtures/sample-project')
      
      expect(result.files.size).toBeGreaterThan(0)
      expect(result.metadata.totalFiles).toEqual(result.files.size)
      expect(result.dependencies).toBeDefined()
    })
    
    it('should handle parsing errors gracefully', async () => {
      // Test with malformed files
    })
  })
})

// Integration test example  
// test/integration/full-workflow.test.ts
describe('Full Workflow Integration', () => {
  it('should complete index -> context -> brief workflow', async () => {
    // 1. Index a sample project
    const index = await indexingService.indexProject('./test/fixtures/sample-project')
    
    // 2. Generate context for a task
    const task: TaskDefinition = {
      description: 'Add user authentication',
      type: 'feature',
      scope: ['src/auth'],
      constraints: ['Use existing database connection']
    }
    const context = await contextService.compileContext(task)
    
    // 3. Generate implementation brief
    const brief = await briefingService.generateBrief(task, context)
    
    // Verify the complete workflow
    expect(brief).toBeDefined()
    expect(brief.context.relevantFiles.length).toBeGreaterThan(0)
    expect(brief.patterns.length).toBeGreaterThan(0)
  })
})
```

---

**Next Steps**: Review implementation phases (03-implementation-phases.md)