---
title: "Cognitive Debt: The Hidden Cost of the Agentic SDLC"
date: 2026-09-18
description: "Code is no longer the bottleneck. Understanding is. What agentic development actually costs a small team, why review load is the thing that burns people out, and how much AI you should really be using."
tags:
  [
    "Cognitive Debt",
    "Agentic SDLC",
    "AI Engineering",
    "Engineering Leadership",
    "Burnout",
  ]
---

# Cognitive Debt: The Hidden Cost of the Agentic SDLC

"Code is no longer the bottleneck." It's probably the most widely spoken sentence of the agentic SDLC era. Anthropic even released [The AI-native SDLC playbook](https://academy.claude.com/courses/ai-native-sdlc-playbook/introduction), which is free and genuinely worth reading.

The question is, how many of us are actually adopting it? And I'm not talking about large corporations here. I'm talking about small startups with three or four developers and very limited resources. That's where I keep coming back to the same worry: what's the cognitive debt we're taking on? The hidden risk in AI-driven development, in code reviews nobody really reads, and in plain FOMO.

Let me be clear about where I stand, because this argument gets misread in both directions. I'm not anti-AI and I'm not anti-agentic-SDLC. I use this stuff every day and I'd be slower without it. What I'm against is AI slop, and the unnecessary cognitive load that comes with it — the kind that quietly breaks a four-person team. A large company can absorb that load. A startup with three developers cannot.

So how much AI should we adopt, and how much should we stay human about it? That's what this post is about.

## What cognitive debt means

You already know technical debt. You take a shortcut in the code, you know it's a shortcut, and you pay for it later when you have to change it.

Cognitive debt is different. The code might be completely fine. What's missing is anyone on your team who can explain why it's fine.

It builds up in moments that look perfectly reasonable at the time:

- The code worked on the first run, so nobody read it properly.
- The diff was too big and looked too plausible to argue with, so it got approved.
- A design decision came out of a prompt instead of a discussion, so nobody owns it and nobody wrote down why.
- A dependency got added because the model suggested it, and nobody asked what it costs.

None of these is a disaster on its own. But you're borrowing against how well your team understands its own software, and that bill arrives at the worst possible time. An incident at 2am. A security question from a customer. A migration through code your team owns on paper but has never actually read.

The nasty part is that you can't see it. Technical debt shows up eventually, in a linter, in how long a change takes. Cognitive debt shows up in nothing. Your codebase looks healthy right until somebody has to reason about it under pressure.

I should say the term isn't mine. An MIT Media Lab group used "cognitive debt" in [a June 2025 paper](https://arxiv.org/abs/2506.08872) that put 54 people in front of an essay task with EEG caps on. The group using an LLM showed the weakest brain connectivity and the least ownership of what they'd written, and the effect lingered after the tool was taken away. It's a preprint, it's 54 people, and it's essay writing rather than code, so I wouldn't lean on it too hard. But the shape of the finding matches what I see in pull requests, and the name is too good not to borrow.

## The asymmetry nobody priced in

Here's the mechanism underneath all of this, and I think it's the whole ballgame.

Writing code got something like ten times cheaper in two years. Reading code, reviewing code, and understanding code got no cheaper at all. They cost exactly what they cost in 2019.

Everything else in this post falls out of that one gap. When generation gets cheap and verification doesn't, the bottleneck doesn't disappear. It moves. It lands on whoever has to say "yes, I understand this, ship it" — and on a small team that's the same two people every time.

The 2025 DORA report puts numbers on it. AI adoption now correlates positively with delivery throughput, so the speed is real. It also correlates with _higher instability_ — more change failures, more rework, longer recovery. Their read is that AI is exposing downstream bottlenecks in testing, review and QA that were never built for this pace. Around 30% of developers report little to no trust in AI-generated code, which means the time saved writing is being spent auditing instead.

DORA's own framing is the one I'd put on a wall: AI magnifies the strengths of high-performing organisations and the dysfunctions of struggling ones. It's an amplifier, not a multiplier. If your team has tests, a real review culture and a platform that tells you when you broke something, agentic tooling makes you meaningfully better. If it doesn't, the tool will just help you generate technical debt faster.

That's why I don't think "should we use AI" is the interesting question. The interesting question is whether the thing you're amplifying is worth amplifying.

## How this actually breaks a small team

This is the part I care about most, and it's where I think the conversation is thinnest.

Follow the load. One developer starts generating three times more code. That code doesn't review itself. So the review burden triples — but it lands on somebody else, and on a four-person team there is no somebody else. There's the same two people who were already at capacity.

Now watch what happens over a few months:

- Review becomes a rubber stamp, because the honest alternative is working until 9pm. The team's quality bar drops without anyone deciding to drop it.
- Instability rises, which DORA would predict, so more of the week goes to firefighting things nobody fully understands.
- The one person who does still understand the system becomes the bottleneck for everything, gets interrupted constantly, and stops shipping.
- That person burns out and leaves.

