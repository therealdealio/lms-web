import { Domain } from "./types";

export const domains: Domain[] = [
  {
    id: 1,
    title: "Agentic Architecture & Orchestration",
    weight: 27,
    description:
      "Master the principles of agentic loop design, multi-agent coordination, subagent isolation, and workflow enforcement patterns that ensure reliable autonomous systems.",
    icon: "🤖",
    color: "from-purple-600 to-indigo-600",
    concepts: [
      {
        title: "1.1 Agentic Loops",
        content:
          "An agentic loop is the core execution pattern where Claude repeatedly calls tools, processes results, and decides whether to continue or stop. The loop must be terminated based on structured signals — not heuristics.",
        keyPoints: [
          "Always inspect `stop_reason` to determine loop termination — valid terminal values are `end_turn` and `stop_sequence`.",
          "The `tool_use` stop reason means Claude wants to call a tool; continue the loop.",
          "Never terminate based on response text content (e.g., checking if output contains 'done' or 'complete').",
          "Never use arbitrary iteration caps as primary termination (e.g., 'stop after 10 loops').",
          "A reliable loop: send messages → receive response → check stop_reason → if tool_use, execute tools and append results → repeat.",
          "Max iteration safeguards are acceptable as emergency fallback only, not as primary termination logic.",
        ],
        examTrap:
          "TRAP: Terminating a loop by checking if response.text includes 'I'm done' is an anti-pattern. Always use stop_reason inspection.",
        codeExample: `// Correct agentic loop pattern
while (true) {
  const response = await client.messages.create({ ... });

  if (response.stop_reason === 'end_turn') {
    break; // Correct: structured termination
  }

  if (response.stop_reason === 'tool_use') {
    const toolResults = await executeTools(response.content);
    messages.push({ role: 'user', content: toolResults });
    continue;
  }

  // Never do this:
  // if (response.content[0].text.includes("I'm done")) break;
}`,
      },
      {
        title: "1.2 Multi-Agent Orchestration",
        content:
          "Multi-agent systems coordinate specialized subagents through an orchestrator. Each agent operates independently with its own context window. The orchestrator delegates tasks, collects structured results, and synthesizes outcomes.",
        keyPoints: [
          "Orchestrator agents coordinate; subagents execute specialized tasks.",
          "Subagents do NOT implicitly share memory with the orchestrator or other subagents.",
          "Pass context explicitly when invoking subagents — they start fresh.",
          "Orchestrators should use structured handoff protocols (JSON schema) for reliable coordination.",
          "Parallel subagent invocation increases throughput for independent tasks.",
          "Each agent maintains its own message history; cross-agent state must be explicitly passed.",
        ],
        examTrap:
          "TRAP: 'Subagents share memory with the coordinator' is WRONG. Memory is never implicit across agent boundaries.",
        codeExample: `// Orchestrator explicitly passes context to subagents
const subagentResult = await invokeSubagent({
  task: "analyze_code",
  context: {
    // Must be explicit — subagent has no memory of orchestrator's history
    codeSnippet: currentCode,
    requirements: taskRequirements,
    previousFindings: previousAnalysis,
  }
});`,
      },
      {
        title: "1.3 Subagent Invocation & Context Passing",
        content:
          "When an orchestrator invokes a subagent, it must serialize all necessary context. The subagent starts with a clean context window. Structured context passing prevents information loss and ensures reliable execution.",
        keyPoints: [
          "Serialize context as structured JSON when passing between agents.",
          "Include task description, relevant state, constraints, and expected output format.",
          "Subagents cannot access the orchestrator's conversation history.",
          "Use explicit output schemas so subagent results are machine-readable.",
          "Context compression: summarize long histories before passing to preserve token budget.",
          "Use `system` prompt to establish subagent role and constraints at invocation time.",
        ],
        examTrap:
          "TRAP: Assuming a subagent 'remembers' what the orchestrator discussed earlier is wrong. Every invocation is stateless unless context is explicitly provided.",
      },
      {
        title: "1.4 Workflow Enforcement & Handoff",
        content:
          "Reliable agentic workflows enforce state machines programmatically. Handoffs between agents use structured schemas. High-stakes decisions require programmatic gates, not prompt instructions alone.",
        keyPoints: [
          "Enforce workflow transitions programmatically, not via prompt instructions.",
          "Use programmatic gates for high-stakes operations (deploy, delete, send).",
          "Handoff schemas define required fields and validation rules.",
          "Never rely solely on prompt instructions to prevent dangerous actions.",
          "Gate conditions: require explicit confirmation tokens, checksums, or external approvals.",
          "Workflow state should be persisted and resumable after failures.",
        ],
        examTrap:
          "TRAP: 'High-stakes operations can be controlled with a well-written prompt' is WRONG. Programmatic gates are mandatory for truly high-stakes actions.",
      },
      {
        title: "1.5 Agent SDK Hooks",
        content:
          "The Claude Agent SDK provides lifecycle hooks for monitoring, logging, and intervention. Hooks enable non-invasive observability and conditional interruption of agent execution.",
        keyPoints: [
          "Pre-tool hooks run before tool execution — use for validation and logging.",
          "Post-tool hooks run after tool execution — use for result transformation and auditing.",
          "Error hooks capture tool failures for centralized error handling.",
          "Hooks can cancel tool execution programmatically.",
          "Use hooks for rate limiting, cost tracking, and compliance logging.",
          "Hook functions are synchronous checkpoints in the execution pipeline.",
        ],
      },
      {
        title: "1.6 Task Decomposition Strategies",
        content:
          "Effective agentic systems decompose complex tasks into well-scoped subtasks. Decomposition strategies affect parallelism, error isolation, and recoverability.",
        keyPoints: [
          "Decompose tasks at natural independence boundaries for maximum parallelism.",
          "Sequential decomposition for tasks with dependencies; parallel for independent tasks.",
          "Each subtask should have a clear input schema and output schema.",
          "Decomposition granularity: too coarse loses parallelism, too fine increases coordination overhead.",
          "Idempotent subtasks enable safe retry on failure.",
          "Map-reduce patterns: decompose → parallel execute → aggregate results.",
        ],
      },
      {
        title: "1.7 Session State & Resumption",
        content:
          "Long-running agentic sessions require durable state management. Sessions must be resumable after interruptions. State includes conversation history, tool results, and workflow position.",
        keyPoints: [
          "Persist session state at each major workflow checkpoint.",
          "State includes: message history, current workflow step, accumulated results, pending actions.",
          "Resumption restores state and continues from the last checkpoint.",
          "Use unique session IDs for correlation and retrieval.",
          "Prune/summarize old message history to manage context window size.",
          "Distinguish between resumable failures (transient) and terminal failures (data corruption).",
        ],
      },
    ],
    questions: [
      {
        id: "d1q1",
        question:
          "In an agentic loop, how should loop termination be correctly determined?",
        options: [
          "Check if response.text includes 'I'm done' or 'task complete'",
          "Stop after a fixed number of iterations (e.g., 10 loops)",
          "Inspect the stop_reason field and stop when it equals 'end_turn'",
          "Stop when the model returns a response shorter than 50 characters",
        ],
        correctIndex: 2,
        explanation:
          "The correct approach is to inspect the `stop_reason` field. When `stop_reason === 'end_turn'`, the model has finished. `stop_reason === 'tool_use'` means continue the loop by executing tools. Checking response text (option A) and arbitrary iteration caps (option B) are explicit anti-patterns. Response length (option D) is meaningless as a termination signal.",
        domain: 1,
        topic: "Agentic Loops",
      },
      {
        id: "d1q2",
        question:
          "Which of the following is an anti-pattern in agentic loop design?",
        options: [
          "Inspecting the stop_reason field after each response",
          "Appending tool results to the messages array before the next iteration",
          "Capping loops at an arbitrary iteration count as the primary termination logic",
          "Handling the end_turn stop reason as a loop exit condition",
        ],
        correctIndex: 2,
        explanation:
          "Using arbitrary iteration caps (e.g., 'stop after 10 loops') as the primary termination logic is an anti-pattern because it can terminate a legitimately running task prematurely or allow over-iteration. Caps may exist as emergency fallbacks, but stop_reason inspection must be the primary mechanism. Options A, B, and D are all correct patterns.",
        domain: 1,
        topic: "Agentic Loops",
      },
      {
        id: "d1q3",
        question: "What does subagent isolation mean in multi-agent systems?",
        options: [
          "Subagents run in physically separate server instances",
          "Subagents do not implicitly share memory with coordinators or other subagents",
          "Subagents cannot use tools or make API calls",
          "Subagents always start completely fresh with no system prompt",
        ],
        correctIndex: 1,
        explanation:
          "Subagent isolation means that subagents do not implicitly share memory with the orchestrator or other agents. Each agent has its own context window. Any information a subagent needs must be explicitly passed at invocation time. This is a critical safety and reliability property — never assume a subagent 'knows' what happened in the orchestrator's session.",
        domain: 1,
        topic: "Multi-Agent Orchestration",
      },
      {
        id: "d1q4",
        question:
          "An orchestrator agent needs to pass the results of earlier research to a subagent for analysis. What is the correct approach?",
        options: [
          "Do nothing — the subagent automatically has access to the orchestrator's conversation history",
          "Include a reference ID and let the subagent query a shared database",
          "Explicitly serialize the relevant context (research results, task description) in the subagent invocation payload",
          "Use a global variable to share state between the orchestrator and subagent",
        ],
        correctIndex: 2,
        explanation:
          "Subagents do not have access to the orchestrator's history. All relevant context must be explicitly included in the invocation. Option A is wrong (no implicit sharing). Option B could work but introduces unnecessary complexity and a dependency. Option D violates isolation principles and is not reliable in distributed systems.",
        domain: 1,
        topic: "Subagent Invocation & Context Passing",
      },
      {
        id: "d1q5",
        question:
          "You are building an agent that automatically deploys infrastructure. What is REQUIRED to safely handle the deployment action?",
        options: [
          "A carefully worded system prompt that instructs Claude never to deploy without confirmation",
          "A programmatic gate that requires explicit human confirmation before executing deployment",
          "A high temperature setting to make Claude more cautious",
          "Logging all deployment commands to a file before execution",
        ],
        correctIndex: 1,
        explanation:
          "High-stakes operations like infrastructure deployment REQUIRE programmatic gates — not prompt instructions. Prompts can be ignored, misinterpreted, or bypassed through prompt injection. A programmatic gate (e.g., requiring a human-provided confirmation token, or an external approval webhook) is mandatory. Logging (option D) is good practice but does not prevent harmful actions.",
        domain: 1,
        topic: "Workflow Enforcement",
      },
      {
        id: "d1q6",
        question:
          "In the Agent SDK, which hook is most appropriate for validating tool arguments before execution?",
        options: [
          "Post-tool hook",
          "Error hook",
          "Pre-tool hook",
          "Completion hook",
        ],
        correctIndex: 2,
        explanation:
          "Pre-tool hooks run before tool execution, making them the correct place for validation of arguments, rate limiting checks, and authorization. Post-tool hooks run after execution. Error hooks handle failures that have already occurred. Validation before execution can prevent dangerous operations from ever running.",
        domain: 1,
        topic: "Agent SDK Hooks",
      },
      {
        id: "d1q7",
        question:
          "When decomposing a complex task into subtasks, which characteristic makes subtasks safe to retry on failure?",
        options: [
          "Sequential execution order",
          "Idempotency — the subtask produces the same result regardless of how many times it runs",
          "Using a separate API key for each subtask",
          "Short execution time",
        ],
        correctIndex: 1,
        explanation:
          "Idempotent subtasks can be retried safely without causing duplicate effects or inconsistent state. For example, 'create file if not exists' is idempotent; 'append to file' is not. Idempotency is a critical property for resilient agentic systems where network failures or partial executions may require retries.",
        domain: 1,
        topic: "Task Decomposition",
      },
      {
        id: "d1q8",
        question:
          "A long-running agentic session fails midway due to a network timeout. What is the best recovery strategy?",
        options: [
          "Restart the entire session from the beginning",
          "Restore the persisted session state from the last checkpoint and resume from there",
          "Send a new message asking Claude to 'continue from where it left off'",
          "Increase the timeout value and retry the last request",
        ],
        correctIndex: 1,
        explanation:
          "Reliable agentic systems persist state at checkpoints (workflow step, message history, accumulated results). On failure, the system restores from the last checkpoint and continues. Restarting from scratch (option A) wastes work and may repeat side effects. Asking Claude to 'continue' (option C) is unreliable since the new session has no context. Increasing timeout (option D) doesn't address already-failed work.",
        domain: 1,
        topic: "Session State & Resumption",
      },
      {
        id: "d1q9",
        question:
          "What is the correct response when `stop_reason` equals `tool_use` in an agentic loop?",
        options: [
          "Stop the loop — the model has finished its task",
          "Execute the requested tools, append results to messages, and continue the loop",
          "Restart the loop with a fresh context",
          "Ask the user for input before proceeding",
        ],
        correctIndex: 1,
        explanation:
          "`stop_reason === 'tool_use'` means Claude wants to use a tool. The correct response is: extract the tool_use blocks from the response, execute each tool, collect results, append them to the messages array as a 'user' turn with tool_result content blocks, then send the next request. This continues the loop until stop_reason is 'end_turn'.",
        domain: 1,
        topic: "Agentic Loops",
      },
      {
        id: "d1q10",
        question:
          "For a multi-agent pipeline where Agent B depends on Agent A's output, which execution model is appropriate?",
        options: [
          "Parallel execution — run both agents simultaneously",
          "Sequential execution — run Agent A first, pass its output to Agent B",
          "Independent execution — agents operate without any data exchange",
          "Merged execution — combine both agents into a single agent",
        ],
        correctIndex: 1,
        explanation:
          "When Agent B depends on Agent A's output, they must be executed sequentially. Parallel execution (option A) is appropriate only for independent tasks. The key principle: identify dependency graphs before choosing execution strategy. Agent A runs first, its output is serialized and explicitly passed to Agent B's context.",
        domain: 1,
        topic: "Task Decomposition",
      },
    ],
  },
  {
    id: 2,
    title: "Tool Design & MCP Integration",
    weight: 18,
    description:
      "Design effective tools for Claude with clear descriptions, proper error handling, optimal distribution, and integrate Model Context Protocol for external system connectivity.",
    icon: "🔧",
    color: "from-blue-600 to-cyan-600",
    concepts: [
      {
        title: "2.1 Tool Description Primacy",
        content:
          "Tool descriptions are the PRIMARY mechanism Claude uses to select the appropriate tool. Well-written descriptions directly determine selection accuracy. The tool name alone is insufficient.",
        keyPoints: [
          "Tool descriptions must clearly state: what the tool does, when to use it, what it returns.",
          "Include disambiguation when multiple tools have similar purposes.",
          "Specify required vs optional parameters in descriptions.",
          "Mention side effects (e.g., 'this tool modifies the database').",
          "Bad description: 'gets data'. Good: 'Retrieves user account details by user ID. Returns JSON with name, email, subscription tier. Use when you need account information for a specific user.'",
          "The first fix for tool selection problems is improving descriptions, not adding classifiers.",
        ],
        examTrap:
          "TRAP: If tools are being selected incorrectly, the FIRST fix is improving tool descriptions — not adding a separate classifier agent or tool router.",
        codeExample: `// Bad tool description
{
  name: "get_user",
  description: "gets user data", // Too vague
  input_schema: { ... }
}

// Good tool description
{
  name: "get_user",
  description: "Retrieves complete user account details from the database by user ID. Returns a JSON object containing: name, email, subscription_tier, created_at, last_login. Use this tool when you need any information about a specific user account. Do NOT use for listing multiple users — use list_users instead.",
  input_schema: { ... }
}`,
      },
      {
        title: "2.2 Error Categories",
        content:
          "Tool errors fall into four categories: transient (retry), validation (fix input), business logic (handle in workflow), and permission (escalate). Each requires a different response strategy.",
        keyPoints: [
          "Transient errors: network timeouts, rate limits — safe to retry with backoff.",
          "Validation errors: invalid input format, missing required fields — fix the arguments before retrying.",
          "Business logic errors: record not found, insufficient funds — handle in workflow logic.",
          "Permission errors: unauthorized, forbidden — escalate to human or stop execution.",
          "Always include error type in tool error responses so the agent can respond appropriately.",
          "Never retry permission errors — they won't succeed and may trigger security alerts.",
        ],
        codeExample: `// Tool error response structure
return {
  error: {
    type: "transient" | "validation" | "business_logic" | "permission",
    code: "RATE_LIMITED",
    message: "Rate limit exceeded. Retry after 60 seconds.",
    retryable: true,
    retryAfterSeconds: 60
  }
}`,
      },
      {
        title: "2.3 Tool Distribution",
        content:
          "Optimal tool distribution is 4-5 tools per agent. Too few limits capability; too many degrades selection accuracy and increases cognitive load for the model.",
        keyPoints: [
          "Recommended: 4-5 tools per agent for optimal selection accuracy.",
          "If you need more tools, split into specialized subagents.",
          "Group related tools in the same agent.",
          "Avoid giving an agent tools it will never need for its assigned tasks.",
          "tool_choice: 'auto' lets Claude decide; 'any' forces tool use; specific tool name forces that tool.",
          "Use tool_choice to guide behavior in deterministic workflows.",
        ],
        examTrap:
          "TRAP: Giving an agent 15 tools 'just in case' degrades performance. Keep tool sets focused and appropriately sized.",
      },
      {
        title: "2.4 tool_choice Options",
        content:
          "The tool_choice parameter controls how Claude decides whether and which tool to use. Three modes: auto, any, and specific tool name.",
        keyPoints: [
          "`tool_choice: { type: 'auto' }` — Claude decides whether to use a tool.",
          "`tool_choice: { type: 'any' }` — Claude must use at least one tool.",
          "`tool_choice: { type: 'tool', name: 'specific_tool' }` — Claude must use this specific tool.",
          "Use 'any' when you need guaranteed structured output from a tool.",
          "Use specific tool name when you know exactly what action is needed.",
          "Use 'auto' for open-ended tasks where Claude should reason about tool necessity.",
        ],
      },
      {
        title: "2.5 MCP Configuration",
        content:
          "Model Context Protocol (MCP) enables Claude to connect to external tools and data sources. Configuration lives in `.mcp.json`. MCP servers expose tools, resources, and prompts.",
        keyPoints: [
          "MCP config file: `.mcp.json` in the project root.",
          "MCP servers run as separate processes; Claude connects via stdio or HTTP.",
          "Each MCP server can expose multiple tools to Claude.",
          "Configuration includes: server name, command to start, environment variables.",
          "MCP tools appear alongside regular tools in Claude's context.",
          "Use MCP for: database access, file systems, external APIs, git integration.",
        ],
        codeExample: `// .mcp.json example
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
      "env": {}
    },
    "database": {
      "command": "node",
      "args": ["./mcp-servers/database.js"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}`,
      },
      {
        title: "2.6 Built-in Tools",
        content:
          "Claude has built-in tools: computer use (screen interaction), text editor (file operations), and bash (command execution). These require specific API parameters to enable.",
        keyPoints: [
          "Computer use: enables mouse/keyboard control for GUI automation.",
          "Text editor: enables viewing and editing files.",
          "Bash: enables shell command execution.",
          "Enable by including tool definitions in the tools array with type 'computer_20241022', etc.",
          "Built-in tools have special security considerations — run in sandboxed environments.",
          "Computer use requires explicit beta header: `anthropic-beta: computer-use-2024-10-22`.",
        ],
      },
    ],
    questions: [
      {
        id: "d2q1",
        question:
          "What is the PRIMARY mechanism Claude uses to select the correct tool when multiple tools are available?",
        options: [
          "The tool name — Claude matches keywords in the task to tool names",
          "Tool descriptions — Claude reads descriptions to understand when and how to use each tool",
          "The order tools appear in the tools array — first matching tool is selected",
          "Tool parameter count — Claude prefers tools with fewer required parameters",
        ],
        correctIndex: 1,
        explanation:
          "Tool descriptions are the primary mechanism for tool selection. Claude reads descriptions to understand what each tool does, when to use it, and how it differs from similar tools. Tool names alone are insufficient. This means investing time in writing precise, detailed descriptions pays off directly in selection accuracy.",
        domain: 2,
        topic: "Tool Description Primacy",
      },
      {
        id: "d2q2",
        question:
          "Claude is selecting the wrong tool between two similar tools. What is the FIRST action you should take?",
        options: [
          "Add a separate classifier agent to route tool selection",
          "Create a meta-tool that internally decides which tool to call",
          "Improve the tool descriptions to clearly differentiate the two tools",
          "Remove one of the tools and combine their functionality",
        ],
        correctIndex: 2,
        explanation:
          "The first fix for tool selection problems is always improving descriptions. Descriptions are the primary signal Claude uses for selection. Adding a classifier (option A) adds unnecessary complexity. A meta-tool (option B) adds indirection. Combining tools (option D) may work but loses specificity. Improved descriptions should be the first attempt.",
        domain: 2,
        topic: "Tool Description Primacy",
      },
      {
        id: "d2q3",
        question:
          "A tool returns a 401 Unauthorized error. What is the appropriate handling strategy?",
        options: [
          "Retry immediately with exponential backoff",
          "Retry once with a different authentication token",
          "Escalate to a human or stop execution — permission errors should not be retried",
          "Wait 60 seconds and retry once",
        ],
        correctIndex: 2,
        explanation:
          "Permission errors (401/403) are not transient — they indicate the agent lacks authorization for the action. Retrying won't help and may trigger security alerts or account lockouts. The correct response is to escalate to a human operator or stop execution. Only transient errors (timeouts, rate limits) should be retried.",
        domain: 2,
        topic: "Error Categories",
      },
      {
        id: "d2q4",
        question:
          "What is the recommended number of tools per agent for optimal selection accuracy?",
        options: [
          "1-2 tools — minimal is always best",
          "4-5 tools — enough capability without degrading selection",
          "10-15 tools — more tools means more capability",
          "20+ tools — give the agent everything it might need",
        ],
        correctIndex: 1,
        explanation:
          "4-5 tools per agent is the recommended range. Too few tools (1-2) limits what the agent can accomplish. Too many tools (10+) degrades selection accuracy because descriptions become harder to differentiate and cognitive load increases. For more complex workflows, split into specialized subagents each with 4-5 focused tools.",
        domain: 2,
        topic: "Tool Distribution",
      },
      {
        id: "d2q5",
        question:
          "Which `tool_choice` setting guarantees that Claude will use at least one tool in its response?",
        options: [
          "`{ type: 'auto' }` — Claude decides whether to use tools",
          "`{ type: 'any' }` — Claude must use at least one tool",
          "`{ type: 'none' }` — Claude cannot use any tools",
          "`{ type: 'required' }` — Claude must use a specific tool",
        ],
        correctIndex: 1,
        explanation:
          "`{ type: 'any' }` forces Claude to use at least one available tool, ensuring structured tool_use output. This is useful when you need guaranteed structured responses. `auto` lets Claude decide (may result in text-only response). `none` disables tool use entirely. There is no `required` type — specific tools are forced with `{ type: 'tool', name: 'tool_name' }`.",
        domain: 2,
        topic: "tool_choice Options",
      },
      {
        id: "d2q6",
        question: "Where should MCP server configuration be placed in a project?",
        options: [
          "~/.claude/mcp.json — user-level global configuration",
          ".mcp.json in the project root directory",
          "package.json under an 'mcp' key",
          "CLAUDE.md as a JSON block",
        ],
        correctIndex: 1,
        explanation:
          "MCP configuration belongs in `.mcp.json` at the project root. This is the standard MCP configuration file location that Claude Code reads when starting in a project directory. User-level configuration would be in `~/.claude/` but that's for personal settings, not project-specific MCP servers that should be shared with the team via the repository.",
        domain: 2,
        topic: "MCP Configuration",
      },
      {
        id: "d2q7",
        question:
          "A tool call fails with error type 'validation'. What is the correct response?",
        options: [
          "Retry the tool call immediately with the same arguments",
          "Retry with exponential backoff after 30 seconds",
          "Fix the tool arguments based on the validation error before retrying",
          "Escalate to a human and halt execution",
        ],
        correctIndex: 2,
        explanation:
          "Validation errors mean the tool received invalid input (wrong format, missing required fields, out-of-range values). Retrying with the same arguments (option A) will produce the same error. The correct response is to understand the validation error, fix the arguments, and then retry. This may require reformatting data, filling missing fields, or adjusting values to meet constraints.",
        domain: 2,
        topic: "Error Categories",
      },
    ],
  },
  {
    id: 3,
    title: "Claude Code Configuration & Workflows",
    weight: 20,
    description:
      "Configure Claude Code effectively using CLAUDE.md hierarchy, commands and skills, path-specific rules, and understand execution modes for optimal development workflows.",
    icon: "⚙️",
    color: "from-green-600 to-teal-600",
    concepts: [
      {
        title: "3.1 CLAUDE.md Hierarchy",
        content:
          "CLAUDE.md files configure Claude Code's behavior with a hierarchical structure. Project-level CLAUDE.md sets project rules. Directory-level adds context-specific rules. User-level (~/.claude/CLAUDE.md) sets personal preferences.",
        keyPoints: [
          "Project-level CLAUDE.md (repo root): team-wide project rules, coding standards, architecture decisions.",
          "Directory-level CLAUDE.md: rules specific to that directory (e.g., src/api/CLAUDE.md for API conventions).",
          "User-level ~/.claude/CLAUDE.md: personal preferences only — NOT for team rules.",
          "Child CLAUDE.md files inherit and extend parent rules.",
          "CLAUDE.md content is automatically included in Claude's context when working in that directory.",
          "Use CLAUDE.md to specify: tech stack, testing requirements, forbidden patterns, PR conventions.",
        ],
        examTrap:
          "TRAP: Team-wide rules belong in the project-level CLAUDE.md (repo root), NOT in ~/.claude/CLAUDE.md. User-level configuration is personal and not shared with the team.",
        codeExample: `# Project CLAUDE.md (repo root)
## Tech Stack
- TypeScript, Next.js 14, Tailwind CSS
- Use App Router patterns, not Pages Router

## Testing Requirements
- All new functions must have unit tests
- Integration tests required for API routes
- Run \`npm test\` before creating PRs

## Forbidden Patterns
- Never use \`any\` TypeScript type
- Never commit .env files`,
      },
      {
        title: "3.2 Command & Skill Structure",
        content:
          "Claude Code supports custom commands (slash commands) and skills stored in `.claude/commands/` directories. Commands automate repetitive workflows.",
        keyPoints: [
          "Custom commands stored in `.claude/commands/` as Markdown files.",
          "Command files contain instructions Claude executes when the slash command is invoked.",
          "Project commands in `<project>/.claude/commands/` — available to all team members.",
          "Personal commands in `~/.claude/commands/` — personal only.",
          "Commands support argument interpolation with `$ARGUMENTS`.",
          "Skills are reusable command templates for common patterns.",
        ],
        codeExample: `# .claude/commands/review-pr.md
Review the pull request at $ARGUMENTS.

1. Check all changed files for:
   - TypeScript type safety
   - Test coverage
   - Performance implications
2. Verify CLAUDE.md conventions are followed
3. Output a structured review with: LGTM / NEEDS_CHANGES / BLOCKING`,
      },
      {
        title: "3.3 Path-Specific Rules",
        content:
          "Directory-level CLAUDE.md files apply rules to specific paths. This enables different coding standards for different parts of the codebase without global overrides.",
        keyPoints: [
          "Place CLAUDE.md in any subdirectory to add path-specific rules.",
          "Rules cascade: root CLAUDE.md + directory CLAUDE.md both apply.",
          "Use for: legacy code conventions, specialized module requirements, different test strategies.",
          "Example: `src/legacy/CLAUDE.md` to say 'do not refactor existing code in this directory'.",
          "Path-specific rules override root rules when there is a conflict.",
          "Useful for monorepos with different conventions per package.",
        ],
      },
      {
        title: "3.4 Plan Mode vs Direct Execution",
        content:
          "Claude Code operates in two modes: Plan Mode (think before acting) and Direct Execution (act immediately). Choosing correctly prevents irreversible mistakes.",
        keyPoints: [
          "Plan Mode: Claude generates a step-by-step plan before making any changes.",
          "Use Plan Mode for: complex refactors, multi-file changes, destructive operations.",
          "Direct Execution: Claude makes changes immediately.",
          "Use Direct Execution for: simple single-file edits, straightforward tasks.",
          "Plan Mode enables review and approval before execution.",
          "In CI/CD contexts, always use Plan Mode for generated code changes.",
        ],
        examTrap:
          "TRAP: Using Direct Execution for complex multi-file refactors is risky. Plan Mode should be used when changes are significant and reversibility is important.",
      },
      {
        title: "3.5 Iterative Refinement",
        content:
          "Claude Code supports iterative refinement workflows where output is progressively improved through review cycles. This mirrors professional code review practices.",
        keyPoints: [
          "Initial generation → review → targeted feedback → regeneration cycle.",
          "Use specific feedback rather than general ('fix the types in getUserById, not the whole file').",
          "Maintain context across refinement cycles — don't restart unnecessarily.",
          "Each refinement iteration should have a clear success criterion.",
          "Combine with Plan Mode for complex refinements.",
        ],
      },
      {
        title: "3.6 CI/CD Integration",
        content:
          "Claude Code can be integrated into CI/CD pipelines for automated code review, test generation, and documentation. Non-interactive mode enables headless operation.",
        keyPoints: [
          "Use `--no-interactive` flag for headless CI operation.",
          "CI workflows: automated PR review, test generation on commit, doc generation.",
          "Claude Code in CI should read-only or use Plan Mode to avoid unintended changes.",
          "Pass API keys via environment variables, never hardcode.",
          "Batch API is appropriate for latency-tolerant CI tasks like nightly code analysis.",
          "Pre-merge blocking checks should NOT use Batch API — they require synchronous, real-time responses.",
        ],
        examTrap:
          "TRAP: Batch API is NOT suitable for pre-merge blocking checks because Batch API is asynchronous with up to 24-hour latency. Use the standard synchronous API for any check that blocks a merge.",
      },
    ],
    questions: [
      {
        id: "d3q1",
        question:
          "Which CLAUDE.md file location is appropriate for team-wide project coding standards?",
        options: [
          "~/.claude/CLAUDE.md — user-level configuration shared automatically",
          "Project-level CLAUDE.md in the repository root",
          "Directory-level CLAUDE.md in each subdirectory",
          "User-level CLAUDE.md because it has highest priority",
        ],
        correctIndex: 1,
        explanation:
          "Team-wide rules belong in the project-level CLAUDE.md at the repository root. This file is committed to the repo and shared with all team members. ~/.claude/CLAUDE.md is for personal preferences only — it is NOT shared and should not contain team conventions. Directory-level files are for path-specific rules, not global standards.",
        domain: 3,
        topic: "CLAUDE.md Hierarchy",
      },
      {
        id: "d3q2",
        question:
          "A developer places team coding standards in ~/.claude/CLAUDE.md. What is the problem?",
        options: [
          "No problem — ~/.claude/CLAUDE.md is the correct location for all rules",
          "The file will be ignored by Claude Code",
          "The rules are personal to that developer and not shared with the rest of the team",
          "The syntax is wrong for user-level files",
        ],
        correctIndex: 2,
        explanation:
          "~/.claude/CLAUDE.md is a user-level file stored on the individual developer's machine. It is NOT committed to the repository and is NOT shared with teammates. Team standards placed here will only apply to that one developer. Team-wide rules must be in the project-level CLAUDE.md in the repo root, which is version-controlled and shared.",
        domain: 3,
        topic: "CLAUDE.md Hierarchy",
      },
      {
        id: "d3q3",
        question:
          "Where are project-level custom Claude Code commands (slash commands) stored?",
        options: [
          "~/.claude/commands/ — personal commands directory",
          "<project>/.claude/commands/ — project commands available to the whole team",
          "package.json under a 'claude-commands' key",
          "CLAUDE.md in a 'commands' section",
        ],
        correctIndex: 1,
        explanation:
          "Project-level commands are stored in `<project>/.claude/commands/` as Markdown files. These are committed to the repository and available to all team members. Personal commands go in `~/.claude/commands/`. Commands in the project directory are invocable as slash commands by anyone working in that project with Claude Code.",
        domain: 3,
        topic: "Command & Skill Structure",
      },
      {
        id: "d3q4",
        question:
          "When should you use Plan Mode instead of Direct Execution in Claude Code?",
        options: [
          "For all tasks — Plan Mode is always safer",
          "Only when working on legacy code",
          "For complex multi-file changes or destructive operations where review is needed before acting",
          "Only when explicitly requested by a manager",
        ],
        correctIndex: 2,
        explanation:
          "Plan Mode generates a step-by-step plan before making any changes, enabling review and approval. It is appropriate for complex refactors, multi-file changes, and destructive operations. Direct Execution is fine for simple, straightforward single-file edits. Using Plan Mode for everything would be unnecessarily slow; the key is using it when irreversibility risk is high.",
        domain: 3,
        topic: "Plan Mode vs Direct Execution",
      },
      {
        id: "d3q5",
        question:
          "A team wants to use Claude Code in CI/CD to block PRs with failing code quality checks. Should they use the Batch API?",
        options: [
          "Yes — Batch API is cheaper and more efficient for CI tasks",
          "Yes — Batch API provides better throughput for concurrent PR checks",
          "No — Batch API is asynchronous with up to 24-hour latency, unsuitable for blocking checks",
          "No — Batch API cannot be used in CI environments",
        ],
        correctIndex: 2,
        explanation:
          "Batch API is NOT suitable for pre-merge blocking checks because it is asynchronous — responses may take up to 24 hours. A PR check that blocks merging requires a synchronous, real-time response. Use the standard synchronous Claude API for any check that must complete before allowing a merge. Batch API is appropriate for latency-tolerant tasks like nightly analysis.",
        domain: 3,
        topic: "CI/CD Integration",
      },
      {
        id: "d3q6",
        question:
          "A monorepo has different testing conventions for the `src/frontend/` and `src/backend/` directories. What is the cleanest way to configure this?",
        options: [
          "One large CLAUDE.md at the root with conditional logic",
          "Place separate CLAUDE.md files in src/frontend/ and src/backend/ with path-specific rules",
          "Create separate repositories for frontend and backend",
          "Configure in package.json with different Claude settings per workspace",
        ],
        correctIndex: 1,
        explanation:
          "Directory-level CLAUDE.md files are the correct mechanism for path-specific rules. Place a CLAUDE.md in `src/frontend/` describing frontend testing conventions and another in `src/backend/` for backend conventions. These layer on top of the root CLAUDE.md. This is cleaner than one large conditional file and correctly uses the CLAUDE.md hierarchy as designed.",
        domain: 3,
        topic: "Path-Specific Rules",
      },
      {
        id: "d3q7",
        question:
          "A custom Claude Code command should accept a GitHub PR URL as input. How is the argument passed?",
        options: [
          "Arguments are not supported in custom commands",
          "Use the $ARGUMENTS placeholder in the command Markdown file",
          "Pass arguments via environment variables",
          "Arguments are always passed as JSON",
        ],
        correctIndex: 1,
        explanation:
          "Custom command files (Markdown) support the `$ARGUMENTS` placeholder, which is replaced with whatever the user passes after the slash command. For example, `/review-pr https://github.com/...` would replace `$ARGUMENTS` in the command template with the URL. This enables parameterized commands that can operate on different inputs.",
        domain: 3,
        topic: "Command & Skill Structure",
      },
      {
        id: "d3q8",
        question:
          "Which of the following is an appropriate use case for the Batch API in a development workflow?",
        options: [
          "Real-time code completion suggestions in the editor",
          "Pre-merge security scanning that blocks deployments",
          "Nightly codebase-wide documentation generation across all files",
          "Interactive debugging sessions with immediate feedback",
        ],
        correctIndex: 2,
        explanation:
          "Nightly documentation generation is a latency-tolerant task — it runs overnight and doesn't block developers. This is exactly what Batch API is designed for: high-volume, non-urgent workloads at lower cost with up to 24-hour latency. Real-time completion (A), blocking security checks (B), and interactive debugging (D) all require synchronous responses.",
        domain: 3,
        topic: "CI/CD Integration",
      },
    ],
  },
  {
    id: 4,
    title: "Prompt Engineering & Structured Output",
    weight: 20,
    description:
      "Master prompt design techniques including explicit instructions, few-shot examples, structured output via tool_use and JSON schema, validation-retry loops, and optimal use of Batch API.",
    icon: "✍️",
    color: "from-orange-600 to-amber-600",
    concepts: [
      {
        title: "4.1 Explicit Instructions",
        content:
          "Claude performs best with explicit, specific instructions. Ambiguity in prompts leads to inconsistent outputs. Every constraint, format requirement, and edge case should be stated explicitly.",
        keyPoints: [
          "State the output format explicitly: 'Return a JSON object with fields: name (string), score (number)'.",
          "Include negative constraints: 'Do not include markdown formatting in the response'.",
          "Specify handling for edge cases: 'If the input is empty, return {error: \"empty_input\"}'.",
          "Be explicit about scope: 'Analyze only the function provided, not the whole file'.",
          "Explicit > implicit: assume Claude knows nothing about your conventions unless stated.",
          "System prompt + user prompt layering: system for persistent rules, user for task-specific instructions.",
        ],
      },
      {
        title: "4.2 Few-Shot Examples",
        content:
          "Including input-output examples dramatically improves Claude's consistency for structured tasks. Few-shot examples define the expected pattern more precisely than written instructions alone.",
        keyPoints: [
          "Include 2-5 representative examples for complex structured tasks.",
          "Cover edge cases in examples, not just the happy path.",
          "Examples are especially powerful for: classification, extraction, formatting tasks.",
          "Place examples in the user turn or as separate conversation turns.",
          "Examples should match the exact format you expect Claude to produce.",
          "If output quality is inconsistent, adding more targeted examples is often the fix.",
        ],
        codeExample: `// Few-shot prompt for structured classification
const prompt = \`Classify the following code review comment as: BUG, STYLE, PERFORMANCE, or QUESTION.

Examples:
Comment: "This will throw a NullPointerException if user is null"
Classification: BUG

Comment: "Variable names should follow camelCase convention"
Classification: STYLE

Comment: "Consider using a HashMap instead of ArrayList for O(1) lookup"
Classification: PERFORMANCE

Now classify:
Comment: "\${userComment}"
Classification:\``,
      },
      {
        title: "4.3 Structured Output via tool_use",
        content:
          "The most reliable way to get structured JSON output from Claude is through tool_use with a defined JSON schema. This is more reliable than asking Claude to format output as JSON in text.",
        keyPoints: [
          "Define a tool with the exact JSON schema of your desired output.",
          "Set tool_choice to force use of that tool.",
          "Claude's tool_use block will contain a valid JSON payload matching your schema.",
          "This is more reliable than 'respond with JSON' because tool_use output is parsed, not text.",
          "Use required fields in JSON schema to ensure all needed data is present.",
          "Combine with validation-retry: validate the schema, retry with corrections if invalid.",
        ],
        examTrap:
          "TRAP: Asking Claude to 'respond with JSON' in a prompt is less reliable than using tool_use with a JSON schema. For production systems, always use tool_use for structured output.",
        codeExample: `// Force structured output via tool_use
const response = await client.messages.create({
  model: "claude-opus-4-6",
  tools: [{
    name: "extract_data",
    description: "Extract structured data from the text",
    input_schema: {
      type: "object",
      properties: {
        entities: { type: "array", items: { type: "string" } },
        sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
        confidence: { type: "number", minimum: 0, maximum: 1 }
      },
      required: ["entities", "sentiment", "confidence"]
    }
  }],
  tool_choice: { type: "tool", name: "extract_data" },
  messages: [{ role: "user", content: text }]
});

const structured = response.content[0].input; // Guaranteed to match schema`,
      },
      {
        title: "4.4 Validation-Retry Loops",
        content:
          "Even with tool_use, outputs may fail business logic validation. Validation-retry loops catch invalid outputs, provide specific correction feedback to Claude, and request a corrected response.",
        keyPoints: [
          "Validate tool_use output against business rules, not just JSON schema.",
          "On validation failure, send Claude the specific validation error as feedback.",
          "Include the original output and the error in the retry message.",
          "Limit retry attempts (2-3) to prevent infinite loops.",
          "Validation errors are different from JSON schema errors — schema handles structure, you handle semantics.",
          "Retry message example: 'The confidence score was 1.5 but must be between 0 and 1. Please correct.'",
        ],
        codeExample: `// Validation-retry loop
let attempts = 0;
const MAX_RETRIES = 3;

while (attempts < MAX_RETRIES) {
  const response = await callClaude(messages);
  const output = extractToolOutput(response);

  const validationError = validate(output);
  if (!validationError) {
    return output; // Success
  }

  // Send correction feedback
  messages.push({ role: "assistant", content: response.content });
  messages.push({
    role: "user",
    content: \`Validation failed: \${validationError}. Please correct and resubmit.\`
  });
  attempts++;
}
throw new Error("Max retries exceeded");`,
      },
      {
        title: "4.5 Batch API for Latency-Tolerant Workloads",
        content:
          "The Batch API processes large numbers of requests asynchronously at reduced cost. It is designed for workloads where real-time response is not needed.",
        keyPoints: [
          "Batch API: up to 50% cost reduction, async processing, up to 24-hour latency.",
          "Use for: bulk analysis, nightly processing, dataset evaluation, offline tasks.",
          "Not suitable for: real-time features, user-facing interactions, blocking CI checks.",
          "Submit a batch, receive a batch ID, poll for completion.",
          "Maximum batch size: 10,000 requests per batch.",
          "Results include per-request success/failure status.",
        ],
        examTrap:
          "TRAP: Batch API is for latency-tolerant workloads ONLY. Never use it for blocking operations, pre-merge checks, or anything that requires a real-time response.",
      },
      {
        title: "4.6 Multi-Instance Review",
        content:
          "Reliable review and evaluation requires multiple independent Claude instances. A single Claude instance reviewing its own output has inherent blind spots.",
        keyPoints: [
          "Multi-instance review: have a separate Claude session review the output of another.",
          "The reviewing instance should have no context from the generation session.",
          "Use independent review for: code review, fact-checking, bias detection.",
          "Self-review in the same session is insufficient for high-stakes outputs.",
          "Structure review requests with specific criteria and scoring rubrics.",
          "Multi-instance catches errors the original instance is 'blind' to due to its own reasoning patterns.",
        ],
        examTrap:
          "TRAP: 'Self-review in the same session is sufficient' is WRONG. The original Claude instance cannot reliably critique its own output because it shares the same reasoning context. Use a separate instance for meaningful review.",
      },
    ],
    questions: [
      {
        id: "d4q1",
        question:
          "What is the most reliable method to get structured JSON output from Claude in a production system?",
        options: [
          "Ask Claude to 'respond with valid JSON' in the system prompt",
          "Post-process Claude's text response with a JSON parser",
          "Use tool_use with a defined JSON schema and set tool_choice to force its use",
          "Use a regex to extract JSON from Claude's response",
        ],
        correctIndex: 2,
        explanation:
          "Using tool_use with a JSON schema is the most reliable method. The tool_use input is machine-parsed against the schema — not extracted from free text. This gives type guarantees that text extraction cannot. Asking Claude to 'respond with JSON' (A) is unreliable. Post-processing text (B) and regex (D) are fragile and can fail on edge cases.",
        domain: 4,
        topic: "Structured Output",
      },
      {
        id: "d4q2",
        question:
          "A Claude response keeps including extra fields not in the expected output. What is the most direct fix?",
        options: [
          "Add more few-shot examples showing correct formatting",
          "Explicitly state in the prompt 'return ONLY these fields: ...' and use JSON schema with no additionalProperties",
          "Use a higher temperature to force more creative adherence",
          "Filter the output programmatically after receiving it",
        ],
        correctIndex: 1,
        explanation:
          "The most direct fix is explicit instructions combined with a restrictive JSON schema. Add 'return ONLY these fields' to the prompt AND set `additionalProperties: false` in the JSON schema. Explicit > implicit. Few-shot examples (A) help but adding explicit constraints is more direct. Filtering (D) works but doesn't fix the underlying issue.",
        domain: 4,
        topic: "Explicit Instructions",
      },
      {
        id: "d4q3",
        question:
          "You need Claude to classify code review comments into categories. Output quality is inconsistent. What is the recommended fix?",
        options: [
          "Switch to a larger model",
          "Add few-shot examples showing correct classifications for representative comment types",
          "Reduce the temperature setting to 0",
          "Use a separate classification model fine-tuned on your data",
        ],
        correctIndex: 1,
        explanation:
          "Few-shot examples are highly effective for classification tasks. They show Claude exactly what output you expect for specific inputs. For inconsistent classification, adding 2-5 representative examples (including edge cases) dramatically improves consistency. Temperature reduction (C) helps reduce variability but doesn't fix semantic understanding. Fine-tuning (D) is expensive and not the first step.",
        domain: 4,
        topic: "Few-Shot Examples",
      },
      {
        id: "d4q4",
        question:
          "A validation-retry loop has no upper limit on attempts. What is the risk?",
        options: [
          "No risk — retrying until success is always correct",
          "Infinite loop if Claude consistently produces invalid output, causing runaway API costs",
          "The API will automatically limit retries to 5",
          "Claude will learn to produce correct output after many retries",
        ],
        correctIndex: 1,
        explanation:
          "An unlimited retry loop can create infinite loops if Claude consistently fails validation — caused by an impossible constraint, a bug in validation logic, or a model reasoning issue. This results in runaway API costs and hangs. Always implement a maximum retry limit (2-3 attempts) with a clear failure mode (raise exception, return error, alert human) when the limit is exceeded.",
        domain: 4,
        topic: "Validation-Retry Loops",
      },
      {
        id: "d4q5",
        question:
          "Which workload is MOST appropriate for the Batch API?",
        options: [
          "Real-time AI assistant responses in a chat interface",
          "Pre-merge code quality checks that block deployments",
          "Nightly processing of 5,000 customer support tickets for classification",
          "Interactive debugging with immediate step-by-step feedback",
        ],
        correctIndex: 2,
        explanation:
          "Nightly processing of 5,000 tickets is latency-tolerant (runs overnight, results needed next morning) and high-volume — exactly the Batch API's sweet spot. Real-time chat (A) requires immediate responses. Pre-merge checks (B) must complete synchronously before allowing a merge — Batch API's 24-hour latency makes this impossible. Interactive debugging (D) requires immediate responses.",
        domain: 4,
        topic: "Batch API",
      },
      {
        id: "d4q6",
        question:
          "After generating code, a developer asks the same Claude session to review it for security vulnerabilities. Is this approach sufficient?",
        options: [
          "Yes — Claude can objectively review its own output",
          "Yes — self-review is always reliable if the session context is large enough",
          "No — the same session shares reasoning context; a separate Claude instance should perform independent review",
          "No — Claude Code cannot review code in the same session due to rate limits",
        ],
        correctIndex: 2,
        explanation:
          "Self-review in the same session is insufficient for high-stakes review because the instance shares the same reasoning context as the generation — it has the same blind spots and is biased toward its own output. Meaningful review requires an independent Claude instance with no context from the generation session. This is the multi-instance review pattern.",
        domain: 4,
        topic: "Multi-Instance Review",
      },
      {
        id: "d4q7",
        question:
          "What does setting `tool_choice: { type: 'tool', name: 'extract_info' }` guarantee?",
        options: [
          "Claude will use any available tool",
          "Claude will use only the 'extract_info' tool and no other tools",
          "Claude will prefer the 'extract_info' tool but may use others",
          "Claude will not use any tools and respond with text",
        ],
        correctIndex: 1,
        explanation:
          "Setting `tool_choice: { type: 'tool', name: 'extract_info' }` forces Claude to call exactly that specific tool. This guarantees structured output from that tool's schema. It's the most constrained setting — useful when you know exactly what action Claude should take and need guaranteed structured output matching that tool's schema.",
        domain: 4,
        topic: "Structured Output",
      },
      {
        id: "d4q8",
        question:
          "In a validation-retry loop, what information should the correction feedback message include?",
        options: [
          "Just 'please try again'",
          "The original output, the specific validation error, and a request to correct it",
          "A completely new prompt unrelated to the original task",
          "Only the correct answer without explaining the error",
        ],
        correctIndex: 1,
        explanation:
          "Effective correction feedback must include: (1) the original output so Claude knows what it produced, (2) the specific validation error explaining exactly what is wrong, and (3) a clear request to fix and resubmit. Vague feedback like 'try again' (A) gives Claude no information to correct on. Providing the answer (D) defeats the purpose of having Claude generate it.",
        domain: 4,
        topic: "Validation-Retry Loops",
      },
    ],
  },
  {
    id: 5,
    title: "Context Management & Reliability",
    weight: 15,
    description:
      "Manage context windows effectively, ensure error propagation and recovery, calibrate human-in-the-loop triggers, and maintain context durability and provenance for reliable AI systems.",
    icon: "🧠",
    color: "from-red-600 to-pink-600",
    concepts: [
      {
        title: "5.1 Persistent Case Facts Block",
        content:
          "For complex long-running tasks (e.g., legal analysis, debugging sessions), maintain a persistent 'case facts' block at the start of every message. This prevents context drift as conversations grow.",
        keyPoints: [
          "Place critical facts in a structured block at the beginning of the system prompt.",
          "Update the facts block as new critical information is established.",
          "Facts block prevents losing key details as the conversation grows longer.",
          "Structure: case ID, key constraints, decisions made, current goal.",
          "Separating facts from conversation history improves retrieval accuracy.",
          "Re-include the facts block in every message to ensure it's always in active context.",
        ],
        codeExample: `// Persistent case facts block pattern
const systemPrompt = \`
## CASE FACTS (Always Refer to These)
- Case ID: SUPPORT-1234
- User: Enterprise customer, Tier 1 SLA
- Issue: API rate limiting on production account
- Confirmed facts: Rate limit is 1000 req/min, customer using 950 avg
- Decision made: Will not increase limit, will optimize usage
- Current goal: Generate optimization recommendations

## YOUR ROLE
You are a support engineer helping resolve this case.
\`;`,
      },
      {
        title: "5.2 Lost-in-the-Middle Problem",
        content:
          "Claude (and all LLMs) pay more attention to the beginning and end of the context window. Information in the middle of a long context may be under-attended, leading to missed details.",
        keyPoints: [
          "Critical information should appear at the beginning or end of the context.",
          "Avoid burying key constraints or facts in the middle of long prompts.",
          "Summarize and resurface important facts periodically in long conversations.",
          "For long documents, extract and front-load the most relevant sections.",
          "Structure prompts: critical context first → supporting details → task instruction last.",
          "Symptoms: Claude ignores constraints that were mentioned once in the middle of a long prompt.",
        ],
        examTrap:
          "TRAP: Placing critical instructions in the middle of a very long context is a reliability risk. Important instructions belong at the start or end.",
      },
      {
        title: "5.3 Error Propagation & Escalation",
        content:
          "In agentic pipelines, errors must propagate correctly to avoid silent failures. Escalation triggers define when human intervention is required versus automated recovery.",
        keyPoints: [
          "All tool errors must surface to the agent — never silently swallow errors.",
          "Error propagation: tool error → agent error handling → orchestrator notification.",
          "Escalation triggers: permission errors, repeated validation failures, data corruption detected.",
          "Human-in-the-loop trigger conditions must be defined before deployment, not ad-hoc.",
          "Silent failure is worse than noisy failure — always surface errors explicitly.",
          "Error context should include: what failed, when, what was being attempted, what the agent's state was.",
        ],
      },
      {
        title: "5.4 Context Durability",
        content:
          "Context durability ensures important information survives across session boundaries, context window overflows, and system restarts. Durable context is explicitly persisted, not assumed to be available.",
        keyPoints: [
          "Never rely on in-memory conversation history for long-running tasks.",
          "Persist context to durable storage at checkpoints.",
          "Context durability pattern: extract → serialize → store → restore on resumption.",
          "Summarize old conversation history before it falls out of the context window.",
          "Track what has been 'forgotten' due to context window limits and re-include if needed.",
          "Differentiate between session-scoped context (can forget) and task-scoped context (must persist).",
        ],
      },
      {
        title: "5.5 Human-in-the-Loop Confidence Calibration",
        content:
          "Agents should request human input when confidence is low or stakes are high. Calibrating confidence thresholds prevents both over-escalation (annoying) and under-escalation (dangerous).",
        keyPoints: [
          "Define explicit confidence thresholds for different action categories.",
          "Low-stakes actions: Claude executes autonomously.",
          "Medium-stakes: Claude proposes, human approves.",
          "High-stakes: Claude stops and escalates immediately.",
          "Confidence signals: uncertainty language, contradictory information, outside training distribution.",
          "Over-escalation reduces utility; under-escalation increases risk. Calibrate carefully.",
        ],
      },
      {
        title: "5.6 Provenance Tracking",
        content:
          "In multi-step agentic pipelines, tracking where each piece of information came from is critical for debugging, auditing, and error correction.",
        keyPoints: [
          "Attach provenance metadata to each fact: source, timestamp, confidence, extraction method.",
          "Provenance enables: error tracing, audit trails, targeted correction without full re-run.",
          "Distinguish between: user-provided facts (high trust), tool-retrieved facts (medium), Claude-inferred (lower).",
          "Provenance chains: if fact B was derived from fact A, record the derivation.",
          "Useful for compliance: who said what, when, based on what source.",
          "Provenance is especially important when combining information from multiple tools and sources.",
        ],
      },
    ],
    questions: [
      {
        id: "d5q1",
        question:
          "What is the purpose of a 'persistent case facts block' in long-running agentic sessions?",
        options: [
          "To store API credentials securely across sessions",
          "To cache tool results for faster retrieval",
          "To ensure critical facts remain in active context and are not lost as conversation grows",
          "To provide Claude with a list of available tools",
        ],
        correctIndex: 2,
        explanation:
          "A persistent case facts block is a structured summary of critical information that appears at the start of the system prompt (or every message). As conversations grow long, important details can drift out of active attention or even out of the context window. The facts block re-anchors Claude to the key constraints, decisions, and context for every response.",
        domain: 5,
        topic: "Persistent Case Facts",
      },
      {
        id: "d5q2",
        question:
          "In a long context window, where should the most critical instructions be placed?",
        options: [
          "In the middle of the context to balance attention",
          "At the beginning or end of the context, where attention is strongest",
          "Randomly distributed to ensure even coverage",
          "In a separate API parameter called 'critical_instructions'",
        ],
        correctIndex: 1,
        explanation:
          "The 'lost in the middle' problem shows that LLMs pay more attention to the beginning and end of contexts. Critical instructions, constraints, and key facts belong at the start of the system prompt (guaranteed attention) or at the end of the user message (recency effect). Placing critical information only in the middle risks it being underattended.",
        domain: 5,
        topic: "Lost-in-the-Middle",
      },
      {
        id: "d5q3",
        question:
          "An agentic pipeline silently ignores tool errors and continues execution. What is the risk?",
        options: [
          "No risk — it is better to continue rather than fail noisily",
          "Silent failures lead to corrupt outputs, wasted work, and difficult-to-debug outcomes",
          "The agent will automatically recover from all silent errors",
          "Silent error handling is the recommended pattern for resilience",
        ],
        correctIndex: 1,
        explanation:
          "Silently swallowing errors is one of the most dangerous anti-patterns in agentic systems. The agent continues operating on potentially incorrect or incomplete information, producing corrupted outputs. Worse, the failure is invisible until the final output is wrong, making debugging extremely difficult. Always surface errors explicitly so the agent can apply the correct error handling strategy.",
        domain: 5,
        topic: "Error Propagation",
      },
      {
        id: "d5q4",
        question:
          "When should a human-in-the-loop trigger be activated in an agentic system?",
        options: [
          "On every tool call to ensure human oversight",
          "Only when the agent explicitly asks for help",
          "Based on pre-defined confidence thresholds and action risk levels",
          "Never — autonomous systems should operate without interruption",
        ],
        correctIndex: 2,
        explanation:
          "Human-in-the-loop triggers should be defined proactively based on: action risk level (low/medium/high stakes), agent confidence level (uncertain vs confident), and specific escalation conditions (permission errors, repeated failures). Triggering on every action (A) destroys utility. Waiting for Claude to ask (B) is unreliable. Never triggering (D) is unsafe for high-stakes systems.",
        domain: 5,
        topic: "Human-in-the-Loop",
      },
      {
        id: "d5q5",
        question:
          "Why is provenance tracking important in multi-step agentic pipelines?",
        options: [
          "It speeds up tool execution by caching previous results",
          "It enables error tracing, audit trails, and targeted correction without full re-runs",
          "It reduces the size of the context window",
          "It prevents Claude from using tools more than once",
        ],
        correctIndex: 1,
        explanation:
          "Provenance tracking records where each piece of information came from (source, timestamp, confidence). This enables: tracing errors back to their source, producing compliance audit trails, and correcting specific incorrect facts without re-running the entire pipeline. Without provenance, debugging a multi-step failure requires examining every step from scratch.",
        domain: 5,
        topic: "Provenance Tracking",
      },
      {
        id: "d5q6",
        question:
          "A long-running agent session has accumulated 100+ messages. The context window is nearing its limit. What is the correct approach?",
        options: [
          "Start a completely new session from scratch",
          "Delete old messages randomly to free space",
          "Summarize older conversation history, persist key facts to durable storage, and continue with compressed context",
          "Increase the max_tokens parameter to extend the context window",
        ],
        correctIndex: 2,
        explanation:
          "When approaching context limits, the correct approach is to summarize older history, extract and persist critical facts to durable storage, and continue with the compressed context. Starting from scratch (A) loses all progress. Random deletion (B) may remove critical information. max_tokens controls output length, not context window size (D). Systematic summarization preserves what matters.",
        domain: 5,
        topic: "Context Durability",
      },
    ],
  },
  // ─── Section 6: Claude Fundamentals ────────────────────────────────────────
  {
    id: 6,
    title: "Claude Fundamentals",
    weight: 15,
    description:
      "Understand Claude's model family, API structure, token economics, and core capabilities. Know when to use Opus vs Sonnet vs Haiku and how to reason about cost and latency.",
    icon: "🧠",
    color: "from-sky-600 to-cyan-600",
    concepts: [
      {
        title: "6.1 Claude Model Family",
        content:
          "Anthropic offers three tiers of Claude models — Opus, Sonnet, and Haiku — each optimised for a different cost/capability/latency tradeoff. Choosing the right model is an architectural decision, not a detail.",
        keyPoints: [
          "Opus: highest capability, best for complex reasoning, agentic tasks, and high-stakes decisions. Highest cost.",
          "Sonnet: balanced capability and cost. Best for most production workloads where you need quality without Opus pricing.",
          "Haiku: fastest and cheapest. Best for simple classification, extraction, routing, and high-volume lightweight tasks.",
          "Model selection should be driven by task complexity, latency requirements, and cost budget — not habit.",
          "You can mix models in a multi-agent system: Opus as orchestrator, Haiku as subagents for cheap tool calls.",
          "Context window sizes differ by model. Always verify the model supports your required context length.",
        ],
        examTrap:
          "TRAP: Always defaulting to Opus is a cost anti-pattern. Match model tier to task complexity. Haiku is the right answer for simple classification or extraction at scale.",
        codeExample: `// Model selection by task complexity
const orchestrator = await client.messages.create({
  model: "claude-opus-4-6",       // Complex reasoning, orchestration
  max_tokens: 4096,
  messages: [{ role: "user", content: "Decompose this task..." }],
});

const classifier = await client.messages.create({
  model: "claude-haiku-4-5",      // Simple, high-volume, cheap
  max_tokens: 50,
  messages: [{ role: "user", content: "Classify as positive/negative:" }],
});`,
      },
      {
        title: "6.2 API Structure & Messages Endpoint",
        content:
          "All Claude interactions go through the /v1/messages endpoint. Understanding the request/response structure — roles, content blocks, stop reasons, and usage — is fundamental to building reliable integrations.",
        keyPoints: [
          "Messages must alternate between 'user' and 'assistant' roles. First message must be 'user'.",
          "Content is an array of blocks: text, image, tool_use, tool_result, document.",
          "stop_reason tells you why generation stopped: end_turn, max_tokens, tool_use, stop_sequence.",
          "usage object reports input_tokens and output_tokens for cost tracking.",
          "max_tokens controls maximum output length — it does NOT extend the context window.",
          "The system parameter sets persistent instructions separate from the conversation.",
          "API key goes in the x-api-key header. Never hardcode it — use environment variables.",
        ],
        examTrap:
          "TRAP: Increasing max_tokens does not give Claude more context to read. It only controls how many tokens Claude can output. Context window size is a model property.",
        codeExample: `const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,           // Max OUTPUT tokens, not context size
  system: "You are a helpful assistant.",
  messages: [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there!" },
    { role: "user", content: "What can you do?" },
  ],
});

console.log(response.stop_reason);        // "end_turn"
console.log(response.usage.input_tokens); // Tokens billed for input
console.log(response.content[0].text);    // Claude's response`,
      },
      {
        title: "6.3 Token Economics & Cost Management",
        content:
          "Tokens are the unit of billing and context. Understanding how tokens are counted, how prompt caching reduces cost, and how to estimate costs is essential for production systems.",
        keyPoints: [
          "Input tokens (prompt) and output tokens (response) are billed separately at different rates.",
          "Prompt caching can reduce costs by up to 90% on repeated identical context (system prompts, documents).",
          "Use client.messages.countTokens() to estimate cost before sending a request.",
          "Cache writes cost slightly more than regular input; cache reads cost significantly less.",
          "Streaming does not reduce token costs — it only affects perceived latency.",
          "Batch API offers 50% cost reduction for non-latency-sensitive workloads.",
          "Context window utilisation: input tokens + output tokens must stay under the model's limit.",
        ],
        examTrap:
          "TRAP: Streaming is NOT cheaper than non-streaming. Both consume identical tokens. Use streaming for UX (progressive display), not cost savings.",
      },
      {
        title: "6.4 Rate Limits & Reliability",
        content:
          "The Claude API enforces rate limits at the request, token, and daily level. Building reliable integrations requires understanding these limits and implementing appropriate retry strategies.",
        keyPoints: [
          "Rate limits operate on three axes: requests per minute (RPM), tokens per minute (TPM), and tokens per day (TPD).",
          "429 errors indicate rate limiting. The retry-after header tells you how long to wait.",
          "Use exponential backoff with jitter for retries — never retry immediately.",
          "The SDK automatically retries 429 and 5xx errors (default: 2 retries). Configure max_retries for your needs.",
          "5xx errors (500, 529) are server-side and safe to retry. 4xx errors (except 429) are client errors — fix the request.",
          "For predictable high-volume workloads, prefer Batch API over synchronous calls to avoid rate limit pressure.",
        ],
        examTrap:
          "TRAP: A 400 error means your request is malformed. Do NOT retry 400 errors — they will always fail. Only retry 429 and 5xx errors.",
      },
    ],
    questions: [
      {
        id: "d6q1",
        question:
          "You need to classify 50,000 customer support tickets per day as 'billing', 'technical', or 'general'. Cost is critical. Which model should you use?",
        options: [
          "claude-opus-4-6 — highest accuracy ensures no misclassification",
          "claude-sonnet-4-6 — balanced cost/quality for production workloads",
          "claude-haiku-4-5 — fastest and cheapest, appropriate for simple classification at scale",
          "Alternate between Opus and Haiku randomly to balance load",
        ],
        correctIndex: 2,
        explanation:
          "Simple 3-class classification is a low-complexity task well within Haiku's capabilities. At 50,000 tickets/day, cost is the dominant constraint. Haiku at $1/$5 per million tokens is 5x cheaper than Sonnet and 25x cheaper than Opus. Match model tier to task complexity — Opus is overkill for classification.",
        domain: 6,
        topic: "Model Selection",
      },
      {
        id: "d6q2",
        question:
          "What does increasing max_tokens in a Claude API request do?",
        options: [
          "Increases the amount of input text Claude can read",
          "Extends the context window to fit more conversation history",
          "Sets the maximum number of tokens Claude can generate in its response",
          "Reduces the cost per token by pre-allocating a token budget",
        ],
        correctIndex: 2,
        explanation:
          "max_tokens controls only the output length — how many tokens Claude can generate in its response. It does NOT affect how much input Claude can read. Context window size is a fixed model property. Misunderstanding this is a common integration mistake.",
        domain: 6,
        topic: "API Structure",
      },
      {
        id: "d6q3",
        question:
          "Your application sends the same 20,000-token legal document as a system prompt on every API call. What is the most cost-effective optimisation?",
        options: [
          "Compress the document with gzip before sending",
          "Use prompt caching to cache the document across requests",
          "Switch to a smaller model to reduce per-token cost",
          "Split the document across multiple API calls",
        ],
        correctIndex: 1,
        explanation:
          "Prompt caching is designed exactly for this pattern. By marking the document with cache_control: ephemeral, the first request writes the cache (slight premium) and all subsequent requests read from cache at ~90% cost reduction. Compression (A) doesn't work — the API counts tokens, not bytes. Splitting (D) breaks coherence.",
        domain: 6,
        topic: "Token Economics",
      },
      {
        id: "d6q4",
        question:
          "A Claude API call returns a 429 status code. What is the correct response?",
        options: [
          "Retry the request immediately — 429 errors are transient",
          "Fix the request payload — 429 means the request is malformed",
          "Wait the duration specified in the retry-after header, then retry with exponential backoff",
          "Switch to a different model to avoid the rate limit",
        ],
        correctIndex: 2,
        explanation:
          "429 is a rate limit error. The correct approach is to wait at least the retry-after header value, then retry with exponential backoff. Retrying immediately (A) will hit the same limit again. 429 is not a malformed request (B) — that's a 400. Switching models (D) doesn't bypass rate limits, which apply at the organisation level.",
        domain: 6,
        topic: "Rate Limits",
      },
      {
        id: "d6q5",
        question:
          "You're building a multi-agent pipeline. The orchestrator must decompose complex tasks and reason about dependencies. Subagents handle simple data extraction from structured JSON. What is the optimal model allocation?",
        options: [
          "Use claude-opus-4-6 for all agents — consistency is most important",
          "Use claude-haiku-4-5 for all agents — minimise cost across the pipeline",
          "Use claude-opus-4-6 for the orchestrator, claude-haiku-4-5 for the extraction subagents",
          "Use claude-sonnet-4-6 for all agents — the best balance across all tasks",
        ],
        correctIndex: 2,
        explanation:
          "Match model capability to task complexity. The orchestrator performs complex reasoning and task decomposition — Opus is appropriate here. The subagents do simple, well-defined JSON extraction — Haiku is sufficient and dramatically cheaper. This layered approach is a standard cost-optimisation pattern for multi-agent systems.",
        domain: 6,
        topic: "Model Selection",
      },
      {
        id: "d6q6",
        question:
          "Which stop_reason indicates that Claude wants to execute a tool before continuing its response?",
        options: [
          "end_turn",
          "max_tokens",
          "tool_use",
          "stop_sequence",
        ],
        correctIndex: 2,
        explanation:
          "stop_reason: 'tool_use' means Claude has decided to call one or more tools and is pausing its response to wait for results. Your application must extract the tool_use blocks, execute the tools, and append the tool_result blocks before making another API call. end_turn means Claude finished naturally. max_tokens means the output was truncated.",
        domain: 6,
        topic: "API Structure",
      },
      {
        id: "d6q7",
        question:
          "You need to process 10,000 document summaries and results are needed within 24 hours (not immediately). Which API feature should you use to reduce cost?",
        options: [
          "Streaming API — lower latency means faster batch completion",
          "Prompt caching — reduce repeated context costs",
          "Batch API — 50% cost reduction for asynchronous workloads",
          "Parallel synchronous calls — maximum throughput",
        ],
        correctIndex: 2,
        explanation:
          "The Batch API offers 50% cost reduction for workloads that don't require immediate responses. With a 24-hour window, this is the ideal use case. Streaming (A) doesn't reduce cost. Prompt caching (B) helps with repeated context but doesn't give a 50% blanket discount. Parallel calls (D) increase cost by removing the batch discount and adding rate limit risk.",
        domain: 6,
        topic: "Token Economics",
      },
    ],
  },
  // ─── Section 7: Safety & Responsible Use ───────────────────────────────────
  {
    id: 7,
    title: "Safety & Responsible Use",
    weight: 10,
    description:
      "Understand Constitutional AI, content policies, responsible deployment patterns, and how to build safe agentic systems. Know when and how Claude refuses, escalates, and defers to human oversight.",
    icon: "🛡️",
    color: "from-rose-600 to-pink-600",
    concepts: [
      {
        title: "7.1 Constitutional AI & Claude's Values",
        content:
          "Claude is trained using Constitutional AI (CAI) — a technique where an AI model is given a set of principles ('the constitution') and learns to evaluate and revise its own outputs against those principles. This produces consistent, value-aligned behaviour without requiring human labelling of every edge case.",
        keyPoints: [
          "Constitutional AI trains models to critique and revise their outputs using principle-based self-evaluation.",
          "Claude's constitution includes principles around helpfulness, harmlessness, and honesty (HHH).",
          "CAI means refusals are principled and consistent — not arbitrary. Claude applies the same principles across contexts.",
          "Claude has values, not just rules. It reasons about novel situations by applying underlying principles.",
          "Operators can expand or restrict Claude's default behaviours within Anthropic's usage policies.",
          "Users can further adjust within the scope operators permit — but cannot exceed operator permissions.",
        ],
        examTrap:
          "TRAP: Claude's refusals are not a blocklist lookup. They are the result of principled reasoning. You cannot 'jailbreak' consistent CAI-trained values the same way you can bypass keyword filters.",
      },
      {
        title: "7.2 Content Policy & Usage Guidelines",
        content:
          "Anthropic's usage policies define what Claude will and won't do. Understanding the operator/user permission model is critical for designing compliant applications.",
        keyPoints: [
          "Anthropic sets the top-level policy. Operators (API users) agree to these when accessing the API.",
          "Operators can expand defaults (e.g., enable adult content for appropriate platforms) within Anthropic's limits.",
          "Operators can restrict defaults (e.g., only answer questions about their product domain).",
          "Users can adjust within operator-granted permissions — they cannot exceed what the operator allows.",
          "Hardcoded behaviours (e.g., never assist with CSAM or weapons of mass destruction) cannot be unlocked by anyone.",
          "System prompts are the primary mechanism for operators to configure Claude's behaviour.",
        ],
        examTrap:
          "TRAP: Operators cannot grant users more permissions than the operator themselves has. The permission chain is Anthropic → Operator → User. Each layer can only restrict or delegate, not amplify.",
      },
      {
        title: "7.3 Safe Agentic System Design",
        content:
          "Agentic systems introduce unique safety challenges because Claude takes actions with real-world consequences. Safe design requires minimal footprint, explicit confirmation gates, and reversibility by default.",
        keyPoints: [
          "Minimal footprint principle: request only necessary permissions, avoid storing sensitive data beyond immediate needs.",
          "Prefer reversible actions over irreversible ones. When in doubt, confirm before acting.",
          "Implement explicit human-in-the-loop checkpoints for high-stakes, irreversible, or ambiguous actions.",
          "Scope creep risk: Claude may interpret broad goals as permission for broad actions. Constrain scope explicitly.",
          "Audit trails: log every action, tool call, and decision point for post-hoc review.",
          "Fail-safe defaults: when Claude cannot determine if an action is safe, it should pause and escalate, not proceed.",
          "Never use AI confidence as the sole gate for high-stakes actions — confidence is not certainty.",
        ],
        examTrap:
          "TRAP: 'Claude will figure out what is safe' is not a safety strategy. Safety gates must be enforced programmatically, not delegated to the model's judgement alone.",
        codeExample: `// Safe agentic pattern: confirm before irreversible action
async function executeAction(action: Action): Promise<void> {
  if (action.isIrreversible) {
    const confirmed = await requestHumanConfirmation(action);
    if (!confirmed) {
      throw new Error("Action cancelled by human reviewer");
    }
  }
  await action.execute();
  await auditLog.record(action); // Always log
}`,
      },
      {
        title: "7.4 Bias, Fairness & Red-Teaming",
        content:
          "Responsible deployment requires actively testing for biased outputs, establishing feedback loops, and conducting adversarial testing (red-teaming) before launch.",
        keyPoints: [
          "Red-teaming: deliberately attempting to elicit harmful, biased, or policy-violating outputs before deployment.",
          "Bias testing: systematically checking outputs across demographic groups, edge cases, and sensitive topics.",
          "Feedback loops: human review of model outputs, especially for high-stakes decisions.",
          "Output monitoring: production monitoring for policy violations, unexpected refusals, and drift.",
          "Never assume testing is complete — adversarial inputs evolve. Establish ongoing monitoring.",
          "For agentic systems, test the full loop including tool calls and multi-step plans.",
        ],
        examTrap:
          "TRAP: Red-teaming is not optional for production deployments. It is a minimum standard for responsible release, especially for agentic systems that take real-world actions.",
      },
    ],
    questions: [
      {
        id: "d7q1",
        question:
          "What is Constitutional AI (CAI)?",
        options: [
          "A legal framework governing AI company liability",
          "A technique where a model critiques and revises its outputs using a set of guiding principles",
          "A hardcoded blocklist of prohibited topics embedded in the model weights",
          "An external content moderation API that filters Claude's responses",
        ],
        correctIndex: 1,
        explanation:
          "Constitutional AI is an alignment technique where Claude is trained to evaluate its own outputs against a set of principles (a 'constitution') and revise them to be more helpful, harmless, and honest. This produces consistent, principled behaviour — not a keyword blocklist or external filter.",
        domain: 7,
        topic: "Constitutional AI",
      },
      {
        id: "d7q2",
        question:
          "An operator builds an adult content platform. Can they enable Claude to generate explicit content for verified adult users?",
        options: [
          "No — explicit content is hardcoded off and cannot be enabled by anyone",
          "Yes — operators can expand Claude's defaults within Anthropic's usage policies",
          "Yes — users can enable it themselves by requesting it in the prompt",
          "No — only Anthropic can enable non-default behaviours on a per-deployment basis",
        ],
        correctIndex: 1,
        explanation:
          "Operators can expand Claude's default behaviours within Anthropic's permitted bounds. Enabling adult content for age-verified platforms is a documented example of an operator-expandable default. Users cannot enable this themselves — it requires operator-level configuration. Some behaviours (CSAM, weapons of mass destruction) are hardcoded and cannot be unlocked by anyone.",
        domain: 7,
        topic: "Content Policy",
      },
      {
        id: "d7q3",
        question:
          "An agentic system is about to permanently delete 10,000 customer records as part of a data cleanup task. What is the correct safety pattern?",
        options: [
          "Proceed if Claude's confidence score exceeds 90%",
          "Pause execution and require explicit human confirmation before the irreversible action",
          "Proceed, since the system was authorised to perform data cleanup",
          "Log the action after completion for audit purposes",
        ],
        correctIndex: 1,
        explanation:
          "Permanent deletion is irreversible. The minimal footprint and prefer-reversible-actions principles require a human confirmation gate before any irreversible high-stakes action. Claude's confidence is not a sufficient safety gate — confidence is not certainty. Logging after the fact (D) does not prevent the harm. General authorisation for 'data cleanup' does not imply blanket authorisation for permanent deletion.",
        domain: 7,
        topic: "Safe Agentic Design",
      },
      {
        id: "d7q4",
        question:
          "What does the 'minimal footprint' principle mean in the context of agentic systems?",
        options: [
          "Minimise the number of API calls made during a session",
          "Use the smallest model capable of completing the task",
          "Request only necessary permissions, avoid storing sensitive data beyond immediate needs, and prefer reversible actions",
          "Reduce memory usage by compressing intermediate results",
        ],
        correctIndex: 2,
        explanation:
          "Minimal footprint is a safety principle for agentic systems: only acquire the permissions and resources genuinely needed for the task, don't persist sensitive data longer than required, and default to reversible actions. This limits the blast radius if something goes wrong and aligns with responsible deployment.",
        domain: 7,
        topic: "Safe Agentic Design",
      },
      {
        id: "d7q5",
        question:
          "A user asks Claude (via an operator's customer service bot) to ignore the system prompt and act as an unrestricted AI. What should happen?",
        options: [
          "Claude should comply — users have the right to configure their own AI experience",
          "Claude should comply only if the user explains a legitimate reason",
          "Claude should decline — users cannot override operator-level configuration",
          "Claude should ask Anthropic for permission before deciding",
        ],
        correctIndex: 2,
        explanation:
          "The permission chain is Anthropic → Operator → User. Users operate within the scope that operators define. An operator's system prompt is operator-level configuration, and users cannot override it. This is a common prompt injection / jailbreak pattern — Claude is trained to recognise and resist it.",
        domain: 7,
        topic: "Content Policy",
      },
      {
        id: "d7q6",
        question:
          "Which of the following is the correct description of red-teaming?",
        options: [
          "Automated unit testing of API endpoints for performance regressions",
          "Deliberately attempting to elicit harmful, biased, or policy-violating outputs before deployment",
          "Monitoring production logs for errors after a deployment",
          "Reviewing model outputs for grammar and factual accuracy",
        ],
        correctIndex: 1,
        explanation:
          "Red-teaming is adversarial testing: deliberately crafting inputs designed to elicit harmful, biased, or policy-violating outputs. It is a pre-deployment requirement for responsible AI systems, especially those with agentic capabilities. It differs from regular testing by being explicitly adversarial, not just functional.",
        domain: 7,
        topic: "Red-Teaming",
      },
    ],
  },
  // ─── Section 8: Vision & Multimodal Capabilities ───────────────────────────
  {
    id: 8,
    title: "Vision & Multimodal Capabilities",
    weight: 10,
    description:
      "Learn how to send images, PDFs, and mixed-media inputs to Claude. Understand supported formats, size limits, input methods, and how to structure multimodal prompts effectively.",
    icon: "👁️",
    color: "from-emerald-600 to-teal-600",
    concepts: [
      {
        title: "8.1 Image Inputs",
        content:
          "Claude can analyse images passed as base64-encoded data or via URL. Images are treated as content blocks within the messages array, alongside text blocks.",
        keyPoints: [
          "Supported image formats: JPEG, PNG, GIF, WebP.",
          "Two input methods: base64 (type: 'base64', media_type, data) or URL (type: 'url', url).",
          "Maximum image size: 5MB per image. Images larger than this must be resized before sending.",
          "Maximum images per request: 20 images.",
          "Images consume tokens — a 1024×1024 image costs approximately 1,600 tokens.",
          "Place the image block before the text block in the content array for best results.",
          "Claude can analyse charts, diagrams, screenshots, documents, and photographs.",
        ],
        examTrap:
          "TRAP: Claude cannot access images via filesystem paths. You must either base64-encode the image data or provide a publicly accessible URL. Local file paths will not work.",
        codeExample: `// Image as base64
const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: base64EncodedImageData,
        },
      },
      { type: "text", text: "What does this diagram show?" },
    ],
  }],
});

// Image via URL
const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: { type: "url", url: "https://example.com/chart.png" },
      },
      { type: "text", text: "Summarise the key trends in this chart." },
    ],
  }],
});`,
      },
      {
        title: "8.2 PDF & Document Processing",
        content:
          "Claude can read and analyse PDF documents directly. PDFs are passed as document content blocks, similar to images. This enables document summarisation, Q&A, data extraction, and compliance review without preprocessing.",
        keyPoints: [
          "Pass PDFs as document blocks with type: 'document' and source type: 'base64' or 'url'.",
          "Maximum PDF size: 32MB. Maximum pages per document: 100 pages.",
          "Claude reads the actual PDF content, not just metadata — it can extract tables, figures, and structured data.",
          "Multiple PDFs can be included in a single request.",
          "Use the Files API to upload a PDF once and reference it by file_id across multiple requests.",
          "Citations can be enabled to ground Claude's answers in specific document locations.",
          "For large PDFs, consider chunking by section to stay within context limits.",
        ],
        examTrap:
          "TRAP: Sending a URL to a PDF on a private server does not work. The URL must be publicly accessible, or you must use base64 encoding or the Files API.",
        codeExample: `import fs from "fs";

const pdfBase64 = fs.readFileSync("contract.pdf").toString("base64");

const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 2048,
  messages: [{
    role: "user",
    content: [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdfBase64,
        },
        title: "Service Contract",       // optional
        citations: { enabled: true },    // optional: ground answers in doc
      },
      { type: "text", text: "What are the termination clauses?" },
    ],
  }],
});`,
      },
      {
        title: "8.3 Multimodal Prompt Design",
        content:
          "Effective multimodal prompts combine images or documents with precise text instructions. The structure and ordering of content blocks affects output quality.",
        keyPoints: [
          "Place media (images, documents) before the question/instruction text block for best attention.",
          "Be specific about what you want: 'Extract all dollar amounts from this invoice' > 'Tell me about this document'.",
          "For multiple images, number or label them in the text ('In the first image...', 'Compare image A and image B...').",
          "Claude maintains coherence across mixed media in a single turn.",
          "Chain-of-thought prompting works for multimodal: ask Claude to describe what it sees before answering.",
          "For structured extraction from images (tables, forms), request JSON output with explicit schema.",
        ],
        examTrap:
          "TRAP: Claude cannot edit, generate, or modify images. It can only analyse and describe them. Do not expect image generation or image editing capabilities.",
        codeExample: `// Structured extraction from an image
const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: invoiceData },
      },
      {
        type: "text",
        text: \`Extract all line items from this invoice as JSON:
{
  "invoice_number": string,
  "date": string,
  "line_items": [{ "description": string, "amount": number }],
  "total": number
}\`,
      },
    ],
  }],
});`,
      },
      {
        title: "8.4 Files API for Persistent Media",
        content:
          "The Files API allows you to upload a file once and reference it by ID across multiple API calls, avoiding repeated uploads and reducing latency for multi-turn document interactions.",
        keyPoints: [
          "Upload with client.beta.files.upload() — returns a file_id.",
          "Reference in messages using source type: 'file' with the file_id.",
          "Files persist until deleted — upload once, use many times.",
          "Maximum file size: 500MB. Total storage: 100GB per organisation.",
          "File operations (upload, list, delete) are free. Content used in messages is billed as input tokens.",
          "Files API requires the beta header: betas: ['files-api-2025-04-14'].",
          "Ideal for: documents used in repeated queries, large reference materials, user-uploaded files.",
        ],
        examTrap:
          "TRAP: Files uploaded via the Files API are NOT automatically included in messages. You must explicitly reference the file_id in each message where you want Claude to read the file.",
        codeExample: `// Upload once, reference many times
const uploaded = await client.beta.files.upload({
  file: ("report.pdf", fs.createReadStream("report.pdf"), "application/pdf"),
});

// Later — reference by file_id, no re-upload needed
const response = await client.beta.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  betas: ["files-api-2025-04-14"],
  messages: [{
    role: "user",
    content: [
      {
        type: "document",
        source: { type: "file", file_id: uploaded.id },
      },
      { type: "text", text: "Summarise section 3." },
    ],
  }],
});`,
      },
    ],
    questions: [
      {
        id: "d8q1",
        question:
          "Which image formats does Claude support as direct input?",
        options: [
          "JPEG, PNG, GIF, WebP",
          "JPEG, PNG, SVG, BMP",
          "PNG, TIFF, WebP, HEIC",
          "Any image format — Claude auto-converts unsupported formats",
        ],
        correctIndex: 0,
        explanation:
          "Claude supports JPEG, PNG, GIF, and WebP. SVG, BMP, TIFF, HEIC, and other formats are not supported and must be converted before sending. Claude does not auto-convert unsupported formats.",
        domain: 8,
        topic: "Image Inputs",
      },
      {
        id: "d8q2",
        question:
          "You want to analyse a PDF stored on your company's private intranet. Which approach works with the Claude API?",
        options: [
          "Pass the intranet URL directly — Claude can access any URL",
          "Pass the file system path where the PDF is stored",
          "Base64-encode the PDF and send it as a document block, or upload it via the Files API",
          "Convert the PDF to images first, then send each page as an image block",
        ],
        correctIndex: 2,
        explanation:
          "Claude cannot access private URLs or filesystem paths. For private documents you must either base64-encode the file and include it in the request, or upload it to the Files API and reference the file_id. Converting to images (D) works technically but is unnecessarily complex and loses document structure.",
        domain: 8,
        topic: "PDF Processing",
      },
      {
        id: "d8q3",
        question:
          "What is the correct order for content blocks in a multimodal message for best results?",
        options: [
          "Text instruction first, then the image/document",
          "Image/document first, then the text instruction",
          "Order doesn't matter — Claude processes all blocks simultaneously",
          "Always alternate: text, image, text, image",
        ],
        correctIndex: 1,
        explanation:
          "For best results, place the image or document content block before the text instruction. This mirrors natural reading order and gives Claude the visual context before it processes the question. While Claude can handle either order, image-then-text is the recommended and documented pattern.",
        domain: 8,
        topic: "Multimodal Prompt Design",
      },
      {
        id: "d8q4",
        question:
          "You are building a system where users upload contracts that are then queried 50+ times each. What is the most efficient approach?",
        options: [
          "Base64-encode and include the full PDF in every API request",
          "Extract the text from the PDF and store it in the system prompt",
          "Upload the PDF once via the Files API and reference the file_id in each query",
          "Cache the base64 string client-side and resend it each time",
        ],
        correctIndex: 2,
        explanation:
          "The Files API is designed for exactly this pattern. Upload once with client.beta.files.upload(), get a file_id, then reference that ID in all subsequent requests. This avoids re-transmitting the full file 50+ times, reduces request payload size, and lowers latency. Resending base64 (A, D) wastes bandwidth on every request.",
        domain: 8,
        topic: "Files API",
      },
      {
        id: "d8q5",
        question:
          "A user asks Claude to 'edit this photo to remove the background'. What will Claude do?",
        options: [
          "Generate a new version of the image with the background removed",
          "Provide step-by-step instructions for removing the background in an image editing tool",
          "Return an error — image editing is not a supported capability",
          "Describe what the image would look like with the background removed",
        ],
        correctIndex: 1,
        explanation:
          "Claude can analyse and describe images but cannot generate, edit, or modify them. It has no image generation capability. When asked to edit an image, Claude will typically explain how to do it in an appropriate tool, or describe the change, but it will not produce a modified image. This is a common misconception.",
        domain: 8,
        topic: "Image Capabilities",
      },
      {
        id: "d8q6",
        question:
          "Approximately how many tokens does a 1024×1024 pixel image consume when sent to Claude?",
        options: [
          "Around 100 tokens — images are compressed before token counting",
          "Around 1,600 tokens",
          "Around 16,000 tokens — images are expensive compared to text",
          "Zero tokens — image processing is billed separately, not via tokens",
        ],
        correctIndex: 1,
        explanation:
          "A 1024×1024 image costs approximately 1,600 input tokens. This is important for cost estimation and context window management. Multiple large images can quickly consume a significant portion of the context window. Always account for image token cost when designing multimodal applications.",
        domain: 8,
        topic: "Image Inputs",
      },
    ],
  },
];

export const getDomain = (id: number): Domain | undefined =>
  domains.find((d) => d.id === id);

export const getTotalQuestions = (): number =>
  domains.reduce((sum, d) => sum + d.questions.length, 0);

export const PASSING_SCORE = 70;
