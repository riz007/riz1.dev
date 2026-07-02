/* Curated open-source projects surfaced in the RudraOS ~/projects window.
   Static fields are the source of truth for copy; stars/description are
   refreshed from the GitHub API at request time (ISR) when available. */

export const projects = [
  {
    repo: "larb",
    name: "Larb",
    tagline: "The autonomous coding agent",
    description:
      "A model-agnostic autonomous coding agent for the terminal — sandboxed execution, TUI, and pluggable LLM backends (Anthropic, OpenAI, Ollama).",
    stack: ["TypeScript", "Node.js", "LLM"],
    topics: ["agentic", "coding-agent", "sandbox", "tui"],
    url: "https://github.com/riz007/larb",
    featured: true,
    stars: 0,
  },
  {
    repo: "somtum",
    name: "Somtum",
    tagline: "Local-first memory for Claude Code",
    description:
      "A memory engine and prompt-cache layer for Claude Code — embeddings, long-term recall, and RAG over your own sessions, backed by SQLite.",
    stack: ["TypeScript", "SQLite", "Embeddings"],
    topics: ["memory", "rag", "claude-code", "prompt-cache"],
    url: "https://github.com/riz007/somtum",
    featured: true,
    stars: 7,
  },
  {
    repo: "architect-os",
    name: "Architect OS",
    tagline: "AI-native engineering operating system",
    description:
      "An opinionated operating system for modern application architecture — scaffolding, clean-architecture templates, and AI-assisted development workflows.",
    stack: ["Shell", "Python", "TypeScript"],
    topics: ["architecture", "scaffolding", "agent-skills"],
    url: "https://github.com/riz007/architect-os",
    featured: true,
    stars: 1,
  },
  {
    repo: "optiscript",
    name: "OptiScript",
    tagline: "Image descriptions for accessibility",
    description:
      "Concise AI-generated image descriptions that make visual content usable for visually impaired people. Powered by Gemini.",
    stack: ["Vue", "Gemini"],
    topics: ["accessibility", "vision"],
    url: "https://github.com/riz007/optiscript",
    featured: false,
    stars: 0,
  },
  {
    repo: "flightmap",
    name: "FlightMap",
    tagline: "Offline-first flight tracker",
    description:
      "PWA flight tracking with dead reckoning and Kalman-filtered GPS — keeps working when the connection doesn't.",
    stack: ["TypeScript", "React", "MapLibre"],
    topics: ["pwa", "kalman-filter", "offline-first"],
    url: "https://github.com/riz007/flightmap",
    featured: false,
    stars: 0,
  },
  {
    repo: "lekha",
    name: "Lekha",
    tagline: "Next-generation Bengali typing",
    description:
      "A modern Bengali writing surface — fast phonetic input built on Nuxt 4 and Tiptap.",
    stack: ["TypeScript", "Nuxt"],
    topics: ["bengali", "editor"],
    url: "https://github.com/riz007/lekha",
    featured: false,
    stars: 0,
  },
];
