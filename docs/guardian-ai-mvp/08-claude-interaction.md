# Claude Interaction Protocol

**Document Purpose**: Define how Claude interacts with GuardianAI MVP
**Audience**: Claude (implementation agent) and system architects
**Focus**: Optimal interaction patterns for AI-driven development

## Core Interaction Philosophy

GuardianAI MVP is designed specifically for Claude's cognitive patterns and limitations. Every interaction is optimized to:

1. **Minimize Context Switching**: Provide all related information together
2. **Maximize Relevance**: Only show what's needed for the current task
3. **Explicit Relationships**: Never leave connections implicit
4. **Progressive Disclosure**: Start simple, add complexity as needed
5. **Example-Driven**: Always show patterns through concrete examples

## Primary Interaction Modes

### 1. Query Mode - Information Retrieval

Claude asks the system for specific information:

```bash
# CLI Examples
guardian-ai query "What files implement user authentication?"
guardian-ai query "Show me the patterns for error handling"
guardian-ai query "What would be affected by changing UserService interface?"

# Expected response format optimized for Claude
```

**Response Format for Claude**:
```json
{
  "query": "What files implement user authentication?",
  "results": {
    "directMatches": [
      {
        "file": "src/auth/AuthService.ts",
        "relevance": 0.95,
        "reason": "Primary authentication service implementation",
        "keyElements": [
          "login() method at line 45",
          "validateToken() method at line 78", 
          "User interface usage at line 12"
        ],
        "codePreview": "class AuthService {\n  async login(credentials: LoginCredentials): Promise<AuthResult> {\n    // Implementation\n  }\n}"
      }
    ],
    "relatedFiles": [
      {
        "file": "src/middleware/AuthMiddleware.ts", 
        "relevance": 0.8,
        "reason": "Uses AuthService for request authentication",
        "relationship": "Depends on AuthService.validateToken()"
      }
    ],
    "patterns": [
      {
        "name": "Service Pattern",
        "description": "Authentication logic encapsulated in service class",
        "examples": ["AuthService", "UserService", "EmailService"]
      }
    ]
  }
}
```

### 2. Context Mode - Task Preparation

Claude requests context compilation for a specific development task:

```bash
guardian-ai context "Add email verification to user registration"
```

**Response Format for Claude**:
```json
{
  "task": "Add email verification to user registration",
  "contextPackage": {
    "architectureOverview": {
      "summary": "User registration handled by UserController → UserService → UserRepository. Email sending via EmailService. Current flow creates users with 'pending' status.",
      "keyComponents": [
        {
          "name": "UserService",
          "role": "Business logic for user operations",
          "currentMethods": ["register", "findById", "updateStatus"],
          "location": "src/services/UserService.ts"
        },
        {
          "name": "EmailService", 
          "role": "Email sending abstraction",
          "interface": "sendEmail(options: EmailOptions): Promise<void>",
          "location": "src/services/EmailService.ts"
        }
      ]
    },
    
    "relevantFiles": [
      {
        "file": "src/services/UserService.ts",
        "importance": "critical",
        "reason": "Will need new method for email verification",
        "currentImplementation": {
          "registerMethod": {
            "lines": [23, 45],
            "code": "async register(userData: UserData): Promise<User> {\n  // Validation\n  // Create user with pending status\n  // Save to database\n  return user;\n}",
            "modificationNeeded": "Add call to send verification email"
          }
        }
      }
    ],
    
    "applicablePatterns": [
      {
        "pattern": "Async Email Sending",
        "description": "Email operations are async and don't block user response",
        "example": {
          "file": "src/services/NotificationService.ts",
          "code": "// Don't await email sending in main flow\nthis.emailService.sendEmail(options).catch(err => this.logger.error(err));\nreturn response; // Return immediately"
        },
        "relevance": "Email verification should follow this pattern"
      }
    ],
    
    "implementationGuidance": {
      "suggestedApproach": "Add verification token field to User model, create verifyEmail method in UserService, add verification endpoint to UserController",
      "securityConsiderations": [
        "Use cryptographically secure tokens",
        "Set token expiration (24 hours recommended)",
        "Rate limit verification attempts"
      ],
      "integrationPoints": [
        {
          "component": "User model",
          "change": "Add verificationToken and verificationExpires fields"
        },
        {
          "component": "UserService.register",
          "change": "Call sendVerificationEmail after user creation"
        }
      ]
    }
  }
}
```

