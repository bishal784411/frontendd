'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, Plus, Download, ChevronDown, ChevronRight, BadgeCheck, Clock4 } from "lucide-react";
import { format, differenceInMinutes, parseISO, isWithinInterval, startOfMonth, endOfMonth, addDays, subMonths, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useTimeSheetStore } from '@/lib/timesheet-store';
import { TimeEntry } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Available projects for the dropdown
const projects = [
  'Website Redesign',
  'Mobile App Development',
  'Database Migration',
  'API Integration',
  'UI/UX Improvements',
  'Performance Optimization',
  'Security Updates',
  'Documentation',
  'Testing & QA',
  'Client Support'
];

export default function TimesheetPage() {
  const { user } = useAuth();
  const { addTimeEntry, getEntriesForUser } = useTimeSheetStore();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    description: '',
    projectName: '',
  });
  const [collapsedMonths, setCollapsedMonths] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'current' | 'previous' | 'custom'>('current');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  const toggleMonth = (month: string) => {
    setCollapsedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEntry.projectName) {
      toast.error('Please select a project');
      return;
    }

    const baseDate = new Date(newEntry.date);
    const [startHours, startMinutes] = newEntry.startTime.split(':');
    const [endHours, endMinutes] = newEntry.endTime.split(':');

    let startTime = new Date(baseDate);
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    let endTime = new Date(baseDate);
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endTime <= startTime) {
      toast.error('Time entries must be within the same day (00:00 - 23:59)');
      return;
    }

    if (!isSameDay(startTime, endTime)) {
      toast.error('Time entries must be within the same day (00:00 - 23:59)');
      return;
    }

    const duration = differenceInMinutes(endTime, startTime) / 60;

    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    if (duration > 24) {
      toast.error('Time entry cannot exceed 24 hours');
      return;
    }

    const entry: TimeEntry = {
      id: Date.now().toString(),
      userId: user?.id || '',
      employeeName: user?.name || '',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: newEntry.description,
      projectName: newEntry.projectName,
      duration,
      verified: false // New entries are always unverified
    };

    addTimeEntry(entry);
    setNewEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      description: '',
      projectName: '',
    });
    setShowManualEntry(false);
    toast.success('Time entry added successfully');
  };

  const exportToCSV = () => {
    const entries = getEntriesForUser(user?.id || '');
    const headers = ['Date', 'Project', 'Description', 'Start Time', 'End Time', 'Duration', 'Status'];
    const csvData = entries.map(entry => [
      format(new Date(entry.startTime), 'yyyy-MM-dd'),
      entry.projectName,
      entry.description,
      format(new Date(entry.startTime), 'HH:mm'),
      format(new Date(entry.endTime), 'HH:mm'),
      `${entry.duration.toFixed(2)}h`,
      entry.verified ? 'Verified' : 'Pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const timeEntries = getEntriesForUser(user?.id || '');

  const filterEntriesByDate = (entries: TimeEntry[]) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTime);

      switch (filterType) {
        case 'current':
          const currentMonth = startOfMonth(new Date());
          const currentMonthEnd = endOfMonth(new Date());
          return isWithinInterval(entryDate, { start: currentMonth, end: currentMonthEnd });

        case 'previous':
          const previousMonth = startOfMonth(subMonths(new Date(), 1));
          const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));
          return isWithinInterval(entryDate, { start: previousMonth, end: previousMonthEnd });

        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            const start = new Date(customDateRange.start);
            start.setHours(0, 0, 0, 0);

            const end = new Date(customDateRange.end);
            end.setHours(23, 59, 59, 999);

            return isWithinInterval(entryDate, { start, end });
          }
          return true;

        default:
          return true;
      }
    });
  };

  const filteredEntries = filterEntriesByDate(timeEntries);

  const groupedByMonth = filteredEntries.reduce((acc, entry) => {
    const month = format(new Date(entry.startTime), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = {};
    }

    const date = format(new Date(entry.startTime), 'yyyy-MM-dd');
    if (!acc[month][date]) {
      acc[month][date] = [];
    }

    acc[month][date].push(entry);
    acc[month][date].sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return acc;
  }, {} as Record<string, Record<string, TimeEntry[]>>);

  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timesheet</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'current' | 'previous' | 'custom')}
          >
            <option value="current">Current Month</option>
            <option value="previous">Previous Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {filterType === 'custom' && (
            <>
              <Input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <Input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </>
          )}
          <Button
            onClick={exportToCSV}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowManualEntry(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Time Entry
          </Button>
        </div>
      </div>

      {showManualEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Add Time Entry</CardTitle>
            <CardDescription>
              Enter your time entry details for {format(new Date(newEntry.date), 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualEntry} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  required
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    required
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    required
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Select
                  value={newEntry.projectName}
                  onValueChange={(value) => setNewEntry({ ...newEntry, projectName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  type="text"
                  placeholder="What did you work on?"
                  required
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Entry</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {sortedMonths.map((month) => {
          const isCollapsed = collapsedMonths.includes(month);
          const monthEntries = Object.values(groupedByMonth[month]).flat();
          const totalHours = monthEntries.reduce((total, entry) => total + entry.duration, 0);

          return (
            <Card key={month}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleMonth(month)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{month}</CardTitle>
                    <CardDescription>
                      Total hours: {totalHours.toFixed(1)}h
                    </CardDescription>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {!isCollapsed && (
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupedByMonth[month]).map(([date, entries]) => (
                      <div key={date} className="space-y-4">
                        <h3 className="font-medium">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
                        <div className="space-y-3">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="border rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{entry.projectName}</h4>
                                  {entry.verified ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <BadgeCheck className="h-3 w-3 mr-1" />
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <Clock4 className="h-3 w-3 mr-1" />
                                      Pending
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{entry.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {format(new Date(entry.startTime), 'HH:mm')}
                                  {' - '}
                                  {format(new Date(entry.endTime), 'HH:mm')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {entry.duration.toFixed(2)}h
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}