And here's the part that makes it a collapse rather than a setback: when they go, the understanding goes with them. Not the code — the code is in git. The _why_. Why the retry logic looks like that, which of those two services owns the write, what the weird conditional in billing is protecting against. A big company survives that because three other people half-know it. A four-person startup does not.

Burnout in this story isn't a wellbeing footnote. It's the failure mode. Cognitive debt is paid down by the most experienced person on the team, out of their evenings, until they stop.

## What didn't change

I deeply believe in team collaboration, and this is the part agentic tooling hasn't touched at all.

You can vibe code an app in a day. Making it something people pay for still takes human skills — understanding the customer, positioning, knowing which problem is actually worth solving. That's where your product and engineering people earn their keep, and none of it got automated.

If anything it matters more now. When everyone can generate a working prototype in an afternoon, the prototype isn't what makes you different anymore.

## What did change

The way we develop software.

Remember those days when you got stuck on a problem and you looked it up on Google or Stack Overflow? Then you'd either copy the solution and paste it (I don't recommend that), or you'd take a minute to understand why it worked.

Nowadays you ask the AI tool and it gives you the solution, or a good example. It doesn't just save development time, it makes you faster and more productive, so you can focus more on the product side of the software.

But notice what quietly disappeared. The old way was slow, and that slowness taught you something whether you wanted it or not. You had to read the thread, weigh the answers, adapt the code to your own. Now the answer arrives already fitted to your problem, and nothing forces you to understand it. That's the whole risk, in one line. The tool didn't get worse. The free education that used to come with it is gone, and nothing replaced it by default.

DORA has a name for what's missing: productive struggle. Skipping it is fine when you're working in a domain you already know cold. It's how you fail to ever know a new one.

Which lands hardest on juniors, and this is the bit I'd flag to any founder. A junior who has never debugged something the slow way doesn't develop the instinct that tells you a plan is subtly wrong before you've built it. That instinct is most of what seniority is. On a large team there's someone with spare capacity to backfill it. On a team of four, the senior who'd normally teach it is the same person already drowning in review.

## How much AI should you use?

Don't overuse AI. Don't blindly trust the output, and don't over output it.

If you do, you'll burn out, or you'll put everyone in a situation where they're scratching their heads trying to understand your AI generated garbage. Generate something useful, then review it. The review isn't a formality after the real work. The review is the real work. If you wouldn't merge that diff from a contractor you'd never met, don't merge it from a model either.

Over outputting is the one I see most. Volume feels like progress. A 2000 line pull request that nobody can hold in their head is worse than a 200 line one they can, even if both of them pass CI.

A few things that have actually helped, none of them clever:

- **Cap the diff, not the output.** Generate as much as you like. Ship it in pieces somebody can hold in their head.
- **The author explains it, not the tool.** If you can't walk through your own PR without the assistant open, it isn't ready. This costs about four minutes and catches a surprising amount.
- **Write the why in the PR, not the prompt.** Prompts are not documentation. They're gone next week and they weren't written for your teammates.
- **Spend the speed on tests, not features.** The saved time has to go somewhere. Putting it into the thing that closes the loop is how you stop the instability DORA is measuring.

And if you think you can still build it without AI, then minimize. Master that first, and find your use case for AI after. Fundamentals aren't nostalgia here. They're what lets you notice when the model's plan is subtly wrong.

Focus on the business impact. Nobody's paying you for lines of code. They never were.

## A test you can run this week

Cognitive debt is invisible, but it isn't unmeasurable. Here's the cheapest check I know.

Pick a pull request from the last two weeks at random. Ask whoever merged it to walk you through what it does and why it's built that way, with the assistant closed.

Watch what happens. Someone who understands it will tell you about the trade-off they made. Someone who doesn't will narrate the code back to you line by line.

Do that once a month with a random PR and you'll know your real number. If it goes badly, the fix isn't less AI. It's smaller diffs and an actual review.

I'd also watch how long PRs sit waiting for review. If that's climbing while your merge rate climbs too, you've found the bottleneck moving — and you've probably found the person about to burn out.

## When cognitive debt is worth it

I don't want to leave this sounding like every shortcut is a sin, because most of them aren't.

Take the debt deliberately when the code is genuinely disposable. The spike you're running to find out whether an approach works. The prototype for Friday's demo. The internal script three people will use twice. The migration you'll delete after it runs. In all of those, understanding is not the asset — the answer is, and paying full price for comprehension is waste.

The rule I use is simple enough: how expensive is it if nobody understands this in six months? For a throwaway script, free. For your auth flow, your billing logic, or anything holding customer data, that's the bill arriving at 2am.

Cognitive debt, like technical debt, is a legitimate instrument. What gets teams in trouble is taking it on by accident, at scale, across the whole codebase, and never writing down that they did.

## Software development is not dead

It just got more interesting.

The core infrastructure is still there. Full stack engineering is still there. System design, data modelling, security boundaries, knowing which trade off you're actually making. All still there, and worth more now that the mechanical part got cheap.

What changed is where your attention goes. Less on writing the code. More on deciding what should exist, checking that it does what you think it does, and keeping enough understanding inside the team that the software still belongs to you.

Take on cognitive debt when you need to. Just know that's what you're doing.
