"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { APPS, DOCK, AppContent, Reader, dockIcon } from "./apps";
import Window from "./Window";
import Terminal from "./Terminal";
import "./os.css";

const LOCALES = ["en", "bn", "th", "zh", "de"];
const THEME_KEY = "theme-preference";

/* GitHub contribution calendar as ambient desktop art — pure decoration,
   sits behind the windows and fades toward the edges. */
function ContributionField({ levels }) {
  const CELL = 9;
  const GAP = 3;
  const weeks = [];
  for (let i = 0; i < levels.length; i += 7) weeks.push(levels.slice(i, i + 7));
  const w = weeks.length * (CELL + GAP);
  const h = 7 * (CELL + GAP);
  return (
    <div className="os-contrib" aria-hidden="true">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {weeks.map((week, x) =>
          week.map((lv, y) => (
            <rect
              key={`${x}-${y}`}
              className={`lv${lv}`}
              x={x * (CELL + GAP)}
              y={y * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx="2.5"
            />
          ))
        )}
      </svg>
      <span className="os-contrib-label">github.com/riz007 — last 12 months</span>
    </div>
  );
}

const BOOT_LINES = [
  "mounting /about /projects /experience",
  "loading knowledge base — 18 skills indexed",
  "linking tools: writing · algorithms · links",
  "agent online",
];

export default function Desktop({ locale, data }) {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [bootOut, setBootOut] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const [wins, setWins] = useState([]);
  const [focusId, setFocusId] = useState(null);
  const [clock, setClock] = useState("");
  const [running, setRunning] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const zTop = useRef(10);
  const uid = useRef(0);
  const runTimer = useRef(null);

  /* mount: mark OS active, size class, clock */
  useEffect(() => {
    document.documentElement.classList.add("os-active");
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }) +
          "  " +
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    tick();
    const t = setInterval(tick, 15000);
    return () => {
      document.documentElement.classList.remove("os-active");
      mq.removeEventListener("change", apply);
      clearInterval(t);
    };
  }, []);

  const pingAgent = useCallback(() => {
    setRunning(true);
    clearTimeout(runTimer.current);
    runTimer.current = setTimeout(() => setRunning(false), 750);
  }, []);

  const focusWin = useCallback((id) => {
    zTop.current += 1;
    const z = zTop.current;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z, min: false } : w)));
    setFocusId(id);
  }, []);

  const openApp = useCallback(
    (appId, override) => {
      pingAgent();
      setWins((ws) => {
        const existing = ws.find((w) => w.app === appId && !w.closing);
        zTop.current += 1;
        if (existing) {
          setFocusId(existing.id);
          return ws.map((w) => (w.id === existing.id ? { ...w, min: false, z: zTop.current } : w));
        }
        const meta = APPS.find((a) => a.id === appId);
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const w = Math.min(meta.w, vw - 32);
        const h = Math.min(meta.h, vh - 150);
        const n = ws.filter((x) => !x.closing).length;
        const pos = override || {
          x: Math.min(64 + n * 30, Math.max(24, vw - w - 24)),
          y: Math.min(58 + n * 26, Math.max(52, vh - h - 110)),
        };
        const id = ++uid.current;
        setFocusId(id);
        return [...ws, { id, app: appId, title: meta.title, icon: meta.icon, w, h, z: zTop.current, min: false, max: false, ...pos }];
      });
    },
    [pingAgent]
  );

  /* open a blog post in its own reader window (deduped per slug) */
  const openReader = useCallback(
    (post) => {
      pingAgent();
      setWins((ws) => {
        const existing = ws.find((w) => w.app === "reader" && w.payload?.slug === post.slug && !w.closing);
        zTop.current += 1;
        if (existing) {
          setFocusId(existing.id);
          return ws.map((w) => (w.id === existing.id ? { ...w, min: false, z: zTop.current } : w));
        }
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = Math.min(680, vw - 32);
        const h = Math.min(Math.round(vh * 0.78), vh - 130);
        const n = ws.filter((x) => !x.closing).length;
        const id = ++uid.current;
        setFocusId(id);
        return [
          ...ws,
          {
            id,
            app: "reader",
            payload: post,
            title: `writing/${post.slug}.md`,
            icon: "✎",
            w, h,
            z: zTop.current,
            min: false, max: false,
            x: Math.min(120 + n * 26, Math.max(24, vw - w - 24)),
            y: Math.min(54 + n * 20, Math.max(48, vh - h - 100)),
          },
        ];
      });
    },
    [pingAgent]
  );

  const closeWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, closing: true } : w)));
    setTimeout(() => setWins((ws) => ws.filter((w) => w.id !== id)), 200);
  }, []);

  const minimizeWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)));
  }, []);

  const maximizeWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max } : w)));
    focusWin(id);
  }, [focusWin]);

  const moveWin = useCallback((id, pos) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...pos } : w)));
  }, []);
  const resizeWin = useCallback((id, size) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...size } : w)));
  }, []);

  /* boot sequence */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("rudraos-booted");
    if (reduce || seen) {
      setBooted(true);
      return;
    }
    let step = 0;
    const iv = setInterval(() => {
      step += 1;
      setBootStep(step);
      if (step >= BOOT_LINES.length) {
        clearInterval(iv);
        setTimeout(finishBoot, 550);
      }
    }, 360);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishBoot = useCallback(() => {
    sessionStorage.setItem("rudraos-booted", "1");
    setBootOut(true);
    setTimeout(() => setBooted(true), 520);
  }, []);

  const skipBoot = () => { setBootStep(BOOT_LINES.length); finishBoot(); };

  /* after boot: auto-open the opening windows */
  const opened = useRef(false);
  useEffect(() => {
    if (!booted || opened.current) return;
    opened.current = true;
    const vw = window.innerWidth;
    if (window.matchMedia("(max-width: 720px)").matches) {
      openApp("about");
      openApp("terminal");
    } else {
      openApp("terminal", { x: 60, y: 70 });
      openApp("about", { x: Math.min(580, vw - 500), y: 130 });
      setShowHint(true);
      setTimeout(() => setShowHint(false), 6000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  /* theme + locale */
  const setTheme = useCallback((mode) => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = mode === "toggle" ? (cur === "dark" ? "light" : "dark") : mode;
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const switchLang = useCallback((code) => router.push(`/${code}`), [router]);

  /* global keys */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setCtx(null); setLangOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openApp("terminal"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openApp]);

  const onCtxMenu = (e) => {
    if (e.target.closest(".os-window")) return;
    e.preventDefault();
    setCtx({ x: Math.min(e.clientX, window.innerWidth - 190), y: Math.min(e.clientY, window.innerHeight - 220) });
  };

  const openIds = new Set(wins.filter((w) => !w.closing).map((w) => w.app));

  const identity = data.identity;
  const dockApps = DOCK.map((id) => APPS.find((a) => a.id === id)).filter(Boolean);

  return (
    <div className="rudra-os" onContextMenu={onCtxMenu} onClick={() => { setCtx(null); setLangOpen(false); }}>
      {/* ambient background */}
      <div className="os-bg" aria-hidden="true">
        <div className="os-blob a" /><div className="os-blob b" /><div className="os-blob c" />
        {data.contributions && <ContributionField levels={data.contributions} />}
      </div>

      {/* menu bar */}
      <div className="os-menubar">
        <span className="os-brand"><span className="os-brand-mark" />RudraOS</span>
        <button className="os-menu-item os-menu-desktop" onClick={() => openApp("about")}>about</button>
        <button className="os-menu-item os-menu-desktop" onClick={() => openApp("projects")}>projects</button>
        <button className="os-menu-item os-menu-desktop" onClick={() => openApp("terminal")}>terminal</button>
        <div className="os-menubar-spacer" />
        <span className={`os-status${running ? " running" : ""}`}>
          <span className="os-status-dot" />{running ? "running" : "idle"}
        </span>
        <button className="os-mbtn" onClick={(e) => { e.stopPropagation(); setTheme("toggle"); }}>◐</button>
        <div className="os-lang" onClick={(e) => e.stopPropagation()}>
          <button className="os-mbtn" onClick={() => setLangOpen((o) => !o)}>{locale}</button>
          {langOpen && (
            <div className="os-lang-menu">
              {LOCALES.map((l) => (
                <a key={l} className={l === locale ? "active" : ""} href={`/${l}`}
                   onClick={(e) => { e.preventDefault(); switchLang(l); }}>
                  {l.toUpperCase()}{l === locale ? " ✓" : ""}
                </a>
              ))}
            </div>
          )}
        </div>
        <span className="os-clock">{clock}</span>
      </div>

      {/* windows */}
      <div className="os-surface">
        {wins.map((w) => (
          <Window
            key={w.id}
            win={w}
            focused={focusId === w.id && !w.min}
            isMobile={isMobile}
            onFocus={focusWin}
            onClose={closeWin}
            onMinimize={minimizeWin}
            onMaximize={maximizeWin}
            onMove={moveWin}
            onResize={resizeWin}
          >
            {w.app === "terminal" ? (
              <Terminal
                apps={APPS.filter((a) => a.id !== "terminal").map((a) => ({ id: a.id, title: a.title }))}
                identity={identity}
                repos={data.projects}
                socials={data.socials}
                locale={locale}
                onOpen={openApp}
                onTheme={setTheme}
                onLang={switchLang}
                onClose={() => closeWin(w.id)}
              />
            ) : w.app === "reader" ? (
              <Reader post={w.payload} l={data.l} />
            ) : (
              <AppContent id={w.app} data={data} onOpen={openApp} onReadPost={openReader} />
            )}
          </Window>
        ))}
      </div>

      {/* first-load hint */}
      {showHint && !isMobile && (
        <div className="os-hint">tip: type <b>open projects</b> in the terminal, or press <b>⌘K</b></div>
      )}

      {/* dock */}
      <nav className="os-dock" aria-label="Application dock" onClick={(e) => e.stopPropagation()}>
        {dockApps.flatMap((a) => [
          ...(a.id === "blog" ? [<span className="os-dock-sep" key="dock-sep" />] : []),
          <button
            key={a.id}
            data-app={a.id}
            className={`os-dock-item${openIds.has(a.id) ? " open" : ""}`}
            onClick={() => openApp(a.id)}
            aria-label={`Open ${a.title}`}
          >
            <span className="os-dock-glyph" aria-hidden="true">{dockIcon(a.id)}</span>
            <span className="os-tip">{a.title}</span>
          </button>,
        ])}
      </nav>

      {/* context menu */}
      {ctx && (
        <div className="os-ctx" style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { openApp("terminal"); setCtx(null); }}>Open terminal <kbd>⌘K</kbd></button>
          <button onClick={() => { openApp("about"); setCtx(null); }}>About</button>
          <button onClick={() => { openApp("projects"); setCtx(null); }}>Projects</button>
          <button onClick={() => { openApp("blog"); setCtx(null); }}>Writing</button>
          <hr />
          <button onClick={() => { setTheme("toggle"); setCtx(null); }}>Toggle theme</button>
          <button onClick={() => { setWins([]); setFocusId(null); setCtx(null); }}>Close all windows</button>
        </div>
      )}

      {/* boot — quiet, mac-like: mark, progress, one status line */}
      {!booted && (
        <div className={`os-boot${bootOut ? " done" : ""}`} onClick={skipBoot}>
          <div className="os-boot-mark" aria-hidden="true">R</div>
          <div className="os-boot-name">RudraOS</div>
          <div className="os-boot-bar" role="progressbar" aria-label="Booting" aria-valuenow={Math.round((bootStep / BOOT_LINES.length) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${(bootStep / BOOT_LINES.length) * 100}%` }} />
          </div>
          <div className="os-boot-status">{BOOT_LINES[Math.min(bootStep, BOOT_LINES.length - 1)]}</div>
        </div>
      )}
    </div>
  );
}
