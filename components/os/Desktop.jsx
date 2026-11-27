"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@ui-sdk/react/button";
import { Menu, MenuContent, MenuContextTrigger, MenuItem, MenuSeparator } from "@ui-sdk/react/menu";
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar";
import { APPS, DOCK, AppContent, Reader } from "./apps";
import PixelIcon from "./PixelIcon";
import { ColourMenu, LanguageMenu, ThemeButton, setTheme } from "../Preferences";
import Window from "./Window";
import Terminal from "./Terminal";
import Spotlight from "./Spotlight";
import "./os.css";

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
  "loading knowledge base — 20 skills indexed",
  "linking tools: writing, algorithms, links",
  "agent online",
];

export default function Desktop({ locale, data }) {
  const [booted, setBooted] = useState(false);
  const [bootOut, setBootOut] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const [wins, setWins] = useState([]);
  const [focusId, setFocusId] = useState(null);
  const [clock, setClock] = useState("");
  const [running, setRunning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null);
  const [spotOpen, setSpotOpen] = useState(false);
  // after tiling to one half, offer the remaining windows for the other half
  const [partnerPick, setPartnerPick] = useState(null); // { side, excludeId }
  // Mission Control: winId → { tx, ty, s, slot } while the overview is open
  const [ovMap, setOvMap] = useState(null);
  const zTop = useRef(10);
  const winsRef = useRef([]);
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
    (appId, override, { takeFocus = true } = {}) => {
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
          return ws.map((w) =>
            w.id === existing.id ? { ...w, min: false, takeFocus: true, z: zTop.current } : w
          );
        }
        const meta = APPS.find((a) => a.id === appId);
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const heroRight = document.querySelector(".os-hero")?.getBoundingClientRect().right || 0;
        const left = vw - heroRight > meta.w + 40 ? Math.round(heroRight) + 24 : 64;
        const w = Math.min(meta.w, vw - 32);
        const h = Math.min(meta.h, vh - 150);
        const n = ws.filter((x) => !x.closing).length;
        const pos = override || {
          x: Math.min(left + n * 30, Math.max(24, vw - w - 24)),
          y: Math.min(58 + n * 26, Math.max(52, vh - h - 110)),
        };
        const id = ++uid.current;
        setFocusId(id);
        return [...ws, { id, app: appId, title: meta.title, w, h, takeFocus, z: zTop.current, min: false, max: false, ...pos }];
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
            takeFocus: true,
            title: `writing/${post.slug}.md`,
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
    const app = winsRef.current.find((w) => w.id === id)?.app;
    if (document.activeElement?.closest(`.os-window[data-winid="${id}"]`)) {
      document.querySelector(`.os-dock-item[data-app="${app === "reader" ? "blog" : app}"]`)?.focus();
    }
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
        setTimeout(finishBoot, 120);
      }
    }, 180);
    const skip = () => { clearInterval(iv); finishBoot(); };
    window.addEventListener("keydown", skip, { once: true });
    return () => { clearInterval(iv); window.removeEventListener("keydown", skip); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishBoot = useCallback(() => {
    sessionStorage.setItem("rudraos-booted", "1");
    setBootOut(true);
    setTimeout(() => setBooted(true), 300);
  }, []);

  const skipBoot = () => { setBootStep(BOOT_LINES.length); finishBoot(); };

  /* after boot: the profile card is already on the desktop, so only wide
     screens get a second window */
  const opened = useRef(false);
  useEffect(() => {
    if (!booted || opened.current) return;
    opened.current = true;
    if (window.matchMedia("(max-width: 720px)").matches) return;
    if (window.innerWidth >= 1200) openApp("terminal", null, { takeFocus: false });
    setShowHint(true);
    setTimeout(() => setShowHint(false), 6000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  /* Mission Control — lay every open window out in a centred grid.
     Geometry comes from state (not DOM rects), so windows mid-transition
     still map to correct slots. */
  const closeOverview = useCallback(() => setOvMap(null), []);

  useEffect(() => { winsRef.current = wins; }, [wins]);

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
      if (e.key === "Escape") { setPartnerPick(null); closeOverview(); }
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
      if (e.target.closest(".os-window, .os-dock, .os-spot, .os-menubar, .os-partner, .os-hero, [data-slot=menu-content]")) return;
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

  /* everything Spotlight can find */
  const spotItems = useMemo(
    () => [
      ...APPS.map((a) => ({
        type: "app",
        label: a.title,
        hint: "open window",
        run: () => openApp(a.id),
      })),
      ...data.posts.map((p) => ({
        type: "post",
        label: p.title,
        hint: `${p.date} · ${p.readingTime} min read`,
        run: () => openReader(p),
      })),
      ...data.projects.map((p) => ({
        type: "repo",
        label: p.name,
        hint: p.tagline,
        run: () => window.open(p.url, "_blank", "noopener"),
      })),
      ...data.links.map((lk) => ({
        type: "link",
        label: lk.title,
        hint: lk.url.replace(/^https?:\/\//, "").split("/")[0],
        run: () => window.open(lk.url, "_blank", "noopener"),
      })),
      { type: "action", label: "Toggle appearance", hint: "light / dark", run: () => setTheme("toggle") },
      { type: "action", label: "Email Rizwanul", hint: data.identity.email, run: () => { window.location.href = `mailto:${data.identity.email}`; } },
    ],
    [data, openApp, openReader]
  );

  const openIds = new Set(wins.filter((w) => !w.closing).map((w) => w.app));

  const partnerCands = partnerPick
    ? wins.filter((w) => !w.closing && w.id !== partnerPick.excludeId)
    : [];

  const identity = data.identity;

  const onMenuAction = (value) => {
    // Runs after the menu closes and has restored focus.
    setTimeout(() => {
      if (value === "search") setSpotOpen(true);
      else if (value === "overview") openOverview();
      else if (value === "theme") setTheme("toggle");
      else if (value === "close-all") { setWins([]); setFocusId(null); }
      else openApp(value);
    }, 10);
  };

  const starts = [
    { who: "Hiring", what: "Experience and roles", href: `/${locale}/profile#h-experience` },
    { who: "Leadership", what: "Capabilities and scope", href: `/${locale}/profile#h-capabilities` },
    { who: "Developers", what: "Open-source projects", href: `/${locale}/profile#h-projects` },
    { who: "Readers", what: "Writing on AI and systems", href: `/${locale}/blog` },
  ];

  return (
    <div className={`rudra-os${ovMap ? " ov" : ""}`} onClick={() => setPartnerPick(null)}>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* ambient background */}
      <div className="os-bg" aria-hidden="true">
        {data.contributions && <ContributionField levels={data.contributions} />}
      </div>

      {/* menu bar */}
      <header className="os-menubar">
        <span className="os-brand">RudraOS</span>
        <nav className="os-menu-links" aria-label="Primary">
          <Link className="os-menu-item" href={`/${locale}/profile`}>Profile</Link>
          <Link className="os-menu-item" href={`/${locale}/blog`}>Writing</Link>
          <Link className="os-menu-item os-menu-wide" href={`/${locale}/links`}>Links</Link>
        </nav>
        <div className="os-menubar-spacer" />
        <span className={`os-status${running ? " running" : ""}`} aria-hidden="true">
          <span className="os-status-dot" />{running ? "running" : "idle"}
        </span>
        <Button className="os-mbtn" onClick={() => setSpotOpen(true)} aria-keyshortcuts="Meta+K Control+K">
          Search<kbd className="os-menu-wide">⌘K</kbd>
        </Button>
        <ColourMenu className="os-mbtn" />
        <ThemeButton className="os-mbtn" />
        <LanguageMenu className="os-mbtn" locale={locale} />
        <span className="os-clock">{clock}</span>
      </header>

      <Menu onAction={onMenuAction}>
        <MenuContextTrigger render={<main className="os-surface" id="main" tabIndex={-1} />}>
          <section className="os-hero" aria-labelledby="hero-name">
            <div className="titlebar" aria-hidden="true"><span>read_me.txt</span></div>
            <div className="os-hero-body">
              <h1 className="os-hero-name" id="hero-name">{identity.name}</h1>
              <p className="os-hero-role">{identity.role}</p>
              <p className="os-hero-bio">{identity.bio}</p>
              <dl className="os-hero-facts">
                <div><dt>Based in</dt><dd>{identity.location}</dd></div>
                <div><dt>Experience</dt><dd>10+ years</dd></div>
                <div><dt>Stack</dt><dd>{identity.stack}</dd></div>
                <div><dt>Education</dt><dd>{identity.education}</dd></div>
              </dl>
              <div className="os-hero-actions">
                <a className="retro-btn primary" href={`mailto:${identity.email}`}>Email me</a>
                <Link className="retro-btn" href={`/${locale}/profile`}>Full profile</Link>
                <a className="retro-btn" href={identity.github} target="_blank" rel="noreferrer">GitHub ↗</a>
                <a className="retro-btn" href={identity.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
              </div>
              <nav aria-label="Start here">
                <ul className="os-starts">
                  {starts.map((start) => (
                    <li key={start.who}>
                      <Link href={start.href}>
                        <b>{start.who}</b>
                        <span>{start.what}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </section>

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
                onLang={(code) => window.location.assign(`/${code}`)}
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
                  type="button"
                  key={w.id}
                  className="os-partner-card"
                  onClick={() => {
                    snapWin(w.id, partnerPick.side, { suggest: false });
                    focusWin(w.id);
                  }}
                >
                  <PixelIcon name={w.app === "reader" ? "blog" : w.app} />
                  <span className="os-partner-t">{w.title}</span>
                </button>
              ))}
            </div>
            <div className="os-partner-hint">esc to dismiss</div>
          </div>
        )}
        </MenuContextTrigger>
        <MenuContent>
          <MenuItem value="search">Search</MenuItem>
          <MenuItem value="overview">Mission Control</MenuItem>
          <MenuItem value="terminal">Open terminal</MenuItem>
          <MenuItem value="about">About</MenuItem>
          <MenuItem value="projects">Projects</MenuItem>
          <MenuItem value="blog">Writing</MenuItem>
          <MenuSeparator />
          <MenuItem value="theme">Toggle theme</MenuItem>
          <MenuItem value="close-all">Close all windows</MenuItem>
        </MenuContent>
      </Menu>

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
                  <PixelIcon name={w.app === "reader" ? "blog" : w.app} size={12} />
                  {w.title}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* first-load hint */}
      {showHint && !isMobile && (
        <aside className="os-hint">Press <b>⌘K</b> to search. Drag a window to a screen edge to tile it.</aside>
      )}

      <Spotlight items={spotItems} open={spotOpen} onOpenChange={setSpotOpen} />

      {/* dock */}
      <nav className="os-dock-nav" aria-label="Apps">
        <Toolbar className="os-dock" aria-label="Apps" onClick={(e) => e.stopPropagation()}>
          {DOCK.map(({ id, label }) => (
            <ToolbarButton
              key={id}
              data-app={id}
              className={`os-dock-item${openIds.has(id) ? " open" : ""}`}
              onClick={() => openApp(id)}
            >
              <PixelIcon name={id} />
              <span>{label}</span>
            </ToolbarButton>
          ))}
        </Toolbar>
      </nav>

      {/* boot — quiet, mac-like: mark, progress, one status line */}
      <noscript><style>{".os-boot{display:none}"}</style></noscript>
      {!booted && (
        <div className={`os-boot${bootOut ? " done" : ""}`} onClick={skipBoot}>
          <div className="os-boot-mark" aria-hidden="true"><PixelIcon name="terminal" size={48} /></div>
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
