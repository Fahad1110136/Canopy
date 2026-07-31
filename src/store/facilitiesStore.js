import { create } from 'zustand'
import {
  fetchFacilities,
  createFacility as apiCreateFacility,
  updateFacility as apiUpdateFacility,
  deleteFacility as apiDeleteFacility,
} from '../services/facilitiesApi.js'

/**
 * Shared facilities state. Before this store existed, both the dashboard's
 * FacilitiesManager (the CRUD list) and NewReportPage (the "which facility
 * is this report for" dropdown) each fetched their own independent copy of
 * the facilities list. That meant two network requests for the same data,
 * and adding a facility on the dashboard wouldn't show up in the report
 * form's dropdown until a full page reload. This store fixes both: one
 * fetch, shared everywhere, and every component reading it re-renders the
 * instant the list changes.
 */
export const useFacilitiesStore = create((set, get) => ({
  facilities: [],
  loading: false,
  loaded: false,
  error: null,

  load: async (force = false) => {
    if (get().loaded && !force) return
    set({ loading: true, error: null })
    try {
      const data = await fetchFacilities()
      set({ facilities: data, loading: false, loaded: true })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createFacility: async (payload) => {
    const created = await apiCreateFacility(payload)
    set((state) => ({ facilities: [...state.facilities, created] }))
    return created
  },

  updateFacility: async (id, payload) => {
    const updated = await apiUpdateFacility(id, payload)
    set((state) => ({
      facilities: state.facilities.map((f) => (f.id === id ? updated : f)),
    }))
    return updated
  },

  deleteFacility: async (id) => {
    await apiDeleteFacility(id)
    set((state) => ({ facilities: state.facilities.filter((f) => f.id !== id) }))
  },
}))