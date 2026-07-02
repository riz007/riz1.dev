"use client";

import { useEffect, useRef, useState } from "react";

export default function Terminal({ apps, identity, repos = [], socials, locale, onOpen, onTheme, onLang, onClose }) {
  const [lines, setLines] = useState([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [hi, setHi] = useState(-1);
  const outRef = useRef(null);
  const inputRef = useRef(null);
  const idc = useRef(0);
  const introDone = useRef(false);

  const push = (nodes) =>
    setLines((prev) => [...prev, ...nodes.map((n) => ({ id: idc.current++, node: n }))]);

  // intro (guarded against StrictMode double-invoke)
  useEffect(() => {
    if (introDone.current) return;
    introDone.current = true;
    push([
      <span><span className="ac">RudraOS</span> agent shell — type <span className="ok">help</span> or click a suggestion.</span>,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const appIds = apps.map((a) => a.id);

  const run = (raw) => {
    const input = raw.trim();
    push([<span className="cmd"><span className="p">agent{">"}</span> {input || " "}</span>]);
    if (!input) return;
    setHistory((h) => [...h, input]);
    setHi(-1);

    const [cmd, ...rest] = input.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();

    switch (cmd.toLowerCase()) {
      case "help":
        push([
          <span><span className="ac">available commands</span></span>,
          <span>  <span className="ok">open</span> &lt;app&gt;     spawn a window ({appIds.join(", ")})</span>,
          <span>  <span className="ok">ls</span>             list apps</span>,
          <span>  <span className="ok">whoami</span>         identity</span>,
          <span>  <span className="ok">star</span> &lt;repo&gt;    open a repo on github ({repos.map((r) => r.repo).join(", ")})</span>,
          <span>  <span className="ok">neofetch</span>       system info</span>,
          <span>  <span className="ok">theme</span> dark|light   switch appearance</span>,
          <span>  <span className="ok">lang</span> &lt;code&gt;    en · bn · th · zh · de</span>,
          <span>  <span className="ok">contact</span>        reach me</span>,
          <span>  <span className="ok">clear</span>          reset the shell</span>,
        ]);
        break;

      case "ls":
      case "apps":
        push([<span>{apps.map((a) => a.title).join("   ")}</span>]);
        break;

      case "open":
      case "run":
      case "spawn": {
        const target = arg.replace(/\.\w+$/, "");
        if (appIds.includes(target)) {
          push([<span><span className="am">▸ spawning</span> {target} …</span>]);
          onOpen(target);
        } else {
          push([<span className="er">no such app: {arg || "(none)"} — try `ls`</span>]);
        }
        break;
      }

      case "star": {
        const target = arg.trim();
        const repo = repos.find((r) => r.repo === target || r.name.toLowerCase() === target);
        if (!repo) {
          push([<span className="er">unknown repo: {target || "(none)"} — try: {repos.map((r) => r.repo).join(", ")}</span>]);
        } else {
          push([
            <span><span className="am">▸ opening</span> <a className="os-link" href={repo.url} target="_blank" rel="noreferrer">github.com/riz007/{repo.repo}</a> — every star feeds the agents <span className="am">★</span></span>,
          ]);
          window.open(repo.url, "_blank", "noopener");
        }
        break;
      }

      case "whoami":
        push([
          <span><span className="ac">{identity.name}</span></span>,
          <span>{identity.role}</span>,
          <span className="term-hint">{identity.location}</span>,
        ]);
        break;

      case "theme":
        if (arg === "dark" || arg === "light") { onTheme(arg); push([<span className="ok">theme → {arg}</span>]); }
        else { onTheme("toggle"); push([<span className="ok">theme toggled</span>]); }
        break;

      case "lang":
      case "locale":
        if (["en", "bn", "th", "zh", "de"].includes(arg)) { push([<span className="am">▸ switching locale → {arg}</span>]); onLang(arg); }
        else push([<span className="er">usage: lang en|bn|th|zh|de</span>]);
        break;

      case "contact":
      case "email":
        push([
          <span className="ac">links</span>,
          ...socials.map((s) => (
            <span key={s.url}>  {s.label.padEnd(10, " ")} <a className="os-link" href={s.url} target={s.url.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">{s.display || s.url.replace(/^(https?:\/\/|mailto:)/, "")}</a></span>
          )),
        ]);
        break;

      case "neofetch":
        push([
          <span className="ac">        ▄▄▄▄▄        {identity.name}</span>,
          <span className="ac">      ▄█▀   ▀█▄      ─────────────────</span>,
          <span className="ac">     █▀  ░▒▓  ▀█     os     RudraOS 2.6.0</span>,
          <span className="ac">     █▄  ▓▒░  ▄█     role   {identity.role}</span>,
          <span className="ac">      ▀█▄   ▄█▀      loc    {identity.location}</span>,
          <span className="ac">        ▀▀▀▀▀        shell  agent-sh</span>,
          <span>                     stack  {identity.stack}</span>,
          <span>                     mail   {identity.email}</span>,
        ]);
        break;

      case "sudo":
        push([<span className="er">nice try. agents don&apos;t need root — they need good tools. 🤖</span>]);
        break;

      case "date":
        push([<span>{new Date().toString()}</span>]);
        break;

      case "echo":
        push([<span>{rest.join(" ")}</span>]);
        break;

      case "clear":
      case "cls":
        setLines([]);
        break;

      case "exit":
        onClose();
        break;

      default:
        push([<span className="er">command not found: {cmd} — type `help`</span>]);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") { run(value); setValue(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const n = hi < 0 ? history.length - 1 : Math.max(0, hi - 1);
      setHi(n); setValue(history[n]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi < 0) return;
      const n = hi + 1;
      if (n >= history.length) { setHi(-1); setValue(""); } else { setHi(n); setValue(history[n]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = value.split(/\s+/);
      if (parts.length <= 1) {
        const cands = ["open", "ls", "whoami", "star", "neofetch", "theme", "lang", "contact", "clear", "help"].filter((c) => c.startsWith(parts[0]));
        if (cands.length === 1) setValue(cands[0] + " ");
      } else if (/^(open|run|spawn)$/i.test(parts[0])) {
        const cands = appIds.filter((a) => a.startsWith(parts[1] || ""));
        if (cands.length === 1) setValue(parts[0] + " " + cands[0]);
      } else if (/^star$/i.test(parts[0])) {
        const cands = repos.map((r) => r.repo).filter((a) => a.startsWith(parts[1] || ""));
        if (cands.length === 1) setValue(parts[0] + " " + cands[0]);
      }
    }
  };

  const suggestions = ["whoami", "open projects", "star larb", "neofetch", "help"];

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term-out" ref={outRef}>
        {lines.map((l) => <div className="term-line" key={l.id}>{l.node}</div>)}
      </div>
      <div className="term-input-row">
        <span className="term-prompt">agent{">"}</span>
        <input
          ref={inputRef}
          className="term-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal input"
          autoComplete="off"
          spellCheck="false"
          placeholder="type a command…"
        />
      </div>
      <div className="term-chipbar">
        {suggestions.map((s) => (
          <button key={s} className="term-chip" onClick={() => { run(s); inputRef.current?.focus(); }}>{s}</button>
        ))}
      </div>
    </div>
  );
}
