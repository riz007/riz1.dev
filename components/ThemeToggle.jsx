"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme-preference";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial = saved || getSystemTheme();
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        const nextTheme = event.matches ? "dark" : "light";
        setTheme(nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
      }
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme}>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
