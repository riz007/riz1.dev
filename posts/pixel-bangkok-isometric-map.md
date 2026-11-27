---
title: "I Drew Bangkok in Pixels, and My Laptop Painted It Overnight"
date: 2026-11-27
description: "How I built Pixel Bangkok, a 20 km isometric pixel-art map of the city, from open data, a Mac GPU and a lot of checking. The short version, with a link to the full write-up."
tags: ["Pixel Bangkok", "Open Data", "Generative AI", "Software Engineering"]
---

# I Drew Bangkok in Pixels, and My Laptop Painted It Overnight

Late one night I fell into isometriccities.com and lost an evening. New York, Tokyo, Singapore: whole cities drawn as tiny isometric worlds. There was no Bangkok, so I decided to make one.

Ten days later, **Pixel Bangkok** is live at [pixelbangkok.com](https://pixelbangkok.com): 20 × 20 km of central Bangkok, more than 700,000 buildings, 521 places in Thai and English, 88 rail stations, and cars, tuk-tuks and boats moving through it.

This is the short version. The full story, with all the details, is on Towards AI: [I Drew Bangkok in Pixels and My Laptop Painted It Overnight](https://pub.towardsai.net/i-drew-bangkok-in-pixels-and-my-laptop-painted-it-overnight-fc450f2f2404).

## One rule: the map has to be true

I didn't repaint Google's 3D tiles with an image model, because Google's Map Tiles API policies don't allow it. That pushed me to a rule I kept coming back to: every building, canal and road sits where it really is, and nothing is invented to make a picture look fuller.

So the city is drawn from open data: OpenStreetMap, Google Open Buildings 2.5D for heights, Wikidata for the tallest towers, Meta and WRI canopy maps for trees, and Overture Maps for buildings OpenStreetMap hasn't mapped yet.

## Three parts that never mix

The project is a Python pipeline, a tile pyramid and a Next.js viewer, and they only talk through files. The full map is about 3.6 gigapixels, cut into roughly 23,500 WebP tiles, so a visitor only downloads what is on screen.

[![Architecture flow of Pixel Bangkok: open data goes through a Python pipeline to a tile pyramid on a CDN, and then to the web viewer.](/blog/pixel-bangkok/architecture-flow.png)](/blog/pixel-bangkok/architecture-flow.png)

## Half of Bangkok was missing

My first render looked oddly empty. I almost filled the blank blocks with trees, then measured it: OpenStreetMap had outlines for only about a sixth of the city's buildings. The blocks weren't empty, they were unmapped. Adding about 507,000 buildings from Overture Maps, with a few strict rules, fixed it.

[![Before and after comparison of the same Bangkok blocks, empty on the left and filled with buildings on the right.](/blog/pixel-bangkok/fill-compare.png)](/blog/pixel-bangkok/fill-compare.png)

## Painting on a laptop GPU, with a judge

For an optional painterly layer I run FLUX.2 [klein] 4B with an isometric LoRA, locally on a MacBook. It paints the map in overlapping windows overnight. Every window is then checked against the original drawing, and anything that moves a road or invents a building is rejected. Accuracy wins over coverage.

## Fast, and built with AI agents

The viewer scores 99 on Lighthouse performance thanks to on-screen-only tiles, a CDN with immutable caching, and versioned URLs. AI coding agents wrote most of the code, while I set the rules, chose and checked the data, and reviewed everything. Tests turned "trust the AI" into "check the AI".

## Read the full write-up

I kept this post short on purpose. The data sources, the temple problem, the caching trick, the mistakes the agents made and the lessons are all in the full article:

**[I Drew Bangkok in Pixels and My Laptop Painted It Overnight on Towards AI](https://pub.towardsai.net/i-drew-bangkok-in-pixels-and-my-laptop-painted-it-overnight-fc450f2f2404)**

Then explore the map at [pixelbangkok.com](https://pixelbangkok.com), on your phone or desktop. If you know Bangkok, tell me which neighbourhood I should draw next.

_Map data © OpenStreetMap contributors (ODbL); extra buildings from Overture Maps; building heights from Google Open Buildings 2.5D Temporal; tree canopy from Meta and WRI; AI art made with FLUX.2 [klein] and the Isometric Mumbai LoRA._
