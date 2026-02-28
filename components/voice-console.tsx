"use client";

import { startTransition, useId, useState } from "react";
import Script from "next/script";
import { agentId } from "@/lib/agent";

export function VoiceConsole() {
  const [enabled, setEnabled] = useState(false);
  const titleId = useId();

  const activateConsole = () => {
    startTransition(() => {
      setEnabled(true);
    });
  };

  return (
    <div className="panel-frame">
      <div className="panel-header">
        <span className="panel-label">Live console</span>
        <span className="panel-status">{enabled ? "Connecting" : "Idle"}</span>
      </div>

      <div className="widget-wrap" aria-labelledby={titleId}>
        <div className="widget-intro">
          <p id={titleId} className="widget-title">
            Start the support agent when you are ready.
          </p>
          <p className="widget-copy">
            The ElevenLabs script stays out of the initial page load and activates only when you
            open the voice console.
          </p>
        </div>

        {!enabled ? (
          <button className="primary-button" type="button" onClick={activateConsole}>
            Activate voice console
          </button>
        ) : (
          <>
            <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
            <elevenlabs-convai agent-id={agentId} className="convai-widget" />
          </>
        )}
      </div>

      <ul className="notes">
        <li>Use a secure origin in production so microphone access works reliably.</li>
        <li>The widget handles the live conversation flow and audio transport.</li>
        <li>Swap to the WebRTC SDK later if you need token-based voice control.</li>
      </ul>
    </div>
  );
}
