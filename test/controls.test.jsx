import { act, fireEvent, render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { beforeEach, expect, test, vi } from "vitest";
import { ColourMenu, LanguageMenu, ThemeButton } from "../components/Preferences";
import Spotlight from "../components/os/Spotlight";

const agent = createAgent();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.setAttribute("data-theme", "light");
  document.documentElement.setAttribute("data-palette", "ember");
});

function Controls() {
  return (
    <>
      <ColourMenu />
      <ThemeButton />
      <LanguageMenu locale="en" />
    </>
  );
}

test("an agent can find every preference and change colour and theme", async () => {
  render(<Controls />);
  const labels = agent.snapshot().filter((e) => !e.offPage).map((e) => e.label);
  expect(labels.every(Boolean)).toBe(true);
  for (const label of ["Colour", "Dark theme", "EN, language"]) expect(labels).toContain(label);

  // One act() per step: React has to render the open menu before its items exist.
  for (const step of [
    { ref: "Colour", action: "setOpen", args: [true] },
    { ref: "Colour", action: "press", args: ["Cobalt"] },
    { ref: "Dark theme", action: "press" },
  ]) {
    let result;
    await act(async () => {
      result = await agent.act({ steps: [step] });
    });
    expect(result.ok, result.error?.message).toBe(true);
  }
  expect(document.documentElement.dataset.palette).toBe("cobalt");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("palette-preference")).toBe("cobalt");
});

test("language items are real links with the current one marked", () => {
  render(<Controls />);
  fireEvent.click(screen.getByRole("button", { name: "EN, language" }));
  const german = screen.getByRole("menuitem", { name: "Deutsch" });
  expect(german.getAttribute("href")).toBe("/de");
  expect(screen.getByRole("menuitem", { name: "English" }).getAttribute("aria-current")).toBe("true");
});

test("search filters by hint and runs the chosen item", async () => {
  vi.useFakeTimers();
  const run = vi.fn();
  const onOpenChange = vi.fn();
  const items = [
    { type: "app", label: "about.md", hint: "open window", run: vi.fn() },
    { type: "repo", label: "Larb", hint: "coding agent", run },
  ];
  render(<Spotlight items={items} open onOpenChange={onOpenChange} />);
  const input = screen.getByRole("combobox", { name: /search apps/i });

  await act(async () => {
    fireEvent.change(input, { target: { value: "coding" } });
    await vi.runAllTimersAsync();
  });
  await act(async () => {
    fireEvent.keyDown(input, { key: "Enter" });
    await vi.runAllTimersAsync();
  });

  expect(run).toHaveBeenCalledOnce();
  expect(onOpenChange).toHaveBeenCalledWith(false);
  vi.useRealTimers();
});
