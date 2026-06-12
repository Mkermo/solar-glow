/** Fixed film-grain overlay — the print-paper texture over the whole site. */
const GrainOverlay = () => (
  <div
    aria-hidden
    className="grain pointer-events-none fixed inset-0 z-[100] opacity-[0.05] mix-blend-overlay"
  />
);

export default GrainOverlay;
