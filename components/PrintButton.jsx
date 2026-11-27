"use client";

import { Button } from "@ui-sdk/react/button";

export default function PrintButton() {
  return (
    <Button className="retro-btn" onClick={() => window.print()}>
      Print or save as PDF
    </Button>
  );
}
