import { VoiceConsole } from "@/components/voice-console";
import { agentId, agentName } from "@/lib/agent";

const specs = [
  {
    label: "Agent ID",
    value: agentId,
  },
  {
    label: "Mode",
    value: "Next.js app with deferred widget loading",
  },
  {
    label: "Hosting",
    value: "Vercel or any Node-compatible platform",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <div className="orb orb-left" aria-hidden="true" />
      <div className="orb orb-right" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-dot" />
          <span className="eyebrow">Next.js conversational deployment</span>
        </div>
        <div className="agent-pill">{agentName}</div>
      </header>

      <div className="hero-grid">
        <section className="hero-copy">
          <p className="kicker">Voice-first support</p>
          <h1>Support that starts talking the moment your customer needs it.</h1>
          <p className="lede">
            This Next.js page is wired to your ElevenLabs agent and tuned to keep the initial
            experience lean. The landing content renders on the server, and the voice widget loads
            only when the user opens it.
          </p>

          <div className="hero-actions">
            <a href="#launch" className="primary-link">
              Launch the agent
            </a>
            <a
              href="https://elevenlabs.io/docs/eleven-agents"
              className="secondary-link"
              target="_blank"
              rel="noreferrer"
            >
              Read docs
            </a>
          </div>

          <dl className="spec-grid">
            {specs.map((spec) => (
              <div className="spec-card" key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="hero-panel" id="launch">
          <VoiceConsole />
        </section>
      </div>
    </main>
  );
}
