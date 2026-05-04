"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Complexity Chart ──────────────────────────────────── */

// Chart coordinate space
const CX0 = 28, CX1 = 256, CY0 = 14, CY1 = 174;
const N_MAX = 100;
const N_PTS = 60;

// Log-scale normalization so all 5 classes are visually distinct
const LOG_D = Math.log10(N_MAX * N_MAX + 1);
function logNorm(v) {
  return Math.log10(Math.max(0.001, v) + 1) / LOG_D;
}

function toXY(n, val) {
  const x = CX0 + ((n - 1) / (N_MAX - 1)) * (CX1 - CX0);
  const y = CY1 - logNorm(val) * (CY1 - CY0);
  return { x: +x.toFixed(2), y: +y.toFixed(2) };
}

function makeD(f) {
  return (
    "M " +
    Array.from({ length: N_PTS }, (_, i) => {
      const n = 1 + (N_MAX - 1) * (i / (N_PTS - 1));
      const { x, y } = toXY(n, f(n));
      return `${x},${y}`;
    }).join(" L ")
  );
}

const CURVES = [
  { label: "O(1)",       color: "#3DB87A", f: () => 1,                              dash: "4,0"   },
  { label: "O(log n)",   color: "#5B9BD5", f: n => Math.log2(n),                    dash: "4,0"   },
  { label: "O(n)",       color: "#B85C38", f: n => n,                               dash: "4,0"   },
  { label: "O(n log n)", color: "#E8A238", f: n => n * Math.log2(n),                dash: "4,0"   },
  { label: "O(n²)",      color: "#C94040", f: n => n * n,                           dash: "4,0"   },
];

export function ComplexityChart() {
  const [live, setLive] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLive(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pre-compute end-points for inline labels
  const endPts = CURVES.map(c => toXY(N_MAX, c.f(N_MAX)));

  return (
    <div className="dsa-viz-block" ref={wrapRef}>
      <p className="dsa-viz-caption">
        Time complexity — how runtime scales with input (log scale, n = 1 → 100)
      </p>
      <div className="dsa-chart-shell">
        <svg
          viewBox="0 0 320 192"
          preserveAspectRatio="xMidYMid meet"
          className="dsa-svg"
          aria-label="Big-O complexity chart"
          role="img"
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75, 1].map(p => {
            const gy = +(CY1 - p * (CY1 - CY0)).toFixed(1);
            return (
              <line
                key={p}
                x1={CX0} y1={gy}
                x2={CX1} y2={gy}
                stroke="var(--line)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Axes */}
          <line x1={CX0} y1={CY0 - 4} x2={CX0} y2={CY1} stroke="var(--ink-3)" strokeWidth="0.8" />
          <line x1={CX0} y1={CY1}     x2={CX1 + 8} y2={CY1} stroke="var(--ink-3)" strokeWidth="0.8" />

          {/* Arrow heads */}
          <polygon points={`${CX1+8},${CY1-3} ${CX1+8},${CY1+3} ${CX1+14},${CY1}`} fill="var(--ink-3)" />
          <polygon points={`${CX0-3},${CY0-4} ${CX0+3},${CY0-4} ${CX0},${CY0-10}`} fill="var(--ink-3)" />

          {/* Axis labels */}
          <text x={CX1+16} y={CY1+3} fontSize="7" fill="var(--ink-3)" dominantBaseline="middle">n</text>
          <text x={CX0}    y={CY0-13} fontSize="7" fill="var(--ink-3)" textAnchor="middle">t</text>

          {/* Complexity curves */}
          {CURVES.map((c, i) => (
            <path
              key={c.label}
              d={makeD(c.f)}
              fill="none"
              stroke={c.color}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 1500,
                strokeDashoffset: live ? 0 : 1500,
                transition: `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.22}s`,
              }}
            />
          ))}

          {/* Inline curve labels at right edge */}
          {CURVES.map((c, i) => (
            <text
              key={c.label + "-lbl"}
              x={CX1 + 6}
              y={+(endPts[i].y + 3.5).toFixed(1)}
              fontSize="7.5"
              fill={c.color}
              style={{
                opacity: live ? 1 : 0,
                transition: `opacity 0.35s ease ${i * 0.22 + 1.45}s`,
              }}
            >
              {c.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="dsa-legend">
        {CURVES.map(c => (
          <span key={c.label} className="dsa-legend-item">
            <span className="dsa-legend-dot" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Algorithms → AI Connections ──────────────────────── */

const AI_ITEMS = [
  {
    algo: "Sliding Window",
    use: "Manages LLM context windows and streaming token buffers during inference.",
  },
  {
    algo: "k-Nearest Neighbor",
    use: "Powers semantic similarity search in RAG pipelines and vector embeddings.",
  },
  {
    algo: "Graph Traversal",
    use: "Agent task planning, dependency resolution, and multi-tool orchestration.",
  },
  {
    algo: "Dynamic Programming",
    use: "Beam search decoding and optimal token sequence selection in LLMs.",
  },
  {
    algo: "Hash Maps + Tries",
    use: "KV-cache systems, prompt deduplication, and fast token lookup tables.",
  },
  {
    algo: "Priority Queues",
    use: "Multi-agent scheduling, LLM request batching, and rate-limit enforcement.",
  },
];

export function AlgorithmsInAI() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="dsa-viz-block" ref={ref}>
      <p className="dsa-viz-caption">
        Classical algorithms powering modern AI systems
      </p>
      <div className="dsa-ai-grid">
        {AI_ITEMS.map((item, i) => (
          <div
            key={item.algo}
            className="dsa-ai-card"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.38s ease ${i * 0.08}s, transform 0.38s ease ${i * 0.08}s`,
            }}
          >
            <p className="dsa-ai-algo">{item.algo}</p>
            <p className="dsa-ai-use">{item.use}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── "AI Still Needs You" Banner ───────────────────────── */

const REASONS = [
  { num: "01", title: "Prompt ≠ Program", body: "LLMs suggest. Engineers decide what runs, when, and why. Correctness and safety still require human reasoning." },
  { num: "02", title: "Efficiency Matters", body: "A poorly designed agent loop burning O(n²) API calls in production will cost real money. Complexity awareness is a cost control." },
  { num: "03", title: "Debugging Agents", body: "When an agentic pipeline fails silently, you trace execution graphs, inspect state machines, and reason about concurrency — all DSA territory." },
];

export function WhyItStillMatters() {
  return (
    <div className="dsa-reasons">
      {REASONS.map(r => (
        <div key={r.num} className="dsa-reason-item">
          <span className="dsa-reason-num">{r.num}</span>
          <div>
            <p className="dsa-reason-title">{r.title}</p>
            <p className="dsa-reason-body">{r.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
