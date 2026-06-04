# Claude Code Feature Curriculum

> Source map: official Claude Code docs index at `https://code.claude.com/docs/llms.txt`, re-checked June 4, 2026.
> Rule: every module teaches the feature first, then attaches one token-efficiency habit and an Impact reward.

## Curriculum Contract

Each feature module must ship with the same learning shape:

1. **What it is**: the job this Claude Code feature performs.
2. **How it works**: what context, tools, permissions, files, or services it touches.
3. **How to use it**: one realistic guided action in the terminal or UI.
4. **How to use it efficiently**: one concrete habit that saves tokens, cost, time, or review risk.
5. **Impact hook**: a bankable tip with saved-token estimate and methodology-backed impact metrics.

Do not add a lesson that only explains a feature. The product thesis is that Claude Code fluency includes knowing when and how to use the feature cheaply.

## Official Index Coverage Audit

The docs index now spans the terminal, IDEs, desktop, web/cloud sessions, extension system, Agent SDK, and team rollout material. The curriculum should treat this as one product surface, but ship it in layers so learners do not hit enterprise or SDK material before they understand sessions and context.

Coverage that is already represented in the tracks below:

- Core product: overview, quickstart, authentication, setup, CLI reference, interactive mode, commands, common workflows, sessions, context window, costs, prompt caching, memory, settings, permissions, permission modes, tools reference.
- Extension system: features overview, `.claude` directory, skills, subagents, hooks, MCP, plugins, plugin marketplaces, plugin dependencies, plugin hints.
- Parallel and automation: agent view, agents, agent teams, goals, checkpointing, scheduled tasks, routines, desktop scheduled tasks.
- Integrations: VS Code, JetBrains, Desktop, Chrome, computer use, web/cloud sessions, remote control, deep links, channels, GitHub Actions, GitLab CI/CD, Slack.
- Programmatic and SDK: Agent SDK overview, agent loop, Claude Code features in SDK, permissions, sessions, slash commands, skills, subagents, hooks, MCP, tool search, custom tools, streaming, structured output, cost tracking, observability, session storage, hosting, secure deployment.
- Team and enterprise: admin setup, analytics, monitoring, managed settings, managed MCP, Bedrock, Vertex AI, Microsoft Foundry, LLM gateways, legal/compliance, data usage, security, rollout kits.

Coverage gaps to keep explicit during implementation:

- **Diagnostics and loaded context**: `/context`, `/doctor`, `/hooks`, `/mcp`, debug config, and `.claude` directory inspection need their own module because they teach learners to see what Claude is paying for before optimizing.
- **Model and response behavior**: model config, fast mode, output styles, fullscreen rendering, status line, and terminal config belong together as "session ergonomics", not scattered as trivia.
- **Evented workflows**: channels and deep links are distinct from chat integrations because they push external state into a running session or launch a correctly scoped one.
- **Production SDK use**: hosting, session storage, observability, secure deployment, user input, and file checkpointing should not be hidden under a generic Agent SDK module.
- **Rollout material**: champion kit and communications kit are not beginner lessons, but they are useful team modules for adoption without wasteful prompt patterns.

## Track 1: Foundations

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Install and verify | Native install, package-manager options, `claude --version`, `claude doctor` | Ask for the smallest diagnostic command output, not a pasted setup story | Run diagnostics, do not narrate your machine |
| Authentication | Console, Pro, Max, Team, Enterprise, Bedrock, Vertex, Foundry | Keep provider and account setup outside repeated prompts | Configure once, reference the auth state |
| Surfaces | CLI, VS Code, JetBrains, Desktop, web, remote control | Use the surface where the context already exists | Do not duplicate context across surfaces |
| Project entry | Start `claude` inside the repo, initial prompt, first approval | Give a scoped first task instead of asking for a full repo tour | Start narrow |
| Diagnose loaded config | `.claude` directory, CLAUDE.md, settings, hooks, MCP, skills, `/context`, `/doctor` | Inspect what is loaded before asking Claude why behavior changed | Debug the context, not the model |

## Track 2: Core Session Workflow

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Agent loop | Read, think, edit, run, ask for approval | Approve deterministic commands, challenge broad reads | Approve work, not wandering |
| Prompt input | Precise prompts, expected output, file scope | State file, symptom, and desired output in one shot | One precise prompt beats retries |
| Continue and resume | `--continue`, `--resume`, named sessions, session storage | Resume only related work, clear unrelated history | Resume with discipline |
| Slash commands | Built-in commands, custom commands, bundled skills | Use commands for repeated workflows instead of retyping instructions | Command the workflow once |
| Keyboard shortcuts | Input modes, shortcuts, command history search | Use history and editing instead of restating long prompts | Edit the prompt, not the conversation |
| Session ergonomics | Status line, terminal config, fullscreen rendering, Vim mode, Shift+Enter | Tune the interface once instead of explaining input friction every session | Fix the terminal, not the prompt |
| Model and output behavior | Model aliases, fast mode, output styles, extended thinking tradeoffs | Pick the cheapest behavior that matches the job | Match mode to task |