### 3. Brief Mode - Implementation Planning

Claude requests a complete implementation brief:

```bash
guardian-ai brief "Add email verification to user registration" --context ./context.json
```

**Response Format for Claude**:
```json
{
  "implementationBrief": {
    "taskSummary": {
      "description": "Add email verification to user registration flow",
      "acceptanceCriteria": [
        "Users receive verification email after registration",
        "Email contains secure verification link", 
        "User status updated when link clicked",
        "Unverified users have limited access"
      ],
      "outOfScope": [
        "Changes to registration UI",
        "Email template redesign"
      ]
    },
    
    "requiredChanges": {
      "newFiles": [
        {
          "file": "src/controllers/VerificationController.ts",
          "purpose": "Handle email verification endpoints",
          "template": "Standard controller pattern with error handling"
        }
      ],
      
      "modifiedFiles": [
        {
          "file": "src/services/UserService.ts",
          "changes": [
            {
              "method": "register",
              "modification": "Add verification email sending",
              "currentCode": "// Current implementation...",
              "newCode": "// Updated implementation with email sending..."
            },
            {
              "method": "verifyEmail",
              "modification": "Add new method",
              "signature": "async verifyEmail(userId: string, token: string): Promise<boolean>",
              "implementation": "// Detailed implementation guide..."
            }
          ]
        }
      ]
    },
    
    "patternsToFollow": [
      {
        "pattern": "Error Handling",
        "rule": "All service methods throw domain-specific errors",
        "example": "throw new ValidationError('Invalid verification token')",
        "location": "See src/services/AuthService.ts for reference"
      }
    ],
    
    "testingGuidance": {
      "unitTests": [
        {
          "component": "UserService.verifyEmail",
          "scenarios": ["valid token", "expired token", "invalid token", "already verified user"]
        }
      ],
      "integrationTests": [
        {
          "flow": "Complete verification flow",
          "steps": ["Register user", "Check email sent", "Verify token", "Check status updated"]
        }
      ]
    }
  }
}
```

### 4. Validation Mode - Implementation Review

Claude submits code for validation against brief:

```bash
guardian-ai validate --brief ./brief.json --code ./UserService.ts
```

**Response Format for Claude**:
```json
{
  "validation": {
    "overallScore": 0.85,
    "approved": true,
    
    "correctImplementations": [
      {
        "aspect": "Token Generation",
        "score": 0.95,
        "feedback": "Correctly uses crypto.randomBytes for secure token generation"
      },
      {
        "aspect": "Error Handling", 
        "score": 0.9,
        "feedback": "Properly throws ValidationError for invalid tokens"
      }
    ],
    
    "improvements": [
      {
        "aspect": "Email Error Handling",
        "severity": "medium",
        "issue": "Email sending errors are not caught",
        "suggestion": "Add try/catch around emailService.sendEmail() call",
        "suggestedCode": "try {\n  await this.emailService.sendEmail(options);\n} catch (error) {\n  this.logger.error('Failed to send verification email', { userId, error });\n  // Decide whether to throw or continue\n}"
      }
    ],
    
    "patternAdherence": {
      "score": 0.8,
      "followedPatterns": ["Service Pattern", "Async Error Handling"],
      "missedPatterns": ["Logging Pattern - missing context object in logs"]
    }
  }
}
```

## Interactive Workflow Patterns

### 1. Exploratory Development

When Claude needs to understand the codebase before implementing:

```bash
# Step 1: Explore architecture
guardian-ai query "How is user management currently implemented?"

# Step 2: Find similar features  
guardian-ai query "Show me features that send emails"

# Step 3: Understand patterns
guardian-ai query "What patterns are used for async operations?"

# Step 4: Generate context
guardian-ai context "Add email verification based on password reset pattern"

# Step 5: Get implementation brief
guardian-ai brief "Add email verification" --context ./context.json
```

### 2. Iterative Refinement

When Claude needs to refine understanding during implementation:

```bash
# Start with brief
guardian-ai brief "Add user roles and permissions"

# During implementation, need more detail
guardian-ai query "How does AuthMiddleware currently work?"

# Validate partial implementation
guardian-ai validate --brief ./brief.json --code ./partial-implementation.ts

# Refine brief based on new understanding
guardian-ai brief "Add user roles and permissions" --refine --feedback "Need more detail on middleware integration"
```

