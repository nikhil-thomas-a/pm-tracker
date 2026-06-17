# Product

## Register

product

## Users

A single PM using this as a personal daily diary. They context-switch between multiple projects and business units throughout the day. They open this tool to log decisions, track what's in flight, record conversations that happened, and see what's overdue. They're on a laptop at a desk, often in a focused work session. The tool competes with sticky notes, Notion pages, and "I'll remember it" — it has to earn a daily habit.

## Product Purpose

A local-first PM diary for tracking work across Business Units, Projects, and Items. No accounts, no backend, no collaboration — just one PM's complete view of their work, always available offline. Backup and restore via JSON. Success means the PM opens it every morning and closes it every evening, never losing track of a decision or deadline.

## Brand Personality

Sharp, precise, calm. The interface should feel like a well-made tool — confident without showing off. It gets out of the way and lets the PM think. Not a product that performs its own utility; one that quietly delivers it.

## Anti-references

- **Jira / Azure DevOps**: dense, overwhelming, enterprise-gray. Every pixel fighting for attention.
- **SaaS dashboard clichés**: hero metrics, gradient cards, glowing accents, identical tile grids.
- **Notion / Coda**: document-first, whitespace-heavy, blank-page anxiety. Too open-ended for a tracking tool.

## Design Principles

1. **Signal over noise.** Color and weight carry information, never decoration. If removing an element doesn't lose meaning, remove it.
2. **Confidence through restraint.** The interface earns trust by being predictable. Surprises belong in the content, not the chrome.
3. **Errors are facts, not failures.** Overdue deadlines, blocked items, missing data — present them plainly, without alarm theater.
4. **Every action is reversible or confirmable.** A PM diary accumulates months of work. Nothing should be deleted accidentally.
5. **Respect the session.** The PM is in flow. The interface should load fast, respond instantly, and never interrupt without reason.

## Accessibility & Inclusion

WCAG AA. 4.5:1 contrast for body text, 3:1 for large text and UI components. All interactive elements keyboard-reachable with visible focus states. Focus ring on keyboard navigation only (`:focus-visible`), hidden on mouse.
