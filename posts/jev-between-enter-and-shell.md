---
title: "I put Jev between my Enter key and my shell"
description: "Five things I got wrong about System One models while building a CLI gatekeeper, and the one that surprised me most."
date: 2026-09-22
tags: [jev, typesafe, rust, shell, latency]
---

TypeSafe released Jev on September 16th and my timeline turned into agent
demos. Browser agents. Terminal agents. Agents that click things at
near-instant speed for a tenth of a cent.

Kyle Jeong from Browserbase — who built one of the good ones — [published a
piece today](https://x.com/kylejeong/status/2102108924677927169) with
the blunt version: _Jev wasn't built to make agents_. That matches what I
found, and I want to add the evidence from the other direction. I spent a weekend putting Jev
somewhere an agent could never go: in front of every command I type.

The thing is called YOLO-Shell. It sits between the Enter key and Zsh, reads
the command, and decides whether to get out of the way, ask, or refuse.

```console
$ rm -rf /

⛔ YOLO-Shell blocked  risk 10/10  rm -rf /
   recursive delete of the filesystem root or home directory
   override: prefix the command with `yolo `
```

Nothing about that is an agent. There's no loop, no plan, no tool calls. It's
a function: command in, decision out, at a latency where I won't notice it.
That's the shape Jev is actually for, and building it broke five assumptions
I had picked up from reading about the model instead of using it.

## 1. I assumed inference was the slow part

Jev's whole pitch is speed. TypeSafe's benchmarks say 20–200× faster than
LLMs; the sample response in Kyle's article reports an `evaluation_time_ms` of 163. My budget was a hard 200ms, and I figured that was the tight part.

It wasn't close. My first working version took roughly 850ms per command.

The shell hook spawns a fresh `yolo` process for every command you type, and a
fresh process has no connection to anything. So every command paid a DNS
lookup, a TCP handshake and a TLS negotiation before the request went out.
Against `us-west-2` I measured about 455ms of setup wrapped around about 350ms
of actual inference. The model was comfortably the fastest component in a
request that was mostly not the model.

The fix was a small daemon that holds one warm connection and answers over a
unix socket. Same model, same endpoint, same question:

|                | per command |
| -------------- | ----------- |
| without daemon | ~850ms      |
| with daemon    | ~400ms      |

Still over budget, and honestly the remaining 400ms is geography — one round
trip to Oregon and back, from a machine that is roughly 220ms away from it. No
amount of local engineering fixes that. A closer region would.

The lesson generalises past my toy. When a model answers in 163ms, your own
plumbing becomes the dominant cost, and plumbing is not what anyone is
benchmarking. If you're pasting a Jev call into an existing service, you have
probably already spent your entire latency win on connection setup and don't
know it yet.

## 2. I assumed typed output meant I could stop writing prompts

This is the seductive one. You define a `score` question with ten ordered
levels, you get back a number from 0 to 9, no parsing, no "respond only with
JSON, I mean it this time." It feels like the prompt went away.

The prompt didn't go away. It moved into `criteria`, and it got _stricter_,
because now the wording has to carry the whole decision boundary.

My first risk rubric named example commands at each level. Reasonable, and
wrong. Naming examples turns the question into "which of these is this most
like?", so Jev picks a nearest match — and since the `score` answer hands back
the matching level as a legend string, the banner ends up quoting a command the
user never typed.

Rewriting the levels to describe _blast radius and reversibility_ instead of
example commands fixed it:

```rust
const RISK_RUBRIC: &[&str] = &[
    "Reads or displays information. Changes nothing.",
    "Creates or edits files that are disposable or regenerated on demand.",
    "Changes local state that version control or a rebuild restores.",
    "Deletes or overwrites local work that is not backed up elsewhere.",
    // ...
    "Destroys production data, infrastructure, or history. Recovery depends on backups.",
    "Irreversible destruction at scale: a filesystem, a device, or a production \
     datastore with no recovery path.",
];
```

A level has to describe a property a command can _have_, not a command it can
_resemble_. That's a prompt engineering lesson wearing a type signature.

## 3. I assumed three questions in one pass gave me one decision

Here's the one that actually surprised me, and I haven't seen anyone write
about it.

I ask Jev three things at once — a `noul` for "is this destructive", a `score`
for the 1–10 risk band, a `choice` for allow/warn/block. One request, one
round trip. That parallelism is exactly why Jev is fast: it isn't generating a
sequence, so the answers don't depend on each other.

They _really_ don't depend on each other. Nothing makes question two agree
with question three. A severe risk score can come back sitting next to a
permissive action, because each answer is evaluated against the state on its
own and neither knows what the other said.

So the reconciliation is my job, in ordinary Rust:

```rust
Ok(Decision {
    is_destructive: noul > 0.5,
    risk_score,
    // The questions are answered independently, so a severe score can
    // come back beside a permissive action. The bands are part of the
    // schema, so hold the action to them. Tightens, never loosens.
    action: action.max(band_action(risk_score)),
    reason,
})
```

That's not a flaw in the model. It's the trade the architecture makes — you
buy parallel speed and you give up the internal consistency an autoregressive
model gets for free, because a token stream can see what it just said. If you
ask Jev one question, this never comes up. Ask it three that logically
constrain each other and you own the constraint.

## 4. I assumed calibration meant authority

Jev scored `git push --force origin main` at 7 out of 10. My local rule table
scored it 9.

Seven means "warn and confirm." Nine means "block." So a live Jev answer was
quietly downgrading the one command my spec most explicitly says to refuse.

The model isn't wrong, exactly. Reasonable engineers disagree about whether
force-pushing a protected branch is a hard stop or a scary prompt. But _I_ had
already decided. The 8-and-above cutoff is a policy I wrote down, not a fact
about the world, and a calibrated probability has no opinion about my policy.

So the model doesn't get to cross that line. Local rules can raise a Jev score
into the severe band; Jev can't lower one out of it:

```rust
/// Hold a Jev decision to the local engine's severe rules.
/// [...]
/// Jev stays free to relax anything below the severe band - that is where its
/// judgement earns its keep, as with `rm -rf ./build`, which a rebuild restores.
pub fn apply_severe_floor(outcome: Outcome, context: &Context) -> Outcome {
```

The asymmetry is the whole design. Below 8, Jev keeps full authority, and that
band is where it earns its keep. My rule table flags `rm -rf ./build` at 5
purely because it pattern-matches `rm -rf`; a build directory comes back with a
rebuild, so a lower score is the better answer and Jev is free to give one.
Above 8, deterministic code wins and the override gets logged.

"Calibrated" means the model is honest about its own uncertainty. It does not
mean the model shares your risk tolerance.

## 5. I assumed the model would fix my false positives

It did fix one I'd never have caught. With `NODE_ENV=production` set, Jev
scored `rails db:drop` at 8. My rule table scored it **1** — I simply hadn't
written an ORM rule, so offline, the database went without a prompt. I'd been
staring at that table all weekend and never saw the hole. The model found it
in one call.

But my _worst_ false positive had nothing to do with Jev:

```console
$ yolo explain 'grep -r "DROP TABLE" migrations/'
  risk        8/10
  action      BlockCompletely
  reason      drops a database object
```

My own regex couldn't tell the difference between a command that _does_
something and a command that _mentions_ it. Search your migrations for a drop
statement, get blocked at 8/10. Write `git commit -m "fix rm -rf bug in deploy
script"`, and the message about deleting things is scored as deleting things —
5/10, stop and confirm, on a commit. That's the behaviour that gets a tool
uninstalled on day one, and no amount of model would have saved me, because
those commands never reach the model. They're scored locally the moment Jev
times out or the plane takes off.

The fix was more deterministic code, not less: a sorted allowlist of programs
whose quoted arguments are _data_, and a pass that blanks those quotes before
scoring.

```rust
pub const DATA_ARG_COMMANDS: &[&str] = &[
    "ack", "awk", "column", "comm", "cut", "echo", "fgrep", "fold", "grep", "jq",
    "printf", "rev", "rg", "sed", "sort", "strings", "tee", "tr", "uniq",
];
```

Deliberately an allowlist. `psql -c`, `mysql -e` and `sh -c` are _not_ on it,
because those genuinely execute what you hand them:

```console
$ yolo explain 'zsh -c "rm -rf /"'
  risk        10/10
  action      BlockCompletely
```

And the allowlist has an honest cost I can demonstrate on demand. `ag` isn't in
the table, so:

```console
$ yolo explain 'ag "DROP TABLE" migrations/'
  risk        8/10
  action      BlockCompletely
  reason      drops a database object
```

A missing entry costs a false positive. A wrong entry costs a filesystem. I'll
take the annoying failure every time, and that choice is a line of Rust, not a
prompt.

## What it cost, and what it didn't

The part I keep coming back to: most of my commands never touch Jev at all.

A local allowlist filter catches `ls`, `cd`, `cat`, `git status` and friends
before anything else runs. On this machine it benchmarks at 175ns worst case
over 100,000 samples per case, and it's most of what I type all day. The
cheapest Jev call is the one you don't make — even at $42 per billion input
tokens with output billed at zero, per-keystroke inference is the wrong
instinct.

There's also a rule I'd put above all of the above: **the gatekeeper must fail
open.** If Jev times out, if the daemon is sick, if the regex engine fails to
compile, if the process panics — the command runs. The release profile sets
`panic = "abort"` specifically so a panic can never be caught and mistaken for
a block. A tool that locks you out of your own terminal is a worse bug than
the one it was preventing.

## So what is Jev for

Kyle's framing is the right one: Jev is for AI-powered software, not for
agents. But I'd sharpen it from where I ended up.

Jev is good at the judgement call you'd otherwise hard-code badly. My regex
knows `rm -rf` is dangerous and can't tell `./build` from `/`. Jev can, in
about 350ms, and then hands the answer back to deterministic code that decides
what to _do_ with it — including the right to overrule it.

That's the shape. Not "the model decides." Not "the rules decide." The rules
set the floor, the model moves within it, and every disagreement between them
is a bug report about one or the other. Half the fixes in this project came
from running both engines over the same corpus and reading the rows where they
disagreed. The model made my regex honest, and my regex kept the model in its
lane.

If you're reaching for Jev, don't start with the agent demo. Start with the
`if` statement in your codebase that you've always known was too dumb, and see
whether a few hundred milliseconds of calibrated judgement makes it
smarter. Mine was a regex that
thought `grep` was a database client.

---

_YOLO-Shell is Rust, MIT, one 2.4MB binary, and works with no API key at all —
it just falls back to the rule engine. [Source on
GitHub](https://github.com/riz007/yolo-shell)._
