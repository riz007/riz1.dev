"use client";

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@ui-sdk/react/command";
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from "@ui-sdk/react/dialog";

const keyOf = (it) => `${it.type}:${it.label}`;

export default function Spotlight({ items, open, onOpenChange }) {
  const run = (value) => {
    const item = items.find((it) => keyOf(it) === value);
    onOpenChange(false);
    // Let the dialog hand focus back before the action moves it.
    setTimeout(() => item?.run(), 10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="os-spot">
        <DialogTitle className="os-spot-title">Search</DialogTitle>
        <Command onAction={run}>
          <CommandInput
            className="os-spot-input"
            aria-label="Search apps, posts, projects and links"
            placeholder="Search apps, posts, projects, links…"
          />
          <CommandEmpty className="os-spot-empty">
            No matches. Try a post title, project or app name.
          </CommandEmpty>
          <CommandList className="os-spot-list">
            {items.map((it) => (
              <CommandItem
                key={keyOf(it)}
                value={keyOf(it)}
                keywords={[it.hint, it.type].filter(Boolean)}
                className="os-spot-item"
              >
                <span className="os-spot-label">{it.label}</span>
                <span className="os-spot-badge">{it.type}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
