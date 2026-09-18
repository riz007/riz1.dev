"use client";

import { useEffect, useState } from "react";
import { palettes, defaultPalette, PALETTE_KEY } from "../data/palettes";

export default function PaletteSwitcher() {
  const [active, setActive] = useState(defaultPalette);

  useEffect(() => {
    const saved = document.documentElement.getAttribute("data-palette");
    if (saved) setActive(saved);
  }, []);

  const pick = (id) => {
    setActive(id);
    document.documentElement.setAttribute("data-palette", id);
    try {
      window.localStorage.setItem(PALETTE_KEY, id);
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  return (
    <div className="palette" role="group" aria-label="Colour">
      {palettes.map((p) => (
        <button
          key={p.id}
          type="button"
          className="palette-chip"
          data-p={p.id}
          aria-label={p.label}
          aria-pressed={active === p.id}
          title={p.label}
          onClick={() => pick(p.id)}
        />
      ))}
    </div>
  );
}