## Track 3: Codebase Context

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Search and read | File reads, grep/glob, logs, terminal output | Search before reading entire files | Search, do not slurp |
| `CLAUDE.md` | Project instructions, nested files, durable rules | Put stable facts in project memory once | Store durable context |
| Auto memory | What Claude remembers and where | Review memory before adding more instructions | Keep memory lean |
| Context window | What fills context, compaction, stale history | Clear or compact between unrelated tasks | Drop stale history |
| Prompt caching | Cache hits, cache misses, model switching | Keep stable context stable | Preserve cacheable context |
| Usage and status | `/usage`, status line, cost views | Watch cost drivers before optimizing blindly | Measure before trimming |
| Todo lists | Claude's task tracking and visible work plans | Keep todos concise and outcome-shaped | Track work, not prose |

## Track 4: Tools, Permissions, And Safety

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Built-in tools | Read, edit, search, Bash, web and browser tools where available | Let tools do deterministic work | Use zero-token tools |
| Bash and PowerShell | Shell differences, command approval, platform behavior | Run commands for count, move, rename, test | Compute outside the model |
| Permission modes | Ask, allow, deny, mode switching | Narrow permissions to the task | Allow only what is needed |
| Approvals and user input | Tool approvals, clarification prompts, permission prompts | Approve narrow tool calls and answer blockers directly | Unblock with the smallest answer |
| Sandboxing | Sandboxed Bash, dev containers, Docker, VM choices | Use isolation for risky or broad commands | Isolate expensive mistakes |
| Dev containers | Consistent isolated project environments | Put setup in the container, not in every prompt | Bake the environment once |
| Auto mode | Trusted repos, allow and deny rules, managed config | Keep auto mode scoped to known-safe surfaces | Automate the safe path |
| Checkpointing | Rewind file changes and review edit history | Checkpoint before large migrations | Make broad edits reversible |

## Track 5: Extensions

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Custom slash commands | Command files and repeated prompts | Turn repeated instructions into commands | Save the repeated prompt |
| Skills | Skill structure, loading, bundled skills | Keep skills tight and load detail on demand | A skill replaces re-explanation |
| Subagents | Specialized agents and isolated context | Return conclusions, not raw dumps | Isolate heavy context |
| Hooks | Hook events, validation, formatting, notifications | Automate deterministic checks instead of asking Claude to remember | Put rules in hooks |
| MCP | Servers, transports, resources, prompts, tool search | Enable only needed servers and discover tools on demand | Trim tool schemas |
| Plugins | Skills, agents, hooks, MCP bundled together | Package durable workflows instead of re-adding pieces | Ship the workflow once |
| Plugin distribution | Marketplaces, dependency constraints, plugin hints | Recommend and constrain plugins instead of pasting setup instructions | Install the capability once |

## Track 6: Parallel And Large Work

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Worktrees | Isolated parallel sessions | Split independent tasks into separate worktrees | Avoid context collision |
| Agent view | Manage many sessions | Dispatch independent tasks, inspect only conclusions | Parallelize independent work |
| Agent teams | Coordinated multi-agent work | Assign roles with narrow outputs | Make agents summarize |
| Dynamic workflows | Scripted multi-agent orchestration | Use workflows for repeatable large audits | Reuse the orchestration |
| Goals | Persistent completion conditions | Define done criteria once | Keep the goal stable |
| Scheduled tasks and routines | Recurring prompts and cloud automation | Schedule narrow checks, not broad repo reads | Automate the small check |
| Checkpoint and rewind | Session checkpoints, edit history, summaries | Rewind broad edits instead of asking for a full repair narrative | Rewind before rereading |

## Track 7: Integrations

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| VS Code and JetBrains | IDE context, diffs, selection, shortcuts | Select the relevant code instead of asking for a repo scan | Hand over the slice |
| Desktop | Parallel sessions, visual diffs, side chats | Use visual review for diffs instead of asking for summaries repeatedly | Review once visually |
| Desktop scheduling | Recurring Desktop tasks and dispatch from mobile | Schedule bounded maintenance tasks | Schedule the narrow loop |
| Chrome and computer use | Browser testing and GUI automation | Use browser state and console logs instead of pasted screenshots | Inspect the live app |
| GitHub Actions and GitLab CI | PR comments, CI, issue automation | Feed failing logs and changed files, not the whole repo | Let CI narrow context |
| Code review | Automated PR review and multi-agent review patterns | Review changed files and risks, not the whole repository by default | Review the diff first |
| Slack and remote control | Delegation from chat or phone | Send a scoped task with repo and branch | Delegate the exact task |
| Web and cloud sessions | Cloud setup, remote execution, teleporting sessions | Move sessions instead of restarting from scratch | Continue the same context |
| Channels and deep links | Push events into sessions, open scoped sessions from URLs | Send event payloads and launch context, not pasted incident histories | Route the event to context |

