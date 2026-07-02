"use client";

import { useRef, useState } from "react";

const DOCK_SAFE = 96;
const MENUBAR = 36;
const SNAP_EDGE = 14;

export default function Window({
  win,
  focused,
  isMobile,
  ov,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  onSnapPreview,
  onSnap,
  children,
}) {
  const drag = useRef(null);
  // suppresses the position transition while the user is actively dragging/resizing
  const [live, setLive] = useState(false);

  const startDrag = (e) => {
    // let the traffic-light buttons receive their clicks untouched
    if (e.target.closest(".os-lights")) return;
    if (isMobile || win.max) return;
    onFocus(win.id);
    let ox = win.x;
    let oy = win.y;
    if (win.snapped) {
      // dragging a tiled window away restores its pre-snap size under the cursor
      const rw = win.prevW || Math.min(480, window.innerWidth - 32);
      const rh = win.prevH || 380;
      ox = Math.min(Math.max(8, Math.round(e.clientX - rw / 2)), window.innerWidth - rw - 8);
      oy = Math.max(0, e.clientY - MENUBAR - 19);
      onMove(win.id, { x: ox, y: oy, w: rw, h: rh, snapped: null });
    }
    drag.current = { startX: e.clientX, startY: e.clientY, ox, oy, zone: null };
    setLive(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const moveDrag = (e) => {
    if (!drag.current) return;
    const d = drag.current;
    const nx = d.ox + (e.clientX - d.startX);
    const ny = d.oy + (e.clientY - d.startY);
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - DOCK_SAFE;
    onMove(win.id, {
      x: Math.max(-win.w + 120, Math.min(nx, maxX)),
      y: Math.max(0, Math.min(ny, maxY)),
    });
    // edge zones: sides tile to half-screen, the top edge maximizes
    let zone = null;
    if (e.clientX <= SNAP_EDGE) zone = "left";
    else if (e.clientX >= window.innerWidth - SNAP_EDGE) zone = "right";
    else if (e.clientY <= MENUBAR + 8) zone = "top";
    if (zone !== d.zone) {
      d.zone = zone;
      onSnapPreview(zone);
    }
  };

  const endDrag = (e) => {
    const zone = drag.current?.zone;
    drag.current = null;
    setLive(false);
    onSnapPreview(null);
    if (zone) onSnap(win.id, zone);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const startResize = (e) => {
    e.stopPropagation();
    onFocus(win.id);
    setLive(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const ow = win.w;
    const oh = win.h;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    const rs = { startX, startY, ow, oh };

    const onPM = (ev) => {
      onResize(win.id, {
        w: Math.max(280, rs.ow + (ev.clientX - rs.startX)),
        h: Math.max(160, rs.oh + (ev.clientY - rs.startY)),
      });
    };
    const onPU = (ev) => {
      setLive(false);
      try { e.currentTarget.releasePointerCapture(ev.pointerId); } catch {}
      e.currentTarget.removeEventListener("pointermove", onPM);
      e.currentTarget.removeEventListener("pointerup", onPU);
    };
    e.currentTarget.addEventListener("pointermove", onPM);
    e.currentTarget.addEventListener("pointerup", onPU);
  };

  const base = isMobile
    ? { zIndex: win.z }
    : win.max
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  const style = {
    ...base,
    // genie targets for minimize/restore animations
    ...(win.minimizing || win.restoring
      ? { "--min-tx": `${win.minTx || 0}px`, "--min-ty": `${win.minTy || 0}px` }
      : {}),
    // Mission Control slot transform
    ...(ov ? { transform: `translate(${ov.tx}px, ${ov.ty}px) scale(${ov.s})` } : {}),
  };

  return (
    <section
      data-winid={win.id}
      className={`os-window${focused ? " focused" : ""}${win.max ? " max" : ""}${win.min ? " min" : ""}${win.closing ? " closing" : ""}${live ? " live" : ""}${win.minimizing ? " minimizing" : ""}${win.restoring ? " restoring" : ""}${ov ? " ov" : ""}`}
      style={style}
      onPointerDown={() => onFocus(win.id)}
      role="dialog"
      aria-label={win.title}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(win.id); }}
      tabIndex={-1}
    >
      <header
        className="os-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onDoubleClick={(e) => {
          if (e.target.closest(".os-lights")) return;
          if (!isMobile) onMaximize(win.id);
        }}
      >
        {/* isolate the traffic lights from the titlebar's drag handling */}
        <div
          className="os-lights"
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <button className="os-light red" aria-label="Close window" onClick={() => onClose(win.id)}><span>×</span></button>
          <button className="os-light yellow" aria-label="Minimize window" onClick={() => onMinimize(win.id)}><span>–</span></button>
          <button className="os-light green" aria-label="Maximize window" onClick={() => onMaximize(win.id)}><span>+</span></button>
        </div>
        <span className="os-title">
          <span className="os-title-ico">{win.icon}</span>
          {win.title}
        </span>
      </header>

      <div className="os-body">{children}</div>

      {!isMobile && !win.max && (
        <div className="os-resize" onPointerDown={startResize} aria-hidden="true" />
      )}
    </section>
  );
}
