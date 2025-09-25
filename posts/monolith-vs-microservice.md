---
title: "Monolith vs Microservices — a practical guide for startups and small teams
"
description: "Practical trade-offs between monolith vs microservices, concrete patterns (including the modular monolith), a migration strategy, and a checklist to help you decide"
keywords: "monolith architecture, software engineering, microservices, software architecture"
---
# Monolith vs Microservices — a practical guide for startups and small teams
  
*Published on 2025-09-25 21:13*

**TL;DR:** Microservices are powerful but costly. For small teams (≈5 engineers) or early-stage startups, start with a **modular monolith**: design clear module boundaries, keep deployments simple, and extract services only when the operational and business benefits clearly outweigh the added cost.

---

## Why this matters

Too often the conversation starts with "microservices" as if they were a default good. Microservices solve particular problems — team autonomy, independent scaling, and isolation — but they also introduce real complexity: more infra, more DevOps, distributed failures, harder testing, and extra hiring pressure. That complexity has a real cost, especially for small teams and early-stage products.

This post shows practical trade-offs, concrete patterns (including the modular monolith), a migration strategy, and a checklist to help you decide.

---

## Quick definitions (practical, not academic)

### Monolith
A single deployable application (one codebase, one runtime/deployment). *Note:* a monolith can still be well-structured and modular internally — it’s the deployment unit that’s “single.”

### Microservices
An architecture composed of multiple independently deployable services. Each service often owns its own codebase, runtime, and (sometimes) datastore. Services communicate over the network via APIs or messaging.

### Modular monolith
A single deployable application that is organized as discrete modules (bounded contexts) with clear interfaces and low coupling. It aims for the best of both worlds: simple deployment + modular boundaries that make future extraction easier.

---

## Practical pros & cons

### Monolith (practical lens)
**Pros**
- Simple to deploy, run, and debug.
- Single CI/CD pipeline: easier release process.
- Transactions and data consistency are straightforward.
- Lower initial infrastructure and tooling cost.
- Faster feature iteration for small teams.

**Cons**
- Can become a big-ball-of-mud without discipline.
- Deploys touch everything (risk of blast radius).
- Scaling a single process can be inefficient if different parts have different demands.
- Can slow teams if the codebase grows and ownership is unclear.

### Microservices
**Pros**
- Independent deploys and release cadence per service.
- Teams can own services end-to-end (code + infra + data).
- Independent scaling tailored to each service’s needs.
- Fault isolation (a failure in one service can be contained).

**Cons**
- Operational complexity: many CI pipelines, infra, monitoring.
- Distributed systems problems: network latency, retries, partial failures.
- More expensive: more hosts/containers, more monitoring, more ops time.
- Data consistency becomes harder (eventual consistency, saga patterns).
- Debugging and tracing require instrumentation and tooling.
- More contracts to design and maintain (APIs + versioning).

---

## Costs to consider (beyond just money)

- **Engineering time** — designing, implementing, testing cross-service contracts, and writing integration tests.
- **DevOps / SRE time** — building pipelines, setting up orchestration, autoscaling, monitoring, runbooks.
- **Infrastructure costs** — more instances/containers, load balancers, message brokers, managed DBs.
- **Observability tooling** — distributed tracing, centralized logs, metrics & alerts.
- **Hiring & staffing** — need or desire for SRE, platform engineers, or senior engineers who can own distributed systems.
- **Cognitive load** — more concepts to train new hires on (eventual consistency, service meshes, retries/backoff strategies).

---

## Team size & practical guidance

- **Solo developer – 3 people:** Monolith or modular monolith. Simplicity and speed matter.
- **~4–10 people:** Modular monolith is still preferable in most cases. Start modular; extract only when a boundary stabilizes.
- **>10 people or multiple cross-functional product teams:** Consider microservices if organizational boundaries exist and you can support the operational overhead.

*Important:* team structure often drives architecture. If you have independent teams with separate owners and SLAs, microservices may make sense. If everyone pairs on the same features, a monolith is faster.

---

## What a modular monolith looks like (concrete)

A modular monolith is built as a single deployable app but split into modules following bounded contexts. Each module:

- Has a clear responsibility (e.g., Billing, Users, Orders).
- Exposes a clear internal API/interface.
- Owns its models and business logic.
- Minimizes direct access to other modules’ internals.

### Example folder layout (server-side)
```text
/src
  /modules
    /users
      /models
      /services
      /api    # controllers / handlers
      index.ts
    /orders
      /models
      /services
      /api
      index.ts
    /billing
      ...
  /shared
    /database
    /auth
    /logger
  /infrastructure
    /jobs
    /background
  app.ts
```