## Track 8: Programmatic Use

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Agent SDK | TypeScript, Python, subprocess architecture | Use allowlists and structured prompts | Bound the agent surface |
| Headless mode | `claude -p`, JSON output, CI scripts | Use single-shot prompts for narrow automation | Single shot when enough |
| SDK sessions | Continue, resume, fork, and persist SDK conversations | Keep long-running state external and intentional | Persist only useful state |
| SDK permissions and user input | Permission callbacks, user approval flows, declarative rules | Push decisions to the host app instead of widening access | Ask the host, not the model |
| Streaming | Stream text and tool calls | Stream only what the host needs to display | Do not render hidden tokens |
| Structured output | JSON Schema, Zod, Pydantic | Ask for validated fields instead of prose | Shape the output |
| Custom tools | In-process tools and APIs | Give Claude task-specific tools instead of generic browsing | Build the narrow tool |
| Tool search | Large tool sets and lazy discovery | Search tools on demand instead of loading every schema | Discover only what you need |
| Cost tracking | Usage, prompt caching, telemetry | Track spend per workflow before optimizing | Measure per workflow |
| Observability | OpenTelemetry traces, metrics, events | Find expensive loops from traces before rewriting prompts | Trace the waste |
| Hosting and storage | Subprocess architecture, Docker/Kubernetes, session storage | Persist transcripts and isolate tenants outside the prompt | Host state outside context |
| Secure deployment | Isolation, credential handling, network control | Enforce boundaries in infrastructure | Keep secrets out of context |

## Track 9: Team And Enterprise

| Module | Teach | Efficient-use hook | Impact tip |
|--------|-------|--------------------|------------|
| Organization setup | Providers, managed settings, policy | Set defaults centrally | Configure once for the team |
| Analytics and monitoring | Usage dashboards, OpenTelemetry | Find high-cost patterns before training people | Optimize the biggest driver |
| Managed MCP and settings | Allow lists, deny lists, server-managed config | Prevent tool sprawl centrally | Prune at the source |
| Security and data usage | Data handling, security guidance, ZDR | Keep sensitive context out of prompts | Do not send what tools can avoid |
| Network and gateways | Proxies, LLM gateways, enterprise providers | Route consistently to preserve policy and caching | Avoid provider drift |
| Rollout kits | Champion kit, communications kit, internal enablement | Teach scoped workflows instead of generic adoption hype | Standardize the good prompt |

## Build Sequence For Feature Expansion

1. **Refactor the lesson model for multiple tracks**: add track metadata, docs references, feature family, prerequisites, and an explicit `efficiencyHabit` field while preserving the current beginner track.
2. **Ship Feature Modules v1**: Core Session Workflow, Codebase Context, Tools and Permissions. These are closest to the existing beginner lessons and give the biggest token-efficiency payoff.
3. **Add extension modules**: custom commands, skills, subagents, hooks, MCP, plugins. Each should include a type-it-yourself terminal challenge because these are operational features.
4. **Add integration modules**: IDE/Desktop/Chrome/GitHub/Slack/web. These should demonstrate choosing the surface where the context already lives.
5. **Add SDK and team modules last**: they need a heavier conceptual model, plus clearer audience labeling so beginners do not mistake them for required setup.

For each slice, update the command palette search index, dashboard grouping, Forest totals, tests, and `/how-we-calculate` copy if new impact assumptions are introduced.

## Release Slices

1. **MVP complete**: current beginner track, Impact System, command palette, type-it-yourself terminal for lessons 3, 4, and 5, checks, branded 404.
2. **Feature modules v1**: Foundations, Core Session Workflow, Codebase Context, Tools and Permissions.
3. **Power user modules**: Extensions, Parallel and Large Work, Integrations.
4. **Team modules**: Programmatic Use, Team and Enterprise. Shipped as 24 Team modules.

## Acceptance For New Modules

- Lesson data includes a `session` and at least three tips.
- At least one tip is bankable as the signature habit.
- The session demonstrates inefficient use before efficient use.
- The terminal or exercise gives the learner a concrete action.
- Impact figures link to `/how-we-calculate`.
- Copy avoids placeholder text and avoids user-facing em dashes.
