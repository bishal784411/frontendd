import { create } from 'zustand';
import { TimeEntry } from '@/lib/types';
import { persist } from 'zustand/middleware';
import { subDays, addHours, format } from 'date-fns';
import { useNotificationStore } from './notification-store';

// Generate dummy data for the last month
const generateDummyData = (): TimeEntry[] => {
  const dummyData: TimeEntry[] = [];
  const projects = ['Website Redesign', 'Mobile App', 'Database Migration', 'API Development'];
  const descriptions = [
    'Frontend development',
    'Backend integration',
    'Bug fixes',
    'Feature implementation',
    'Code review',
    'Testing and QA',
    'Documentation'
  ];

  // Generate entries for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Generate 1-3 entries per day
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < entriesPerDay; j++) {
      const startHour = 9 + j * 3; // Spread entries throughout the day
      const startTime = addHours(new Date(format(date, 'yyyy-MM-dd')), startHour).toISOString();
      const duration = 2 + Math.random() * 4; // 2-6 hours
      const endTime = addHours(new Date(startTime), duration).toISOString();

      dummyData.push({
        id: `dummy-${date.getTime()}-${j}`,
        userId: '1', // Admin user ID
        employeeName: 'John Admin',
        projectName: projects[Math.floor(Math.random() * projects.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        startTime,
        endTime,
        duration
      });

      // Add entries for employee user as well
      dummyData.push({
        id: `dummy-emp-${date.getTime()}-${j}`,
        userId: '2', // Employee user ID
        employeeName: 'Jane Employee',
        projectName: projects[Math.floor(Math.random() * projects.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        startTime,
        endTime,
        duration
      });
    }
  }

  return dummyData;
};

interface TimeSheetStore {
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: TimeEntry) => void;
  getEntriesForUser: (userId: string) => TimeEntry[];
  getAllEntries: () => TimeEntry[];
}

export const useTimeSheetStore = create<TimeSheetStore>()(
  persist(
    (set, get) => ({
      timeEntries: generateDummyData(),
      addTimeEntry: (entry) => 
        set((state) => ({
          timeEntries: [...state.timeEntries, entry]
        })),
      getEntriesForUser: (userId) => 
        get().timeEntries.filter(entry => entry.userId === userId),
      getAllEntries: () => get().timeEntries,
    }),
    {
      name: 'timesheet-storage',
    }
  )
);