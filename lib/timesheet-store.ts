import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeEntry } from '@/lib/types';
import { format } from 'date-fns';

interface TimeSheetStore {
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: TimeEntry) => void;
  getEntriesForUser: (userId: string) => TimeEntry[];
  getAllEntries: () => TimeEntry[];
  verifyEntries: (entryIds: string[]) => void;
  unverifyEntries: (entryIds: string[]) => void;
}

export const useTimeSheetStore = create<TimeSheetStore>()(
  persist(
    (set, get) => ({
      timeEntries: [],

      addTimeEntry: (entry) => {
        // New entries are always unverified initially
        const newEntry = { ...entry, verified: false };
        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry]
        }));
      },

      getEntriesForUser: (userId) =>
        get().timeEntries.filter(entry => entry.userId === userId),

      getAllEntries: () => get().timeEntries,

      verifyEntries: (entryIds) =>
        set((state) => ({
          timeEntries: state.timeEntries.map(entry =>
            entryIds.includes(entry.id) ? { ...entry, verified: true } : entry
          )
        })),

      unverifyEntries: (entryIds) =>
        set((state) => ({
          timeEntries: state.timeEntries.map(entry =>
            entryIds.includes(entry.id) ? { ...entry, verified: false } : entry
          )
        })),
    }),
    {
      name: 'timesheet-storage',
    }
  )
);