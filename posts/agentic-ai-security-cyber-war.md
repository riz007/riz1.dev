---
title: "Admin and Today's Date: Preparing for the Agentic Cyber War"
date: 2026-11-08
description: "Two of the biggest attacks of autumn 2026 weren't clever. A fridge controller with a password built from the date, and a fake job interview. What AI actually changed, and how developers and agencies should get ready."
tags: ["Security", "AI Engineering", "Software Engineering"]
---

# Admin and Today's Date: Preparing for the Agentic Cyber War

On the night of 11 October, somebody switched the fridges at up to 700
French supermarkets into defrost mode and left them there. By morning
plenty of cabinets were sitting at 50°C. A store in Normandy reported 80. Equipment melted, some units caught fire, the sprinklers did the
rest, and whole aisles of food went in the bin.

How do you break into 700 supermarkets in one night?

You probably don't need to. You need a login page.

[![A four-panel comic. At 2:14 a.m. a person in a hoodie types "admin" into a refrigeration controller login, glances at a wall calendar showing 11 October for the password, gets "access granted", and six hours later a supermarket fridge is steaming at 50°C.](/blog/agentic-ai-security/comic-password.svg)](/blog/agentic-ai-security/comic-password.svg)

Eighteen days later, on 29 October, hackers the FBI has tied to North
Korea took about $6.3 billion from Binance, most of it in roughly
twenty minutes. It's the largest crypto theft ever recorded, and
Elliptic called it "almost certainly the single largest-known theft
of any kind."

That one didn't start with a zero-day either. It started with a job
interview.

I've spent the last week reading the incident reports for both, and
what keeps bothering me isn't how sophisticated these attacks were.
It's how ordinary they were. So this post is about that: what actually
happened, what AI actually changed, and what I think developers and
agencies should be doing about it this quarter, not next year.

## The record nobody wanted

Start with the scale, because it's genuinely hard to picture.

[![Bar chart of the largest crypto thefts at the time of theft: Mt. Gox 2014 $460M, Coincheck 2018 $534M, Poly Network 2021 $611M, Ronin 2022 $625M, Bybit 2025 $1.5B, Binance 2026 $6.3B.](/blog/agentic-ai-security/chart-heists.svg)](/blog/agentic-ai-security/chart-heists.svg)

For years the record crept up in small steps. Half a billion here, six
hundred million there. Bybit more than doubled it in February 2025.
Binance took that number and multiplied it by four.

Binance says it covered the losses from its own reserves and had 98%
of the stolen tokens replenished by 3 November. Good for its users.
But "the victim was rich enough to absorb it" isn't a security
strategy, and almost nobody reading this works somewhere that could
write a $6 billion cheque.

## How you steal $6.3 billion

Binance shared its initial findings on 3 November. Here's the shape of
it.

[![A four-step timeline. June 2026, the lure: a wallet engineer downloads a tampered Homebrew installer while looking for an AI coding tool. September 2026, the interview: a second engineer is approached on LinkedIn and runs a malicious take-home assignment. 20 October 2026, the pivot: attackers use Binance's own internal AI tools to take over two more wallet engineers' machines. 29 October 2026, the drain: an EIP-7702 authorization gives a malicious contract partial control of a hot wallet.](/blog/agentic-ai-security/diagram-binance-chain.svg)](/blog/agentic-ai-security/diagram-binance-chain.svg)

Look at step one. A wallet engineer, looking for an AI coding tool,
downloads a Homebrew installer that's been tampered with. Not a
nation-state exploit chain. A developer doing exactly what every
developer is doing right now: trying the new AI thing.

Binance caught that one. They replaced the device and rotated the
credentials. But by then the attackers knew who worked on the wallet
team, and that was all they needed for step two.

[![A four-panel comic. An engineer gets a LinkedIn message saying "Loved your wallet work. Quick chat?". A smiling recruiter on a video call says "We love your profile!". A man in a suit labelled CEO says "Last step: a small take-home." Weeks later the engineer runs the task and coins fly out of the laptop, labelled $6.3B.](/blog/agentic-ai-security/comic-interview.svg)](/blog/agentic-ai-security/comic-interview.svg)

A "project director" on LinkedIn. A first round with "HR". A second
round with "the CEO" of a company that doesn't exist. Then a take-home
assignment, which is a polite way of saying "please run our code on
your work laptop". The engineer ran it. Honestly, most of us would
have.

