"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { APPS, DOCK, AppContent, Reader, dockIcon } from "./apps";
import Window from "./Window";
import Terminal from "./Terminal";
import Spotlight from "./Spotlight";
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
  const [snapPreview, setSnapPreview] = useState(null);
  const [spotOpen, setSpotOpen] = useState(false);
  // after tiling to one half, offer the remaining windows for the other half
  const [partnerPick, setPartnerPick] = useState(null); // { side, excludeId }
  // Mission Control: winId → { tx, ty, s, slot } while the overview is open
  const [ovMap, setOvMap] = useState(null);
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
    setOvMap(null); // opening anything exits Mission Control
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
          if (existing.min) {
            // reverse genie out of the dock
            setTimeout(() => {
              setWins((ws2) => ws2.map((w) => (w.id === existing.id ? { ...w, restoring: false } : w)));
            }, 330);
            return ws.map((w) =>
              w.id === existing.id ? { ...w, min: false, restoring: true, z: zTop.current } : w
            );
          }
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
          if (existing.min) {
            setTimeout(() => {
              setWins((ws2) => ws2.map((w) => (w.id === existing.id ? { ...w, restoring: false } : w)));
            }, 330);
            return ws.map((w) =>
              w.id === existing.id ? { ...w, min: false, restoring: true, z: zTop.current } : w
            );
          }
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

  /* minimize with a genie-style dive into the window's dock icon */
  const minimizeWin = useCallback((id) => {
    setWins((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        const el = document.querySelector(`.os-window[data-winid="${id}"]`);
        const dockEl = document.querySelector(
          `.os-dock-item[data-app="${w.app === "reader" ? "blog" : w.app}"]`
        );
        let tx = 0;
        let ty = 320;
        if (el) {
          const r = el.getBoundingClientRect();
          if (dockEl) {
            const d = dockEl.getBoundingClientRect();
            tx = d.x + d.width / 2 - (r.x + r.width / 2);
            ty = d.y + d.height / 2 - (r.y + r.height / 2);
          } else {
            ty = window.innerHeight - (r.y + r.height / 2);
          }
        }
        return { ...w, minimizing: true, minTx: tx, minTy: ty };
      })
    );
    setTimeout(() => {
      setWins((ws) =>
        ws.map((w) => (w.id === id ? { ...w, minimizing: false, min: true } : w))
      );
    }, 330);
  }, []);

  const maximizeWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max } : w)));
    focusWin(id);
  }, [focusWin]);

  const moveWin = useCallback((id, pos) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...pos } : w)));
  }, []);
  const resizeWin = useCallback((id, size) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...size, snapped: null } : w)));
  }, []);

  /* edge tiling: left/right halves with Sequoia-style margins; top maximizes.
     opts.suggest=false skips the partner picker (used by the picker itself). */
  const snapWin = useCallback((id, zone, opts = {}) => {
    const vw = window.innerWidth;
    const sh = window.innerHeight - 36;
    const M = 10; // outer margin
    const G = 5;  // half-gap between tiles
    setWins((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        const prevW = w.snapped ? w.prevW : w.w;
        const prevH = w.snapped ? w.prevH : w.h;
        if (zone === "top") return { ...w, max: true, prevW, prevH };
        const half = Math.floor((vw - M * 2 - G * 2) / 2);
        const rect =
          zone === "left"
            ? { x: M, y: M, w: half, h: sh - M * 2 }
            : { x: M + half + G * 2, y: M, w: half, h: sh - M * 2 };
        return { ...w, ...rect, snapped: zone, prevW, prevH, max: false, min: false };
      })
    );
    if ((zone === "left" || zone === "right") && opts.suggest !== false) {
      setPartnerPick({ side: zone === "left" ? "right" : "left", excludeId: id });
    } else {
      setPartnerPick(null);
    }
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

  /* Mission Control — lay every open window out in a centred grid.
     Geometry comes from state (not DOM rects), so windows mid-transition
     still map to correct slots. */
  const closeOverview = useCallback(() => setOvMap(null), []);

  const winsRef = useRef(wins);
  winsRef.current = wins;

  const openOverview = useCallback(() => {
    if (window.matchMedia("(max-width: 720px)").matches) return;
    const top = 36;
    const vw = window.innerWidth;
    const vh = window.innerHeight - top;
    const open = winsRef.current.filter((w) => !w.min && !w.closing && !w.minimizing);
    if (!open.length) return;
    const n = open.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const pad = 44;
    const gapX = 26;
    const gapY = 30;
    const labelH = 34;
    const cellW = (vw - pad * 2 - gapX * (cols - 1)) / cols;
    const cellH = (vh - pad * 2 - gapY * (rows - 1)) / rows;
    const map = {};
    open.forEach((w, i) => {
      const r = w.max
        ? { x: 0, y: top, w: vw, h: vh }
        : { x: w.x, y: w.y + top, w: w.w, h: w.h };
      const row = Math.floor(i / cols);
      const colInRow = i - row * cols;
      const lastRowCount = n - (rows - 1) * cols;
      const offsetX = row === rows - 1 ? ((cols - lastRowCount) * (cellW + gapX)) / 2 : 0;
      const slotX = pad + offsetX + colInRow * (cellW + gapX);
      const slotY = top + pad + row * (cellH + gapY);
      const s = Math.min(cellW / r.w, (cellH - labelH) / r.h, 0.9);
      map[w.id] = {
        tx: slotX + cellW / 2 - (r.x + r.w / 2),
        ty: slotY + (cellH - labelH) / 2 - (r.y + r.h / 2),
        s,
        slot: { x: slotX, y: slotY, w: cellW, h: cellH },
      };
    });
    setOvMap(map);
  }, []);

  /* global keys — ⌘K / ⌘Space open Spotlight (macOS itself usually owns
     literal ⌘Space, so ⌘K is the reliable binding); ⌃↑ / ⌃↓ for Mission Control */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setCtx(null); setLangOpen(false); setSpotOpen(false); setPartnerPick(null); closeOverview(); }
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "k" || e.code === "Space")) {
        e.preventDefault();
        setSpotOpen((o) => !o);
      }
      if (e.ctrlKey && e.key === "ArrowUp") { e.preventDefault(); openOverview(); }
      if (e.ctrlKey && e.key === "ArrowDown") { e.preventDefault(); closeOverview(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openOverview, closeOverview]);

  /* trackpad gesture: two-finger swipe up on the desktop background opens
     the overview, swipe down closes it (browsers can't see OS-level
     three-finger swipes, so the wheel stream is the faithful equivalent) */
  const wheelAcc = useRef({ v: 0, t: null });
  useEffect(() => {
    const onWheel = (e) => {
      if (e.target.closest(".os-window, .os-dock, .os-spot, .os-menubar, .os-partner")) return;
      const a = wheelAcc.current;
      a.v += e.deltaY;
      clearTimeout(a.t);
      a.t = setTimeout(() => { a.v = 0; }, 260);
      if (a.v < -140) { a.v = 0; openOverview(); }
      else if (a.v > 140) { a.v = 0; closeOverview(); }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => { window.removeEventListener("wheel", onWheel); clearTimeout(wheelAcc.current.t); };
  }, [openOverview, closeOverview]);

  const onCtxMenu = (e) => {
    if (e.target.closest(".os-window")) return;
    e.preventDefault();
    setCtx({ x: Math.min(e.clientX, window.innerWidth - 190), y: Math.min(e.clientY, window.innerHeight - 220) });
  };

  /* everything Spotlight can find */
  const spotItems = useMemo(
    () => [
      ...APPS.map((a) => ({
        type: "app",
        label: a.title,
        hint: "open window",
        icon: a.icon,
        run: () => openApp(a.id),
      })),
      ...data.posts.map((p) => ({
        type: "post",
        label: p.title,
        hint: `${p.date} · ${p.readingTime} min read`,
        icon: "✎",
        run: () => openReader(p),
      })),
      ...data.projects.map((p) => ({
        type: "repo",
        label: p.name,
        hint: p.tagline,
        icon: "❒",
        run: () => window.open(p.url, "_blank", "noopener"),
      })),
      ...data.links.map((lk) => ({
        type: "link",
        label: lk.title,
        hint: lk.url.replace(/^https?:\/\//, "").split("/")[0],
        icon: "⚯",
        run: () => window.open(lk.url, "_blank", "noopener"),
      })),
      { type: "action", label: "Toggle appearance", hint: "light / dark", icon: "◐", run: () => setTheme("toggle") },
      { type: "action", label: "Email Rizwanul", hint: data.identity.email, icon: "✉", run: () => { window.location.href = `mailto:${data.identity.email}`; } },
    ],
    [data, openApp, openReader, setTheme]
  );

  const openIds = new Set(wins.filter((w) => !w.closing).map((w) => w.app));

  const partnerCands = partnerPick
    ? wins.filter((w) => !w.closing && w.id !== partnerPick.excludeId)
    : [];

  const identity = data.identity;
  const dockApps = DOCK.map((id) => APPS.find((a) => a.id === id)).filter(Boolean);

  return (
    <div className={`rudra-os${ovMap ? " ov" : ""}`} onContextMenu={onCtxMenu} onClick={() => { setCtx(null); setLangOpen(false); setPartnerPick(null); }}>
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
        <button className="os-mbtn" onClick={(e) => { e.stopPropagation(); setSpotOpen(true); }} aria-label="Search (⌘K)">⌕</button>
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
        {snapPreview && !isMobile && (
          <div className={`os-snap-preview ${snapPreview}`} aria-hidden="true" />
        )}
        {wins.map((w) => (
          <Window
            key={w.id}
            win={w}
            focused={focusId === w.id && !w.min}
            isMobile={isMobile}
            ov={ovMap ? ovMap[w.id] : null}
            onFocus={focusWin}
            onClose={closeWin}
            onMinimize={minimizeWin}
            onMaximize={maximizeWin}
            onMove={moveWin}
            onResize={resizeWin}
            onSnapPreview={setSnapPreview}
            onSnap={snapWin}
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

        {/* split-view partner picker — fill the other half */}
        {partnerPick && !isMobile && partnerCands.length > 0 && (
          <div
            className={`os-partner ${partnerPick.side}`}
            role="dialog"
            aria-label="Choose a window for the other side"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="os-partner-label">Choose a window for this side</div>
            <div className="os-partner-grid">
              {partnerCands.map((w) => (
                <button
                  key={w.id}
                  className="os-partner-card"
                  onClick={() => {
                    snapWin(w.id, partnerPick.side, { suggest: false });
                    focusWin(w.id);
                  }}
                >
                  <span className="os-partner-ico" data-app={w.app === "reader" ? "blog" : w.app} aria-hidden="true">
                    {w.icon}
                  </span>
                  <span className="os-partner-t">{w.title}</span>
                </button>
              ))}
            </div>
            <div className="os-partner-hint">esc to dismiss</div>
          </div>
        )}
      </div>

      {/* mission control — click targets + labels above the scaled windows */}
      {ovMap && (
        <div className="os-ov-layer" onClick={closeOverview}>
          {Object.entries(ovMap).map(([wid, m]) => {
            const w = wins.find((x) => String(x.id) === wid);
            if (!w) return null;
            return (
              <button
                key={wid}
                className="os-ov-hit"
                style={{ left: m.slot.x, top: m.slot.y, width: m.slot.w, height: m.slot.h }}
                onClick={(e) => { e.stopPropagation(); closeOverview(); focusWin(w.id); }}
              >
                <span className="os-ov-label">
                  <span className="os-ov-label-ico" aria-hidden="true">{w.icon}</span>
                  {w.title}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* first-load hint */}
      {showHint && !isMobile && (
        <div className="os-hint">tip: press <b>⌘K</b> to search · drag a window to a screen edge to tile it</div>
      )}

      {/* spotlight */}
      {spotOpen && <Spotlight items={spotItems} onClose={() => setSpotOpen(false)} />}

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
          <button onClick={() => { setSpotOpen(true); setCtx(null); }}>Search <kbd>⌘K</kbd></button>
          <button onClick={() => { setCtx(null); openOverview(); }}>Mission Control <kbd>⌃↑</kbd></button>
          <button onClick={() => { openApp("terminal"); setCtx(null); }}>Open terminal</button>
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
