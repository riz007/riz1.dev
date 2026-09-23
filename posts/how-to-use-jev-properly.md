---
title: "How to Use Jev Properly: Three Systems the Demos Skipped"
description: "A menu recommender, a telemedicine triage line, and a game referee, with working TypeScript, verified API details, and the decomposition result that explains why most Jev demos underperform."
date: 2026-09-23
tags: [jev, typesafe, system-one, typescript, architecture]
---

# How to Use Jev Properly: Three Systems the Demos Skipped

TypeSafe came out of stealth on September 15th with a $40M seed led by DCVC and
a model that doesn't write anything. Eight days later the catalogues have filled
up. [awesome-jev](https://github.com/yibie/awesome-jev) is past 300 entries.
Nineteen of them sit under Game & Simulation, and nearly all put Jev in the
player's seat: Mario, StarCraft, Pokémon Red, 2048, chess, Snake, drones in
MuJoCo. A couple judge puzzle answers or simulate an audience. Not one of them
is the referee for a game of its own.

Those demos answer two questions well. Is it fast? Yes. Will it stay inside a
schema? Yes, structurally. They don't touch the question you actually have,
which is _where in my product does this go, and how would I know it worked._

I've shipped one thing with it: a gatekeeper that sits between my Enter key and
Zsh and decides whether the command I just typed is about to ruin my day. Most
of what I learned came from the failures. This is the post I wanted to read
first: what Jev is exactly, the one published result that should change how you
call it, and three systems worked end to end in domains the ecosystem has
skipped entirely.

## What Jev actually is

It is not a fast LLM. It's a different shape of thing.

An LLM takes text and generates tokens one at a time, each one conditioned on
the last. Jev takes a **state** and a map of **typed questions**, evaluates every
question against that state in a single parallel pass, and returns numbers. It
generates no text at all. TypeSafe describes it as a transformer trained on
synthetic data with what they call Reinforcement Learning for Calibrated
Decisions; the weights and architecture aren't published.

One endpoint:

```
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer $TYPESAFE_API_KEY
```

A fair number of write-ups have this as `/v1/decide`. It isn't. It's
`/v1/systemone`, and the current model is `jev-1.13.0` behind the `jev-latest`
alias.

Three question types, and the entire design follows from them:

| type     | you declare                           | you get back                                     |
| -------- | ------------------------------------- | ------------------------------------------------ |
| `noul`   | what `true` means, what `false` means | `noul`, a probability from 0 to 1                |
| `choice` | up to 255 labelled options            | `choice`, `probabilities`, `confidence`          |
| `score`  | 2–10 ordered levels                   | `score`, `legend`, `probabilities`, `confidence` |

The property that matters here isn't the speed. It's that **the set of allowed
answers is part of the request.** Hand `choice` six options and a seventh answer
isn't unlikely, it's unrepresentable. No JSON parsing, no schema retries, no
"respond only with one of the following, I mean it this time."

Be precise about what that buys you, because it's easy to oversell. The schema
constrains the output space, not the answer's correctness. Jev can still pick the
wrong one of your six options, misread the input, or hand back a judgement you
disagree with. What it cannot do is return a seventh option, or return prose
where you asked for an enum. That's a narrower guarantee than "it can't
hallucinate," and it's still worth a lot, because it's the class of failure that
usually needs retry logic and a parser.

One gotcha worth knowing before you design around it: **`noul` answers carry no
confidence field.** Only `choice` and `score` do. In the SDK's own types,
`NoulResponse` is just `{ type, noul }`. If your control flow routes on
confidence, your noul questions can't participate. You threshold the
probability itself and accept that 0.5 is ambiguous rather than uncertain.

Confidence, where it exists, is derived from the shape of the distribution
rather than being a second opinion. For N options it's
`(N · p_max − 1) / (N − 1)`: concentrated on one outcome means confident, spread
out means uncertain.

Now the part you should read before you set a single threshold. TypeSafe's whole
pitch is that these numbers are _calibrated_, trained for with something they
call Reinforcement Learning for Calibrated Decisions. Treat that as a claim, not
a property. They haven't published the method, a reward function, or a
reliability diagram, and two independent calibration checks found Jev poorly
calibrated out of the box: an expected calibration error of 0.107 out of
distribution, against a 0.024 noise floor. The direction of the error isn't even
consistent across question types, with `noul` running underconfident while
`choice` and `score` run overconfident. On one deliberately unanswerable task it
was 44.7% accurate while reporting an average probability of 0.74.

That doesn't make the numbers useless. It makes them numbers you have to fit
thresholds against on your own data, rather than constants you can lift from a
blog post. Including this one: every threshold below is a policy I chose, not a
calibrated cut-off, and you should expect to move them.

The published numbers, as of today: **$0.042 per million input tokens, output
free.** 64k tokens per request, of which 32k covers `state` plus your longest
question. 250,000 tokens/second and 1,200 requests/minute, adjusting during
early access. Errors are 401, 422, 429 and 529; back off on the last two.

TypeSafe's headline claim is 40–200× faster and 40–400× cheaper than frontier
LLMs, peaking at 193.6× and 444.6×. Read those with the company's own caveat
attached: the workflows were built by its model-capabilities team, and TypeSafe
says the figures likely sit at the high end of real-world results. The number I
find more useful is an outside one. Browserbase measured Stagehand's `Act`
median latency dropping from 1.97s to 0.46s after moving the decision to Jev.

## The one rule: decompose, then decide in code

The most useful published result about Jev isn't a speed benchmark.

[The Daily Brief](https://www.beri.net/article/typesafe-jev-typed-decision-model-calibration-decomposition-shadow-eval)
ran it over a 2,000-email phishing corpus and asked the obvious question
(_is this phishing?_) and got **62.6%** accuracy: 43.2% of the real
phishing caught, 18.0% of legitimate mail flagged. Claude Haiku 4.5, asked that
same single question, got 81.3%.

Then they restructured it. Five narrow questions instead of one broad one:
shortened URLs, free-mail domains claiming organisational affiliation, that kind
of thing. Those five signals fed a logistic regression trained on 1,000 labelled
examples and tested on the other 1,000. That pipeline scored **95.0%**.

Read the second number carefully, because it is not Jev's accuracy. It is Jev's
five signals, plus a thousand labelled emails, plus a classifier you fit and then
maintain. The study puts it bluntly: the 95% is not Jev, it is Jev plus your
labelled data plus a regression you maintain. The corpus matters too. PhishNChips
v5.2 has synthetic bodies and labels derived from URL reputation feeds rather
than human judgement, so the signal concentrates in senders and links.

Which is exactly why I find the number useful. The lesson isn't that Jev is
accurate. It's that the same model, on the same data, is worth 32 more points
when you stop asking it to be the classifier and start using it as a source of
signals you combine yourself. That's an architecture result, not a benchmark.

It also matches TypeSafe's own guidance: "Broad questions hide several judgments
behind one answer. Atomic questions expose those judgments so you can inspect,
tune, and combine them in code."

So here's the rule, and the rest of this post is just three applications of it:

> **Jev is not a classifier you call. It's a feature extractor you combine.**

Ask it many narrow things it can genuinely see. Get back typed numerical
signals. Make the decision in ordinary code you can unit-test. The architecture
is what makes this affordable: a dozen questions cost you one round trip, not
twelve, because they're evaluated in a single parallel pass rather than in
sequence.

In practice that's three layers, and keeping them straight is most of the job:

- **Facts** stay in deterministic code. Allergens, inventory, dates, arithmetic.
- **Judgement** goes to Jev. The fuzzy call you'd otherwise hard-code badly.
- **The decision** comes back to deterministic code, where you can test it.

All three builds below are applications of those three lines.

Which leads straight to the corollary that cost me the most debugging time:
**the answers do not constrain each other.** There's no token stream, so
question three has no idea what question two said. A `score` of 9 can come back
sitting beside a permissive `choice`, because each was evaluated against the
state alone. Reconciliation is your job, in your language, every time.

## Write criteria about properties, not examples

Before the builds, the one skill that actually separates a working Jev call from
a flaky one. Typed output feels like the prompt went away. It didn't. It moved
into `criteria`, and it got stricter, because now the wording has to carry the
entire decision boundary.

My first risk rubric for the shell gatekeeper named example commands at each
level. Reasonable, and wrong. Naming examples turns the question into "which of
these is this most like?", so you get a nearest-match rather than a judgement.
And since a `score` answer hands back the matching level as a `legend` string, my
banner started quoting commands the user never typed.

Rewriting the levels to describe **blast radius and reversibility** instead of
example commands fixed it:

```rust
const RISK_RUBRIC: &[&str] = &[
    "Reads or displays information. Changes nothing.",
    "Creates or edits files that are disposable or regenerated on demand.",
    "Changes local state that version control or a rebuild restores.",
    "Deletes or overwrites local work that is not backed up elsewhere.",
    // ...
    "Irreversible destruction at scale: a filesystem, a device, or a production \
     datastore with no recovery path.",
];
```

A level has to describe a property the thing can _have_, not a thing it can
_resemble_. That's prompt engineering wearing a type signature, and it applies
to all three of the builds below.

## Build one: a menu recommender

I couldn't find a food or restaurant project in either catalogue, which is
strange, because it's close to an ideal fit: a finite authored option set, genuinely fuzzy
human input, and a decision that has to feel instant.

Here's the version you'd write first, and why it fails:

```ts
// Don't do this.
const res = await client.systemOne({
  state: {
    menu,
    request: "something light, not too spicy, dairy-free, 25 min",
  },
  questions: {
    dish: choice("Which dish should they order?", menuAsCriteria), // 60 options
  },
});
```

One broad question over sixty options. It will return something plausible, and
it has three problems. You can't debug it. When it recommends badly there's no
signal to inspect, just a distribution over sixty labels. It puts **allergens**
in the hands of a probabilistic model. And it wastes your own database, where
prep time and availability are already facts.

Facts in code, judgement in Jev, decision in code.

**Step one, filter deterministically.** Dairy-free is a join, not an opinion.
This matters more than it looks: the jaggedness notes for `jev-1.13` say the
model "answers the question you wrote, not the one you meant," reading scoping
words and negations literally. "Contains no dairy" is exactly the phrasing you
don't want adjudicated probabilistically when the downside is anaphylaxis.

```ts
// Allergens, availability and prep time are facts. The model gets no vote here.
const eligible = menu.filter(
  (d) =>
    d.available &&
    d.prepMinutes <= party.timeBudget &&
    !d.allergens.some((a) => party.avoid.includes(a)),
);
```

**Step two, ask Jev only what code can't see.** The instinct is one request per
dish. Don't. Jev evaluates one state, so put the whole shortlist in state and
ask a `choice` question per _axis_ instead of per dish. One round trip, and the
`probabilities` map becomes a soft score for every candidate on every axis:

```ts
import { TypeSafeClient, choice, noul, score } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const shortlist = eligible.slice(0, 8);

const candidates = Object.fromEntries(
  shortlist.map((d) => [d.id, `${d.name}: ${d.description}`]),
);

const { answers } = await client.systemOne({
  state: {
    diner: {
      said: party.note,
      previously_ordered: party.history,
      time_budget_minutes: party.timeBudget,
    },
    candidates: shortlist.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      richness: d.richness,
      heat_level: d.heatLevel,
    })),
  },
  questions: {
    appetite: choice(
      "Which candidate best matches the appetite the diner described?",
      candidates,
    ),
    heat: choice(
      "Which candidate best matches the spice tolerance they described?",
      candidates,
    ),
    adventure: choice(
      "Which candidate is most unlike what they have ordered before?",
      candidates,
    ),
    celebrating: noul("Is the diner describing a celebration?", {
      true: "They mention an occasion, a milestone, or treating someone.",
      false: "No occasion is mentioned, or it reads as a routine meal.",
    }),
  },
});
```

Using the full distribution rather than just `answers.appetite.choice` is the
part most demos skip, and it's what TypeSafe's own docs suggest when they
recommend treating probabilities as features. Now the ranking is yours:

```ts
const celebrating = answers.celebrating.noul > 0.6;

const W = { appetite: 0.5, heat: 0.3, adventure: celebrating ? 0.4 : 0.2 };

const ranked = shortlist
  .map((d) => ({
    dish: d,
    fit:
      W.appetite * answers.appetite.probabilities[d.id] +
      W.heat * answers.heat.probabilities[d.id] +
      W.adventure * answers.adventure.probabilities[d.id],
  }))
  .sort((a, b) => b.fit - a.fit);
```

Those weights are a policy you wrote down, not a fact about the world, and
keeping them in TypeScript means you can change them on a Tuesday without
touching a model.

Last piece, and it's a UI decision rather than a modelling one:

```ts
// The honest interface for an uncertain model is a shortlist, not a pick.
const confident = answers.appetite.confidence >= 0.4;
return confident ? ranked.slice(0, 1) : ranked.slice(0, 3);
```

Cost, from published pricing: a shortlist of eight plus the diner's note runs
around 1,200 input tokens, so 1,200 × $0.042/M ≈ **$0.00005 a diner, about five
cents per thousand.** Output is free, so the four questions are free.

## Build two: a telemedicine triage line

I couldn't find this one in either catalogue either, and I suspect the reason is
that it's where being wrong is worst. Which makes it the best place to show the discipline.

Scope first, and it isn't negotiable: **Jev routes, it does not diagnose.** The
output is which queue and how fast, never what's wrong. Anything past routing
starts moving toward clinical decision support, which depending on your
jurisdiction, your intended use and the claims you make around it may bring
regulatory obligations you hadn't planned for. And you'd be building it on a
model whose own documentation says it struggles with indirection.

Decompose into red flags. Each one is a narrow, independently inspectable `noul`
about what the patient _described_, not about what they have:

```ts
const RED_FLAGS = {
  chest_pain_radiating: noul(
    "Does the patient describe chest pain or pressure spreading to the arm, jaw, neck or back?",
    {
      true: "Pain or pressure in the chest that moves or extends beyond it.",
      false:
        "No chest pain, or pain that stays localised and sharp on movement.",
    },
  ),
  sudden_unilateral_weakness: noul(
    "Does the patient describe weakness, numbness or drooping that started suddenly on one side?",
    {
      true: "Sudden onset, affecting one side of the face or body.",
      false: "Gradual onset, or affecting both sides equally.",
    },
  ),
  breathlessness_at_rest: noul(
    "Does the patient describe difficulty breathing while sitting or lying still?",
    {
      true: "Breathlessness present without exertion.",
      false: "Breathlessness only on exertion, or none described.",
    },
  ),
  // ...
};
```

Now the part that follows directly from question independence, and it's the
single most important line in this post:

**Never average red flags.** Averaging is the instinct, and it dilutes a true
positive into nothing. Six flags where one reads 0.82 and five read near zero
average to 0.14. One genuinely concerning signal gets rounded down to routine by
five that simply didn't apply, which is the exact failure mode you cannot afford
in high-stakes routing.

Red flags OR-gate, at a deliberately low threshold, because the costs are
asymmetric: an unnecessary escalation consumes clinical time, and a missed one
can cost a great deal more than that.

```ts
const ESCALATE_AT = 0.35; // Deliberately low. The two errors are not equal.

type Flag = keyof typeof RED_FLAGS;

const tripped = (Object.keys(RED_FLAGS) as Flag[]).filter(
  (k) => answers[k].noul >= ESCALATE_AT,
);

if (tripped.length > 0) {
  return { queue: "urgent_clinician", within: "15m", because: tripped };
}
```

The cast on `Object.keys` isn't decoration. `answers` is keyed by your question
names, so under `strict` a plain `string` can't index it, which is the type
system doing its job, and worth keeping rather than reaching for `any`.

`because: tripped` matters as much as the threshold. The clinician sees which
flags fired, not a score out of ten. That's the difference between a tool people
use and one they switch off in week two.

Three more rules this domain forces, all of which generalise:

**Never let Jev do arithmetic or dates.** The docs are unusually direct here:
"Jev is not a calculator," it "recognizes the shape of an answer rather than
tallying, and the error grows with the size of the thing being counted," and it
"reads dates as text, not as ordered quantities." So durations, ages and dose
intervals get computed in code and handed over as structured fields, and never
spliced into the question string, which the docs call out as an anti-pattern:

```ts
state: {
  patient: {
    age_years: 63,                  // computed in code
    symptom_duration_hours: 26,     // computed in code
    active_conditions: ["type_2_diabetes", "hypertension"],
  },
  message: raw,                     // untrusted free text, clearly fenced
}
```

**Patient text is untrusted input.** The jaggedness page states plainly that Jev
"does not treat it as hostile by default," so an instruction embedded in a
message can land. The free text goes in one clearly labelled field, and the final
routing is floored by deterministic rules. This is the same structure I ended up
with in the shell gatekeeper: the model may raise urgency, never lower it past
what the rules already decided.

```ts
// Jev is free to escalate. It is never allowed to de-escalate below the floor.
return { ...routing, urgency: Math.max(routing.urgency, ruleFloor(patient)) };
```

**Low confidence goes to a human, not to a guess.** TypeSafe's own guidance is
above 0.9 for high-stakes automation and below 0.5 to a person. In triage
"unsure" is a safe and legitimate answer; guessing is not.

To be unambiguous about what this is: a routing aid that needs clinical sign-off
and, depending on where you operate, regulatory review. It shortens the queue. It
does not own the decision.

## Build three: the game referee

This is the gap I found most interesting, because inverting the demos turns out
to produce the best fit of the three.

I went through all nineteen Game & Simulation entries in awesome-jev and the
games section of HackerNoon's 101-examples roundup. Almost all of them drive an
existing title through an emulator or a simulator. It's impressive engineering
that tells you nothing about shipping a game of your own.

So don't make Jev the player. **Make Jev the referee.**

The mechanic: the player types whatever they want. Not a verb list, not
`> use oil on lock`. Sentences.

```
> pour the lamp oil into the frozen lock and light it
```

For a game designer this has always been the impossible input. You cannot regex
intent. Text adventures have traditionally solved this by shrinking the player's
vocabulary until parsing becomes tractable, which is exactly why the genre can
feel like guessing a password.

Three reasons Jev is specifically the right tool, rather than a smaller LLM:

**The outcomes are authored.** A room has, say, six things that can happen.
`choice` over six labelled outcomes means the referee cannot return a seventh,
and cannot hand back an item the game doesn't contain. Not because the prompt
asked nicely, but because the option set is the type. It can still pick the wrong
one of your six, which is a bug you find in playtesting. It will never invent a
lockpick you never wrote, which is a bug you'd find in production.

**The latency budget is a feel budget.** Roughly 100–300ms reads as responsive;
two seconds breaks the spell completely. Jev's published range is 70–500ms, and
Browserbase's measured 0.46s median on a harder task suggests the low end is
reachable.

**Turns are cheap and there are thousands of them.** At ~800 input tokens per
turn, a 40-turn session costs 32,000 × $0.042/M ≈ $0.0013, about **$1.34 per
thousand sessions.**

The room is data:

```ts
const OUTCOMES = {
  lock_melts: "Sustained heat is applied directly to the frozen lock.",
  lock_freezes_harder: "Water, snow or something cold is applied to the lock.",
  oil_wasted: "The lamp oil is used somewhere it accomplishes nothing.",
  hurts_self: "The action would burn or injure the player.",
  nothing_happens: "The action is legal in this world but has no effect here.",
  not_in_world:
    "The action refers to objects or abilities this world does not contain.",
};

type Outcome = keyof typeof OUTCOMES;

const REQUIRES: Partial<Record<Outcome, string[]>> = {
  lock_melts: ["lamp_oil", "flint"],
  oil_wasted: ["lamp_oil"],
};

const room = {
  description: "A vault door sealed under a finger's depth of ice.",
  visible: ["frozen_lock", "iron_brazier", "frost_rimed_hinges"],
};
```

Two of those outcomes are doing quiet work. `nothing_happens` and `not_in_world`
are the escape hatches. TypeSafe's docs recommend giving `choice` questions
explicit boundary and none-of-these options, and in a game they're free, because
both are perfectly good narration.

```ts
const { answers } = await client.systemOne({
  state: {
    room: { description: room.description, visible: room.visible },
    player: { inventory: player.inventory, said: input },
  },
  questions: {
    outcome: choice(
      "Which authored outcome does the player's action produce?",
      OUTCOMES,
    ),
    inventiveness: score(
      "How inventive is this action, given what the room offers?",
      [
        "Repeats an action already tried in this room.",
        "The obvious action the room signposts.",
        "A reasonable action the room permits but does not hint at.",
        "Combines two objects in a way the room never suggests.",
        "Solves the room by a route the designer did not anticipate.",
      ],
    ),
    breaking_fiction: noul(
      "Is the player addressing the narrator or trying to step outside the fiction?",
      {
        true: "Speaks to the system, asks for hints, or references being in a game.",
        false: "Acts as a character inside the world.",
      },
    ),
  },
});
```

And then the reconciliation, which is this whole post in one function. Jev can
return `lock_melts` while the player is carrying no oil, because the outcome
question and the inventory are unrelated: one is a judgement and the other is a
fact. So the fact wins.

```ts
const outcome = answers.outcome.choice; // typed Outcome, never a seventh value
const required = REQUIRES[outcome] ?? [];

// Possession is a fact. Jev never gets a vote on the inventory.
const canDo = required.every((item) => player.inventory.includes(item));
if (!canDo) return narrate("you_reach_for_what_you_do_not_have", { required });
```

`answers.outcome.choice` comes back typed as `Outcome`, not `string`, so it
indexes `REQUIRES` directly and a typo in an outcome name is a compile error
rather than a silent `undefined` at 2am.

Here's the part I think makes games genuinely underrated as a place to _learn_
this model rather than just show it off. Low confidence has a diegetic fallback.
In most products an uncertain model is a UX problem: a spinner, a disclaimer, a
"did you mean." In a game, uncertainty is already a sentence:

```ts
if (answers.outcome.confidence < 0.45) {
  return narrate(
    "You turn the idea over and can't quite see how it would work.",
  );
}
```

The player reads character. You read the model's own uncertainty. It's the only
domain I've found where surfacing that uncertainty costs you nothing.

## Where it will bite you

TypeSafe publishes a jaggedness page for `jev-1.13`, which is more candour than
most model cards manage. Worth reading in full; the parts that changed my designs:

| limitation                                                | what it means for your code                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| "Jev is not a calculator"                                 | error grows with the size of the thing counted. Compute in code.       |
| Dates read as text, not ordered quantities                | never ask it to compare or subtract dates.                             |
| Literal reading of scoping words and negations            | double negatives and implied conditions degrade. Write positives.      |
| `score` has weak numerical calibration                    | treat levels as ordinal bands, not magnitudes. Don't interpolate.      |
| `P(noul)` vs `1 − P(not noul)` aren't directly comparable | don't build invariants on the two agreeing.                            |
| Accuracy falls as `state` grows with irrelevant content   | trim state per question set. Context rot is real and measurable.       |
| Adversarial content isn't treated as hostile by default   | fence untrusted text, floor the decision with rules.                   |
| Contradictory criteria degrade the answer                 | conflicting `instructions` and `criteria` make it worse, not cautious. |

Two things that table doesn't cover, both from further up: the confidence numbers
need thresholds fitted against your own data rather than copied from anyone, and
the questions inside a single request place no constraint on each other.

And one that isn't in any doc, from my own build: **latency is mostly not the
model.** My first working gatekeeper took ~850ms per command. The model was
~350ms of that. The rest was DNS, TCP and TLS, paid fresh on every single
invocation, because a shell hook spawns a new process per command and a new
process has no connection to anything. A tiny daemon holding one warm connection
took it to ~400ms, and the remainder was geography: one round trip to Oregon
from a machine 220ms away.

When a model answers in 150ms, your own plumbing becomes the dominant cost, and
nobody benchmarks plumbing. If you're dropping a Jev call into an existing
service, verify you're reusing connections before you believe any latency win.

## How to know whether it worked

Shadow eval, and it's almost free. Run Jev against decisions you already have
ground truth for, in parallel with the system you already trust, changing
nothing. The phishing study's full run, 5,721 calls, cost **$0.176** at list
price.

At that price there's no excuse for shipping on vibes. Take last quarter's
tickets, triage decisions or orders, replay them, and plot confidence against
accuracy to find _your_ thresholds instead of copying the ones in this post. Mine
are policies I wrote down, not properties of the world.

The honest counterpoint, from a commenter on that same study: a LoRA fine-tune of
Qwen3-4B reached 97.4% on the identical task with better calibration (0.010
error) in eighteen minutes on consumer hardware. If your task is fixed and you
have labels, a small fine-tune may well beat Jev outright. Jev's real advantage
is that you can change the question, rewriting criteria, adding a level or
swapping an option set, without retraining anything. That's worth a lot in a product still
finding its shape and very little in a pipeline that settled a year ago.

## The shape of it

Kyle at Browserbase put it bluntly: "Jev is not very good as a standalone
agent." I'd state the same thing as a positive.

Jev is good at one thing, and it's a thing that turns out to be everywhere: the
judgement call you'd otherwise hard-code badly. My shell's regex knew `rm -rf`
was dangerous and couldn't tell `./build` from `/`. A menu filter knows dairy
from no-dairy and can't tell "something light" from "I'm starving." A parser
knows the word _oil_ and can't tell pouring it from lighting it.

Those gaps are small, they're everywhere, and until last week the only options
were a bad heuristic or a two-second model call. There's now a third.

The pattern that survived all three builds is the same one: **the rules set the
floor, the model moves inside it, and every disagreement between them is a bug
report about one or the other.** Half my fixes came from running both engines
over the same corpus and reading only the rows where they disagreed. The model
made my rules honest. My rules kept the model in its lane.

So don't start with the agent demo. Find the `if` statement you've always known
was too dumb, write down the three narrow questions that would make it smarter,
and keep the verdict in your own code.

---

**Sources.** TypeSafe's [API reference](https://docs.typesafe.ai/api),
[models and limits](https://docs.typesafe.ai/models),
[building with System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one),
[confidence](https://docs.typesafe.ai/confidence) and the
[jev-1.13 jaggedness notes](https://docs.typesafe.ai/model-jaggedness/jev-1.13);
the [JS SDK types](https://github.com/typesafe-ai/typesafe-sdk-js);
Kyle Jeong's [What is Jev](https://www.browserbase.com/blog/what-is-jev) at
Browserbase; the phishing decomposition study at
[The Daily Brief](https://www.beri.net/article/typesafe-jev-typed-decision-model-calibration-decomposition-shadow-eval);
and [awesome-jev](https://github.com/yibie/awesome-jev) for the ecosystem survey.
Figures cited as TypeSafe's own are self-reported and not independently
reproduced.

_The shell gatekeeper is Rust, MIT, one 2.4MB binary, and works with no API key
at all. It falls back to a rule engine. [Source on
GitHub](https://github.com/riz007/yolo-shell)._
