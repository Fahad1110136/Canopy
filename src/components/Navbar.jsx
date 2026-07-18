import { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Menu, X, Leaf } from 'lucide-react'

const LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Live data', href: '#grid-intensity' },
  { label: 'Customers', href: '#testimonial' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24)
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-6xl px-5 flex items-center justify-between rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)] py-2.5 px-6'
            : 'py-1'
        }`}
      >
        <a href="#top" className="flex items-center gap-2 visible-focus">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white">
            <Leaf size={16} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg tracking-tight text-(--color-forest-deep)">Canopy</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-(--color-ink-soft) hover:text-(--color-forest-deep) transition-colors visible-focus"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-sm font-medium text-(--color-ink) hover:text-(--color-forest-deep) transition-colors visible-focus">
            Sign in
          </a>
          <a
            href="#cta"
            className="text-sm font-medium bg-(--color-forest) text-white px-4 py-2 rounded-full hover:bg-(--color-forest-deep) transition-colors visible-focus"
          >
            Start free trial
          </a>
        </div>

        <button
          className="md:hidden visible-focus p-1.5 -mr-1.5"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-4 mt-2 bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4"
          >
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base text-(--color-ink) visible-focus"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-(--color-line) my-1" />
            <a href="#" className="text-base text-(--color-ink) visible-focus">Sign in</a>
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="text-base font-medium bg-(--color-forest) text-white px-4 py-2.5 rounded-full text-center visible-focus"
            >
              Start free trial
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}







// import { useState, useEffect } from 'react'
// import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
// import { Menu, X, Leaf } from 'lucide-react'

// const LINKS = [
//   { label: 'Product', href: '#features' },
//   { label: 'How it works', href: '#how-it-works' },
//   { label: 'Dashboard', href: '#dashboard' },
//   { label: 'Customers', href: '#testimonial' },
// ]

// export default function Navbar() {
//   const [scrolled, setScrolled] = useState(false)
//   const [open, setOpen] = useState(false)
//   const { scrollY } = useScroll()

//   useMotionValueEvent(scrollY, 'change', (latest) => {
//     setScrolled(latest > 24)
//   })

//   useEffect(() => {
//     document.body.style.overflow = open ? 'hidden' : ''
//     return () => { document.body.style.overflow = '' }
//   }, [open])

//   return (
//     <motion.header
//       initial={{ y: -80, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
//       className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
//         scrolled ? 'py-3' : 'py-5'
//       }`}
//     >
//       <div
//         className={`mx-auto max-w-6xl px-5 flex items-center justify-between rounded-2xl transition-all duration-300 ${
//           scrolled
//             ? 'bg-white/80 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)] py-2.5 px-6'
//             : 'py-1'
//         }`}
//       >
//         <a href="#top" className="flex items-center gap-2 visible-focus">
//           <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white">
//             <Leaf size={16} strokeWidth={2.5} />
//           </span>
//           <span className="font-display text-lg tracking-tight text-(--color-forest-deep)">Canopy</span>
//         </a>

//         <nav className="hidden md:flex items-center gap-8">
//           {LINKS.map((link) => (
//             <a
//               key={link.label}
//               href={link.href}
//               className="text-sm text-(--color-ink-soft) hover:text-(--color-forest-deep) transition-colors visible-focus"
//             >
//               {link.label}
//             </a>
//           ))}
//         </nav>

//         <div className="hidden md:flex items-center gap-3">
//           <a href="#" className="text-sm font-medium text-(--color-ink) hover:text-(--color-forest-deep) transition-colors visible-focus">
//             Sign in
//           </a>
//           <a
//             href="#cta"
//             className="text-sm font-medium bg-(--color-forest) text-white px-4 py-2 rounded-full hover:bg-(--color-forest-deep) transition-colors visible-focus"
//           >
//             Start free trial
//           </a>
//         </div>

//         <button
//           className="md:hidden visible-focus p-1.5 -mr-1.5"
//           onClick={() => setOpen((o) => !o)}
//           aria-label={open ? 'Close menu' : 'Open menu'}
//           aria-expanded={open}
//         >
//           {open ? <X size={22} /> : <Menu size={22} />}
//         </button>
//       </div>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -12 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -12 }}
//             transition={{ duration: 0.25 }}
//             className="md:hidden mx-4 mt-2 bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4"
//           >
//             {LINKS.map((link) => (
//               <a
//                 key={link.label}
//                 href={link.href}
//                 onClick={() => setOpen(false)}
//                 className="text-base text-(--color-ink) visible-focus"
//               >
//                 {link.label}
//               </a>
//             ))}
//             <div className="h-px bg-(--color-line) my-1" />
//             <a href="#" className="text-base text-(--color-ink) visible-focus">Sign in</a>
//             <a
//               href="#cta"
//               onClick={() => setOpen(false)}
//               className="text-base font-medium bg-(--color-forest) text-white px-4 py-2.5 rounded-full text-center visible-focus"
//             >
//               Start free trial
//             </a>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.header>
//   )
// }
