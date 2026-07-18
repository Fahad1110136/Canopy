import { Leaf } from 'lucide-react'

const COLUMNS = [
  { title: 'Product', links: ['Features', 'Dashboard', 'Integrations', 'Pricing'] },
  { title: 'Company', links: ['About', 'Customers', 'Careers', 'Press'] },
  { title: 'Resources', links: ['Documentation', 'CSRD guide', 'API reference', 'Status'] },
]

export default function Footer() {
  return (
    <footer className="px-6 pt-16 pb-8 border-t border-(--color-line)">
      <div className="mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white">
                <Leaf size={16} strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg text-(--color-forest-deep)">Canopy</span>
            </div>
            <p className="mt-4 text-sm text-(--color-ink-soft) max-w-[220px] leading-relaxed">
              Carbon intelligence for growing companies.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-(--color-ink) hover:text-(--color-forest-deep) visible-focus">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-(--color-line) flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-(--color-ink-soft)">© 2026 Canopy Technologies, Inc.</p>
          <div className="flex gap-6 text-xs text-(--color-ink-soft)">
            <a href="#" className="hover:text-(--color-forest-deep) visible-focus">Privacy</a>
            <a href="#" className="hover:text-(--color-forest-deep) visible-focus">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
