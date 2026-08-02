import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:
      "We went from a spreadsheet updated twice a year to a live number the whole operations team checks weekly. Our CSRD filing took two days instead of six weeks.",
    name: 'Renata Marsh',
    role: 'Head of Sustainability, Basalt Foods',
    initials: 'RM',
  },
  {
    quote:
      "Our auditors used to push back on every figure we submitted. Now they see the same dashboard we do, so the conversation is about strategy, not spreadsheets.",
    name: 'Idris Okafor',
    role: 'CFO, Northgate Logistics',
    initials: 'IO',
  },
  {
    quote:
      "Three plants, three different units of measure, one source of truth. I didn't think that was possible until we saw it running in our first week.",
    name: 'Sanna Lindqvist',
    role: 'VP Manufacturing, Fjord Materials',
    initials: 'SL',
  },
  {
    quote:
      "The board used to ask for our carbon number once a year. Now it's on the same screen as revenue, and nobody questions why that took so long.",
    name: 'Priya Chandrasekaran',
    role: 'Chief Operating Officer, Meridian Textiles',
    initials: 'PC',
  },
  {
    quote:
      "We used to hire two consultants every March just to sanity-check our Scope 3 numbers. This year we didn't need either of them.",
    name: 'Tomasz Wroblewski',
    role: 'Director of ESG, Carrick Steel',
    initials: 'TW',
  },
  {
    quote:
      "Our supply chain has 400 vendors. Getting even half of them to respond to a survey felt impossible. Now the data just flows in automatically.",
    name: 'Amara Diallo',
    role: 'Procurement Lead, Solari Foods Group',
    initials: 'AD',
  },
  {
    quote:
      "I can finally show our investors a trend line instead of a single number with an asterisk next to it explaining all the caveats.",
    name: 'Haruto Nakamura',
    role: 'Investor Relations, Kaien Materials',
    initials: 'HN',
  },
  {
    quote:
      "Every regulator wants the numbers in a different format. We build the report once now and export it five different ways in an afternoon.",
    name: 'Ingrid Solberg',
    role: 'Compliance Manager, Nordvik Energy',
    initials: 'IS',
  },
  {
    quote:
      "The rollout across four countries took less time than one of our old quarterly reporting cycles used to take for a single site.",
    name: 'Mateus Alves',
    role: 'Regional Operations Director, Cascata Beverages',
    initials: 'MA',
  },
  {
    quote:
      "Our sustainability team was two people drowning in spreadsheets. Now they spend their time actually reducing emissions instead of calculating them.",
    name: 'Fatima Al-Sayed',
    role: 'Chief Sustainability Officer, Levant Textiles',
    initials: 'FA',
  },
  {
    quote:
      "We caught a data entry error from one of our facilities within a day. Before, we wouldn't have found it until the annual report was already printed.",
    name: "Declan O'Brien",
    role: 'Data Manager, Ashford Manufacturing',
    initials: 'DO',
  },
  {
    quote:
      "Our customers started asking for our carbon footprint per shipment. We had an answer for them the same week, not the same year.",
    name: 'Lucia Fernandez',
    role: 'Head of Logistics, Andes Freight Co.',
    initials: 'LF',
  },
  {
    quote:
      "The switch from manual tracking to this platform paid for itself in the first reporting cycle, just in consultant fees we no longer needed.",
    name: 'Chen Wei',
    role: 'Finance Director, Jinshan Industrial',
    initials: 'CW',
  },
  {
    quote:
      "I've sat through a lot of vendor demos promising 'real-time' data. This is the first one where that word actually meant something.",
    name: 'Greta Almqvist',
    role: 'Head of Environmental Reporting, Baltic Pulp & Paper',
    initials: 'GA',
  },
]

const AUTOPLAY_MS = 6500

export default function Testimonial() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [])

  const current = TESTIMONIALS[index]

  const variants = {
    enter: { opacity: 0, x: 48 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -48 },
  }

  return (
    <section id="testimonial" className="py-24 px-6 bg-(--color-surface)">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl"
      >
        {/* Oversized quote mark as the signature element */}
        <span
          aria-hidden="true"
          className="font-display absolute -top-6 left-1/2 -translate-x-1/2 text-8xl leading-none text-(--color-leaf-soft) select-none"
        >
          "
        </span>

        <div className="relative min-h-[260px] sm:min-h-[220px] pt-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-display text-3xl sm:text-4xl leading-snug text-(--color-forest-deep)">
                {current.quote}
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="w-11 h-11 rounded-full bg-(--color-leaf-soft) grid place-items-center font-display text-(--color-forest-deep)">
                  {current.initials}
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-(--color-ink)">{current.name}</p>
                  <p className="text-xs text-(--color-ink-soft)">{current.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Passive progress indicator — shows time until the next slide, no interaction */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {TESTIMONIALS.map((t, i) => (
            <span key={t.name} className="relative h-1.5 w-8 overflow-hidden rounded-full bg-(--color-leaf-soft)">
              {i === index && (
                <motion.span
                  key={index}
                  className="absolute inset-y-0 left-0 rounded-full bg-(--color-forest-deep)"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                />
              )}
              {i < index && <span className="absolute inset-0 rounded-full bg-(--color-forest-deep)" />}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}








// import { motion } from 'framer-motion'
// export default function Testimonial() {
//   return (
//     <section id="testimonial" className="py-24 px-6 bg-(--color-surface)">
//       <motion.div
//         initial={{ opacity: 0, y: 24 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, margin: '-100px' }}
//         transition={{ duration: 0.6 }}
//         className="mx-auto max-w-3xl text-center"
//       >
//         <p className="font-display text-3xl sm:text-4xl leading-snug text-(--color-forest-deep)">
//           "We went from a spreadsheet updated twice a year to a live number the whole
//           operations team checks weekly. Our CSRD filing took two days instead of six weeks."
//         </p>
//         <div className="mt-8 flex items-center justify-center gap-3">
//           <span className="w-11 h-11 rounded-full bg-(--color-leaf-soft) grid place-items-center font-display text-(--color-forest-deep)">
//             RM
//           </span>
//           <div className="text-left">
//             <p className="text-sm font-medium text-(--color-ink)">Renata Marsh</p>
//             <p className="text-xs text-(--color-ink-soft)">Head of Sustainability, Basalt Foods</p>
//           </div>
//         </div>
//       </motion.div>
//     </section>
//   )
// }