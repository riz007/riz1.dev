---
title: "php2shell: What AI Actually Changed, and What It Didn't"
description: "The headline says AI found a 22-year-old bug in 2 days. Both numbers are wrong, and the real ones tell a better story about what just happened to PHP."
date: 2026-10-24
tags: ["AI Engineering", "Software Engineering", "Security"]
---

# php2shell: What AI Actually Changed, and What It Didn't

CNN ran it as "the biggest-ever internet security threat has been known for 22
years. AI made it a crisis in 2 days." That framing is everywhere this week,
and I understand why. It's a great sentence.

It's also wrong twice, and the two corrections are more interesting than the
headline. So let's go through what actually happened to PHP, where those
numbers came from, and the part of this story almost nobody is covering.

## What happened

On 21 October the PHP Foundation shipped an emergency out-of-band release for
two vulnerabilities, CVE-2026-109618 and CVE-2026-109619, nicknamed php2shell.
Both rated 9.2 on CVSS v4. Under the right conditions they let an attacker run
code on your web server and read whatever that server can read.

What followed was the kind of week you normally only read about in
retrospectives. The NSA told US agencies to patch or go offline. Japan's prime
minister posted an "urgent request for everyone to take action tonight" on X.
Wikimedia pulled systems. The Finnish government, Edinburgh council, the
University of Geneva, the Dutch cyber agency and some BBC pages all went dark
as a precaution. The UK government took down 32 sites. Orange suspended
services. SoftBank in Japan suspended earthquake and tsunami alerts, and told
customers to find another way to be warned about a disaster.

Sit with that last one for a second. A memory-handling bug from a 2012-era
design decision switched off earthquake warnings in Japan for a weekend.

## Number one: it isn't 22 years

The vulnerable code goes back to PHP 5.4. That shipped in March 2012. We're in
October 2026, so the real figure is about **14 years**.

Wiz, who found it, says "nearly every PHP version is affected, including
releases dating back to PHP 5.4" and describes the architecture decisions as
being made "over a decade ago". The BBC said "more than a decade". Those are
all consistent. 22 is the outlier.

So where does 22 come from? PHP 5.0 was released in July 2004. That's 22 years
ago almost exactly. Somewhere between the technical write-ups and the
newsroom, "the PHP 5 lineage" became "PHP 5", and "PHP 5" became a release
date, and a release date became a headline.

Nobody lied. The number just got rounder every time it changed hands, which
is what numbers do when they travel.

## Number two: it wasn't 2 days

Here's the actual timeline, from Wiz's own disclosure post.

```
2012 Mar  ─ PHP 5.4 ships. The vulnerable design lands.
                        │
            (14 years of nobody looking)
                        │
2026 Jul 30 ─ Calif starts, working with OpenAI's Patch the Planet
2026 Aug 19 ─ Wiz finds the first bug (Wiz Atlas + Gemini 4 Argon + GPT-5.6 Sol)
2026 Aug 20 ─ unauthenticated RCE confirmed against Drupal
2026 Aug 21 ─ unauthenticated RCE confirmed against WordPress
2026 Aug 24 ─ reported to the PHP security team
2026 Sep 21 ─ PHP acknowledges, coordinated fix begins
2026 Oct 21 ─ leak forces early disclosure. Patches ship. Panic starts.
                        │
            ◄── this is the "2 days" ──►
```

Discovery to disclosure was **63 days**. Two of those months were humans doing
unglamorous coordinated-disclosure work: reproducing, scoping, arguing about
backports, building patches for four release branches, and keeping quiet while
they did it.

The "2 days" is the panic window. It's the gap between the public finding out
and your weekend being ruined. Calling that the AI's contribution is like
timing a building demolition from when the dust cloud appears.

And even that window was shorter than planned. Recorded Future reports an
archive with vulnerability details hit VirusTotal at 02:29 UTC on 21 October.
The leak forced the announcement out early. PHP had reserved the right to go
early "should details of either vulnerability become public," and they used it.

## So what did AI actually change?

It changed the cost of looking.

Salil Kanhere of UNSW Sydney put it better than I can: "the underlying bugs
weren't new; what changed was our ability to find them."

That sounds modest. It isn't. For 14 years the economics of auditing PHP's
internals were bad. The code is old, it's C, it's enormous, and the payoff for
reading it carefully was speculative. So almost nobody did, and the people who
did had to pick their battles.

Wiz used Wiz Atlas with Gemini 4 Argon and GPT-5.6 Sol, and the detail I keep
coming back to isn't the discovery. It's that they used the models to adapt
the exploit across PHP versions, configurations and memory layouts, iterating
on failures with testing and debugging tools. That's not a model having a
flash of insight. That's a loop, grinding through variants faster than a human
could, in a search space that was always there and was never worth the time.

If you've read my last post this will sound familiar. I called it cognitive
debt: code your team depends on that nobody actually understands. php2shell is
what that looks like at internet scale. The bug was never hidden. It was
public, open source, sitting in a repository anyone could read, for 14 years.
It was unread, which is a different thing.