### 3. Self-Improvement Workflow

When Claude is working on GuardianAI itself:

```bash
# Analyze current system
guardian-ai context "Improve pattern recognition accuracy"

# Understand what needs to change
guardian-ai query "Which files implement pattern detection?"

# Generate brief for self-improvement
guardian-ai brief "Add confidence scoring to pattern detection"

# Validate self-implemented changes
guardian-ai validate --brief ./self-improvement-brief.json --code ./PatternMatcher.ts
```

## TUI Interaction Patterns

### 1. Navigation-Driven Exploration

In the TUI, Claude can:
- Browse file tree with relevance indicators
- Drill down into specific components
- See pattern usage across files
- Navigate relationships between components

### 2. Context-Aware Views

Each TUI view is optimized for Claude's needs:
- **Index View**: Shows project structure with pattern annotations
- **Context View**: Displays compiled context with clear relationships
- **Brief View**: Presents implementation guidance in structured format
- **Validation View**: Shows compliance and improvement suggestions

### 3. Keyboard-Driven Efficiency

```
Tab       - Switch between views
r         - Refresh current view
/         - Search/filter
Enter     - Drill down/select
Esc       - Go back/cancel
?         - Help/shortcuts
Ctrl+C    - Exit
```

## Response Format Optimization for Claude

All system responses follow these principles:

### 1. Hierarchical Information Structure
```json
{
  "summary": "High-level overview",
  "details": {
    "essential": "Must-know information",
    "supporting": "Additional context",
    "reference": "Related information"
  }
}
```

### 2. Explicit Relationship Mapping
```json
{
  "component": "UserService",
  "relationships": {
    "dependsOn": ["UserRepository", "EmailService"],
    "usedBy": ["UserController", "AuthMiddleware"],
    "implements": ["IUserService"],
    "collaboratesWith": ["LoggingService"]
  }
}
```

### 3. Example-Centric Explanations
```json
{
  "pattern": "Error Handling",
  "examples": [
    {
      "good": "throw new ValidationError('Invalid email format')",
      "bad": "throw new Error('Validation failed')",
      "reason": "Domain-specific errors provide better context"
    }
  ]
}
```

### 4. Confidence and Uncertainty Indicators
```json
{
  "recommendation": "Use async/await pattern",
  "confidence": 0.9,
  "uncertainty": "Email service interface might change",
  "alternatives": [
    {
      "approach": "Promise chains",
      "confidence": 0.3,
      "reason": "Less consistent with codebase style"
    }
  ]
}
```

## Error Handling for Claude Interactions

### 1. Graceful Degradation
When the system can't provide complete information:
```json
{
  "status": "partial",
  "available": "File structure and basic patterns",
  "missing": "Detailed semantic analysis (indexing in progress)",
  "suggestion": "Retry in 30 seconds or use --wait flag"
}
```

### 2. Clear Error Messages
```json
{
  "error": "IndexingError",
  "message": "Unable to parse TypeScript file",
  "context": {
    "file": "src/broken.ts",
    "line": 45,
    "issue": "Syntax error"
  },
  "impact": "File excluded from analysis",
  "suggestion": "Fix syntax error or add to exclude patterns"
}
```

### 3. Recovery Suggestions
```json
{
  "error": "ContextCompilationError", 
  "message": "Insufficient information for task",
  "recovery": [
    "Try more specific task description",
    "Run 'guardian-ai index' to refresh project understanding",
    "Check if relevant files exist in project"
  ]
}
```

## Performance Considerations for Claude

### 1. Response Time Optimization
- Critical queries (< 100ms): File existence, basic structure
- Important queries (< 1s): Pattern matching, context compilation  
- Complex queries (< 10s): Full analysis, brief generation

### 2. Information Chunking
- Present information in digestible chunks
- Use progressive disclosure for complex responses
- Provide "more detail" options rather than overwhelming output

### 3. Cache-Friendly Patterns
- Cache compiled context packages
- Reuse pattern analysis across similar tasks
- Maintain session state to avoid re-computation

---

**Next Steps**: Review self-hosting strategy (09-self-hosting-strategy.md)