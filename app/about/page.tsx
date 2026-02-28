export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #5A47B1 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 text-xs text-lavender"
          style={{ border: "1px solid rgba(163,154,207,0.25)", background: "rgba(90,71,177,0.1)" }}>
          About proto paper
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-light text-light mb-8 leading-tight">
          From insight<br />to <span className="italic text-lavender">implementation</span>
        </h1>

        <div className="flex flex-col gap-8 text-light/70 leading-relaxed">
          <p className="text-lg">
            Research papers contain transformative ideas. Getting from a PDF to a running experiment
            traditionally takes days of careful reading, environment setup, and boilerplate code.
            Proto Paper compresses that timeline to seconds.
          </p>

          <p>
            Our engine parses the semantic structure of any ML/AI paper — extracting the core problem
            formulation, architecture decisions, dataset requirements, training configuration, and
            implementation details — then synthesizes them into ready-to-run scaffolding you can
            actually build on.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {[
              { emoji: "🔬", title: "For Researchers", desc: "Reproduce results faster. Spend time on experiments, not boilerplate." },
              { emoji: "🎓", title: "For Students", desc: "Understand landmark papers by seeing them as executable code." },
              { emoji: "🏢", title: "For Teams", desc: "Rapid prototyping of ideas from the latest literature." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl p-5 card-border"
                style={{ background: "rgba(29,19,96,0.25)" }}>
                <div className="text-2xl mb-3">{item.emoji}</div>
                <h3 className="text-light font-medium text-sm mb-2">{item.title}</h3>
                <p className="text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p>
            Proto Paper is built for the new era of AI-assisted research. We believe every researcher
            should have access to a tireless lab assistant that has read every paper, remembers every
            implementation detail, and can scaffold any experiment on demand.
          </p>

          <div className="rounded-2xl p-6 glow-border mt-4"
            style={{ background: "rgba(90,71,177,0.1)" }}>
            <p className="font-display text-2xl italic text-lavender mb-3">
              "The best way to understand a paper is to run it."
            </p>
            <p className="text-muted text-sm">— The proto paper philosophy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
