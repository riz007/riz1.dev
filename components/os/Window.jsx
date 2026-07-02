"use client";

import { useRef } from "react";

const DOCK_SAFE = 96;

export default function Window({
  win,
  focused,
  isMobile,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  children,
}) {
  const drag = useRef(null);

  const startDrag = (e) => {
    // let the traffic-light buttons receive their clicks untouched
    if (e.target.closest(".os-lights")) return;
    if (isMobile || win.max) return;
    onFocus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    drag.current = { startX, startY, ox: win.x, oy: win.y };
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
  };

  const endDrag = (e) => {
    drag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const startResize = (e) => {
    e.stopPropagation();
    onFocus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const ow = win.w;
    const oh = win.h;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    const rs = { startX, startY, ow, oh };

    const onPM = (ev) => {
      onResize(win.id, {
        w: Math.max(260, rs.ow + (ev.clientX - rs.startX)),
        h: Math.max(150, rs.oh + (ev.clientY - rs.startY)),
      });
    };
    const onPU = (ev) => {
      try { e.currentTarget.releasePointerCapture(ev.pointerId); } catch {}
      e.currentTarget.removeEventListener("pointermove", onPM);
      e.currentTarget.removeEventListener("pointerup", onPU);
    };
    e.currentTarget.addEventListener("pointermove", onPM);
    e.currentTarget.addEventListener("pointerup", onPU);
  };

  const style = isMobile
    ? { zIndex: win.z }
    : win.max
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      className={`os-window${focused ? " focused" : ""}${win.max ? " max" : ""}${win.min ? " min" : ""}${win.closing ? " closing" : ""}`}
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