The interest came due all at once.

## The symmetry nobody enjoys

The same economics apply to the other side.

Cloudflare's Matthew Prince said they saw "thousands" of exploitation attempts
in the 10 hours _before_ public announcement. "That jumped to tens of thousands
in the 45 minutes post announcement, hundreds of thousands within two hours,
and millions now." Amazon says it was targeted days before disclosure.

OpenAI said the incident "highlights how AI can uncover security flaws" and
also how it can "help attackers rapidly develop offensive tools and exploits."
That's an unusually honest sentence from a vendor, and it's the whole problem
in one line. The capability isn't aligned to defence. It's aligned to whoever
is looking.

Defenders got a 63-day head start here because the finders disclosed
responsibly. That head start was a choice made by people, not a property of
the technology.

## The part nobody is covering

Here's what actually worries me, and I haven't seen it in the mainstream
coverage.

The patched releases are PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35. That's it.
No official fix for PHP 7.4, 8.0 or 8.1.

Now look at what the web is actually running, from W3Techs in August 2026:

| PHP version      | Share of PHP sites | Official php2shell patch? |
| ---------------- | ------------------ | ------------------------- |
| PHP 8 (8.2–8.5)  | part of 62.5%      | yes                       |
| PHP 8 (8.0, 8.1) | part of 62.5%      | no                        |
| PHP 7            | 29.4%              | no                        |
| PHP 5            | 8.0%               | no                        |
| PHP 4            | 0.1%               | no                        |

At minimum 37.5% of PHP sites are on a major version with no official patch,
and the real figure is higher because 8.0 and 8.1 are folded into that 62.5%.

"Just patch" is good advice for maybe half of the affected internet. For the
rest the advice is "upgrade across a major version, this weekend, on a site
you probably inherited." That's not a patch. That's a migration project with a
gun to its head. Distros will backport for some of it, and that helps, but a
lot of these sites have no maintainer at all.

Which is also why I'd treat the 70% number carefully. Wiz says PHP "powers 70%
of all websites in the world" and the headline became "70% of the Internet."
The underlying W3Techs figure is 70.5% of websites **whose server-side
language is known**, and W3Techs can't determine the language for a large
chunk of the web. It's a real statistic with a qualifier that got dropped in
transit, same as the 22.

The number is big enough without the rounding. I'd rather quote it correctly.

## If you run something

Nothing here needs you to panic, but a few things are worth doing properly.

**Find out what you're actually running.** Not what you think you deployed.
PHP shows up in places people forget, and Daniel Stewart at LRQA made the
point well: it's "commonly found in the management interfaces of network
appliances, load balancers, and embedded devices, which are often overlooked
during these incidents." Your WordPress site is the obvious one. The admin
panel on a load balancer is the one that gets you.

**Patch if you're on 8.2 or newer.** Ken Munro's description is right, it's
"a bit like running a Windows update."

**If you're on 7.x or 8.0/8.1, you have a different problem.** Check whether
your distro backported a fix. If it didn't, you're deciding between an
emergency major-version upgrade and taking the thing offline. Decide
deliberately rather than by not deciding.

**Assume the window is closed.** Technical details are public, exploitation
attempts are in the millions, and as Kanhere noted, more attempts are likely
now that the details are out. No confirmed successful exploit had been
reported as of Friday morning, but experts have been clear that impact takes
time to surface. Absence of reports is not absence of compromise.

## What I take from this

Two things.

The first is that the finding side of security just got much cheaper, and the
fixing side didn't move at all. We found a 14-year-old bug in roughly three
weeks of machine-assisted work, and we still can't get a patch onto a third of
the affected web. Discovery scaled. Remediation is still humans, release
branches, and whoever is left maintaining the thing.

The second is about how this story got told. Within two days a careful 63-day
disclosure became "AI did it in 2 days", 14 years became 22, and a qualified
70.5% became "70% of the Internet." Every one of those shifts made the story
better and made it less true.

If AI is going to keep finding things like this, and it will, then the hard
part isn't the finding. It's everything after, including the part where we
describe what happened accurately enough that people make good decisions. We
weren't great at that this week.

The bug sat there for 14 years. The story took 2 days to drift. I'm not sure
which of those says more about us.

---

**Sources:** [BBC](https://www.bbc.com/news/articles/c3qjnwye0ep5o) ·
[Wiz disclosure](https://www.wiz.io/blog/php2shell-php-rce) ·
[Sansec](https://sansec.io/research/php2shell) ·
[watchTowr FAQ](https://watchtowr.com/intelligence/php-cve-2026-109618-faq/) ·
[Cloudflare](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/) ·
[Datadog Security Labs](https://securitylabs.datadoghq.com/articles/php2shell-critical-vulnerabilities-in-php/) ·
[Recorded Future](https://www.recordedfuture.com/blog/php2shell-vulnerability-exploitation) ·
[W3Techs](https://w3techs.com/technologies/details/pl-php)
