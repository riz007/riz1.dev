"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* Subsequence fuzzy scorer: rewards word-starts and consecutive runs,
   normalises lightly by target length so short labels win ties. */
function fuzzyScore(query, text) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return 0.1;
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      streak += 1;
      const wordStart = i === 0 || /[\s\-_./·]/.test(t[i - 1]);
      score += 1 + streak * 0.6 + (wordStart ? 2.5 : 0);
      qi += 1;
    } else {
      streak = 0;
    }
  }
  if (qi < q.length) return -1;
  return score / (1 + t.length * 0.02);
}

export default function Spotlight({ items, onClose }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (!q.trim()) return items.slice(0, 7);
    return items
      .map((it) => ({ it, s: fuzzyScore(q, `${it.label} ${it.hint || ""} ${it.type}`) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((r) => r.it);
  }, [q, items]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    listRef.current?.children[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const run = (it) => {
    onClose();
    // let the palette unmount before the action opens windows / tabs
    setTimeout(() => it.run(), 10);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && results[sel]) { e.preventDefault(); run(results[sel]); }
    else if (e.key === "Escape") { e.stopPropagation(); onClose(); }
  };

  return (
    <div className="os-spot-backdrop" onClick={onClose}>
      <div className="os-spot" role="dialog" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <div className="os-spot-inputrow">
          <span className="os-spot-glass" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="os-spot-input"
            placeholder="Search apps, posts, projects, links…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="os-spot-esc">esc</kbd>
        </div>

        {results.length > 0 ? (
          <ul className="os-spot-list" ref={listRef} role="listbox" aria-label="Search results">
            {results.map((it, i) => (
              <li key={`${it.type}-${it.label}`}>
                <button
                  className={`os-spot-item${i === sel ? " sel" : ""}`}
                  role="option"
                  aria-selected={i === sel}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => run(it)}
                >
                  <span className="os-spot-ico" aria-hidden="true">{it.icon}</span>
                  <span className="os-spot-label">{it.label}</span>
                  <span className="os-spot-hint">{it.hint}</span>
                  <span className="os-spot-badge">{it.type}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="os-spot-empty">No matches for “{q}” — try a post title, project, or app name.</div>
        )}

        <div className="os-spot-foot">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>⌘K close</span>
        </div>
      </div>
    </div>
  );
}
