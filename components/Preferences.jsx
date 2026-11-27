"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@ui-sdk/react/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import { palettes, defaultPalette, PALETTE_KEY } from "../data/palettes";
import { locales } from "../i18n/routing";

const THEME_KEY = "theme-preference";

export const LANGUAGE_NAMES = {
  en: "English",
  bn: "বাংলা",
  th: "ไทย",
  zh: "中文",
  de: "Deutsch",
};

function remember(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: the choice applies but doesn't persist.
  }
}

export function setTheme(mode) {
  const root = document.documentElement;
  const next =
    mode === "toggle" ? (root.getAttribute("data-theme") === "dark" ? "light" : "dark") : mode;
  root.setAttribute("data-theme", next);
  remember(THEME_KEY, next);
}

export function setPalette(id) {
  document.documentElement.setAttribute("data-palette", id);
  remember(PALETTE_KEY, id);
}

function subscribe(notify) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme", "data-palette"] });
  return () => observer.disconnect();
}

function useRootAttribute(name, fallback) {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute(name) || fallback,
    () => fallback
  );
}

export function ThemeButton({ className }) {
  const theme = useRootAttribute("data-theme", "light");
  const label = theme === "dark" ? "Light theme" : "Dark theme";
  return (
    <Button className={className} aria-label={label} onClick={() => setTheme("toggle")}>
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </Button>
  );
}

export function ColourMenu({ className }) {
  const palette = useRootAttribute("data-palette", defaultPalette);
  return (
    <Menu>
      <MenuTrigger className={className} aria-label="Colour">
        <span className="swatch" aria-hidden="true" />
      </MenuTrigger>
      <MenuContent align="end" sideOffset={6}>
        <MenuRadioGroup value={palette} onValueChange={setPalette}>
          {palettes.map((p) => (
            <MenuRadioItem key={p.id} value={p.id}>
              <span className="swatch" data-p={p.id} aria-hidden="true" />
              {p.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

export function LanguageMenu({ locale, className }) {
  const pathname = usePathname() || `/${locale}`;
  const hrefFor = (target) => {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/");
  };
  return (
    <Menu>
      <MenuTrigger className={className} aria-label={`${locale.toUpperCase()}, language`}>
        {locale.toUpperCase()}
      </MenuTrigger>
      <MenuContent align="end" sideOffset={6}>
        {locales.map((l) => (
          <MenuItem
            key={l}
            value={l}
            // A full load: client navigation re-renders <html> and drops the theme.
            render={
              <a href={hrefFor(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} />
            }
          >
            {LANGUAGE_NAMES[l]}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