Then step three, which I think deserves the most attention. From that
one laptop, the attackers used Binance's own internal AI tools to take
over two more wallet engineers' machines. Binance hasn't said how yet,
and I'm not going to guess. But sit with the fact itself. The
company's AI tooling had enough reach that compromising one engineer
let an attacker use it to move sideways.

Your internal agents are part of your attack surface now. Not in a
threat model somewhere. On the record.

### This isn't new, and that's the problem

If this sounds familiar, it should. In February 2025 the same group,
which the FBI tracks as TraderTraitor, took about $1.5 billion from
Bybit. That started on a developer's laptop too. A Safe{Wallet}
engineer's machine was compromised, AWS session tokens were hijacked
to get past MFA, and a JavaScript file in the wallet's front end was
quietly swapped, waiting for Bybit's next transfer.

Same attacker. Same door. Twenty months apart. Four times the money.

When someone walks through the same door twice and gets four times as
much the second time, the lesson isn't really about crypto. It's that
**the developer's laptop is the perimeter now**, and most companies
still defend it like a personal device.

## The night itself

There's one more chart I want to show you, because it's the most
practical one in this post.

[![A timeline of the night of 29 October 2026 in UTC. 20:05 the drain begins. 20:24 one transaction moves over $2.5B. 21:01 Tether freezes, Circle follows at 21:04. 22:06 Tether blocks the hot wallet. 23:05 Avalanche and Polygon hit. 23:53 Circle blocks the hot wallet. 00:10 Binance revokes the attackers' access. 56 minutes from first theft to first freeze, 4 hours 5 minutes to access revoked.](/blog/agentic-ai-security/chart-binance-night.svg)](/blog/agentic-ai-security/chart-binance-night.svg)

Tether froze the stolen stablecoins 56 minutes after the drain began.
Circle followed three minutes later. Between them they locked up
roughly $3 billion before it could be moved.

Binance removed the attackers' access at 00:10. Four hours and five
minutes after it started.

I'm not saying that to dunk on Binance. Why it took so long is the
interesting part. Halting withdrawals didn't stop the drain, because
the attackers weren't using Binance's systems anymore. They'd used an
EIP-7702 authorization to give their own contract partial control of
a hot wallet, so the permission lived on-chain. Binance's report
doesn't blame EIP-7702 itself; the authorizations came through
Binance's own wallet-signing service. You can't stop something with a
kill switch that doesn't reach it.

So ask yourself honestly. If someone got delegated access to the
thing you care about most, do you know the exact steps to revoke it?
Have you ever practised them? Do you know how long it takes?

Two third parties beat the victim by three hours, because freezing
assets is their job and they've done it a thousand times. Revoking
your own permissions under pressure is something most teams have done
exactly never.

## Back to the fridges

The supermarket attack deserves a proper look, because it's the
purest example of the whole pattern.

[![A four-step diagram of the likely path into the supermarket fridges: a controller login page open to the internet, 2,765 found by Claroty's scan; username admin with a password built from the date, CVE-2025-41450; refrigeration switched to defrost overnight with no alarm; about 50°C after six hours, fires and over €10M in losses. Below it a timeline: 2016 AK-SC355 end-of-life, May 2021 AK-SM800 end-of-life, March 2025 Claroty reports the flaws, August 2025 the fix ships in firmware 4.3.1, October 2026 the attack, 14 months later.](/blog/agentic-ai-security/diagram-fridge.svg)](/blog/agentic-ai-security/diagram-fridge.svg)

The controllers involved were made by Danfoss. Claroty's Team82 found
that some of them had a "code of the day" login: the username was
admin, and the password could be worked out from the current date.
That's CVE-2025-41450. Danfoss was told in March 2025 and shipped a
fix in firmware 4.3.1 that August. Claroty's scan found 2,765 of these
systems reachable from the open internet.

The AK-SC355, one of the affected models, went end-of-life in 2016.
The AK-SM800 followed in May 2021. Both were still running supermarket
refrigeration in 2026, still online, and many still unpatched fourteen
months after the fix.

To be fair to the record, nobody has confirmed exactly which method
was used on 11 October. This is the path researchers point to, and it
fits. Attribution is unknown as well. Ken Munro at Pen Test Partners
suggested it could be "kids messing around", precisely because the
exploit was so easy. On 2 November it happened again across ten more
countries, and days later someone went after French blood bank
refrigerators with a target of 110°C. Staff caught that one in time.

Now think about who owns these boxes. Not the supermarket's IT team.
Supermarkets often outsource refrigeration to specialist firms. So the
controller was installed by one company, maintained by another, sits
on a network nobody quite owns, and runs firmware nobody quite
remembers. Every agency reading this has a client with a box like
that. Some of you installed it.

## So what did AI actually change?

This is where I want to be careful, because the easy version of this
story is wrong.

The easy version says AI invented some new class of super-attack. It
didn't. Not one of these incidents needed a new technique. A default
login. A fake recruiter. A delegated permission. All of that existed
long before ChatGPT.

What changed is the cost.

After the fridge attacks, Claroty's researchers ran an experiment.
Using Claude Sonnet 4.6 through Cursor, they rebuilt the controller
attack in their lab. It took about 28 minutes and cost about $6.
Claude recreated two of the three known vulnerabilities and chained
them into full control of the controller.

The detail I love: the one it struggled with was getting past the
login. The part a bored teenager would have tried first.

That's the honest picture. AI isn't a genius attacker. It's a tireless
and cheap one, and cheap is what matters when the targets aren't one
hardened bank but thousands of forgotten boxes.

Richard Horne, who runs the UK's National Cyber Security Centre,
called the fridge attacks "just the foothills". The NCSC expects
attackers to use AI to exploit known flaws in legacy technology "at
scale" across critical infrastructure by 2028. Their worry isn't that
AI invents new attacks. It's that flaws we've tolerated for years
become cheap to find and cheap to use.

We've already watched the other side of that. In the
[php2shell incident](/en/blog/php2shell-what-ai-actually-changed) last
month, AI helped find PHP vulnerabilities that had been sitting in
public code since 2012. Same economics. The bug was never hidden, it
was just never worth anyone's time to look. Now looking is nearly
free, for everyone.

And the agents are getting better at running the whole operation. In
November 2025, Anthropic reported disrupting an espionage campaign by
a group it assessed as Chinese state-sponsored, where Claude did an
estimated 80 to 90% of the work and humans stepped in at maybe 4 to 6
decision points. Around thirty targets, a small number of successful
intrusions.

That figure has been fairly questioned. Researchers pointed out that
counting low-level actions inflates the percentage while the decisions
that matter stay with humans, and Anthropic's own report notes the
model "occasionally hallucinated credentials". I'd read 90% as a
direction, not a measurement. But the direction is pretty clear.

Put it together and the picture is less dramatic than the headlines,
and more uncomfortable:

| Then                                           | Now                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Finding old flaws took time nobody had         | AI helped surface 14-year-old PHP bugs (php2shell)                 |
| Rebuilding a known exploit took skill and days | Claude rebuilt the fridge exploit in ~28 minutes for ~$6, in a lab |
| An intrusion needed a team at the keyboard     | Anthropic estimates AI did 80 to 90% of one campaign's work        |
| Moving sideways meant stealing more passwords  | At Binance, the attackers moved through internal AI tools          |

## Is it actually a cyber war?

I don't love the phrase. "War" makes it sound like something
governments do to each other, a long way from your sprint board.

But look at what's on the record. The FBI attributes what Elliptic
calls the largest known theft of any kind to a state, North Korea,
which denies it. Somebody, still unknown, went after Europe's food
cold chain in two waves and then went after blood banks. The head of
the UK's cyber agency is using phrases like "the foothills".

Whatever you call it, the people on the other side include states,
they're patient, and they run their operations through the same
laptops, recruiters and tools your team uses every day.

You don't have to believe it's a war. You just have to accept that
your developers are now on a front line they never signed up for, and
that the tactics are aimed at exactly the habits we're proudest of:
moving fast, trying new tools, saying yes to interesting opportunities.

## How to get ready

None of this is exotic, which is the good news. Here's what I'd do,
split by who you are.

### If you write code

**Treat your laptop as production.** Because it is. If it can deploy,
sign, or touch a wallet, it deserves production controls: hardware
security keys, short-lived credentials, and no long-lived tokens
sitting in a dotfile.

**Install AI tools from the source, and only the source.** Step one of
the Binance attack was a tampered installer for an AI coding tool.
Every hot new tool brings a wave of fake installers, fake extensions
and fake MCP servers with it. Check the publisher. Pin versions.
Verify signatures where your package manager lets you.

**Run take-home assignments in a box.** A container, a VM, a throwaway
cloud machine. Never the laptop that holds your work credentials. Any
company that's offended by you running their code in a sandbox is a
company you don't want to work for anyway.

**Scope your agents like you'd scope an intern.** Coding agents and
internal AI tools should get the minimum permissions they need, for
the shortest time, with a log of everything they did. If your agent
can read every repo and every secret "because it's convenient", you've
built the next attacker's lateral-movement layer for them.

**Know your revoke path.** For anything that can grant delegated
access, whether that's on-chain approvals, OAuth grants, API keys or
deploy tokens, know exactly how to revoke it and how long it takes.

### If you run an agency or a team

**Inventory what you've left behind.** Every agency has client
deployments nobody's touched in years. The WordPress site still on PHP 7. The admin panel on a load balancer. The controller somebody "just
needed online for remote access". Find them before someone else does.
Remember the 2,765.

**Track end-of-life like you track invoices.** A controller model that
went end-of-life in 2016 was still running supermarket fridges in 2026. Put EOL dates where you put renewal dates, and make retiring old
things somebody's actual job.

**Close the patch gap.** The Danfoss fix existed fourteen months before
the attack. The vulnerability wasn't really the failure. The fourteen
months were. Measure your time-to-patch and put it on a dashboard that
somebody actually looks at.

**Treat recruiting as an attack surface.** Brief your engineers on fake
recruiter campaigns, especially anyone with deploy or signing rights.
A twenty-minute "here's what these look like" session is a lot cheaper
than one compromised laptop.

**Drill the bad night.** Run a tabletop where an engineer's laptop is
compromised at 8 p.m. on a Thursday. Who gets called? What gets
revoked first? How long until access is actually gone? Whatever answer
you'd give today, Binance would probably have given the same one in
September.

**Keep a human on anything irreversible.** Agents can draft, test and
propose. Moving money, granting permissions and deploying to
production should need a human who understands what they're
approving. That's not anti-AI. It's the same reason we don't let
anyone push straight to main.

Here's the short version I'd pin to a wall:

| Risk                              | What to do this quarter                                  |
| --------------------------------- | -------------------------------------------------------- |
| Tampered AI tools and installers  | Official sources only, pinned versions, signature checks |
| Fake recruiters and take-homes    | Brief the team, run assignments in a sandbox             |
| Over-permissioned internal agents | Least privilege, short-lived tokens, audit logs          |
| Forgotten devices and old stacks  | Inventory, EOL tracking, no needless internet exposure   |
| Slow patching                     | Measure time-to-patch and make it visible                |
| Slow revocation                   | Write the revoke runbook, then time a drill              |

## The boring war

If you take one thing from all this, take this: the agentic era's
security problem isn't mostly about clever new attacks. It's that the
boring old ones got cheap.

A password worked out from the date. A recruiter with a nice profile.
A permission nobody remembered granting. A box that went end-of-life
before some of your junior developers finished university.

AI didn't create any of those weaknesses. It made them affordable to
find, at scale, for anyone. Which means the defence is mostly boring
too. Know what you run. Patch it. Scope it. Practise taking access
away, fast.

The attackers are patient, and now they're cheap. We need to be quick,
and we need to be thorough. That's most of the job.

---

**Sources:**
[Wikipedia: 2026 supermarket refrigerator hack](https://en.wikipedia.org/wiki/2026_French_supermarket_refrigerator_hack) ·
[CBC](https://www.cbc.ca/news/business/france-fridge-hack-smart-devices-food-system-9.7379613) ·
[Cybernews on Claroty's Claude experiment](https://cybernews.com/ai-news/hackers-disable-supermarket-fridge-claude-ai-costs-6-dollars/) ·
[Insurance Journal on the NCSC](https://www.insurancejournal.com/news/international/2026/11/04/891443.htm) ·
[Wikipedia: 2026 Binance hack](https://en.wikipedia.org/wiki/2026_Binance_hack) ·
[Fortune](https://fortune.com/2026/11/03/binance-hack-details-linkedin/) ·
[NBC News](https://www.nbcnews.com/business/markets/binance-hack-fake-job-interview-heist-rcna607238) ·
[Security Affairs](https://securityaffairs.com/202369/cyber-crime/binance-hack-how-fake-job-interviews-and-ai-abuse-led-to-a-6-34-billion-attack.html) ·
[NPR](https://www.npr.org/2026/10/31/nx-s1-6024426/binance-crypto-heist-cyber-criminals-north-korea) ·
[The Hacker News on Bybit](https://thehackernews.com/2025/02/bybit-hack-traced-to-safewallet-supply.html) ·
[Decrypt](https://decrypt.co/308292/biggest-crypto-hacks-of-all-time) ·
[Anthropic](https://www.anthropic.com/news/disrupting-AI-espionage) ·
[Ars Technica](https://arstechnica.com/security/2025/11/researchers-question-anthropic-claim-that-ai-assisted-attack-was-90-autonomous/)
