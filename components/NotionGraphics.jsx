"use client";

import { createAvatar } from "@dicebear/core";
import { shapes } from "@dicebear/collection";
import { useMemo } from "react";

function AbstractBlob({ seed }) {
  const uri = useMemo(
    () =>
      createAvatar(shapes, {
        seed,
        size: 320
      }).toDataUri(),
    [seed]
  );

  return <img src={uri} alt="" />;
}

function DoodleScene({ className = "", seed = "riz1" }) {
  return (
    <div className={`doodle-scene ${className}`}>
      <div className="doodle-shell">
        <div className="abstract-stack">
          <div className="abstract-layer layer-primary">
            <AbstractBlob seed={`${seed}-primary`} />
          </div>
          <div className="abstract-layer layer-secondary">
            <AbstractBlob seed={`${seed}-secondary`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotionOrbitalGraphic() {
  return <DoodleScene className="doodle-scene-hero" seed="rizwan-focus" />;
}

export function NotionFlowGraphic() {
  return <DoodleScene className="doodle-scene-flow" seed="rizwan-collab" />;
}