### Communication patterns inside a modular monolith
- Synchronous internal method/API calls between modules (function calls or module interfaces).
- In-process event bus for decoupling (publish/subscribe in-memory).
- Explicit boundaries enforced by code (no direct DB table access from outside the owning module).

**Goal:** keep modules logically separated so extracting them later is easier.

---

## Testing & CI for modular monoliths

- Unit tests per module.
- Integration tests that exercise module interactions.
- Contract tests if you plan to extract a module later (define its API expectations).
- Single CI pipeline with module-aware steps:
  - Run unit tests for changed modules only.
  - Run full integration test suite on main branch or PRs that touch multiple modules.
- Keep migration tests (if extracting DB) to ensure data integrity during extraction.

---

## Data and transactions

- **Monolith:** ACID transactions are easy — same DB, same transaction boundary.
- **Microservices:** distributed transactions are hard. Typical solutions:
  - Eventual consistency with compensating actions (sagas).
  - Domain events and event-driven propagation.
  - Using orchestration or choreography patterns.

Plan early for how data will be owned and migrated if you extract modules later.

---

## Migration strategy: how to go from modular monolith → microservices

1. **Design modularly up front** — well-defined modules, public APIs, and tests.
2. **Measure pain points** — slow deploys, test/compile times, team bottlenecks, or scaling issues.
3. **Pick a candidate module** — choose a module with stable boundaries and low coupling.
4. **Extract its API** — make sure the module already has an explicit API and tests.
5. **Separate the datastore (if needed)** — migrate data ownership carefully with an anti-corruption layer.
6. **Create independent CI/CD** for the extracted service.
7. **Introduce monitoring & tracing** for the new service (from the first deploy).
8. **Iterate** — repeat for other modules only when the benefit is clear.

---

## Decision checklist (use this before picking microservices)

- Is the product direction stable or still exploring fundamental features?
- Are domain boundaries well-understood and unlikely to change soon?
- Are there multiple teams that need independent release cadence?
- Do you have (or can you hire) devops/sre expertise to operate distributed systems?
- Are you hitting scaling issues that cannot be solved by vertical scaling or caching?
- Can you afford the extra infra and operational cost?

If you answer “no” to most of these, default to a modular monolith.

---

## Metrics to watch (to justify extraction later)

- Deploy frequency and failure rate
- Lead time for changes (how long it takes to get a change into prod)
- Mean time to recovery (MTTR)
- Code churn in specific modules (hotspots)
- Service latency and resource usage per module
- Team blocking/queueing (e.g., PRs waiting on a single owner)

These metrics tell you whether architecture is the bottleneck or whether process/product issues are to blame.

---

## Common anti-patterns & pitfalls

- **Premature microservices:** splitting before you understand the domain.
- **Monolith without modularity:** single repo with no structure; prevents later extraction.
- **One DB shared by multiple microservices with direct table access** (creates coupling).
- **No observability from the start** — debugging distributed systems without tracing and logs is painful.
- **Extracting services too early** — leads to churn and high maintenance cost.

---

## Example scenarios

- **Small startup (5 people building MVP):** Modular monolith. One deploy, low cost, fast iteration.
- **E-commerce at scale with many teams:** Microservices for checkout, catalog, inventory, and payments, if you have the ops and engineering muscle.
- **SaaS with uncertain product-market fit:** Modular monolith until product-market fit; extract after you know which modules are stable and high-load.

---

## Diagrams (ASCII)

**Modular Monolith**
```text
+----------------------------------------+
| App (single deploy)                    |
|  +--------+  +--------+  +--------+    |
|  | Users  |  | Orders |  | Billing|    |
|  | Module |  | Module |  | Module |    |
|  +--------+  +--------+  +--------+    |
+----------------------------------------+
```

**Microservices**
```text
+--------+   +--------+   +--------+
| Users  |   | Orders |   | Billing|
| Service|   | Service|   | Service|
+--------+   +--------+   +--------+
   |            |            |
   +---- API / Messaging ----+
```

---

## Practical checklist to implement a modular monolith today

1. Define modules (bounded contexts) and responsibilities.
2. Enforce module boundaries in code (no cross-module internal access).
3. Create public interfaces / APIs for each module.
4. Add module-level unit tests + cross-module integration tests.
5. Implement an in-process event bus for decoupling.
6. Keep a single CI pipeline with module-aware steps.
7. Add logging, metrics, and basic tracing from day one.
8. Document APIs and expected contracts (helps future extraction).

---

## Closing thoughts

Microservices are not inherently “better” — they’re a different trade-off. For small teams and early-stage products, the fastest path to learning and validating product assumptions is typically a **well-structured modular monolith**. Build modularly, measure, and extract only when the cost-benefit is clear.
