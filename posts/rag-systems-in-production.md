---
title: "RAG Systems in Production: Beyond the Basics"
date: 2026-04-30
description: "Once you move past the naive retrieve-and-generate pattern, building a reliable RAG system is primarily an engineering problem."
---

# RAG Systems in Production: Beyond the Basics

Retrieval-Augmented Generation is straightforward to prototype. You chunk some documents, embed them, store the embeddings in a vector database, and at query time you retrieve the top-k closest chunks and hand them to a language model with the question. The model reads the retrieved context and answers.

This works well enough to demo. It rarely works well enough to ship without substantial engineering work on top.

The problems that appear in production are consistent enough that they form a predictable list. This post goes through them — not as a criticism of RAG as a pattern, but as a honest account of what actually needs to be built before you can trust the system.

## Chunking is a First-Class Problem

The default chunking strategy — split by character count or token count, overlap by some fixed amount — is a starting point, not a solution. The problem is that chunks are the unit of retrieval, and a chunk that splits a table mid-row, breaks a numbered list across two pieces, or severs a sentence from the paragraph that contextualises it will return garbage to the model.

Better chunking strategies think about the semantic structure of the document:

**Structural chunking** respects the document's own divisions — headings, sections, code blocks, tables. A chunk should never cross a structural boundary unless the boundary is irrelevant.

**Hierarchical chunking** indexes at multiple granularities. A parent chunk might be an entire section; child chunks might be individual paragraphs. At retrieval time you can fetch a child chunk (small, precise) and optionally expand to the parent (more context) when the child alone is insufficient.

**Semantic chunking** uses an embedding model to identify where meaning shifts in the text and breaks there, regardless of token count. More expensive to generate but produces more coherent retrieval units.

The right strategy depends on your document type. Code requires structural chunking. Long-form prose may do better with semantic chunking. Structured data like FAQs and documentation often works best with explicit boundaries you define.

## The Retrieval Step is More Than Top-K

Naive retrieval returns the k vectors closest to the query embedding in cosine distance. This works when the query is similar in vocabulary and phrasing to the document. It breaks down in several predictable ways.

**Lexical mismatch**: A document uses the term "cardiac event"; the query says "heart attack." Embedding distance handles this reasonably well with good models, but it is never perfect. Hybrid search — combining dense vector search with sparse keyword matching (BM25) — closes the gap meaningfully. Most production RAG systems worth using do this.

**Multi-hop questions**: "What was the revenue impact of the product launched in Q3?" requires first finding the product, then finding the revenue data associated with it. A single retrieval step cannot answer this. You need either a reranking model that scores retrieved chunks for relevance, or an iterative retrieval loop that refines the query based on what was found.

**Query transformation**: The user's literal question is often not the best retrieval query. Techniques like HyDE (Hypothetical Document Embeddings) — generating a hypothetical answer and embedding that — or query expansion — generating multiple reformulations and merging results — can dramatically improve recall.

**Reranking**: A fast first-pass retrieval returns a broad candidate set (top-20, top-50). A slower cross-encoder reranker then scores each candidate against the query for relevance and returns only the best few. This two-stage approach is almost always worth the added latency in high-stakes applications.

## Context Assembly is Underrated

Retrieved chunks are the raw material. What you assemble from them and how you present it to the model matters as much as what you retrieved.

Ordering matters. Put the most relevant chunk closest to the question, not at the start of a long context window. Language models have a documented tendency to underweight information in the middle of long contexts. If you have six retrieved chunks, don't just concatenate them in retrieval order.

Deduplication matters. If two chunks are semantically nearly identical, including both wastes context budget and can cause the model to over-weight that information.

Attribution matters for trust. If the application requires that the model cite its sources — and most serious enterprise applications do — you need to include the source metadata in the context in a format the model can reliably reproduce.

## Evaluation: The Part Nobody Wants to Build

RAG systems are hard to evaluate because the failure modes are subtle. A system that returns plausible-sounding but incorrect answers is worse than a system that says "I don't know" — and much harder to detect.

The evaluation dimensions that matter are:

**Retrieval recall**: Are the relevant chunks being retrieved at all? Build a labelled test set where you know what the correct context is, and measure whether your retrieval pipeline is finding it.

**Answer faithfulness**: Is the generated answer actually supported by the retrieved context, or is the model confabulating? This is measurable with an LLM-as-judge pattern: prompt a model to check whether each claim in the answer can be traced to a specific retrieved chunk.

**Answer relevance**: Is the answer addressing the user's actual question? Separate from faithfulness — an answer can be faithful to retrieved context but still miss the point.

**Context precision**: Of everything retrieved, how much of it was actually used to produce the answer? High retrieval cost with low context precision suggests your retrieval step is noisy.

Build this evaluation harness before you start optimising. Without it, changes to chunking strategy, retrieval parameters, or prompts can easily improve one metric while silently degrading another.

## Where It Goes Wrong in Production

The failure I see most often is confusing "it worked on the demo corpus" with "it works." A RAG system is highly sensitive to the distribution of documents it indexes. When the document set changes — new content is added, old content is outdated, a different kind of document is uploaded — performance can degrade without any code changing.

Monitor retrieval quality, not just answer quality. Log what was retrieved for each query. When an answer is wrong, trace it back: was the right chunk not retrieved? Was it retrieved but not used? Was the model given the right context and still produced the wrong answer? Each of these has a different fix.

RAG is a powerful pattern. Used well, it lets you build applications that leverage private knowledge at scale without fine-tuning, with sources you can cite and update. Used naively, it is a sophisticated way to produce confident-sounding wrong answers. The difference is almost entirely in the engineering.
