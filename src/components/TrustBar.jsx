const COMPANIES = ['Northwind', 'Basalt Foods', 'Fernwell', 'Orin Freight', 'Miralis', 'Kestrel Goods', 'Pallet & Co', 'Solace Homes']

export default function TrustBar() {
  const track = [...COMPANIES, ...COMPANIES]
  return (
    <section id="trust" className="py-14 border-y border-(--color-line)">
      <p className="text-center text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-7">
        Trusted by operations teams at
      </p>
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-(--color-bg) to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-(--color-bg) to-transparent z-10" />
        <div className="flex w-max animate-[marquee_28s_linear_infinite]">
          {track.map((name, i) => (
            <span
              key={i}
              className="font-display text-2xl text-(--color-ink-soft)/70 px-10 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
