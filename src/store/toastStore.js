import { create } from 'zustand'

// A single global toast, triggerable from anywhere in the app without
// prop-drilling a toast/dismiss pair down through Layout -> Page -> Section.
let dismissTimer = null

export const useToastStore = create((set) => ({
  toast: null,

  showToast: (message, type = 'success', duration = 4500) => {
    if (dismissTimer) clearTimeout(dismissTimer)
    set({ toast: { message, type, id: Date.now() } })
    dismissTimer = setTimeout(() => set({ toast: null }), duration)
  },

  dismissToast: () => {
    if (dismissTimer) clearTimeout(dismissTimer)
    set({ toast: null })
  },
}))